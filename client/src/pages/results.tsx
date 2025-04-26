import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { Header } from '@/components/header';
import { ListView } from '@/components/list-view';
import { MapView } from '@/components/map-view';
import { Chat } from '@/components/Chat';
import { Button } from '@/components/ui/button';
import { Hotel, ViewMode } from '@/lib/types';
import VoiceAgent from '@/components/voice_agent/Copied_App';
import { Mic, MessageSquare } from 'lucide-react';

export default function Results() {
  const [, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [prevSearchQuery, setPrevSearchQuery] = useState<string>('');
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [interfaceMode, setInterfaceMode] = useState<'chat' | 'voice'>('chat');

  // Get the search query from sessionStorage
  useEffect(() => {
    const query = sessionStorage.getItem('searchQuery');
    if (query) {
      setSearchQuery(query);
      setPrevSearchQuery(query);
    }
    
    // Load hotels from sessionStorage if available
    const storedHotels = sessionStorage.getItem('searchResults');
    if (storedHotels) {
      try {
        const parsedHotels = JSON.parse(storedHotels);
        if (Array.isArray(parsedHotels) && parsedHotels.length > 0) {
          setHotels(parsedHotels);
        }
      } catch (error) {
        console.error('Error parsing stored hotels:', error);
      }
    }
  }, []);

  const handleSelectHotel = (hotel: Hotel) => {
    // Navigate to hotel detail view with the selected hotel ID
    navigate(`/hotel/${hotel.id}`);
  };

  const handleNewSearch = (query: string) => {
    // Only update if the query is different
    sessionStorage.setItem('searchQuery', query);
    setSearchQuery(query);
    setPrevSearchQuery(query);
  };

  const handleHotelsFetched = (fetchedHotels: Hotel[]) => {
    console.log('fetchedHotels', fetchedHotels);
    setHotels(fetchedHotels);
  };

  const toggleInterface = () => {
    setInterfaceMode(interfaceMode === 'chat' ? 'voice' : 'chat');
  };

  return (
    <motion.div
      className="flex flex-col h-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Header />

      <main className="flex flex-col h-[calc(100vh-64px)]">
        {/* Split View Container */}
        <div className="flex h-full">
          {/* Chat or Voice Agent Interface */}
          <motion.div
              className="w-[40%] border-r"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >

          <div className="h-full flex flex-col p-4">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-neutral-800 mb-2">Plan Your Perfect Stay</h2>
          <p className="text-neutral-600">Let's find the ideal hotel for your trip</p>
        </div>
          {interfaceMode === 'chat' ? (
            <Chat onHotelsFetched={handleHotelsFetched} />
          ) : (
           
              <VoiceAgent />
            
          )}
          </div>
          </motion.div>
          {/* Results Interface - 60% width */}
          <motion.div
            className="w-[60%]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="h-full flex flex-col">
              <div className="border-b">
                <div className="px-4 py-3">
                  <div className="flex items-center justify-between">
                    <div className="text-xl font-semibold text-primary">Search Results</div>

                    {/* View Toggle */}
                    <div className="bg-neutral-100 rounded-lg p-1 flex">
                      <Button
                        variant={viewMode === 'list' ? 'default' : 'ghost'}
                        className={`px-3 py-1 rounded-md ${viewMode === 'list' ? 'bg-white shadow text-neutral-800' : 'text-neutral-600'}`}
                        onClick={() => setViewMode('list')}
                      >
                        <i className="fas fa-list mr-1"></i> List
                      </Button>
                      <Button
                        variant={viewMode === 'map' ? 'default' : 'ghost'}
                        className={`px-3 py-1 rounded-md ${viewMode === 'map' ? 'bg-white shadow text-neutral-800' : 'text-neutral-600'}`}
                        onClick={() => setViewMode('map')}
                      >
                        <i className="fas fa-map-marker-alt mr-1"></i> Map
                      </Button>
                    </div>
                  </div>

                  {/* Search Summary */}
                  <div className="mt-2">
                    <p className="text-sm text-neutral-600">
                      <span className="font-medium">Your search results for {searchQuery}</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* View Content */}
              <div className="flex-grow" style={{minHeight: '300px'}}>
                <AnimatePresence mode="wait">
                  {viewMode === 'list' ? (
                    <ListView
                      key="list-view"
                      hotels={hotels}
                      onSelectHotel={handleSelectHotel}
                      searchQuery={searchQuery}
                    />
                  ) : (
                    <MapView
                      key="map-view"
                      hotels={hotels}
                      onSelectHotel={handleSelectHotel}
                    />
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Interface Toggle Button */}
      <Button
        variant="default"
        size="icon"
        className="fixed bottom-6 right-6 z-50 rounded-full shadow-lg bg-primary hover:bg-primary/90 text-white"
        onClick={toggleInterface}
      >
        {interfaceMode === 'chat' ? (
          <Mic className="h-5 w-5" />
        ) : (
          <MessageSquare className="h-5 w-5" />
        )}
      </Button>
    </motion.div>
  );
}
