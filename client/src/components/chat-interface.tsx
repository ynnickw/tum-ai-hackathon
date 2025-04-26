import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChatMessage } from '@/lib/types';

interface ChatInterfaceProps {
  onSearch: (query: string) => void;
  isVisible: boolean;
}

export const ChatInterface = ({ onSearch, isVisible }: ChatInterfaceProps) => {
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: 'ai',
      content: "Hello! I can help you find the perfect hotel. Please describe what you're looking for - include details like location, amenities, budget, or anything else that matters to you.",
      timestamp: new Date()
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputValue.trim()) return;

    // Add user message
    setMessages(prev => [...prev, {
      sender: 'user',
      content: inputValue,
      timestamp: new Date()
    }]);

    // Show AI typing indicator
    setIsTyping(true);

    // Simulate AI response delay
    setTimeout(() => {
      setIsTyping(false);
      // Add AI response message about processing the search
      setMessages(prev => [...prev, {
        sender: 'ai',
        content: "I'm finding hotels that match your requirements. Here are your results!",
        timestamp: new Date()
      }]);

      // After a short delay, trigger the search action
      setTimeout(() => {
        onSearch(inputValue);
      }, 1000);
    }, 1500);

    setInputValue('');
  };

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const containerVariants = {
    visible: {
      x: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30
      }
    },
    hidden: {
      x: '-100%',
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30
      }
    }
  };

  return (
    <motion.div
      className="absolute inset-0 flex flex-col bg-white"
      variants={containerVariants}
      initial="visible"
      animate={isVisible ? "visible" : "hidden"}
    >
      <div className="flex-grow overflow-y-auto p-4 pt-0">
        <div className="max-w-3xl mx-auto flex flex-col space-y-6 py-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-neutral-800 mb-2">Find Your Perfect Hotel with AI</h2>
            <p className="text-neutral-600">Describe what you're looking for in natural language</p>
          </div>

          {/* Chat Messages */}
          <div className="space-y-4">
            <AnimatePresence>
              {messages.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`flex items-start ${message.sender === 'user' ? 'justify-end' : ''}`}
                >
                  {message.sender === 'ai' && (
                    <div className="flex-shrink-0 bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center">
                      <i className="fas fa-robot text-sm"></i>
                    </div>
                  )}
                  <div
                    className={`${
                      message.sender === 'user'
                        ? 'mr-3 bg-primary text-white'
                        : 'ml-3 bg-neutral-100 text-neutral-800'
                    } rounded-2xl p-4 max-w-[80%]`}
                  >
                    <p>{message.content}</p>
                  </div>
                  {message.sender === 'user' && (
                    <div className="flex-shrink-0 bg-neutral-800 text-white rounded-full w-8 h-8 flex items-center justify-center">
                      <i className="fas fa-user text-sm"></i>
                    </div>
                  )}
                </motion.div>
              ))}

              {/* AI typing indicator */}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="flex items-start"
                >
                  <div className="flex-shrink-0 bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center">
                    <i className="fas fa-robot text-sm"></i>
                  </div>
                  <div className="ml-3 bg-neutral-100 rounded-2xl p-4">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      {/* Chat Input */}
      <div className="border-t bg-white p-4">
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSubmit} className="flex items-center space-x-2">
            <Input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="flex-grow border border-neutral-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Describe your ideal hotel..."
            />
            <Button
              type="submit"
              className="bg-primary hover:bg-primary/90 text-white rounded-lg px-4 py-2 transition-colors duration-200 flex items-center justify-center"
            >
              <span>Search</span>
              <i className="fas fa-paper-plane ml-2"></i>
            </Button>
          </form>
        </div>
      </div>
    </motion.div>
  );
};
