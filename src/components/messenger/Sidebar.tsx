import { useState } from "react";
import Icon from "@/components/ui/icon";
import type { Contact, User } from "@/data/mockData";

interface Props {
  contacts: Contact[];
  selectedChat: number | null;
  onSelectChat: (id: number) => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onNewChat: () => void;
  onCallStart: () => void;
  currentUser: User;
  onLogout: () => void;
  onCallHistoryCall: (id: number) => void;
  stars?: number;
  onPremium?: () => void;
  onStars?: () => void;
}

const TABS = [
  { id: "chats", icon: "MessageCircle", label: "Чаты" },
  { id: "contacts", icon: "Users", label: "Контакты" },
  { id: "calls", icon: "Phone", label: "Звонки" },
  { id: "settings", icon: "Settings", label: "Настройки" },
];

const CALL_HISTORY = [
  { id: 1, name: "Алексей Громов", type: "incoming" as const, time: "Сегодня, 10:30", avatar: "АГ", color: "#2A5CFF", duration: "5:23" },
  { id: 2, name: "Мария Соколова", type: "outgoing" as const, time: "Вчера, 18:45", avatar: "МС", color: "#FF6B6B", duration: "12:07" },
  { id: 3, name: "Дмитрий Волков", type: "missed" as const, time: "Пн, 14:20", avatar: "ДВ", color: "#FF9F43", duration: "" },
  { id: 4, name: "Анна Белова", type: "video" as const, time: "Вс, 20:10", avatar: "АБ", color: "#2BCBBA", duration: "45:12" },
];

const SETTINGS_ITEMS = [
  { icon: "User", label: "Профиль", desc: "Имя, фото, статус" },
  { icon: "Shield", label: "Конфиденциальность", desc: "Кто видит мои данные" },
  { icon: "Bell", label: "Уведомления", desc: "Звуки и вибрация" },
  { icon: "HardDrive", label: "Данные и память", desc: "Автозагрузка, кэш" },
  { icon: "Palette", label: "Оформление", desc: "Тема, пузырьки, шрифт" },
  { icon: "Lock", label: "Безопасность", desc: "Двухфакторная защита" },
  { icon: "Languages", label: "Переводчик", desc: "Автоперевод в реальном времени", badge: "NEW" },
  { icon: "EyeOff", label: "Невидимое чтение", desc: "Скрыть отметку о прочтении", badge: "NEW" },
  { icon: "Cloud", label: "Облачное хранилище", desc: "Google Drive, Dropbox", badge: "NEW" },
  { icon: "HelpCircle", label: "Помощь и поддержка", desc: "FAQ и обратная связь" },
];

