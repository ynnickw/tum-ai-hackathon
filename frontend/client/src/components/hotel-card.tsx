import { motion } from 'framer-motion';
import { Hotel } from '@/lib/types';

interface HotelCardProps {
  hotel: Hotel;
  onClick: (hotel: Hotel) => void;
}

export const HotelCard = ({ hotel, onClick }: HotelCardProps) => {
  const getMatchColor = (percentage: number) => {
    if (percentage >= 61) return 'bg-green-500';
    if (percentage >= 31) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <motion.div
      className="hotel-card bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200 cursor-pointer"
      onClick={() => onClick(hotel)}
      whileHover={{ y: -5 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex">
        {/* Image Section */}
        <div className="relative w-48 h-48 flex-shrink-0 bg-neutral-100 flex items-center justify-center">
          <i className="fas fa-building text-6xl text-neutral-400"></i>
          <div className="absolute top-2 right-2 bg-white rounded-full px-2 py-1 flex items-center text-sm font-medium">
            <i className="fas fa-star text-yellow-400 mr-1"></i>
            <span>{hotel.rating.toFixed(1)}</span>
          </div>
        </div>

        {/* Content Section */}
        <div className="flex-grow p-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold">{hotel.name}</h3>
              <p className="text-sm text-neutral-600 mt-1">{hotel.location.area}, {hotel.location.distanceToCenter}</p>
            </div>
            <div className="flex flex-col items-end">
              <p className="font-semibold text-primary">€{hotel.price}/night</p>
              {hotel.matchPercentage !== undefined && (
                <div className={`mt-2 px-2 py-1 rounded-full text-white text-sm font-medium ${getMatchColor(hotel.matchPercentage)}`}>
                  {hotel.matchPercentage}% Match
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-1 mt-3">
            {hotel.amenities.slice(0, 4).map((amenity, index) => (
              <span
                key={index}
                className="bg-neutral-100 text-neutral-800 text-xs px-2 py-1 rounded-full"
              >
                {amenity}
              </span>
            ))}
          </div>

          <p className="mt-3 text-sm text-neutral-600 line-clamp-2">{hotel.shortDescription}</p>
        </div>
      </div>
    </motion.div>
  );
};
