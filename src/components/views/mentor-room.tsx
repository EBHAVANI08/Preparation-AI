'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Brain,
  Send,
  Trash2,
  Sparkles,
  Target,
  Clock,
  Heart,
  Lightbulb,
  TrendingUp,
  CalendarDays,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PageHeader, SectionTitle } from '@/components/shared';
import { useStore } from '@/lib/store';
import { cn } from '@/lib/utils';

const QUICK_PROMPTS = [
  { label: 'Explain a concept', icon: Lightbulb, prompt: 'Explain the concept of Rotational Motion with a simple example.' },
  { label: 'Improve weak topic', icon: Target, prompt: 'My weak topics are Calculus and Coordination Compounds. How should I improve them?' },
  { label: 'Score strategy', icon: TrendingUp, prompt: 'What strategy should I follow to maximise my score in the next 60 days?' },
  { label: 'Time management', icon: Clock, prompt: 'Help me create a time-management plan that balances school, coaching, and self-study.' },
  { label: 'Motivate me', icon: Heart, prompt: 'I am feeling burnt out and demotivated. Can you motivate me?' },
];

const CAPABILITIES = [
  {
    icon: Target,
    title: 'Concept Mastery',
    description: 'Get crystal-clear explanations of any topic across Physics, Chemistry, Math, Biology, English and more.',
    accent: 'emerald' as const,
  },
  {
    icon: TrendingUp,
    title: 'Score Strategy',
    description: 'Personalised tips on attempting strategy, negative marking, time allocation, and weak-topic improvement.',
    accent: 'amber' as const,
  },
  {
    icon: Heart,
    title: 'Stress Support',
    description: 'Feeling anxious or burnt out? Your mentor listens, motivates, and helps you build focus and resilience.',
    accent: 'rose' as const,
  },
];

function uid(): string {
  return Math.random().toString(36).slice(2, 11);
}

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2 mb-3">
      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0">
        <Brain className="h-4 w-4 text-white" />
      </div>
      <div className="bg-white border border-stone-200 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
        <div className="flex items-center gap-1">
          <span className="h-2 w-2 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="h-2 w-2 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="h-2 w-2 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}

