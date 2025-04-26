import { useEffect, useRef, useState } from "react";
import EventLog from "./EventLog";
import SessionControls from "./SessionControls";
import ToolPanel from "./ToolPanel";

export default function App() {
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [events, setEvents] = useState([]);
  const [dataChannel, setDataChannel] = useState(null);
  const peerConnection = useRef(null);
  const audioElement = useRef(null);
  const audioBuffer = useRef([]);
  const audioContext = useRef(null);

  async function startSession() {
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
      analyzer.fftSize = 2048; // Adjust based on your needs
      
      // Create a processor to handle the PCM data
      const processor = audioContext.current.createScriptProcessor(1024, 1, 1);
      
      processor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        // Convert Float32Array to Int16Array for typical PCM format
        const pcmData = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          pcmData[i] = Math.min(1, Math.max(-1, inputData[i])) * 0x7FFF;
        }
        
        // Send PCM chunk to your backend
        sendPCMToBackend(pcmData);
      };
      
      // Connect the audio nodes
      source.connect(analyzer);
      analyzer.connect(processor);
      processor.connect(audioContext.current.destination);
      
      // Still allow normal playback
      audioElement.current.srcObject = mediaStream;
    };

    // Add local audio track for microphone input in the browser
    const ms = await navigator.mediaDevices.getUserMedia({
      audio: true,
    });
    pc.addTrack(ms.getTracks()[0]);

    // Set up data channel for sending and receiving events
    const dc = pc.createDataChannel("oai-events");
    setDataChannel(dc);

    // Start the session using the Session Description Protocol (SDP)
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

  // Stop current session, clean up peer connection and data channel
  function stopSession() {
    if (dataChannel) {
      dataChannel.close();
    }

    peerConnection.current.getSenders().forEach((sender) => {
      if (sender.track) {
        sender.track.stop();
      }
    });

    if (peerConnection.current) {
      peerConnection.current.close();
    }

    setIsSessionActive(false);
    setDataChannel(null);
    peerConnection.current = null;

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
    <div className="flex flex-col h-full border-l border-gray-200">
      <div className="p-3 border-b border-gray-200 bg-primary/5">
        <h2 className="text-lg font-medium text-primary">Voice Assistant</h2>
      </div>
      <div className="flex flex-col h-full">
        <div className="flex-grow overflow-y-auto p-3">
          <EventLog events={events} />
        </div>
        <div className="border-t border-gray-200 p-3">
          <SessionControls
            startSession={startSession}
            stopSession={stopSession}
            sendClientEvent={sendClientEvent}
            sendTextMessage={sendTextMessage}
            events={events}
            isSessionActive={isSessionActive}
          />
        </div>
        <div className="border-t border-gray-200 p-3 overflow-y-auto max-h-[200px]">
          <ToolPanel
            sendClientEvent={sendClientEvent}
            sendTextMessage={sendTextMessage}
            events={events}
            isSessionActive={isSessionActive}
          />
        </div>
      </div>
    </div>
  );
}
