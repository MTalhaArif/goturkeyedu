"use client";
import { useState, useRef, useEffect } from "react";
import { useLanguage } from "@/app/context/LanguageContext";

export default function ChatWidget() {
  const { t, lang } = useLanguage();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const listRef = useRef(null);
  const isRtl = lang === "AR";

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, open]);

  async function sendMessage(e) {
    e.preventDefault();
    const text = input.trim();
    if (!text || sending) return;

    const nextMessages = [...messages, { role: "user", content: text }];
    setMessages([...nextMessages, { role: "assistant", content: "" }]);
    setInput("");
    setSending(true);

    try {
      const res = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
      });

      if (!res.ok || !res.body) throw new Error("Request failed");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let assistantText = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        assistantText += decoder.decode(value, { stream: true });
        setMessages(prev => {
          const copy = [...prev];
          copy[copy.length - 1] = { role: "assistant", content: assistantText };
          return copy;
        });
      }
    } catch {
      setMessages(prev => {
        const copy = [...prev];
        copy[copy.length - 1] = { role: "assistant", content: t.chatbotErrorMsg };
        return copy;
      });
    } finally {
      setSending(false);
    }
  }

  return (
    <div style={{ position: "fixed", bottom: 24, [isRtl ? "left" : "right"]: 24, zIndex: 1000 }} dir={isRtl ? "rtl" : "ltr"}>
      {open && (
        <div style={{ width: 340, maxWidth: "calc(100vw - 48px)", height: 460, maxHeight: "calc(100vh - 140px)", background: "white", borderRadius: 16, boxShadow: "0 12px 40px rgba(0,0,0,0.25)", display: "flex", flexDirection: "column", overflow: "hidden", marginBottom: 12 }}>
          <div style={{ background: "var(--secondary)", color: "white", padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontWeight: 700, fontSize: 15 }}>🇹🇷 {t.chatbotWidgetTitle}</span>
            <button onClick={() => setOpen(false)} aria-label="Close" style={{ background: "none", border: "none", color: "white", fontSize: 20, cursor: "pointer", lineHeight: 1 }}>×</button>
          </div>

          <div ref={listRef} style={{ flex: 1, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 12, background: "#f8fafc" }}>
            <div style={{ alignSelf: "flex-start", background: "white", border: "1px solid var(--border)", borderRadius: 12, padding: "10px 14px", fontSize: 13.5, lineHeight: 1.6, maxWidth: "85%" }}>
              {t.chatbotWelcomeMsg}
            </div>
            {messages.map((m, i) => (
              <div key={i} style={{
                alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                background: m.role === "user" ? "var(--primary)" : "white",
                color: m.role === "user" ? "white" : "var(--text-main)",
                border: m.role === "user" ? "none" : "1px solid var(--border)",
                borderRadius: 12, padding: "10px 14px", fontSize: 13.5, lineHeight: 1.6, maxWidth: "85%", whiteSpace: "pre-wrap",
              }}>
                {m.content || (sending && i === messages.length - 1 ? t.chatbotThinking : "")}
              </div>
            ))}
          </div>

          <form onSubmit={sendMessage} style={{ display: "flex", gap: 8, padding: 12, borderTop: "1px solid var(--border)", background: "white" }}>
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={t.chatbotInputPlaceholder}
              className="form-input"
              style={{ flex: 1, fontSize: 13.5 }}
              disabled={sending}
            />
            <button type="submit" className="btn-primary" disabled={sending || !input.trim()} style={{ padding: "8px 16px", fontSize: 13.5 }}>
              {t.chatbotSendBtn}
            </button>
          </form>
        </div>
      )}

      <button
        onClick={() => setOpen(o => !o)}
        aria-label={t.chatbotOpenLabel}
        style={{
          width: 58, height: 58, borderRadius: "50%", border: "none", cursor: "pointer",
          background: "var(--primary)", color: "white", fontSize: 26, boxShadow: "0 6px 20px rgba(224,60,49,0.4)",
          display: "flex", alignItems: "center", justifyContent: "center", marginLeft: isRtl ? 0 : "auto", marginRight: isRtl ? "auto" : 0,
        }}
      >
        {open ? "×" : "💬"}
      </button>
    </div>
  );
}
