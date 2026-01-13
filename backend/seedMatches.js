const pool = require('./db');

const matches = [
  // ========================================
  // PRELIMINARNE RUNDE (15-21. siječnja)
  // ========================================
  
  // SKUPINA A - Herning, Danska
  { home: 'Španjolska', away: 'Srbija', date: '2026-01-15 18:00:00', stage: 'Preliminarna runda', group: 'A' },
  { home: 'Njemačka', away: 'Austrija', date: '2026-01-15 20:30:00', stage: 'Preliminarna runda', group: 'A' },
  { home: 'Austrija', away: 'Španjolska', date: '2026-01-17 18:00:00', stage: 'Preliminarna runda', group: 'A' },
  { home: 'Srbija', away: 'Njemačka', date: '2026-01-17 20:30:00', stage: 'Preliminarna runda', group: 'A' },
  { home: 'Austrija', away: 'Srbija', date: '2026-01-19 18:00:00', stage: 'Preliminarna runda', group: 'A' },
  { home: 'Njemačka', away: 'Španjolska', date: '2026-01-19 20:30:00', stage: 'Preliminarna runda', group: 'A' },
  
  // SKUPINA B - Herning, Danska
  { home: 'Portugal', away: 'Rumunjska', date: '2026-01-16 18:00:00', stage: 'Preliminarna runda', group: 'B' },
  { home: 'Danska', away: 'Sjeverna Makedonija', date: '2026-01-16 20:30:00', stage: 'Preliminarna runda', group: 'B' },
  { home: 'Sjeverna Makedonija', away: 'Portugal', date: '2026-01-18 18:00:00', stage: 'Preliminarna runda', group: 'B' },
  { home: 'Danska', away: 'Rumunjska', date: '2026-01-18 20:30:00', stage: 'Preliminarna runda', group: 'B' },
  { home: 'Sjeverna Makedonija', away: 'Rumunjska', date: '2026-01-20 18:00:00', stage: 'Preliminarna runda', group: 'B' },
  { home: 'Danska', away: 'Portugal', date: '2026-01-20 20:30:00', stage: 'Preliminarna runda', group: 'B' },
  
  // SKUPINA C - Oslo, Norveška
  { home: 'Francuska', away: 'Češka', date: '2026-01-15 18:00:00', stage: 'Preliminarna runda', group: 'C' },
  { home: 'Norveška', away: 'Ukrajina', date: '2026-01-15 20:30:00', stage: 'Preliminarna runda', group: 'C' },
  { home: 'Češka', away: 'Norveška', date: '2026-01-17 18:00:00', stage: 'Preliminarna runda', group: 'C' },
  { home: 'Ukrajina', away: 'Francuska', date: '2026-01-17 20:30:00', stage: 'Preliminarna runda', group: 'C' },
  { home: 'Češka', away: 'Ukrajina', date: '2026-01-19 18:00:00', stage: 'Preliminarna runda', group: 'C' },
  { home: 'Norveška', away: 'Francuska', date: '2026-01-19 20:30:00', stage: 'Preliminarna runda', group: 'C' },
  
  // SKUPINA D - Oslo, Norveška
  { home: 'Island', away: 'Mađarska', date: '2026-01-16 18:00:00', stage: 'Preliminarna runda', group: 'D' },
  { home: 'Nizozemska', away: 'Slovenija', date: '2026-01-16 20:30:00', stage: 'Preliminarna runda', group: 'D' },
  { home: 'Slovenija', away: 'Island', date: '2026-01-18 18:00:00', stage: 'Preliminarna runda', group: 'D' },
  { home: 'Nizozemska', away: 'Mađarska', date: '2026-01-18 20:30:00', stage: 'Preliminarna runda', group: 'D' },
  { home: 'Slovenija', away: 'Mađarska', date: '2026-01-20 18:00:00', stage: 'Preliminarna runda', group: 'D' },
  { home: 'Nizozemska', away: 'Island', date: '2026-01-20 20:30:00', stage: 'Preliminarna runda', group: 'D' },
  
  // SKUPINA E - Malmö, Švedska
  { home: 'Hrvatska', away: 'Poljska', date: '2026-01-17 18:00:00', stage: 'Preliminarna runda', group: 'E' },
  { home: 'Švedska', away: 'Gruzija', date: '2026-01-17 20:30:00', stage: 'Preliminarna runda', group: 'E' },
  { home: 'Poljska', away: 'Švedska', date: '2026-01-19 18:00:00', stage: 'Preliminarna runda', group: 'E' },
  { home: 'Hrvatska', away: 'Gruzija', date: '2026-01-19 20:30:00', stage: 'Preliminarna runda', group: 'E' },
  { home: 'Gruzija', away: 'Poljska', date: '2026-01-21 18:00:00', stage: 'Preliminarna runda', group: 'E' },
  { home: 'Švedska', away: 'Hrvatska', date: '2026-01-21 20:30:00', stage: 'Preliminarna runda', group: 'E' },
  
  // SKUPINA F - Malmö, Švedska
  { home: 'Švicarska', away: 'Crna Gora', date: '2026-01-16 18:00:00', stage: 'Preliminarna runda', group: 'F' },
  { home: 'Egipat', away: 'Portugal', date: '2026-01-16 20:30:00', stage: 'Preliminarna runda', group: 'F' },
  { home: 'Portugal', away: 'Švicarska', date: '2026-01-18 18:00:00', stage: 'Preliminarna runda', group: 'F' },
  { home: 'Egipat', away: 'Crna Gora', date: '2026-01-18 20:30:00', stage: 'Preliminarna runda', group: 'F' },
  { home: 'Portugal', away: 'Crna Gora', date: '2026-01-20 18:00:00', stage: 'Preliminarna runda', group: 'F' },
  { home: 'Egipat', away: 'Švicarska', date: '2026-01-20 20:30:00', stage: 'Preliminarna runda', group: 'F' },
  
  // ========================================
  // GLAVNI KRUG - Group I (22-28. siječnja)
  // ========================================
  { home: 'TBD (C1)', away: 'TBD (B2)', date: '2026-01-22 18:00:00', stage: 'Glavni krug', group: 'I' },
  { home: 'TBD (A2)', away: 'TBD (C2)', date: '2026-01-22 18:00:00', stage: 'Glavni krug', group: 'I' },
  { home: 'TBD (A1)', away: 'TBD (B1)', date: '2026-01-22 20:30:00', stage: 'Glavni krug', group: 'I' },
  
  { home: 'TBD (C1)', away: 'TBD (B1)', date: '2026-01-24 18:00:00', stage: 'Glavni krug', group: 'I' },
  { home: 'TBD (A1)', away: 'TBD (C2)', date: '2026-01-24 18:00:00', stage: 'Glavni krug', group: 'I' },
  { home: 'TBD (A2)', away: 'TBD (B2)', date: '2026-01-24 20:30:00', stage: 'Glavni krug', group: 'I' },
  
  { home: 'TBD (A1)', away: 'TBD (B2)', date: '2026-01-26 18:00:00', stage: 'Glavni krug', group: 'I' },
  { home: 'TBD (A2)', away: 'TBD (C1)', date: '2026-01-26 18:00:00', stage: 'Glavni krug', group: 'I' },
  { home: 'TBD (B1)', away: 'TBD (C2)', date: '2026-01-26 20:30:00', stage: 'Glavni krug', group: 'I' },
  
  { home: 'TBD (A1)', away: 'TBD (C1)', date: '2026-01-28 18:00:00', stage: 'Glavni krug', group: 'I' },
  { home: 'TBD (A2)', away: 'TBD (B1)', date: '2026-01-28 18:00:00', stage: 'Glavni krug', group: 'I' },
  { home: 'TBD (B2)', away: 'TBD (C2)', date: '2026-01-28 20:30:00', stage: 'Glavni krug', group: 'I' },
  
  // ========================================
  // GLAVNI KRUG - Group II (23-28. siječnja)
  // ========================================
  { home: 'TBD (F1)', away: 'TBD (E2)', date: '2026-01-23 18:00:00', stage: 'Glavni krug', group: 'II' },
  { home: 'TBD (D2)', away: 'TBD (F2)', date: '2026-01-23 18:00:00', stage: 'Glavni krug', group: 'II' },
  { home: 'TBD (D1)', away: 'TBD (E1)', date: '2026-01-23 20:30:00', stage: 'Glavni krug', group: 'II' },
  
  { home: 'TBD (F1)', away: 'TBD (E1)', date: '2026-01-25 18:00:00', stage: 'Glavni krug', group: 'II' },
  { home: 'TBD (D1)', away: 'TBD (F2)', date: '2026-01-25 18:00:00', stage: 'Glavni krug', group: 'II' },
  { home: 'TBD (D2)', away: 'TBD (E2)', date: '2026-01-25 20:30:00', stage: 'Glavni krug', group: 'II' },
  
  { home: 'TBD (D1)', away: 'TBD (E2)', date: '2026-01-27 18:00:00', stage: 'Glavni krug', group: 'II' },
  { home: 'TBD (D2)', away: 'TBD (F1)', date: '2026-01-27 18:00:00', stage: 'Glavni krug', group: 'II' },
  { home: 'TBD (E1)', away: 'TBD (F2)', date: '2026-01-27 20:30:00', stage: 'Glavni krug', group: 'II' },
  
  { home: 'TBD (D1)', away: 'TBD (F1)', date: '2026-01-28 18:00:00', stage: 'Glavni krug', group: 'II' },
  { home: 'TBD (D2)', away: 'TBD (E1)', date: '2026-01-28 18:00:00', stage: 'Glavni krug', group: 'II' },
  { home: 'TBD (E2)', away: 'TBD (F2)', date: '2026-01-28 20:30:00', stage: 'Glavni krug', group: 'II' },
  
  // ========================================
  // KNOCKOUT FAZA (30. siječnja - 1. veljače)
  // ========================================
  { home: 'TBD (Pobjednik Grupe I)', away: 'TBD (2. mjesto Grupe II)', date: '2026-01-30 17:45:00', stage: 'Polufinale', group: null },
  { home: 'TBD (Pobjednik Grupe II)', away: 'TBD (2. mjesto Grupe I)', date: '2026-01-30 20:30:00', stage: 'Polufinale', group: null },
  { home: 'TBD (3. mjesto Grupe I)', away: 'TBD (3. mjesto Grupe II)', date: '2026-01-30 15:00:00', stage: 'Utakmica za 5. mjesto', group: null },
  { home: 'TBD (Gubitnik polufinala 1)', away: 'TBD (Gubitnik polufinala 2)', date: '2026-02-01 15:15:00', stage: 'Utakmica za 3. mjesto', group: null },
  { home: 'TBD (Pobjednik polufinala 1)', away: 'TBD (Pobjednik polufinala 2)', date: '2026-02-01 18:00:00', stage: 'Finale', group: null },
];

async function seedMatches() {
  try {
    // Prvo obriši stare utakmice
    await pool.query('DELETE FROM matches');
    console.log('🗑️  Stare utakmice obrisane');
    
    for (const match of matches) {
      await pool.query(
        `INSERT INTO matches (home_team, away_team, match_date, stage, group_name) 
         VALUES ($1, $2, $3, $4, $5)`,
        [match.home, match.away, match.date, match.stage, match.group]
      );
    }
    console.log(`✅ Uspješno dodano ${matches.length} utakmica!`);
    console.log(`   📊 Preliminarne runde: ${matches.filter(m => m.stage === 'Preliminarna runda').length}`);
    console.log(`   📊 Glavni krug: ${matches.filter(m => m.stage === 'Glavni krug').length}`);
    console.log(`   📊 Knockout faza: ${matches.filter(m => m.stage !== 'Preliminarna runda' && m.stage !== 'Glavni krug').length}`);
    process.exit(0);
  } catch (err) {
    console.error('Greška pri dodavanju utakmica:', err);
    process.exit(1);
  }
}

seedMatches();
