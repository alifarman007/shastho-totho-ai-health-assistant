export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  isStreaming?: boolean;
}

export enum ViewState {
  WELCOME = 'WELCOME',
  CHAT = 'CHAT',
  VOICE = 'VOICE'
}

export interface ChatSession {
  id: string;
  title: string;
  date: string;
}