import { motion } from 'framer-motion';
import { HotelCard } from './hotel-card';
import { Hotel } from '@/lib/types';

interface ListViewProps {
  hotels: Hotel[];
  onSelectHotel: (hotel: Hotel) => void;
  searchQuery: string;
}

export const ListView = ({ hotels, onSelectHotel, searchQuery }: ListViewProps) => {
  return (
    <motion.div
      className="flex-grow overflow-y-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="max-w-7xl mx-auto px-4 py-6">
        <h2 className="text-xl font-semibold mb-6">Recommended Hotels ({hotels.length})</h2>

        {/* Hotel Cards Grid */}
        <div className="grid grid-cols-1 gap-6">
          {hotels.map((hotel) => (
            <HotelCard
              key={hotel.id}
              hotel={hotel}
              onClick={onSelectHotel}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
};
