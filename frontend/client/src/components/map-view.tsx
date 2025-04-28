import { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import * as maptilersdk from '@maptiler/sdk';
import '@maptiler/sdk/dist/maptiler-sdk.css';
import { Hotel } from '@/lib/types';

interface MapViewProps {
  hotels: Hotel[];
  onSelectHotel: (hotel: Hotel) => void;
}

export const MapView = ({ hotels, onSelectHotel }: MapViewProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maptilersdk.Map | null>(null);
  const [activeHotelId, setActiveHotelId] = useState<number | null>(null);

  useEffect(() => {
    if (map.current) return; // only initialize once

    if (mapContainer.current) {
      maptilersdk.config.apiKey = 'api-key'; // Replace with your MapTiler API key

      map.current = new maptilersdk.Map({
        container: mapContainer.current,
        style: maptilersdk.MapStyle.STREETS,
        center: [11.5761, 48.1371], // Munich center coordinates
        zoom: 13
      });

      map.current.addControl(new maptilersdk.NavigationControl(), 'top-right');
    }
  }, []);

  useEffect(() => {
    if (!map.current || !map.current.loaded()) return;

    // Remove existing markers
    const markers = document.querySelectorAll('.maplibregl-marker');
    markers.forEach(marker => marker.remove());

    // Add hotel markers
    hotels.forEach(hotel => {
      const markerElement = document.createElement('div');
      markerElement.className = 'hotel-map-marker';
      markerElement.innerHTML = `
        <div class="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center shadow-lg cursor-pointer">
          <i class="fas fa-hotel"></i>
        </div>
        <div class="hotel-tooltip ${activeHotelId === hotel.id ? '' : 'hidden'} absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-white shadow-lg rounded-lg p-2 text-sm z-10">
          <p class="font-semibold">${hotel.name}</p>
          <p class="text-primary font-medium">€${hotel.price}/night</p>
        </div>
      `;

      markerElement.addEventListener('click', () => onSelectHotel(hotel));
      markerElement.addEventListener('mouseenter', () => setActiveHotelId(hotel.id));
      markerElement.addEventListener('mouseleave', () => setActiveHotelId(null));

      if (map.current) {
        new maptilersdk.Marker({
          element: markerElement,
          anchor: 'bottom'
        })
          .setLngLat([hotel.location.coordinates.lng, hotel.location.coordinates.lat])
          .addTo(map.current);
      }
    });

    // Fit map to show all hotels
    if (hotels.length > 0 && map.current) {
      const bounds = new maptilersdk.LngLatBounds();
      hotels.forEach(hotel => {
        bounds.extend([hotel.location.coordinates.lng, hotel.location.coordinates.lat]);
      });
      map.current.fitBounds(bounds, {
        padding: 50,
        maxZoom: 15
      });
    }
  }, [hotels, activeHotelId, onSelectHotel]);

  return (
    <motion.div
      className="flex-grow relative"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div ref={mapContainer} className="absolute inset-0"></div>
    </motion.div>
  );
};
