import React from 'react';

interface PhoneConfirmationModalProps {
  phone: string;
  onConfirm: () => void;
  onEdit: () => void;
}

const PhoneConfirmationModal: React.FC<PhoneConfirmationModalProps> = ({ 
  phone, 
  onConfirm, 
  onEdit 
}) => {
  const formatPhoneForDisplay = (phone: string) => {
    const trimmed = phone.slice(0, 11);
    return `+${trimmed.slice(0, 1)} ${trimmed.slice(1, 4)} ${trimmed.slice(4, 7)} ${trimmed.slice(7, 9)} ${trimmed.slice(9, 11)}`;
  };

  const formattedPhone = formatPhoneForDisplay(phone);

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 animate-fade-in z-50">
      <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-xl animate-scale-in">
        <h3 className="text-xl font-bold text-center text-neutral-900 mb-2">
          Проверьте номер
        </h3>
        
        <div className="bg-neutral-50 p-4 rounded-xl mb-6">
          <p className="text-center font-mono text-2xl font-bold text-neutral-900 tracking-wider">
            {formattedPhone}
          </p>
        </div>
        
        <p className="text-neutral-600 text-center mb-6">
          К этому номеру будет привязан ваш аккаунт.<br />
          Убедитесь, что номер введён верно.
        </p>
        
        <div className="space-y-3">
          <button
            onClick={onConfirm}
            className="w-full h-12 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark active:scale-[0.98] transition-all"
          >
            Да, всё верно
          </button>
          <button
            onClick={onEdit}
            className="w-full h-12 border border-neutral-200 text-neutral-700 font-semibold rounded-xl hover:bg-neutral-50 transition-colors active:scale-[0.98]"
          >
            Вернуться и исправить
          </button>
        </div>
      </div>
    </div>
  );
};

export default PhoneConfirmationModal;
