import React from 'react';

interface SystemStatusBarProps {
  isBlocking: boolean;
  expiresAt: string | null;
  onLogout: () => void;
}

const SystemStatusBar: React.FC<SystemStatusBarProps> = ({ 
  isBlocking, 
  expiresAt, 
  onLogout 
}) => {
  const formatTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString('ru-RU', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch {
      return '';
    }
  };

  return (
    <div className="px-5 py-3 bg-white/90 backdrop-blur-md border-b border-neutral-200 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className={`w-3 h-3 rounded-full ${isBlocking ? 'bg-error' : 'bg-success'}`} />
        <div>
          <p className="text-sm font-medium text-neutral-900">
            {isBlocking ? 'Вы блокируете выезд' : 'Вы не блокируете'}
          </p>
          {expiresAt && (
            <p className="text-xs text-neutral-400">
              Активно до {formatTime(expiresAt)}
            </p>
          )}
        </div>
      </div>
      
      <button
        onClick={onLogout}
        className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
        title="Выйти"
      >
        <svg className="w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
      </button>
    </div>
  );
};

export default SystemStatusBar;
