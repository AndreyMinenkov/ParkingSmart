import React, { useState, useEffect } from 'react';
import SplashScreen from './components/layout/SplashScreen';
import PhoneEntryScreen from './screens/PhoneEntryScreen';
import PhoneConfirmationModal from './components/auth/PhoneConfirmationModal';
import MainScreen from './screens/MainScreen';
import { authAPI } from './services/api';
import './index.css';

type AppState = 'splash' | 'phone' | 'confirm' | 'main';

function App() {
  const [appState, setAppState] = useState<AppState>('splash');
  const [pendingPhone, setPendingPhone] = useState<string>('');
  const [isNewUser, setIsNewUser] = useState<boolean>(false);

  // Проверяем, есть ли уже токен при загрузке
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setAppState('main');
    }
  }, []);

  const handleSplashComplete = () => {
    setAppState('phone');
  };

  const handlePhoneSubmit = async (phone: string) => {
    try {
      // Сначала проверяем, существует ли пользователь
      const response = await authAPI.loginOrRegister(phone);
      
      if (response.data.isNewUser) {
        // Новый пользователь - показываем подтверждение
        setPendingPhone(phone);
        setIsNewUser(true);
        setAppState('confirm');
      } else {
        // Существующий пользователь - логиним сразу
        const { token, user } = response.data;
        localStorage.setItem('token', token);
        setAppState('main');
      }
    } catch (error) {
      console.error('Ошибка авторизации:', error);
      alert('Ошибка при входе. Проверьте номер и попробуйте снова.');
      setAppState('phone');
    }
  };

  const handleConfirmPhone = async () => {
    try {
      // Для нового пользователя подтверждение уже не нужно,
      // просто логинимся с тем же номером
      const response = await authAPI.loginOrRegister(pendingPhone);
      const { token, user } = response.data;

      localStorage.setItem('token', token);
      setAppState('main');
    } catch (error) {
      console.error('Ошибка авторизации:', error);
      alert('Ошибка при входе. Проверьте номер и попробуйте снова.');
      setAppState('phone');
    }
  };

  const handleEditPhone = () => {
    setAppState('phone');
  };

  return (
    <>
      {appState === 'splash' && (
        <SplashScreen onComplete={handleSplashComplete} />
      )}

      {appState === 'phone' && (
        <PhoneEntryScreen onPhoneSubmit={handlePhoneSubmit} />
      )}

      {appState === 'confirm' && isNewUser && (
        <PhoneConfirmationModal
          phone={pendingPhone}
          onConfirm={handleConfirmPhone}
          onEdit={handleEditPhone}
        />
      )}

      {appState === 'main' && (
        <MainScreen />
      )}
    </>
  );
}

export default App;
