import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  X,
  Send,
  Minus,
  Maximize2,
  Minimize2,
  Plus,
  MessageSquare,
  Trash2,
  PanelLeftClose,
  PanelLeftOpen
} from "lucide-react";

const STORAGE_KEY = "viewtrip_ai_chat_sessions";

const DEFAULT_WELCOME = {
  role: "assistant",
  content:
    "Hello! I'm your ViewTrip AI travel assistant. Tell me where you'd love to go, or give me your budget and I'll help you explore your options."
};

const createNewSession = () => ({
  id: Date.now().toString(),
  title: "New Trip Plan",
  updatedAt: new Date().toISOString(),
  messages: [DEFAULT_WELCOME]
});

export default function FloatingTravelAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // Load sessions from localStorage
  const [sessions, setSessions] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error("Failed to parse chat history:", e);
    }
    return [createNewSession()];
  });

  const [activeSessionId, setActiveSessionId] = useState(() => sessions[0]?.id);

  // Dragging state
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const dragRef = useRef(null);
  const hasDraggedRef = useRef(false);
  const bottomRef = useRef(null);

  // Sync sessions to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    } catch (e) {
      console.error("Failed to save chat history:", e);
    }
  }, [sessions]);

  const activeSession =
    sessions.find((s) => s.id === activeSessionId) || sessions[0];
  const messages = activeSession?.messages || [DEFAULT_WELCOME];

  // Scroll to bottom when messages change
  useEffect(() => {
    if (isOpen) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, isExpanded]);

  const handleNewChat = () => {
    const newSession = createNewSession();
    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
    setInput("");
  };

  const handleDeleteSession = (e, id) => {
    e.stopPropagation();
    setSessions((prev) => {
      const filtered = prev.filter((s) => s.id !== id);
      if (filtered.length === 0) {
        const fresh = createNewSession();
        setActiveSessionId(fresh.id);
        return [fresh];
      }
      if (id === activeSessionId) {
        setActiveSessionId(filtered[0].id);
      }
      return filtered;
    });
  };

  const startDrag = (e) => {
    if (isExpanded) return;
    if (e.button !== undefined && e.button !== 0) return;

    e.preventDefault();
    hasDraggedRef.current = false;

    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      x: position.x,
      y: position.y
    };

    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const moveDrag = (e) => {
    if (!dragRef.current || isExpanded) return;

    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;

    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
      hasDraggedRef.current = true;
    }

    const maxX = Math.max(0, window.innerWidth - 90);
    const maxY = Math.max(0, window.innerHeight - 90);

    setPosition({
      x: Math.min(maxX, Math.max(-window.innerWidth + 90, dragRef.current.x + dx)),
      y: Math.min(maxY, Math.max(-window.innerHeight + 90, dragRef.current.y + dy))
    });
  };

  const stopDrag = () => {
    dragRef.current = null;
  };

  const updateSessionMessages = (sessionId, newMessages, firstUserPrompt = null) => {
    setSessions((prev) =>
      prev.map((session) => {
        if (session.id !== sessionId) return session;
        const shouldUpdateTitle =
          firstUserPrompt && session.title === "New Trip Plan";
        return {
          ...session,
          title: shouldUpdateTitle
            ? firstUserPrompt.slice(0, 32) +
              (firstUserPrompt.length > 32 ? "..." : "")
            : session.title,
          updatedAt: new Date().toISOString(),
          messages: newMessages
        };
      })
    );
  };

  
