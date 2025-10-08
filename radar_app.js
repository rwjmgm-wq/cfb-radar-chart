import React, { useState, useEffect, useRef } from 'react';
import { Upload, Download, X } from 'lucide-react';

// Searchable Select Component
const SearchableSelect = ({ value, onChange, options, placeholder = "Search players..." }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedOption = options[value];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setSearchTerm('');
    }
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Dropdown trigger button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors flex items-center justify-between hover:bg-slate-700/70 relative z-[101]"
      >
        <span className="truncate text-left">{selectedOption?.label || 'Select player...'}</span>
        <svg
          className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute z-[200] w-full mt-2 bg-slate-800 border border-slate-600 rounded-lg shadow-2xl max-h-96 overflow-hidden">
          {/* Search input */}
          <div className="p-3 border-b border-slate-700 bg-slate-800">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={placeholder}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors text-sm"
              autoFocus
            />
          </div>

          {/* Options list */}
          <div className="overflow-y-auto max-h-80 bg-slate-800">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <button
                  key={option.value}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onChange(option.value);
                    setIsOpen(false);
                    setSearchTerm('');
                  }}
                  className={`w-full text-left px-4 py-2.5 hover:bg-slate-700/50 transition-colors relative z-[201] ${
                    option.value === value ? 'bg-blue-500/20 text-blue-400' : 'text-white'
                  }`}
                >
                  <div className="font-medium pointer-events-none">{option.playerName}</div>
                  <div className="text-xs text-gray-400 mt-0.5 pointer-events-none">{option.teamName}</div>
                </button>
              ))
            ) : (
              <div className="px-4 py-8 text-center text-gray-400 text-sm">
                No players found matching "{searchTerm}"
              </div>
            )}
          </div>

          {/* Results count */}
          {searchTerm && (
            <div className="px-4 py-2 border-t border-slate-700 bg-slate-800 text-xs text-gray-400">
              {filteredOptions.length} player{filteredOptions.length !== 1 ? 's' : ''} found
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// NCAA Team Colors Database
const TEAM_COLORS = {
  'AIR FORCE': ['#0033A0', '#C0C0C0'],
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
  'LOUISIANA MONROE': ['#8B0015', '#FFBE0F'],
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
    'AIR FORCE': 'AIR FORCE',
    'USAFA': 'AIR FORCE',
    'AIR FORCE ACADEMY': 'AIR FORCE',
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
    'LA MONROE': 'LOUISIANA MONROE',
    'LOUISIANA MONROE': 'LOUISIANA MONROE',
    'ULM': 'LOUISIANA MONROE',
    'UL MONROE': 'LOUISIANA MONROE',
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
    descriptions: {
      'accuracy_percent': 'Percentage of accurate passes that hit the target, regardless of completion',
      'completion_percent': 'Percentage of pass attempts that were completed',
      'avg_depth_of_target': 'Average distance in yards that passes travel beyond the line of scrimmage',
      'btt_rate': 'Percentage of throws graded as exceptional "big time throws" by PFF',
      'grades_offense': 'Overall PFF offensive grade (0-100 scale)',
      'grades_pass': 'PFF passing grade evaluating throwing ability and decision-making',
      'grades_run': 'PFF rushing grade for QB scrambles and designed runs',
      'pressure_to_sack_rate': 'Percentage of pressured dropbacks that result in a sack (lower is better)',
      'ypa': 'Average yards gained per pass attempt',
      'twp_rate': 'Percentage of plays that should have resulted in a turnover (lower is better)'
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
    descriptions: {
      'man_grades_pass_route': 'PFF route running grade when facing man coverage',
      'man_yprr': 'Yards per route run against man coverage',
      'zone_grades_pass_route': 'PFF route running grade when facing zone coverage',
      'zone_yprr': 'Yards per route run against zone coverage',
      'yards_after_catch_per_reception': 'Average yards gained after the catch per reception',
      'drop_rate': 'Percentage of catchable targets that were dropped (lower is better)',
      'slot_rate': 'Percentage of routes run from the slot position',
      'wide_rate': 'Percentage of routes run from outside alignment',
      'contested_catch_rate': 'Percentage of contested targets that were caught',
      'avoided_tackles': 'Total missed tackles forced on defenders'
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
    descriptions: {
      'grades_offense': 'Overall PFF offensive grade across all facets',
      'grades_run': 'PFF grade for rushing ability including vision, contact balance, and elusiveness',
      'ypa': 'Average yards gained per rushing attempt',
      'yco_attempt': 'Average yards gained after first contact per rushing attempt',
      'grades_pass_block': 'PFF grade for pass protection ability in blitz pickup',
      'grades_pass_route': 'PFF grade for receiving ability as a pass catcher',
      'yprr': 'Average yards gained per route run as a receiver',
      'grades_hands_fumble': 'PFF grade for ball security (higher is better)'
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
    descriptions: {
      'grades_defense': 'Overall PFF defensive grade across all plays',
      'grades_pass_rush_defense': 'PFF grade for ability to rush the passer',
      'pass_rush_win_rate': 'Percentage of pass rushes that beat the blocker within 2.5 seconds',
      'total_pressures': 'Total QB pressures (sacks + hits + hurries)',
      'prp': 'Percentage of pass rush snaps that result in a QB pressure',
      'grades_run_defense': 'PFF grade for run defense and gap integrity',
      'stop_percent': 'Percentage of run plays stopped at or before the line of scrimmage',
      'tackles_for_loss': 'Total tackles made behind the line of scrimmage',
      'missed_tackle_rate': 'Percentage of tackle attempts that were missed (lower is better)'
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
    descriptions: {
      'man_snap_counts_coverage_percent': 'Percentage of coverage snaps in man coverage',
      'man_grades_coverage_defense': 'PFF coverage grade when playing man coverage',
      'zone_snap_counts_coverage_percent': 'Percentage of coverage snaps in zone coverage',
      'zone_grades_coverage_defense': 'PFF coverage grade when playing zone coverage',
      'forced_incompletion_rate': 'Percentage of targets where the CB forced an incompletion',
      'qb_rating_against': 'Passer rating allowed when targeted (lower is better)',
      'grades_tackle': 'PFF grade for tackling technique and effectiveness',
      'missed_tackle_rate': 'Percentage of tackle attempts that were missed (lower is better)'
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
    descriptions: {
      'grades_offense': 'Overall PFF offensive grade combining pass and run blocking',
      'grades_pass_block': 'PFF grade for pass protection technique and effectiveness',
      'pbe': 'Pass blocking efficiency - sacks and hits allowed per pass block snap',
      'pressures_allowed': 'Total QB pressures allowed (sacks + hits + hurries) - lower is better',
      'sacks_allowed': 'Total sacks allowed - lower is better',
      'grades_run_block': 'PFF grade for run blocking across all schemes',
      'gap_grades_run_block': 'PFF grade for blocking in gap/power running schemes',
      'zone_grades_run_block': 'PFF grade for blocking in zone running schemes'
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
    descriptions: {
      'grades_offense': 'Overall PFF offensive grade for guards and centers',
      'grades_pass_block': 'PFF grade for pass protection in interior line play',
      'pbe': 'Pass blocking efficiency - sacks and hits allowed per pass block snap',
      'pressures_allowed': 'Total QB pressures allowed from interior (lower is better)',
      'sacks_allowed': 'Total sacks allowed (lower is better)',
      'grades_run_block': 'PFF grade for run blocking from guard/center position',
      'gap_grades_run_block': 'PFF grade for blocking in gap/power schemes at guard/center',
      'zone_grades_run_block': 'PFF grade for blocking in zone schemes at guard/center'
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
    descriptions: {
      'man_grades_pass_route': 'PFF receiving grade when facing man coverage',
      'man_yprr': 'Yards per route run against man coverage',
      'zone_grades_pass_route': 'PFF receiving grade when facing zone coverage',
      'zone_yprr': 'Yards per route run against zone coverage',
      'yards_after_catch_per_reception': 'Average yards gained after the catch per reception',
      'drop_rate': 'Percentage of catchable targets that were dropped (lower is better)',
      'contested_catch_rate': 'Percentage of contested catches that were completed',
      'grades_pass_block': 'PFF grade for pass protection in line and from slot',
      'grades_run_block': 'PFF grade for run blocking as an in-line blocker'
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
    descriptions: {
      'grades_defense': 'Overall PFF defensive grade for interior defensive linemen',
      'grades_pass_rush_defense': 'PFF grade for interior pass rush ability',
      'pass_rush_win_rate': 'Percentage of pass rushes that beat the blocker within 2.5 seconds',
      'total_pressures': 'Total QB pressures from the interior (sacks + hits + hurries)',
      'prp': 'Percentage of pass rush snaps that result in a QB pressure',
      'grades_run_defense': 'PFF grade for run defense and gap integrity from interior',
      'stop_percent': 'Percentage of run plays stopped at or before the line',
      'tackles_for_loss': 'Total tackles made behind the line of scrimmage',
      'missed_tackle_rate': 'Percentage of tackle attempts that were missed (lower is better)',
      'snap_counts_dl_a_gap': 'Number of snaps lined up in the A gap',
      'snap_counts_dl_b_gap': 'Number of snaps lined up in the B gap',
      'snap_counts_dl_over_t': 'Number of snaps lined up over the offensive tackle'
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
    descriptions: {
      'grades_defense': 'Overall PFF defensive grade across all linebacker duties',
      'man_grades_coverage_defense': 'PFF coverage grade when in man coverage',
      'zone_grades_coverage_defense': 'PFF coverage grade when in zone coverage',
      'qb_rating_against': 'Passer rating allowed when targeted in coverage (lower is better)',
      'grades_tackle': 'PFF grade for tackling technique and effectiveness',
      'prp': 'Percentage of pass rush snaps that result in a QB pressure',
      'grades_pass_rush_defense': 'PFF grade for pass rush ability on blitzes',
      'grades_run_defense': 'PFF grade for run defense, gap filling, and pursuit',
      'stop_percent': 'Percentage of run plays stopped at or before the line',
      'missed_tackle_rate': 'Percentage of tackle attempts that were missed (lower is better)'
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
    descriptions: {
      'grades_defense': 'Overall PFF defensive grade for safety play',
      'man_grades_coverage_defense': 'PFF coverage grade when in man coverage',
      'zone_grades_coverage_defense': 'PFF coverage grade when in zone coverage',
      'qb_rating_against': 'Passer rating allowed when targeted (lower is better)',
      'grades_run_defense': 'PFF grade for run support and force responsibilities',
      'stop_percent': 'Percentage of run plays stopped at or before the line',
      'grades_tackle': 'PFF grade for tackling technique and effectiveness',
      'missed_tackle_rate': 'Percentage of tackle attempts that were missed (lower is better)',
      'snap_counts_box': 'Number of snaps played in the box (near line of scrimmage)',
      'snap_counts_fs': 'Number of snaps played at free safety (deep middle)'
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
const CustomRadarChart = ({ data, player1Color, player2Color, comparisonMode, invertedStats = [], width = 600, height = 600, statDescriptions = {} }) => {
  const [hoveredStat, setHoveredStat] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  
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
            style={{ cursor: statDescriptions[statKey] ? 'help' : 'default' }}
            onMouseEnter={(e) => {
              if (statDescriptions[statKey]) {
                setHoveredStat(statKey);
                const rect = e.target.getBoundingClientRect();
                setTooltipPosition({ x: rect.left + rect.width / 2, y: rect.top });
              }
            }}
            onMouseLeave={() => setHoveredStat(null)}
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
    <>
      <svg width={width} height={height} style={{ overflow: 'visible' }}>
        {renderGridCircles()}
        {renderAxes()}
        {renderPlayerData(comparisonMode ? 'player1' : 'value', player1Color)}
        {comparisonMode && renderPlayerData('player2', player2Color)}
        {renderAxisLabels()}
      </svg>
      
      {/* Tooltip */}
      {hoveredStat && statDescriptions[hoveredStat] && (
        <div
          style={{
            position: 'fixed',
            left: `${tooltipPosition.x}px`,
            top: `${tooltipPosition.y - 10}px`,
            transform: 'translate(-50%, -100%)',
            zIndex: 10000,
            pointerEvents: 'none'
          }}
        >
          <div className="bg-slate-900 border border-slate-600 rounded-lg p-3 shadow-2xl max-w-xs">
            <div className="text-xs text-gray-300">
              {statDescriptions[hoveredStat]}
            </div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2 h-2 bg-slate-900 border-r border-b border-slate-600 rotate-45"></div>
          </div>
        </div>
      )}
    </>
  );
};

export default function MultiPositionRadarCharts() {
  const [selectedPosition, setSelectedPosition] = useState('QB');
  const [globalData, setGlobalData] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [compareIndex, setCompareIndex] = useState(1);
  const [comparisonMode, setComparisonMode] = useState(false);
  const [minUsage, setMinUsage] = useState(100);
  const [showTopTenPercent, setShowTopTenPercent] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [showKeyboardTooltip, setShowKeyboardTooltip] = useState(false);

  const currentPositionConfig = POSITION_CONFIGS[selectedPosition];
  const currentData = globalData;

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

      const mergedData = {};
      
      if (globalData) {
        globalData.forEach(player => {
          mergedData[player.player] = { ...player };
        });
      }
      
      parsedFiles.forEach(csvData => {
        csvData.forEach(row => {
          const playerName = row.player;
          if (!playerName) return;
          
          const playerPosition = (row.position || row.pos || '').toUpperCase().trim();
          
          if (!mergedData[playerName]) {
            mergedData[playerName] = { ...row };
          } else {
            const isWR = playerPosition === 'WR';
            const isRB = playerPosition === 'RB' || playerPosition === 'HB';
            
            const statsToIgnore = new Set();
            
            if (isWR) {
              if (mergedData[playerName].avoided_tackles && row.attempts) {
                statsToIgnore.add('avoided_tackles');
              }
            } else if (isRB) {
              if (mergedData[playerName].avoided_tackles && row.routes) {
                statsToIgnore.add('avoided_tackles');
              }
            }
            
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

  // Keep full dataset for normalization
  const allQualifiedPlayers = qualifiedPlayers;

  // Apply top 10% filter only for display purposes
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

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger shortcuts if user is typing in an input
      if (e.target.tagName === 'INPUT') return;
      
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        if (comparisonMode && e.shiftKey) {
          // Shift + Right Arrow: Next player for Player 2
          setCompareIndex(prev => Math.min(qualifiedPlayers.length - 1, prev + 1));
        } else {
          // Right Arrow: Next player for Player 1
          setCurrentIndex(prev => Math.min(qualifiedPlayers.length - 1, prev + 1));
        }
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (comparisonMode && e.shiftKey) {
          // Shift + Left Arrow: Previous player for Player 2
          setCompareIndex(prev => Math.max(0, prev - 1));
        } else {
          // Left Arrow: Previous player for Player 1
          setCurrentIndex(prev => Math.max(0, prev - 1));
        }
      } else if (e.key === 'c' || e.key === 'C') {
        // C key: Toggle compare mode
        setComparisonMode(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [qualifiedPlayers.length, comparisonMode]);

  const normalizePlayerData = (player) => {
    if (!player || allQualifiedPlayers.length === 0) return [];

    const ranges = {};
    currentPositionConfig.stats.forEach(stat => {
      const values = allQualifiedPlayers.map(p => p[stat]).filter(v => v != null && !isNaN(v));
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
    const chartContainer = document.getElementById('radar-chart-container');
    if (!chartContainer) return;
    
    try {
      // Get dimensions
      const containerRect = chartContainer.getBoundingClientRect();
      const width = containerRect.width;
      const height = containerRect.height;
      
      // Create a new SVG that will contain everything
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('width', width);
      svg.setAttribute('height', height);
      svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      
      // Add background
      const background = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      background.setAttribute('width', width);
      background.setAttribute('height', height);
      background.setAttribute('fill', bgColor);
      svg.appendChild(background);
      
      // Get the header section with player info
      const headerSection = chartContainer.children[0];
      const headerRect = headerSection.getBoundingClientRect();
      const headerOffsetY = headerRect.top - containerRect.top;
      
      // Add gradient background for header if not in comparison mode
      if (!comparisonMode) {
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
        gradient.setAttribute('id', 'headerGradient');
        gradient.setAttribute('x1', '0%');
        gradient.setAttribute('y1', '0%');
        gradient.setAttribute('x2', '0%');
        gradient.setAttribute('y2', '100%');
        
        const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        stop1.setAttribute('offset', '0%');
        stop1.setAttribute('style', `stop-color:${secondaryColor};stop-opacity:0.3`);
        
        const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        stop2.setAttribute('offset', '100%');
        stop2.setAttribute('style', 'stop-color:transparent;stop-opacity:0');
        
        gradient.appendChild(stop1);
        gradient.appendChild(stop2);
        defs.appendChild(gradient);
        svg.appendChild(defs);
        
        const headerBg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        headerBg.setAttribute('width', width);
        headerBg.setAttribute('height', headerRect.height);
        headerBg.setAttribute('y', headerOffsetY);
        headerBg.setAttribute('fill', 'url(#headerGradient)');
        svg.appendChild(headerBg);
      }
      
      // Add player name(s) and team info
      let yPosition = headerOffsetY + 40;
      
      if (comparisonMode && comparePlayer) {
        // Comparison title
        const titleText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        titleText.setAttribute('x', width / 2);
        titleText.setAttribute('y', yPosition);
        titleText.setAttribute('text-anchor', 'middle');
        titleText.setAttribute('font-size', '32');
        titleText.setAttribute('font-weight', 'bold');
        titleText.setAttribute('fill', textColor);
        titleText.setAttribute('font-family', 'system-ui, -apple-system, sans-serif');
        titleText.textContent = 'Player Comparison';
        svg.appendChild(titleText);
        
        yPosition += 50;
        
        // Player 1
        const player1Name = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        player1Name.setAttribute('x', width / 2 - 100);
        player1Name.setAttribute('y', yPosition);
        player1Name.setAttribute('text-anchor', 'end');
        player1Name.setAttribute('font-size', '24');
        player1Name.setAttribute('font-weight', 'bold');
        player1Name.setAttribute('fill', primaryColor);
        player1Name.setAttribute('font-family', 'system-ui, -apple-system, sans-serif');
        player1Name.textContent = currentPlayer.player;
        svg.appendChild(player1Name);
        
        const player1Team = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        player1Team.setAttribute('x', width / 2 - 100);
        player1Team.setAttribute('y', yPosition + 20);
        player1Team.setAttribute('text-anchor', 'end');
        player1Team.setAttribute('font-size', '14');
        player1Team.setAttribute('fill', textColor);
        player1Team.setAttribute('opacity', '0.8');
        player1Team.setAttribute('font-family', 'system-ui, -apple-system, sans-serif');
        player1Team.textContent = normalizeTeamName(currentPlayer.team_name);
        svg.appendChild(player1Team);
        
        // VS
        const vsText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        vsText.setAttribute('x', width / 2);
        vsText.setAttribute('y', yPosition);
        vsText.setAttribute('text-anchor', 'middle');
        vsText.setAttribute('font-size', '24');
        vsText.setAttribute('fill', textColor);
        vsText.setAttribute('opacity', '0.5');
        vsText.setAttribute('font-family', 'system-ui, -apple-system, sans-serif');
        vsText.textContent = 'vs';
        svg.appendChild(vsText);
        
        // Player 2
        const player2Name = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        player2Name.setAttribute('x', width / 2 + 100);
        player2Name.setAttribute('y', yPosition);
        player2Name.setAttribute('text-anchor', 'start');
        player2Name.setAttribute('font-size', '24');
        player2Name.setAttribute('font-weight', 'bold');
        player2Name.setAttribute('fill', player2Color);
        player2Name.setAttribute('font-family', 'system-ui, -apple-system, sans-serif');
        player2Name.textContent = comparePlayer.player;
        svg.appendChild(player2Name);
        
        const player2Team = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        player2Team.setAttribute('x', width / 2 + 100);
        player2Team.setAttribute('y', yPosition + 20);
        player2Team.setAttribute('text-anchor', 'start');
        player2Team.setAttribute('font-size', '14');
        player2Team.setAttribute('fill', textColor);
        player2Team.setAttribute('opacity', '0.8');
        player2Team.setAttribute('font-family', 'system-ui, -apple-system, sans-serif');
        player2Team.textContent = normalizeTeamName(comparePlayer.team_name);
        svg.appendChild(player2Team);
      } else {
        // Single player
        const playerName = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        playerName.setAttribute('x', width / 2);
        playerName.setAttribute('y', yPosition);
        playerName.setAttribute('text-anchor', 'middle');
        playerName.setAttribute('font-size', '48');
        playerName.setAttribute('font-weight', 'bold');
        playerName.setAttribute('fill', secondaryColor);
        playerName.setAttribute('font-family', 'system-ui, -apple-system, sans-serif');
        playerName.textContent = currentPlayer.player;
        svg.appendChild(playerName);
        
        const teamName = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        teamName.setAttribute('x', width / 2);
        teamName.setAttribute('y', yPosition + 30);
        teamName.setAttribute('text-anchor', 'middle');
        teamName.setAttribute('font-size', '20');
        teamName.setAttribute('fill', textColor);
        teamName.setAttribute('opacity', '0.9');
        teamName.setAttribute('font-family', 'system-ui, -apple-system, sans-serif');
        teamName.textContent = normalizeTeamName(currentPlayer.team_name);
        svg.appendChild(teamName);
      }
      
      // Get the radar chart SVG and properly clone it
      const radarSvg = chartContainer.querySelector('svg');
      if (radarSvg) {
        const chartSection = chartContainer.children[1];
        const chartRect = chartSection.getBoundingClientRect();
        const chartOffsetY = chartRect.top - containerRect.top;
        
        // Create a group for the radar chart
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttribute('transform', `translate(${(width - 600) / 2}, ${chartOffsetY + 30})`);
        
        // Deep clone all children of the radar SVG
        Array.from(radarSvg.children).forEach(child => {
          const clonedChild = child.cloneNode(true);
          g.appendChild(clonedChild);
        });
        
        svg.appendChild(g);
      }
      
      // Add credits at bottom
      const creditsY = height - 30;
      const credits = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      credits.setAttribute('x', width / 2);
      credits.setAttribute('y', creditsY);
      credits.setAttribute('text-anchor', 'middle');
      credits.setAttribute('font-size', '12');
      credits.setAttribute('fill', textColor);
      credits.setAttribute('opacity', '0.5');
      credits.setAttribute('font-family', 'system-ui, -apple-system, sans-serif');
      credits.textContent = 'Tool created by Duncan Brookover • Data provided by PFF';
      svg.appendChild(credits);
      
      // Serialize and download
      const svgData = new XMLSerializer().serializeToString(svg);
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
    } catch (error) {
      console.error('Error downloading chart:', error);
      alert('Failed to download chart. Please try again.');
    }
  };

  const downloadChartAsPNG = () => {
    const chartContainer = document.getElementById('radar-chart-container');
    if (!chartContainer) return;
    
    try {
      // Get dimensions
      const containerRect = chartContainer.getBoundingClientRect();
      const width = containerRect.width;
      const height = containerRect.height;
      
      // Create a complete SVG (same as SVG download)
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('width', width);
      svg.setAttribute('height', height);
      svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      
      // Add background
      const background = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      background.setAttribute('width', width);
      background.setAttribute('height', height);
      background.setAttribute('fill', bgColor);
      svg.appendChild(background);
      
      // Get the header section
      const headerSection = chartContainer.children[0];
      const headerRect = headerSection.getBoundingClientRect();
      const headerOffsetY = headerRect.top - containerRect.top;
      
      // Add gradient for header if not in comparison mode
      if (!comparisonMode) {
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
        gradient.setAttribute('id', 'headerGradient');
        gradient.setAttribute('x1', '0%');
        gradient.setAttribute('y1', '0%');
        gradient.setAttribute('x2', '0%');
        gradient.setAttribute('y2', '100%');
        
        const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        stop1.setAttribute('offset', '0%');
        stop1.setAttribute('style', `stop-color:${secondaryColor};stop-opacity:0.3`);
        
        const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        stop2.setAttribute('offset', '100%');
        stop2.setAttribute('style', 'stop-color:transparent;stop-opacity:0');
        
        gradient.appendChild(stop1);
        gradient.appendChild(stop2);
        defs.appendChild(gradient);
        svg.appendChild(defs);
        
        const headerBg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        headerBg.setAttribute('width', width);
        headerBg.setAttribute('height', headerRect.height);
        headerBg.setAttribute('y', headerOffsetY);
        headerBg.setAttribute('fill', 'url(#headerGradient)');
        svg.appendChild(headerBg);
      }
      
      // Add player text
      let yPosition = headerOffsetY + 40;
      
      if (comparisonMode && comparePlayer) {
        // Title
        const titleText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        titleText.setAttribute('x', width / 2);
        titleText.setAttribute('y', yPosition);
        titleText.setAttribute('text-anchor', 'middle');
        titleText.setAttribute('font-size', '32');
        titleText.setAttribute('font-weight', 'bold');
        titleText.setAttribute('fill', textColor);
        titleText.setAttribute('font-family', 'system-ui, -apple-system, sans-serif');
        titleText.textContent = 'Player Comparison';
        svg.appendChild(titleText);
        
        yPosition += 50;
        
        // Player 1
        const player1Name = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        player1Name.setAttribute('x', width / 2 - 100);
        player1Name.setAttribute('y', yPosition);
        player1Name.setAttribute('text-anchor', 'end');
        player1Name.setAttribute('font-size', '24');
        player1Name.setAttribute('font-weight', 'bold');
        player1Name.setAttribute('fill', primaryColor);
        player1Name.setAttribute('font-family', 'system-ui, -apple-system, sans-serif');
        player1Name.textContent = currentPlayer.player;
        svg.appendChild(player1Name);
        
        const player1Team = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        player1Team.setAttribute('x', width / 2 - 100);
        player1Team.setAttribute('y', yPosition + 20);
        player1Team.setAttribute('text-anchor', 'end');
        player1Team.setAttribute('font-size', '14');
        player1Team.setAttribute('fill', textColor);
        player1Team.setAttribute('opacity', '0.8');
        player1Team.setAttribute('font-family', 'system-ui, -apple-system, sans-serif');
        player1Team.textContent = normalizeTeamName(currentPlayer.team_name);
        svg.appendChild(player1Team);
        
        // VS
        const vsText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        vsText.setAttribute('x', width / 2);
        vsText.setAttribute('y', yPosition);
        vsText.setAttribute('text-anchor', 'middle');
        vsText.setAttribute('font-size', '24');
        vsText.setAttribute('fill', textColor);
        vsText.setAttribute('opacity', '0.5');
        vsText.setAttribute('font-family', 'system-ui, -apple-system, sans-serif');
        vsText.textContent = 'vs';
        svg.appendChild(vsText);
        
        // Player 2
        const player2Name = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        player2Name.setAttribute('x', width / 2 + 100);
        player2Name.setAttribute('y', yPosition);
        player2Name.setAttribute('text-anchor', 'start');
        player2Name.setAttribute('font-size', '24');
        player2Name.setAttribute('font-weight', 'bold');
        player2Name.setAttribute('fill', player2Color);
        player2Name.setAttribute('font-family', 'system-ui, -apple-system, sans-serif');
        player2Name.textContent = comparePlayer.player;
        svg.appendChild(player2Name);
        
        const player2Team = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        player2Team.setAttribute('x', width / 2 + 100);
        player2Team.setAttribute('y', yPosition + 20);
        player2Team.setAttribute('text-anchor', 'start');
        player2Team.setAttribute('font-size', '14');
        player2Team.setAttribute('fill', textColor);
        player2Team.setAttribute('opacity', '0.8');
        player2Team.setAttribute('font-family', 'system-ui, -apple-system, sans-serif');
        player2Team.textContent = normalizeTeamName(comparePlayer.team_name);
        svg.appendChild(player2Team);
      } else {
        // Single player
        const playerName = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        playerName.setAttribute('x', width / 2);
        playerName.setAttribute('y', yPosition);
        playerName.setAttribute('text-anchor', 'middle');
        playerName.setAttribute('font-size', '48');
        playerName.setAttribute('font-weight', 'bold');
        playerName.setAttribute('fill', secondaryColor);
        playerName.setAttribute('font-family', 'system-ui, -apple-system, sans-serif');
        playerName.textContent = currentPlayer.player;
        svg.appendChild(playerName);
        
        const teamName = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        teamName.setAttribute('x', width / 2);
        teamName.setAttribute('y', yPosition + 30);
        teamName.setAttribute('text-anchor', 'middle');
        teamName.setAttribute('font-size', '20');
        teamName.setAttribute('fill', textColor);
        teamName.setAttribute('opacity', '0.9');
        teamName.setAttribute('font-family', 'system-ui, -apple-system, sans-serif');
        teamName.textContent = normalizeTeamName(currentPlayer.team_name);
        svg.appendChild(teamName);
      }
      
      // Get radar chart
      const radarSvg = chartContainer.querySelector('svg');
      if (radarSvg) {
        const radarClone = radarSvg.cloneNode(true);
        const chartSection = chartContainer.children[1];
        const chartRect = chartSection.getBoundingClientRect();
        const chartOffsetY = chartRect.top - containerRect.top;
        
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttribute('transform', `translate(${(width - 600) / 2}, ${chartOffsetY + 30})`);
        g.innerHTML = radarClone.innerHTML;
        svg.appendChild(g);
      }
      
      // Credits
      const creditsY = height - 30;
      const credits = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      credits.setAttribute('x', width / 2);
      credits.setAttribute('y', creditsY);
      credits.setAttribute('text-anchor', 'middle');
      credits.setAttribute('font-size', '12');
      credits.setAttribute('fill', textColor);
      credits.setAttribute('opacity', '0.5');
      credits.setAttribute('font-family', 'system-ui, -apple-system, sans-serif');
      credits.textContent = 'Tool created by Duncan Brookover • Data provided by PFF';
      svg.appendChild(credits);
      
      // Convert SVG to PNG
      const svgData = new XMLSerializer().serializeToString(svg);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);
      
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const scale = 2; // 2x for quality
        canvas.width = width * scale;
        canvas.height = height * scale;
        
        const ctx = canvas.getContext('2d');
        ctx.scale(scale, scale);
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const pngUrl = URL.createObjectURL(blob);
            const downloadLink = document.createElement('a');
            downloadLink.href = pngUrl;
            const playerName = currentPlayer ? currentPlayer.player.replace(/[^a-z0-9]/gi, '_') : 'chart';
            const compareText = comparisonMode && comparePlayer ? `_vs_${comparePlayer.player.replace(/[^a-z0-9]/gi, '_')}` : '';
            downloadLink.download = `${playerName}${compareText}_radar_chart.png`;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
            URL.revokeObjectURL(pngUrl);
          }
          URL.revokeObjectURL(url);
        }, 'image/png');
      };
      
      img.onerror = () => {
        console.error('Failed to load image for PNG conversion');
        alert('Failed to generate PNG. Please try SVG download instead.');
        URL.revokeObjectURL(url);
      };
      
      img.src = url;
    } catch (error) {
      console.error('Error generating PNG:', error);
      alert('Failed to generate PNG. Please try SVG download instead.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-5xl md:text-6xl font-bold mb-3 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            CFB Radar Chart Creator
          </h1>
          <p className="text-gray-400 text-lg">Advanced Performance Analysis Tool</p>
        </div>

        {/* Upload Section - Shows when no data */}
        {!globalData ? (
          <div className="max-w-2xl mx-auto">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-12 border-2 border-dashed border-slate-600 hover:border-slate-500 transition-colors text-center">
              <Upload className="w-20 h-20 mx-auto mb-6 text-slate-500" />
              <div className="flex items-center justify-center gap-2 mb-3">
                <h2 className="text-2xl font-bold">Upload Your Data</h2>
                <div className="relative inline-block">
                  <button
                    onClick={() => setShowTooltip(!showTooltip)}
                    onMouseEnter={() => setShowTooltip(true)}
                    onMouseLeave={() => setShowTooltip(false)}
                    className="w-5 h-5 rounded-full bg-slate-700 hover:bg-slate-600 flex items-center justify-center cursor-help transition-colors"
                  >
                    <span className="text-xs font-bold text-gray-400">?</span>
                  </button>
                  {showTooltip && (
                    <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-3 w-80 z-50">
                      <div className="bg-slate-800 border border-slate-600 rounded-lg p-4 shadow-2xl">
                        <div className="text-xs text-left space-y-2">
                          <p className="font-semibold text-blue-400 mb-2">This tool works with PFF data only</p>
                          <p className="text-gray-300">For full functionality, download these reports from PFF Premium:</p>
                          <ul className="text-gray-400 space-y-1 ml-3">
                            <li>• NCAA Passing Grades</li>
                            <li>• Receiving Grades</li>
                            <li>• Receiving Grades vs Scheme</li>
                            <li>• Rushing Grades</li>
                            <li>• Blocking Grades</li>
                            <li>• Blocking Grades vs Pass</li>
                            <li>• Blocking Grades vs Run</li>
                            <li>• Defense Grades</li>
                            <li>• Pass Rush Grades</li>
                            <li>• Run Defense Grades</li>
                            <li>• Coverage Grades</li>
                            <li>• Coverage Scheme</li>
                          </ul>
                        </div>
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2 h-2 bg-slate-800 border-r border-b border-slate-600 rotate-45"></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <p className="text-gray-400 mb-4">
                Select one or more CSV files containing player statistics
              </p>
              <label className="cursor-pointer inline-block">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/50 transition-all">
                  Choose Files
                </div>
                <input
                  type="file"
                  accept=".csv"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
              <p className="text-sm text-gray-500 mt-4">
                Files will be merged by player name • Data works across all positions
              </p>
            </div>
            
            <div className="mt-8 bg-slate-800/30 rounded-xl p-6 border border-slate-700/30">
              <h3 className="text-sm font-semibold text-gray-300 mb-3">How it works:</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>• Upload your CSV files once (they can contain multiple position groups)</li>
                <li>• Data is stored in your browser - nothing is uploaded to a server</li>
                <li>• Switch between positions without re-uploading</li>
                <li>• Compare players, filter by stats, and download visualizations</li>
              </ul>
            </div>
          </div>
        ) : (
          <>
            {/* Compact Navigation Bar */}
            <div className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur-md border-b border-slate-700/50 mb-6 -mx-4 md:-mx-8 px-4 md:px-8 py-4">
              <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between gap-4 mb-3">
                  <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">Position</h2>
                  <div className="flex items-center gap-3">
                    <label className="cursor-pointer text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1.5 transition-colors">
                      <Upload className="w-3.5 h-3.5" />
                      Add Files
                      <input
                        type="file"
                        accept=".csv"
                        multiple
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                    <span className="text-xs text-gray-600">•</span>
                    <span className="text-xs text-green-400 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div>
                      {globalData.length} players
                    </span>
                    <button
                      onClick={clearAllData}
                      className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors"
                    >
                      <X className="w-3 h-3" />
                      Clear
                    </button>
                  </div>
                </div>
                
                {/* Position Tabs */}
                <div className="flex flex-wrap gap-2">
                  {/* Offense */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] uppercase tracking-wider text-blue-400/60 font-semibold px-2">Off</span>
                    {['QB', 'RB', 'WR', 'TE', 'OT', 'IOL'].map((pos) => (
                      <button
                        key={pos}
                        onClick={() => handlePositionSelect(pos)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all duration-150 ${
                          selectedPosition === pos
                            ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                            : 'bg-slate-800/50 text-gray-400 hover:bg-slate-700/50 hover:text-white'
                        }`}
                      >
                        {pos}
                      </button>
                    ))}
                  </div>
                  
                  <div className="w-px h-6 bg-slate-700/50"></div>
                  
                  {/* Defense */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] uppercase tracking-wider text-red-400/60 font-semibold px-2">Def</span>
                    {['EDGE', 'DL', 'LB', 'CB', 'S'].map((pos) => (
                      <button
                        key={pos}
                        onClick={() => handlePositionSelect(pos)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all duration-150 ${
                          selectedPosition === pos
                            ? 'bg-red-500 text-white shadow-lg shadow-red-500/30'
                            : 'bg-slate-800/50 text-gray-400 hover:bg-slate-700/50 hover:text-white'
                        }`}
                      >
                        {pos}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Filter and Player Selection Controls */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 mb-6 border border-slate-700/50 shadow-lg relative z-50">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div className="flex flex-wrap items-center gap-4">
                  <label className="text-sm flex items-center gap-2">
                    <span className="text-gray-400">Min {currentPositionConfig.usageColumn.replace(/_/g, ' ')}:</span>
                    <input
                      type="number"
                      value={minUsage}
                      onChange={(e) => setMinUsage(Number(e.target.value))}
                      className="bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 w-24 text-white focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </label>
                  {currentPositionConfig.compositeScoreConfig && (
                    <label className="flex items-center gap-2 cursor-pointer text-sm group">
                      <input
                        type="checkbox"
                        checked={showTopTenPercent}
                        onChange={(e) => setShowTopTenPercent(e.target.checked)}
                        className="w-4 h-4 rounded"
                      />
                      <span className="text-gray-300 group-hover:text-white transition-colors">Top 10% Only</span>
                    </label>
                  )}
                  <span className="text-sm text-gray-400 bg-slate-700/30 px-3 py-2 rounded-lg">
                    {showTopTenPercent 
                      ? `${qualifiedPlayers.length} of ${allQualifiedPlayers.length} players (top 10%)`
                      : `${qualifiedPlayers.length} qualified players`
                    }
                  </span>
                  
                  {/* Keyboard Shortcuts Tooltip */}
                  <div className="relative inline-block">
                    <button
                      onMouseEnter={() => setShowKeyboardTooltip(true)}
                      onMouseLeave={() => setShowKeyboardTooltip(false)}
                      className="w-7 h-7 rounded-lg bg-slate-700/50 hover:bg-slate-700 border border-slate-600 flex items-center justify-center cursor-help transition-colors"
                      title="Keyboard shortcuts"
                    >
                      <span className="text-xs font-bold text-gray-400">⌨</span>
                    </button>
                    {showKeyboardTooltip && (
                      <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-64 z-[500]">
                        <div className="bg-slate-800 border border-slate-600 rounded-lg p-3 shadow-2xl">
                          <div className="text-xs space-y-2">
                            <p className="font-semibold text-blue-400 mb-2">Keyboard Shortcuts</p>
                            <div className="space-y-1.5 text-gray-300">
                              <div className="flex items-center justify-between">
                                <span className="text-gray-400">Navigate Player 1:</span>
                                <kbd className="px-2 py-0.5 bg-slate-700 rounded text-xs border border-slate-600">← →</kbd>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-gray-400">Navigate Player 2:</span>
                                <kbd className="px-2 py-0.5 bg-slate-700 rounded text-xs border border-slate-600">Shift + ← →</kbd>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-gray-400">Toggle Compare:</span>
                                <kbd className="px-2 py-0.5 bg-slate-700 rounded text-xs border border-slate-600">C</kbd>
                              </div>
                            </div>
                          </div>
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 -mb-1 w-2 h-2 bg-slate-800 border-l border-t border-slate-600 rotate-45"></div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={comparisonMode}
                    onChange={(e) => setComparisonMode(e.target.checked)}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-sm font-semibold text-gray-300 group-hover:text-white transition-colors">Compare Mode</span>
                </label>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="relative z-[100]">
                  <label className="text-sm">
                    <span className="text-gray-400 mb-2 block font-medium">Player 1:</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
                        disabled={currentIndex === 0}
                        className="px-3 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        title="Previous player"
                      >
                        ←
                      </button>
                      <div className="flex-1">
                        <SearchableSelect
                          value={currentIndex}
                          onChange={setCurrentIndex}
                          options={qualifiedPlayers.map((player, idx) => ({
                            value: idx,
                            label: `${player.player} - ${normalizeTeamName(player.team_name)}`,
                            playerName: player.player,
                            teamName: normalizeTeamName(player.team_name)
                          }))}
                          placeholder="Search players..."
                        />
                      </div>
                      <button
                        onClick={() => setCurrentIndex(Math.min(qualifiedPlayers.length - 1, currentIndex + 1))}
                        disabled={currentIndex === qualifiedPlayers.length - 1}
                        className="px-3 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        title="Next player"
                      >
                        →
                      </button>
                    </div>
                  </label>
                </div>
                
                {comparisonMode && (
                  <div className="relative z-[100]">
                    <label className="text-sm">
                      <span className="text-gray-400 mb-2 block font-medium">Player 2:</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setCompareIndex(Math.max(0, compareIndex - 1))}
                          disabled={compareIndex === 0}
                          className="px-3 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          title="Previous player"
                        >
                          ←
                        </button>
                        <div className="flex-1">
                          <SearchableSelect
                            value={compareIndex}
                            onChange={setCompareIndex}
                            options={qualifiedPlayers.map((player, idx) => ({
                              value: idx,
                              label: `${player.player} - ${normalizeTeamName(player.team_name)}`,
                              playerName: player.player,
                              teamName: normalizeTeamName(player.team_name)
                            }))}
                            placeholder="Search players..."
                          />
                        </div>
                        <button
                          onClick={() => setCompareIndex(Math.min(qualifiedPlayers.length - 1, compareIndex + 1))}
                          disabled={compareIndex === qualifiedPlayers.length - 1}
                          className="px-3 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          title="Next player"
                        >
                          →
                        </button>
                      </div>
                    </label>
                  </div>
                )}
              </div>
            </div>

            {currentPlayer ? (
              <div 
                id="radar-chart-container"
                className="rounded-2xl overflow-hidden shadow-2xl relative z-10"
                style={{ backgroundColor: bgColor }}
              >
                <div 
                  className="p-8 text-center relative"
                  style={{
                    background: comparisonMode 
                      ? 'linear-gradient(to bottom, rgba(0,0,0,0.03), transparent)'
                      : `linear-gradient(to bottom, ${secondaryColor}30, transparent)`
                  }}
                >
                  <div className="absolute top-4 right-4 flex gap-2">
                    <button
                      onClick={downloadChart}
                      className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg px-3 py-2 flex items-center gap-2 transition-all"
                      style={{ color: textColor }}
                      title="Download as SVG"
                    >
                      <Download className="w-4 h-4" />
                      <span className="text-sm font-medium">SVG</span>
                    </button>
                    <button
                      onClick={downloadChartAsPNG}
                      className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg px-3 py-2 flex items-center gap-2 transition-all"
                      style={{ color: textColor }}
                      title="Download as PNG"
                    >
                      <Download className="w-4 h-4" />
                      <span className="text-sm font-medium">PNG</span>
                    </button>
                  </div>
                  {comparisonMode && comparePlayer ? (
                    <div>
                      <h2 className="text-4xl font-bold mb-4" style={{ color: textColor }}>Player Comparison</h2>
                      <div className="flex justify-center gap-8 mb-4">
                        <div className="text-left">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: primaryColor }}></div>
                            <h3 className="text-2xl font-bold" style={{ color: primaryColor }}>{currentPlayer.player}</h3>
                          </div>
                          <p className="text-sm ml-5" style={{ opacity: 0.8, color: textColor }}>{normalizeTeamName(currentPlayer.team_name)}</p>
                          {(currentPlayer.height || currentPlayer.weight) && (
                            <p className="text-xs ml-5 mt-1" style={{ opacity: 0.6, color: textColor }}>
                              {currentPlayer.height && `${currentPlayer.height}"`}
                              {currentPlayer.height && currentPlayer.weight && ' • '}
                              {currentPlayer.weight && `${currentPlayer.weight} lbs`}
                            </p>
                          )}
                          {currentPlayer.class && (
                            <p className="text-xs ml-5 mt-0.5" style={{ opacity: 0.6, color: textColor }}>
                              {currentPlayer.class}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center text-2xl opacity-50" style={{ color: textColor }}>vs</div>
                        <div className="text-left">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: player2Color }}></div>
                            <h3 className="text-2xl font-bold" style={{ color: player2Color }}>{comparePlayer.player}</h3>
                          </div>
                          <p className="text-sm ml-5" style={{ opacity: 0.8, color: textColor }}>{normalizeTeamName(comparePlayer.team_name)}</p>
                          {(comparePlayer.height || comparePlayer.weight) && (
                            <p className="text-xs ml-5 mt-1" style={{ opacity: 0.6, color: textColor }}>
                              {comparePlayer.height && `${comparePlayer.height}"`}
                              {comparePlayer.height && comparePlayer.weight && ' • '}
                              {comparePlayer.weight && `${comparePlayer.weight} lbs`}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h2 className="text-5xl font-bold mb-2" style={{ color: secondaryColor }}>{currentPlayer.player}</h2>
                      <p className="text-xl" style={{ opacity: 0.9, color: textColor }}>{normalizeTeamName(currentPlayer.team_name)}</p>
                      {(currentPlayer.height || currentPlayer.weight) && (
                        <p className="text-sm mt-2" style={{ opacity: 0.7, color: textColor }}>
                          {currentPlayer.height && `${currentPlayer.height}"`}
                          {currentPlayer.height && currentPlayer.weight && ' • '}
                          {currentPlayer.weight && `${currentPlayer.weight} lbs`}
                        </p>
                      )}
                      {currentPlayer.class && (
                        <p className="text-sm mt-1" style={{ opacity: 0.7, color: textColor }}>
                          {currentPlayer.class}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div className="p-8 flex justify-center" style={{ backgroundColor: comparisonMode ? bgColor : `${primaryColor}dd` }}>
                  <CustomRadarChart
                    data={radarData}
                    player1Color={comparisonMode ? primaryColor : secondaryColor}
                    player2Color={player2Color}
                    comparisonMode={comparisonMode}
                    invertedStats={currentPositionConfig.invertedStats}
                    statDescriptions={currentPositionConfig.descriptions || {}}
                  />
                </div>
                
                {/* Credits */}
                <div className="px-6 py-3 text-center border-t" style={{ 
                  backgroundColor: comparisonMode ? bgColor : `${primaryColor}dd`,
                  borderColor: comparisonMode ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)'
                }}>
                  <p className="text-xs" style={{ 
                    color: textColor, 
                    opacity: 0.5 
                  }}>
                    Tool created by Duncan Brookover • Data provided by PFF
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-12 text-center border border-slate-700/50">
                <div className="text-gray-500 mb-2">No qualified players found</div>
                <div className="text-sm text-gray-600">
                  with {minUsage}+ {currentPositionConfig.usageColumn.replace(/_/g, ' ')}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}