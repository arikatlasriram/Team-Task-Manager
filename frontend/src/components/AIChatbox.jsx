import { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Loader2, Sparkles } from 'lucide-react';
import api from '../services/api';
import ReactMarkdown from 'react-markdown';

export default function AIChatbox() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello! I'm ChatGPT. How can I help you today?", isBot: true }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { id: Date.now(), text: input, isBot: false };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await api.post('/ai/chat', { message: userMessage.text });
      const botMessage = { id: Date.now() + 1, text: response.data.reply, isBot: true };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Failed to send message:', error);
      const errorMessage = { 
        id: Date.now() + 1, 
        text: 'Sorry, I am having trouble connecting to the server right now.', 
        isBot: true 
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <div 
          className="mb-4 w-80 sm:w-96 glass-card overflow-hidden flex flex-col shadow-2xl shadow-brand-500/20 animate-slide-up origin-bottom-right"
          style={{ height: '500px', maxHeight: 'calc(100vh - 120px)' }}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-brand-600 to-purple-600 p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">ChatGPT</h3>
                <p className="text-white/70 text-xs">Powered by OpenAI</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-white/70 hover:text-white transition-colors p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-surface-900/50">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}
              >
                <div 
                  className={`max-w-[85%] rounded-2xl p-3 text-sm ${
                    msg.isBot 
                      ? 'bg-surface-800 text-slate-200 rounded-tl-sm border border-slate-700/50' 
                      : 'bg-brand-600 text-white rounded-tr-sm shadow-md shadow-brand-500/20'
                  }`}
                >
                  {msg.isBot ? (
                    <div className="prose prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-surface-900 prose-pre:border prose-pre:border-slate-700/50">
                      <ReactMarkdown>{msg.text}</ReactMarkdown>
                    </div>
                  ) : (
                    msg.text
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-surface-800 rounded-2xl rounded-tl-sm border border-slate-700/50 p-4 flex items-center gap-2">
                  <div className="w-2 h-2 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-surface-800/80 border-t border-slate-700/50">
            <form onSubmit={handleSubmit} className="relative flex items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything..."
                className="w-full bg-surface-900 border border-slate-700 text-slate-200 text-sm rounded-full pl-4 pr-12 py-3 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="absolute right-1.5 p-2 bg-brand-600 hover:bg-brand-500 disabled:bg-surface-700 text-white rounded-full transition-colors disabled:cursor-not-allowed"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-all duration-300 hover:scale-105 ${
          isOpen 
            ? 'bg-surface-800 text-slate-400 hover:text-white border border-slate-700' 
            : 'bg-gradient-to-r from-brand-600 to-purple-600 text-white shadow-brand-500/30'
        }`}
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
      </button>
    </div>
  );
}
