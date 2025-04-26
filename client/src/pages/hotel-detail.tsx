import { useState, useEffect } from 'react';
import { useLocation, useRoute } from 'wouter';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/header';
import { hotelData } from '@/lib/hotel-data';
import { Hotel } from '@/lib/types';

export default function HotelDetail() {
  const [, navigate] = useLocation();
  const [, params] = useRoute('/hotel/:id');
  const [hotel, setHotel] = useState<Hotel | null>(null);

  useEffect(() => {
    if (params && params.id) {
      const id = parseInt(params.id);
      const foundHotel = hotelData.find(h => h.id === id);
      if (foundHotel) {
        setHotel(foundHotel);
      } else {
        // If hotel not found, redirect to results
        navigate('/results');
      }
    }
  }, [params, navigate]);

  const handleBackToResults = () => {
    navigate('/results');
  };

  if (!hotel) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <motion.div
      className="flex flex-col h-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Header />

      <main className="flex-grow overflow-hidden">
        <div className="border-b">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <Button
              variant="ghost"
              className="flex items-center text-neutral-600 hover:text-neutral-800"
              onClick={handleBackToResults}
            >
              <i className="fas fa-arrow-left mr-2"></i>
              <span>Back to results</span>
            </Button>
          </div>
        </div>

        <div className="flex-grow overflow-y-auto h-[calc(100vh-120px)]">
          <div className="max-w-4xl mx-auto px-4 py-6">
            {/* Hotel Header */}
            <motion.div
              className="mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-2xl font-semibold">{hotel.name}</h1>
                  <p className="text-neutral-600">{hotel.location.area}, {hotel.location.distanceToCenter}</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-semibold text-primary">€{hotel.price}/night</p>
                  <div className="flex items-center justify-end mt-1">
                    <i className="fas fa-star text-yellow-400 mr-1"></i>
                    <span className="font-medium">{hotel.rating.toFixed(1)}</span>
                    <span className="text-neutral-600 text-sm ml-1">({hotel.reviewCount} reviews)</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Hotel Gallery */}
            <motion.div
              className="grid grid-cols-4 grid-rows-2 gap-2 h-80 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="col-span-2 row-span-2 rounded-lg overflow-hidden">
                <img src={hotel.images.main} alt={`${hotel.name} Main Image`} className="w-full h-full object-cover" />
              </div>
              {hotel.images.gallery.map((image, index) => (
                <div key={index} className="rounded-lg overflow-hidden">
                  <img src={image} alt={`${hotel.name} Gallery ${index + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </motion.div>

            {/* Hotel Details */}
            <motion.div
              className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="md:col-span-2">
                <h2 className="text-xl font-semibold mb-4">About this hotel</h2>
                {hotel.description.split('\n\n').map((paragraph, index) => (
                  <p key={index} className="text-neutral-700 mb-4">{paragraph}</p>
                ))}

                <h2 className="text-xl font-semibold mt-8 mb-4">Key amenities</h2>
                <div className="grid grid-cols-2 gap-y-3">
                  {hotel.amenities.map((amenity, index) => (
                    <div key={index} className="flex items-center">
                      <i className={`fas fa-${getAmenityIcon(amenity)} text-primary mr-3`}></i>
                      <span>{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-neutral-50 p-6 rounded-lg h-fit">
                <h2 className="text-lg font-semibold mb-4">Location</h2>
                <div className="bg-neutral-200 rounded-lg h-40 mb-4">
                  {/* Mock Map */}
                  <div className="w-full h-full relative bg-[#e8eef4] rounded-lg overflow-hidden">
                    {/* City Center Marker */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-neutral-100 opacity-50 flex items-center justify-center text-xs font-medium">
                      <i className="fas fa-city"></i>
                    </div>

                    {/* Hotel Marker */}
                    <div className="absolute top-[45%] left-[48%] transform -translate-x-1/2 -translate-y-1/2">
                      <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center shadow-lg">
                        <i className="fas fa-hotel"></i>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mb-6">
                  <p className="flex items-start">
                    <i className="fas fa-map-marker-alt text-primary mt-1 mr-3"></i>
                    <span>{hotel.location.address}</span>
                  </p>
                  <p className="flex items-start">
                    <i className="fas fa-walking text-primary mt-1 mr-3"></i>
                    <span>{hotel.location.distanceToCenter}</span>
                  </p>
                  <p className="flex items-start">
                    <i className="fas fa-subway text-primary mt-1 mr-3"></i>
                    <span>0.3 km to nearest metro station</span>
                  </p>
                </div>

                <h3 className="font-medium mb-2">Nearby attractions:</h3>
                <ul className="space-y-1 text-sm">
                  {hotel.location.nearbyAttractions.map((attraction, index) => (
                    <li key={index}>• {attraction}</li>
                  ))}
                </ul>
              </div>
            </motion.div>

            {/* Book Now Action */}
            <motion.div
              className="bg-primary/5 border border-primary/20 rounded-lg p-6 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-primary mb-1">Perfect match for your search</h3>
                  <p className="text-neutral-700">
                    This hotel matches {hotel.matchPercentage}% of your requirements for a quiet, pet-friendly hotel with parking and breakfast near Munich city center.
                  </p>
                </div>
                <Button
                  className="mt-4 md:mt-0 bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
                >
                  Book Now
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </motion.div>
  );
}

// Helper function to get icon for amenity
function getAmenityIcon(amenity: string): string {
  const iconMap: Record<string, string> = {
    'Pet friendly': 'paw',
    'Parking': 'parking',
    'Breakfast': 'utensils',
    'Quiet rooms': 'volume-mute',
    'Free high-speed WiFi': 'wifi',
    'Air conditioning': 'fan',
    '24/7 concierge': 'concierge-bell',
    'Premium bedding': 'bed',
    'Valet parking': 'car',
    'Gourmet breakfast': 'utensils',
    'Spa': 'spa',
    'Fitness center': 'dumbbell',
    'Room service': 'concierge-bell',
    'Concierge': 'concierge-bell',
    'Business center': 'briefcase',
    'Soundproof': 'volume-mute',
    'Garden': 'leaf',
    'Free WiFi': 'wifi',
    'Bike rental': 'bicycle',
    'Afternoon tea service': 'coffee',
    'Kitchenette': 'kitchen-set',
    'Laundry service': 'washing-machine',
    'Smart TV': 'tv',
    'Daily housekeeping': 'broom',
    'Continental breakfast': 'coffee',
    'Free parking': 'parking',
    'Garden terrace': 'umbrella-beach',
    'Bicycle rental': 'bicycle',
    'Family rooms': 'users',
    'Luggage storage': 'suitcase',
    'Climate control': 'temperature-high',
    'Reading lounge': 'book',
    'Tea station': 'mug-hot',
    'Nearby parking': 'parking'
  };

  return iconMap[amenity] || 'check';
}
