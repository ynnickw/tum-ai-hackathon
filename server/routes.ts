import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes for hotel search
  app.get('/api/hotels', (req, res) => {
    // In a real application, this would query a database
    // For now, we'll just return a success response
    res.json({ success: true, message: 'Hotel API is working' });
  });

  // API route to simulate AI processing
  app.post('/api/chat', (req, res) => {
    const { message } = req.body;

    // In a real application, this would connect to an AI service
    // For now, we'll just return a simulated response
    res.json({
      success: true,
      response: `I've found some hotels matching your search for "${message}". Would you like to see them?`
    });
  });

  // API route for OpenAI Realtime token generation
  app.get("/token", async (req, res) => {
    try {
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        throw new Error("OpenAI API key is not set");
      }

      const response = await fetch(
        "https://api.openai.com/v1/realtime/sessions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "gpt-4o-realtime-preview-2024-12-17",
            voice: "echo",
          }),
        },
      );

      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Token generation error:", error);
      res.status(500).json({ error: "Failed to generate token" });
    }
  });

  // Endpoint for receiving PCM audio data
  app.post('/api/audio-pcm', express.raw({ type: 'application/octet-stream', limit: '1mb' }), (req, res) => {
    try {
      // In a production app, you would process the PCM data here
      // For example, transcribe it or send it to another service
      console.log(`Received PCM data: ${req.body.byteLength} bytes`);
      res.json({ success: true });
    } catch (error) {
      console.error("Error processing PCM data:", error);
      res.status(500).json({ error: "Failed to process audio data" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
