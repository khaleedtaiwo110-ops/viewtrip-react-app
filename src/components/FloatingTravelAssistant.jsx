
import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Sparkles,
  Send,
  Minus,
  Plus,
  MessageSquare,
  Trash2,
  PanelLeftClose,
  PanelLeftOpen,
  Globe,
  MapPin,
  Compass,
  Luggage,
  ArrowUpRight,
  Menu
} from "lucide-react";

const STORAGE_KEY = "viewtrip_ai_chat_sessions";

const DEFAULT_WELCOME = {
  role: "assistant",
  content:
    "Welcome to ViewTrip AI! ✨\n\nWhere would you love to go next? I can help you discover destinations, explore tour packages, plan an itinerary, and make the most of your travel budget."
};

const SUGGESTIONS = [
  {
    icon: Globe,
    title: "Explore destinations",
    prompt: "Suggest exciting destinations I can visit from Nigeria."
  },
  {
    icon: Compass,
    title: "Plan a trip",
    prompt: "Help me plan an unforgettable 5-day holiday."
  },
  {
    icon: Luggage,
    title: "Find a tour",
    prompt: "Help me find an interesting tour package."
  },
  {
    icon: MapPin,
    title: "Travel on a budget",
    prompt: "Suggest affordable international holiday destinations."
  }
];

const createNewSession = () => ({
  id: Date.now().toString(),
  title: "New Trip Plan",
  updatedAt: new Date().toISOString(),
  messages: [DEFAULT_WELCOME]
});

const loadSessions = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved) {
      const parsed = JSON.parse(saved);

      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (error) {
    console.error("Failed to load chat history:", error);
  }

  return [createNewSession()];
};

