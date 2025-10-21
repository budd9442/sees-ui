'use client';

import { useState, useMemo } from 'react';
import { MessageCircle, X, Send, GraduationCap, Info, BookOpen, Route, Award, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useAppStore } from '@/stores/appStore';

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  ts: number;
};

export default function Chatbot() {
  const { user } = useAuthStore();
  const { students, modules, pathwayDemand } = useAppStore();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([{
    id: 'm1', role: 'assistant', ts: Date.now(),
    content: 'Hi! I\'m your SEES academic assistant. I can help with pathway selection, module information, credit requirements, GPA guidance, and general academic questions based on the MIT/IT curriculum guide.'
  }]);

  const currentStudent = useMemo(() => students.find(s => s.id === user?.id), [students, user]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isLoading) return;
    
    console.log('=== CHATBOT CLIENT DEBUG START ===');
    console.log('User message:', text);
    
    const userMsg: ChatMessage = { id: crypto.randomUUID(), role: 'user', content: text, ts: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const userContext = {
        student: currentStudent ? {
          id: currentStudent.id,
          academicYear: currentStudent.academicYear,
          degreeProgram: currentStudent.degreeProgram,
          specialization: currentStudent.specialization,
          currentGPA: currentStudent.currentGPA,
          totalCredits: currentStudent.totalCredits
        } : null,
        user: user ? {
          role: user.role,
          name: user.name
        } : null,
        pathwayDemand,
        availableModules: modules.slice(0, 20).map(m => ({
          code: m.code,
          title: m.title,
          academicYear: m.academicYear,
          semester: m.semester,
          credits: m.credits
        }))
      };

      console.log('Sending request to /api/chat with context:', userContext);

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: text,
          userContext
        })
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API error response:', errorText);
        throw new Error(`API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('API response data:', data);
      
      const aiResponse = data.response || 'Sorry, I could not generate a response.';
      console.log('Final AI response:', aiResponse);
      
      const botMsg: ChatMessage = { id: crypto.randomUUID(), role: 'assistant', content: aiResponse, ts: Date.now() };
      setMessages(prev => [...prev, botMsg]);
      console.log('=== CHATBOT CLIENT DEBUG END (SUCCESS) ===');
    } catch (error) {
      console.error('Chat error:', error);
      console.log('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      const errorMsg: ChatMessage = { 
        id: crypto.randomUUID(), 
        role: 'assistant', 
        content: `Sorry, I encountered an error: ${error.message}. Please try again or contact support if the issue persists.`, 
        ts: Date.now() 
      };
      setMessages(prev => [...prev, errorMsg]);
      console.log('=== CHATBOT CLIENT DEBUG END (ERROR) ===');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        aria-label="Open chatbot"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-primary text-white shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-primary/40 flex items-center justify-center"
      >
        <MessageCircle className="h-6 w-6" />
      </button>

      {/* Panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-[360px] max-w-[90vw] rounded-xl border bg-background shadow-2xl">
          <div className="flex items-center justify-between p-3 border-b">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-primary" />
              <span className="font-semibold">SEES Assistant</span>
            </div>
            <button aria-label="Close" onClick={() => setIsOpen(false)} className="p-1 rounded hover:bg-muted">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="p-3 space-y-3 max-h-[50vh] overflow-y-auto">
            {messages.map(m => (
              <div key={m.id} className={`text-sm ${m.role === 'assistant' ? 'text-muted-foreground' : 'text-foreground'}`}>
                {m.role === 'assistant' ? (
                  <div className="flex items-start gap-2">
                    <Info className="h-4 w-4 mt-0.5 text-primary" />
                    <p className="whitespace-pre-line">{m.content}</p>
                  </div>
                ) : (
                  <div className="flex items-start gap-2">
                    <Send className="h-4 w-4 mt-0.5" />
                    <p className="whitespace-pre-line">{m.content}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="p-3 border-t">
            <div className="flex items-center gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
                placeholder="Ask about pathways, credits, modules..."
                className="flex-1 h-10 rounded-md border bg-background px-3 text-sm focus:outline-none"
              />
              <button
                onClick={handleSend}
                disabled={isLoading}
                className="h-10 px-3 rounded-md bg-primary text-white text-sm hover:opacity-95 disabled:opacity-50 flex items-center gap-2"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                {isLoading ? 'Sending...' : 'Send'}
              </button>
            </div>
            <div className="mt-2 flex flex-wrap gap-2 text-xs">
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-muted"><Route className="h-3 w-3" /> Pathway</span>
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-muted"><Award className="h-3 w-3" /> Specialization</span>
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-muted"><BookOpen className="h-3 w-3" /> Module</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}


