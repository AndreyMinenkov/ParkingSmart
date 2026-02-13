import React, { useState, useEffect } from 'react';
import { blockersAPI, callsAPI, parkingAPI } from '../services/api';

interface BlockersScreenProps {
  onClose: () => void;
}

const BlockersScreen: React.FC<BlockersScreenProps> = ({ onClose }) => {
  const [blockers, setBlockers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadBlockers = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // 1. Получаем координаты из активной парковки пользователя
      const parkingResponse = await parkingAPI.getCurrent();
      const parking = parkingResponse.data.parking;
      
      if (!parking) {
        setError('У вас нет активной парковки');
        return;
      }

      console.log('� ��Поиск блокирующих от парковки:', {
        lat: parking.lat,
        lon: parking.lon
      });

      // 2. Ищем блокирующих от этих координат
      const response = await blockersAPI.getNearby(
        parseFloat(parking.lat),
        parseFloat(parking.lon)
      );
      
      console.log('✅ Найдены блокирующие:', response.data);
      setBlockers(response.data.blockers || []);
      
    } catch (error: any) {
      console.error('❌ Ошибка загрузки блокирующих:', error);
      
      if (error.response?.status === 404) {
        setError('У вас нет активной парковки');
      } else {
        setError('Не удалось загрузить список блокирующих');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Форматирует номер для отображения: +7 903 221 9296
  const formatPhoneForDisplay = (phone: string): string => {
    // Удаляем все нецифровые символы
    const digits = phone.replace(/[^0-9]/g, '');
    
    // Для российских номеров (11 цифр, начинается с 7 или 8)
    if (digits.length === 11 && (digits.startsWith('7') || digits.startsWith('8'))) {
      const code = digits.slice(1, 4);
      const first = digits.slice(4, 7);
      const second = digits.slice(7, 9);
      const third = digits.slice(9, 11);
      return `+7 ${code} ${first} ${second} ${third}`;
    }
    
    // Если формат не распознан, возвращаем как есть
    return phone;
  };

  // Подготавливает номер для звонка (только цифры)
  const formatPhoneForCall = (phone: string): string => {
    const digits = phone.replace(/[^0-9]/g, '');
    if (digits.startsWith('7') || digits.startsWith('8')) {
      return '7' + digits.slice(1);
    }
    return digits;
  };

  const handlePhoneClick = async (blockerId: number, phone: string) => {
    try {
      // 1. Отмечаем звонок АВТОМАТИЧЕСКИ
      console.log('� ��Автоотметка звонка блокирующему:', blockerId);
      
      await callsAPI.mark({ blockerId });
      
      // Обновляем статус в списке
      setBlockers(blockers.map(b =>
        b.id === blockerId
          ? { ...b, hasCalled: true }
          : b
      ));
      
    } catch (error) {
      console.error('❌ Ошибка при автоотметке звонка:', error);
      // Продолжаем даже если ошибка - звонок важнее
    } finally {
      // 2. Совершаем звонок
      const callNumber = formatPhoneForCall(phone);
      console.log('� ��Звонок на номер:', callNumber);
      window.location.href = `tel:+${callNumber}`;
    }
  };

  const markCall = async (blockerId: number) => {
    try {
      console.log('� ��Ручная отметка звонка блокирующему:', blockerId);
      
      const response = await callsAPI.mark({ blockerId });
      console.log('✅ Звонок отмечен:', response.data);
      
      setBlockers(blockers.map(b =>
        b.id === blockerId
          ? { ...b, hasCalled: true }
          : b
      ));
    } catch (error: any) {
      console.error('❌ Ошибка при отметке звонка:', error);
    }
  };

  useEffect(() => {
    loadBlockers();
  }, []);

  return (
    <div className="fixed inset-0 bg-white z-50 animate-slide-up">
      {/* Header */}
      <div className="px-4 py-3 border-b border-neutral-200 flex items-center justify-between bg-white">
        <button
          onClick={onClose}
          className="w-10 h-10 flex items-center justify-center -ml-2 text-neutral-600 active:bg-neutral-100 rounded-full transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <h2 className="text-lg font-semibold text-neutral-900">Проверить выезд</h2>
        <div className="w-10" />
      </div>

      {/* Content */}
      <div className="p-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4" />
            <p className="text-neutral-500">Поиск блокирующих...</p>
          </div>
        ) : error ? (
          <div className="bg-error/5 border border-error/20 rounded-xl p-6 text-center">
            <div className="w-16 h-16 bg-error/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-neutral-900 font-medium mb-2">Ошибка</p>
            <p className="text-neutral-500 text-sm">{error}</p>
            <button
              onClick={loadBlockers}
              className="mt-4 px-6 py-2 bg-primary text-white rounded-lg text-sm font-medium"
            >
              Повторить
            </button>
          </div>
        ) : blockers.length === 0 ? (
          <div className="bg-success/5 border border-success/20 rounded-xl p-6 text-center">
            <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-neutral-900 font-medium mb-2">Выезд свободен</p>
            <p className="text-neutral-500 text-sm">
              В радиусе 4 метров нет машин, которые вас блокируют
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {blockers.map((blocker) => (
              <div
                key={blocker.id}
                className="bg-white border border-neutral-200 rounded-xl p-4"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-3 h-3 rounded-full ${
                    blocker.hasCalled ? 'bg-success' : 'bg-error'
                  }`} />
                  <span className="text-sm font-medium text-neutral-600">
                    {blocker.hasCalled ? 'Уже звонили' : 'Блокирует выезд'}
                  </span>
                  {blocker.distance && (
                    <span className="text-xs text-neutral-400 ml-auto">
                      {blocker.distance.toFixed(1)} м
                    </span>
                  )}
                </div>

                {/* Номер телефона - при клике автоотметка + звонок */}
                <button
                  onClick={() => handlePhoneClick(blocker.id, blocker.phone)}
                  className="w-full bg-neutral-50 rounded-lg p-3 text-center active:bg-neutral-100 transition-colors"
                >
                  <span className="text-2xl font-mono font-medium text-primary">
                    {formatPhoneForDisplay(blocker.phone)}
                  </span>
                </button>

                {/* Кнопка ручной отметки звонка (на случай если звонок был совершен не через приложение) */}
                <button
                  onClick={() => markCall(blocker.id)}
                  className="w-full mt-2 py-2 text-sm text-neutral-400 hover:text-neutral-600 active:text-neutral-900 transition-colors"
                >
                  {blocker.hasCalled ? 'Позвонить ещё раз' : 'Отметить звонок (если звонили не из приложения)'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BlockersScreen;
