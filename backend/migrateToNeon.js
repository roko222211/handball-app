const { Pool } = require('pg');
require('dotenv').config();

// Lokalna Docker baza - SOURCE
const localPool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'handball_predictions',
  password: 'postgres',
  port: 5432,
});

// Neon baza - DESTINATION
const neonPool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_UCXp3P1rtfAa@ep-summer-fog-ag2ku16b-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require',
  ssl: { rejectUnauthorized: false }
});

async function createTables() {
  console.log('📋 Kreiranje tablica u Neon-u...');
  
  // Users table
  await neonPool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(50) UNIQUE NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      is_admin BOOLEAN DEFAULT FALSE,
      total_points INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Matches table
  await neonPool.query(`
    CREATE TABLE IF NOT EXISTS matches (
      id SERIAL PRIMARY KEY,
      home_team VARCHAR(100) NOT NULL,
      away_team VARCHAR(100) NOT NULL,
      match_date TIMESTAMP NOT NULL,
      stage VARCHAR(50) NOT NULL,
      group_name VARCHAR(10),
      actual_home_score INTEGER,
      actual_away_score INTEGER,
      is_finished BOOLEAN DEFAULT FALSE,
      top_goalscorer VARCHAR(100),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Predictions table
  await neonPool.query(`
    CREATE TABLE IF NOT EXISTS predictions (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      match_id INTEGER REFERENCES matches(id) ON DELETE CASCADE,
      predicted_home_score INTEGER NOT NULL,
      predicted_away_score INTEGER NOT NULL,
      predicted_top_goalscorer VARCHAR(100),
      points_earned INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, match_id)
    )
  `);

  console.log('✅ Tablice kreirane\n');
}

async function migrateData() {
  try {
    console.log('🚀 Započinjem migraciju podataka na Neon...\n');

    // 1. Provjeri konekcije
    console.log('🔌 Testiram konekcije...');
    await localPool.query('SELECT NOW()');
    console.log('✅ Lokalna Docker baza povezana');
    await neonPool.query('SELECT NOW()');
    console.log('✅ Neon baza povezana\n');

    // 2. Kreiraj tablice
    await createTables();

    // 3. Migriraj korisnike
    console.log('👥 Migracija korisnika...');
    const users = await localPool.query('SELECT * FROM users ORDER BY id');
    
    let migratedUsers = 0;
    let skippedUsers = 0;
    
    for (const user of users.rows) {
      // Skip korisnika bez passworda
      if (!user.password) {
        console.log(`   ⚠️  Preskačem korisnika ${user.username} (nema password)`);
        skippedUsers++;
        continue;
      }
      
      await neonPool.query(
        `INSERT INTO users (id, username, email, password, is_admin, total_points, created_at) 
         VALUES ($1, $2, $3, $4, $5, $6, $7) 
         ON CONFLICT (id) DO UPDATE SET
         username = EXCLUDED.username,
         email = EXCLUDED.email,
         password = EXCLUDED.password,
         is_admin = EXCLUDED.is_admin,
         total_points = EXCLUDED.total_points`,
        [user.id, user.username, user.email, user.password, user.is_admin, user.total_points, user.created_at]
      );
      migratedUsers++;
    }
    console.log(`✅ ${migratedUsers} korisnika migrirano (${skippedUsers} preskočeno)\n`);

    // 4. Migriraj utakmice
    console.log('⚽ Migracija utakmica...');
    const matches = await localPool.query('SELECT * FROM matches ORDER BY id');
    
    for (const match of matches.rows) {
      await neonPool.query(
        `INSERT INTO matches (id, home_team, away_team, match_date, stage, group_name, actual_home_score, actual_away_score, is_finished, top_goalscorer, created_at) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
         ON CONFLICT (id) DO UPDATE SET
         home_team = EXCLUDED.home_team,
         away_team = EXCLUDED.away_team,
         match_date = EXCLUDED.match_date,
         stage = EXCLUDED.stage,
         group_name = EXCLUDED.group_name,
         actual_home_score = EXCLUDED.actual_home_score,
         actual_away_score = EXCLUDED.actual_away_score,
         is_finished = EXCLUDED.is_finished,
         top_goalscorer = EXCLUDED.top_goalscorer`,
        [match.id, match.home_team, match.away_team, match.match_date, match.stage, match.group_name, 
         match.actual_home_score, match.actual_away_score, match.is_finished, match.top_goalscorer, match.created_at]
      );
    }
    console.log(`✅ ${matches.rows.length} utakmica migrirano\n`);

    // 5. Migriraj predviđanja
    console.log('🎯 Migracija predviđanja...');
    const predictions = await localPool.query('SELECT * FROM predictions ORDER BY id');
    
    let migratedPredictions = 0;
    let skippedPredictions = 0;
    
    for (const pred of predictions.rows) {
      try {
        await neonPool.query(
          `INSERT INTO predictions (id, user_id, match_id, predicted_home_score, predicted_away_score, predicted_top_goalscorer, points_earned, created_at) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
           ON CONFLICT (user_id, match_id) DO UPDATE SET
           predicted_home_score = EXCLUDED.predicted_home_score,
           predicted_away_score = EXCLUDED.predicted_away_score,
           predicted_top_goalscorer = EXCLUDED.predicted_top_goalscorer,
           points_earned = EXCLUDED.points_earned`,
          [pred.id, pred.user_id, pred.match_id, pred.predicted_home_score, pred.predicted_away_score, 
           pred.predicted_top_goalscorer, pred.points_earned, pred.created_at]
        );
        migratedPredictions++;
      } catch (err) {
        // Preskači predviđanja za korisnike koji nisu migrirani
        console.log(`   ⚠️  Preskačem predviđanje za user_id=${pred.user_id} (korisnik nije migriran)`);
        skippedPredictions++;
      }
    }
    console.log(`✅ ${migratedPredictions} predviđanja migrirano (${skippedPredictions} preskočeno)\n`);

    // 6. Ažuriraj sequence-e
    console.log('🔄 Ažuriranje sequence-a...');
    
    const maxUserId = await neonPool.query('SELECT MAX(id) FROM users');
    if (maxUserId.rows[0].max) {
      await neonPool.query(`SELECT setval('users_id_seq', ${maxUserId.rows[0].max})`);
    }
    
    const maxMatchId = await neonPool.query('SELECT MAX(id) FROM matches');
    if (maxMatchId.rows[0].max) {
      await neonPool.query(`SELECT setval('matches_id_seq', ${maxMatchId.rows[0].max})`);
    }
    
    const maxPredId = await neonPool.query('SELECT MAX(id) FROM predictions');
    if (maxPredId.rows[0].max) {
      await neonPool.query(`SELECT setval('predictions_id_seq', ${maxPredId.rows[0].max})`);
    }
    
    console.log('✅ Sequence-i ažurirani\n');

    // 7. Provjeri rezultate
    console.log('📊 Provjera migracije...');
    const neonUsers = await neonPool.query('SELECT COUNT(*) FROM users');
    const neonMatches = await neonPool.query('SELECT COUNT(*) FROM matches');
    const neonPredictions = await neonPool.query('SELECT COUNT(*) FROM predictions');
    
    console.log(`   Korisnika: ${neonUsers.rows[0].count}`);
    console.log(`   Utakmica: ${neonMatches.rows[0].count}`);
    console.log(`   Predviđanja: ${neonPredictions.rows[0].count}\n`);

    console.log('🎉 MIGRACIJA USPJEŠNO ZAVRŠENA!');
  } catch (error) {
    console.error('❌ Greška pri migraciji:', error);
    console.error(error.stack);
  } finally {
    await localPool.end();
    await neonPool.end();
    console.log('\n✅ Konekcije zatvorene');
  }
}

migrateData();