export default function FloatingTravelAssistant() {
  const [sessions, setSessions] = useState(loadSessions);
  const [activeSessionId, setActiveSessionId] = useState(
    () => loadSessions()[0]?.id
  );

  const [isOpen, setIsOpen] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const [position, setPosition] = useState({ x: 0, y: 0 });

  const dragRef = useRef(null);
  const hasDraggedRef = useRef(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  const activeSession =
    sessions.find((session) => session.id === activeSessionId) ||
    sessions[0];

  const messages = activeSession?.messages || [DEFAULT_WELCOME];

  // Save conversations
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    } catch (error) {
      console.error("Failed to save chat history:", error);
    }
  }, [sessions]);

  // Scroll to the latest message
  useEffect(() => {
    if (isOpen) {
      bottomRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end"
      });
    }
  }, [messages, loading, isOpen]);

  // Focus the input when opened
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => inputRef.current?.focus(), 400);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Prevent background scrolling while the assistant is open
  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  const handleNewChat = () => {
    const newSession = createNewSession();

    setSessions((previous) => [newSession, ...previous]);
    setActiveSessionId(newSession.id);
    setInput("");
  };

  const handleDeleteSession = (event, id) => {
    event.stopPropagation();

    const filtered = sessions.filter((session) => session.id !== id);

    if (filtered.length === 0) {
      const freshSession = createNewSession();

      setSessions([freshSession]);
      setActiveSessionId(freshSession.id);
      return;
    }

    setSessions(filtered);

    if (id === activeSessionId) {
      setActiveSessionId(filtered[0].id);
    }
  };

  const updateSessionMessages = (
    sessionId,
    newMessages,
    firstUserPrompt = null
  ) => {
    setSessions((previous) =>
      previous.map((session) => {
        if (session.id !== sessionId) return session;

        const updateTitle =
          firstUserPrompt && session.title === "New Trip Plan";

        return {
          ...session,
          title: updateTitle
            ? firstUserPrompt.slice(0, 32) +
              (firstUserPrompt.length > 32 ? "..." : "")
            : session.title,
          updatedAt: new Date().toISOString(),
          messages: newMessages
        };
      })
    );
  };

  // Floating button dragging
  const startDrag = (event) => {
    if (event.button !== undefined && event.button !== 0) return;

    hasDraggedRef.current = false;

    dragRef.current = {
      startX: event.clientX,
      startY: event.clientY,
      x: position.x,
      y: position.y
    };

    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const moveDrag = (event) => {
    if (!dragRef.current) return;

    const dx = event.clientX - dragRef.current.startX;
    const dy = event.clientY - dragRef.current.startY;

    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
      hasDraggedRef.current = true;
    }

    if (!hasDraggedRef.current) return;

    const maxX = Math.max(0, window.innerWidth - 90);
    const maxY = Math.max(0, window.innerHeight - 90);

    setPosition({
      x: Math.min(
        maxX,
        Math.max(-window.innerWidth + 90, dragRef.current.x + dx)
      ),
      y: Math.min(
        maxY,
        Math.max(-window.innerHeight + 90, dragRef.current.y + dy)
      )
    });
  };

  const stopDrag = () => {
    dragRef.current = null;
  };

  const handleLauncherClick = () => {
    if (hasDraggedRef.current) {
      hasDraggedRef.current = false;
      return;
    }

    setIsOpen(true);
  };

  // Send message to backend
  const sendMessage = async (customMessage = null) => {
    const message = (customMessage || input).trim();

    if (!message || loading || !activeSession) return;

    const currentSessionId = activeSession.id;

    const updatedMessages = [
      ...messages,
      { role: "user", content: message }
    ];

    updateSessionMessages(
      currentSessionId,
      updatedMessages,
      message
    );

    setInput("");
    setLoading(true);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60000);

    try {
      const history = messages
        .filter(
          (item) =>
            item &&
            ["user", "assistant"].includes(item.role) &&
            typeof item.content === "string" &&
            item.content.trim()
        )
        .slice(-8);

      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        signal: controller.signal,
        body: JSON.stringify({
          message,
          history
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "ViewTrip AI request failed.");
      }

      const replyContent =
        data.answer || data.reply || data.response;

      if (!replyContent) {
        throw new Error("The AI returned an empty response.");
      }

      updateSessionMessages(currentSessionId, [
        ...updatedMessages,
        {
          role: "assistant",
          content: replyContent
        }
      ]);
    } catch (error) {
      console.error("ViewTrip AI error:", error);

      const errorMessage =
        error.name === "AbortError"
          ? "ViewTrip AI took too long to respond. Please try again."
          : error.message ||
            "Sorry, I'm having trouble connecting right now.";

      updateSessionMessages(currentSessionId, [
        ...updatedMessages,
        {
          role: "assistant",
          content: errorMessage
        }
      ]);
    } finally {
      clearTimeout(timeout);
      setLoading(false);
    }
  };

  return (
    <>
      {/* FULL-SCREEN TRAVEL ASSISTANT */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.22 }}
            className="fixed inset-0 z-[99999] bg-white flex overflow-hidden"
          >
            {/* SIDEBAR */}
            <AnimatePresence initial={false}>
              {showSidebar && (
                <motion.aside
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 270, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.22 }}
                  className="hidden sm:flex shrink-0 flex-col bg-[#07182e] text-white overflow-hidden"
                >
                  <div className="p-5 border-b border-white/10">
                    <div className="flex items-center gap-3 mb-7">
                      <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center">
                        <Globe size={22} />
                      </div>

                      <div>
                        <h2 className="font-bold text-lg tracking-tight">
                          ViewTrip
                        </h2>
                        <p className="text-[11px] text-blue-200">
                          AI Travel Assistant
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={handleNewChat}
                      className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm px-4 py-3 rounded-xl transition"
                    >
                      <Plus size={18} />
                      Start a new trip
                    </button>
                  </div>

                  <div className="px-5 pt-6 pb-3">
                    <p className="text-[10px] font-bold uppercase tracking-[2px] text-slate-400">
                      Your conversations
                    </p>
                  </div>

                  <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-1">
                    {sessions.map((session) => {
                      const isActive = session.id === activeSessionId;

                      return (
                        <div
                          key={session.id}
                          onClick={() => {
                            setActiveSessionId(session.id);
                            setInput("");
                          }}
                          className={`group flex items-center justify-between gap-2 px-3 py-3 rounded-xl cursor-pointer transition ${
                            isActive
                              ? "bg-white/10 text-white"
                              : "text-slate-300 hover:bg-white/5"
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <MessageSquare
                              size={16}
                              className={
                                isActive
                                  ? "text-blue-400 shrink-0"
                                  : "text-slate-500 shrink-0"
                              }
                            />

                            <span className="text-sm truncate">
                              {session.title}
                            </span>
                          </div>

                          <button
                            onClick={(event) =>
                              handleDeleteSession(event, session.id)
                            }
                            className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-400 p-1 transition"
                            title="Delete conversation"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  <div className="p-5 border-t border-white/10">
                    <div className="flex items-center gap-2 text-slate-400">
                      <Sparkles size={15} />
                      <span className="text-xs">
                        Powered by ViewTrip AI
                      </span>
                    </div>
                  </div>
                </motion.aside>
              )}
            </AnimatePresence>

            {/* MAIN WORKSPACE */}
            <div className="flex-1 min-w-0 flex flex-col bg-[#f7f9fc]">
              {/* TOP NAVIGATION */}
              <header className="h-[76px] shrink-0 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-7">
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    onClick={() => setShowSidebar((previous) => !previous)}
                    className="p-2.5 rounded-xl hover:bg-gray-100 text-gray-600 transition"
                    title="Toggle conversation history"
                  >
                    {showSidebar ? (
                      <PanelLeftClose size={20} />
                    ) : (
                      <PanelLeftOpen size={20} />
                    )}
                  </button>

                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center shadow-md shadow-blue-200">
                    <Sparkles size={20} />
                  </div>

                  <div className="min-w-0">
                    <h1 className="font-bold text-gray-900 text-sm sm:text-base truncate">
                      ViewTrip AI
                    </h1>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-green-500" />
                      <p className="text-[11px] text-gray-500">
                        Your personal travel companion
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleNewChat}
                    className="hidden sm:flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
                  >
                    <Plus size={16} />
                    New chat
                  </button>

                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition"
                    title="Minimize assistant"
                    aria-label="Minimize assistant"
                  >
                    <Minus size={20} />
                  </button>
                </div>
              </header>

              {/* CHAT CONTENT */}
              <main className="flex-1 overflow-y-auto px-4 sm:px-8 py-8">
                <div className="max-w-4xl mx-auto">
                  {messages.length === 1 && (
                    <div className="mb-10 pt-5 sm:pt-12">
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-6">
                        <Sparkles size={14} />
                        YOUR NEXT ADVENTURE STARTS HERE
                      </div>

                      <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#10243e] leading-tight mb-4">
                        Where do you want
                        <br className="hidden sm:block" /> to go{" "}
                        <span className="text-blue-600">next?</span>
                      </h2>

                      <p className="text-gray-500 text-sm sm:text-base max-w-xl leading-relaxed">
                        Tell us what you're dreaming of. Discover destinations,
                        explore tours and create a trip that fits your budget.
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-8">
                        {SUGGESTIONS.map((suggestion) => {
                          const Icon = suggestion.icon;

                          return (
                            <button
                              key={suggestion.title}
                              onClick={() => sendMessage(suggestion.prompt)}
                              disabled={loading}
                              className="group text-left bg-white border border-gray-200 hover:border-blue-300 hover:shadow-lg hover:shadow-blue-100/60 rounded-2xl p-4 transition disabled:opacity-50"
                            >
                              <div className="flex items-center justify-between mb-4">
                                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition">
                                  <Icon size={19} />
                                </div>

                                <ArrowUpRight
                                  size={18}
                                  className="text-gray-400 group-hover:text-blue-600 transition"
                                />
                              </div>

                              <h3 className="font-bold text-sm text-gray-800">
                                {suggestion.title}
                              </h3>

                              <p className="text-xs text-gray-500 mt-1">
                                {suggestion.prompt}
                              </p>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  
{/* MESSAGES */}
<div className="space-y-7">
  {messages.map((msg, index) => (
    <div
      key={index}
      className={`flex gap-3 ${
        msg.role === "user" ? "justify-end" : "justify-start"
      }`}
    >
      {msg.role === "assistant" && (
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center shrink-0 shadow-sm">
          <Sparkles size={17} />
        </div>
      )}

      <div
        className={`max-w-[92%] sm:max-w-[82%] px-5 py-4 rounded-2xl ${
          msg.role === "user"
            ? "bg-blue-600 text-white rounded-br-sm shadow-md shadow-blue-100 text-sm leading-7"
            : "bg-white text-gray-700 rounded-bl-sm border border-gray-100 shadow-sm"
        }`}
      >
        {msg.role === "assistant" ? (
          <div className="text-[14px] leading-7 text-slate-600
            [&_h1]:text-2xl [&_h1]:font-extrabold [&_h1]:text-[#10243e] [&_h1]:mb-4
            [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-[#10243e] [&_h2]:mt-7 [&_h2]:mb-3
            [&_h3]:text-base [&_h3]:font-bold [&_h3]:text-[#10243e] [&_h3]:mt-5 [&_h3]:mb-2
            [&_p]:mb-3 [&_p]:leading-7
            [&_strong]:font-bold [&_strong]:text-[#10243e]
            [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-2 [&_ul]:mb-4
            [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:space-y-2 [&_ol]:mb-4
            [&_li]:pl-1
            [&_hr]:my-6 [&_hr]:border-gray-100
            [&_blockquote]:border-l-4 [&_blockquote]:border-blue-500 [&_blockquote]:pl-4 [&_blockquote]:text-gray-500
          ">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {msg.content}
            </ReactMarkdown>
          </div>
        ) : (
          <div className="whitespace-pre-wrap">
            {msg.content}
          </div>
        )}
      </div>
    </div>
  ))}

  {loading && (
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center">
        <Sparkles size={17} />
      </div>

      <div className="bg-white border border-gray-100 shadow-sm rounded-2xl px-5 py-4 flex items-center gap-2">
        <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
        <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:150ms]" />
        <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:300ms]" />
        <span className="text-xs text-gray-500 ml-2">
          Planning your next adventure...
        </span>
      </div>
    </div>
  )}

  <div ref={bottomRef} />
</div>

                </div>
              </main>

              {/* MESSAGE INPUT */}
              <footer className="shrink-0 bg-white border-t border-gray-200 px-4 sm:px-8 pt-4 pb-5">
                <div className="max-w-4xl mx-auto">
                  <form
                    onSubmit={(event) => {
                      event.preventDefault();
                      sendMessage();
                    }}
                    className="flex items-center gap-3 bg-[#f4f6fa] border border-gray-200 focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-50 rounded-2xl p-2 transition"
                  >
                    <input
                      ref={inputRef}
                      value={input}
                      onChange={(event) => setInput(event.target.value)}
                      placeholder="Ask anything about your next trip..."
                      className="flex-1 min-w-0 bg-transparent px-3 py-3 text-sm outline-none text-gray-800 placeholder:text-gray-400"
                      disabled={loading}
                    />

                    <button
                      type="submit"
                      disabled={!input.trim() || loading}
                      className="w-11 h-11 shrink-0 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white flex items-center justify-center transition shadow-md shadow-blue-100"
                      aria-label="Send message"
                    >
                      <Send size={18} />
                    </button>
                  </form>

                  <p className="text-[10px] text-gray-400 text-center mt-3">
                    ViewTrip AI can make mistakes. Confirm important travel
                    details before booking.
                  </p>
                </div>
              </footer>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FLOATING LAUNCHER */}
      {!isOpen && (
        <motion.button
          type="button"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.07 }}
          whileTap={{ scale: 0.94 }}
          onClick={handleLauncherClick}
          onPointerDown={startDrag}
          onPointerMove={moveDrag}
          onPointerUp={stopDrag}
          onPointerCancel={stopDrag}
          className="fixed bottom-6 right-6 z-[99998] w-[66px] h-[66px] rounded-full bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-800 text-white shadow-2xl shadow-blue-900/30 flex items-center justify-center cursor-grab active:cursor-grabbing select-none border-[3px] border-white"
          style={{
            transform: `translate(${position.x}px, ${position.y}px)`,
            touchAction: "none"
          }}
          aria-label="Open ViewTrip AI"
        >
          <Sparkles size={29} />

          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-green-500 border-[3px] border-white" />
        </motion.button>
      )}
    </>
  );
}
