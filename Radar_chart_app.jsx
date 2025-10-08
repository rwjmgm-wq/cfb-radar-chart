import React, { useState, useEffect } from 'react';
import { Upload, Download, X, ChevronDown } from 'lucide-react';

// NCAA Team Colors Database
const TEAM_COLORS = {
  'AKRON': ['#041E42', '#A89968'],
  'ALABAMA': ['#9E1B32', '#FFFFFF'],
  'APPALACHIAN STATE': ['#000000', '#FFC72C'],
  'ARIZONA': ['#CC0033', '#003366'],
  'ARIZONA STATE': ['#8C1D40', '#FFC627'],
  'ARKANSAS': ['#9D2235', '#FFFFFF'],
  'ARKANSAS STATE': ['#CC092F', '#000000'],
  'AUBURN': ['#0C2340', '#E87722'],
  'BALL STATE': ['#BA0C2F', '#FFFFFF'],
  'BAYLOR': ['#003015', '#FFB81C'],
  'BOISE STATE': ['#0033A0', '#FF6C39'],
  'BOSTON COLLEGE': ['#8A1F11', '#C4A93E'],
  'BOWLING GREEN': ['#FE5C00', '#4F2D19'],
  'BUFFALO': ['#005BBB', '#FFFFFF'],
  'BYU': ['#002E5D', '#FFFFFF'],
  'CAL': ['#003262', '#FDB515'],
  'CENTRAL MICHIGAN': ['#6A0032', '#FFC82E'],
  'CHARLOTTE': ['#005035', '#B9975B'],
  'CINCINNATI': ['#E00122', '#000000'],
  'CLEMSON': ['#F66733', '#522D80'],
  'COASTAL CAROLINA': ['#006F71', '#A27752'],
  'COLORADO': ['#CFB87C', '#000000'],
  'COLORADO STATE': ['#1E4D2B', '#C8C372'],
  'CONNECTICUT': ['#000E2F', '#FFFFFF'],
  'UCONN': ['#000E2F', '#FFFFFF'],
  'DELAWARE': ['#00539F', '#FFD200'],
  'DELAWARE STATE': ['#E03A3E', '#4A90E2'],
  'DUKE': ['#003087', '#FFFFFF'],
  'EAST CAROLINA': ['#592A8A', '#FFC82D'],
  'EASTERN MICHIGAN': ['#006633', '#FFFFFF'],
  'FAU': ['#003366', '#CC0000'],
  'FIU': ['#081E3F', '#B6862C'],
  'FLORIDA': ['#0021A5', '#FA4616'],
  'FLORIDA STATE': ['#782F40', '#CEB888'],
  'FRESNO STATE': ['#DB0032', '#003A70'],
  'GEORGIA': ['#BA0C2F', '#000000'],
  'GEORGIA SOUTHERN': ['#071D49', '#FFFFFF'],
  'GEORGIA STATE': ['#0039A6', '#CC0000'],
  'GEORGIA TECH': ['#B3A369', '#003057'],
  'HAWAII': ['#024731', '#FFFFFF'],
  'HOUSTON': ['#C8102E', '#FFFFFF'],
  'ILLINOIS': ['#E84A27', '#13294B'],
  'INDIANA': ['#990000', '#FFFFFF'],
  'IOWA': ['#FFCD00', '#000000'],
  'IOWA STATE': ['#C8102E', '#F1BE48'],
  'JACKSONVILLE STATE': ['#CC0000', '#FFFFFF'],
  'JAMES MADISON': ['#450084', '#C2A14D'],
  'KANSAS': ['#0051BA', '#E8000D'],
  'KANSAS STATE': ['#512888', '#FFFFFF'],
  'KENT STATE': ['#002664', '#EAAA00'],
  'KENNESAW STATE': ['#FDB927', '#000000'],
  'KENTUCKY': ['#0033A0', '#FFFFFF'],
  'LIBERTY': ['#002147', '#C41E3A'],
  'LOUISIANA': ['#CE181E', '#FFFFFF'],
  'LOUISIANA TECH': ['#002F8B', '#E2231A'],
  'LOUISVILLE': ['#AD0000', '#000000'],
  'LSU': ['#461D7C', '#FDD023'],
  'MARSHALL': ['#00B140', '#FFFFFF'],
  'MARYLAND': ['#E03A3E', '#FFD200'],
  'MEMPHIS': ['#003087', '#8D9093'],
  'MIAMI': ['#F47321', '#005030'],
  'MIAMI OH': ['#C41E3A', '#000000'],
  'MIAMI (OH)': ['#C41E3A', '#000000'],
  'MICHIGAN': ['#00274C', '#FFCB05'],
  'MICHIGAN STATE': ['#18453B', '#FFFFFF'],
  'MIDDLE TENNESSEE STATE': ['#0066CC', '#000000'],
  'MINNESOTA': ['#7A0019', '#FFCC33'],
  'MISSISSIPPI STATE': ['#5D1725', '#FFFFFF'],
  'MISSOURI': ['#F1B82D', '#000000'],
  'MISSOURI STATE': ['#5E0000', '#FFFFFF'],
  'NAVY': ['#00205B', '#CFB577'],
  'NEBRASKA': ['#E41837', '#FFFFFF'],
  'NEVADA': ['#003366', '#FFFFFF'],
  'NEW MEXICO': ['#BA0C2F', '#FFFFFF'],
  'NEW MEXICO STATE': ['#750000', '#FFFFFF'],
  'NORTHERN ILLINOIS': ['#BA0C2F', '#000000'],
  'NORTH CAROLINA': ['#13294B', '#7BAFD4'],
  'NC STATE': ['#CC0000', '#FFFFFF'],
  'NORTH TEXAS': ['#00853E', '#FFFFFF'],
  'NORTHWESTERN': ['#4E2A84', '#FFFFFF'],
  'NOTRE DAME': ['#0C2340', '#C99700'],
  'OHIO': ['#00694E', '#FFFFFF'],
  'OHIO STATE': ['#BB0000', '#666666'],
  'OKLAHOMA': ['#841617', '#FDF9D8'],
  'OKLAHOMA STATE': ['#FF6600', '#000000'],
  'OLD DOMINION': ['#003057', '#92C1E9'],
  'OLE MISS': ['#CE1126', '#14213D'],
  'OREGON': ['#154733', '#FEE123'],
  'OREGON STATE': ['#DC4405', '#000000'],
  'PENN STATE': ['#041E42', '#FFFFFF'],
  'PITTSBURGH': ['#003594', '#FFB81C'],
  'PURDUE': ['#CEB888', '#000000'],
  'RICE': ['#00205B', '#C1C6C8'],
  'RUTGERS': ['#CC0033', '#FFFFFF'],
  'SAM HOUSTON': ['#F76900', '#FFFFFF'],
  'SAN DIEGO STATE': ['#A6192E', '#000000'],
  'SAN JOSE STATE': ['#0055A2', '#E5A823'],
  'SMU': ['#0033A0', '#CC0000'],
  'SOUTH ALABAMA': ['#004B8D', '#DD1E2F'],
  'SOUTH CAROLINA': ['#73000A', '#FFFFFF'],
  'SOUTH FLORIDA': ['#006747', '#CFC493'],
  'SOUTHERN MISS': ['#FFAA3C', '#000000'],
  'STANFORD': ['#8C1515', '#FFFFFF'],
  'SYRACUSE': ['#F76900', '#000E54'],
  'TCU': ['#4D1979', '#FFFFFF'],
  'TEMPLE': ['#9B1D20', '#FFFFFF'],
  'TENNESSEE': ['#FF8200', '#FFFFFF'],
  'TEXAS': ['#BF5700', '#FFFFFF'],
  'TEXAS A&M': ['#500000', '#FFFFFF'],
  'TEXAS STATE': ['#501214', '#B39B6A'],
  'TEXAS TECH': ['#CC0000', '#000000'],
  'TOLEDO': ['#003E7E', '#FFCC00'],
  'TROY': ['#870838', '#FFFFFF'],
  'TULANE': ['#006747', '#7BAFD4'],
  'TULSA': ['#002D72', '#FFBE0F'],
  'UAB': ['#1E6B52', '#FFBF3F'],
  'UCF': ['#BA9B37', '#000000'],
  'UCLA': ['#2D68C4', '#FFD100'],
  'UMASS': ['#881C1C', '#FFFFFF'],
  'UNLV': ['#B10202', '#666666'],
  'USC': ['#990000', '#FFC72C'],
  'UTAH': ['#CC0000', '#FFFFFF'],
  'UTAH STATE': ['#0F2439', '#FFFFFF'],
  'UTEP': ['#FF6600', '#003366'],
  'UTSA': ['#F15A22', '#0C2340'],
  'VANDERBILT': ['#866D4B', '#000000'],
  'VIRGINIA': ['#F84C1E', '#232D4B'],
  'VIRGINIA TECH': ['#630031', '#CF4420'],
  'WAKE FOREST': ['#9E7E38', '#000000'],
  'WASHINGTON': ['#4B2E83', '#B7A57A'],
  'WASHINGTON STATE': ['#981E32', '#5E6A71'],
  'WESTERN KENTUCKY': ['#C60C30', '#FFFFFF'],
  'WESTERN MICHIGAN': ['#7A4229', '#FFCB05'],
  'WEST VIRGINIA': ['#002855', '#EAAA00'],
  'WISCONSIN': ['#C5050C', '#FFFFFF'],
  'WYOMING': ['#492F24', '#FFC425'],
};

