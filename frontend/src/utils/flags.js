// Mapa država -> emoji zastave
export const countryFlags = {
  // Grupa A
  'Španjolska': '🇪🇸',
  'Srbija': '🇷🇸',
  'Njemačka': '🇩🇪',
  'Austrija': '🇦🇹',
  
  // Grupa B
  'Portugal': '🇵🇹',
  'Rumunjska': '🇷🇴',
  'Danska': '🇩🇰',
  'Sjeverna Makedonija': '🇲🇰',
  
  // Grupa C
  'Francuska': '🇫🇷',
  'Češka': '🇨🇿',
  'Norveška': '🇳🇴',
  'Ukrajina': '🇺🇦',
  
  // Grupa D
  'Island': '🇮🇸',
  'Mađarska': '🇭🇺',
  'Nizozemska': '🇳🇱',
  'Slovenija': '🇸🇮',
  
  // Grupa E
  'Hrvatska': '🇭🇷',
  'Poljska': '🇵🇱',
  'Švedska': '🇸🇪',
  'Gruzija': '🇬🇪',
  
  // Grupa F
  'Švicarska': '🇨🇭',
  'Crna Gora': '🇲🇪',
  'Egipat': '🇪🇬',
};

// Helper funkcija da dohvati zastavu
export const getFlag = (countryName) => {
  return countryFlags[countryName] || '🏴';
};

// Formatira naziv sa zastavom
export const formatTeamWithFlag = (teamName) => {
  if (!teamName || teamName.includes('TBD')) {
    return `❓ ${teamName}`;
  }
  const flag = getFlag(teamName);
  return `${flag} ${teamName}`;
};
