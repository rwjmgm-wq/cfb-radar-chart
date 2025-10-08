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

export default POSITION_CONFIGS;
