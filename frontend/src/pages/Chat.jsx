import React, { useState, useEffect, useRef } from 'react';
import { chatService } from '../api/services';
import Loader from '../components/Loader';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Trash2, Sparkles, User, MessageCircle, HelpCircle, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesContainerRef = useRef(null);
  const isFirstRender = useRef(true);

  const welcomeMessage = {
    id: 'welcome',
    role: 'ASSISTANT',
    content: "Hello! 🐾 I am your AI Pet Care Assistant. I can help answer queries about pet care, puppy training, cat nutrition, vaccine timelines, and general tips. Ask me anything!",
    createdAt: new Date().toISOString()
  };

  const fetchHistory = async () => {
    try {
      const res = await chatService.getHistory(0, 50);
      if (res.success && res.data) {
        const history = res.data.content || [];
        setMessages(history.length === 0 ? [welcomeMessage] : history);
      }
    } catch (err) {
      console.warn("Failed to load chat history, starting fresh.", err);
      setMessages([welcomeMessage]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // Auto scroll to bottom
  const scrollToBottom = (behavior = 'smooth') => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior
      });
    }
  };

  useEffect(() => {
    if (!loading) {
      if (isFirstRender.current) {
        scrollToBottom('auto');
        isFirstRender.current = false;
      } else {
        scrollToBottom('smooth');
      }
    }
  }, [messages, sending, loading]);

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage = {
      id: Date.now() + Math.random(),
      role: 'USER',
      content: inputValue,
      createdAt: new Date().toISOString()
    };

    setMessages((prev) => [...prev, userMessage]);
    const prompt = inputValue;
    setInputValue('');
    setSending(true);

    try {
      const res = await chatService.sendMessage(prompt);
      if (res.success && res.data) {
        // Assuming API returns { success: true, data: { id, role: "ASSISTANT", content, createdAt } }
        setMessages((prev) => [...prev, res.data]);
      }
    } catch (err) {
      toast.error("AI Assistant is temporarily busy.");
    } finally {
      setSending(false);
    }
  };

  const handleClearChat = async () => {
    if (window.confirm("Are you sure you want to clear your chat history?")) {
      try {
        await chatService.clearHistory();
        setMessages([welcomeMessage]);
        toast.success("Chat history cleared.");
      } catch (err) {
        toast.error("Failed to clear history.");
      }
    }
  };

  const samplePrompts = [
    'How often should I vaccinate my pet?',
    'What food is best for my pet species?',
    'How do I introduce a new pet to my home?',
    'Tips for basic pet training'
  ];

  const handlePromptClick = (prompt) => {
    setInputValue(prompt);
  };

  if (loading) return <Loader fullScreen />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-[calc(100vh-120px)] flex flex-col lg:flex-row gap-8">
      
      {/* Left side details */}
      <div className="w-full lg:w-80 shrink-0 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col space-y-6">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-tr from-primary to-secondary text-white font-semibold text-xs tracking-wider uppercase rounded-full shadow-md shadow-primary/10">
            <Sparkles size={12} />
            AI Companion
          </div>
          <h2 className="text-xl font-display font-extrabold">Pet Care Guide</h2>
          <p className="text-xs text-slate-500 leading-relaxed font-semibold">
            Ask any questions regarding pet wellness, behavior guidelines, veterinary checks, and diet plans.
          </p>
        </div>

        <div className="space-y-3 flex-grow">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <HelpCircle size={14} />
            Popular Prompts
          </h4>
          <div className="flex flex-col gap-2.5">
            {samplePrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handlePromptClick(p)}
                className="text-left p-3 border border-slate-200 dark:border-slate-800 hover:border-primary/50 bg-slate-50/50 dark:bg-slate-950/50 hover:bg-slate-50 hover:text-primary dark:hover:text-primary-light rounded-2xl text-xs font-bold transition-all text-slate-655 dark:text-slate-350 flex justify-between items-center group cursor-pointer"
              >
                <span className="max-w-[90%] truncate">{p}</span>
                <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 bg-primary/5 dark:bg-slate-950 border border-primary/10 rounded-2xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center text-lg shrink-0">🤖</div>
          <div className="text-left">
            <h5 className="font-bold text-slate-850 dark:text-white text-xs">Powered by Groq</h5>
            <p className="text-[10px] text-slate-400">Response streams in real-time</p>
          </div>
        </div>
      </div>

      {/* Right side chat container */}
      <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-sm flex flex-col overflow-hidden">
        
        {/* Chat Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-secondary text-white flex items-center justify-center font-bold text-lg shadow-inner uppercase animate-pulse-slow">
              AI
            </div>
            <div>
              <h3 className="font-display font-bold text-sm">Pet Care Assistant</h3>
              <span className="text-[10px] text-success font-black tracking-wider uppercase">Active Helper</span>
            </div>
          </div>
          <button
            onClick={handleClearChat}
            className="p-2 border border-slate-200 dark:border-slate-800 hover:bg-red-500/10 hover:text-red-500 text-slate-450 rounded-xl transition-all"
            title="Clear Chat History"
          >
            <Trash2 size={16} />
          </button>
        </div>

        {/* Messages Body */}
        <div 
          ref={messagesContainerRef}
          className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50/50 dark:bg-slate-950/30"
        >
          {messages.map((msg) => {
            const isUser = msg.role === 'USER';
            return (
              <div 
                key={msg.id} 
                className={`flex gap-3 max-w-[80%] ${isUser ? 'ml-auto flex-row-reverse' : ''}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 shadow-sm ${
                  isUser 
                    ? 'bg-slate-250 text-slate-700 dark:bg-slate-800 dark:text-slate-200' 
                    : 'bg-gradient-to-tr from-primary to-secondary text-white'
                }`}>
                  {isUser ? <User size={14} /> : 'AI'}
                </div>
                <div className={`p-4 rounded-3xl text-xs font-semibold leading-relaxed shadow-sm ${
                  isUser 
                    ? 'bg-primary text-white rounded-tr-none' 
                    : 'bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-tl-none text-slate-800 dark:text-slate-200'
                }`}>
                  <p className="whitespace-pre-line">{msg.content}</p>
                </div>
              </div>
            );
          })}

          {/* Typing Loading bubble */}
          {sending && (
            <div className="flex gap-3 max-w-[80%]">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-secondary text-white flex items-center justify-center text-xs font-bold shrink-0">
                AI
              </div>
              <div className="p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-3xl rounded-tl-none shadow-sm flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-full bg-primary/40 block animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2.5 h-2.5 rounded-full bg-primary/65 block animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2.5 h-2.5 rounded-full bg-primary block animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
        </div>

        {/* Input Footer */}
        <form onSubmit={handleSend} className="p-4 border-t border-slate-100 dark:border-slate-800 flex gap-2">
          <input
            type="text"
            required
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask about pet care, puppy training, vaccination..."
            className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-2xl px-5 py-3.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-slate-850 dark:text-white placeholder-slate-405"
          />
          <button
            type="submit"
            className="p-3.5 bg-primary hover:bg-primary-dark text-white rounded-2xl shadow-md shadow-primary/10 transition-all flex items-center justify-center shrink-0 cursor-pointer hover:shadow-lg active:scale-95"
          >
            <Send size={18} />
          </button>
        </form>

      </div>
    </div>
  );
};

export default Chat;
