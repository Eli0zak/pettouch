import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for Leaflet marker icon issue in React
// This needs to be done because of how React handles assets
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface LocationMapProps {
  coordinates: { lat: number; lng: number };
  locationName?: string;
  height?: string;
  width?: string;
}

const LocationMap: React.FC<LocationMapProps> = ({
  coordinates,
  locationName = 'الموقع',
  height = '300px',
  width = '100%',
}) => {
  // Ensure DOM is loaded for Leaflet
  useEffect(() => {
    // Force map re-render when the component mounts
    window.dispatchEvent(new Event('resize'));
  }, []);

  if (!coordinates || !coordinates.lat || !coordinates.lng) {
    return (
      <div 
        style={{ height, width }} 
        className="bg-gray-100 rounded-md flex items-center justify-center"
      >
        <p className="text-gray-500">لم يتم تحديد الموقع</p>
      </div>
    );
  }

  return (
    <div style={{ height, width }} className="rounded-md overflow-hidden">
      <MapContainer
        center={[coordinates.lat, coordinates.lng]}
        zoom={14}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[coordinates.lat, coordinates.lng]}>
          <Popup>{locationName}</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default LocationMap; 