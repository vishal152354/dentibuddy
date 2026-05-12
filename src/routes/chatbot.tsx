import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/auth-context";
import { MobileShell, PageHeader } from "@/components/mobile-shell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Sparkles } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/chatbot")({
  component: ChatbotPage,
  ssr: false,
});

type Msg = { role: "user" | "assistant"; content: string };

const STARTERS = [
  "How often should my 4-year-old brush?",
  "My child has tooth pain — what should I do?",
  "When should kids start flossing?",
  "Tips to help my toddler love brushing",
];

function ChatbotPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: "Hi! I'm Buddy 🦷 — your friendly pediatric dental assistant. Ask me anything about your child's smile!" },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy]);

  async function send(text: string) {
    if (!text.trim() || busy) return;
    const next: Msg[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setBusy(true);

    try {
      const { data, error } = await supabase.functions.invoke("dental-chat", {
        body: { messages: next.filter((m) => m.role !== "assistant" || messages.indexOf(m) > 0).map((m) => ({ role: m.role, content: m.content })) },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      const reply: string = data?.reply ?? "Sorry, I couldn't think of an answer.";
      setMessages([...next, { role: "assistant", content: reply }]);
      if (user) {
        await supabase.from("chat_messages").insert([
          { user_id: user.id, role: "user", content: text },
          { user_id: user.id, role: "assistant", content: reply },
        ]);
      }
    } catch (e: any) {
      toast.error(e.message ?? "Buddy is unavailable right now");
      setMessages([...next, { role: "assistant", content: "Sorry, I'm having a brief hiccup. Please try again in a moment." }]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <MobileShell>
      <PageHeader title="Buddy AI 🦷" subtitle="Your pediatric dental assistant" />
      <div ref={scrollRef} className="px-5 pb-4 max-h-[calc(100dvh-260px)] overflow-y-auto space-y-3">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-[var(--shadow-card)] ${
              m.role === "user"
                ? "bg-primary text-primary-foreground rounded-br-sm"
                : "bg-card border border-border rounded-bl-sm"
            }`}>
              {m.content}
            </div>
          </div>
        ))}
        {busy && (
          <div className="flex justify-start">
            <div className="bg-card border border-border rounded-2xl rounded-bl-sm px-4 py-2.5 text-sm text-muted-foreground inline-flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" />
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce [animation-delay:0.15s]" />
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce [animation-delay:0.3s]" />
            </div>
          </div>
        )}
        {messages.length === 1 && (
          <div className="pt-2">
            <p className="text-xs font-medium text-muted-foreground mb-2 inline-flex items-center gap-1">
              <Sparkles className="h-3 w-3" /> Try asking
            </p>
            <div className="flex flex-wrap gap-2">
              {STARTERS.map((s) => (
                <button key={s} onClick={() => send(s)} className="text-xs rounded-full bg-secondary text-secondary-foreground px-3 py-1.5 hover:bg-accent">
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); send(input); }}
        className="fixed bottom-16 left-0 right-0 sm:left-1/2 sm:-translate-x-1/2 sm:max-w-[430px] px-4 py-3 bg-background/90 backdrop-blur border-t border-border"
      >
        <div className="flex gap-2">
          <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask Buddy anything…" className="h-11 rounded-2xl bg-card" />
          <Button type="submit" size="icon" disabled={busy || !input.trim()} className="h-11 w-11 rounded-2xl shrink-0"><Send className="h-4 w-4" /></Button>
        </div>
      </form>
    </MobileShell>
  );
}
