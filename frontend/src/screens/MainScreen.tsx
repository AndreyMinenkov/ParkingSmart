import React, { useState, useEffect, useRef } from 'react';
import SystemStatusBar from '../components/layout/SystemStatusBar';
import YandexMap from '../components/map/YandexMap';
import ParkingConfirmationSheet from '../components/parking/ParkingConfirmationSheet';
import BlockersScreen from './BlockersScreen';
import { parkingAPI, authAPI } from '../services/api';

const MainScreen: React.FC = () => {
  const [hasActiveParking, setHasActiveParking] = useState(false);
  const [isBlocking, setIsBlocking] = useState(false);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [showParkingSheet, setShowParkingSheet] = useState(false);
  const [showBlockersScreen, setShowBlockersScreen] = useState(false);
  const [draggableMarker, setDraggableMarker] = useState<{ position: [number, number] } | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number]>([55.751244, 37.618423]);
  const [isLoading, setIsLoading] = useState(true);

  // Используем ref для флага перетаскивания, чтобы всегда иметь актуальное значение
  const isDraggingRef = useRef(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Загружаем статус парковки при монтировании
  useEffect(() => {
    const loadParkingStatus = async () => {
      try {
        const response = await parkingAPI.getCurrent();
        const parking = response.data.parking;
        
        setHasActiveParking(true);
        setIsBlocking(parking.isBlocking);
        setExpiresAt(parking.expiresAt);
        setDraggableMarker(null);
      } catch (error: any) {
        if (error.response?.status === 404) {
          setHasActiveParking(false);
          setIsBlocking(false);
          setExpiresAt(null);
        } else {
          console.error('Ошибка загрузки статуса парковки:', error);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadParkingStatus();
  }, []);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords: [number, number] = [position.coords.latitude, position.coords.longitude];
          setUserLocation(coords);
          if (!hasActiveParking) {
            setDraggableMarker({ position: coords });
          }
        },
        (error) => {
          console.error('Geolocation error:', error);
          const defaultCoords: [number, number] = [55.751244, 37.618423];
          if (!hasActiveParking) {
            setDraggableMarker({ position: defaultCoords });
          }
        }
      );
    } else {
      const defaultCoords: [number, number] = [55.751244, 37.618423];
      if (!hasActiveParking) {
        setDraggableMarker({ position: defaultCoords });
      }
    }
  }, [hasActiveParking]);

  // =============================================
  // ТАЙМЕР БЕЗДЕЙСТВИЯ — СБРАСЫВАЕТСЯ ПРИ ЛЮБОМ ДЕЙСТВИИ
  // =============================================
  const resetInactivityTimer = () => {
    // Скрываем панель при новом действии
    if (showParkingSheet) {
      console.log('� ��Новое действие — скрываем панель');
      setShowParkingSheet(false);
    }

    // Сбрасываем старый таймер
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    // НЕ запускаем новый таймер, если идет перетаскивание (используем ref)
    if (isDraggingRef.current) {
      console.log('⏸️ Идет перетаскивание — таймер НЕ запускаем');
      return;
    }

    console.log('⏳ Запускаем таймер 3 секунды');
    
    // Запускаем новый таймер на 3 секунды
    timerRef.current = setTimeout(() => {
      console.log('⏰ 3 секунды бездействия — показываем панель парковки');

      // Показываем панель ТОЛЬКО если есть маркер и нет активной парковки
      if (draggableMarker && !hasActiveParking) {
        console.log('✅ Показываем панель парковки');
        setShowParkingSheet(true);
      } else {
        console.log('❌ Не показываем панель:', {
          hasMarker: !!draggableMarker,
          hasActiveParking
        });
      }

      timerRef.current = null;
    }, 3000);
  };

  // =============================================
  // ДЕЙСТВИЯ С МАРКЕРОМ
  // =============================================
  const handleMarkerUpdate = (newCoords: [number, number]) => {
    console.log('� ��Обновление позиции маркера:', newCoords);
    setDraggableMarker({ position: newCoords });
    resetInactivityTimer();
  };

  const handleMarkerDragStart = () => {
    console.log('▶️ Начало перетаскивания');
    isDraggingRef.current = true; // Устанавливаем ref
    resetInactivityTimer();
  };

  const handleMarkerDrag = (coords: [number, number]) => {
    setDraggableMarker({ position: coords });
    resetInactivityTimer();
  };

  const handleMarkerDragEnd = (coords: [number, number]) => {
    console.log('⏹️ Конец перетаскивания, координаты:', coords);
    
    // Обновляем позицию маркера
    setDraggableMarker({ position: coords });
    
    // Сначала снимаем флаг перетаскивания в ref
    isDraggingRef.current = false;
    
    // ПОТОМ сбрасываем таймер (ref уже false, таймер запустится)
    console.log('� ��Перетаскивание закончено, запускаем таймер');
    resetInactivityTimer();
  };

  const handleMapClick = (coords: [number, number]) => {
    console.log('� ��Клик по карте — перемещаем маркер');
    handleMarkerUpdate(coords);
  };

  // =============================================
  // ОСТАЛЬНЫЕ ОБРАБОТЧИКИ
  // =============================================
  const handleLogout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
    localStorage.removeItem('token');
    window.location.reload();
  };

  const handleParkingConfirm = async (isBlocking: boolean) => {
    try {
      if (!draggableMarker) return;

      const response = await parkingAPI.create({
        lat: draggableMarker.position[0],
        lon: draggableMarker.position[1],
        isBlocking
      });

      setHasActiveParking(true);
      setIsBlocking(isBlocking);
      setExpiresAt(response.data.parking.expiresAt);
      setShowParkingSheet(false);
      setDraggableMarker(null);
      isDraggingRef.current = false;

      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    } catch (error) {
      console.error('Parking confirm error:', error);
    }
  };

  const handleParkingClose = () => {
    setShowParkingSheet(false);
  };

  // Очистка таймера при размонтировании
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-surface">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-neutral-500">Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <SystemStatusBar
        isBlocking={isBlocking}
        expiresAt={expiresAt}
        onLogout={handleLogout}
      />

      <div className="flex-1 relative">
        <YandexMap
          center={userLocation}
          draggableMarker={draggableMarker}
          onMarkerDrag={handleMarkerDrag}
          onMarkerDragStart={handleMarkerDragStart}
          onMarkerDragEnd={handleMarkerDragEnd}
          onMapClick={handleMapClick}
        />
      </div>

      {showParkingSheet && (
        <ParkingConfirmationSheet
          onConfirm={handleParkingConfirm}
          onClose={handleParkingClose}
        />
      )}

      {showBlockersScreen && (
        <BlockersScreen
          onClose={() => setShowBlockersScreen(false)}
        />
      )}

      {/* Кнопка "Проверить выезд" */}
      {hasActiveParking && !showParkingSheet && !showBlockersScreen && (
        <div className="fixed bottom-8 left-0 right-0 flex justify-center px-4 z-40 animate-slide-up">
          <button
            onClick={() => setShowBlockersScreen(true)}
            className="group relative w-full max-w-sm bg-white border-2 border-primary/30 rounded-xl py-5 px-6 
                     hover:border-primary hover:bg-primary/5 active:scale-[0.98] transition-all 
                     shadow-lg hover:shadow-xl flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <div className="text-left">
                <p className="font-semibold text-neutral-900 text-lg">
                  Проверить выезд
                </p>
                <p className="text-sm text-neutral-400">
                  Найти кто блокирует
                </p>
              </div>
            </div>
            <svg
              className="w-6 h-6 text-primary opacity-0 group-hover:opacity-100 transition-opacity"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default MainScreen;
