import React, { useState, useEffect, useRef } from 'react';
import { Upload, Download, X, Loader2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import SearchableSelect from './components/SearchableSelect';
import CustomRadarChart from './components/CustomRadarChart';
import ErrorBoundary from './components/ErrorBoundary';
import KeyboardShortcutsGuide from './components/KeyboardShortcutsGuide';
import { normalizeTeamName, getTeamColors } from './utils/teamUtils';
import POSITION_CONFIGS from './config/positionConfigs';

function MultiPositionRadarCharts() {
  const [selectedPosition, setSelectedPosition] = useState('QB');
  const [globalData, setGlobalData] = useState(null);
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

  const currentPositionConfig = POSITION_CONFIGS[selectedPosition];
  const currentData = globalData;

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
      const savedData = localStorage.getItem('cfb_radar_data');
      const savedStats = localStorage.getItem('cfb_radar_stats');

      if (savedData) {
        const parsedData = JSON.parse(savedData);
        setGlobalData(parsedData);
        console.log('✓ Loaded', parsedData.length, 'players from localStorage');
        setUploadProgress(`✓ Restored ${parsedData.length} players from previous session`);
        setTimeout(() => setUploadProgress(''), 4000);
      }

      if (savedStats) {
        const parsedStats = JSON.parse(savedStats);
        setDataStats(parsedStats);
        console.log('✓ Loaded stats from localStorage');
      }
    } catch (e) {
      console.warn('Failed to load from localStorage:', e);
      // Clear corrupted data
      localStorage.removeItem('cfb_radar_data');
      localStorage.removeItem('cfb_radar_stats');
    }
  }, []);

  const handlePositionSelect = (position) => {
    setSelectedPosition(position);
    setCurrentIndex(0);
    setCompareIndex(1);
    setComparisonMode(false);
    setMinUsage(POSITION_CONFIGS[position].minUsage);
    setSelectedTeam('');
    setSelectedConference('');
  };

  const clearFilters = () => {
    setSelectedTeam('');
    setSelectedConference('');
    setMinUsage(currentPositionConfig.minUsage);
    setShowTopTenPercent(false);
    setCurrentIndex(0);
    setCompareIndex(1);
  };

  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    setIsUploadingFiles(true);
    const fileNames = files.map(f => f.name).join(', ');
    setUploadProgress(`Parsing ${files.length} file${files.length > 1 ? 's' : ''}: ${fileNames}`);

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

          // Validate that file has a player name column
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

      const mergedData = {};
      
      if (globalData) {
        globalData.forEach(player => {
          mergedData[player.player] = { ...player };
        });
      }
      
      parsedFiles.forEach(csvData => {
        csvData.forEach(row => {
          const playerName = row.player || row.name;
          if (!playerName) return;

          const playerPosition = (row.position || row.pos || '').toUpperCase().trim();
          
          if (!mergedData[playerName]) {
            mergedData[playerName] = {
              ...row,
              player: playerName,
              height: row.ht || row.height,
              weight: row.wt || row.weight,
              year: row.yr || row.year
            };
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

            if (row.ht) mergedData[playerName].height = row.ht;
            if (row.wt) mergedData[playerName].weight = row.wt;
            if (row.yr) mergedData[playerName].year = row.yr;
          }
        });
      });

      // Merge with auto-loaded player metadata (height, weight, year, position)
      Object.keys(mergedData).forEach(playerName => {
        if (playerMetadata[playerName]) {
          if (!mergedData[playerName].height && playerMetadata[playerName].height) {
            mergedData[playerName].height = playerMetadata[playerName].height;
          }
          if (!mergedData[playerName].weight && playerMetadata[playerName].weight) {
            mergedData[playerName].weight = playerMetadata[playerName].weight;
          }
          if (!mergedData[playerName].year && playerMetadata[playerName].year) {
            mergedData[playerName].year = playerMetadata[playerName].year;
          }
          if (!mergedData[playerName].position && !mergedData[playerName].pos && playerMetadata[playerName].position) {
            mergedData[playerName].position = playerMetadata[playerName].position;
          }
        }
      });

      const merged = Object.values(mergedData);

      // Calculate statistics
      const positionBreakdown = {};
      const withMetadata = merged.filter(p => p.height || p.weight || p.year).length;
      merged.forEach(player => {
        const pos = (player.position || player.pos || 'Unknown').toUpperCase();
        positionBreakdown[pos] = (positionBreakdown[pos] || 0) + 1;
      });

      const topPositions = Object.entries(positionBreakdown)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([pos, count]) => `${count} ${pos}`)
        .join(', ');

      let successMessage = `✓ Loaded ${merged.length} players successfully! (${topPositions}) • ${withMetadata} with height/weight/year data`;

      if (fileValidation.length > 0) {
        console.warn('File validation warnings:', fileValidation);
        successMessage += ' | ⚠️ ' + fileValidation.join(', ');
      }

      setUploadProgress(successMessage);

      console.log('Parsed data sample:', merged[0]);
      console.log('Total players:', merged.length);
      console.log('Position breakdown:', positionBreakdown);
      console.log('Players with metadata:', withMetadata);

      // Save statistics for display
      setDataStats({
        totalPlayers: merged.length,
        positionBreakdown,
        withMetadata,
        topPositions
      });

      setGlobalData(merged);
      setCurrentIndex(0);
      setCompareIndex(1);

      // Save to localStorage
      try {
        localStorage.setItem('cfb_radar_data', JSON.stringify(merged));
        localStorage.setItem('cfb_radar_stats', JSON.stringify({
          totalPlayers: merged.length,
          positionBreakdown,
          withMetadata,
          topPositions
        }));
        console.log('Data saved to localStorage');
      } catch (e) {
        console.warn('Failed to save to localStorage:', e);
      }

      // Clear success message after 5 seconds (more time to read detailed info)
      setTimeout(() => {
        setUploadProgress('');
        setIsUploadingFiles(false);
      }, 5000);
    } catch (error) {
      console.error('Error parsing CSVs:', error);
      const errorMsg = error.message || 'Unknown error';
      setUploadProgress(`✗ Error: ${errorMsg}. Please check the CSV format and try again.`);
      setIsUploadingFiles(false);
      setTimeout(() => setUploadProgress(''), 7000);
    }
  };

  const clearAllData = () => {
    setGlobalData(null);
    setDataStats(null);
    setCurrentIndex(0);
    setCompareIndex(1);

    // Clear localStorage
    try {
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

  // Extract unique teams and conferences for filtering
  const availableTeams = currentData
    ? [...new Set(currentData.map(p => p.team).filter(Boolean))].sort()
    : [];

  const availableConferences = currentData
    ? [...new Set(currentData.map(p => p.conference).filter(Boolean))].sort()
    : [];

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

        {/* Upload Section - Shows when no data */}
        {!globalData ? (
          <div className="max-w-2xl mx-auto">
            {/* Loading Metadata Indicator */}
            {isLoadingMetadata && (
              <div className="mb-6 bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 flex items-center gap-3">
                <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
                <span className="text-blue-300 text-sm">Loading player metadata...</span>
              </div>
            )}

            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-12 border-2 border-dashed border-slate-600 hover:border-slate-500 transition-colors text-center">
              {isUploadingFiles ? (
                <Loader2 className="w-20 h-20 mx-auto mb-6 text-blue-400 animate-spin" />
              ) : (
                <Upload className="w-20 h-20 mx-auto mb-6 text-slate-500" />
              )}
              <div className="flex items-center justify-center gap-2 mb-3">
                <h2 className="text-2xl font-bold">{isUploadingFiles ? 'Processing...' : 'Upload Your Data'}</h2>
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
              {uploadProgress ? (
                <div className={`mb-4 px-4 py-3 rounded-lg text-sm ${uploadProgress.includes('Error') || uploadProgress.includes('✗') ? 'bg-red-500/10 border border-red-500/30 text-red-300' : uploadProgress.includes('success') || uploadProgress.includes('✓') ? 'bg-green-500/10 border border-green-500/30 text-green-300' : 'bg-blue-500/10 border border-blue-500/30 text-blue-300'}`}>
                  <div className="break-words whitespace-pre-wrap">{uploadProgress}</div>
                </div>
              ) : (
                <p className={`${colors.textMuted} mb-4`}>
                  Select one or more CSV files containing player statistics
                </p>
              )}
              <label className={`cursor-pointer inline-block ${isUploadingFiles ? 'opacity-50 pointer-events-none' : ''}`}>
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
              <p className={`text-sm ${colors.textMuted} mt-4`}>
                Files will be merged by player name • Data works across all positions
              </p>
            </div>

            <div className={`mt-8 ${theme === 'dark' ? 'bg-slate-800/30 border-slate-700/30' : 'bg-gray-100 border-gray-200'} rounded-xl p-6 border`}>
              <h3 className={`text-sm font-semibold ${colors.textSecondary} mb-3`}>How it works:</h3>
              <ul className={`space-y-2 text-sm ${colors.textMuted}`}>
                <li>• Upload your CSV files once (they can contain multiple position groups)</li>
                <li>• Data is automatically saved in your browser and persists on page refresh</li>
                <li>• Nothing is uploaded to a server - all data stays local</li>
                <li>• Switch between positions without re-uploading</li>
                <li>• Compare players, filter by stats, and download visualizations</li>
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
                  <span className={`text-sm ${colors.textMuted} ${theme === 'dark' ? 'bg-slate-700/30' : 'bg-gray-200'} px-3 py-2 rounded-lg`}>
                    {showTopTenPercent
                      ? `${qualifiedPlayers.length} of ${allQualifiedPlayers.length} players (top 10%)`
                      : `${qualifiedPlayers.length} qualified players`
                    }
                  </span>
                  
                  {/* Clear Filters Button */}
                  {(selectedTeam || selectedConference || minUsage !== currentPositionConfig.minUsage || showTopTenPercent) && (
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
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={comparisonMode}
                    onChange={(e) => setComparisonMode(e.target.checked)}
                    className="w-4 h-4 rounded"
                  />
                  <span className={`text-sm font-semibold ${colors.textSecondary} group-hover:${colors.text} transition-colors`}>Compare Mode</span>
                </label>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="relative z-[100]">
                  <label className="text-sm">
                    <span className={`${colors.textMuted} mb-2 block font-medium`}>Player 1:</span>
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
                      <span className={`${colors.textMuted} mb-2 block font-medium`}>Player 2:</span>
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
                          onClick={() => setCompareIndex(Math.min(qualifiedPlayers.length - 1, compareIndex + 1))}
                          disabled={compareIndex === qualifiedPlayers.length - 1}
                          className={`px-3 py-3 ${colors.inputBg} border ${colors.borderLight} rounded-lg ${colors.text} ${colors.hover} disabled:opacity-30 disabled:cursor-not-allowed transition-colors`}
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
                  className="px-12 py-10 text-center relative"
                  style={{
                    background: comparisonMode
                      ? 'linear-gradient(to bottom, rgba(0,0,0,0.03), transparent)'
                      : `linear-gradient(to bottom, ${secondaryColor}30, transparent)`
                  }}
                >
                  <div className="absolute top-4 right-4 flex gap-2 download-button-hide">
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
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h2 className="text-7xl font-bold mb-3 leading-tight" style={{ color: secondaryColor, lineHeight: '1.1' }}>{currentPlayer.player}</h2>
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

                {/* Stats Comparison Table */}
                {comparisonMode && comparePlayer && (
                  <div className="px-8 pb-8" style={{ backgroundColor: comparisonMode ? bgColor : `${primaryColor}dd` }}>
                    <div className={`${colors.cardBg} backdrop-blur-sm rounded-xl overflow-hidden border ${colors.border} shadow-lg`}>
                      <div className={`${colors.bgTertiary} px-4 py-3 border-b ${colors.border}`}>
                        <h3 className={`text-sm font-bold ${colors.text} uppercase tracking-wide`}>Statistical Comparison</h3>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className={`${colors.bgSecondary} border-b ${colors.border}`}>
                            <tr>
                              <th className={`px-4 py-3 text-left text-xs font-semibold ${colors.textMuted} uppercase tracking-wider`}>Stat</th>
                              <th className={`px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider`} style={{ color: primaryColor }}>{currentPlayer.player.split(' ')[0]}</th>
                              <th className={`px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider`} style={{ color: player2Color }}>{comparePlayer.player.split(' ')[0]}</th>
                              <th className={`px-4 py-3 text-center text-xs font-semibold ${colors.textMuted} uppercase tracking-wider`}>Difference</th>
                            </tr>
                          </thead>
                          <tbody className={`${colors.bgSecondary} divide-y ${colors.border}`}>
                            {radarData.map((stat, idx) => {
                              const value1 = stat.value1 ?? 0;
                              const value2 = stat.value2 ?? 0;
                              const diff = value1 - value2;
                              const isInverted = currentPositionConfig.invertedStats?.includes(stat.statKey);
                              const player1Better = isInverted ? diff < 0 : diff > 0;

                              return (
                                <tr key={idx} className={`${colors.hover} transition-colors`}>
                                  <td className={`px-4 py-3 text-sm font-medium ${colors.text}`}>{stat.stat}</td>
                                  <td className={`px-4 py-3 text-right text-sm font-semibold`} style={{
                                    color: primaryColor,
                                    fontWeight: player1Better ? 700 : 400
                                  }}>
                                    {value1.toFixed(1)}
                                  </td>
                                  <td className={`px-4 py-3 text-right text-sm font-semibold`} style={{
                                    color: player2Color,
                                    fontWeight: !player1Better ? 700 : 400
                                  }}>
                                    {value2.toFixed(1)}
                                  </td>
                                  <td className={`px-4 py-3 text-center text-sm ${colors.textMuted}`}>
                                    {diff > 0 ? '+' : ''}{diff.toFixed(1)}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
                
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
