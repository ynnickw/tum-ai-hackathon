import { useState, FormEvent } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { Hotel } from '@/lib/types';

interface ChatProps {
  onHotelsFetched: (hotels: Hotel[]) => void;
}

export function Chat({ onHotelsFetched }: ChatProps) {
  // Chat state
  const [messages, setMessages] = useState<{sender: 'user' | 'ai'; content: string | React.ReactNode}[]>([
    {
      sender: 'ai',
      content: 'Where would you like to go?'
    }
  ]);
  const [step, setStep] = useState<'destination' | 'dates' | 'requirements'>('destination');
  const [destination, setDestination] = useState<string | null>(null);
  const [dates, setDates] = useState<{from: Date | undefined; to: Date | undefined}>({
    from: undefined,
    to: undefined
  });
  const [inputValue, setInputValue] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchHotels = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/hotels?query=${encodeURIComponent(inputValue)}&city=${encodeURIComponent(destination || '')}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 400 && errorData.detail === "Invalid request.") {
          setMessages(prev => [...prev, {
            sender: 'ai',
            content: "I'm sorry, but your request doesn't seem to be suitable for hotel requirements. Please try to be more specific about what you're looking for in a hotel (e.g., 'I want a hotel with a pool and breakfast included')."
          }]);
          return;
        }
        throw new Error('Network response was not ok');
      }
  
      const data = await response.json();
      onHotelsFetched(data.hotels || []);
  
      setMessages(prev => [...prev, {
        sender: 'ai',
        content: data.message || "I've found some great hotels that match your requirements!"
      }]);
  
      setInputValue('');
    } catch (error) {
      console.error('Error fetching hotels:', error);
      setMessages(prev => [...prev, {
        sender: 'ai',
        content: "Sorry, something went wrong. Please try again."
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDestinationSelect = (selected: string) => {
    setDestination(selected);
    setMessages(prev => [
      ...prev,
      { sender: 'user', content: selected },
      { sender: 'ai', content: 'When would you like to travel? Please select your dates:' }
    ]);
    setStep('dates');
  };

  const handleDateSelect = () => {
    if (dates.from && dates.to) {
      const dateStr = `${format(dates.from, 'PPP')} to ${format(dates.to, 'PPP')}`;
      setMessages(prev => [
        ...prev,
        { sender: 'user', content: dateStr },
        { sender: 'ai', content: 'What specific requirements do you have? (e.g., pool, pet-friendly, breakfast included)' }
      ]);
      setStep('requirements');
    }
  };

  const handleRequirementsSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    // Add user message
    setMessages(prev => [...prev, {
      sender: 'user',
      content: inputValue
    }]);

    fetchHotels();
  };

  const renderDestinationOptions = () => (
    <div className="grid grid-cols-3 gap-2 my-2">
      <Button
        onClick={() => handleDestinationSelect('Mallorca')}
        variant="outline"
        className="flex flex-col items-center p-3 h-auto"
      >
        <i className="fas fa-umbrella-beach text-2xl mb-2 text-blue-500"></i>
        <span>Mallorca</span>
      </Button>
      <Button
        onClick={() => handleDestinationSelect('Kopenhagen')}
        variant="outline"
        className="flex flex-col items-center p-3 h-auto"
      >
        <i className="fas fa-landmark text-2xl mb-2 text-indigo-500"></i>
        <span>Kopenhagen</span>
      </Button>
      <Button
        onClick={() => handleDestinationSelect('New York')}
        variant="outline"
        className="flex flex-col items-center p-3 h-auto"
      >
        <i className="fas fa-city text-2xl mb-2 text-gray-700"></i>
        <span>New York</span>
      </Button>
    </div>
  );

  const renderDatePicker = () => (
    <div className="my-2 border rounded-lg p-2 bg-white">
      <Calendar
        mode="range"
        selected={dates}
        onSelect={(range) => {
          setDates(range as {from: Date | undefined, to: Date | undefined});
        }}
        className="rounded-md"
        numberOfMonths={1}
      />
      <div className="mt-2 flex justify-end">
        <Button
          onClick={handleDateSelect}
          disabled={!dates.from || !dates.to}
        >
          Confirm Dates
        </Button>
      </div>
    </div>
  );

  return (
   
      <div className="h-full flex flex-col p-4">
     

        {/* Chat messages */}
        <div className="flex-grow overflow-y-auto p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl mb-4">
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-xl px-5 py-3 ${
                    message.sender === 'user'
                      ? 'bg-primary text-white shadow-md'
                      : 'bg-white text-gray-800 shadow-sm'
                  }`}
                >
                  {message.sender === 'ai' && step === 'destination' && index === 0 ? (
                    <div>
                      <p>Where would you like to go?</p>
                      {renderDestinationOptions()}
                    </div>
                  ) : message.sender === 'ai' && step === 'dates' && index === 2 ? (
                    <div>
                      <p>When would you like to travel? Please select your dates:</p>
                      {renderDatePicker()}
                    </div>
                  ) : (
                    <div>{message.content}</div>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white rounded-xl px-5 py-3 shadow-sm">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Chat input - only shown in requirements step */}
        {step === 'requirements' && (
          <div className="p-3 bg-white rounded-xl shadow-sm border mt-auto">
            <form onSubmit={handleRequirementsSubmit} className="flex items-center">
              <Input
                type="text"
                placeholder="Enter your hotel requirements..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="flex-grow"
              />
              <Button type="submit" className="ml-2" disabled={isLoading}>
                <i className="fas fa-paper-plane mr-2"></i>
                Send
              </Button>
            </form>
          </div>
        )}
      </div>
  );
}