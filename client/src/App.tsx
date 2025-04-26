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
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <div className="flex h-screen overflow-hidden">
          <div className="flex-grow overflow-auto">
            <Router />
          </div>
          <div className="w-[380px] shrink-0 h-screen">
            <VoiceAgent />
          </div>
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
