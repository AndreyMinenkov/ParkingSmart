import React from 'react';

interface FloatingActionButtonProps {
  type: 'parking' | 'exit';
  onClick: () => void;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({ type, onClick }) => {
  const config = {
    parking: {
      icon: '�',
      label: '��Припарковаться',
      color: 'bg-primary hover:bg-primary-dark',
      shadow: 'shadow-lg',
      tooltip: 'Нажмите, чтобы отметить свою парковку'
    },
    exit: {
      icon: '�',
      label: '��Кто блокирует?',
      color: 'bg-error hover:bg-[#FF2D20]',
      shadow: 'shadow-lg shadow-error/30',
      tooltip: 'Нажмите, чтобы найти машины, которые блокируют выезд'
    }
  };

  return (
    <div className="absolute bottom-6 right-6 flex flex-col items-end gap-2">
      {/* Тултип с подсказкой */}
      <div className="bg-neutral-900 text-white text-sm px-4 py-2 rounded-lg shadow-md mb-2 max-w-[200px] text-right animate-fade-in">
        {config[type].tooltip}
        <div className="absolute bottom-[-6px] right-4 w-3 h-3 bg-neutral-900 transform rotate-45" />
      </div>
      
      {/* Основная кнопка */}
      <button
        onClick={onClick}
        className={`
          w-16 h-16 rounded-full 
          flex items-center justify-center 
          text-white text-2xl 
          transition-all duration-300 
          hover:scale-110 active:scale-95
          ${config[type].color} 
          ${config[type].shadow}
          shadow-xl
          relative
          group
        `}
        aria-label={config[type].label}
      >
        {config[type].icon}
        
        {/* Микро-анимация пульсации */}
        <span className="absolute inset-0 rounded-full animate-ping opacity-20 bg-current" />
      </button>
      
      {/* Текстовая подпись под кнопкой */}
      <span className="text-sm font-medium text-neutral-700 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm">
        {config[type].label}
      </span>
    </div>
  );
};

export default FloatingActionButton;
