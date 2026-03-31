import { useState } from "react";
import Icon from "@/components/ui/icon";
import type { Contact } from "@/data/mockData";

/* ─── New Chat Modal ─── */
export function NewChatModal({ contacts, onSelect, onClose }: { contacts: Contact[]; onSelect: (id: number) => void; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<"personal" | "group" | "channel">("personal");

  const filtered = contacts.filter(c =>
    (c.name.toLowerCase().includes(query.toLowerCase()) || c.username.toLowerCase().includes(query.toLowerCase())) &&
    (tab === "personal" ? c.type === "personal" : tab === "group" ? c.type === "group" : c.type === "channel")
  );

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 animate-fade-in" style={{ background: "rgba(0,0,0,0.45)" }} onClick={onClose}>
      <div className="rounded-2xl p-5 w-96 shadow-2xl animate-scale-in" style={{ background: "var(--mrax-chat-bg)" }} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-base" style={{ color: "var(--mrax-text)" }}>Новый чат</h3>
          <button onClick={onClose}><Icon name="X" size={20} style={{ color: "var(--mrax-text-secondary)" }} /></button>
        </div>
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl mb-3" style={{ background: "var(--mrax-bg)", border: "1.5px solid var(--mrax-border)" }}>
          <Icon name="Search" size={15} style={{ color: "var(--mrax-text-secondary)" }} />
          <input className="flex-1 bg-transparent outline-none text-sm" placeholder="Поиск контактов..." autoFocus
            style={{ color: "var(--mrax-text)", fontFamily: "'Golos Text', sans-serif" }}
            value={query} onChange={e => setQuery(e.target.value)} />
        </div>
        <div className="flex gap-1.5 mb-3">
          {(["personal", "group", "channel"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className="flex-1 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200"
              style={{ background: tab === t ? "var(--mrax-accent)" : "var(--mrax-accent-light)", color: tab === t ? "#fff" : "var(--mrax-accent)" }}>
              {t === "personal" ? "Личные" : t === "group" ? "Группы" : "Каналы"}
            </button>
          ))}
        </div>
        <div className="max-h-64 overflow-y-auto">
          {filtered.length === 0 && (
            <div className="py-8 text-center text-sm" style={{ color: "var(--mrax-text-secondary)" }}>Ничего не найдено</div>
          )}
          {filtered.map(c => (
            <button key={c.id} onClick={() => onSelect(c.id)}
              className="w-full flex items-center gap-3 px-2 py-2.5 rounded-xl transition-all duration-150"
              onMouseEnter={e => (e.currentTarget.style.background = "var(--mrax-hover)")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
              <div className="relative">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-semibold" style={{ background: c.color }}>{c.avatar}</div>
                {c.online && <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white" style={{ background: "#00C48C" }} />}
              </div>
              <div className="text-left flex-1">
                <div className="font-semibold text-sm" style={{ color: "var(--mrax-text)" }}>{c.name}</div>
                <div className="text-xs" style={{ color: "var(--mrax-text-secondary)" }}>{c.username}</div>
              </div>
              {c.online && <span className="text-xs font-semibold" style={{ color: "#00C48C" }}>онлайн</span>}
            </button>
          ))}
        </div>
        <div className="flex gap-2 mt-4 pt-3" style={{ borderTop: "1px solid var(--mrax-border)" }}>
          <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={{ background: "var(--mrax-accent-light)", color: "var(--mrax-accent)" }}>
            <Icon name="Users" size={16} />
            Создать группу
          </button>
          <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={{ background: "var(--mrax-accent-light)", color: "var(--mrax-accent)" }}>
            <Icon name="Megaphone" size={16} />
            Создать канал
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Call Modal ─── */
export function CallModal({ contact, isVideo, onClose }: { contact: Contact | null; isVideo: boolean; onClose: () => void }) {
  const [active, setActive] = useState(false);
  const [muted, setMuted] = useState(false);
  const [speakerOff, setSpeakerOff] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  if (!contact) return null;

  const handleAccept = () => {
    setActive(true);
    const timer = setInterval(() => setElapsed(s => s + 1), 1000);
    setTimeout(() => clearInterval(timer), 3600000);
  };

  const formatTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 animate-fade-in"
      style={{ background: active && isVideo ? "rgba(0,0,0,0.92)" : "rgba(0,0,0,0.55)" }}
      onClick={!active ? onClose : undefined}>
      <div className="rounded-3xl p-8 w-80 shadow-2xl text-center animate-scale-in"
        style={{ background: active && isVideo ? "rgba(20,20,40,0.95)" : "var(--mrax-chat-bg)" }}
        onClick={e => e.stopPropagation()}>

        {/* Avatar */}
        <div className="relative mx-auto mb-4" style={{ width: 80, height: 80 }}>
          {active && (
            <div className="absolute inset-0 rounded-full animate-ping opacity-30" style={{ background: "#00C48C" }} />
          )}
          <div className="w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg mx-auto"
            style={{ background: contact.color, position: "relative", zIndex: 1 }}>
            {contact.avatar}
          </div>
        </div>

        <h3 className="font-bold text-base mb-1" style={{ color: active && isVideo ? "#fff" : "var(--mrax-text)" }}>{contact.name}</h3>
        <p className="text-sm mb-1" style={{ color: active && isVideo ? "rgba(255,255,255,0.6)" : "var(--mrax-text-secondary)" }}>
          {active ? formatTime(elapsed) : isVideo ? "Видеозвонок..." : "Вызов..."}
        </p>
        <div className="text-xs font-semibold mb-8 px-3 py-1 rounded-full inline-block"
          style={{ background: active && isVideo ? "rgba(42,92,255,0.3)" : "var(--mrax-accent-light)", color: active && isVideo ? "#93C5FD" : "var(--mrax-accent)" }}>
          {isVideo ? "📹 MRAX Видео" : "📞 MRAX"}
        </div>

        {/* Controls */}
        {active ? (
          <div className="flex justify-center gap-5 flex-wrap">
            <div className="flex flex-col items-center gap-1.5">
              <button onClick={() => setMuted(!muted)} className="w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200"
                style={{ background: muted ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.1)" }}>
                <Icon name={muted ? "MicOff" : "Mic"} size={20} style={{ color: "#fff" }} />
              </button>
              <span className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>{muted ? "Выкл" : "Микр"}</span>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <button onClick={() => setSpeakerOff(!speakerOff)} className="w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200"
                style={{ background: "rgba(255,255,255,0.1)" }}>
                <Icon name={speakerOff ? "VolumeX" : "Volume2"} size={20} style={{ color: "#fff" }} />
              </button>
              <span className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>Звук</span>
            </div>
            {isVideo && (
              <div className="flex flex-col items-center gap-1.5">
                <button className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: "rgba(255,255,255,0.1)" }}>
                  <Icon name="CameraOff" size={20} style={{ color: "#fff" }} />
                </button>
                <span className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>Камера</span>
              </div>
            )}
            <div className="flex flex-col items-center gap-1.5">
              <button onClick={onClose} className="w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200"
                style={{ background: "var(--mrax-notify)" }}>
                <Icon name="PhoneOff" size={20} style={{ color: "#fff" }} />
              </button>
              <span className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>Завершить</span>
            </div>
          </div>
        ) : (
          <div className="flex justify-center gap-10">
            <div className="flex flex-col items-center gap-2">
              <button onClick={onClose} className="w-14 h-14 rounded-full flex items-center justify-center text-white transition-all duration-200"
                style={{ background: "var(--mrax-notify)" }}>
                <Icon name="PhoneOff" size={24} />
              </button>
              <span className="text-xs" style={{ color: "var(--mrax-text-secondary)" }}>Отклонить</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <button onClick={handleAccept} className="w-14 h-14 rounded-full flex items-center justify-center text-white transition-all duration-200"
                style={{ background: "#00C48C" }}>
                <Icon name={isVideo ? "Video" : "Phone"} size={24} />
              </button>
              <span className="text-xs" style={{ color: "var(--mrax-text-secondary)" }}>Принять</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Cloud Storage Modal ─── */
export function CloudModal({ onClose }: { onClose: () => void }) {
  const [connected, setConnected] = useState({ google: false, dropbox: false });

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 animate-fade-in" style={{ background: "rgba(0,0,0,0.45)" }} onClick={onClose}>
      <div className="rounded-2xl p-6 w-80 shadow-2xl animate-scale-in" style={{ background: "var(--mrax-chat-bg)" }} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-bold text-base" style={{ color: "var(--mrax-text)" }}>Облачное хранилище</h3>
            <p className="text-xs" style={{ color: "var(--mrax-text-secondary)" }}>Подключите внешние сервисы</p>
          </div>
          <button onClick={onClose}><Icon name="X" size={20} style={{ color: "var(--mrax-text-secondary)" }} /></button>
        </div>
        {[
          { key: "google" as const, name: "Google Drive", icon: "Cloud", color: "#4285F4", desc: "Доступ к файлам Google" },
          { key: "dropbox" as const, name: "Dropbox", icon: "Archive", color: "#0061FE", desc: "Синхронизация Dropbox" },
        ].map(svc => (
          <div key={svc.key} className="flex items-center gap-3 p-3 rounded-xl mb-3 transition-all" style={{ border: `1.5px solid ${connected[svc.key] ? svc.color + "44" : "var(--mrax-border)"}`, background: connected[svc.key] ? svc.color + "08" : "transparent" }}>
            <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: svc.color + "18" }}>
              <Icon name={svc.icon as Parameters<typeof Icon>[0]["name"]} size={22} style={{ color: svc.color }} />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-sm" style={{ color: "var(--mrax-text)" }}>{svc.name}</div>
              <div className="text-xs" style={{ color: connected[svc.key] ? "#00C48C" : "var(--mrax-text-secondary)" }}>
                {connected[svc.key] ? "✓ Подключено" : svc.desc}
              </div>
            </div>
            <button onClick={() => setConnected(prev => ({ ...prev, [svc.key]: !prev[svc.key] }))}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200"
              style={{ background: connected[svc.key] ? "#FFF0F0" : svc.color, color: connected[svc.key] ? "var(--mrax-notify)" : "#fff" }}>
              {connected[svc.key] ? "Отключить" : "Подключить"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
