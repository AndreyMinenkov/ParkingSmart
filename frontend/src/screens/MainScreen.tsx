import React, { useState } from 'react';
import SystemStatusBar from '../components/layout/SystemStatusBar';
import YandexMap from '../components/map/YandexMap';
import FloatingActionButton from '../components/layout/FloatingActionButton';
import ParkingConfirmationSheet from '../components/parking/ParkingConfirmationSheet';
import BlockersScreen from './BlockersScreen';
import { parkingAPI } from '../services/api';

const MainScreen: React.FC = () => {
  const [hasActiveParking, setHasActiveParking] = useState(false);
  const [isBlocking, setIsBlocking] = useState(false);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [showParkingSheet, setShowParkingSheet] = useState(false);
  const [showBlockersScreen, setShowBlockersScreen] = useState(false);
  const [draggableMarker, setDraggableMarker] = useState<{ position: [number, number] } | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number]>([55.751244, 37.618423]);

  React.useEffect(() => {
    // Получаем текущую геолокацию при загрузке
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          console.error('Ошибка геолокации:', error);
        }
      );
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.reload();
  };

  const handleFabClick = () => {
    if (hasActiveParking) {
      setShowBlockersScreen(true);
    } else {
      setShowParkingSheet(true);
      // Показываем перетаскиваемый маркер в центре карты
      setDraggableMarker({ position: userLocation });
    }
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
      
      // Показываем уведомление (временно через alert)
      alert('Парковка сохранена');
    } catch (error) {
      console.error('Ошибка сохранения парковки:', error);
      alert('Ошибка при сохранении парковки');
    }
  };

  const handleParkingClose = () => {
    setShowParkingSheet(false);
    setDraggableMarker(null);
  };

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
          onMarkerDrag={(coords) => setDraggableMarker({ position: coords })}
        />
        
        <FloatingActionButton
          type={hasActiveParking ? 'exit' : 'parking'}
          onClick={handleFabClick}
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
    </div>
  );
};

export default MainScreen;
