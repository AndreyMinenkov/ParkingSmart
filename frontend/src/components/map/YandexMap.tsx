import React from 'react';
import { YMaps, Map, Placemark, GeolocationControl } from '@pbe/react-yandex-maps';

interface YandexMapProps {
  center?: [number, number];
  onMapClick?: (e: any) => void;
  draggableMarker?: {
    position: [number, number];
  } | null;
  onMarkerDrag?: (coords: [number, number]) => void;
}

const YandexMap: React.FC<YandexMapProps> = ({ 
  center = [55.751244, 37.618423], 
  onMapClick, 
  draggableMarker, 
  onMarkerDrag 
}) => {
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
        onClick={onMapClick}
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
              openEmptyBalloon: true
            }}
            properties={{
              balloonContent: 'Перетащите на точное место парковки',
              hintContent: 'Укажите место'
            }}
            onDragEnd={(e: any) => {
              const coords = e.get('target').geometry.getCoordinates();
              onMarkerDrag?.(coords);
            }}
          />
        )}
      </Map>
    </YMaps>
  );
};

export default YandexMap;
