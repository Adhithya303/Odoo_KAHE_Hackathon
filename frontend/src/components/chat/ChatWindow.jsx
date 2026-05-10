import { useState, useRef, useEffect } from 'react';
import { sendMessage } from '../../api/chatbot';

export default function ChatWindow() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: '👋 Hi! I\'m your WanderIQ travel assistant. Ask me about destinations, visa info, packing tips, or anything travel-related!' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState(['Best budget destinations?', 'Packing tips', 'Visa requirements']);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = async (text) => {
    if (!text.trim()) return;
    const userMsg = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    try {
      const { data } = await sendMessage({ message: text, conversation_history: messages });
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
      if (data.suggestions?.length) setSuggestions(data.suggestions);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: '😅 Sorry, I had trouble connecting. Please try again!' }]);
    }
    setLoading(false);
  };

  return (
    <>
      {/* Floating button */}
      <button onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-coral hover:bg-coral-hover text-white rounded-full shadow-elevated flex items-center justify-center transition-all hover:scale-110 active:scale-95">
        {isOpen ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
        )}
      </button>

      {/* Chat window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-[380px] max-w-[calc(100vw-2rem)] bg-white rounded-card shadow-elevated border border-border animate-slide-up overflow-hidden">
          {/* Header */}
          <div className="bg-primary p-4 flex items-center gap-3">
            <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center text-lg">🤖</div>
            <div>
              <h4 className="text-white font-semibold text-sm">WanderIQ Assistant</h4>
              <p className="text-white/70 text-xs">AI-powered travel help</p>
            </div>
          </div>

          {/* Messages */}
          <div className="h-80 overflow-y-auto p-4 space-y-3 bg-sand-light">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'user' ? 'bg-primary text-white rounded-br-md' : 'bg-white text-body shadow-sm rounded-bl-md border border-border'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-md shadow-sm border border-border">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick chips */}
          <div className="px-4 py-2 border-t border-border flex gap-2 overflow-x-auto">
            {suggestions.slice(0, 3).map((s, i) => (
              <button key={i} onClick={() => send(s)}
                className="whitespace-nowrap text-xs bg-primary/5 text-primary px-3 py-1.5 rounded-badge hover:bg-primary/10 transition-colors border border-primary/20">
                {s}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="p-3 border-t border-border flex gap-2">
            <input value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send(input)}
              placeholder="Ask me anything..."
              className="flex-1 px-3 py-2 rounded-input border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
            <button onClick={() => send(input)} disabled={loading || !input.trim()}
              className="px-4 py-2 bg-coral hover:bg-coral-hover text-white rounded-input text-sm font-medium transition-colors disabled:opacity-50">
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
}
