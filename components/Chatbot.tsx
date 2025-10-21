
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { getChatbotResponse } from '../services/geminiService';

const parseMarkdown = (text: string) => {
    // A simple parser for bold and bullet points
    return text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/^\* (.*$)/gim, '<ul class="list-disc list-inside"><li>$1</li></ul>')
        .replace(/<\/ul>\n<ul class="list-disc list-inside">/g, ''); // Join consecutive list items
};

const Chatbot: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([
        { role: 'model', content: "Hello! I'm Cyber-Aid, your AI SOC Assistant. How can I help you today? You can ask me about security terms, threat types, or best practices." }
    ]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userInput.trim() || isLoading) return;

        const newUserMessage: ChatMessage = { role: 'user', content: userInput };
        setMessages(prev => [...prev, newUserMessage]);
        setUserInput('');
        setIsLoading(true);

        try {
            const response = await getChatbotResponse(userInput);
            const newModelMessage: ChatMessage = { role: 'model', content: response };
            setMessages(prev => [...prev, newModelMessage]);
        } catch (error) {
            const errorMessage: ChatMessage = { role: 'model', content: "Sorry, I encountered an error. Please try again." };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <div className={`fixed bottom-4 right-4 z-[90] transition-transform duration-300 ${isOpen ? 'scale-0' : 'scale-100'}`}>
                <button 
                    onClick={() => setIsOpen(true)}
                    className="bg-blue-600 text-white rounded-full w-16 h-16 flex items-center justify-center shadow-lg hover:bg-blue-500 transition-colors"
                    aria-label="Open AI SOC Assistant"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.5A4.5 4.5 0 0 0 17.5 5c-.55 0-1 .45-1 1v2.5c0 .55-.45 1-1 1h-2.5c-.55 0-1-.45-1-1v-2.5c0-.55-.45-1-1-1C8.45 5 5 12.5 5 17c0 1.5 1.25 2.94 2.75 2.94.93 0 1.75-.54 2.25-1.31.5-.77 1.5-1.31 2.25-1.31Z"/><path d="M12 4.41V2.5c0-.55-.45-1-1-1s-1 .45-1 1v1.91"/><path d="M12 21.5v-1.09"/></svg>
                </button>
            </div>
            
            <div className={`fixed bottom-4 right-4 z-[90] w-full max-w-sm h-[70vh] bg-slate-800/80 backdrop-blur-md border border-slate-700 rounded-lg shadow-2xl flex flex-col transition-all duration-300 origin-bottom-right ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'}`}>
                <header className="flex items-center justify-between p-3 border-b border-slate-700 bg-slate-900/50 rounded-t-lg">
                    <h3 className="text-lg font-semibold text-slate-200">AI SOC Assistant</h3>
                    <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white text-2xl">&times;</button>
                </header>
                
                <div className="flex-1 p-4 overflow-y-auto space-y-4">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                            {msg.role === 'model' && <div className="w-8 h-8 rounded-full bg-blue-600 flex-shrink-0 flex items-center justify-center text-white font-bold text-sm">AI</div>}
                            <div className={`max-w-xs md:max-w-sm rounded-lg p-3 text-sm ${msg.role === 'user' ? 'bg-slate-600 text-white' : 'bg-slate-700/50 text-slate-300'}`}>
                                <div className="prose prose-sm prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: parseMarkdown(msg.content) }} />
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                         <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-600 flex-shrink-0 flex items-center justify-center text-white font-bold text-sm">AI</div>
                            <div className="max-w-xs md:max-w-sm rounded-lg p-3 text-sm bg-slate-700/50 text-slate-300 flex items-center gap-2">
                                <span className="w-2 h-2 bg-slate-400 rounded-full animate-pulse delay-0"></span>
                                <span className="w-2 h-2 bg-slate-400 rounded-full animate-pulse delay-150"></span>
                                <span className="w-2 h-2 bg-slate-400 rounded-full animate-pulse delay-300"></span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
                
                <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-700 bg-slate-900/50 rounded-b-lg">
                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            placeholder="Ask about a threat..."
                            className="flex-1 bg-slate-700 border border-slate-600 rounded-md p-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            disabled={isLoading}
                        />
                        <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white rounded-md p-2 disabled:bg-blue-800 disabled:cursor-not-allowed" disabled={isLoading}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
};

export default Chatbot;
