import { useState, useRef, useEffect } from "react";
import Icon from "@/components/ui/icon";
import type { Contact, Message, User } from "@/data/mockData";

interface Props {
  contact: Contact | null;
  messages: Message[];
  onSend: (text: string) => void;
  currentUser: User;
  showTranslator: boolean;
  setShowTranslator: (v: boolean) => void;
  invisibleRead: boolean;
  setInvisibleRead: (v: boolean) => void;
  onCallStart: () => void;
  onVideoCallStart: () => void;
  onBack?: () => void;
  pinnedMsg?: Message | null;
}

export default function ChatArea({
  contact, messages, onSend, showTranslator, setShowTranslator,
  invisibleRead, setInvisibleRead, onCallStart, onVideoCallStart, onBack, pinnedMsg,
}: Props) {
  const [inputText, setInputText] = useState("");
  const [translateLang, setTranslateLang] = useState("EN");
  const [showAttach, setShowAttach] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const EMOJIS = ["😊","😂","❤️","👍","🔥","🎉","😭","🙏","😍","😅","🤣","✨","😢","🥰","😎","🤔","👏","😏","🫡","💯","🚀","🎯","💪","🙌"];
  const ATTACH_OPTIONS = [
    { icon: "Image", label: "Фото", color: "#2A5CFF" },
    { icon: "FileText", label: "Файл", color: "#FF9F43" },
    { icon: "Music", label: "Аудио", color: "#FF6B6B" },
    { icon: "MapPin", label: "Геолокация", color: "#00C48C" },
    { icon: "Cloud", label: "Из облака", color: "#A55EEA" },
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!inputText.trim()) return;
    onSend(inputText.trim());
    setInputText("");
    setReplyTo(null);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
    if (e.key === "Escape") { setReplyTo(null); setShowEmoji(false); setShowAttach(false); }
  };

  if (!contact) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center animate-fade-in" style={{ background: "var(--mrax-bg)" }}>
        <div className="w-24 h-24 rounded-3xl flex items-center justify-center mb-6 font-bold text-3xl text-white shadow-xl" style={{ background: "var(--mrax-accent)" }}>MX</div>
        <h2 className="text-2xl font-bold mb-2" style={{ color: "var(--mrax-text)" }}>MRAX Мессенджер</h2>
        <p className="text-sm text-center max-w-xs mb-8 leading-relaxed" style={{ color: "var(--mrax-text-secondary)" }}>
          Выберите чат в списке слева, чтобы начать общение.<br />Все сообщения защищены сквозным шифрованием.
        </p>
        <div className="flex gap-4">
          {[
            { icon: "Languages", label: "Переводчик", desc: "Реальное время" },
            { icon: "EyeOff", label: "Невидимость", desc: "Скрыть прочтение" },
            { icon: "Cloud", label: "Хранилище", desc: "Drive & Dropbox" },
          ].map((f, i) => (
            <div key={i} className="flex flex-col items-center gap-2.5 px-5 py-4 rounded-2xl animate-fade-in"
              style={{ background: "var(--mrax-chat-bg)", border: "1px solid var(--mrax-border)", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", animationDelay: `${i * 80}ms` }}>
              <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: "var(--mrax-accent-light)" }}>
                <Icon name={f.icon as Parameters<typeof Icon>[0]["name"]} size={22} style={{ color: "var(--mrax-accent)" }} />
              </div>
              <div className="text-center">
                <div className="font-semibold text-xs" style={{ color: "var(--mrax-text)" }}>{f.label}</div>
                <div className="text-xs" style={{ color: "var(--mrax-text-secondary)" }}>{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden" style={{ background: "var(--mrax-bg)" }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-3 flex-shrink-0" style={{ background: "var(--mrax-chat-bg)", borderBottom: "1px solid var(--mrax-border)" }}>
        {onBack && (
          <button onClick={onBack} className="mr-1">
            <Icon name="ArrowLeft" size={20} style={{ color: "var(--mrax-accent)" }} />
          </button>
        )}
        <div className="relative cursor-pointer">
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm" style={{ background: contact.color }}>
            {contact.avatar}
          </div>
          {contact.online && <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white" style={{ background: "#00C48C" }} />}
        </div>
        <div className="flex-1 cursor-pointer">
          <div className="font-semibold text-sm flex items-center gap-1.5" style={{ color: "var(--mrax-text)" }}>
            {contact.name}
            {contact.type === "channel" && <Icon name="Megaphone" size={13} style={{ color: "var(--mrax-accent)" }} />}
            {contact.type === "group" && <Icon name="Users" size={13} style={{ color: "var(--mrax-accent)" }} />}
          </div>
          <div className="text-xs" style={{ color: contact.online ? "#00C48C" : "var(--mrax-text-secondary)" }}>
            {contact.type === "group"
              ? `${contact.members} участников`
              : contact.type === "channel"
              ? "Канал"
              : contact.online ? "в сети" : "был(а) недавно"}
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <button onClick={() => setShowTranslator(!showTranslator)}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 relative"
            style={{ background: showTranslator ? "var(--mrax-accent)" : "var(--mrax-accent-light)" }}
            title="Переводчик MRAX">
            <Icon name="Languages" size={17} style={{ color: showTranslator ? "#fff" : "var(--mrax-accent)" }} />
            {showTranslator && <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border-2 border-white" style={{ background: "#00C48C" }} />}
          </button>
          <button onClick={() => setInvisibleRead(!invisibleRead)}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200"
            style={{ background: invisibleRead ? "var(--mrax-notify)" : "var(--mrax-accent-light)" }}
            title="Невидимое чтение">
            <Icon name={invisibleRead ? "EyeOff" : "Eye"} size={17} style={{ color: invisibleRead ? "#fff" : "var(--mrax-accent)" }} />
          </button>
          <button onClick={onCallStart} className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "var(--mrax-accent-light)" }}>
            <Icon name="Phone" size={17} style={{ color: "var(--mrax-accent)" }} />
          </button>
          <button onClick={onVideoCallStart} className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "var(--mrax-accent-light)" }}>
            <Icon name="Video" size={17} style={{ color: "var(--mrax-accent)" }} />
          </button>
          <button className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "var(--mrax-accent-light)" }}>
            <Icon name="Search" size={17} style={{ color: "var(--mrax-accent)" }} />
          </button>
          <button className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "var(--mrax-accent-light)" }}>
            <Icon name="MoreVertical" size={17} style={{ color: "var(--mrax-accent)" }} />
          </button>
        </div>
      </div>

      {/* Pinned message */}
      {pinnedMsg && (
        <div className="px-5 py-2 flex items-center gap-3 flex-shrink-0 cursor-pointer" style={{ background: "var(--mrax-accent-light)", borderBottom: "1px solid rgba(42,92,255,0.15)" }}>
          <Icon name="Pin" size={14} style={{ color: "var(--mrax-accent)" }} />
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold" style={{ color: "var(--mrax-accent)" }}>Закреплённое сообщение</div>
            <div className="text-xs truncate" style={{ color: "var(--mrax-text-secondary)" }}>{pinnedMsg.text}</div>
          </div>
          <Icon name="ChevronDown" size={14} style={{ color: "var(--mrax-accent)" }} />
        </div>
      )}

      {/* Translator bar */}
      {showTranslator && (
        <div className="px-5 py-2 flex items-center gap-3 animate-fade-in flex-shrink-0" style={{ background: "#EEF2FF", borderBottom: "1px solid #C7D2FE" }}>
          <Icon name="Languages" size={15} style={{ color: "var(--mrax-accent)" }} />
          <span className="text-xs font-semibold" style={{ color: "var(--mrax-accent)" }}>Переводчик вкл · Целевой язык:</span>
          <div className="flex items-center gap-1.5 ml-1">
            {["RU", "EN", "ZH", "DE", "FR", "ES"].map(lang => (
              <button key={lang} onClick={() => setTranslateLang(lang)}
                className="text-xs px-2.5 py-0.5 rounded-lg font-semibold transition-all duration-200"
                style={{ background: translateLang === lang ? "var(--mrax-accent)" : "white", color: translateLang === lang ? "#fff" : "var(--mrax-text-secondary)", border: "1px solid var(--mrax-border)" }}>
                {lang}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Invisible read bar */}
      {invisibleRead && (
        <div className="px-5 py-2 flex items-center gap-2 animate-fade-in flex-shrink-0" style={{ background: "#FFF0F0", borderBottom: "1px solid #FFD0D0" }}>
          <Icon name="EyeOff" size={14} style={{ color: "var(--mrax-notify)" }} />
          <span className="text-xs font-semibold" style={{ color: "var(--mrax-notify)" }}>Невидимое чтение активно — собеседник не видит отметку о прочтении</span>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-1"
        style={{ backgroundImage: "radial-gradient(circle at 15% 50%, rgba(42,92,255,0.03) 0%, transparent 55%), radial-gradient(circle at 85% 15%, rgba(255,107,107,0.03) 0%, transparent 55%)" }}>
        {/* Date separator */}
        <div className="flex items-center gap-3 my-3">
          <div className="flex-1 h-px" style={{ background: "var(--mrax-border)" }} />
          <span className="text-xs px-3 py-1 rounded-full font-semibold" style={{ background: "var(--mrax-border)", color: "var(--mrax-text-secondary)" }}>Сегодня</span>
          <div className="flex-1 h-px" style={{ background: "var(--mrax-border)" }} />
        </div>

        {messages.map((msg, i) => (
          <div key={msg.id} className={`flex ${msg.from === "me" ? "justify-end" : "justify-start"} group`}
            style={{ animation: "messageIn 0.22s ease forwards", opacity: 0, animationDelay: msg.isNew ? "0ms" : `${Math.min(i * 18, 280)}ms`, animationFillMode: "forwards" }}>
            <div className="relative max-w-xs lg:max-w-md xl:max-w-lg">
              {/* Hover actions */}
              <div className={`absolute ${msg.from === "me" ? "-left-20" : "-right-20"} top-1/2 -translate-y-1/2 hidden group-hover:flex items-center gap-1 z-10`}>
                <button onClick={() => setReplyTo(msg)} className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: "var(--mrax-chat-bg)", boxShadow: "0 2px 6px rgba(0,0,0,0.1)" }}>
                  <Icon name="Reply" size={13} style={{ color: "var(--mrax-text-secondary)" }} />
                </button>
                <button className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: "var(--mrax-chat-bg)", boxShadow: "0 2px 6px rgba(0,0,0,0.1)" }}>
                  <Icon name="MoreHorizontal" size={13} style={{ color: "var(--mrax-text-secondary)" }} />
                </button>
              </div>
              <div className="px-4 py-2.5"
                style={{
                  background: msg.from === "me" ? "var(--mrax-bubble-out)" : "var(--mrax-bubble-in)",
                  color: msg.from === "me" ? "#fff" : "var(--mrax-text)",
                  borderRadius: msg.from === "me" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                  boxShadow: msg.from === "me" ? "0 2px 8px rgba(42,92,255,0.25)" : "0 1px 4px rgba(0,0,0,0.08)",
                }}>
                {msg.type === "voice" ? (
                  <div className="flex items-center gap-3">
                    <button className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: msg.from === "me" ? "rgba(255,255,255,0.2)" : "var(--mrax-accent-light)" }}>
                      <Icon name="Play" size={14} style={{ color: msg.from === "me" ? "#fff" : "var(--mrax-accent)" }} />
                    </button>
                    <div className="flex-1">
                      <div className="flex gap-0.5 items-end h-5">
                        {Array.from({ length: 20 }).map((_, j) => (
                          <div key={j} className="w-0.5 rounded-full" style={{ height: `${30 + Math.sin(j * 0.8) * 50}%`, background: msg.from === "me" ? "rgba(255,255,255,0.7)" : "var(--mrax-accent)", opacity: j < 8 ? 1 : 0.4 }} />
                        ))}
                      </div>
                    </div>
                    <span className="text-xs" style={{ color: msg.from === "me" ? "rgba(255,255,255,0.7)" : "var(--mrax-text-secondary)" }}>0:23</span>
                  </div>
                ) : (
                  <div className="text-sm leading-relaxed">{msg.text}</div>
                )}
                <div className="flex items-center gap-1 mt-1 justify-end">
                  {msg.edited && <span className="text-xs" style={{ color: msg.from === "me" ? "rgba(255,255,255,0.5)" : "var(--mrax-text-secondary)" }}>ред.</span>}
                  <span className="text-xs" style={{ color: msg.from === "me" ? "rgba(255,255,255,0.65)" : "var(--mrax-text-secondary)" }}>{msg.time}</span>
                  {msg.from === "me" && (
                    <Icon name={msg.read ? "CheckCheck" : "Check"} size={13} style={{ color: msg.read ? "#93C5FD" : "rgba(255,255,255,0.55)" }} />
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Reply preview */}
      {replyTo && (
        <div className="px-5 py-2 flex items-center gap-3 flex-shrink-0 animate-fade-in" style={{ background: "var(--mrax-accent-light)", borderTop: "1px solid rgba(42,92,255,0.15)" }}>
          <div className="w-1 h-10 rounded-full" style={{ background: "var(--mrax-accent)" }} />
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold" style={{ color: "var(--mrax-accent)" }}>
              {replyTo.from === "me" ? "Вы" : contact.name}
            </div>
            <div className="text-xs truncate" style={{ color: "var(--mrax-text-secondary)" }}>{replyTo.text}</div>
          </div>
          <button onClick={() => setReplyTo(null)}>
            <Icon name="X" size={16} style={{ color: "var(--mrax-text-secondary)" }} />
          </button>
        </div>
      )}

      {/* Attach menu */}
      {showAttach && (
        <div className="px-5 py-3 flex gap-3 flex-shrink-0 animate-fade-in" style={{ background: "var(--mrax-chat-bg)", borderTop: "1px solid var(--mrax-border)" }}>
          {ATTACH_OPTIONS.map((opt, i) => (
            <button key={i} onClick={() => setShowAttach(false)}
              className="flex flex-col items-center gap-1.5 px-3 py-2 rounded-xl transition-all duration-200"
              style={{ background: opt.color + "15" }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: opt.color }}>
                <Icon name={opt.icon as Parameters<typeof Icon>[0]["name"]} size={18} style={{ color: "#fff" }} />
              </div>
              <span className="text-xs font-semibold" style={{ color: opt.color }}>{opt.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Emoji picker */}
      {showEmoji && (
        <div className="px-5 py-3 flex-shrink-0 animate-fade-in" style={{ background: "var(--mrax-chat-bg)", borderTop: "1px solid var(--mrax-border)" }}>
          <div className="flex flex-wrap gap-2">
            {EMOJIS.map(emoji => (
              <button key={emoji} onClick={() => { setInputText(prev => prev + emoji); setShowEmoji(false); inputRef.current?.focus(); }}
                className="text-2xl w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-200 hover:scale-110"
                onMouseEnter={e => (e.currentTarget.style.background = "var(--mrax-hover)")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input bar */}
      <div className="px-4 py-3 flex-shrink-0" style={{ background: "var(--mrax-chat-bg)", borderTop: replyTo || showAttach || showEmoji ? "none" : "1px solid var(--mrax-border)" }}>
        <div className="flex items-center gap-2">
          <button onClick={() => { setShowAttach(!showAttach); setShowEmoji(false); }}
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200"
            style={{ background: showAttach ? "var(--mrax-accent)" : "var(--mrax-accent-light)" }}>
            <Icon name="Paperclip" size={20} style={{ color: showAttach ? "#fff" : "var(--mrax-accent)" }} />
          </button>
          <div className="flex-1 flex items-center gap-2 px-4 py-2.5 rounded-2xl"
            style={{ background: "var(--mrax-bg)", border: "1.5px solid var(--mrax-border)", transition: "border-color 0.2s" }}
            onFocus={() => {}} onClick={() => inputRef.current?.focus()}>
            <input
              ref={inputRef}
              className="flex-1 bg-transparent outline-none text-sm"
              style={{ color: "var(--mrax-text)", fontFamily: "'Golos Text', sans-serif" }}
              placeholder="Написать сообщение..."
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button onClick={() => { setShowEmoji(!showEmoji); setShowAttach(false); }}
              style={{ color: showEmoji ? "var(--mrax-accent)" : "var(--mrax-text-secondary)", transition: "color 0.2s" }}>
              <Icon name="Smile" size={20} />
            </button>
          </div>
          <button onClick={sendMessage}
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200"
            style={{ background: inputText.trim() ? "var(--mrax-accent)" : "var(--mrax-accent-light)" }}>
            <Icon name={inputText.trim() ? "Send" : "Mic"} size={20}
              style={{ color: inputText.trim() ? "#fff" : "var(--mrax-accent)" }} />
          </button>
        </div>
      </div>
    </div>
  );
}
