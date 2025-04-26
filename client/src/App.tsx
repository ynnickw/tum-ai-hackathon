import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Results from "@/pages/results";
import HotelDetail from "@/pages/hotel-detail";
import { AnimatePresence } from "framer-motion";
import VoiceAgent from "@/components/voice_agent/Copied_App";
import { useState } from "react";
import { Mic } from "lucide-react";
import { Button } from "@/components/ui/button";

function Router() {
  return (
    <AnimatePresence mode="wait">
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/results" component={Results} />
        <Route path="/hotel/:id" component={HotelDetail} />
        <Route component={NotFound} />
      </Switch>
    </AnimatePresence>
  );
}

function App() {
  const [showVoiceAgent, setShowVoiceAgent] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <div className="flex h-screen overflow-hidden">
          <div className={`flex-grow overflow-auto ${showVoiceAgent ? 'w-2/3' : 'w-full'}`}>
            <Router />
          </div>
          
          {showVoiceAgent && (
            <div className="w-[380px] shrink-0 h-screen">
              <VoiceAgent />
            </div>
          )}
          
          <Button
            variant="default"
            size="icon"
            className="fixed bottom-6 right-6 z-50 rounded-full shadow-lg bg-primary hover:bg-primary/90 text-white"
            onClick={() => setShowVoiceAgent(!showVoiceAgent)}
          >
            <Mic className="h-5 w-5" />
          </Button>
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
