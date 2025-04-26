import { useEffect, useRef, useState } from "react";
import { CloudLightning, CloudOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import EventLog from "./EventLog";
import SessionControls from "./SessionControls";
import ToolPanel from "./ToolPanel";

// Speech animation component
function SpeechAnimation({ isActive, isSpeaking }) {
  return (
    <div className={`flex items-center justify-center w-full h-full ${!isActive && 'opacity-40 transition-opacity duration-300'}`}>
      <div className="relative w-32 h-32 bg-primary rounded-full flex items-center justify-center shadow-lg">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex items-end space-x-3 h-12">
            {/* Bars that appear as circles when idle */}
            <div 
              className={`bg-white/90 w-2 transform origin-bottom transition-all duration-500 ease-in-out rounded-full
                ${isSpeaking ? 'h-full animate-pulse-wave' : 'h-2'}`} 
              style={{ animationDelay: '0ms' }}
            ></div>
            <div 
              className={`bg-white/90 w-2 transform origin-bottom transition-all duration-500 ease-in-out rounded-full
                ${isSpeaking ? 'h-full animate-pulse-wave' : 'h-2'}`} 
              style={{ animationDelay: '400ms' }}
            ></div>
            <div 
              className={`bg-white/90 w-2 transform origin-bottom transition-all duration-500 ease-in-out rounded-full
                ${isSpeaking ? 'h-full animate-pulse-wave' : 'h-2'}`} 
              style={{ animationDelay: '800ms' }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [events, setEvents] = useState([]);
  const [dataChannel, setDataChannel] = useState(null);
  const peerConnection = useRef(null);
  const audioElement = useRef(null);
  const audioBuffer = useRef([]);
  const audioContext = useRef(null);

  // Simulate speaking for demo purposes
  useEffect(() => {
    let interval;
    if (isSessionActive) {
      // Start speaking after a short delay to show the inactive state first
      const timeout = setTimeout(() => {
        setIsSpeaking(true);
      }, 700);
      
      return () => clearTimeout(timeout);
    } else {
      setIsSpeaking(false);
    }
    
    return () => clearInterval(interval);
  }, [isSessionActive]);

  async function startSession() {
    try {
      // Get a session token for OpenAI Realtime API
      const tokenResponse = await fetch("/token");
      const data = await tokenResponse.json();
      const EPHEMERAL_KEY = data.client_secret.value;

      // Create a peer connection
      const pc = new RTCPeerConnection();

      // Set up to play remote audio from the model
      audioElement.current = document.createElement("audio");
      audioElement.current.autoplay = true;
      pc.ontrack = (e) => {
        const mediaStream = e.streams[0];
        audioContext.current = new AudioContext();
        const source = audioContext.current.createMediaStreamSource(mediaStream);
        
        // Create an analyzer to get raw PCM data
        const analyzer = audioContext.current.createAnalyser();
        analyzer.fftSize = 2048;
        
        // Create a processor to handle the PCM data
        const processor = audioContext.current.createScriptProcessor(1024, 1, 1);
        
        processor.onaudioprocess = (e) => {
          const inputData = e.inputBuffer.getChannelData(0);
          // Convert Float32Array to Int16Array for typical PCM format
          const pcmData = new Int16Array(inputData.length);
          for (let i = 0; i < inputData.length; i++) {
            pcmData[i] = Math.min(1, Math.max(-1, inputData[i])) * 0x7FFF;
          }
          
          // Detect if AI is speaking based on audio data
          const sum = pcmData.reduce((sum, val) => sum + Math.abs(val), 0);
          const average = sum / pcmData.length;
          setIsSpeaking(average > 500); // Threshold for speech detection
          
          // Send PCM chunk to your backend
          sendPCMToBackend(pcmData);
        };
        
        // Connect the audio nodes
        source.connect(analyzer);
        analyzer.connect(processor);
        processor.connect(audioContext.current.destination);
        
        // Allow normal playback
        audioElement.current.srcObject = mediaStream;
      };

      // Add local audio track for microphone input
      const ms = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      pc.addTrack(ms.getTracks()[0]);

      // Set up data channel
      const dc = pc.createDataChannel("oai-events");
      setDataChannel(dc);

      // Start the session
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      const baseUrl = "https://api.openai.com/v1/realtime";
      const model = "gpt-4o-realtime-preview-2024-12-17";
      const sdpResponse = await fetch(`${baseUrl}?model=${model}`, {
        method: "POST",
        body: offer.sdp,
        headers: {
          Authorization: `Bearer ${EPHEMERAL_KEY}`,
          "Content-Type": "application/sdp",
        },
      });

      const answer = {
        type: "answer",
        sdp: await sdpResponse.text(),
      };
      await pc.setRemoteDescription(answer);

      peerConnection.current = pc;
      setIsSessionActive(true);
    } catch (error) {
      console.error("Failed to start session:", error);
      setIsSessionActive(false);
    }
  }

  async function sendPCMToBackend(pcmData) {
    try {
      await fetch('/api/audio-pcm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/octet-stream',
        },
        body: pcmData.buffer
      });
    } catch (error) {
      console.error('Failed to send PCM data:', error);
    }
  }

  function stopSession() {
    if (dataChannel) {
      dataChannel.close();
    }

    if (peerConnection.current) {
      peerConnection.current.getSenders().forEach((sender) => {
        if (sender.track) {
          sender.track.stop();
        }
      });
      peerConnection.current.close();
    }

    setIsSessionActive(false);
    setDataChannel(null);
    peerConnection.current = null;
    setIsSpeaking(false);

    if (audioContext.current) {
      audioContext.current.close();
    }
  }

  // Send a message to the model
  function sendClientEvent(message) {
    if (dataChannel) {
      const timestamp = new Date().toLocaleTimeString();
      message.event_id = message.event_id || crypto.randomUUID();

      // send event before setting timestamp since the backend peer doesn't expect this field
      dataChannel.send(JSON.stringify(message));

      // if guard just in case the timestamp exists by miracle
      if (!message.timestamp) {
        message.timestamp = timestamp;
      }
      setEvents((prev) => [message, ...prev]);
    } else {
      console.error(
        "Failed to send message - no data channel available",
        message,
      );
    }
  }

  // Send a text message to the model
  function sendTextMessage(message) {
    const event = {
      type: "conversation.item.create",
      item: {
        type: "message",
        role: "user",
        content: [
          {
            type: "input_text",
            text: message,
          },
        ],
      },
    };

    sendClientEvent(event);
    sendClientEvent({ type: "response.create" });
  }

  // Attach event listeners to the data channel when a new one is created
  useEffect(() => {
    if (dataChannel) {
      // Append new server events to the list
      dataChannel.addEventListener("message", (e) => {
        const event = JSON.parse(e.data);
        if (!event.timestamp) {
          event.timestamp = new Date().toLocaleTimeString();
        }

        setEvents((prev) => [event, ...prev]);
      });

      // Set session active when the data channel is opened
      dataChannel.addEventListener("open", () => {
        setIsSessionActive(true);
        setEvents([]);
      });
    }
  }, [dataChannel]);

  return (
    <div className="flex flex-col h-full items-center justify-between p-6">
      {/* Speech Animation */}
      <div className="flex-grow flex items-center justify-center w-full">
        <SpeechAnimation isActive={isSessionActive} isSpeaking={isSpeaking} />
      </div>
      
      {/* Session Controls */}
      <div className="mt-4">
        {isSessionActive ? (
          <Button
            variant="destructive"
            size="lg"
            className="rounded-full px-6 shadow-md"
            onClick={stopSession}
          >
            <CloudOff className="h-5 w-5 mr-2" />
            Disconnect
          </Button>
        ) : (
          <Button
            variant="default"
            size="lg"
            className="rounded-full px-6 bg-primary hover:bg-primary/90 shadow-md"
            onClick={startSession}
          >
            <CloudLightning className="h-5 w-5 mr-2" />
            Connect
          </Button>
        )}
      </div>
    </div>
  );
}
