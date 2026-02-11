import React, { useState } from 'react';

interface PhoneEntryScreenProps {
  onPhoneSubmit: (phone: string) => void;
}

const PhoneEntryScreen: React.FC<PhoneEntryScreenProps> = ({ onPhoneSubmit }) => {
  const [phone, setPhone] = useState('');
  const [isValid, setIsValid] = useState(false);

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    const trimmed = numbers.slice(0, 11);
    
    if (trimmed.length === 0) return '';
    if (trimmed.length === 1) return `+${trimmed}`;
    if (trimmed.length <= 4) return `+${trimmed.slice(0, 1)} ${trimmed.slice(1)}`;
    if (trimmed.length <= 7) return `+${trimmed.slice(0, 1)} ${trimmed.slice(1, 4)} ${trimmed.slice(4)}`;
    if (trimmed.length <= 9) return `+${trimmed.slice(0, 1)} ${trimmed.slice(1, 4)} ${trimmed.slice(4, 7)} ${trimmed.slice(7)}`;
    return `+${trimmed.slice(0, 1)} ${trimmed.slice(1, 4)} ${trimmed.slice(4, 7)} ${trimmed.slice(7, 9)} ${trimmed.slice(9, 11)}`;
  };

  const validatePhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.length === 11 && (numbers[0] === '7' || numbers[0] === '8');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    setPhone(raw);
    setIsValid(validatePhone(raw));
  };

  const maskedPhone = `+7 *** *** ${phone.slice(-4)}`;

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm animate-slide-up">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-neutral-900">
            Вход в ParkingSmart
          </h2>
          <p className="text-neutral-400 mt-2">
            Введите номер телефона
          </p>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-neutral-400 mb-2">
            Номер телефона
          </label>
          <input
            type="tel"
            value={formatPhone(phone)}
            onChange={handleChange}
            placeholder="+7 999 123 45 67"
            className="w-full h-14 px-4 text-lg bg-white border border-neutral-200 rounded-xl focus:border-primary focus:ring-0 transition-colors placeholder:text-neutral-300"
            autoFocus
          />
        </div>

        <button
          onClick={() => onPhoneSubmit(phone)}
          disabled={!isValid}
          className="w-full h-12 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark active:scale-[0.98] transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-primary disabled:active:scale-100"
        >
          Продолжить
        </button>

        <p className="text-xs text-neutral-400 text-center mt-6">
          Один номер телефона — один аккаунт.<br />
          Убедитесь, что номер введён правильно.
        </p>
      </div>
    </div>
  );
};

export default PhoneEntryScreen;
