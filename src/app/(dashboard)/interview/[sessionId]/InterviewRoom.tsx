"use client";

import { useChat, type UIMessage } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Send, Square } from "lucide-react";
import { type InterviewSession } from "@/lib/db/schema";
import { Kicker, PageHeader } from "@/components/ui/role-ready";
import toast from "react-hot-toast";

const END_PHRASE = "that concludes our interview";

function getMessageText(message: UIMessage): string {
  if (!message.parts) return "";
  return message.parts
    .filter((p): p is { type: "text"; text: string } => p.type === "text")
    .map((p) => p.text)
    .join("");
}

export function InterviewRoom({ session }: { session: InterviewSession }) {
  const router                          = useRouter();
  const bottomRef                       = useRef<HTMLDivElement>(null);
  const hasInitialized                  = useRef(false);
  const [input,         setInput]       = useState("");
  const [ending,        setEnding]      = useState(false);
  const [elapsed,       setElapsed]     = useState(0);
  const [interviewDone, setInterviewDone] = useState(false);

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
      body: { sessionId: session.id },
    }),
    onFinish: async ({ message }: { message: UIMessage }) => {
      await fetch(`/api/sessions/${session.id}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ messages: [...messages, message] }),
      });
      if (getMessageText(message).toLowerCase().includes(END_PHRASE)) {
        setInterviewDone(true);
      }
    },
    onError: (error) => {
      console.error("[useChat error]", error);
    },
  });

  const isLoading = status === "streaming" || status === "submitted";

  // Send the first message to kick off the interview
  useEffect(() => {
    console.log("🔵 effect fired, initialized:", hasInitialized.current);
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    setTimeout(() => {
      console.log("🟡 about to send");
      sendMessage({ parts: [{ type: "text", text: "Please begin the interview." }] });
    }, 800);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Timer
  useEffect(() => {
    const t = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const formatTime = (s: number) => {
    const m   = Math.floor(s / 60).toString().padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  };

  const assistantMessages = messages.filter((m: UIMessage) => m.role === "assistant");
  const questionCount     = Math.min(assistantMessages.length + 1, 8);
  const progress          = Math.round((questionCount / 8) * 100);

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleSend() {
    if (!input.trim() || isLoading || interviewDone) return;
    sendMessage({ parts: [{ type: "text", text: input.trim() }] });
    setInput("");
  }

  async function handleEndInterview() {
    const toastId = toast.loading("Saving session…");
    await fetch(`/api/sessions/${session.id}`, {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({
        status:          "completed",
        completedAt:     new Date().toISOString(),
        durationSeconds: elapsed,
        messages,
      }),
    });
    toast.success("Session saved! Generating scorecard…", { id: toastId });
    router.push(`/sessions/${session.id}`);
  }

  // Visible messages — hide the invisible trigger
  const visibleMessages = messages.filter(
    (m: UIMessage, i: number) => !(i === 0 && m.role === "user" && getMessageText(m) === "Please begin the interview.")
  );

  const hasAIResponse = visibleMessages.some((m: UIMessage) => m.role === "assistant");

  return (
    <main className="mx-auto flex min-h-[calc(100vh-3.5rem)] max-w-5xl flex-col p-4 sm:p-6 lg:min-h-screen lg:p-8">

      {/* Header */}
      <PageHeader
        title="Live interview"
        eyebrow={`${session.role} · ${session.interviewType}`}
        action={
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs text-destructive">{formatTime(elapsed)}</span>
            <button
              onClick={() => setEnding(true)}
              className="flex items-center gap-1.5 border border-border bg-card px-3 py-1.5 text-xs font-semibold hover:bg-secondary transition-colors"
            >
              <Square className="size-3" /> End
            </button>
          </div>
        }
      />

      {/* Progress */}
      <div className="mt-5 flex items-center justify-between border-b border-border pb-4">
        <Kicker>Question {questionCount} of 8</Kicker>
        <div className="h-1.5 w-40 bg-secondary">
          <div className="h-full bg-info transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Messages */}
      <section className="flex-1 space-y-6 overflow-auto py-8">

        {/* Loading indicator — until first AI message */}
        {!hasAIResponse && (
          <div className="flex items-center gap-3">
            <div className="h-4 w-1.5 animate-blink bg-foreground" />
            <span className="font-mono text-xs text-muted-foreground">
              Interviewer is preparing your first question…
            </span>
          </div>
        )}

        {visibleMessages.map((m: UIMessage, i: number) => {
          const isAI       = m.role === "assistant";
          const isLast     = i === visibleMessages.length - 1;
          const isStreaming = isLast && isAI && isLoading;
          const text        = getMessageText(m);

          return (
            <div
              key={m.id}
              className={
                isAI
                  ? "max-w-2xl border-l-2 border-accent bg-card p-5"
                  : "ml-auto max-w-2xl border-r-2 border-info bg-card p-5"
              }
            >
              <Kicker className={isAI ? "text-warning" : "text-info"}>
                {isAI ? "Interviewer" : "You"}
              </Kicker>
              <p className="mt-2 leading-relaxed">{text}</p>
              {isStreaming && (
                <span className="mt-3 inline-block h-4 w-1.5 animate-blink bg-foreground" />
              )}
            </div>
          );
        })}

        {/* Interview complete banner */}
        {interviewDone && (
          <div className="border border-accent/40 bg-accent/10 p-5">
            <Kicker className="text-accent">Interview complete</Kicker>
            <p className="mt-2 text-sm">Ready to see your scorecard?</p>
            <button
              onClick={handleEndInterview}
              className="mt-4 bg-accent px-4 py-2 text-sm font-bold text-accent-foreground hover:opacity-90 transition-opacity"
            >
              View scorecard →
            </button>
          </div>
        )}

        <div ref={bottomRef} />
      </section>

      {/* Input */}
      <div className="sticky bottom-0 border-t border-border bg-background pt-4">
        <div className="flex items-end gap-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading || interviewDone}
            rows={4}
            placeholder="Answer in your own words…"
            className="min-h-24 w-full resize-none border border-input bg-card px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-1 disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim() || interviewDone}
            aria-label="Send answer"
            className="grid size-12 shrink-0 place-items-center bg-foreground text-background hover:opacity-90 transition-opacity disabled:opacity-40"
          >
            <Send className="size-4" />
          </button>
        </div>
        <p className="mt-2 font-mono text-[9px] uppercase text-muted-foreground">
          Enter to send · Shift + Enter for new line
        </p>
      </div>

      {/* End dialog */}
      {ending && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md border border-border bg-background p-6">
            <h2 className="text-lg font-extrabold">End this interview?</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Your scorecard will be generated from the conversation so far.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setEnding(false)}
                className="flex-1 border border-border py-2.5 text-sm font-semibold hover:bg-secondary transition-colors"
              >
                Keep practicing
              </button>
              <button
                onClick={handleEndInterview}
                className="flex-1 bg-foreground py-2.5 text-sm font-semibold text-background hover:opacity-90 transition-opacity"
              >
                End and view scorecard
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}