export default function Sidebar({ contacts, selectedChat, onSelectChat, activeTab, onTabChange, onNewChat, onCallStart, currentUser, onLogout, onCallHistoryCall, stars = 0, onPremium, onStars }: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const filtered = contacts.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-full flex-shrink-0" style={{ width: 360, borderRight: "1px solid var(--mrax-border)" }}>
      {/* Nav rail */}
      <div className="flex flex-col items-center py-4 gap-1" style={{ width: 64, background: "#EBEBEB", borderRight: "1px solid var(--mrax-border)" }}>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 font-bold text-white text-sm select-none shadow-md" style={{ background: "var(--mrax-accent)" }}>
          MX
        </div>
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => onTabChange(tab.id)}
            className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 relative group"
            style={{ background: activeTab === tab.id ? "var(--mrax-accent)" : "transparent", color: activeTab === tab.id ? "#fff" : "var(--mrax-text-secondary)" }}
            title={tab.label}>
            <Icon name={tab.icon as Parameters<typeof Icon>[0]["name"]} size={20} />
          </button>
        ))}
        <div className="flex-1" />
        <div className="relative">
          <button onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-white text-xs transition-all duration-200"
            style={{ background: currentUser.color }}>
            {currentUser.avatar.slice(0, 2)}
          </button>
          {showProfileMenu && (
            <div className="absolute bottom-12 left-0 w-44 rounded-2xl shadow-xl overflow-hidden z-50 animate-scale-in"
              style={{ background: "var(--mrax-chat-bg)", border: "1px solid var(--mrax-border)" }}>
              <button className="w-full flex items-center gap-2 px-3 py-2.5 text-sm transition-all duration-150"
                onMouseEnter={e => (e.currentTarget.style.background = "var(--mrax-hover)")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                onClick={() => { onTabChange("settings"); setShowProfileMenu(false); }}>
                <Icon name="Settings" size={15} style={{ color: "var(--mrax-accent)" }} />
                <span style={{ color: "var(--mrax-text)" }}>Настройки</span>
              </button>
              <button className="w-full flex items-center gap-2 px-3 py-2.5 text-sm transition-all duration-150"
                onMouseEnter={e => (e.currentTarget.style.background = "#FFF0F0")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                onClick={() => { setShowProfileMenu(false); onLogout(); }}>
                <Icon name="LogOut" size={15} style={{ color: "var(--mrax-notify)" }} />
                <span style={{ color: "var(--mrax-notify)" }}>Выйти</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Panel */}
      <div className="flex-1 flex flex-col overflow-hidden" style={{ background: "var(--mrax-sidebar)" }}>
        {/* Search */}
        <div className="px-3 py-3" style={{ borderBottom: "1px solid var(--mrax-border)" }}>
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: "var(--mrax-bg)" }}>
            <Icon name="Search" size={15} style={{ color: "var(--mrax-text-secondary)" }} />
            <input className="flex-1 bg-transparent outline-none text-sm"
              style={{ color: "var(--mrax-text)", fontFamily: "'Golos Text', sans-serif" }}
              placeholder="Поиск..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)} />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")}>
                <Icon name="X" size={14} style={{ color: "var(--mrax-text-secondary)" }} />
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* CHATS */}
          {activeTab === "chats" && (
            <div>
              {filtered.length === 0 && (
                <div className="py-12 text-center">
                  <Icon name="SearchX" size={32} style={{ color: "var(--mrax-border)", margin: "0 auto 8px" }} />
                  <p className="text-sm" style={{ color: "var(--mrax-text-secondary)" }}>Ничего не найдено</p>
                </div>
              )}
              {filtered.map((contact, i) => (
                <button key={contact.id} onClick={() => onSelectChat(contact.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 transition-all duration-150 animate-fade-in"
                  style={{
                    background: selectedChat === contact.id ? "var(--mrax-hover)" : "transparent",
                    borderLeft: selectedChat === contact.id ? "3px solid var(--mrax-accent)" : "3px solid transparent",
                    animationDelay: `${i * 25}ms`,
                  }}
                  onMouseEnter={e => selectedChat !== contact.id && (e.currentTarget.style.background = "#F8F9FE")}
                  onMouseLeave={e => selectedChat !== contact.id && (e.currentTarget.style.background = "transparent")}>
                  <div className="relative flex-shrink-0">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-sm" style={{ background: contact.color }}>
                      {contact.avatar}
                    </div>
                    {contact.online && <div className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white" style={{ background: "#00C48C" }} />}
                    {contact.type === "channel" && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center border-2 border-white" style={{ background: "var(--mrax-accent)" }}>
                        <Icon name="Megaphone" size={8} style={{ color: "#fff" }} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm truncate" style={{ color: "var(--mrax-text)" }}>{contact.name}</span>
                      <span className="text-xs flex-shrink-0 ml-2" style={{ color: "var(--mrax-text-secondary)" }}>{contact.time}</span>
                    </div>
                    <div className="flex items-center justify-between mt-0.5">
                      <span className="text-xs truncate" style={{ color: "var(--mrax-text-secondary)" }}>{contact.lastMsg}</span>
                      {contact.unread > 0 && (
                        <div className="ml-2 flex-shrink-0 min-w-[20px] h-5 rounded-full flex items-center justify-center text-xs font-semibold text-white px-1.5" style={{ background: "var(--mrax-notify)" }}>
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
              <button onClick={onNewChat}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-xl mb-2 transition-all duration-200"
                style={{ background: "var(--mrax-accent-light)" }}
                onMouseEnter={e => (e.currentTarget.style.background = "#dce7ff")}
                onMouseLeave={e => (e.currentTarget.style.background = "var(--mrax-accent-light)")}>
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "var(--mrax-accent)" }}>
                  <Icon name="UserPlus" size={18} style={{ color: "#fff" }} />
                </div>
                <span className="font-semibold text-sm" style={{ color: "var(--mrax-accent)" }}>Добавить контакт</span>
              </button>
              <div className="text-xs font-bold px-2 py-2 mb-1" style={{ color: "var(--mrax-text-secondary)" }}>ВСЕ КОНТАКТЫ</div>
              {filtered.map((c, i) => (
                <button key={c.id} onClick={() => { onSelectChat(c.id); onTabChange("chats"); }}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 animate-fade-in"
                  style={{ animationDelay: `${i * 25}ms` }}
                  onMouseEnter={e => (e.currentTarget.style.background = "var(--mrax-hover)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-xs" style={{ background: c.color }}>{c.avatar}</div>
                    {c.online && <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white" style={{ background: "#00C48C" }} />}
                  </div>
                  <div className="text-left flex-1">
                    <div className="font-semibold text-sm" style={{ color: "var(--mrax-text)" }}>{c.name}</div>
                    <div className="text-xs" style={{ color: "var(--mrax-text-secondary)" }}>{c.username} {c.type === "group" ? `· ${c.members} участников` : ""}</div>
                  </div>
                  <button className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "var(--mrax-accent-light)" }}>
                    <Icon name="MessageCircle" size={15} style={{ color: "var(--mrax-accent)" }} />
                  </button>
                </button>
              ))}
            </div>
          )}

          {/* CALLS */}
          {activeTab === "calls" && (
            <div className="px-3 py-2">
              <button onClick={onCallStart}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-xl mb-3 transition-all duration-200"
                style={{ background: "var(--mrax-accent-light)" }}
                onMouseEnter={e => (e.currentTarget.style.background = "#dce7ff")}
                onMouseLeave={e => (e.currentTarget.style.background = "var(--mrax-accent-light)")}>
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "var(--mrax-accent)" }}>
                  <Icon name="Phone" size={18} style={{ color: "#fff" }} />
                </div>
                <span className="font-semibold text-sm" style={{ color: "var(--mrax-accent)" }}>Новый звонок</span>
              </button>
              <div className="text-xs font-bold px-2 py-2 mb-1" style={{ color: "var(--mrax-text-secondary)" }}>ПОСЛЕДНИЕ ЗВОНКИ</div>
              {CALL_HISTORY.map((call, i) => (
                <div key={i} className="flex items-center gap-3 px-3 py-3 rounded-xl animate-fade-in" style={{ animationDelay: `${i * 40}ms` }}>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-xs" style={{ background: call.color }}>{call.avatar}</div>
                  <div className="flex-1">
                    <div className="font-semibold text-sm" style={{ color: "var(--mrax-text)" }}>{call.name}</div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Icon name={call.type === "incoming" ? "PhoneIncoming" : call.type === "outgoing" ? "PhoneOutgoing" : call.type === "missed" ? "PhoneMissed" : "Video"} size={12}
                        style={{ color: call.type === "missed" ? "var(--mrax-notify)" : "var(--mrax-accent)" }} />
                      <span className="text-xs" style={{ color: call.type === "missed" ? "var(--mrax-notify)" : "var(--mrax-text-secondary)" }}>{call.time}</span>
                      {call.duration && <span className="text-xs" style={{ color: "var(--mrax-text-secondary)" }}>· {call.duration}</span>}
                    </div>
                  </div>
                  <button onClick={() => onCallHistoryCall(call.id)}
                    className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200"
                    style={{ background: "var(--mrax-accent-light)" }}>
                    <Icon name={call.type === "video" ? "Video" : "Phone"} size={16} style={{ color: "var(--mrax-accent)" }} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* SETTINGS */}
          {activeTab === "settings" && (
            <div className="px-3 py-2">
              <div className="flex items-center gap-3 px-3 py-4 rounded-2xl mb-2 animate-scale-in" style={{ background: "var(--mrax-accent-light)" }}>
                <div className="relative">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-base overflow-hidden" style={{ background: currentUser.color }}>
                    {(currentUser as Record<string,unknown>).photo_url ? <img src={(currentUser as Record<string,unknown>).photo_url as string} className="w-full h-full object-cover" alt="" /> : currentUser.avatar.slice(0, 2)}
                  </div>
                  {(currentUser as Record<string,unknown>).is_premium && <div className="absolute -bottom-1 -right-1 text-base">⭐</div>}
                </div>
                <div className="flex-1">
                  <div className="font-bold text-sm flex items-center gap-1" style={{ color: "var(--mrax-text)" }}>
                    {currentUser.name}
                    {(currentUser as Record<string,unknown>).is_premium && <span className="text-xs font-bold px-1.5 py-0.5 rounded-full text-white" style={{ background: "linear-gradient(135deg,#2A5CFF,#7B3FE4)" }}>Premium</span>}
                  </div>
                  <div className="text-xs" style={{ color: "var(--mrax-text-secondary)" }}>{currentUser.username}</div>
                  <div className="text-xs mt-0.5 font-bold" style={{ color: "#FF9F43" }}>{stars} ⭐ звёзд</div>
                </div>
                <Icon name="ChevronRight" size={16} style={{ color: "var(--mrax-text-secondary)" }} />
              </div>

              {/* Premium & Stars banners */}
              <div className="flex gap-2 mb-2">
                <button onClick={onPremium} className="flex-1 py-2.5 rounded-xl text-center transition-all duration-200"
                  style={{ background: "linear-gradient(135deg, #2A5CFF 0%, #7B3FE4 100%)" }}>
                  <div className="text-base">⭐</div>
                  <div className="text-xs font-bold text-white">Premium</div>
                </button>
                <button onClick={onStars} className="flex-1 py-2.5 rounded-xl text-center transition-all duration-200"
                  style={{ background: "linear-gradient(135deg, #FF9F43, #FF6B6B)" }}>
                  <div className="text-base">🌟</div>
                  <div className="text-xs font-bold text-white">Звёзды</div>
                </button>
              </div>
              {SETTINGS_ITEMS.map((item, i) => (
                <button key={i}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-150 animate-fade-in"
                  style={{ animationDelay: `${i * 20}ms` }}
                  onMouseEnter={e => (e.currentTarget.style.background = "var(--mrax-hover)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "var(--mrax-accent-light)" }}>
                    <Icon name={item.icon as Parameters<typeof Icon>[0]["name"]} size={18} style={{ color: "var(--mrax-accent)" }} />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-semibold text-sm" style={{ color: "var(--mrax-text)" }}>{item.label}</div>
                    <div className="text-xs" style={{ color: "var(--mrax-text-secondary)" }}>{item.desc}</div>
                  </div>
                  {item.badge && <span className="text-xs font-bold px-2 py-0.5 rounded-full text-white" style={{ background: "var(--mrax-notify)" }}>{item.badge}</span>}
                  <Icon name="ChevronRight" size={16} style={{ color: "var(--mrax-text-secondary)" }} />
                </button>
              ))}
              <button onClick={onLogout}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-xl mt-2 transition-all duration-150"
                onMouseEnter={e => (e.currentTarget.style.background = "#FFF0F0")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "#FFF0F0" }}>
                  <Icon name="LogOut" size={18} style={{ color: "var(--mrax-notify)" }} />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-semibold text-sm" style={{ color: "var(--mrax-notify)" }}>Выйти из аккаунта</div>
                </div>
              </button>
            </div>
          )}
        </div>

        {/* Bottom compose */}
        {activeTab === "chats" && (
          <div className="p-3" style={{ borderTop: "1px solid var(--mrax-border)" }}>
            <button onClick={onNewChat}
              className="w-full py-2.5 rounded-xl font-semibold text-sm text-white transition-all duration-200 flex items-center justify-center gap-2"
              style={{ background: "var(--mrax-accent)" }}
              onMouseEnter={e => (e.currentTarget.style.opacity = "0.88")}
              onMouseLeave={e => (e.currentTarget.style.opacity = "1")}>
              <Icon name="Plus" size={18} />
              Новый чат
            </button>
          </div>
        )}
      </div>
    </div>
  );
}