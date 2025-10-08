import React, { useState, useEffect, useRef } from 'react';

const SearchableSelect = ({ value, onChange, options, placeholder = "Search players...", theme = 'dark' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  // Debounce search term for better performance
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300); // 300ms delay

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
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

  const themeColors = {
    dark: {
      buttonBg: 'bg-slate-700/50',
      buttonHoverBg: 'hover:bg-slate-700/70',
      buttonBorder: 'border-slate-600',
      buttonText: 'text-white',
      dropdownBg: 'bg-slate-800',
      dropdownBorder: 'border-slate-600',
      inputBg: 'bg-slate-700',
      inputBorder: 'border-slate-600',
      inputText: 'text-white',
      optionHoverBg: 'hover:bg-slate-700/50',
      optionText: 'text-white',
      optionSubText: 'text-gray-400',
      selectedBg: 'bg-blue-500/20',
      selectedText: 'text-blue-400',
      mutedText: 'text-gray-400',
      dividerBorder: 'border-slate-700',
    },
    light: {
      buttonBg: 'bg-gray-100',
      buttonHoverBg: 'hover:bg-gray-200',
      buttonBorder: 'border-gray-300',
      buttonText: 'text-gray-900',
      dropdownBg: 'bg-white',
      dropdownBorder: 'border-gray-300',
      inputBg: 'bg-gray-50',
      inputBorder: 'border-gray-300',
      inputText: 'text-gray-900',
      optionHoverBg: 'hover:bg-gray-100',
      optionText: 'text-gray-900',
      optionSubText: 'text-gray-600',
      selectedBg: 'bg-blue-100',
      selectedText: 'text-blue-600',
      mutedText: 'text-gray-600',
      dividerBorder: 'border-gray-200',
    }
  };

  const colors = themeColors[theme];

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Dropdown trigger button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full ${colors.buttonBg} border ${colors.buttonBorder} rounded-lg px-4 py-3 ${colors.buttonText} focus:outline-none focus:border-blue-500 transition-colors flex items-center justify-between ${colors.buttonHoverBg} relative z-[101]`}
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
        <div className={`absolute z-[200] w-full mt-2 ${colors.dropdownBg} border ${colors.dropdownBorder} rounded-lg shadow-2xl max-h-96 overflow-hidden`}>
          {/* Search input */}
          <div className={`p-3 border-b ${colors.dividerBorder} ${colors.dropdownBg}`}>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={placeholder}
              className={`w-full ${colors.inputBg} border ${colors.inputBorder} rounded-lg px-3 py-2 ${colors.inputText} placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors text-sm`}
              autoFocus
            />
          </div>

          {/* Options list */}
          <div className={`overflow-y-auto max-h-80 ${colors.dropdownBg}`}>
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
                  className={`w-full text-left px-4 py-2.5 ${colors.optionHoverBg} transition-colors relative z-[201] ${
                    option.value === value ? `${colors.selectedBg} ${colors.selectedText}` : colors.optionText
                  }`}
                >
                  <div className="font-medium pointer-events-none">{option.playerName}</div>
                  <div className={`text-xs ${colors.optionSubText} mt-0.5 pointer-events-none`}>{option.teamName}</div>
                </button>
              ))
            ) : (
              <div className={`px-4 py-8 text-center ${colors.mutedText} text-sm`}>
                {searchTerm && !debouncedSearchTerm ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <span>Searching...</span>
                  </div>
                ) : (
                  `No players found matching "${debouncedSearchTerm}"`
                )}
              </div>
            )}
          </div>

          {/* Results count */}
          {debouncedSearchTerm && (
            <div className={`px-4 py-2 border-t ${colors.dividerBorder} ${colors.dropdownBg} text-xs ${colors.mutedText}`}>
              {searchTerm !== debouncedSearchTerm ? (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <span>Searching...</span>
                </div>
              ) : (
                `${filteredOptions.length} player${filteredOptions.length !== 1 ? 's' : ''} found`
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;
