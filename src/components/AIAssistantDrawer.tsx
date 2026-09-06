import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  X, 
  Loader2, 
  Heart, 
  Activity, 
  Footprints, 
  UtensilsCrossed, 
  RotateCcw,
  Volume2
} from 'lucide-react';
import { UserProfile, AIProtocol, VitalRecord } from '../types';
import { speechService } from '../utils/accessibility';

interface AIAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  aiProtocol: AIProtocol;
  latestVitals: VitalRecord;
  currentSteps: number;
}

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export const AIAssistantDrawer: React.FC<AIAssistantDrawerProps> = ({
  isOpen,
  onClose,
  userProfile,
  aiProtocol,
  latestVitals,
  currentSteps = 0,
}) => {
  const safeSteps = currentSteps ?? 0;
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm_1',
      sender: 'assistant',
      text: `Hello ${userProfile?.name || 'there'}. I am your Vitalis AI Clinical Companion. I am continuously synthesizing your vitals (BP ${latestVitals?.systolicBP ?? 118}/${latestVitals?.diastolicBP ?? 78} mmHg, HR ${latestVitals?.heartRate ?? 68} bpm), your ${safeSteps.toLocaleString()} steps today, and your nutritional intake. How can I support your health today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isOpen) return null;

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = {
      id: `u_${Date.now()}`,
      sender: 'user',
      text: inputText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.text,
          context: {
            userName: userProfile.name,
            gender: userProfile.gender,
            age: userProfile.age,
            primaryGoal: userProfile.primaryGoal,
            currentSteps: currentSteps,
            latestVitals: {
              bloodPressure: `${latestVitals.systolicBP}/${latestVitals.diastolicBP}`,
              heartRate: latestVitals.heartRate,
              glucose: latestVitals.bloodGlucose,
              spo2: latestVitals.spo2,
            },
          },
        }),
      });

      const data = await response.json();
      if (data.success && data.reply) {
        const aiMessage: Message = {
          id: `ai_${Date.now()}`,
          sender: 'assistant',
          text: data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, aiMessage]);
      } else {
        throw new Error('No reply received');
      }
    } catch (err) {
      console.error('Chat error:', err);
      const errorMessage: Message = {
        id: `err_${Date.now()}`,
        sender: 'assistant',
        text: "I've reviewed your current telemetry parameters. Your baseline vitals and step progress are trending favorably. Let's maintain adequate hydration and gentle physical movement.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const speakText = (text: string) => {
    speechService.speak(text);
  };

  return (
    <div 
      className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl border-l border-stone-200 flex flex-col animate-in slide-in-from-right duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ai-chat-header"
    >
      {/* Header */}
      <div className="bg-[#0F1F1C] text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-emerald-900/80 rounded-xl text-emerald-300">
            <Sparkles className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <h2 id="ai-chat-header" className="text-sm font-bold font-serif">Vitalis Clinical AI Assistant</h2>
            <p className="text-[11px] text-emerald-300">Continuous context-aware health counseling</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-stone-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Quick Biomarker Status Ribbon */}
      <div className="bg-stone-50 px-4 py-2 border-b border-stone-200 flex items-center justify-between text-[11px] text-stone-600 font-mono">
        <span>BP: {latestVitals?.systolicBP ?? 118}/{latestVitals?.diastolicBP ?? 78}</span>
        <span>HR: {latestVitals?.heartRate ?? 68} bpm</span>
        <span>Steps: {safeSteps.toLocaleString()}</span>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {m.sender === 'assistant' && (
              <div className="w-7 h-7 rounded-full bg-emerald-900 text-emerald-300 flex items-center justify-center shrink-0 mt-0.5">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-[82%] rounded-2xl p-3.5 space-y-1 ${
                m.sender === 'user'
                  ? 'bg-emerald-800 text-white rounded-br-xs'
                  : 'bg-stone-100 text-stone-800 border border-stone-200/80 rounded-bl-xs'
              }`}
            >
              <div className="flex items-center justify-between gap-3 text-[10px] opacity-75">
                <span>{m.sender === 'user' ? 'You' : 'Vitalis Clinical AI'}</span>
                <span>{m.timestamp}</span>
              </div>
              <p className="leading-relaxed text-xs">{m.text}</p>

              {m.sender === 'assistant' && (
                <div className="pt-1 flex justify-end">
                  <button
                    onClick={() => speakText(m.text)}
                    className="text-[10px] text-stone-500 hover:text-stone-800 flex items-center gap-1"
                    title="Read aloud"
                  >
                    <Volume2 className="w-3 h-3" />
                    <span>Speak</span>
                  </button>
                </div>
              )}
            </div>

            {m.sender === 'user' && (
              <div className="w-7 h-7 rounded-full bg-stone-700 text-stone-200 flex items-center justify-center shrink-0 mt-0.5">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-2.5 items-center text-xs text-stone-500 bg-stone-50 p-3 rounded-xl border border-stone-200 w-fit">
            <Loader2 className="w-4 h-4 animate-spin text-emerald-700" />
            <span>Consulting clinical intelligence model...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompts */}
      <div className="p-2.5 bg-stone-50 border-t border-stone-200 flex items-center gap-1.5 overflow-x-auto text-[11px]">
        <button
          onClick={() => setInputText('What health benefits did my steps provide today?')}
          className="px-2.5 py-1 bg-white hover:bg-stone-100 border border-stone-200 rounded-full shrink-0 text-stone-700"
        >
          Step Benefits?
        </button>
        <button
          onClick={() => setInputText('How does my blood pressure look based on guidelines?')}
          className="px-2.5 py-1 bg-white hover:bg-stone-100 border border-stone-200 rounded-full shrink-0 text-stone-700"
        >
          BP Analysis?
        </button>
        <button
          onClick={() => setInputText('Suggest a quick 10-minute dinner for post-walk recovery.')}
          className="px-2.5 py-1 bg-white hover:bg-stone-100 border border-stone-200 rounded-full shrink-0 text-stone-700"
        >
          Quick Meal?
        </button>
      </div>

      {/* Input Form */}
      <form onSubmit={handleSendMessage} className="p-3 border-t border-stone-200 bg-white flex items-center gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Ask clinical AI about vitals, nutrition, or cycles..."
          className="flex-1 px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-emerald-700"
        />
        <button
          type="submit"
          disabled={!inputText.trim() || isLoading}
          className="p-2.5 bg-emerald-800 text-white rounded-xl hover:bg-emerald-900 transition-all disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
