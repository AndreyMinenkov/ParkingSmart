import React, { useRef, useEffect, useState } from 'react';
import { YMaps, Map, Placemark, GeolocationControl } from '@pbe/react-yandex-maps';

interface YandexMapProps {
  center: [number, number];
  draggableMarker: { position: [number, number] } | null;
  onMarkerDrag: (coords: [number, number]) => void;
  onMapClick?: (coords: [number, number]) => void;
  onMarkerDragStart?: () => void;
  onMarkerDragEnd?: (coords: [number, number]) => void;
}

const YandexMap: React.FC<YandexMapProps> = ({
  center,
  draggableMarker,
  onMarkerDrag,
  onMapClick,
  onMarkerDragStart,
  onMarkerDragEnd
}) => {
  const mapRef = useRef<any>(null);
  const [currentZoom, setCurrentZoom] = useState<number>(17);

  // УВЕЛИЧЕННОЕ смещение: 24px при зуме 17
  const getOffsetByZoom = (zoom: number): number => {
    // База: 0.0001728 для зума 17 (24px)
    const baseOffset = 0.0001728;
    // Пропорционально зуму
    return baseOffset * (17 / zoom);
  };

  const handleMapClick = (e: any) => {
    const coords = e.get('coords');
    console.log('️️ Клик по карте, координаты:', coords);

    if (onMapClick) {
      onMapClick(coords);
    }

    // При клике - сдвигаем маркер вниз
    if (draggableMarker && onMarkerDrag) {
      const offset = getOffsetByZoom(currentZoom);
      const offsetCoords: [number, number] = [coords[0] - offset, coords[1]];
      console.log(`� ��Клик: сдвиг маркера на 24px (зум ${currentZoom})`);
      onMarkerDrag(offsetCoords);
    }
  };

  const handleDragStart = (e: any) => {
    console.log('▶️ Начало перетаскивания');
    
    // При начале перетаскивания - сдвигаем КАРТУ вниз
    if (mapRef.current) {
      const map = mapRef.current;
      const center = map.getCenter();
      const offset = getOffsetByZoom(currentZoom);
      map.panTo([center[0] + offset, center[1]], { duration: 0 });
      console.log(`� ��Карта сдвинута вниз на 24px`);
    }
    
    if (onMarkerDragStart) {
      onMarkerDragStart();
    }
  };

  const handleDrag = (e: any) => {
    const coords = e.get('target').geometry.getCoordinates();
    if (onMarkerDrag) {
      onMarkerDrag(coords);
    }
  };

  const handleDragEnd = (e: any) => {
    const coords = e.get('target').geometry.getCoordinates();
    console.log('⏹️ Конец перетаскивания, координаты:', coords);
    
    // Возвращаем карту обратно
    if (mapRef.current) {
      const map = mapRef.current;
      const center = map.getCenter();
      const offset = getOffsetByZoom(currentZoom);
      map.panTo([center[0] - offset, center[1]], { duration: 200 });
      console.log(`� ��Карта возвращена обратно`);
    }
    
    if (onMarkerDragEnd) {
      onMarkerDragEnd(coords);
    }
  };

  const handleBoundsChange = (e: any) => {
    if (mapRef.current) {
      const zoom = mapRef.current.getZoom();
      setCurrentZoom(zoom);
      console.log('���️ Зум изменен:', zoom);
    }
  };

  // Устанавливаем начальный зум
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.setZoom(17);
      setCurrentZoom(17);
    }
  }, []);

  return (
    <YMaps
      query={{
        apikey: '17dda8c7-78d4-47c9-8777-808a1afc0650',
        lang: 'ru_RU',
        coordorder: 'latlong',
        load: 'Map,Placemark,control.GeolocationControl'
      }}
    >
      <Map
        instanceRef={mapRef}
        defaultState={{
          center: center,
          zoom: 17,
          controls: ['geolocationControl']
        }}
        options={{
          suppressMapOpenBlock: true,
          suppressObsoleteBrowserNotifier: true,
          yandexMapDisablePoiInteractivity: true,
          autoFitToViewport: 'always'
        }}
        width="100%"
        height="100%"
        onClick={handleMapClick}
        onBoundsChange={handleBoundsChange}
        modules={['control.GeolocationControl', 'geoObject.addon.balloon']}
      >
        {draggableMarker && (
          <Placemark
            geometry={draggableMarker.position}
            options={{
              draggable: true,
              preset: 'islands#blueDotIcon',
              iconColor: '#007AFF',
              hideIconOnBalloonOpen: false,
              openEmptyBalloon: false
            }}
            properties={{
              hintContent: 'Укажите место'
            }}
            onDragStart={handleDragStart}
            onDrag={handleDrag}
            onDragEnd={handleDragEnd}
          />
        )}
        <GeolocationControl options={{ float: 'left' }} />
      </Map>
    </YMaps>
  );
};

export default YandexMap;
