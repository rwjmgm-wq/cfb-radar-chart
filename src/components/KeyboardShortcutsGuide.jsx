import React from 'react';

const KeyboardShortcutsGuide = ({ isOpen, onClose }) => {

  const shortcuts = [
    {
      keys: ['←', '→'],
      description: 'Navigate between players',
      category: 'Navigation'
    },
    {
      keys: ['Shift', '←/→'],
      description: 'Navigate comparison player (when in compare mode)',
      category: 'Navigation'
    },
    {
      keys: ['C'],
      description: 'Toggle comparison mode',
      category: 'Actions'
    }
  ];

  const categories = [...new Set(shortcuts.map(s => s.category))];

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={onClose}
        >
          <div
            className="bg-slate-800 border border-slate-600 rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-blue-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                    />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-white">Keyboard Shortcuts</h2>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-700 text-gray-400 hover:text-white transition-colors"
                aria-label="Close"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {categories.map((category) => (
                <div key={category} className="mb-6 last:mb-0">
                  <h3 className="text-sm font-semibold text-blue-400 mb-3 uppercase tracking-wider">
                    {category}
                  </h3>
                  <div className="space-y-2">
                    {shortcuts
                      .filter((s) => s.category === category)
                      .map((shortcut, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between py-3 px-4 bg-slate-900/50 rounded-lg border border-slate-700/50"
                        >
                          <span className="text-gray-300 text-sm">
                            {shortcut.description}
                          </span>
                          <div className="flex items-center gap-1">
                            {shortcut.keys.map((key, keyIdx) => (
                              <React.Fragment key={keyIdx}>
                                {keyIdx > 0 && shortcut.keys.length > 1 && key !== '←/→' && (
                                  <span className="text-gray-500 text-xs mx-1">+</span>
                                )}
                                <kbd className="px-2.5 py-1.5 bg-slate-700 border border-slate-600 rounded text-xs font-mono text-white shadow-sm min-w-[2rem] text-center">
                                  {key}
                                </kbd>
                              </React.Fragment>
                            ))}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              ))}

              {/* Pro tip */}
              <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 flex-shrink-0 mt-0.5">
                    <svg
                      className="w-5 h-5 text-blue-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-blue-300 mb-1">Pro Tip</p>
                    <p className="text-xs text-blue-200/80">
                      Keyboard shortcuts won't work when you're typing in search boxes or other input fields.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-slate-900/50 border-t border-slate-700 flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
  );
};

export default KeyboardShortcutsGuide;
