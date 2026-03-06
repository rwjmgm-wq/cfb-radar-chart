import React, { useState, useEffect, useRef } from 'react';
import { Upload, Download, X, Loader2, Copy, Check, Star, Users, Trophy } from 'lucide-react';
import html2canvas from 'html2canvas';
import SearchableSelect from './components/SearchableSelect';
import CustomRadarChart from './components/CustomRadarChart';
import ErrorBoundary from './components/ErrorBoundary';
import KeyboardShortcutsGuide from './components/KeyboardShortcutsGuide';
import { normalizeTeamName, getTeamColors } from './utils/teamUtils';
import POSITION_CONFIGS from './config/positionConfigs';
import { DRAFT_PICKS } from './data/draftData';

function MultiPositionRadarCharts() {
  const [selectedPosition, setSelectedPosition] = useState('QB');
  const [yearlyData, setYearlyData] = useState({});
  const [appReady, setAppReady] = useState(false);
  const [selectedYear, setSelectedYear] = useState('all');
  const [compareYear, setCompareYear] = useState('all');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [compareIndex, setCompareIndex] = useState(1);
  const [comparisonMode, setComparisonMode] = useState(false);
  const [minUsage, setMinUsage] = useState(100);
  const [showTopTenPercent, setShowTopTenPercent] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [showKeyboardTooltip, setShowKeyboardTooltip] = useState(false);
  const [playerMetadata, setPlayerMetadata] = useState({});
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(true);
  const [isUploadingFiles, setIsUploadingFiles] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [dataStats, setDataStats] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState('');
  const [selectedConference, setSelectedConference] = useState('');
  const [theme, setTheme] = useState('dark');
  const [copied, setCopied] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [showSimilarPlayers, setShowSimilarPlayers] = useState(false);
  const [similarPlayers, setSimilarPlayers] = useState([]);
  const [showTop10Modal, setShowTop10Modal] = useState(false);
  const [draftData, setDraftData] = useState(null);
  const [cohortCompareMode, setCohortCompareMode] = useState(false);
  const [selectedCompareCohort, setSelectedCompareCohort] = useState('1');

  const currentPositionConfig = POSITION_CONFIGS[selectedPosition];
  const loadedYears = Object.keys(yearlyData).map(Number).sort((a, b) => a - b);
  const globalData = loadedYears.length > 0 ? Object.values(yearlyData).flat() : null;
  const currentData = globalData
    ? (selectedYear === 'all' ? globalData : globalData.filter(p => p.season === selectedYear))
    : null;

  // Theme colors
  const themeColors = {
    dark: {
      bg: 'bg-slate-900',
      bgSecondary: 'bg-slate-800',
      bgTertiary: 'bg-slate-700',
      text: 'text-white',
      textSecondary: 'text-gray-300',
      textMuted: 'text-gray-400',
      border: 'border-slate-700',
      borderLight: 'border-slate-600',
      hover: 'hover:bg-slate-700',
      cardBg: 'bg-slate-800/50',
      inputBg: 'bg-slate-700/50'
    },
    light: {
      bg: 'bg-gray-50',
      bgSecondary: 'bg-white',
      bgTertiary: 'bg-gray-100',
      text: 'text-gray-900',
      textSecondary: 'text-gray-700',
      textMuted: 'text-gray-500',
      border: 'border-gray-200',
      borderLight: 'border-gray-300',
      hover: 'hover:bg-gray-100',
      cardBg: 'bg-white/80',
      inputBg: 'bg-gray-100'
    }
  };

  const colors = themeColors[theme];

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('cfb_radar_theme');
    if (savedTheme && (savedTheme === 'dark' || savedTheme === 'light')) {
      setTheme(savedTheme);
    }
  }, []);

  // Save theme to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('cfb_radar_theme', theme);
  }, [theme]);

  // Load favorites from localStorage on mount
  useEffect(() => {
    const savedFavorites = localStorage.getItem('cfb_radar_favorites');
    if (savedFavorites) {
      try {
        setFavorites(JSON.parse(savedFavorites));
      } catch (e) {
        console.error('Failed to load favorites:', e);
      }
    }
  }, []);

  // Save favorites to localStorage when they change
  useEffect(() => {
    localStorage.setItem('cfb_radar_favorites', JSON.stringify(favorites));
  }, [favorites]);

  // Auto-load player metadata on mount
  useEffect(() => {
    const loadPlayerMetadata = async () => {
      setIsLoadingMetadata(true);
      try {
        const response = await fetch(`${import.meta.env.BASE_URL}cfb_players_2025.csv`);
        const text = await response.text();
        const lines = text.split('\n').filter(line => line.trim());

        if (lines.length === 0) {
          setIsLoadingMetadata(false);
          return;
        }

        const headers = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, ''));
        const metadata = {};

        lines.slice(1).forEach(line => {
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

          const row = {};
          headers.forEach((header, i) => {
            row[header] = values[i]?.trim() || null;
          });

          if (row.name) {
            metadata[row.name] = {
              height: row.ht,
              weight: row.wt,
              year: row.yr,
              position: row.pos
            };
          }
        });

        setPlayerMetadata(metadata);
        console.log('Loaded metadata for', Object.keys(metadata).length, 'players');
      } catch (error) {
        console.error('Error loading player metadata:', error);
      } finally {
        setIsLoadingMetadata(false);
      }
    };

    loadPlayerMetadata();
  }, []);

  // Load data from localStorage on mount
  useEffect(() => {
    try {
      // Try new yearly format first
      const savedYearly = localStorage.getItem('cfb_radar_yearly_data');
      if (savedYearly) {
        const parsed = JSON.parse(savedYearly);
        setYearlyData(parsed);
        setAppReady(true);
        const total = Object.values(parsed).flat().length;
        console.log('✓ Restored', total, 'players across', Object.keys(parsed).length, 'seasons from localStorage');
        return;
      }

      // Fall back to legacy flat format — load as year "Legacy"
      const savedData = localStorage.getItem('cfb_radar_data');
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        const legacyYear = 'Legacy';
        const tagged = parsedData.map(p => ({ ...p, season: legacyYear }));
        const legacyYearlyData = { [legacyYear]: tagged };
        setYearlyData(legacyYearlyData);
        setAppReady(true);
        // Migrate to new format
        localStorage.setItem('cfb_radar_yearly_data', JSON.stringify(legacyYearlyData));
        console.log('✓ Migrated', parsedData.length, 'players from legacy localStorage format');
      }
    } catch (e) {
      console.warn('Failed to load from localStorage:', e);
      localStorage.removeItem('cfb_radar_yearly_data');
      localStorage.removeItem('cfb_radar_data');
      localStorage.removeItem('cfb_radar_stats');
    }
  }, []);

  // Build draft data map from bundled static data
  useEffect(() => {
    const map = {};
    DRAFT_PICKS.forEach(([name, season, round, pick]) => {
      map[`${name}|${season}`] = { round, pick };
    });
    setDraftData(map);
  }, []);
  const handlePositionSelect = (position) => {
    setSelectedPosition(position);
    setCurrentIndex(0);
    setCompareIndex(1);
    setComparisonMode(false);
    setMinUsage(POSITION_CONFIGS[position].minUsage);
    setSelectedTeam('');
    setSelectedConference('');
    setCohortCompareMode(false);
  };

  const clearFilters = () => {
    setSelectedTeam('');
    setSelectedConference('');
    setSelectedYear('all');
    setCompareYear('all');
    setMinUsage(currentPositionConfig.minUsage);
    setShowTopTenPercent(false);
    setShowFavoritesOnly(false);
    setCohortCompareMode(false);
    setCurrentIndex(0);
    setCompareIndex(1);
  };

  const handleFileUploadForYear = async (year, files) => {
    if (files.length === 0) return;

    setYearlyData(prev => ({ ...prev, [year]: 'loading' }));

    try {
      const fileValidation = [];
      const parsedFiles = await Promise.all(
        files.map(async (file) => {
          const text = await file.text();
          const lines = text.split('\n').filter(line => line.trim());

          if (lines.length === 0) {
            fileValidation.push(`⚠️ ${file.name}: Empty file`);
            return [];
          }

          const headers = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, ''));

          const hasPlayerColumn = headers.some(h =>
            h.toLowerCase() === 'player' || h.toLowerCase() === 'name'
          );
          if (!hasPlayerColumn) {
            fileValidation.push(`⚠️ ${file.name}: Missing 'player' or 'name' column`);
          }

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

      // Merge CSVs for this year by player name
      const mergedData = {};
      parsedFiles.forEach(csvData => {
        csvData.forEach(row => {
          const playerName = row.player || row.name;
          if (!playerName) return;

          const playerPosition = (row.position || row.pos || '').toUpperCase().trim();

          if (!mergedData[playerName]) {
            mergedData[playerName] = {
              ...row,
              player: playerName,
              season: year,
              height: row.ht || row.height,
              weight: row.wt || row.weight,
            };
          } else {
            const isWR = playerPosition === 'WR';
            const isRB = playerPosition === 'RB' || playerPosition === 'HB';
            const statsToIgnore = new Set();

            if (isWR) {
              if (mergedData[playerName].avoided_tackles && row.attempts) statsToIgnore.add('avoided_tackles');
            } else if (isRB) {
              if (mergedData[playerName].avoided_tackles && row.routes) statsToIgnore.add('avoided_tackles');
            }

            Object.keys(row).forEach(key => {
              if (!statsToIgnore.has(key)) mergedData[playerName][key] = row[key];
            });

            if (row.ht) mergedData[playerName].height = row.ht;
            if (row.wt) mergedData[playerName].weight = row.wt;
          }
        });
      });

      // Merge with player metadata
      Object.keys(mergedData).forEach(playerName => {
        if (playerMetadata[playerName]) {
          if (!mergedData[playerName].height && playerMetadata[playerName].height)
            mergedData[playerName].height = playerMetadata[playerName].height;
          if (!mergedData[playerName].weight && playerMetadata[playerName].weight)
            mergedData[playerName].weight = playerMetadata[playerName].weight;
          if (!mergedData[playerName].position && !mergedData[playerName].pos && playerMetadata[playerName].position)
            mergedData[playerName].position = playerMetadata[playerName].position;
        }
      });

      const yearPlayers = Object.values(mergedData);

      if (fileValidation.length > 0) {
        console.warn('File validation warnings:', fileValidation);
      }
      console.log(`Loaded ${yearPlayers.length} players for ${year}`);

      setYearlyData(prev => {
        const updated = { ...prev, [year]: yearPlayers };
        // Save to localStorage
        try {
          localStorage.setItem('cfb_radar_yearly_data', JSON.stringify(updated));
        } catch (e) {
          console.warn('Failed to save to localStorage:', e);
        }
        return updated;
      });

    } catch (error) {
      console.error(`Error parsing CSVs for ${year}:`, error);
      // Remove the loading placeholder on error
      setYearlyData(prev => {
        const updated = { ...prev };
        delete updated[year];
        return updated;
      });
    }
  };

  // Legacy handler used by the "Add Files" button in the nav bar when data is already loaded
  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;
    // Upload into a special "Added" bucket so existing data isn't disrupted
    const year = `added_${Date.now()}`;
    await handleFileUploadForYear(year, files);
    event.target.value = '';
  };

  const clearAllData = () => {
    setYearlyData({});
    setAppReady(false);
    setSelectedYear('all');
    setCompareYear('all');
    setCohortCompareMode(false);
    setDataStats(null);
    setCurrentIndex(0);
    setCompareIndex(1);

    // Clear localStorage
    try {
      localStorage.removeItem('cfb_radar_yearly_data');
      localStorage.removeItem('cfb_radar_data');
      localStorage.removeItem('cfb_radar_stats');
      console.log('Cleared data from localStorage');
    } catch (e) {
      console.warn('Failed to clear localStorage:', e);
    }
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

  const findSimilarPlayers = (targetPlayer, allPlayers, positionConfig, topN = 5) => {
    if (!targetPlayer || !allPlayers || allPlayers.length === 0) return [];

    const stats = positionConfig.stats;

    // Calculate ranges for normalization
    const ranges = {};
    stats.forEach(stat => {
      const values = allPlayers.map(p => p[stat]).filter(v => v != null && !isNaN(v));
      if (values.length > 0) {
        ranges[stat] = {
          min: Math.min(...values),
          max: Math.max(...values)
        };
      }
    });

    // Calculate similarity score for each player
    const similarities = allPlayers
      .filter(p => p.player !== targetPlayer.player) // Exclude the target player
      .map(player => {
        let totalDistance = 0;
        let validStats = 0;

        stats.forEach(stat => {
          const targetValue = targetPlayer[stat];
          const playerValue = player[stat];

          if (targetValue != null && !isNaN(targetValue) &&
              playerValue != null && !isNaN(playerValue) &&
              ranges[stat]) {
            const range = ranges[stat].max - ranges[stat].min;

            if (range > 0) {
              // Normalize both values to 0-1 scale
              const normalizedTarget = (targetValue - ranges[stat].min) / range;
              const normalizedPlayer = (playerValue - ranges[stat].min) / range;

              // Calculate squared difference (Euclidean distance component)
              const diff = normalizedTarget - normalizedPlayer;
              totalDistance += diff * diff;
              validStats++;
            }
          }
        });

        // Calculate similarity score (inverse of distance, 0-100 scale)
        const euclideanDistance = validStats > 0 ? Math.sqrt(totalDistance / validStats) : 1;
        const similarityScore = Math.max(0, (1 - euclideanDistance) * 100);

        return {
          player,
          similarityScore,
          validStats
        };
      })
      .filter(s => s.validStats >= Math.floor(stats.length * 0.5)) // At least 50% of stats must be valid
      .sort((a, b) => b.similarityScore - a.similarityScore)
      .slice(0, topN);

    return similarities;
  };

  const normalizeDraftName = (name) =>
    (name || '').toLowerCase().replace(/\bjr\.?|\bsr\.?|\bii\b|\biii\b|\biv\b/g, '').replace(/[^a-z ]/g, '').replace(/\s+/g, ' ').trim();

  const getPlayerCohort = (player) => {
    if (!draftData) return null;
    const key = `${normalizeDraftName(player.player)}|${Number(player.season) + 1}`;
    return draftData[key] || null;
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

          // Team filter
          if (selectedTeam && p.team) {
            const normalizedPlayerTeam = normalizeTeamName(p.team);
            const normalizedSelectedTeam = normalizeTeamName(selectedTeam);
            if (normalizedPlayerTeam !== normalizedSelectedTeam) return false;
          }

          // Conference filter
          if (selectedConference && p.conference) {
            if (p.conference.toUpperCase() !== selectedConference.toUpperCase()) return false;
          }

          // Favorites filter
          if (showFavoritesOnly && !favorites.includes(p.player)) {
            return false;
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

  // Full cross-year pool (all years, same position/usage/cohort filters, no year filter) for compare normalization
  const globalQualifiedPlayers = globalData
    ? globalData.filter(p => {
        if ((p[currentPositionConfig.usageColumn] || 0) < minUsage) return false;
        if (currentPositionConfig.positionFilter) {
          const pos = (p.position || p.pos || '').toUpperCase().trim();
          if (Array.isArray(currentPositionConfig.positionFilter))
            return currentPositionConfig.positionFilter.includes(pos);
          return pos === currentPositionConfig.positionFilter;
        }
return true;
      })
    : [];

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

  // Extract unique teams and conferences for filtering
  const availableTeams = currentData
    ? [...new Set(currentData.map(p => p.team).filter(Boolean))].sort()
    : [];

  const availableConferences = currentData
    ? [...new Set(currentData.map(p => p.conference).filter(Boolean))].sort()
    : [];

  useEffect(() => {
    if (qualifiedPlayers.length > 0 && currentIndex >= qualifiedPlayers.length) {
      setCurrentIndex(0);
    }
  }, [qualifiedPlayers.length, currentIndex]);

  useEffect(() => {
    if (qualifiedPlayers.length > 0 && compareIndex >= qualifiedPlayers.length) {
      setCompareIndex(0);
    }
  }, [qualifiedPlayers.length, compareIndex]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger shortcuts if user is typing in an input
      if (e.target.tagName === 'INPUT') return;

      if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        // ? key: Open keyboard shortcuts guide
        e.preventDefault();
        setShowKeyboardTooltip(true);
      } else if (e.key === 'ArrowRight') {
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
      } else if (e.key === 'Escape') {
        // Escape: Close keyboard shortcuts guide
        setShowKeyboardTooltip(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [qualifiedPlayers.length, comparisonMode]);

  const getIQRBounds = (values) => {
    const sorted = [...values].sort((a, b) => a - b);
    const q1 = sorted[Math.floor(sorted.length * 0.25)];
    const q3 = sorted[Math.floor(sorted.length * 0.75)];
    const iqr = q3 - q1;
    return {
      min: Math.min(...values),
      max: q3 + 1.5 * iqr,
    };
  };

  const getTwoSidedIQRBounds = (values) => {
    const sorted = [...values].sort((a, b) => a - b);
    const q1 = sorted[Math.floor(sorted.length * 0.25)];
    const q3 = sorted[Math.floor(sorted.length * 0.75)];
    const iqr = q3 - q1;
    return {
      min: q1 - 1.5 * iqr,
      max: q3 + 1.5 * iqr,
    };
  };

  const normalizePlayerData = (player, pool = allQualifiedPlayers) => {
    if (!player || pool.length === 0) return [];

    const ranges = {};
    currentPositionConfig.stats.forEach(stat => {
      const values = pool.map(p => p[stat]).filter(v => v != null && !isNaN(v));
      if (values.length === 0) {
        ranges[stat] = { min: 0, max: 100 };
      } else if ((currentPositionConfig.twoSidedOutlierStats || []).includes(stat)) {
        ranges[stat] = getTwoSidedIQRBounds(values);
      } else if ((currentPositionConfig.outlierStats || []).includes(stat)) {
        ranges[stat] = getIQRBounds(values);
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

  // For cross-year comparison: Player 2 gets its own year-filtered normalization pool
  const compareQualifiedPlayers = comparisonMode && compareYear !== 'all'
    ? globalQualifiedPlayers.filter(p => p.season === compareYear)
    : globalQualifiedPlayers;
  const comparePlayersSortFn = (a, b) => {
    const suffixes = ['JR', 'SR', 'II', 'III', 'IV', 'V', 'JR.', 'SR.'];
    const getLastName = (fullName) => {
      const parts = fullName.split(' ').filter(p => p.trim());
      for (let i = parts.length - 1; i >= 0; i--) {
        const part = parts[i].toUpperCase().replace(/\./g, '');
        if (!suffixes.includes(part)) return parts[i];
      }
      return parts[parts.length - 1];
    };
    return getLastName(a.player).localeCompare(getLastName(b.player));
  };
  const comparePlayers = comparisonMode
    ? (compareYear === 'all'
        ? globalQualifiedPlayers.slice().sort(comparePlayersSortFn)
        : globalQualifiedPlayers
            .filter(p => p.season === compareYear)
            .sort(comparePlayersSortFn))
    : [];
  const comparePlayer = comparisonMode && comparePlayers.length > 0
    ? comparePlayers[Math.min(compareIndex, comparePlayers.length - 1)]
    : null;

  // Cohort compare: build normalization pool from all years filtered to the selected draft cohort
  const cohortPool = (cohortCompareMode && draftData && globalData)
    ? globalData.filter(p => {
        if ((p[currentPositionConfig.usageColumn] || 0) < minUsage) return false;
        if (currentPositionConfig.positionFilter) {
          const pos = (p.position || p.pos || '').toUpperCase().trim();
          const posMatch = Array.isArray(currentPositionConfig.positionFilter)
            ? currentPositionConfig.positionFilter.includes(pos)
            : pos === currentPositionConfig.positionFilter;
          if (!posMatch) return false;
        }
        const cohort = getPlayerCohort(p);
        if (!cohort) return false;
        if (selectedCompareCohort === '1' && cohort.round !== 1) return false;
        if (selectedCompareCohort === '2-3' && (cohort.round < 2 || cohort.round > 3)) return false;
        if (selectedCompareCohort === '4+' && cohort.round < 4) return false;
        return true;
      })
    : null;

  // In compare mode, both players normalize against the same shared pool derived from
  // globalQualifiedPlayers (position+usage only, no team/conf filters) so axes are consistent.
  // If both players are from the same specific year, restrict to that year; otherwise all years.
  const sharedComparePool = comparisonMode && comparePlayer
    ? (selectedYear !== 'all' && compareYear !== 'all' && selectedYear === compareYear
        ? globalQualifiedPlayers.filter(p => p.season === selectedYear)
        : globalQualifiedPlayers)
    : null;

  const player1Data = currentPlayer
    ? normalizePlayerData(currentPlayer, sharedComparePool || cohortPool || allQualifiedPlayers)
    : [];
  const player2Data = comparePlayer
    ? normalizePlayerData(comparePlayer, sharedComparePool)
    : [];
  
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

  const downloadChartAsPNG = async () => {
    const chartContainer = document.getElementById('radar-chart-container');
    if (!chartContainer) {
      alert('Chart container not found');
      return;
    }

    // Hide download button before capturing
    const downloadButton = chartContainer.querySelector('.download-button-hide');
    if (downloadButton) {
      downloadButton.style.display = 'none';
    }

    try {
      // Use html2canvas to capture the chart
      const canvas = await html2canvas(chartContainer, {
        backgroundColor: '#0f172a',
        scale: 2, // Higher quality
        logging: false,
        useCORS: true,
        allowTaint: true
      });

      // Convert canvas to blob
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const downloadLink = document.createElement('a');
          downloadLink.href = url;

          const playerName = currentPlayer ? currentPlayer.player.replace(/[^a-z0-9]/gi, '_') : 'chart';
          const compareText = comparisonMode && comparePlayer ? `_vs_${comparePlayer.player.replace(/[^a-z0-9]/gi, '_')}` : '';
          downloadLink.download = `${playerName}${compareText}_radar_chart.png`;

          document.body.appendChild(downloadLink);
          downloadLink.click();
          document.body.removeChild(downloadLink);
          URL.revokeObjectURL(url);
        } else {
          alert('Failed to generate PNG. Please try again.');
        }
      }, 'image/png');
    } catch (error) {
      console.error('Error generating PNG:', error);
      alert('Failed to generate PNG: ' + error.message);
    } finally {
      // Show download button again
      if (downloadButton) {
        downloadButton.style.display = 'flex';
      }
    }
  };

  const copyChartToClipboard = async () => {
    const chartContainer = document.getElementById('radar-chart-container');
    if (!chartContainer) {
      alert('Chart container not found');
      return;
    }

    // Hide download button before capturing
    const downloadButton = chartContainer.querySelector('.download-button-hide');
    if (downloadButton) {
      downloadButton.style.display = 'none';
    }

    try {
      // Use html2canvas to capture the chart
      const canvas = await html2canvas(chartContainer, {
        backgroundColor: '#0f172a',
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true
      });

      // Convert canvas to blob
      canvas.toBlob(async (blob) => {
        if (blob) {
          try {
            await navigator.clipboard.write([
              new ClipboardItem({
                'image/png': blob
              })
            ]);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          } catch (err) {
            console.error('Failed to copy to clipboard:', err);
            alert('Failed to copy to clipboard. Your browser may not support this feature.');
          }
        } else {
          alert('Failed to generate image.');
        }
      }, 'image/png');
    } catch (error) {
      console.error('Error generating image:', error);
      alert('Failed to copy to clipboard: ' + error.message);
    } finally {
      // Show download button again
      if (downloadButton) {
        downloadButton.style.display = 'flex';
      }
    }
  };

  const toggleFavorite = (playerName) => {
    setFavorites(prev => {
      if (prev.includes(playerName)) {
        return prev.filter(name => name !== playerName);
      } else {
        return [...prev, playerName];
      }
    });
  };

  const handleFindSimilarPlayers = () => {
    if (!currentPlayer || !allQualifiedPlayers || allQualifiedPlayers.length === 0) {
      alert('No players available for comparison');
      return;
    }

    const similar = findSimilarPlayers(currentPlayer, allQualifiedPlayers, currentPositionConfig, 10);
    setSimilarPlayers(similar);
    setShowSimilarPlayers(true);
  };

  const getTop10Players = () => {
    if (!allQualifiedPlayers || allQualifiedPlayers.length === 0) {
      return [];
    }

    if (!currentPositionConfig.compositeScoreConfig) {
      // If no composite score, just return top 10 by first stat
      return allQualifiedPlayers.slice(0, 10).map((player, idx) => ({
        player,
        rank: idx + 1,
        compositeScore: null
      }));
    }

    const playersWithScores = allQualifiedPlayers.map(player => ({
      player,
      compositeScore: calculateNormalizedCompositeScore(player, allQualifiedPlayers, currentPositionConfig)
    })).filter(p => p.compositeScore !== null);

    playersWithScores.sort((a, b) => b.compositeScore - a.compositeScore);

    return playersWithScores.slice(0, 10).map((p, idx) => ({
      ...p,
      rank: idx + 1
    }));
  };


  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' : 'bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100'} ${colors.text} p-4 md:p-8 transition-colors duration-300`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12 relative">
          {/* Theme Toggle Button */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className={`absolute top-0 right-0 p-3 rounded-lg ${theme === 'dark' ? 'bg-slate-800 hover:bg-slate-700' : 'bg-white hover:bg-gray-100'} ${colors.border} border transition-all shadow-lg`}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? (
              <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>

          <h1 className="text-5xl md:text-6xl font-bold mb-3 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            CFB Radar Chart Creator
          </h1>
          <p className={`${colors.textMuted} text-lg`}>Advanced Performance Analysis Tool</p>
        </div>

        {/* Upload Section - Shows when no data or user hasn't clicked Continue yet */}
        {!globalData || !appReady ? (
          <div className="max-w-3xl mx-auto">
            {isLoadingMetadata && (
              <div className="mb-6 bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 flex items-center gap-3">
                <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
                <span className="text-blue-300 text-sm">Loading player metadata...</span>
              </div>
            )}

            <div className={`${theme === 'dark' ? 'bg-slate-800/50 border-slate-600' : 'bg-white border-gray-200'} backdrop-blur-sm rounded-2xl p-8 border mb-6`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Select a season to upload data</h2>
                <div className="relative inline-block">
                  <button
                    onClick={() => setShowTooltip(!showTooltip)}
                    onMouseEnter={() => setShowTooltip(true)}
                    onMouseLeave={() => setShowTooltip(false)}
                    className="w-6 h-6 rounded-full bg-slate-700 hover:bg-slate-600 flex items-center justify-center cursor-help transition-colors"
                  >
                    <span className="text-xs font-bold text-gray-400">?</span>
                  </button>
                  {showTooltip && (
                    <div className="absolute right-0 bottom-full mb-3 w-80 z-50">
                      <div className="bg-slate-800 border border-slate-600 rounded-lg p-4 shadow-2xl">
                        <div className="text-xs text-left space-y-2">
                          <p className="font-semibold text-blue-400 mb-2">This tool works with PFF data only</p>
                          <p className="text-gray-300">Download these reports from PFF Premium for each season:</p>
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
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Year grid */}
              <div className="grid grid-cols-4 gap-3 mb-8">
                {Array.from({ length: 11 }, (_, i) => 2025 - i).map(year => {
                  const yearData = yearlyData[year];
                  const isLoaded = Array.isArray(yearData);
                  const isLoading = yearData === 'loading';
                  return (
                    <label
                      key={year}
                      className={`relative cursor-pointer rounded-xl border-2 p-4 flex flex-col items-center justify-center gap-2 transition-all min-h-[90px]
                        ${isLoaded
                          ? 'border-green-500 bg-green-500/10 cursor-default'
                          : isLoading
                            ? 'border-blue-400 bg-blue-500/10 cursor-default'
                            : theme === 'dark'
                              ? 'border-dashed border-slate-600 hover:border-slate-400 hover:bg-slate-700/30'
                              : 'border-dashed border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                        }`}
                    >
                      <span className={`text-lg font-bold ${isLoaded ? 'text-green-400' : isLoading ? 'text-blue-400' : colors.text}`}>
                        {year}
                      </span>
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
                      ) : isLoaded ? (
                        <span className="text-xs text-green-400">{yearData.length} players</span>
                      ) : (
                        <Upload className={`w-4 h-4 ${colors.textMuted}`} />
                      )}
                      {!isLoaded && !isLoading && (
                        <input
                          type="file"
                          accept=".csv"
                          multiple
                          className="hidden"
                          onChange={(e) => {
                            const files = Array.from(e.target.files);
                            if (files.length > 0) handleFileUploadForYear(year, files);
                            e.target.value = '';
                          }}
                        />
                      )}
                      {isLoaded && (
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            setYearlyData(prev => {
                              const updated = { ...prev };
                              delete updated[year];
                              try {
                                localStorage.setItem('cfb_radar_yearly_data', JSON.stringify(updated));
                              } catch {}
                              return updated;
                            });
                          }}
                          className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500/20 hover:bg-red-500/40 flex items-center justify-center transition-colors"
                          title="Remove this year"
                        >
                          <X className="w-3 h-3 text-red-400" />
                        </button>
                      )}
                    </label>
                  );
                })}
              </div>

              {/* Continue button */}
              <div className="text-center">
                <button
                  disabled={Object.values(yearlyData).filter(v => Array.isArray(v)).length === 0}
                  onClick={() => {
                    setCurrentIndex(0);
                    setAppReady(true);
                    const loadedYearNums = Object.keys(yearlyData).filter(k => Array.isArray(yearlyData[k])).map(Number).filter(n => !isNaN(n));
                    if (loadedYearNums.length > 0) setSelectedYear(Math.max(...loadedYearNums));
                  }}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-10 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/50 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none"
                >
                  Continue →
                </button>
                <p className={`text-sm ${colors.textMuted} mt-3`}>
                  Load one or more seasons, then click Continue
                </p>
              </div>
            </div>

            <div className={`${theme === 'dark' ? 'bg-slate-800/30 border-slate-700/30' : 'bg-gray-100 border-gray-200'} rounded-xl p-6 border`}>
              <h3 className={`text-sm font-semibold ${colors.textSecondary} mb-3`}>How it works:</h3>
              <ul className={`space-y-2 text-sm ${colors.textMuted}`}>
                <li>• Click a year box to upload that season's CSV files</li>
                <li>• Each season is stored separately so normalization is per-year</li>
                <li>• Data is automatically saved in your browser and persists on page refresh</li>
                <li>• Nothing is uploaded to a server - all data stays local</li>
                <li>• Compare players across seasons once multiple years are loaded</li>
              </ul>
            </div>
          </div>
        ) : (
          <>
            {/* Compact Navigation Bar */}
            <div className={`sticky top-0 z-10 ${colors.bg} backdrop-blur-md border-b ${colors.border} mb-6 -mx-4 md:-mx-8 px-4 md:px-8 py-4`}>
              <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between gap-4 mb-3">
                  <h2 className={`text-sm font-semibold ${colors.textMuted} uppercase tracking-wide`}>Position</h2>
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
                    <span className={`text-xs ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`}>•</span>
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
                            : `${theme === 'dark' ? 'bg-slate-800/50 text-gray-400 hover:bg-slate-700/50' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'} hover:text-white`
                        }`}
                      >
                        {pos}
                      </button>
                    ))}
                  </div>

                  <div className={`w-px h-6 ${theme === 'dark' ? 'bg-slate-700/50' : 'bg-gray-300'}`}></div>

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
                            : `${theme === 'dark' ? 'bg-slate-800/50 text-gray-400 hover:bg-slate-700/50' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'} hover:text-white`
                        }`}
                      >
                        {pos}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Data Statistics Display */}
                {dataStats && (
                  <div className={`mt-4 pt-4 border-t ${colors.border}`}>
                    <div className="flex flex-wrap items-center gap-4 text-xs">
                      <div className="flex items-center gap-2">
                        <span className={colors.textMuted}>Total:</span>
                        <span className={`${colors.text} font-semibold`}>{dataStats.totalPlayers} players</span>
                      </div>
                      <span className={theme === 'dark' ? 'text-slate-600' : 'text-gray-400'}>•</span>
                      <div className="flex items-center gap-2">
                        <span className={colors.textMuted}>Positions:</span>
                        <span className={`${colors.text} font-semibold`}>{dataStats.topPositions}</span>
                      </div>
                      <span className={theme === 'dark' ? 'text-slate-600' : 'text-gray-400'}>•</span>
                      <div className="flex items-center gap-2">
                        <span className={colors.textMuted}>With metadata:</span>
                        <span className="text-green-400 font-semibold">{dataStats.withMetadata}</span>
                      </div>
                      <button
                        onClick={() => console.table(dataStats.positionBreakdown)}
                        className="ml-auto text-blue-400 hover:text-blue-300 transition-colors"
                        title="View full breakdown in console"
                      >
                        View All Positions →
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Filter and Player Selection Controls */}
            <div className={`${colors.cardBg} backdrop-blur-sm rounded-xl p-6 mb-6 border ${colors.border} shadow-lg relative z-50`}>
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div className="flex flex-wrap items-center gap-4">
                  <label className="text-sm flex items-center gap-2">
                    <span className={colors.textMuted}>Min {currentPositionConfig.usageColumn.replace(/_/g, ' ')}:</span>
                    <input
                      type="number"
                      value={minUsage}
                      onChange={(e) => setMinUsage(Number(e.target.value))}
                      className={`${colors.inputBg} border ${colors.borderLight} rounded-lg px-3 py-2 w-24 ${colors.text} focus:outline-none focus:border-blue-500 transition-colors`}
                    />
                  </label>

                  {loadedYears.length > 1 && (
                    <label className="text-sm flex items-center gap-2">
                      <span className={colors.textMuted}>Season:</span>
                      <select
                        value={selectedYear}
                        onChange={(e) => {
                          setSelectedYear(e.target.value === 'all' ? 'all' : Number(e.target.value));
                          setCurrentIndex(0);
                          setCompareIndex(1);
                        }}
                        className={`${colors.inputBg} border ${colors.borderLight} rounded-lg px-3 py-2 ${colors.text} focus:outline-none focus:border-blue-500 transition-colors text-sm`}
                      >
                        <option value="all">All Years</option>
                        {loadedYears.map(yr => (
                          <option key={yr} value={yr}>{yr}</option>
                        ))}
                      </select>
                    </label>
                  )}

                  {!comparisonMode && currentPlayer && (
                    <button
                      onClick={handleFindSimilarPlayers}
                      className={`text-sm px-3 py-2 ${colors.inputBg} border ${colors.borderLight} rounded-lg ${colors.hover} ${colors.text} flex items-center gap-2 transition-colors`}
                      title="Find similar players"
                    >
                      <Users className="w-4 h-4" />
                      Find Similar
                    </button>
                  )}

                  {!comparisonMode && currentPositionConfig.compositeScoreConfig && (
                    <button
                      onClick={() => setShowTop10Modal(true)}
                      className={`text-sm px-3 py-2 ${colors.inputBg} border ${colors.borderLight} rounded-lg ${colors.hover} ${colors.text} flex items-center gap-2 transition-colors`}
                      title="View top 10 players"
                    >
                      <Trophy className="w-4 h-4" />
                      Top 10
                    </button>
                  )}

                  {/* Team Filter */}
                  {availableTeams.length > 0 && (
                    <label className="text-sm flex items-center gap-2">
                      <span className={colors.textMuted}>Team:</span>
                      <select
                        value={selectedTeam}
                        onChange={(e) => {
                          setSelectedTeam(e.target.value);
                          setCurrentIndex(0);
                          setCompareIndex(1);
                        }}
                        className={`${colors.inputBg} border ${colors.borderLight} rounded-lg px-3 py-2 ${colors.text} focus:outline-none focus:border-blue-500 transition-colors text-sm`}
                      >
                        <option value="">All Teams</option>
                        {availableTeams.map(team => (
                          <option key={team} value={team}>{team}</option>
                        ))}
                      </select>
                    </label>
                  )}

                  {/* Conference Filter */}
                  {availableConferences.length > 0 && (
                    <label className="text-sm flex items-center gap-2">
                      <span className={colors.textMuted}>Conference:</span>
                      <select
                        value={selectedConference}
                        onChange={(e) => {
                          setSelectedConference(e.target.value);
                          setCurrentIndex(0);
                          setCompareIndex(1);
                        }}
                        className={`${colors.inputBg} border ${colors.borderLight} rounded-lg px-3 py-2 ${colors.text} focus:outline-none focus:border-blue-500 transition-colors text-sm`}
                      >
                        <option value="">All Conferences</option>
                        {availableConferences.map(conf => (
                          <option key={conf} value={conf}>{conf}</option>
                        ))}
                      </select>
                    </label>
                  )}

                  {currentPositionConfig.compositeScoreConfig && (
                    <label className="flex items-center gap-2 cursor-pointer text-sm group">
                      <input
                        type="checkbox"
                        checked={showTopTenPercent}
                        onChange={(e) => setShowTopTenPercent(e.target.checked)}
                        className="w-4 h-4 rounded"
                      />
                      <span className={`${colors.textSecondary} group-hover:${colors.text} transition-colors`}>Top 10% Only</span>
                    </label>
                  )}

                  <label className="flex items-center gap-2 cursor-pointer text-sm group">
                    <input
                      type="checkbox"
                      checked={showFavoritesOnly}
                      onChange={(e) => setShowFavoritesOnly(e.target.checked)}
                      className="w-4 h-4 rounded"
                    />
                    <span className={`${colors.textSecondary} group-hover:${colors.text} transition-colors flex items-center gap-1`}>
                      <Star size={14} fill={showFavoritesOnly ? "#fbbf24" : "none"} stroke={showFavoritesOnly ? "#fbbf24" : "currentColor"} />
                      Favorites Only {favorites.length > 0 && `(${favorites.length})`}
                    </span>
                  </label>

                  <span className={`text-sm ${colors.textMuted} ${theme === 'dark' ? 'bg-slate-700/30' : 'bg-gray-200'} px-3 py-2 rounded-lg`}>
                    {showTopTenPercent
                      ? `${qualifiedPlayers.length} of ${allQualifiedPlayers.length} players (top 10%)`
                      : `${qualifiedPlayers.length} qualified players`
                    }
                  </span>
                  
                  {/* Clear Filters Button */}
                  {(selectedTeam || selectedConference || minUsage !== currentPositionConfig.minUsage || showTopTenPercent || showFavoritesOnly) && (
                    <button
                      onClick={clearFilters}
                      className="text-sm px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/50 rounded-lg transition-colors"
                      title="Clear all filters"
                    >
                      Clear Filters
                    </button>
                  )}

                  {/* Keyboard Shortcuts Button */}
                  <button
                    onClick={() => setShowKeyboardTooltip(true)}
                    className={`w-7 h-7 rounded-lg ${colors.inputBg} ${colors.hover} border ${colors.borderLight} flex items-center justify-center cursor-pointer transition-colors`}
                    title="Keyboard shortcuts (press ?)"
                  >
                    <span className={`text-xs font-bold ${colors.textMuted}`}>⌨</span>
                  </button>
                </div>
                <div className="flex items-center gap-1">
                  <span className={`text-sm font-semibold ${colors.textMuted} mr-1`}>Mode:</span>
                  {[
                    { id: 'none', label: 'Single Player' },
                    { id: 'player', label: 'Player vs Player' },
                    { id: 'cohort', label: `Player vs Drafted ${selectedPosition}s`, disabled: !draftData },
                  ].map(({ id, label, disabled }) => {
                    const active = id === 'player' ? comparisonMode : id === 'cohort' ? cohortCompareMode : (!comparisonMode && !cohortCompareMode);
                    return (
                      <button
                        key={id}
                        disabled={disabled}
                        onClick={() => {
                          setComparisonMode(id === 'player');
                          setCohortCompareMode(id === 'cohort');
                        }}
                        className={`text-sm px-3 py-1.5 rounded-lg border transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                          active
                            ? 'bg-blue-500 border-blue-500 text-white font-semibold'
                            : `${colors.inputBg} ${colors.borderLight} ${colors.textMuted} ${colors.hover}`
                        }`}
                        title={disabled ? 'Draft data loading…' : undefined}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="relative z-[100]">
                  <label className="text-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`${colors.textMuted} font-medium`}>Player 1:</span>
                      {loadedYears.length > 1 && comparisonMode && (
                        <select
                          value={selectedYear}
                          onChange={(e) => {
                            setSelectedYear(e.target.value === 'all' ? 'all' : Number(e.target.value));
                            setCurrentIndex(0);
                          }}
                          className={`${colors.inputBg} border ${colors.borderLight} rounded-lg px-2 py-1 ${colors.text} text-xs focus:outline-none focus:border-blue-500 transition-colors`}
                        >
                          <option value="all">All Years</option>
                          {loadedYears.map(yr => <option key={yr} value={yr}>{yr}</option>)}
                        </select>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
                        disabled={currentIndex === 0}
                        className={`px-3 py-3 ${colors.inputBg} border ${colors.borderLight} rounded-lg ${colors.text} ${colors.hover} disabled:opacity-30 disabled:cursor-not-allowed transition-colors`}
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
                          theme={theme}
                        />
                      </div>
                      <button
                        onClick={() => setCurrentIndex(Math.min(qualifiedPlayers.length - 1, currentIndex + 1))}
                        disabled={currentIndex === qualifiedPlayers.length - 1}
                        className={`px-3 py-3 ${colors.inputBg} border ${colors.borderLight} rounded-lg ${colors.text} ${colors.hover} disabled:opacity-30 disabled:cursor-not-allowed transition-colors`}
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
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`${colors.textMuted} font-medium`}>Player 2:</span>
                        {loadedYears.length > 1 && (
                          <select
                            value={compareYear}
                            onChange={(e) => {
                              setCompareYear(e.target.value === 'all' ? 'all' : Number(e.target.value));
                              setCompareIndex(0);
                            }}
                            className={`${colors.inputBg} border ${colors.borderLight} rounded-lg px-2 py-1 ${colors.text} text-xs focus:outline-none focus:border-blue-500 transition-colors`}
                          >
                            <option value="all">All Years</option>
                            {loadedYears.map(yr => <option key={yr} value={yr}>{yr}</option>)}
                          </select>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setCompareIndex(Math.max(0, compareIndex - 1))}
                          disabled={compareIndex === 0}
                          className={`px-3 py-3 ${colors.inputBg} border ${colors.borderLight} rounded-lg ${colors.text} ${colors.hover} disabled:opacity-30 disabled:cursor-not-allowed transition-colors`}
                          title="Previous player"
                        >
                          ←
                        </button>
                        <div className="flex-1">
                          <SearchableSelect
                            value={compareIndex}
                            onChange={setCompareIndex}
                            options={comparePlayers.map((player, idx) => ({
                              value: idx,
                              label: `${player.player} - ${normalizeTeamName(player.team_name)}`,
                              playerName: player.player,
                              teamName: normalizeTeamName(player.team_name)
                            }))}
                            placeholder="Search players..."
                            theme={theme}
                          />
                        </div>
                        <button
                          onClick={() => setCompareIndex(Math.min(comparePlayers.length - 1, compareIndex + 1))}
                          disabled={compareIndex === comparePlayers.length - 1}
                          className={`px-3 py-3 ${colors.inputBg} border ${colors.borderLight} rounded-lg ${colors.text} ${colors.hover} disabled:opacity-30 disabled:cursor-not-allowed transition-colors`}
                          title="Next player"
                        >
                          →
                        </button>
                      </div>
                    </label>
                  </div>
                )}

                {cohortCompareMode && draftData && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`${colors.textMuted} font-medium text-sm`}>Draft Cohort:</span>
                      <div className="flex gap-1">
                        {[
                          { id: '1', label: '1st Round' },
                          { id: '2-3', label: 'Day 2 (Rds 2–3)' },
                          { id: '4+', label: 'Day 3 (Rds 4–7)' },
                        ].map(({ id, label }) => (
                          <button
                            key={id}
                            onClick={() => setSelectedCompareCohort(id)}
                            className={`text-sm px-3 py-1.5 rounded-lg border transition-colors ${
                              selectedCompareCohort === id
                                ? 'bg-blue-500 border-blue-500 text-white font-semibold'
                                : `${colors.inputBg} ${colors.borderLight} ${colors.textMuted} ${colors.hover}`
                            }`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                      {cohortPool !== null && (
                        <span className={`text-xs ${colors.textMuted}`}>
                          ({cohortPool.length} players in pool)
                        </span>
                      )}
                    </div>
                    {cohortPool !== null && cohortPool.length === 0 && (
                      <p className="text-xs text-yellow-400">No players matched this cohort in the loaded data. Try loading more seasons.</p>
                    )}
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
                  className="px-12 py-10 text-center relative"
                  style={{
                    background: comparisonMode
                      ? 'linear-gradient(to bottom, rgba(0,0,0,0.03), transparent)'
                      : `linear-gradient(to bottom, ${secondaryColor}30, transparent)`
                  }}
                >
                  <div className="absolute top-4 right-4 flex flex-col gap-2">
                    <div className="flex gap-2 download-button-hide">
                      <button
                        onClick={copyChartToClipboard}
                        className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg px-3 py-2 flex items-center gap-2 transition-all"
                        style={{ color: textColor }}
                        title="Copy to clipboard"
                      >
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        <span className="text-sm font-medium">{copied ? 'Copied!' : 'Copy'}</span>
                      </button>
                      <button
                        onClick={downloadChartAsPNG}
                        className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg px-3 py-2 flex items-center gap-2 transition-all"
                        style={{ color: textColor }}
                        title="Download as PNG"
                      >
                        <Download className="w-4 h-4" />
                        <span className="text-sm font-medium">Download PNG</span>
                      </button>
                    </div>
                  </div>
                  {comparisonMode && comparePlayer ? (
                    <div>
                      <h2 className="text-5xl font-bold mb-8 leading-tight" style={{ color: textColor, lineHeight: '1.2' }}>Player Comparison</h2>
                      <div className="flex justify-center gap-12 mb-8">
                        <div className="text-left">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: primaryColor }}></div>
                            <h3 className="text-3xl font-bold leading-tight" style={{ color: primaryColor, lineHeight: '1.2' }}>{currentPlayer.player}</h3>
                          </div>
                          <p className="text-lg ml-7 leading-relaxed" style={{ opacity: 0.85, color: textColor, fontWeight: 500, lineHeight: '1.5' }}>{normalizeTeamName(currentPlayer.team_name)}</p>
                          {(currentPlayer.position || currentPlayer.pos) && (
                            <p className="text-sm ml-7 mt-2 leading-normal" style={{ opacity: 0.8, color: textColor, fontWeight: 600, lineHeight: '1.6' }}>
                              {(currentPlayer.position || currentPlayer.pos).toUpperCase()}
                            </p>
                          )}
                          {(currentPlayer.height || currentPlayer.weight || currentPlayer.year) && (
                            <p className="text-sm ml-7 mt-2 leading-normal" style={{ opacity: 0.7, color: textColor, lineHeight: '1.6' }}>
                              {currentPlayer.height && `${currentPlayer.height}"`}
                              {currentPlayer.height && currentPlayer.weight && ' • '}
                              {currentPlayer.weight && `${currentPlayer.weight} lbs`}
                              {(currentPlayer.height || currentPlayer.weight) && currentPlayer.year && ' • '}
                              {currentPlayer.year}
                            </p>
                          )}
                          {currentPlayer.season && comparePlayer.season && currentPlayer.season !== comparePlayer.season && (
                            <p className="text-sm ml-7 mt-1 leading-normal font-semibold" style={{ opacity: 0.9, color: primaryColor, lineHeight: '1.6' }}>
                              {currentPlayer.season} Season
                            </p>
                          )}
                        </div>
                        <div className="flex items-center text-3xl opacity-50 font-bold leading-none" style={{ color: textColor, lineHeight: '1' }}>vs</div>
                        <div className="text-left">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: player2Color }}></div>
                            <h3 className="text-3xl font-bold leading-tight" style={{ color: player2Color, lineHeight: '1.2' }}>{comparePlayer.player}</h3>
                          </div>
                          <p className="text-lg ml-7 leading-relaxed" style={{ opacity: 0.85, color: textColor, fontWeight: 500, lineHeight: '1.5' }}>{normalizeTeamName(comparePlayer.team_name)}</p>
                          {(comparePlayer.position || comparePlayer.pos) && (
                            <p className="text-sm ml-7 mt-2 leading-normal" style={{ opacity: 0.8, color: textColor, fontWeight: 600, lineHeight: '1.6' }}>
                              {(comparePlayer.position || comparePlayer.pos).toUpperCase()}
                            </p>
                          )}
                          {(comparePlayer.height || comparePlayer.weight || comparePlayer.year) && (
                            <p className="text-sm ml-7 mt-2 leading-normal" style={{ opacity: 0.7, color: textColor, lineHeight: '1.6' }}>
                              {comparePlayer.height && `${comparePlayer.height}"`}
                              {comparePlayer.height && comparePlayer.weight && ' • '}
                              {comparePlayer.weight && `${comparePlayer.weight} lbs`}
                              {(comparePlayer.height || comparePlayer.weight) && comparePlayer.year && ' • '}
                              {comparePlayer.year}
                            </p>
                          )}
                          {currentPlayer.season && comparePlayer.season && currentPlayer.season !== comparePlayer.season && (
                            <p className="text-sm ml-7 mt-1 leading-normal font-semibold" style={{ opacity: 0.9, color: player2Color, lineHeight: '1.6' }}>
                              {comparePlayer.season} Season
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center justify-center gap-4 mb-3">
                        <h2 className="text-7xl font-bold leading-tight" style={{ color: secondaryColor, lineHeight: '1.1' }}>{currentPlayer.player}</h2>
                        <button
                          onClick={() => toggleFavorite(currentPlayer.player)}
                          className="transition-all hover:scale-110 active:scale-95"
                          title={favorites.includes(currentPlayer.player) ? "Remove from favorites" : "Add to favorites"}
                        >
                          <Star
                            size={48}
                            fill={favorites.includes(currentPlayer.player) ? "#fbbf24" : "none"}
                            stroke={favorites.includes(currentPlayer.player) ? "#fbbf24" : textColor}
                            strokeWidth={2}
                          />
                        </button>
                      </div>
                      <p className="text-2xl font-medium leading-relaxed" style={{ opacity: 0.9, color: textColor, lineHeight: '1.5' }}>{normalizeTeamName(currentPlayer.team_name)}</p>
                      {(currentPlayer.position || currentPlayer.pos) && (
                        <p className="text-lg mt-2 leading-normal" style={{ opacity: 0.85, color: textColor, fontWeight: 600, lineHeight: '1.6' }}>
                          {(currentPlayer.position || currentPlayer.pos).toUpperCase()}
                        </p>
                      )}
                      {(currentPlayer.height || currentPlayer.weight || currentPlayer.year) && (
                        <p className="text-base mt-2 leading-normal" style={{ opacity: 0.75, color: textColor, lineHeight: '1.6' }}>
                          {currentPlayer.height && `${currentPlayer.height}"`}
                          {currentPlayer.height && currentPlayer.weight && ' • '}
                          {currentPlayer.weight && `${currentPlayer.weight} lbs`}
                          {(currentPlayer.height || currentPlayer.weight) && currentPlayer.year && ' • '}
                          {currentPlayer.year}
                        </p>
                      )}
                      {cohortCompareMode && cohortPool !== null && (
                        <p className="text-sm mt-3 font-semibold" style={{ opacity: 0.9, color: secondaryColor }}>
                          Normalized vs {selectedCompareCohort === '1' ? '1st Round' : selectedCompareCohort === '2-3' ? 'Day 2 (Rds 2–3)' : 'Day 3 (Rds 4–7)'} {selectedPosition}s ({cohortPool.length} players, all loaded seasons)
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div className="p-8 flex justify-center" style={{ backgroundColor: comparisonMode ? bgColor : `${primaryColor}dd` }}>
                  <ErrorBoundary>
                    <CustomRadarChart
                      data={radarData}
                      player1Color={comparisonMode ? primaryColor : secondaryColor}
                      player2Color={player2Color}
                      comparisonMode={comparisonMode}
                      invertedStats={currentPositionConfig.invertedStats}
                      statDescriptions={currentPositionConfig.descriptions || {}}
                    />
                  </ErrorBoundary>
                </div>

                
                {/* Credits */}
                <div className="px-6 py-4 text-center border-t" style={{
                  backgroundColor: comparisonMode ? bgColor : `${primaryColor}dd`,
                  borderColor: comparisonMode ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)'
                }}>
                  <p className="text-sm font-medium" style={{
                    color: textColor,
                    opacity: 0.7
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

      {/* Keyboard Shortcuts Guide */}
      {showKeyboardTooltip && (
        <KeyboardShortcutsGuide
          isOpen={showKeyboardTooltip}
          onClose={() => setShowKeyboardTooltip(false)}
        />
      )}

      {/* Similar Players Modal */}
      {showSimilarPlayers && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowSimilarPlayers(false)}
        >
          <div
            className={`${colors.bgSecondary} rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-auto border ${colors.border}`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className={`${colors.bgTertiary} px-6 py-4 border-b ${colors.border} sticky top-0 z-10 flex justify-between items-center`}>
              <div>
                <h2 className={`text-2xl font-bold ${colors.text}`}>Similar Players</h2>
                <p className={`text-sm ${colors.textMuted} mt-1`}>Players most similar to {currentPlayer?.player}</p>
              </div>
              <button
                onClick={() => setShowSimilarPlayers(false)}
                className={`${colors.hover} rounded-lg p-2 transition-colors`}
                title="Close"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {similarPlayers.length === 0 ? (
                <div className={`text-center py-12 ${colors.textMuted}`}>
                  <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>No similar players found</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {similarPlayers.map((similar, idx) => {
                    const player = similar.player;
                    const teamColors = getTeamColors(player.team_name);
                    const isFavorite = favorites.includes(player.player);

                    return (
                      <div
                        key={idx}
                        className={`${colors.cardBg} backdrop-blur-sm rounded-xl p-5 border ${colors.border} ${colors.hover} transition-all cursor-pointer`}
                        onClick={() => {
                          const playerIndex = qualifiedPlayers.findIndex(p => p.player === player.player);
                          if (playerIndex !== -1) {
                            setCurrentIndex(playerIndex);
                            setShowSimilarPlayers(false);
                          }
                        }}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className={`text-lg font-bold ${colors.textMuted}`}>#{idx + 1}</span>
                              <h3 className={`text-xl font-bold ${colors.text}`}>{player.player}</h3>
                              {isFavorite && (
                                <Star size={18} fill="#fbbf24" stroke="#fbbf24" />
                              )}
                            </div>
                            <div className="flex flex-wrap items-center gap-3 text-sm">
                              <span
                                className="font-semibold px-3 py-1 rounded-lg"
                                style={{
                                  backgroundColor: `${teamColors.primary}30`,
                                  color: teamColors.secondary
                                }}
                              >
                                {normalizeTeamName(player.team_name)}
                              </span>
                              {(player.position || player.pos) && (
                                <span className={`${colors.textSecondary} font-medium`}>
                                  {(player.position || player.pos).toUpperCase()}
                                </span>
                              )}
                              {player.height && (
                                <span className={`${colors.textMuted}`}>{player.height}"</span>
                              )}
                              {player.weight && (
                                <span className={`${colors.textMuted}`}>{player.weight} lbs</span>
                              )}
                              {player.year && (
                                <span className={`${colors.textMuted}`}>{player.year}</span>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-3xl font-bold" style={{ color: teamColors.primary }}>
                              {similar.similarityScore.toFixed(0)}%
                            </div>
                            <div className={`text-xs ${colors.textMuted}`}>similarity</div>
                          </div>
                        </div>

                        {/* Similarity Bar */}
                        <div className={`mt-4 h-2 ${theme === 'dark' ? 'bg-slate-700' : 'bg-gray-200'} rounded-full overflow-hidden`}>
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${similar.similarityScore}%`,
                              backgroundColor: teamColors.primary
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Footer */}
              <div className={`mt-6 pt-4 border-t ${colors.border}`}>
                <p className={`text-xs ${colors.textMuted} text-center`}>
                  Similarity calculated using Euclidean distance across all {currentPositionConfig.stats.length} stats
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Top 10 Players Modal */}
      {showTop10Modal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowTop10Modal(false)}
        >
          <div
            className={`${colors.bgSecondary} rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-auto border ${colors.border}`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className={`${colors.bgTertiary} px-6 py-4 border-b ${colors.border} sticky top-0 z-10 flex justify-between items-center`}>
              <div>
                <h2 className={`text-2xl font-bold ${colors.text}`}>Top 10 {selectedPosition} Players</h2>
                <p className={`text-sm ${colors.textMuted} mt-1`}>
                  {currentPositionConfig.compositeScoreConfig
                    ? 'Ranked by composite performance score'
                    : 'Top performers at this position'}
                </p>
              </div>
              <button
                onClick={() => setShowTop10Modal(false)}
                className={`${colors.hover} rounded-lg p-2 transition-colors`}
                title="Close"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {(() => {
                const top10 = getTop10Players();

                if (top10.length === 0) {
                  return (
                    <div className={`text-center py-12 ${colors.textMuted}`}>
                      <Trophy className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p>No players available</p>
                    </div>
                  );
                }

                return (
                  <div className="space-y-3">
                    {top10.map((item) => {
                      const player = item.player;
                      const teamColors = getTeamColors(player.team_name);
                      const isFavorite = favorites.includes(player.player);
                      const isCurrentPlayer = currentPlayer?.player === player.player;

                      return (
                        <div
                          key={item.rank}
                          className={`${colors.cardBg} backdrop-blur-sm rounded-xl p-5 border ${isCurrentPlayer ? 'border-yellow-500 border-2' : colors.border} ${colors.hover} transition-all cursor-pointer relative`}
                          onClick={() => {
                            const playerIndex = qualifiedPlayers.findIndex(p => p.player === player.player);
                            if (playerIndex !== -1) {
                              setCurrentIndex(playerIndex);
                              setShowTop10Modal(false);
                            }
                          }}
                        >
                          {/* Rank Badge */}
                          <div
                            className="absolute -top-3 -left-3 w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shadow-lg"
                            style={{
                              backgroundColor: item.rank === 1 ? '#FFD700' : item.rank === 2 ? '#C0C0C0' : item.rank === 3 ? '#CD7F32' : teamColors.primary,
                              color: item.rank <= 3 ? '#000' : '#FFF'
                            }}
                          >
                            {item.rank}
                          </div>

                          <div className="flex items-start justify-between gap-4 ml-6">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className={`text-xl font-bold ${colors.text}`}>{player.player}</h3>
                                {isFavorite && (
                                  <Star size={18} fill="#fbbf24" stroke="#fbbf24" />
                                )}
                                {isCurrentPlayer && (
                                  <span className="text-xs px-2 py-1 bg-yellow-500 text-black rounded-full font-semibold">
                                    VIEWING
                                  </span>
                                )}
                              </div>
                              <div className="flex flex-wrap items-center gap-3 text-sm">
                                <span
                                  className="font-semibold px-3 py-1 rounded-lg"
                                  style={{
                                    backgroundColor: `${teamColors.primary}30`,
                                    color: teamColors.secondary
                                  }}
                                >
                                  {normalizeTeamName(player.team_name)}
                                </span>
                                {(player.position || player.pos) && (
                                  <span className={`${colors.textSecondary} font-medium`}>
                                    {(player.position || player.pos).toUpperCase()}
                                  </span>
                                )}
                                {player.height && (
                                  <span className={`${colors.textMuted}`}>{player.height}"</span>
                                )}
                                {player.weight && (
                                  <span className={`${colors.textMuted}`}>{player.weight} lbs</span>
                                )}
                                {player.year && (
                                  <span className={`${colors.textMuted}`}>{player.year}</span>
                                )}
                              </div>

                              {/* Key Stats Preview */}
                              {currentPositionConfig.compositeScoreConfig && (
                                <div className="mt-3 flex flex-wrap gap-3">
                                  {currentPositionConfig.compositeScoreConfig.stats.slice(0, 3).map(({ stat }) => {
                                    const value = player[stat];
                                    if (value == null) return null;
                                    return (
                                      <div key={stat} className={`text-xs ${colors.textMuted}`}>
                                        <span className="font-semibold">{stat}:</span> {value.toFixed(1)}
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>

                            {item.compositeScore != null && (
                              <div className="text-right">
                                <div className="text-3xl font-bold" style={{ color: teamColors.primary }}>
                                  {item.compositeScore.toFixed(1)}
                                </div>
                                <div className={`text-xs ${colors.textMuted}`}>score</div>
                              </div>
                            )}
                          </div>

                          {/* Score Bar */}
                          {item.compositeScore != null && (
                            <div className={`mt-4 h-2 ${theme === 'dark' ? 'bg-slate-700' : 'bg-gray-200'} rounded-full overflow-hidden`}>
                              <div
                                className="h-full rounded-full transition-all"
                                style={{
                                  width: `${item.compositeScore}%`,
                                  backgroundColor: teamColors.primary
                                }}
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })()}

              {/* Footer */}
              {currentPositionConfig.compositeScoreConfig && (
                <div className={`mt-6 pt-4 border-t ${colors.border}`}>
                  <p className={`text-xs ${colors.textMuted} text-center`}>
                    Composite score based on weighted combination of {currentPositionConfig.compositeScoreConfig.stats.length} key stats
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default function App() {
  return (
    <ErrorBoundary>
      <MultiPositionRadarCharts />
    </ErrorBoundary>
  );
}