const normalizeTeamName = (teamName) => {
  if (!teamName) return teamName;
  const normalized = teamName.toUpperCase().trim();
  const nameMap = {
    'MICH STATE': 'MICHIGAN STATE',
    'MICH ST': 'MICHIGAN STATE',
    'MIAMI FL': 'MIAMI',
    'MIAMI (FL)': 'MIAMI',
    'MIAMI FLORIDA': 'MIAMI',
    'MIAMI OH': 'MIAMI OH',
    'MIAMI (OH)': 'MIAMI OH',
    'MIAMI OHIO': 'MIAMI OH',
    'PENN ST': 'PENN STATE',
    'N CAROLINA': 'NORTH CAROLINA',
    'UNC': 'NORTH CAROLINA',
    'OHIO ST': 'OHIO STATE',
    'OKLA STATE': 'OKLAHOMA STATE',
    'OKLAHOMA ST': 'OKLAHOMA STATE',
    'OKLA ST': 'OKLAHOMA STATE',
    'OREGON ST': 'OREGON STATE',
    'WASH STATE': 'WASHINGTON STATE',
    'WASHINGTON ST': 'WASHINGTON STATE',
    'WASH ST': 'WASHINGTON STATE',
    'ARIZ STATE': 'ARIZONA STATE',
    'ARIZONA ST': 'ARIZONA STATE',
    'ARIZ ST': 'ARIZONA STATE',
    'IOWA ST': 'IOWA STATE',
    'KANSAS ST': 'KANSAS STATE',
    'KAN STATE': 'KANSAS STATE',
    'KAN ST': 'KANSAS STATE',
    'LOUISIANA ST': 'LSU',
    'LA TECH': 'LOUISIANA TECH',
    'MISS STATE': 'MISSISSIPPI STATE',
    'MISSISSIPPI ST': 'MISSISSIPPI STATE',
    'MISS ST': 'MISSISSIPPI STATE',
    'MIDDLE TN': 'MIDDLE TENNESSEE STATE',
    'MIDDLE TENN': 'MIDDLE TENNESSEE STATE',
    'MIDDLE TENNESSEE': 'MIDDLE TENNESSEE STATE',
    'MTSU': 'MIDDLE TENNESSEE STATE',
    'MO STATE': 'MISSOURI STATE',
    'MISSOURI ST': 'MISSOURI STATE',
    'NEW MEX STATE': 'NEW MEXICO STATE',
    'NEW MEXICO ST': 'NEW MEXICO STATE',
    'NEW MEX ST': 'NEW MEXICO STATE',
    'N MEX STATE': 'NEW MEXICO STATE',
    'N MEXICO ST': 'NEW MEXICO STATE',
    'UTAH ST': 'UTAH STATE',
    'COLO STATE': 'COLORADO STATE',
    'COLORADO ST': 'COLORADO STATE',
    'COLO ST': 'COLORADO STATE',
    'FRESNO ST': 'FRESNO STATE',
    'DELEWARE ST': 'DELAWARE STATE',
    'DELWARE STATE': 'DELAWARE STATE',
    'DELWARE ST': 'DELAWARE STATE',
    'DELAWARE ST': 'DELAWARE STATE',
    'DEL STATE': 'DELAWARE STATE',
    'DEL ST': 'DELAWARE STATE',
    'S DIEGO STATE': 'SAN DIEGO STATE',
    'S DIEGO ST': 'SAN DIEGO STATE',
    'SAN DIEGO ST': 'SAN DIEGO STATE',
    'SDSU': 'SAN DIEGO STATE',
    'S JOSE STATE': 'SAN JOSE STATE',
    'S JOSE ST': 'SAN JOSE STATE',
    'SAN JOSE ST': 'SAN JOSE STATE',
    'SJSU': 'SAN JOSE STATE',
    'FLORIDA ST': 'FLORIDA STATE',
    'FLA STATE': 'FLORIDA STATE',
    'FLA ST': 'FLORIDA STATE',
    'GEORGIA ST': 'GEORGIA STATE',
    'GA STATE': 'GEORGIA STATE',
    'GA ST': 'GEORGIA STATE',
    'BALL ST': 'BALL STATE',
    'BOISE ST': 'BOISE STATE',
    'BOWLING GREEN ST': 'BOWLING GREEN',
    'KENT ST': 'KENT STATE',
    'TEXAS A&M': 'TEXAS A&M',
    'TEXAS AM': 'TEXAS A&M',
    'TEX A&M': 'TEXAS A&M',
    'W KENTUCKY': 'WESTERN KENTUCKY',
    'WEST KENTUCKY': 'WESTERN KENTUCKY',
    'W MICHIGAN': 'WESTERN MICHIGAN',
    'WEST MICHIGAN': 'WESTERN MICHIGAN',
    'WEST VIRGINIA': 'WEST VIRGINIA',
    'W VIRGINIA': 'WEST VIRGINIA',
    'WVU': 'WEST VIRGINIA',
    'E CAROLINA': 'EAST CAROLINA',
    'EAST CAROLINA': 'EAST CAROLINA',
    'ECU': 'EAST CAROLINA',
    'E MICHIGAN': 'EASTERN MICHIGAN',
    'EAST MICHIGAN': 'EASTERN MICHIGAN',
    'S CAROLINA': 'SOUTH CAROLINA',
    'SOUTH CAROLINA': 'SOUTH CAROLINA',
    'S ALABAMA': 'SOUTH ALABAMA',
    'SOUTH ALABAMA': 'SOUTH ALABAMA',
    'S FLORIDA': 'SOUTH FLORIDA',
    'SOUTH FLORIDA': 'SOUTH FLORIDA',
    'USF': 'SOUTH FLORIDA',
    'S MISS': 'SOUTHERN MISS',
    'SOUTHERN MISS': 'SOUTHERN MISS',
    'SO MISS': 'SOUTHERN MISS',
    'N ILLINOIS': 'NORTHERN ILLINOIS',
    'NORTHERN ILLINOIS': 'NORTHERN ILLINOIS',
    'NIU': 'NORTHERN ILLINOIS',
    'N TEXAS': 'NORTH TEXAS',
    'NORTH TEXAS': 'NORTH TEXAS',
    'UNT': 'NORTH TEXAS',
    'TEXAS ST': 'TEXAS STATE',
    'TEX STATE': 'TEXAS STATE',
    'TEXAS TECH': 'TEXAS TECH',
    'TEX TECH': 'TEXAS TECH',
    'ARKANSAS ST': 'ARKANSAS STATE',
    'ARK STATE': 'ARKANSAS STATE',
    'ARK ST': 'ARKANSAS STATE',
    'JAMES MAD': 'JAMES MADISON',
    'JMU': 'JAMES MADISON',
    'GA SOUHTRN': 'GEORGIA SOUTHERN',
    'GA SOUTHRN': 'GEORGIA SOUTHERN',
    'GA SOUTHERN': 'GEORGIA SOUTHERN',
    'GEORGIA SO': 'GEORGIA SOUTHERN',
    'GEO SOUTHERN': 'GEORGIA SOUTHERN',
    'GSU': 'GEORGIA SOUTHERN',
    'DOMINION': 'OLD DOMINION',
    'OLD DOM': 'OLD DOMINION',
    'ODU': 'OLD DOMINION',
    'GA TECH': 'GEORGIA TECH',
    'GEORGIA TECH': 'GEORGIA TECH',
    'GT': 'GEORGIA TECH',
    'KENNESAW': 'KENNESAW STATE',
    'KENNESAW ST': 'KENNESAW STATE',
    'KSU': 'KENNESAW STATE',
    'BOWL GREEN': 'BOWLING GREEN',
    'BOWLING GREEN': 'BOWLING GREEN',
    'BGSU': 'BOWLING GREEN',
    'NWESTERN': 'NORTHWESTERN',
    'NORTHWESTERN': 'NORTHWESTERN',
    'APP STATE': 'APPALACHIAN STATE',
    'APPALACHIAN ST': 'APPALACHIAN STATE',
    'APP ST': 'APPALACHIAN STATE',
    'SM HOUSTON': 'SAM HOUSTON',
    'SAM HOUSTON': 'SAM HOUSTON',
    'SAM HOUSTON ST': 'SAM HOUSTON',
    'SHSU': 'SAM HOUSTON',
    'JVILLE STATE': 'JACKSONVILLE STATE',
    'JVILLE ST': 'JACKSONVILLE STATE',
    'JACKSONVILLE ST': 'JACKSONVILLE STATE',
    'JAX STATE': 'JACKSONVILLE STATE',
    'JAX ST': 'JACKSONVILLE STATE',
    'WAKE': 'WAKE FOREST',
    'WAKE FOREST': 'WAKE FOREST',
    'WAKE FOR': 'WAKE FOREST',
    'WF': 'WAKE FOREST',
    'VA TECH': 'VIRGINIA TECH',
    'VIRGINIA TECH': 'VIRGINIA TECH',
    'VT': 'VIRGINIA TECH',
    'UCONN': 'UCONN',
    'CONNECTICUT': 'UCONN',
    'LA LAFAYET': 'LOUISIANA',
    'LOUISIANA LAFAYETTE': 'LOUISIANA',
    'UL LAFAYETTE': 'LOUISIANA',
    'ULL': 'LOUISIANA',
    'COAST CAR': 'COASTAL CAROLINA',
    'COASTAL CAR': 'COASTAL CAROLINA',
  };
  return nameMap[normalized] || teamName;
};

