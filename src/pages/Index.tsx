import { useState, useRef, useEffect } from "react";
import Icon from "@/components/ui/icon";

interface Message { id: number; from: string; text: string; time: string; read: boolean; isNew?: boolean; }

const CONTACTS = [
  { id: 1, name: "Алексей Громов", username: "@alexgromov", avatar: "АГ", color: "#2A5CFF", lastMsg: "Привет! Как дела?", time: "12:45", unread: 3, online: true },
  { id: 2, name: "Мария Соколова", username: "@msokolova", avatar: "МС", color: "#FF6B6B", lastMsg: "Документ отправила 📎", time: "11:30", unread: 0, online: true },
  { id: 3, name: "MRAX Team", username: "@mraxteam", avatar: "MR", color: "#00C48C", lastMsg: "Добро пожаловать в MRAX!", time: "09:15", unread: 1, online: false },
  { id: 4, name: "Дмитрий Волков", username: "@dvolkov", avatar: "ДВ", color: "#FF9F43", lastMsg: "Голосовое сообщение 🎙", time: "Вчера", unread: 0, online: false },
  { id: 5, name: "Проект «Альфа»", username: "@project_alpha", avatar: "ПА", color: "#A55EEA", lastMsg: "Иван: Встреча в 15:00", time: "Вчера", unread: 7, online: false },
  { id: 6, name: "Анна Белова", username: "@annabelova", avatar: "АБ", color: "#2BCBBA", lastMsg: "Спасибо большое!", time: "Пн", unread: 0, online: true },
  { id: 7, name: "Техподдержка", username: "@support", avatar: "ТП", color: "#778CA3", lastMsg: "Ваш запрос принят.", time: "Пн", unread: 0, online: false },
  { id: 8, name: "Семья ❤️", username: "@family", avatar: "С", color: "#FC5C65", lastMsg: "Мама: Ужин в 19:00", time: "Вс", unread: 2, online: false },
];

const MESSAGES_BY_ID: Record<number, Message[]> = {
  1: [
    { id: 1, from: "them", text: "Привет! Как дела?", time: "12:40", read: true },
    { id: 2, from: "me", text: "Всё хорошо, работаю над новым проектом!", time: "12:41", read: true },
    { id: 3, from: "them", text: "Отлично! Что за проект?", time: "12:42", read: true },
    { id: 4, from: "me", text: "Мессенджер MRAX 🚀 Уже почти готово", time: "12:43", read: true },
    { id: 5, from: "them", text: "Звучит интересно! Когда можно посмотреть?", time: "12:45", read: false },
  ],
  2: [
    { id: 1, from: "them", text: "Добрый день! Отправляю документы по договору.", time: "11:20", read: true },
    { id: 2, from: "me", text: "Спасибо, получил.", time: "11:25", read: true },
    { id: 3, from: "them", text: "Документ отправила 📎", time: "11:30", read: true },
  ],
  3: [
    { id: 1, from: "them", text: "Добро пожаловать в MRAX! 🎉", time: "09:10", read: true },
    { id: 2, from: "them", text: "Это самый безопасный мессенджер для России.", time: "09:12", read: true },
    { id: 3, from: "them", text: "Наслаждайтесь общением!", time: "09:15", read: false },
  ],
};

const TABS = [
  { id: "chats", icon: "MessageCircle" },
  { id: "contacts", icon: "Users" },
  { id: "calls", icon: "Phone" },
  { id: "settings", icon: "Settings" },
];

const SETTINGS_ITEMS = [
  { icon: "User", label: "Профиль", desc: "Имя, фото, статус" },
  { icon: "Shield", label: "Конфиденциальность", desc: "Кто видит мои данные" },
  { icon: "Bell", label: "Уведомления", desc: "Звуки и вибрация" },
  { icon: "HardDrive", label: "Данные и память", desc: "Автозагрузка, кэш" },
  { icon: "Palette", label: "Оформление", desc: "Тема, пузырьки, шрифт" },
  { icon: "Lock", label: "Безопасность", desc: "Двухфакторная защита, сессии" },
  { icon: "Languages", label: "Переводчик", desc: "Автоперевод в реальном времени", badge: "NEW" },
  { icon: "EyeOff", label: "Невидимое чтение", desc: "Скрыть отметку о прочтении", badge: "NEW" },
  { icon: "Cloud", label: "Облачное хранилище", desc: "Google Drive, Dropbox", badge: "NEW" },
  { icon: "HelpCircle", label: "Помощь и поддержка", desc: "FAQ и обратная связь" },
];

