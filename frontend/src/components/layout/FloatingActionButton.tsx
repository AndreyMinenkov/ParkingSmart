import React from 'react';

interface FloatingActionButtonProps {
  type: 'parking' | 'exit';
  onClick: () => void;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({ type, onClick }) => {
  const config = {
    parking: {
      icon: '🚗',
      label: 'Припарковаться',
      color: 'bg-primary hover:bg-primary-dark'
    },
    exit: {
      icon: '🔍',
      label: 'Кто блокирует?',
      color: 'bg-error hover:bg-[#FF2D20]'
    }
  };

  return (
    <button
      onClick={onClick}
      className={`absolute bottom-6 right-6 w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-white text-xl transition-all duration-300 hover:scale-110 active:scale-95 ${config[type].color}`}
      aria-label={config[type].label}
    >
      {config[type].icon}
    </button>
  );
};

export default FloatingActionButton;