const getTeamColors = (teamName) => {
  if (!teamName) return ['#3B82F6', '#60A5FA'];
  const normalizedName = normalizeTeamName(teamName);
  const key = normalizedName.toUpperCase().trim();

  if (key.includes('MIAMI') && key.includes('OH')) {
    return TEAM_COLORS['MIAMI OH'] || ['#C41E3A', '#000000'];
  }

  if (TEAM_COLORS[key]) {
    return TEAM_COLORS[key];
  }

  if (key === 'WAKE FOREST') {
    return ['#9E7E38', '#000000'];
  }

  for (const [colorKey, colors] of Object.entries(TEAM_COLORS)) {
    if (key.includes(colorKey) || colorKey.includes(key)) {
      return colors;
    }
  }

  return ['#3B82F6', '#60A5FA'];
};

// Player Physical Stats Database (Public Information)
const PLAYER_DATABASE = {
  // Example entries - you can expand this
  'JALEN MILROE': { height: 72, weight: 210, class: 'JR' },
  'QUINN EWERS': { height: 75, weight: 206, class: 'JR' },
  'CAM WARD': { height: 74, weight: 223, class: 'SR' },
  'DILLON GABRIEL': { height: 71, weight: 200, class: 'SR' },
  'CARSON BECK': { height: 76, weight: 220, class: 'JR' },
  // Add more players as needed
};

// Function to enrich player data with physical stats
const enrichPlayerData = (player) => {
  const playerName = player.player?.toUpperCase().trim();
  if (playerName && PLAYER_DATABASE[playerName]) {
    const physicalStats = PLAYER_DATABASE[playerName];
    return {
      ...player,
      height: player.height || physicalStats.height,
      weight: player.weight || physicalStats.weight,
      class: player.class || physicalStats.class
    };
  }
  return player;
};