export default function Index() {
  const [activeTab, setActiveTab] = useState("chats");
  const [selectedChat, setSelectedChat] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showTranslator, setShowTranslator] = useState(false);
  const [invisibleRead, setInvisibleRead] = useState(false);
  const [showCallModal, setShowCallModal] = useState(false);
  const [showNewChat, setShowNewChat] = useState(false);
  const [translateLang, setTranslateLang] = useState("EN");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedContact = CONTACTS.find(c => c.id === selectedChat);

  useEffect(() => {
    if (selectedChat) {
      setMessages(MESSAGES_BY_ID[selectedChat] || []);
    }
  }, [selectedChat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!inputText.trim() || !selectedChat) return;
    const newMsg = {
      id: Date.now(),
      from: "me",
      text: inputText.trim(),
      time: new Date().toLocaleTimeString("ru", { hour: "2-digit", minute: "2-digit" }),
      read: false,
      isNew: true,
    };
    setMessages(prev => [...prev, newMsg]);
    setInputText("");
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const filteredContacts = CONTACTS.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: "var(--mrax-bg)", fontFamily: "'Golos Text', sans-serif" }}
    >
      {/* ── LEFT SIDEBAR ── */}
      <div
        className="flex h-full flex-shrink-0"
        style={{ width: 360, borderRight: "1px solid var(--mrax-border)" }}
      >
        {/* Nav rail */}
        <div
          className="flex flex-col items-center py-4 gap-1"
          style={{ width: 64, background: "#EBEBEB", borderRight: "1px solid var(--mrax-border)" }}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 font-bold text-white text-sm select-none"
            style={{ background: "var(--mrax-accent)" }}
          >
            MX
          </div>
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200"
              style={{
                background: activeTab === tab.id ? "var(--mrax-accent)" : "transparent",
                color: activeTab === tab.id ? "#fff" : "var(--mrax-text-secondary)",
              }}
            >
              <Icon name={tab.icon as Parameters<typeof Icon>[0]["name"]} size={20} />
            </button>
          ))}
          <div className="flex-1" />
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-white text-xs"
            style={{ background: "var(--mrax-accent)" }}
          >
            ВЫ
          </div>
        </div>

        {/* List panel */}
        <div className="flex-1 flex flex-col overflow-hidden" style={{ background: "var(--mrax-sidebar)" }}>
          {/* Search bar */}
          <div className="px-3 py-3" style={{ borderBottom: "1px solid var(--mrax-border)" }}>
            <div
              className="flex items-center gap-2 px-3 py-2 rounded-xl"
              style={{ background: "var(--mrax-bg)" }}
            >
              <Icon name="Search" size={15} style={{ color: "var(--mrax-text-secondary)" }} />
              <input
                className="flex-1 bg-transparent outline-none text-sm"
                style={{ color: "var(--mrax-text)", fontFamily: "'Golos Text', sans-serif" }}
                placeholder="Поиск..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-y-auto">

            {/* CHATS */}
            {activeTab === "chats" && (
              <div>
                {filteredContacts.map((contact, i) => (
                  <button
                    key={contact.id}
                    onClick={() => setSelectedChat(contact.id)}
                    className="w-full flex items-center gap-3 px-4 py-3 transition-all duration-200 animate-fade-in"
                    style={{
                      background: selectedChat === contact.id ? "var(--mrax-hover)" : "transparent",
                      borderLeft: selectedChat === contact.id
                        ? "3px solid var(--mrax-accent)"
                        : "3px solid transparent",
                      animationDelay: `${i * 30}ms`,
                    }}
                  >
                    <div className="relative flex-shrink-0">
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-sm"
                        style={{ background: contact.color }}
                      >
                        {contact.avatar}
                      </div>
                      {contact.online && (
                        <div
                          className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white"
                          style={{ background: "#00C48C" }}
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-sm truncate" style={{ color: "var(--mrax-text)" }}>
                          {contact.name}
                        </span>
                        <span className="text-xs flex-shrink-0 ml-2" style={{ color: "var(--mrax-text-secondary)" }}>
                          {contact.time}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-0.5">
                        <span className="text-xs truncate" style={{ color: "var(--mrax-text-secondary)" }}>
                          {contact.lastMsg}
                        </span>
                        {contact.unread > 0 && (
                          <div
                            className="ml-2 flex-shrink-0 min-w-[20px] h-5 rounded-full flex items-center justify-center text-xs font-semibold text-white px-1.5"
                            style={{ background: "var(--mrax-notify)" }}
                          >
                            {contact.unread}
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* CONTACTS */}
            {activeTab === "contacts" && (
              <div className="px-3 py-2">
                <button
                  onClick={() => setShowNewChat(true)}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-xl mb-2 transition-all duration-200"
                  style={{ background: "var(--mrax-accent-light)" }}
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ background: "var(--mrax-accent)" }}
                  >
                    <Icon name="UserPlus" size={18} style={{ color: "#fff" }} />
                  </div>
                  <span className="font-semibold text-sm" style={{ color: "var(--mrax-accent)" }}>Добавить контакт</span>
                </button>
                {filteredContacts.map((c, i) => (
                  <button
                    key={c.id}
                    onClick={() => { setSelectedChat(c.id); setActiveTab("chats"); }}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 animate-fade-in"
                    style={{ animationDelay: `${i * 30}ms` }}
                    onMouseEnter={e => (e.currentTarget.style.background = "var(--mrax-hover)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                  >
                    <div className="relative">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-xs"
                        style={{ background: c.color }}
                      >
                        {c.avatar}
                      </div>
                      {c.online && (
                        <div
                          className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white"
                          style={{ background: "#00C48C" }}
                        />
                      )}
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-sm" style={{ color: "var(--mrax-text)" }}>{c.name}</div>
                      <div className="text-xs" style={{ color: "var(--mrax-text-secondary)" }}>{c.username}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* CALLS */}
            {activeTab === "calls" && (
              <div className="px-3 py-2">
                <button
                  onClick={() => setShowCallModal(true)}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-xl mb-3 transition-all duration-200"
                  style={{ background: "var(--mrax-accent-light)" }}
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ background: "var(--mrax-accent)" }}
                  >
                    <Icon name="Phone" size={18} style={{ color: "#fff" }} />
                  </div>
                  <span className="font-semibold text-sm" style={{ color: "var(--mrax-accent)" }}>Новый звонок</span>
                </button>
                {[
                  { name: "Алексей Громов", type: "incoming", time: "Сегодня, 10:30", avatar: "АГ", color: "#2A5CFF" },
                  { name: "Мария Соколова", type: "outgoing", time: "Вчера, 18:45", avatar: "МС", color: "#FF6B6B" },
                  { name: "Дмитрий Волков", type: "missed", time: "Пн, 14:20", avatar: "ДВ", color: "#FF9F43" },
                  { name: "Анна Белова", type: "video", time: "Вс, 20:10", avatar: "АБ", color: "#2BCBBA" },
                ].map((call, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 px-3 py-3 rounded-xl animate-fade-in"
                    style={{ animationDelay: `${i * 40}ms` }}
                  >
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-xs"
                      style={{ background: call.color }}
                    >
                      {call.avatar}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-sm" style={{ color: "var(--mrax-text)" }}>{call.name}</div>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Icon
                          name={
                            call.type === "incoming" ? "PhoneIncoming"
                            : call.type === "outgoing" ? "PhoneOutgoing"
                            : call.type === "missed" ? "PhoneMissed"
                            : "Video"
                          }
                          size={12}
                          style={{ color: call.type === "missed" ? "var(--mrax-notify)" : "var(--mrax-accent)" }}
                        />
                        <span
                          className="text-xs"
                          style={{ color: call.type === "missed" ? "var(--mrax-notify)" : "var(--mrax-text-secondary)" }}
                        >
                          {call.time}
                        </span>
                      </div>
                    </div>
                    <button
                      className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200"
                      style={{ background: "var(--mrax-accent-light)", color: "var(--mrax-accent)" }}
                    >
                      <Icon name={call.type === "video" ? "Video" : "Phone"} size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* SETTINGS */}
            {activeTab === "settings" && (
              <div className="px-3 py-2">
                <div
                  className="flex items-center gap-3 px-3 py-4 rounded-2xl mb-3 animate-scale-in"
                  style={{ background: "var(--mrax-accent-light)" }}
                >
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold"
                    style={{ background: "var(--mrax-accent)" }}
                  >
                    ВЫ
                  </div>
                  <div>
                    <div className="font-bold text-sm" style={{ color: "var(--mrax-text)" }}>Ваш профиль</div>
                    <div className="text-xs" style={{ color: "var(--mrax-text-secondary)" }}>@username</div>
                    <div className="text-xs mt-0.5 font-semibold" style={{ color: "var(--mrax-accent)" }}>Изменить профиль</div>
                  </div>
                </div>
                {SETTINGS_ITEMS.map((item, i) => (
                  <button
                    key={i}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 animate-fade-in"
                    style={{ animationDelay: `${i * 25}ms` }}
                    onMouseEnter={e => (e.currentTarget.style.background = "var(--mrax-hover)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                  >
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center"
                      style={{ background: "var(--mrax-accent-light)" }}
                    >
                      <Icon name={item.icon as Parameters<typeof Icon>[0]["name"]} size={18} style={{ color: "var(--mrax-accent)" }} />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-semibold text-sm" style={{ color: "var(--mrax-text)" }}>{item.label}</div>
                      <div className="text-xs" style={{ color: "var(--mrax-text-secondary)" }}>{item.desc}</div>
                    </div>
                    {item.badge && (
                      <span
                        className="text-xs font-bold px-2 py-0.5 rounded-full text-white"
                        style={{ background: "var(--mrax-notify)" }}
                      >
                        {item.badge}
                      </span>
                    )}
                    <Icon name="ChevronRight" size={16} style={{ color: "var(--mrax-text-secondary)" }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Bottom action */}
          {activeTab === "chats" && (
            <div className="p-3" style={{ borderTop: "1px solid var(--mrax-border)" }}>
              <button
                onClick={() => setShowNewChat(true)}
                className="w-full py-2.5 rounded-xl font-semibold text-sm text-white transition-all duration-200 flex items-center justify-center gap-2"
                style={{ background: "var(--mrax-accent)" }}
                onMouseEnter={e => (e.currentTarget.style.opacity = "0.88")}
                onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
              >
                <Icon name="Plus" size={18} />
                Новый чат
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── CHAT AREA ── */}
      <div
        className="flex-1 flex flex-col overflow-hidden"
        style={{ background: selectedChat ? "var(--mrax-bg)" : "var(--mrax-chat-bg)" }}
      >
        {selectedChat && selectedContact ? (
          <>
            {/* Header */}
            <div
              className="flex items-center gap-3 px-5 py-3 flex-shrink-0"
              style={{ background: "var(--mrax-chat-bg)", borderBottom: "1px solid var(--mrax-border)" }}
            >
              <div className="relative">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm"
                  style={{ background: selectedContact.color }}
                >
                  {selectedContact.avatar}
                </div>
                {selectedContact.online && (
                  <div
                    className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white"
                    style={{ background: "#00C48C" }}
                  />
                )}
              </div>
              <div className="flex-1">
                <div className="font-semibold text-sm" style={{ color: "var(--mrax-text)" }}>
                  {selectedContact.name}
                </div>
                <div
                  className="text-xs"
                  style={{ color: selectedContact.online ? "#00C48C" : "var(--mrax-text-secondary)" }}
                >
                  {selectedContact.online ? "в сети" : "был(а) недавно"}
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setShowTranslator(!showTranslator)}
                  className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 relative"
                  style={{
                    background: showTranslator ? "var(--mrax-accent)" : "var(--mrax-accent-light)",
                  }}
                  title="Переводчик"
                >
                  <Icon name="Languages" size={18} style={{ color: showTranslator ? "#fff" : "var(--mrax-accent)" }} />
                  {showTranslator && (
                    <div
                      className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border-2 border-white"
                      style={{ background: "#00C48C" }}
                    />
                  )}
                </button>
                <button
                  onClick={() => setInvisibleRead(!invisibleRead)}
                  className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200"
                  style={{
                    background: invisibleRead ? "var(--mrax-notify)" : "var(--mrax-accent-light)",
                  }}
                  title="Невидимое чтение"
                >
                  <Icon
                    name={invisibleRead ? "EyeOff" : "Eye"}
                    size={18}
                    style={{ color: invisibleRead ? "#fff" : "var(--mrax-accent)" }}
                  />
                </button>
                <button
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: "var(--mrax-accent-light)" }}
                >
                  <Icon name="Phone" size={18} style={{ color: "var(--mrax-accent)" }} />
                </button>
                <button
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: "var(--mrax-accent-light)" }}
                >
                  <Icon name="Video" size={18} style={{ color: "var(--mrax-accent)" }} />
                </button>
                <button
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: "var(--mrax-accent-light)" }}
                >
                  <Icon name="Search" size={18} style={{ color: "var(--mrax-accent)" }} />
                </button>
                <button
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: "var(--mrax-accent-light)" }}
                >
                  <Icon name="MoreVertical" size={18} style={{ color: "var(--mrax-accent)" }} />
                </button>
              </div>
            </div>

            {/* Translator bar */}
            {showTranslator && (
              <div
                className="px-5 py-2 flex items-center gap-3 animate-fade-in flex-shrink-0"
                style={{ background: "#EEF2FF", borderBottom: "1px solid #C7D2FE" }}
              >
                <Icon name="Languages" size={15} style={{ color: "var(--mrax-accent)" }} />
                <span className="text-xs font-semibold" style={{ color: "var(--mrax-accent)" }}>
                  Переводчик включён · Язык:
                </span>
                <div className="flex items-center gap-1.5 ml-1">
                  {["RU", "EN", "ZH", "DE", "FR"].map(lang => (
                    <button
                      key={lang}
                      onClick={() => setTranslateLang(lang)}
                      className="text-xs px-2.5 py-0.5 rounded-lg font-semibold transition-all duration-200"
                      style={{
                        background: translateLang === lang ? "var(--mrax-accent)" : "white",
                        color: translateLang === lang ? "#fff" : "var(--mrax-text-secondary)",
                        border: "1px solid var(--mrax-border)",
                      }}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Invisible read bar */}
            {invisibleRead && (
              <div
                className="px-5 py-2 flex items-center gap-2 animate-fade-in flex-shrink-0"
                style={{ background: "#FFF0F0", borderBottom: "1px solid #FFD0D0" }}
              >
                <Icon name="EyeOff" size={14} style={{ color: "var(--mrax-notify)" }} />
                <span className="text-xs font-semibold" style={{ color: "var(--mrax-notify)" }}>
                  Невидимое чтение активно — собеседник не видит отметку о прочтении
                </span>
              </div>
            )}

            {/* Messages */}
            <div
              className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-1.5"
              style={{
                background: "var(--mrax-bg)",
                backgroundImage:
                  "radial-gradient(circle at 15% 50%, rgba(42,92,255,0.04) 0%, transparent 55%), " +
                  "radial-gradient(circle at 85% 15%, rgba(255,107,107,0.04) 0%, transparent 55%)",
              }}
            >
              {messages.map((msg, i) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.from === "me" ? "justify-end" : "justify-start"}`}
                  style={{
                    animation: "messageIn 0.22s ease forwards",
                    opacity: 0,
                    animationDelay: msg.isNew ? "0ms" : `${Math.min(i * 20, 300)}ms`,
                    animationFillMode: "forwards",
                  }}
                >
                  <div
                    className="max-w-xs lg:max-w-md xl:max-w-lg px-4 py-2.5 relative"
                    style={{
                      background: msg.from === "me" ? "var(--mrax-bubble-out)" : "var(--mrax-bubble-in)",
                      color: msg.from === "me" ? "#fff" : "var(--mrax-text)",
                      borderRadius: msg.from === "me"
                        ? "18px 18px 4px 18px"
                        : "18px 18px 18px 4px",
                      boxShadow: msg.from === "me"
                        ? "0 2px 8px rgba(42,92,255,0.25)"
                        : "0 1px 4px rgba(0,0,0,0.08)",
                    }}
                  >
                    <div className="text-sm leading-relaxed">{msg.text}</div>
                    <div className="flex items-center gap-1 mt-1 justify-end">
                      <span
                        className="text-xs"
                        style={{ color: msg.from === "me" ? "rgba(255,255,255,0.65)" : "var(--mrax-text-secondary)" }}
                      >
                        {msg.time}
                      </span>
                      {msg.from === "me" && (
                        <Icon
                          name={msg.read ? "CheckCheck" : "Check"}
                          size={13}
                          style={{ color: msg.read ? "#93C5FD" : "rgba(255,255,255,0.55)" }}
                        />
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input bar */}
            <div
              className="px-4 py-3 flex-shrink-0"
              style={{ background: "var(--mrax-chat-bg)", borderTop: "1px solid var(--mrax-border)" }}
            >
              <div className="flex items-center gap-2">
                <button
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200"
                  style={{ background: "var(--mrax-accent-light)" }}
                >
                  <Icon name="Paperclip" size={20} style={{ color: "var(--mrax-accent)" }} />
                </button>
                <div
                  className="flex-1 flex items-center gap-2 px-4 py-2.5 rounded-2xl"
                  style={{ background: "var(--mrax-bg)", border: "1.5px solid var(--mrax-border)" }}
                >
                  <input
                    ref={inputRef}
                    className="flex-1 bg-transparent outline-none text-sm"
                    style={{ color: "var(--mrax-text)", fontFamily: "'Golos Text', sans-serif" }}
                    placeholder="Написать сообщение..."
                    value={inputText}
                    onChange={e => setInputText(e.target.value)}
                    onKeyDown={handleKeyDown}
                  />
                  <button style={{ color: "var(--mrax-text-secondary)" }}>
                    <Icon name="Smile" size={20} />
                  </button>
                </div>
                <button
                  onClick={sendMessage}
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200"
                  style={{
                    background: inputText.trim() ? "var(--mrax-accent)" : "var(--mrax-accent-light)",
                  }}
                >
                  <Icon
                    name={inputText.trim() ? "Send" : "Mic"}
                    size={20}
                    style={{ color: inputText.trim() ? "#fff" : "var(--mrax-accent)" }}
                  />
                </button>
              </div>
            </div>
          </>
        ) : (
          /* Empty state */
          <div className="flex-1 flex flex-col items-center justify-center animate-fade-in">
            <div
              className="w-24 h-24 rounded-3xl flex items-center justify-center mb-6 font-bold text-3xl text-white shadow-xl"
              style={{ background: "var(--mrax-accent)" }}
            >
              MX
            </div>
            <h2 className="text-2xl font-bold mb-2" style={{ color: "var(--mrax-text)" }}>
              MRAX Мессенджер
            </h2>
            <p className="text-sm text-center max-w-xs mb-8 leading-relaxed" style={{ color: "var(--mrax-text-secondary)" }}>
              Выберите чат в списке слева, чтобы начать общение.<br />Все сообщения защищены сквозным шифрованием.
            </p>
            <div className="flex gap-4">
              {[
                { icon: "Languages", label: "Переводчик", desc: "Реальное время" },
                { icon: "EyeOff", label: "Невидимость", desc: "Скрыть прочтение" },
                { icon: "Cloud", label: "Хранилище", desc: "Drive & Dropbox" },
              ].map((f, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center gap-2.5 px-5 py-4 rounded-2xl animate-fade-in"
                  style={{
                    background: "var(--mrax-chat-bg)",
                    border: "1px solid var(--mrax-border)",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                    animationDelay: `${i * 80}ms`,
                  }}
                >
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center"
                    style={{ background: "var(--mrax-accent-light)" }}
                  >
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
        )}
      </div>

      {/* ── MODAL: New chat ── */}
      {showNewChat && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 animate-fade-in"
          style={{ background: "rgba(0,0,0,0.45)" }}
          onClick={() => setShowNewChat(false)}
        >
          <div
            className="rounded-2xl p-6 w-80 shadow-2xl animate-scale-in"
            style={{ background: "var(--mrax-chat-bg)" }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base" style={{ color: "var(--mrax-text)" }}>Новый чат</h3>
              <button onClick={() => setShowNewChat(false)}>
                <Icon name="X" size={20} style={{ color: "var(--mrax-text-secondary)" }} />
              </button>
            </div>
            <div
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl mb-4"
              style={{ background: "var(--mrax-bg)", border: "1px solid var(--mrax-border)" }}
            >
              <Icon name="Search" size={15} style={{ color: "var(--mrax-text-secondary)" }} />
              <input
                className="flex-1 bg-transparent outline-none text-sm"
                placeholder="Имя или @username..."
                style={{ color: "var(--mrax-text)", fontFamily: "'Golos Text', sans-serif" }}
              />
            </div>
            {CONTACTS.slice(0, 5).map(c => (
              <button
                key={c.id}
                onClick={() => { setSelectedChat(c.id); setActiveTab("chats"); setShowNewChat(false); }}
                className="w-full flex items-center gap-3 px-2 py-2.5 rounded-xl transition-all duration-200"
                onMouseEnter={e => (e.currentTarget.style.background = "var(--mrax-hover)")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-semibold"
                  style={{ background: c.color }}
                >
                  {c.avatar}
                </div>
                <div className="text-left">
                  <div className="font-semibold text-sm" style={{ color: "var(--mrax-text)" }}>{c.name}</div>
                  <div className="text-xs" style={{ color: "var(--mrax-text-secondary)" }}>{c.username}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── MODAL: Incoming call ── */}
      {showCallModal && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 animate-fade-in"
          style={{ background: "rgba(0,0,0,0.5)" }}
          onClick={() => setShowCallModal(false)}
        >
          <div
            className="rounded-3xl p-8 w-72 shadow-2xl text-center animate-scale-in"
            style={{ background: "var(--mrax-chat-bg)" }}
            onClick={e => e.stopPropagation()}
          >
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-4 shadow-lg"
              style={{ background: "var(--mrax-accent)" }}
            >
              АГ
            </div>
            <h3 className="font-bold text-base mb-1" style={{ color: "var(--mrax-text)" }}>Алексей Громов</h3>
            <p className="text-sm mb-1" style={{ color: "var(--mrax-text-secondary)" }}>Входящий звонок...</p>
            <div
              className="text-xs font-semibold mb-8 px-3 py-1 rounded-full inline-block"
              style={{ background: "var(--mrax-accent-light)", color: "var(--mrax-accent)" }}
            >
              MRAX
            </div>
            <div className="flex justify-center gap-8">
              <div className="flex flex-col items-center gap-2">
                <button
                  className="w-14 h-14 rounded-full flex items-center justify-center text-white transition-all duration-200"
                  style={{ background: "var(--mrax-notify)" }}
                  onClick={() => setShowCallModal(false)}
                >
                  <Icon name="PhoneOff" size={24} />
                </button>
                <span className="text-xs" style={{ color: "var(--mrax-text-secondary)" }}>Отклонить</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <button
                  className="w-14 h-14 rounded-full flex items-center justify-center text-white transition-all duration-200"
                  style={{ background: "#00C48C" }}
                  onClick={() => setShowCallModal(false)}
                >
                  <Icon name="Phone" size={24} />
                </button>
                <span className="text-xs" style={{ color: "var(--mrax-text-secondary)" }}>Принять</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}