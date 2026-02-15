import { GoogleGenAI, Content, Part, Modality } from "@google/genai";
import { SYSTEM_INSTRUCTION } from "../constants";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Using gemini-3-flash-preview as recommended for text tasks
const MODEL_NAME = "gemini-3-flash-preview";

export const streamHealthResponse = async (
  message: string,
  history: { role: 'user' | 'model'; content: string }[]
) => {
  try {
    // Convert simplified history to GenAI Content format
    const contents: Content[] = history.map((msg) => ({
      role: msg.role,
      parts: [{ text: msg.content } as Part],
    }));

    // Add the new user message
    contents.push({
      role: 'user',
      parts: [{ text: message } as Part],
    });

    const responseStream = await ai.models.generateContentStream({
      model: MODEL_NAME,
      contents: contents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.4, // Lower temperature for more consistent medical info
        maxOutputTokens: 8192, // Increased from 1000 to prevent truncation
      },
    });

    return responseStream;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw error;
  }
};

export const generateAudio = async (text: string): Promise<string | undefined> => {
  try {
    // We use a specific model for TTS
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' },
            },
        },
      },
    });
    
    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  } catch (error) {
    console.error("TTS generation error:", error);
    return undefined;
  }
};