// Position configurations
const POSITION_CONFIGS = {
  QB: {
    name: 'Quarterbacks',
    stats: [
      'accuracy_percent',
      'completion_percent',
      'avg_depth_of_target',
      'btt_rate',
      'grades_offense',
      'grades_pass',
      'grades_run',
      'pressure_to_sack_rate',
      'ypa',
      'twp_rate'
    ],
    labels: {
      'accuracy_percent': 'Accuracy Percent',
      'completion_percent': 'Completion Percentage',
      'avg_depth_of_target': 'Average Depth of Target',
      'btt_rate': 'Big Time Throw Rate',
      'grades_offense': 'PFF OFF',
      'grades_pass': 'PFF Pass',
      'grades_run': 'PFF Run',
      'pressure_to_sack_rate': 'Pressure to sack rate',
      'ypa': 'Yards Per Attempt',
      'twp_rate': 'Turnover worthy play rate'
    },
    invertedStats: ['twp_rate', 'pressure_to_sack_rate'],
    usageColumn: 'dropbacks',
    minUsage: 100,
    compositeScoreConfig: {
      stats: [
        { stat: 'grades_pass', weight: 1.25 },
        { stat: 'grades_offense', weight: 1.25 },
        { stat: 'pressure_to_sack_rate', weight: 1.25, invert: true },
        { stat: 'twp_rate', weight: 1.25, invert: true },
        { stat: 'accuracy_percent', weight: 1.10 },
        { stat: 'ypa', weight: 1.00 },
        { stat: 'avg_depth_of_target', weight: 1.00 },
        { stat: 'completion_percent', weight: 0.90 },
        { stat: 'grades_run', weight: 0.90 },
        { stat: 'btt_rate', weight: 0.80 }
      ]
    }
  },
  WR: {
    name: 'Wide Receivers',
    stats: [
      'man_grades_pass_route',
      'man_yprr',
      'zone_grades_pass_route',
      'zone_yprr',
      'yards_after_catch_per_reception',
      'drop_rate',
      'slot_rate',
      'wide_rate',
      'contested_catch_rate',
      'avoided_tackles'
    ],
    labels: {
      'man_grades_pass_route': 'Man REC Grade',
      'man_yprr': 'Man Y/RR',
      'zone_grades_pass_route': 'Zone REC Grade',
      'zone_yprr': 'Zone Y/RR',
      'yards_after_catch_per_reception': 'YAC per reception',
      'drop_rate': 'Drop Rate',
      'slot_rate': 'Slot Rate',
      'wide_rate': 'Wide Rate',
      'contested_catch_rate': 'Contested Catch Rate',
      'avoided_tackles': 'Missed Tackles Forced'
    },
    invertedStats: ['drop_rate'],
    usageColumn: 'routes',
    minUsage: 100,
    positionFilter: 'WR',
    compositeScoreConfig: {
      stats: [
        { stat: 'man_grades_pass_route', weight: 1.0 },
        { stat: 'man_yprr', weight: 1.0 },
        { stat: 'zone_grades_pass_route', weight: 1.0 },
        { stat: 'zone_yprr', weight: 1.0 },
        { stat: 'yards_after_catch_per_reception', weight: 1.0 },
        { stat: 'drop_rate', weight: 1.0, invert: true },
        { stat: 'contested_catch_rate', weight: 1.0 },
        { stat: 'avoided_tackles', weight: 1.0 }
      ]
    }
  },
  RB: {
    name: 'Running Backs',
    stats: [
      'grades_offense',
      'grades_run',
      'ypa',
      'yco_attempt',
      'grades_pass_block',
      'grades_pass_route',
      'yprr',
      'grades_hands_fumble'
    ],
    labels: {
      'grades_offense': 'PFF Offense Grade',
      'grades_run': 'PFF Run Grade',
      'ypa': 'Yards Per Attempt',
      'yco_attempt': 'Yards After Contact per Attempt',
      'grades_pass_block': 'Pass Block Grade',
      'grades_pass_route': 'Receiving Grade',
      'yprr': 'Yards Per Route Run',
      'grades_hands_fumble': 'Fumble Grade'
    },
    invertedStats: [],
    usageColumn: 'attempts',
    minUsage: 20,
    positionFilter: ['RB', 'HB'],
    compositeScoreConfig: {
      stats: [
        { stat: 'grades_offense', weight: 1.0 },
        { stat: 'grades_run', weight: 1.0 },
        { stat: 'ypa', weight: 1.0 },
        { stat: 'yco_attempt', weight: 1.0 },
        { stat: 'grades_hands_fumble', weight: 1.0 },
        { stat: 'grades_pass_route', weight: 0.7 },
        { stat: 'yprr', weight: 0.7 },
        { stat: 'grades_pass_block', weight: 0.5 }
      ]
    }
  },
  EDGE: {
    name: 'Edge Rushers',
    stats: [
      'grades_defense',
      'grades_pass_rush_defense',
      'pass_rush_win_rate',
      'total_pressures',
      'prp',
      'grades_run_defense',
      'stop_percent',
      'tackles_for_loss',
      'missed_tackle_rate'
    ],
    labels: {
      'grades_defense': 'PFF Defense Grade',
      'grades_pass_rush_defense': 'PFF Pass Rush Grade',
      'pass_rush_win_rate': 'Pass Rush Win Rate',
      'total_pressures': 'Total Pressures',
      'prp': 'Pressure Rate %',
      'grades_run_defense': 'PFF Run Defense Grade',
      'stop_percent': 'Stop Percentage',
      'tackles_for_loss': 'Tackles for Loss',
      'missed_tackle_rate': 'Missed Tackle Rate'
    },
    invertedStats: ['missed_tackle_rate'],
    usageColumn: 'snap_counts_pass_rush',
    minUsage: 50,
    positionFilter: ['EDGE', 'ED'],
    compositeScoreConfig: {
      stats: [
        { stat: 'grades_defense', weight: 1.0 },
        { stat: 'grades_pass_rush_defense', weight: 1.0 },
        { stat: 'pass_rush_win_rate', weight: 1.0 },
        { stat: 'total_pressures', weight: 1.0 },
        { stat: 'prp', weight: 1.0 },
        { stat: 'grades_run_defense', weight: 1.0 },
        { stat: 'stop_percent', weight: 1.0 },
        { stat: 'tackles_for_loss', weight: 1.0 },
        { stat: 'missed_tackle_rate', weight: 1.0, invert: true }
      ]
    }
  },
  CB: {
    name: 'Cornerbacks',
    stats: [
      'man_snap_counts_coverage_percent',
      'man_grades_coverage_defense',
      'zone_snap_counts_coverage_percent',
      'zone_grades_coverage_defense',
      'forced_incompletion_rate',
      'qb_rating_against',
      'grades_tackle',
      'missed_tackle_rate'
    ],
    labels: {
      'man_snap_counts_coverage_percent': 'Man Coverage %',
      'man_grades_coverage_defense': 'Man Coverage Grade',
      'zone_snap_counts_coverage_percent': 'Zone Coverage %',
      'zone_grades_coverage_defense': 'Zone Coverage Grade',
      'forced_incompletion_rate': 'Forced Incompletion Rate',
      'qb_rating_against': 'QB Rating Against',
      'grades_tackle': 'Tackle Grade',
      'missed_tackle_rate': 'Missed Tackle Rate'
    },
    invertedStats: ['qb_rating_against', 'missed_tackle_rate'],
    usageColumn: 'snap_counts_coverage',
    minUsage: 100,
    positionFilter: 'CB',
    compositeScoreConfig: {
      stats: [
        { stat: 'man_grades_coverage_defense', weight: 1.2 },
        { stat: 'zone_grades_coverage_defense', weight: 1.2 },
        { stat: 'qb_rating_against', weight: 1.0, invert: true },
        { stat: 'forced_incompletion_rate', weight: 1.0 },
        { stat: 'grades_tackle', weight: 0.7 }
      ]
    }
  },
  OT: {
    name: 'Offensive Tackles',
    stats: [
      'grades_offense',
      'grades_pass_block',
      'pbe',
      'pressures_allowed',
      'sacks_allowed',
      'grades_run_block',
      'gap_grades_run_block',
      'zone_grades_run_block'
    ],
    labels: {
      'grades_offense': 'PFF Offense Grade',
      'grades_pass_block': 'Pass Block Grade',
      'pbe': 'Pass Block Efficiency',
      'pressures_allowed': 'Pressures Allowed',
      'sacks_allowed': 'Sacks Allowed',
      'grades_run_block': 'Run Block Grade',
      'gap_grades_run_block': 'Gap Scheme Grade',
      'zone_grades_run_block': 'Zone Scheme Grade'
    },
    invertedStats: ['pressures_allowed', 'sacks_allowed'],
    usageColumn: 'snap_counts_block',
    minUsage: 150,
    positionFilter: 'T',
    compositeScoreConfig: {
      stats: [
        { stat: 'grades_pass_block', weight: 1.05 },
        { stat: 'pbe', weight: 1.05 },
        { stat: 'pressures_allowed', weight: 1.05, invert: true },
        { stat: 'sacks_allowed', weight: 1.05, invert: true },
        { stat: 'grades_run_block', weight: 1.0 },
        { stat: 'gap_grades_run_block', weight: 1.0 },
        { stat: 'zone_grades_run_block', weight: 1.0 }
      ]
    }
  },
  IOL: {
    name: 'Interior Offensive Line',
    stats: [
      'grades_offense',
      'grades_pass_block',
      'pbe',
      'pressures_allowed',
      'sacks_allowed',
      'grades_run_block',
      'gap_grades_run_block',
      'zone_grades_run_block'
    ],
    labels: {
      'grades_offense': 'PFF Offense Grade',
      'grades_pass_block': 'Pass Block Grade',
      'pbe': 'Pass Block Efficiency',
      'pressures_allowed': 'Pressures Allowed',
      'sacks_allowed': 'Sacks Allowed',
      'grades_run_block': 'Run Block Grade',
      'gap_grades_run_block': 'Gap Scheme Grade',
      'zone_grades_run_block': 'Zone Scheme Grade'
    },
    invertedStats: ['pressures_allowed', 'sacks_allowed'],
    usageColumn: 'snap_counts_block',
    minUsage: 150,
    positionFilter: ['G', 'C'],
    compositeScoreConfig: {
      stats: [
        { stat: 'grades_pass_block', weight: 1.05 },
        { stat: 'pbe', weight: 1.05 },
        { stat: 'pressures_allowed', weight: 1.05, invert: true },
        { stat: 'sacks_allowed', weight: 1.05, invert: true },
        { stat: 'grades_run_block', weight: 1.0 },
        { stat: 'gap_grades_run_block', weight: 1.0 },
        { stat: 'zone_grades_run_block', weight: 1.0 }
      ]
    }
  },
  TE: {
    name: 'Tight Ends',
    stats: [
      'man_grades_pass_route',
      'man_yprr',
      'zone_grades_pass_route',
      'zone_yprr',
      'yards_after_catch_per_reception',
      'drop_rate',
      'contested_catch_rate',
      'grades_pass_block',
      'grades_run_block'
    ],
    labels: {
      'man_grades_pass_route': 'Man Route Grade',
      'man_yprr': 'Man Y/RR',
      'zone_grades_pass_route': 'Zone Route Grade',
      'zone_yprr': 'Zone Y/RR',
      'yards_after_catch_per_reception': 'YAC per Reception',
      'drop_rate': 'Drop Rate',
      'contested_catch_rate': 'Contested Catch Rate',
      'grades_pass_block': 'Pass Block Grade',
      'grades_run_block': 'Run Block Grade'
    },
    invertedStats: ['drop_rate'],
    usageColumn: 'routes',
    minUsage: 75,
    positionFilter: 'TE',
    compositeScoreConfig: {
      stats: [
        { stat: 'man_grades_pass_route', weight: 1.0 },
        { stat: 'man_yprr', weight: 1.0 },
        { stat: 'zone_grades_pass_route', weight: 1.0 },
        { stat: 'zone_yprr', weight: 1.0 },
        { stat: 'yards_after_catch_per_reception', weight: 1.0 },
        { stat: 'drop_rate', weight: 1.0, invert: true },
        { stat: 'contested_catch_rate', weight: 1.0 },
        { stat: 'grades_pass_block', weight: 0.6 },
        { stat: 'grades_run_block', weight: 0.6 }
      ]
    }
  },
  DL: {
    name: 'Defensive Lineman',
    stats: [
      'grades_defense',
      'grades_pass_rush_defense',
      'pass_rush_win_rate',
      'total_pressures',
      'prp',
      'grades_run_defense',
      'stop_percent',
      'tackles_for_loss',
      'missed_tackle_rate',
      'snap_counts_dl_a_gap',
      'snap_counts_dl_b_gap',
      'snap_counts_dl_over_t'
    ],
    labels: {
      'grades_defense': 'PFF Defense Grade',
      'grades_pass_rush_defense': 'PFF Pass Rush Grade',
      'pass_rush_win_rate': 'Pass Rush Win Rate',
      'total_pressures': 'Total Pressures',
      'prp': 'Pressure Rate %',
      'grades_run_defense': 'PFF Run Defense Grade',
      'stop_percent': 'Stop Percentage',
      'tackles_for_loss': 'Tackles for Loss',
      'missed_tackle_rate': 'Missed Tackle Rate',
      'snap_counts_dl_a_gap': 'A Gap Snaps',
      'snap_counts_dl_b_gap': 'B Gap Snaps',
      'snap_counts_dl_over_t': 'Over Tackle Snaps'
    },
    invertedStats: ['missed_tackle_rate'],
    usageColumn: 'snap_counts_defense',
    minUsage: 100,
    positionFilter: ['DL', 'DI'],
    compositeScoreConfig: {
      stats: [
        { stat: 'grades_defense', weight: 1.0 },
        { stat: 'grades_pass_rush_defense', weight: 1.0 },
        { stat: 'pass_rush_win_rate', weight: 1.0 },
        { stat: 'total_pressures', weight: 1.0 },
        { stat: 'prp', weight: 1.0 },
        { stat: 'grades_run_defense', weight: 1.0 },
        { stat: 'stop_percent', weight: 1.0 },
        { stat: 'tackles_for_loss', weight: 1.0 },
        { stat: 'missed_tackle_rate', weight: 1.0, invert: true }
      ]
    }
  },
  LB: {
    name: 'Linebackers',
    stats: [
      'grades_defense',
      'man_grades_coverage_defense',
      'zone_grades_coverage_defense',
      'qb_rating_against',
      'grades_tackle',
      'prp',
      'grades_pass_rush_defense',
      'grades_run_defense',
      'stop_percent',
      'missed_tackle_rate'
    ],
    labels: {
      'grades_defense': 'PFF Defense Grade',
      'man_grades_coverage_defense': 'Man Coverage Grade',
      'zone_grades_coverage_defense': 'Zone Coverage Grade',
      'qb_rating_against': 'QB Rating Against',
      'grades_tackle': 'Tackle Grade',
      'prp': 'Pressure Rate %',
      'grades_pass_rush_defense': 'Pass Rush Grade',
      'grades_run_defense': 'Run Defense Grade',
      'stop_percent': 'Stop Percentage',
      'missed_tackle_rate': 'Missed Tackle Rate'
    },
    invertedStats: ['qb_rating_against', 'missed_tackle_rate'],
    usageColumn: 'snap_counts_defense',
    minUsage: 100,
    positionFilter: 'LB',
    compositeScoreConfig: {
      stats: [
        { stat: 'grades_tackle', weight: 1.2 },
        { stat: 'missed_tackle_rate', weight: 1.2, invert: true },
        { stat: 'man_grades_coverage_defense', weight: 1.1 },
        { stat: 'zone_grades_coverage_defense', weight: 1.1 },
        { stat: 'grades_run_defense', weight: 1.1 },
        { stat: 'stop_percent', weight: 1.0 },
        { stat: 'qb_rating_against', weight: 1.0, invert: true },
        { stat: 'grades_defense', weight: 1.0 },
        { stat: 'grades_pass_rush_defense', weight: 0.7 },
        { stat: 'prp', weight: 0.7 }
      ]
    }
  },
  S: {
    name: 'Safeties',
    stats: [
      'grades_defense',
      'man_grades_coverage_defense',
      'zone_grades_coverage_defense',
      'qb_rating_against',
      'grades_run_defense',
      'stop_percent',
      'grades_tackle',
      'missed_tackle_rate',
      'snap_counts_box',
      'snap_counts_fs'
    ],
    labels: {
      'grades_defense': 'PFF Defense Grade',
      'man_grades_coverage_defense': 'Man Coverage Grade',
      'zone_grades_coverage_defense': 'Zone Coverage Grade',
      'qb_rating_against': 'QB Rating Against',
      'grades_run_defense': 'Run Defense Grade',
      'stop_percent': 'Stop Percentage',
      'grades_tackle': 'Tackle Grade',
      'missed_tackle_rate': 'Missed Tackle Rate',
      'snap_counts_box': 'Box Safety Snaps',
      'snap_counts_fs': 'Free Safety Snaps'
    },
    invertedStats: ['qb_rating_against', 'missed_tackle_rate'],
    usageColumn: 'snap_counts_defense',
    minUsage: 100,
    positionFilter: 'S',
    compositeScoreConfig: {
      stats: [
        { stat: 'zone_grades_coverage_defense', weight: 1.2 },
        { stat: 'grades_tackle', weight: 1.2 },
        { stat: 'missed_tackle_rate', weight: 1.2, invert: true },
        { stat: 'man_grades_coverage_defense', weight: 1.1 },
        { stat: 'grades_run_defense', weight: 1.1 },
        { stat: 'qb_rating_against', weight: 1.0, invert: true },
        { stat: 'stop_percent', weight: 1.0 },
        { stat: 'grades_defense', weight: 1.0 }
      ]
    }
  }
};