export function MentorRoom() {
  const user = useStore((s) => s.user);
  const messages = useStore((s) => s.mentorMessages);
  const addMentorMessage = useStore((s) => s.addMentorMessage);
  const setMentorMessages = useStore((s) => s.setMentorMessages);
  const setView = useStore((s) => s.setView);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const userName = user?.name?.split(' ')[0] || 'aspirant';

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const userMsg = {
      id: uid(),
      role: 'user' as const,
      content: trimmed,
      timestamp: new Date().toISOString(),
    };
    addMentorMessage(userMsg);
    setInput('');
    setLoading(true);

    try {
      const history = [...messages, userMsg].map((m) => ({ role: m.role, content: m.content }));
      const res = await fetch('/api/mentor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: history,
          profile: {
            examGoal: user?.examGoal || 'JEE Main',
            name: userName,
            type: user?.type || 'school-12',
          },
        }),
      });
      const data = await res.json();
      const reply = data?.reply || "I'm here for you. Could you rephrase your question?";
      addMentorMessage({
        id: uid(),
        role: 'assistant',
        content: reply,
        timestamp: new Date().toISOString(),
      });
    } catch {
      addMentorMessage({
        id: uid(),
        role: 'assistant',
        content: "I'm having trouble connecting right now, but I'm still here. Quick tip: revise your weakest topic today and do 10 practice problems.",
        timestamp: new Date().toISOString(),
      });
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  function handleClear() {
    setMentorMessages([]);
  }

  const capabilityAccents = {
    emerald: 'from-emerald-500 to-teal-600 bg-emerald-50 text-emerald-700',
    amber: 'from-amber-500 to-orange-500 bg-amber-50 text-amber-700',
    rose: 'from-rose-500 to-pink-500 bg-rose-50 text-rose-700',
  };

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Brain}
        title="AI Mentor Room"
        subtitle="24/7 chat with GLM-4.6 — your personal academic mentor"
        accent="emerald"
        right={
          <Button variant="outline" size="sm" onClick={handleClear} disabled={messages.length === 0}>
            <Trash2 className="h-4 w-4" /> Clear
          </Button>
        }
      />

      {/* Chat Card */}
      <Card className="border-stone-200 overflow-hidden">
        <CardHeader className="border-b bg-gradient-to-r from-emerald-50 to-teal-50 py-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
            </span>
            PrepMentor · Online
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div
            ref={scrollRef}
            className="h-[60vh] min-h-[420px] overflow-y-auto p-4 sm:p-6 bg-stone-50/50"
          >
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center px-4">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg mb-4">
                  <Brain className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-stone-900">Hi {userName}, I'm your AI mentor</h3>
                <p className="text-sm text-muted-foreground mt-2 max-w-md">
                  Ask me anything about concepts, study plans, exam strategy, or just chat when you need motivation. I'm here for you 24/7.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-6 w-full max-w-2xl">
                  {QUICK_PROMPTS.map((p) => {
                    const Icon = p.icon;
                    return (
                      <button
                        key={p.label}
                        onClick={() => sendMessage(p.prompt)}
                        className="flex flex-col items-start gap-1 p-3 rounded-xl border border-stone-200 bg-white hover:border-emerald-300 hover:bg-emerald-50/50 transition text-left"
                      >
                        <Icon className="h-4 w-4 text-emerald-600" />
                        <span className="text-xs font-medium text-stone-700">{p.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                {messages.map((m) => {
                  const isUser = m.role === 'user';
                  return (
                    <div
                      key={m.id}
                      className={cn(
                        'flex items-end gap-2 mb-3',
                        isUser ? 'flex-row-reverse' : 'flex-row'
                      )}
                    >
                      {isUser ? (
                        <Avatar className="h-8 w-8 flex-shrink-0">
                          <AvatarFallback className="bg-gradient-to-br from-amber-400 to-orange-500 text-white text-xs font-semibold">
                            {userName.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0">
                          <Brain className="h-4 w-4 text-white" />
                        </div>
                      )}
                      <div
                        className={cn(
                          'max-w-[80%] sm:max-w-[70%] px-4 py-2.5 text-sm rounded-2xl shadow-sm whitespace-pre-wrap break-words',
                          isUser
                            ? 'bg-emerald-600 text-white rounded-br-sm'
                            : 'bg-white border border-stone-200 text-stone-800 rounded-bl-sm'
                        )}
                      >
                        {m.content}
                      </div>
                    </div>
                  );
                })}
                {loading && <TypingIndicator />}
              </div>
            )}
          </div>

          {/* Input bar */}
          <div className="border-t bg-white p-3 sm:p-4">
            <div className="flex gap-2 items-end">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message to your AI mentor..."
                className="min-h-[44px] resize-none border-stone-200"
                rows={1}
              />
              <Button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || loading}
                className="bg-emerald-600 hover:bg-emerald-700"
                size="icon"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1.5 text-right">
              Press <kbd className="px-1 py-0.5 bg-stone-100 rounded text-stone-600 text-[10px]">Enter</kbd> to send · <kbd className="px-1 py-0.5 bg-stone-100 rounded text-stone-600 text-[10px]">Shift+Enter</kbd> for newline
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Capabilities */}
      <div>
        <SectionTitle icon={Sparkles} title="What your mentor can do" />
        <div className="grid sm:grid-cols-3 gap-4">
          {CAPABILITIES.map((c) => {
            const Icon = c.icon;
            const accents = capabilityAccents[c.accent];
            const [grad, , text] = accents.split(' ');
            return (
              <Card key={c.title} className="p-4 border-stone-200 hover:shadow-md transition">
                <div className={cn('h-10 w-10 rounded-xl bg-gradient-to-br flex items-center justify-center mb-3', grad)}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <h4 className="font-semibold text-stone-900">{c.title}</h4>
                <p className="text-sm text-muted-foreground mt-1">{c.description}</p>
              </Card>
            );
          })}
        </div>
      </div>

      <Card className="p-4 border-stone-200 bg-gradient-to-r from-amber-50 to-orange-50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-amber-600" />
            <p className="text-sm text-stone-700">
              Want a structured plan? Open the Study Planner.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => setView('planner')} className="border-amber-300">
            Open Planner
          </Button>
        </div>
      </Card>
    </div>
  );
}
