declare module '@/components/voice_agent/Copied_App' {
  interface VoiceAgentProps {
    onHotelsFetched: (hotels: any[]) => void;
  }
  const CopiedApp: React.FC<VoiceAgentProps>;
  export default CopiedApp;
} 