const sendMessage = async () => {
  const message = input.trim();

  if (!message || loading || !activeSession) return;

  const currentSessionId = activeSession.id;

  // Keep the complete conversation in localStorage,
  // but send only the latest 8 messages to the backend.
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
    console.log("Sending message to ViewTrip AI...");

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

    console.log("Backend response status:", response.status);

    const data = await response.json();

    console.log("Backend response data:", data);

    if (!response.ok) {
      throw new Error(
        data.error || "ViewTrip AI request failed."
      );
    }

    const replyContent =
      data.answer ||
      data.reply ||
      data.response;

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
    console.log("ViewTrip AI request finished.");
  }
};


  return (
    <>
      {/* Backdrop when expanded */}
      <AnimatePresence>
        {isOpen && isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsExpanded(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs z-[9998]"
          />
        )}
      </AnimatePresence>

      <div
        className={
          isOpen && isExpanded
            ? "fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 pointer-events-none"
            : "fixed bottom-6 right-6 z-[9999]"
        }
        style={
          isOpen && isExpanded
            ? undefined
            : { transform: `translate(${position.x}px, ${position.y}px)` }
        }
      >
        <AnimatePresence>
          {isOpen && (
            <motion.div
              layout
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 320, damping: 28 }}
              className={`pointer-events-auto bg-white shadow-2xl border border-gray-200 flex overflow-hidden ${
                isExpanded
                  ? "w-full max-w-5xl h-[85vh] rounded-2xl"
                  : "absolute bottom-20 right-0 w-[min(390px,calc(100vw-32px))] h-[520px] max-h-[75vh] rounded-3xl"
              }`}
            >
              {/* Left History Sidebar */}
              <AnimatePresence initial={false}>
                {(isExpanded ? showSidebar : showSidebar && false) ||
                (showSidebar && isExpanded) ? (
                  <motion.aside
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 260, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="bg-slate-900 text-slate-200 flex flex-col border-r border-slate-800 shrink-0 overflow-hidden"
                  >
                    <div className="p-3 border-b border-slate-800">
                      <button
                        type="button"
                        onClick={handleNewChat}
                        className="w-full flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-3 py-2.5 rounded-xl transition cursor-pointer"
                      >
                        <Plus size={17} />
                        <span>New Trip Chat</span>
                      </button>
                    </div>

                    <div className="px-3 pt-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      Recent Conversations
                    </div>

                    <div className="flex-1 overflow-y-auto px-2 py-1 space-y-1">
                      {sessions.map((session) => {
                        const isActive = session.id === activeSession.id;
                        return (
                          <div
                            key={session.id}
                            onClick={() => setActiveSessionId(session.id)}
                            className={`group flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl text-sm cursor-pointer transition ${
                              isActive
                                ? "bg-slate-800 text-white font-medium"
                                : "text-slate-300 hover:bg-slate-800/60"
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <MessageSquare
                                size={15}
                                className={
                                  isActive ? "text-blue-400 shrink-0" : "text-slate-500 shrink-0"
                                }
                              />
                              <span className="truncate">{session.title}</span>
                            </div>

                            <button
                              type="button"
                              onClick={(e) => handleDeleteSession(e, session.id)}
                              className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 rounded transition"
                              title="Delete chat"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        );
                      })}
                    </div>

                    <div className="p-3 border-t border-slate-800 text-[11px] text-slate-400">
                      ViewTrip AI Workspace
                    </div>
                  </motion.aside>
                ) : null}
              </AnimatePresence>

              {/* Compact Mode History Drawer (if toggled while not expanded) */}
              {!isExpanded && showSidebar && (
                <div className="w-48 bg-slate-900 text-slate-200 flex flex-col border-r border-slate-800 shrink-0">
                  <div className="p-2.5 border-b border-slate-800">
                    <button
                      type="button"
                      onClick={handleNewChat}
                      className="w-full flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium px-2.5 py-2 rounded-lg transition"
                    >
                      <Plus size={14} />
                      <span>New Chat</span>
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-1.5 space-y-1">
                    {sessions.map((session) => (
                      <div
                        key={session.id}
                        onClick={() => setActiveSessionId(session.id)}
                        className={`group flex items-center justify-between gap-1 px-2 py-2 rounded-lg text-xs cursor-pointer ${
                          session.id === activeSession.id
                            ? "bg-slate-800 text-white"
                            : "text-slate-300 hover:bg-slate-800/50"
                        }`}
                      >
                        <span className="truncate">{session.title}</span>
                        <button
                          type="button"
                          onClick={(e) => handleDeleteSession(e, session.id)}
                          className="opacity-0 group-hover:opacity-100 hover:text-red-400"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Main Chat Area */}
              <div className="flex-1 flex flex-col min-w-0 bg-white">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-700 to-blue-500 text-white px-4 py-3.5 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <button
                      type="button"
                      onClick={() => setShowSidebar((prev) => !prev)}
                      className="p-1.5 hover:bg-white/20 rounded-lg transition"
                      title={showSidebar ? "Hide history" : "Show history"}
                    >
                      {showSidebar ? (
                        <PanelLeftClose size={18} />
                      ) : (
                        <PanelLeftOpen size={18} />
                      )}
                    </button>

                    <div className="bg-white/20 p-2 rounded-xl shrink-0">
                      <Sparkles size={18} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-sm truncate">
                        {isExpanded ? activeSession.title : "ViewTrip AI"}
                      </h3>
                      <p className="text-[11px] text-blue-100 truncate">
                        Your personal travel assistant
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {!isExpanded && (
                      <button
                        type="button"
                        onClick={handleNewChat}
                        className="p-2 hover:bg-white/20 rounded-lg transition"
                        title="New chat"
                      >
                        <Plus size={18} />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => setIsExpanded((prev) => !prev)}
                      className="p-2 hover:bg-white/20 rounded-lg transition"
                      title={isExpanded ? "Collapse window" : "Expand window"}
                      aria-label={isExpanded ? "Collapse assistant" : "Expand assistant"}
                    >
                      {isExpanded ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsExpanded(false);
                        setIsOpen(false);
                      }}
                      className="p-2 hover:bg-white/20 rounded-lg transition"
                      title="Close"
                      aria-label="Close assistant"
                    >
                      <Minus size={19} />
                    </button>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-gray-50">
                  <div
                    className={`space-y-4 ${
                      isExpanded ? "max-w-3xl mx-auto w-full" : ""
                    }`}
                  >
                    {messages.map((msg, index) => (
                      <div
                        key={index}
                        className={`flex ${
                          msg.role === "user" ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                            isExpanded ? "max-w-[75%]" : "max-w-[85%]"
                          } ${
                            msg.role === "user"
                              ? "bg-blue-600 text-white rounded-br-md"
                              : "bg-white text-gray-700 shadow-sm border border-gray-100 rounded-bl-md"
                          }`}
                        >
                          {msg.content}
                        </div>
                      </div>
                    ))}

                    {loading && (
                      <div className="bg-white rounded-xl p-3 w-fit text-xs text-gray-500 shadow-sm border border-gray-100">
                        ViewTrip AI is thinking...
                      </div>
                    )}

                    <div ref={bottomRef} />
                  </div>
                </div>

                {/* Input */}
                <div className="p-3 sm:p-4 border-t bg-white shrink-0">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      sendMessage();
                    }}
                    className={`flex items-center gap-2 ${
                      isExpanded ? "max-w-3xl mx-auto w-full" : ""
                    }`}
                  >
                    <input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Plan your next adventure..."
                      className="flex-1 min-w-0 bg-gray-100 rounded-full px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-400"
                      disabled={loading}
                    />

                    <button
                      type="submit"
                      disabled={!input.trim() || loading}
                      className="bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white p-3 rounded-full transition shrink-0"
                      aria-label="Send message"
                    >
                      <Send size={17} />
                    </button>
                  </form>
                  <p className="text-[10px] text-gray-400 text-center mt-2">
                    Travel suggestions and estimates by ViewTrip AI
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating draggable launcher button (hidden when expanded) */}
        {!(isOpen && isExpanded) && (
          <motion.button
            type="button"
            onClick={() => {
              if (!hasDraggedRef.current) {
                setIsOpen((prev) => !prev);
              }
            }}
            onPointerDown={startDrag}
            onPointerMove={moveDrag}
            onPointerUp={stopDrag}
            onPointerCancel={stopDrag}
            className="relative w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 text-white shadow-xl flex items-center justify-center hover:scale-105 transition cursor-grab active:cursor-grabbing select-none"
            style={{ touchAction: "none" }}
            aria-label="Open ViewTrip AI"
          >
            {isOpen ? <X size={26} /> : <Sparkles size={27} />}

            {!isOpen && (
              <span className="absolute -top-1 -right-1 bg-green-500 border-2 border-white w-4 h-4 rounded-full" />
            )}
          </motion.button>
        )}
      </div>
    </>
  );
}