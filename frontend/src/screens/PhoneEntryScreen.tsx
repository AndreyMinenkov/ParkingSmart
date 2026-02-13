import React, { useState, useEffect } from 'react';
import TermsCheckbox from '../components/legal/TermsCheckbox';
import { authAPI } from '../services/api';

interface PhoneEntryScreenProps {
  onPhoneSubmit: (phone: string) => void;
}

const PhoneEntryScreen: React.FC<PhoneEntryScreenProps> = ({ onPhoneSubmit }) => {
  const [phone, setPhone] = useState('');
  const [isTermsChecked, setIsTermsChecked] = useState(false);
  const [isCheckingUser, setIsCheckingUser] = useState(false);

  const formatPhone = (value: string) => {
    // Удаляем все нецифровые символы
    const digits = value.replace(/\D/g, '');
    
    // Ограничиваем 11 цифрами
    if (digits.length > 11) {
      return phone;
    }

    // Форматируем: +7 XXX XXX XX XX
    if (digits.length === 0) return '';
    if (digits.length <= 1) return `+7`;
    if (digits.length <= 4) {
      return `+7 ${digits.slice(1, 4)}`;
    }
    if (digits.length <= 7) {
      return `+7 ${digits.slice(1, 4)} ${digits.slice(4, 7)}`;
    }
    if (digits.length <= 9) {
      return `+7 ${digits.slice(1, 4)} ${digits.slice(4, 7)} ${digits.slice(7, 9)}`;
    }
    return `+7 ${digits.slice(1, 4)} ${digits.slice(4, 7)} ${digits.slice(7, 9)} ${digits.slice(9, 11)}`;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setPhone(formatted);
    
    // Сбрасываем чекбокс при изменении номера
    setIsTermsChecked(false);
  };

  // Проверяем, существует ли пользователь при вводе номера
  useEffect(() => {
    const checkUserExists = async () => {
      const digits = phone.replace(/\D/g, '');
      if (digits.length === 11) {
        setIsCheckingUser(true);
        try {
          // Пытаемся залогиниться - если пользователь существует, isNewUser будет false
          const response = await authAPI.loginOrRegister(digits);
          if (!response.data.isNewUser) {
            // Существующий пользователь - отмечаем чекбокс
            setIsTermsChecked(true);
          }
        } catch (error) {
          console.error('Ошибка проверки пользователя:', error);
        } finally {
          setIsCheckingUser(false);
        }
      }
    };

    // Дебаунс, чтобы не спамить запросами
    const timeoutId = setTimeout(checkUserExists, 500);
    return () => clearTimeout(timeoutId);
  }, [phone]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const digits = phone.replace(/\D/g, '');
    if (digits.length === 11 && isTermsChecked) {
      onPhoneSubmit(digits);
    }
  };

  const isValidPhone = phone.replace(/\D/g, '').length === 11;
  const isButtonEnabled = isValidPhone && isTermsChecked;

  return (
    <div className="min-h-screen bg-surface flex flex-col animate-fade-in">
      <div className="flex-1 flex flex-col justify-center px-6 max-w-md mx-auto w-full">
        <div className="mb-12">
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">
            Вход в ParkingSmart
          </h1>
          <p className="text-neutral-500 text-base">
            Введите номер телефона
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Номер телефона
            </label>
            <div className="relative">
              <input
                type="tel"
                value={phone}
                onChange={handleChange}
                placeholder="+7 XXX XXX XX XX"
                className="w-full h-14 px-4 bg-white border-2 border-neutral-200 rounded-xl 
                         text-lg font-mono tracking-wider
                         focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20
                         placeholder:text-neutral-400 transition-all"
                autoFocus
              />
              {isCheckingUser && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                </div>
              )}
            </div>
            <p className="text-xs text-neutral-400 mt-2">
              Номер должен содержать 11 цифр, начинаться с 7 или 8
            </p>
          </div>

          <TermsCheckbox 
            checked={isTermsChecked}
            onChange={setIsTermsChecked}
          />

          <button
            type="submit"
            disabled={!isButtonEnabled}
            className={`
              w-full h-14 rounded-xl font-semibold text-base
              transition-all duration-200
              ${isButtonEnabled
                ? 'bg-primary text-white active:scale-[0.98] shadow-lg hover:bg-primary-dark'
                : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
              }
            `}
          >
            Продолжить
          </button>
        </form>

        <p className="text-xs text-neutral-400 text-center mt-12 leading-relaxed">
          Один номер телефона — один аккаунт.<br />
          Убедитесь, что номер введён правильно.
        </p>
      </div>
    </div>
  );
};

export default PhoneEntryScreen;
