import React, { useState, useRef, useEffect } from "react";
import { FaPaperPlane, FaRobot, FaUser, FaTimes } from "react-icons/fa";
import { chatWithContent } from "../api/contentApi";

function ChatModal({ isOpen, onClose, fileId, fileName }) {
  const [messages, setMessages] = useState([
    { role: "ai", text: `Hello! I've read "${fileName}". Ask me anything about it.` }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!isOpen) return null;

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input;
    setMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setInput("");
    setLoading(true);

    try {
      const res = await chatWithContent(fileId, userMsg);
      setMessages((prev) => [...prev, { role: "ai", text: res.data.answer }]);
    } catch (err) {
      setMessages((prev) => [...prev, { role: "ai", text: "Sorry, I couldn't process that request." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-950 w-full max-w-lg h-[600px] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 dark:border-slate-800">

        {/* Header */}
        <div className="bg-slate-50 dark:bg-slate-900 px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-full text-purple-600">
              <FaRobot />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">AI Assistant</h3>
              <p className="text-xs text-slate-500 truncate max-w-[200px]">{fileName}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <FaTimes />
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-100 dark:bg-slate-900/50">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`flex gap-3 max-w-[80%] ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>

                {/* Avatar */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === "user" ? "bg-sky-600 text-white" : "bg-purple-600 text-white"}`}>
                  {msg.role === "user" ? <FaUser className="text-xs" /> : <FaRobot className="text-xs" />}
                </div>

                {/* Bubble */}
                <div className={`p-3 text-sm rounded-2xl shadow-sm ${
                  msg.role === "user"
                    ? "bg-sky-600 text-white rounded-tr-none"
                    : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-tl-none border border-slate-200 dark:border-slate-700"
                }`}>
                  <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
               <div className="flex gap-3 max-w-[80%]">
                 <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center shrink-0 animate-pulse">
                   <FaRobot className="text-xs" />
                 </div>
                 <div className="bg-white dark:bg-slate-800 p-3 rounded-2xl rounded-tl-none border border-slate-200 dark:border-slate-700">
                   <div className="flex gap-1">
                     <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                     <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-75"></div>
                     <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150"></div>
                   </div>
                 </div>
               </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <form onSubmit={handleSend} className="p-3 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex gap-2">
          <input
            type="text"
            className="flex-1 bg-slate-100 dark:bg-slate-900 border-0 rounded-full px-4 text-sm focus:ring-2 focus:ring-sky-500 outline-none dark:text-white"
            placeholder="Ask a question about this document..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="w-10 h-10 bg-sky-600 text-white rounded-full flex items-center justify-center hover:bg-sky-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaPaperPlane className="text-sm ml-0.5" />
          </button>
        </form>
      </div>
    </div>
  );
}

export default ChatModal;