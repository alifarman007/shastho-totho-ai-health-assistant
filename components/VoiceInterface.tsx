import React, { useState, useEffect, useRef } from 'react';
import { Mic, X, Volume2, Loader2, StopCircle, MessageSquare } from 'lucide-react';
import { getVoiceResponseText, generateAudio } from '../services/geminiService';

interface VoiceInterfaceProps {
  onClose: () => void;
}

// --- Audio Decoding Helpers (for Raw PCM) ---
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

const VoiceInterface: React.FC<VoiceInterfaceProps> = ({ onClose }) => {
  const [status, setStatus] = useState<'IDLE' | 'LISTENING' | 'PROCESSING' | 'SPEAKING'>('IDLE');
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<any>(null);
  
  // Audio Context for playback
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);

  const handleVoiceQueryRef = useRef<(text: string) => void>(() => {});

  useEffect(() => {
    // 1. Initialize AudioContext (System Default Sample Rate)
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
        audioContextRef.current = new AudioContextClass(); // Do not force sampleRate here
    }

    // 2. Initialize Speech Recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = 'bn-BD';
      recognition.interimResults = false; 
      recognition.continuous = false;
      
      recognition.onstart = () => {
        setStatus('LISTENING');
        setTranscript(''); // Clear previous transcript
      };
      
      recognition.onend = () => {
        // Prevent overwriting PROCESSING/SPEAKING states if recognition stops naturally
        setStatus(prev => {
            if (prev === 'PROCESSING' || prev === 'SPEAKING') return prev;
            return 'IDLE';
        });
      };
      
      recognition.onresult = (event: any) => {
        const current = event.resultIndex;
        if (event.results[current].isFinal) {
          const transcriptText = event.results[current][0].transcript;
          handleVoiceQueryRef.current(transcriptText);
        }
      };
      
      recognition.onerror = (event: any) => {
          console.error("Speech recognition error", event.error);
          setStatus('IDLE');
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) recognitionRef.current.stop();
      if (sourceRef.current) sourceRef.current.stop();
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, []);

  const startListening = async () => {
    // Stop any playing audio
    if (sourceRef.current) {
        try { sourceRef.current.stop(); } catch(e) {}
    }
    
    // Resume AudioContext (Browser Policy Requirement)
    if (audioContextRef.current?.state === 'suspended') {
        try {
            await audioContextRef.current.resume();
        } catch (e) {
            console.error("AudioContext resume failed", e);
        }
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.log("Recognition already started or error", e);
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) recognitionRef.current.stop();
    setStatus('IDLE');
  };

  const playAudioResponse = async (base64Data: string) => {
    if (!audioContextRef.current || !base64Data) return;
    
    // Ensure context is running
    if (audioContextRef.current.state === 'suspended') {
         await audioContextRef.current.resume();
    }

    setStatus('SPEAKING');

    try {
        const audioBytes = decode(base64Data);
        // Gemini TTS output is 24kHz
        const audioBuffer = await decodeAudioData(
            audioBytes,
            audioContextRef.current,
            24000, 
            1
        );

        const source = audioContextRef.current.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContextRef.current.destination);
        
        source.onended = () => {
            setStatus('IDLE');
        };

        sourceRef.current = source;
        source.start(0);

    } catch (error) {
        console.error("Error decoding/playing audio:", error);
        setStatus('IDLE');
    }
  };

  // Implement the logic
  handleVoiceQueryRef.current = async (query: string) => {
    if (!query.trim()) return;
    
    setTranscript(query); // Set transcript immediately so user knows what was heard
    
    // Manually stop recognition just in case
    if (recognitionRef.current) recognitionRef.current.stop();
    setStatus('PROCESSING');

    try {
      // 1. Get Text Response optimized for Voice (No markdown, no "see below")
      const voiceText = await getVoiceResponseText(query);
      
      // 2. Convert to Audio using Gemini TTS
      const audioData = await generateAudio(voiceText);

      if (audioData) {
          playAudioResponse(audioData);
      } else {
          console.error("No audio data received");
          setStatus('IDLE');
      }

    } catch (error) {
      console.error("Error in voice query:", error);
      setStatus('IDLE');
    }
  };

  return (
    <div className="absolute inset-0 z-50 bg-slate-900/95 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-white animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="absolute top-6 left-6 flex items-center gap-2">
         <Volume2 className="text-blue-400" />
         <span className="font-medium text-lg">Voice Mode</span>
      </div>
      
      <button 
        onClick={onClose} 
        className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/10 transition-colors"
      >
        <X size={24} />
      </button>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-2xl text-center">
        
        {/* Visualizer / Button */}
        <div className="relative">
            {/* Ripple Animation when Listening */}
            {status === 'LISTENING' && (
                <>
                    <div className="absolute inset-0 rounded-full bg-blue-500/30 animate-ping"></div>
                    <div className="absolute inset-[-20px] rounded-full bg-blue-500/20 animate-pulse"></div>
                </>
            )}
            
            <button 
                onClick={status === 'LISTENING' ? stopListening : startListening}
                className={`relative z-10 w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl ${
                    status === 'LISTENING' ? 'bg-red-500 hover:bg-red-600 scale-110' : 
                    status === 'PROCESSING' ? 'bg-slate-700' :
                    status === 'SPEAKING' ? 'bg-green-500 hover:bg-green-600 animate-bounce-slow' :
                    'bg-blue-600 hover:bg-blue-700'
                }`}
            >
                {status === 'PROCESSING' ? (
                    <Loader2 className="animate-spin w-12 h-12" />
                ) : status === 'SPEAKING' ? (
                     <Volume2 className="w-12 h-12" />
                ) : status === 'LISTENING' ? (
                     <StopCircle className="w-12 h-12" />
                ) : (
                    <Mic className="w-12 h-12" />
                )}
            </button>
        </div>

        {/* Instructions */}
        <p className="mt-8 text-slate-400 text-lg font-medium tracking-wide min-h-[2rem]">
            {status === 'LISTENING' ? 'শুনছি... (Listening...)' : 
             status === 'PROCESSING' ? 'ভাবছি... (Thinking...)' : 
             status === 'SPEAKING' ? 'বলছি... (Speaking...)' : 
             'কথা বলতে ট্যাপ করুন (Tap to Speak)'}
        </p>

        {/* User Transcript Display */}
        {(transcript && (status === 'PROCESSING' || status === 'SPEAKING' || status === 'IDLE')) && (
            <div className="mt-6 p-4 bg-white/5 rounded-xl border border-white/10 max-w-lg w-full backdrop-blur-md animate-in slide-in-from-bottom-2">
                <div className="flex items-center gap-2 mb-2 text-blue-300 text-xs uppercase tracking-widest font-semibold">
                    <MessageSquare size={12} />
                    You Said
                </div>
                <p className="text-xl md:text-2xl text-white font-medium leading-relaxed">
                    "{transcript}"
                </p>
            </div>
        )}

      </div>
    </div>
  );
};

export default VoiceInterface;