// Custom Radar Chart Component
const CustomRadarChart = ({ data, player1Color, player2Color, comparisonMode, invertedStats = [], width = 600, height = 600 }) => {
  const centerX = width / 2;
  const centerY = height / 2;
  const maxRadius = 220;
  const numLevels = 10;

  const numAxes = data.length;
  const angleStep = (2 * Math.PI) / numAxes;

  const polarToCartesian = (angle, radius) => {
    return {
      x: centerX + radius * Math.cos(angle - Math.PI / 2),
      y: centerY + radius * Math.sin(angle - Math.PI / 2)
    };
  };

  const getValueAtPercentile = (statData, percentile) => {
    const range = statData.max - statData.min;
    return statData.min + (range * percentile / 100);
  };

  const renderGridCircles = () => {
    return Array.from({ length: numLevels + 1 }, (_, i) => {
      const radius = (maxRadius / numLevels) * i;
      return (
        <circle
          key={i}
          cx={centerX}
          cy={centerY}
          r={radius}
          fill="none"
          stroke={comparisonMode ? "#00000015" : "#FFFFFF30"}
          strokeWidth="1"
        />
      );
    });
  };

  const renderAxes = () => {
    return data.map((stat, i) => {
      const angle = angleStep * i;
      const endPoint = polarToCartesian(angle, maxRadius);

      return (
        <line
          key={i}
          x1={centerX}
          y1={centerY}
          x2={endPoint.x}
          y2={endPoint.y}
          stroke={comparisonMode ? "#00000015" : "#FFFFFF30"}
          strokeWidth="1"
        />
      );
    });
  };

  const renderAxisLabels = () => {
    return data.map((stat, i) => {
      const angle = angleStep * i;
      const labelDistance = maxRadius + 70;
      const labelPoint = polarToCartesian(angle, labelDistance);

      const percentiles = [20, 30, 40, 50, 60, 70, 80, 90, 100];

      const statKey = stat.statKey;
      const isInverted = invertedStats.includes(statKey);

      return (
        <g key={i}>
          <text
            x={labelPoint.x}
            y={labelPoint.y}
            textAnchor="middle"
            fill={comparisonMode ? "#000000" : "#FFFFFF"}
            fontSize="11"
            fontWeight="600"
            fontFamily="system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
          >
            {stat.stat}
          </text>

          {percentiles.map((percentile, idx) => {
            const radius = (maxRadius / numLevels) * (idx + 2);
            const point = polarToCartesian(angle, radius);

            const displayPercentile = isInverted ? (100 - percentile) : percentile;
            const value = getValueAtPercentile(stat, displayPercentile).toFixed(1);

            const rotationAngle = (angle * 180 / Math.PI);

            return (
              <text
                key={idx}
                x={point.x}
                y={point.y}
                textAnchor="middle"
                dominantBaseline="middle"
                fill={comparisonMode ? "#333333" : "#FFFFFF"}
                fontSize="10"
                fontWeight="600"
                opacity="0.9"
                fontFamily="system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                transform={`rotate(${rotationAngle}, ${point.x}, ${point.y})`}
              >
                {value}
              </text>
            );
          })}
        </g>
      );
    });
  };

  const renderPlayerData = (playerKey, color) => {
    const points = data.map((stat, i) => {
      const angle = angleStep * i;
      const value = comparisonMode ? stat[playerKey] : stat.value;
      const radius = (maxRadius / 100) * value;
      return polarToCartesian(angle, radius);
    });

    const pathData = points.map((point, i) =>
      `${i === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
    ).join(' ') + ' Z';

    return (
      <g>
        <path
          d={pathData}
          fill={color}
          fillOpacity={comparisonMode ? "0.3" : "0.5"}
          stroke={color}
          strokeWidth="3"
        />
        {points.map((point, i) => (
          <circle
            key={i}
            cx={point.x}
            cy={point.y}
            r="2"
            fill={color}
            stroke={comparisonMode ? "#ffffff" : color}
            strokeWidth="1"
          />
        ))}
      </g>
    );
  };

  return (
    <svg width={width} height={height} style={{ overflow: 'visible' }}>
      {renderGridCircles()}
      {renderAxes()}
      {renderPlayerData(comparisonMode ? 'player1' : 'value', player1Color)}
      {comparisonMode && renderPlayerData('player2', player2Color)}
      {renderAxisLabels()}
    </svg>
  );
};

export default function MultiPositionRadarCharts() {
  const [selectedPosition, setSelectedPosition] = useState('QB');
  const [globalData, setGlobalData] = useState(null); // Store all uploaded data
  const [currentIndex, setCurrentIndex] = useState(0);
  const [compareIndex, setCompareIndex] = useState(1);
  const [comparisonMode, setComparisonMode] = useState(false);
  const [minUsage, setMinUsage] = useState(100);
  const [showTopTenPercent, setShowTopTenPercent] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const currentPositionConfig = POSITION_CONFIGS[selectedPosition];
  const currentData = globalData; // All positions use the same global data

  const handlePositionSelect = (position) => {
    setSelectedPosition(position);
    setCurrentIndex(0);
    setCompareIndex(1);
    setComparisonMode(false);
    setMinUsage(POSITION_CONFIGS[position].minUsage);
  };

  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    try {
      const parsedFiles = await Promise.all(
        files.map(async (file) => {
          const text = await file.text();
          const lines = text.split('\n').filter(line => line.trim());

          if (lines.length === 0) return [];

          const headers = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, ''));

          return lines.slice(1).map(line => {
            const values = [];
            let current = '';
            let inQuotes = false;

            for (let i = 0; i < line.length; i++) {
              const char = line[i];
              if (char === '"') {
                inQuotes = !inQuotes;
              } else if (char === ',' && !inQuotes) {
                values.push(current.trim().replace(/^["']|["']$/g, ''));
                current = '';
              } else {
                current += char;
              }
            }
            values.push(current.trim().replace(/^["']|["']$/g, ''));

            const obj = {};
            headers.forEach((header, i) => {
              const value = values[i]?.trim();
              if (!value || value === '') {
                obj[header] = null;
              } else {
                const numValue = parseFloat(value);
                obj[header] = isNaN(numValue) ? value : numValue;
              }
            });
            return obj;
          });
        })
      );

      // Merge all CSVs by player name
      const mergedData = {};

      // First, add existing data if any
      if (globalData) {
        globalData.forEach(player => {
          mergedData[player.player] = { ...player };
        });
      }

      // Then merge in new files with position-aware logic
      parsedFiles.forEach(csvData => {
        csvData.forEach(row => {
          const playerName = row.player;
          if (!playerName) return;

          const playerPosition = (row.position || row.pos || '').toUpperCase().trim();

          if (!mergedData[playerName]) {
            mergedData[playerName] = { ...row };
          } else {
            // Position-specific merge rules
            const isWR = playerPosition === 'WR';
            const isRB = playerPosition === 'RB' || playerPosition === 'HB';

            // Stats to ignore based on position
            const statsToIgnore = new Set();

            if (isWR) {
              // For WRs, ignore rushing-related stats if they exist in the new data
              // and we already have receiving stats
              if (mergedData[playerName].avoided_tackles && row.attempts) {
                // If existing data has avoided_tackles and new data has attempts (rushing),
                // don't overwrite avoided_tackles
                statsToIgnore.add('avoided_tackles');
              }
            } else if (isRB) {
              // For RBs, ignore receiving-related avoided_tackles if we have rushing stats
              if (mergedData[playerName].avoided_tackles && row.routes) {
                // If existing data has avoided_tackles and new data has routes (receiving),
                // don't overwrite avoided_tackles
                statsToIgnore.add('avoided_tackles');
              }
            }

            // Merge, but skip ignored stats
            Object.keys(row).forEach(key => {
              if (!statsToIgnore.has(key)) {
                mergedData[playerName][key] = row[key];
              }
            });
          }
        });
      });

      const merged = Object.values(mergedData);

      console.log('Parsed data sample:', merged[0]);
      console.log('Total players:', merged.length);

      // Store globally - all positions will use this data
      setGlobalData(merged);
      setCurrentIndex(0);
      setCompareIndex(1);
    } catch (error) {
      console.error('Error parsing CSVs:', error);
      alert('Error parsing CSV files. Please check the format.');
    }
  };

  const clearAllData = () => {
    setGlobalData(null);
    setCurrentIndex(0);
    setCompareIndex(1);
  };

  const calculateCompositeScore = (player, positionConfig) => {
    if (!positionConfig.compositeScoreConfig) return null;

    const { stats } = positionConfig.compositeScoreConfig;
    let totalWeight = 0;
    let weightedSum = 0;

    stats.forEach(({ stat, weight, invert }) => {
      const value = player[stat];
      if (value != null && !isNaN(value)) {
        let normalizedValue = value;

        if (invert) {
          normalizedValue = value;
        }

        weightedSum += normalizedValue * weight;
        totalWeight += weight;
      }
    });

    return totalWeight > 0 ? weightedSum / totalWeight : null;
  };

  const calculateNormalizedCompositeScore = (player, allPlayers, positionConfig) => {
    if (!positionConfig.compositeScoreConfig) return null;

    const { stats } = positionConfig.compositeScoreConfig;

    const ranges = {};
    stats.forEach(({ stat }) => {
      const values = allPlayers.map(p => p[stat]).filter(v => v != null && !isNaN(v));
      if (values.length > 0) {
        ranges[stat] = {
          min: Math.min(...values),
          max: Math.max(...values)
        };
      }
    });

    let totalWeight = 0;
    let weightedSum = 0;

    stats.forEach(({ stat, weight, invert }) => {
      const value = player[stat];
      if (value != null && !isNaN(value) && ranges[stat]) {
        const range = ranges[stat].max - ranges[stat].min;
        let normalized = 0;

        if (range > 0) {
          if (invert) {
            normalized = (ranges[stat].max - value) / range;
          } else {
            normalized = (value - ranges[stat].min) / range;
          }
        }

        weightedSum += normalized * weight;
        totalWeight += weight;
      }
    });

    return totalWeight > 0 ? (weightedSum / totalWeight) * 100 : null;
  };

  let qualifiedPlayers = currentData
    ? currentData
        .filter(p => {
          if ((p[currentPositionConfig.usageColumn] || 0) < minUsage) return false;

          if (currentPositionConfig.positionFilter) {
            const playerPosition = p.position || p.pos;
            if (!playerPosition) return false;

            const normalizedPosition = playerPosition.toUpperCase().trim();

            if (Array.isArray(currentPositionConfig.positionFilter)) {
              return currentPositionConfig.positionFilter.includes(normalizedPosition);
            } else {
              return normalizedPosition === currentPositionConfig.positionFilter;
            }
          }

          return true;
        })
        .sort((a, b) => {
          const suffixes = ['JR', 'SR', 'II', 'III', 'IV', 'V', 'JR.', 'SR.'];

          const getLastName = (fullName) => {
            const parts = fullName.split(' ').filter(p => p.trim());
            for (let i = parts.length - 1; i >= 0; i--) {
              const part = parts[i].toUpperCase().replace(/\./g, '');
              if (!suffixes.includes(part)) {
                return parts[i];
              }
            }
            return parts[parts.length - 1];
          };

          const lastNameA = getLastName(a.player);
          const lastNameB = getLastName(b.player);
          return lastNameA.localeCompare(lastNameB);
        })
    : [];

  if (showTopTenPercent && currentPositionConfig.compositeScoreConfig && qualifiedPlayers.length > 0) {
    const playersWithScores = qualifiedPlayers.map(player => ({
      player,
      compositeScore: calculateNormalizedCompositeScore(player, qualifiedPlayers, currentPositionConfig)
    })).filter(p => p.compositeScore !== null);

    playersWithScores.sort((a, b) => b.compositeScore - a.compositeScore);

    const top10Count = Math.max(1, Math.ceil(playersWithScores.length * 0.1));
    qualifiedPlayers = playersWithScores.slice(0, top10Count).map(p => p.player);

    qualifiedPlayers.sort((a, b) => {
      const suffixes = ['JR', 'SR', 'II', 'III', 'IV', 'V', 'JR.', 'SR.'];

      const getLastName = (fullName) => {
        const parts = fullName.split(' ').filter(p => p.trim());
        for (let i = parts.length - 1; i >= 0; i--) {
          const part = parts[i].toUpperCase().replace(/\./g, '');
          if (!suffixes.includes(part)) {
            return parts[i];
          }
        }
        return parts[parts.length - 1];
      };

      const lastNameA = getLastName(a.player);
      const lastNameB = getLastName(b.player);
      return lastNameA.localeCompare(lastNameB);
    });
  }

  useEffect(() => {
    if (qualifiedPlayers.length > 0) {
      if (currentIndex >= qualifiedPlayers.length) {
        setCurrentIndex(0);
      }
      if (compareIndex >= qualifiedPlayers.length) {
        setCompareIndex(Math.min(1, qualifiedPlayers.length - 1));
      }
    }
  }, [qualifiedPlayers.length, currentIndex, compareIndex]);

  const normalizePlayerData = (player) => {
    if (!player || qualifiedPlayers.length === 0) return [];

    const ranges = {};
    currentPositionConfig.stats.forEach(stat => {
      const values = qualifiedPlayers.map(p => p[stat]).filter(v => v != null && !isNaN(v));
      if (values.length === 0) {
        ranges[stat] = { min: 0, max: 100 };
      } else {
        ranges[stat] = {
          min: Math.min(...values),
          max: Math.max(...values)
        };
      }
    });

    return currentPositionConfig.stats.map(stat => {
      const value = player[stat];
      let normalized = 50;

      if (value != null && !isNaN(value) && ranges[stat].max !== ranges[stat].min) {
        if (currentPositionConfig.invertedStats.includes(stat)) {
          normalized = ((ranges[stat].max - value) / (ranges[stat].max - ranges[stat].min)) * 100;
        } else {
          normalized = ((value - ranges[stat].min) / (ranges[stat].max - ranges[stat].min)) * 100;
        }
      }

      normalized = Math.max(0, Math.min(100, normalized));

      return {
        stat: currentPositionConfig.labels[stat],
        statKey: stat,
        value: normalized,
        rawValue: value,
        min: ranges[stat].min,
        max: ranges[stat].max
      };
    });
  };

  const currentPlayer = qualifiedPlayers.length > 0 ? qualifiedPlayers[Math.min(currentIndex, qualifiedPlayers.length - 1)] : null;
  const comparePlayer = comparisonMode && qualifiedPlayers.length > 1 ? qualifiedPlayers[Math.min(compareIndex, qualifiedPlayers.length - 1)] : null;

  const player1Data = currentPlayer ? normalizePlayerData(currentPlayer) : [];
  const player2Data = comparePlayer ? normalizePlayerData(comparePlayer) : [];

  const radarData = comparisonMode && player2Data.length > 0
    ? player1Data.map((item, idx) => ({
        stat: item.stat,
        statKey: item.statKey,
        player1: item.value,
        player2: player2Data[idx].value,
        min: item.min,
        max: item.max,
        value: item.value,
        rawValue: item.rawValue
      }))
    : player1Data;

  const [primaryColor, secondaryColor] = currentPlayer ? getTeamColors(currentPlayer.team_name) : ['#3B82F6', '#60A5FA'];
  const [comparePrimaryColor, compareSecondaryColor] = comparePlayer ? getTeamColors(comparePlayer.team_name) : ['#3B82F6', '#60A5FA'];

  const adjustColorIfNeeded = (color1, color2, secondaryColor2) => {
    const getColorDistance = (c1, c2) => {
      const rgb1 = parseInt(c1.slice(1), 16);
      const rgb2 = parseInt(c2.slice(1), 16);
      const r1 = (rgb1 >> 16) & 0xff, g1 = (rgb1 >> 8) & 0xff, b1 = rgb1 & 0xff;
      const r2 = (rgb2 >> 16) & 0xff, g2 = (rgb2 >> 8) & 0xff, b2 = rgb2 & 0xff;
      return Math.sqrt(Math.pow(r1 - r2, 2) + Math.pow(g1 - g2, 2) + Math.pow(b1 - b2, 2));
    };

    const isColorTooLight = (color) => {
      const rgb = parseInt(color.slice(1), 16);
      const r = (rgb >> 16) & 0xff, g = (rgb >> 8) & 0xff, b = rgb & 0xff;
      return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.85;
    };

    if (isColorTooLight(color2)) {
      if (secondaryColor2 && !isColorTooLight(secondaryColor2)) return secondaryColor2;
      const rgb = parseInt(color2.slice(1), 16);
      const r = Math.max(0, ((rgb >> 16) & 0xff) - 150);
      const g = Math.max(0, ((rgb >> 8) & 0xff) - 150);
      const b = Math.max(0, (rgb & 0xff) - 150);
      return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }

    const distance = getColorDistance(color1, color2);
    if (distance < 100) {
      if (secondaryColor2) {
        const secondaryDistance = getColorDistance(color1, secondaryColor2);
        if (secondaryDistance >= 100 && !isColorTooLight(secondaryColor2)) return secondaryColor2;
      }
      const rgb = parseInt(color2.slice(1), 16);
      const r = (rgb >> 16) & 0xff, g = (rgb >> 8) & 0xff, b = rgb & 0xff;
      const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      if (luminance < 0.5) {
        return `#${Math.min(255, r + 80).toString(16).padStart(2, '0')}${Math.min(255, g + 80).toString(16).padStart(2, '0')}${Math.min(255, b + 80).toString(16).padStart(2, '0')}`;
      } else {
        return `#${Math.max(0, r - 80).toString(16).padStart(2, '0')}${Math.max(0, g - 80).toString(16).padStart(2, '0')}${Math.max(0, b - 80).toString(16).padStart(2, '0')}`;
      }
    }
    return color2;
  };

  const player2Color = comparisonMode ? adjustColorIfNeeded(primaryColor, comparePrimaryColor, compareSecondaryColor) : comparePrimaryColor;

  const bgColor = comparisonMode ? '#F5F3EE' : primaryColor;
  const getLuminance = (hex) => {
    const rgb = parseInt(hex.slice(1), 16);
    const r = (rgb >> 16) & 0xff, g = (rgb >> 8) & 0xff, b = rgb & 0xff;
    const rsRGB = r / 255, gsRGB = g / 255, bsRGB = b / 255;
    const rLin = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
    const gLin = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
    const bLin = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);
    return 0.2126 * rLin + 0.7152 * gLin + 0.0722 * bLin;
  };
  const useLightText = comparisonMode ? false : getLuminance(primaryColor) < 0.5;
  const textColor = useLightText ? '#FFFFFF' : '#000000';

  const downloadChart = () => {
    const chartElement = document.getElementById('radar-chart-container');
    if (!chartElement) return;

    const svgElement = chartElement.querySelector('svg');
    if (svgElement) {
      const svgData = new XMLSerializer().serializeToString(svgElement);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const svgUrl = URL.createObjectURL(svgBlob);

      const downloadLink = document.createElement('a');
      downloadLink.href = svgUrl;
      const playerName = currentPlayer ? currentPlayer.player.replace(/[^a-z0-9]/gi, '_') : 'chart';
      const compareText = comparisonMode && comparePlayer ? `_vs_${comparePlayer.player.replace(/[^a-z0-9]/gi, '_')}` : '';
      downloadLink.download = `${playerName}${compareText}_radar_chart.svg`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(svgUrl);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: bgColor,
      color: textColor,
      padding: '2rem',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
            NCAA Football Player Radar Charts
          </h1>
          <p style={{ opacity: 0.8 }}>
            Upload CSV data and visualize player statistics
          </p>
        </div>

        {/* Position Selector */}
        <div style={{ marginBottom: '2rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          {Object.keys(POSITION_CONFIGS).map((position) => (
            <button
              key={position}
              onClick={() => handlePositionSelect(position)}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: selectedPosition === position ? (comparisonMode ? '#333' : 'rgba(255,255,255,0.2)') : 'transparent',
                color: textColor,
                border: `2px solid ${textColor}`,
                borderRadius: '0.5rem',
                cursor: 'pointer',
                fontWeight: selectedPosition === position ? 'bold' : 'normal',
                transition: 'all 0.2s'
              }}
            >
              {position}
            </button>
          ))}
        </div>

        {/* File Upload */}
        <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
          <label style={{
            display: 'inline-block',
            padding: '1rem 2rem',
            backgroundColor: comparisonMode ? '#333' : 'rgba(255,255,255,0.2)',
            border: `2px solid ${textColor}`,
            borderRadius: '0.5rem',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}>
            <Upload style={{ display: 'inline', marginRight: '0.5rem' }} size={20} />
            Upload CSV File(s)
            <input
              type="file"
              accept=".csv"
              multiple
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
          </label>
          {globalData && (
            <button
              onClick={clearAllData}
              style={{
                marginLeft: '1rem',
                padding: '1rem 2rem',
                backgroundColor: '#dc2626',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              <X style={{ display: 'inline', marginRight: '0.5rem' }} size={20} />
              Clear Data
            </button>
          )}
        </div>

        {/* Main Content */}
        {currentPlayer && (
          <div>
            {/* Controls */}
            <div style={{ marginBottom: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center' }}>
              <button
                onClick={() => setComparisonMode(!comparisonMode)}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: comparisonMode ? '#333' : 'rgba(255,255,255,0.2)',
                  color: comparisonMode ? 'white' : textColor,
                  border: `2px solid ${textColor}`,
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                {comparisonMode ? 'Exit Comparison' : 'Compare Players'}
              </button>

              <button
                onClick={downloadChart}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: comparisonMode ? '#333' : 'rgba(255,255,255,0.2)',
                  color: comparisonMode ? 'white' : textColor,
                  border: `2px solid ${textColor}`,
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                <Download style={{ display: 'inline', marginRight: '0.5rem' }} size={20} />
                Download Chart
              </button>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="checkbox"
                  checked={showTopTenPercent}
                  onChange={(e) => setShowTopTenPercent(e.target.checked)}
                />
                Show Top 10%
              </label>
            </div>

            {/* Player Selectors */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: comparisonMode ? '1fr 1fr' : '1fr',
              gap: '2rem',
              marginBottom: '2rem'
            }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  {comparisonMode ? 'Player 1' : 'Select Player'}
                </label>
                <select
                  value={currentIndex}
                  onChange={(e) => setCurrentIndex(parseInt(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    backgroundColor: comparisonMode ? 'white' : 'rgba(255,255,255,0.2)',
                    color: comparisonMode ? '#000' : textColor,
                    border: `2px solid ${textColor}`,
                    borderRadius: '0.5rem',
                    fontSize: '1rem'
                  }}
                >
                  {qualifiedPlayers.map((player, idx) => (
                    <option key={idx} value={idx}>
                      {player.player} - {player.team_name}
                    </option>
                  ))}
                </select>
              </div>

              {comparisonMode && (
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                    Player 2
                  </label>
                  <select
                    value={compareIndex}
                    onChange={(e) => setCompareIndex(parseInt(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      backgroundColor: 'white',
                      color: '#000',
                      border: '2px solid #000',
                      borderRadius: '0.5rem',
                      fontSize: '1rem'
                    }}
                  >
                    {qualifiedPlayers.map((player, idx) => (
                      <option key={idx} value={idx}>
                        {player.player} - {player.team_name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Radar Chart */}
            <div id="radar-chart-container" style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: '700px'
            }}>
              {radarData.length > 0 && (
                <CustomRadarChart
                  data={radarData}
                  player1Color={primaryColor}
                  player2Color={player2Color}
                  comparisonMode={comparisonMode}
                  invertedStats={currentPositionConfig.invertedStats}
                />
              )}
            </div>

            {/* Player Info */}
            <div style={{
              marginTop: '2rem',
              display: 'grid',
              gridTemplateColumns: comparisonMode ? '1fr 1fr' : '1fr',
              gap: '2rem'
            }}>
              <div style={{
                padding: '1.5rem',
                backgroundColor: comparisonMode ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.1)',
                borderRadius: '0.5rem'
              }}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
                  {currentPlayer.player}
                </h3>
                <p><strong>Team:</strong> {currentPlayer.team_name}</p>
                <p><strong>Position:</strong> {currentPlayer.position || currentPlayer.pos}</p>
                {currentPlayer.height && <p><strong>Height:</strong> {Math.floor(currentPlayer.height / 12)}'{currentPlayer.height % 12}"</p>}
                {currentPlayer.weight && <p><strong>Weight:</strong> {currentPlayer.weight} lbs</p>}
                {currentPlayer.class && <p><strong>Class:</strong> {currentPlayer.class}</p>}
              </div>

              {comparisonMode && comparePlayer && (
                <div style={{
                  padding: '1.5rem',
                  backgroundColor: 'rgba(0,0,0,0.05)',
                  borderRadius: '0.5rem'
                }}>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', color: '#000' }}>
                    {comparePlayer.player}
                  </h3>
                  <p style={{ color: '#000' }}><strong>Team:</strong> {comparePlayer.team_name}</p>
                  <p style={{ color: '#000' }}><strong>Position:</strong> {comparePlayer.position || comparePlayer.pos}</p>
                  {comparePlayer.height && <p style={{ color: '#000' }}><strong>Height:</strong> {Math.floor(comparePlayer.height / 12)}'{comparePlayer.height % 12}"</p>}
                  {comparePlayer.weight && <p style={{ color: '#000' }}><strong>Weight:</strong> {comparePlayer.weight} lbs</p>}
                  {comparePlayer.class && <p style={{ color: '#000' }}><strong>Class:</strong> {comparePlayer.class}</p>}
                </div>
              )}
            </div>
          </div>
        )}

        {!currentPlayer && !globalData && (
          <div style={{
            textAlign: 'center',
            padding: '4rem',
            backgroundColor: comparisonMode ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.1)',
            borderRadius: '0.5rem'
          }}>
            <p style={{ fontSize: '1.25rem', opacity: 0.8 }}>
              Upload a CSV file to get started
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
