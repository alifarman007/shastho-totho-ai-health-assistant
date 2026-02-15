import { GoogleGenAI, Content, Part, Modality } from "@google/genai";
import { SYSTEM_INSTRUCTION } from "../constants";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Using gemini-3-flash-preview as recommended for text tasks
const MODEL_NAME = "gemini-3-flash-preview";

// --- Voice Specific System Instruction ---
const VOICE_SYSTEM_INSTRUCTION = `
**Role:** You are "Shastho Totho" (স্বাস্থ্যতথ্য), a compassionate AI health assistant speaking directly to the user in Bengali.
**Goal:** Provide accurate health advice in a natural, spoken format.

**Strict Audio Guidelines:**
1. **Pure Text Only:** Do NOT use any markdown symbols like asterisks (**), hash (#), hyphens (-), or brackets.
2. **No Visual References:** NEVER say "see below" (নিচে দেখুন), "as mentioned above" (উপরে বলা হয়েছে), "the list below", or "formatted here". The user cannot see the screen.
3. **Conversational Structure:** Do NOT use bullet points or numbered lists. Instead, use natural transitions like "প্রথমত (First)", "তাছাড়া (Besides)", "সবশেষে (Finally)", "তবে (However)".
4. **Conciseness:** Keep responses short, direct, and easy to listen to (maximum 3-4 sentences per concept).
5. **Language:** Standard, natural spoken Bengali. Avoid overly complex bookish language unless explaining a medical term.

**Content:**
- Cover symptoms, remedies, or advice as requested.
- Always include a brief safety warning (e.g., "However, consult a doctor if condition worsens") in a spoken manner.
`;

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

// --- New Function for Voice Mode Response ---
export const getVoiceResponseText = async (message: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: [{ role: 'user', parts: [{ text: message }] }],
      config: {
        systemInstruction: VOICE_SYSTEM_INSTRUCTION, // Optimized for audio output
        temperature: 0.6,
      },
    });

    return response.text || "দুঃখিত, আমি এখন উত্তর দিতে পারছি না।";
  } catch (error) {
    console.error("Voice text generation error:", error);
    return "দুঃখিত, একটি যান্ত্রিক ত্রুটি হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।";
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