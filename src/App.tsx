import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  List as Menu, 
  Plus, 
  Paperclip, 
  ArrowUp, 
  X, 
  Gear as Settings, 
  ShieldCheck, 
  Scroll, 
  Trash, 
  SignOut,
  Images,
  Camera,
  FileText,
  Copy,
  ThumbsUp,
  ThumbsDown,
  WarningCircle,
  Check,
  CaretDown,
  GoogleLogo
} from '@phosphor-icons/react';
import { 
  signInWithGoogle, 
  logoutUser, 
  createChat,
  addMessage,
  getUserChats,
  deleteChat,
  getChatMessages,
  type Chat
} from '@/lib/firebase';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { toast } from 'sonner';

// Types
interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

// Starry Background Component
const StarryBackground = () => {
  const stars = useRef<{ id: number; left: number; top: number; size: number; delay: number }[]>([]);
  
  useEffect(() => {
    stars.current = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: Math.random() * 2 + 1,
      delay: Math.random() * 3
    }));
  }, []);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      {stars.current.map((star) => (
        <div
          key={star.id}
          className="star"
          style={{
            left: `${star.left}%`,
            top: `${star.top}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            animationDelay: `${star.delay}s`
          }}
        />
      ))}
    </div>
  );
};

// Login Page Component
const LoginPage = ({ onLogin }: { onLogin: () => void }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      await signInWithGoogle();
      onLogin();
      toast.success('تم تسجيل الدخول بنجاح!');
    } catch (error) {
      toast.error('فشل تسجيل الدخول. حاول مرة أخرى.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative z-10 px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="relative inline-block">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-white/20 to-white/5 flex items-center justify-center border border-white/10">
              <img 
                src="https://i.postimg.cc/TYkxXzSh/grok-image-x6em5fj-edit-96291120058942.png" 
                alt="Afnan AI" 
                className="w-20 h-20 object-contain"
              />
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-black flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-2">Afnan AI</h1>
          <p className="text-gray-400 text-sm">مساعدك الذكي باللغة العربية</p>
        </div>

        {/* Login Card */}
        <div className="glass rounded-3xl p-8">
          <h2 className="text-xl font-bold text-center mb-6">تسجيل الدخول</h2>
          
          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 bg-white text-black font-medium py-4 rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="spinner" />
            ) : (
              <>
                <GoogleLogo weight="bold" className="w-5 h-5" />
                <span>المتابعة باستخدام Google</span>
              </>
            )}
          </button>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              بالتسجيل، أنت توافق على{' '}
              <button className="text-white underline hover:no-underline">شروط الاستخدام</button>
              {' '}و{' '}
              <button className="text-white underline hover:no-underline">سياسة الخصوصية</button>
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div className="p-4">
            <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-white/5 flex items-center justify-center">
              <span className="text-xl">⚡</span>
            </div>
            <p className="text-xs text-gray-400">سريع</p>
          </div>
          <div className="p-4">
            <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-white/5 flex items-center justify-center">
              <span className="text-xl">🔒</span>
            </div>
            <p className="text-xs text-gray-400">آمن</p>
          </div>
          <div className="p-4">
            <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-white/5 flex items-center justify-center">
              <span className="text-xl">🌟</span>
            </div>
            <p className="text-xs text-gray-400">ذكي</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Sidebar Component
const Sidebar = ({
  isOpen,
  onClose,
  chats,
  currentChatId,
  onSelectChat,
  onNewChat,
  onDeleteChat,
  user,
  onLogout
}: {
  isOpen: boolean;
  onClose: () => void;
  chats: Chat[];
  currentChatId: string | null;
  onSelectChat: (chatId: string) => void;
  onNewChat: () => void;
  onDeleteChat: (chatId: string) => void;
  user: User | null;
  onLogout: () => void;
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) {
        setShowSettings(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      {/* Overlay */}
      <div 
        className={`fixed inset-0 bg-black/70 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <div 
        className={`fixed top-0 right-0 h-full w-80 z-50 glass-strong sidebar-transition transform ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="p-4 flex items-center justify-between border-b border-white/5">
          <span className="font-bold text-lg">المحادثات</span>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
          >
            <X weight="bold" className="w-5 h-5" />
          </button>
        </div>

        {/* New Chat Button */}
        <div className="p-4">
          <button
            onClick={() => { onNewChat(); onClose(); }}
            className="w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 py-3 rounded-xl transition-colors"
          >
            <Plus weight="bold" className="w-5 h-5" />
            <span>محادثة جديدة</span>
          </button>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto px-3 pb-4 no-scrollbar">
          {chats.length === 0 ? (
            <div className="text-center text-gray-500 text-sm mt-8">
              لا توجد محادثات سابقة
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              {chats.map((chat) => (
                <div
                  key={chat.id}
                  className={`group relative flex items-center gap-2 p-3 rounded-xl transition-all cursor-pointer ${
                    chat.id === currentChatId 
                      ? 'bg-white/10' 
                      : 'hover:bg-white/5'
                  }`}
                  onClick={() => { onSelectChat(chat.id); onClose(); }}
                >
                  <span className="flex-1 text-sm truncate text-right">
                    {chat.title}
                  </span>
                  <button
                    onClick={(e) => { e.stopPropagation(); onDeleteChat(chat.id); }}
                    className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/20 hover:text-red-400 rounded-lg transition-all"
                  >
                    <Trash weight="bold" className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="p-4 border-t border-white/5 bg-black/20 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 overflow-hidden">
              <img 
                src={user?.photoURL || 'https://i.postimg.cc/TYkxXzSh/grok-image-x6em5fj-edit-96291120058942.png'} 
                alt="User" 
                className="w-10 h-10 rounded-full border border-gray-700 bg-black flex-shrink-0"
              />
              <div className="flex flex-col min-w-0">
                <span className="font-bold text-sm truncate">{user?.displayName || 'مستخدم'}</span>
                <span className="text-xs text-gray-400 font-sans truncate" dir="ltr">
                  {user?.email || ''}
                </span>
              </div>
            </div>
            <div className="relative" ref={settingsRef}>
              <button 
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
              >
                <Settings weight="bold" className="w-5 h-5" />
              </button>

              {/* Settings Menu */}
              {showSettings && (
                <div className="absolute bottom-full left-0 mb-2 w-56 glass rounded-2xl p-2 shadow-2xl menu-popup">
                  <button className="w-full text-right p-3 hover:bg-white/5 rounded-xl transition-colors text-sm flex items-center gap-3">
                    <ShieldCheck weight="bold" className="w-4 h-4 text-blue-400" />
                    سياسة الخصوصية
                  </button>
                  <button className="w-full text-right p-3 hover:bg-white/5 rounded-xl transition-colors text-sm flex items-center gap-3">
                    <Scroll weight="bold" className="w-4 h-4 text-orange-400" />
                    اتفاقية المستخدم
                  </button>
                  <div className="h-px bg-white/5 my-2 mx-2" />
                  <button 
                    onClick={() => { onLogout(); setShowSettings(false); }}
                    className="w-full text-right p-3 hover:bg-white/5 rounded-xl transition-colors text-sm flex items-center gap-3 text-red-400"
                  >
                    <SignOut weight="bold" className="w-4 h-4" />
                    تسجيل الخروج
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// Attachment Menu Component
const AttachmentMenu = ({
  isOpen,
  onClose,
  onSelect
}: {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (type: 'gallery' | 'camera' | 'file') => void;
}) => {
  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-20" onClick={onClose} />
      <div className="absolute bottom-full right-0 mb-3 w-64 glass rounded-3xl p-2 shadow-2xl menu-popup z-30">
        <button
          onClick={() => { onSelect('gallery'); onClose(); }}
          className="w-full flex items-center justify-between p-4 hover:bg-white/5 rounded-2xl transition-colors"
        >
          <span className="text-base font-medium">المعرض</span>
          <div className="bg-blue-500/20 p-2.5 rounded-full">
            <Images weight="bold" className="w-5 h-5 text-blue-400" />
          </div>
        </button>
        <button
          onClick={() => { onSelect('camera'); onClose(); }}
          className="w-full flex items-center justify-between p-4 hover:bg-white/5 rounded-2xl transition-colors"
        >
          <span className="text-base font-medium">الكاميرا</span>
          <div className="bg-green-500/20 p-2.5 rounded-full">
            <Camera weight="bold" className="w-5 h-5 text-green-400" />
          </div>
        </button>
        <button
          onClick={() => { onSelect('file'); onClose(); }}
          className="w-full flex items-center justify-between p-4 hover:bg-white/5 rounded-2xl transition-colors"
        >
          <span className="text-base font-medium">مستند</span>
          <div className="bg-purple-500/20 p-2.5 rounded-full">
            <FileText weight="bold" className="w-5 h-5 text-purple-400" />
          </div>
        </button>
      </div>
    </>
  );
};

// Message Component
const MessageBubble = ({ 
  message, 
  onCopy, 
  onReaction,
  onFeedback 
}: { 
  message: Message; 
  onCopy: (text: string) => void;
  onReaction: (type: 'like' | 'dislike') => void;
  onFeedback: () => void;
}) => {
  const [copied, setCopied] = useState(false);
  const [reaction, setReaction] = useState<'like' | 'dislike' | null>(null);

  const handleCopy = () => {
    onCopy(message.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleReaction = (type: 'like' | 'dislike') => {
    setReaction(reaction === type ? null : type);
    onReaction(type);
  };

  if (message.isUser) {
    return (
      <div className="msg-user-container self-end max-w-[85%] animate-slide-in-up">
        <div className="message-user text-white text-[15px] leading-snug p-3 px-4">
          {message.text}
        </div>
        <div className="flex gap-3 px-1 mt-1.5 text-gray-500 text-xs">
          <button 
            onClick={handleCopy}
            className="hover:text-white transition-colors"
          >
            {copied ? <Check weight="bold" className="w-4 h-4 text-green-400" /> : <Copy weight="bold" className="w-4 h-4" />}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="msg-bot-container self-start max-w-[95%] animate-slide-in-up">
      <div className="flex gap-3">
        <img 
          src="https://i.postimg.cc/TYkxXzSh/grok-image-x6em5fj-edit-96291120058942.png" 
          className="w-8 h-8 rounded-full border border-white/10 flex-shrink-0"
          alt="Afnan"
        />
        <div className="flex flex-col gap-1 pt-1">
          <span className="text-[13px] font-bold text-gray-300">Afnan AI</span>
          <div className="text-gray-200 text-[15px] leading-relaxed">
            {message.text}
          </div>
          <div className="flex gap-4 mt-2 text-gray-500 text-[14px]">
            <button 
              onClick={handleCopy}
              className="hover:text-white transition-colors"
            >
              {copied ? <Check weight="bold" className="w-4 h-4 text-green-400" /> : <Copy weight="bold" className="w-4 h-4" />}
            </button>
            <button 
              onClick={() => handleReaction('like')}
              className={`transition-colors ${reaction === 'like' ? 'text-green-400' : 'hover:text-green-400'}`}
            >
              <ThumbsUp weight={reaction === 'like' ? 'fill' : 'bold'} className="w-4 h-4" />
            </button>
            <button 
              onClick={() => handleReaction('dislike')}
              className={`transition-colors ${reaction === 'dislike' ? 'text-red-400' : 'hover:text-red-400'}`}
            >
              <ThumbsDown weight={reaction === 'dislike' ? 'fill' : 'bold'} className="w-4 h-4" />
            </button>
            <button 
              onClick={onFeedback}
              className="hover:text-yellow-400 transition-colors"
            >
              <WarningCircle weight="bold" className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Typing Indicator
const TypingIndicator = () => (
  <div className="msg-bot-container self-start max-w-[95%]">
    <div className="flex gap-3">
      <img 
        src="https://i.postimg.cc/TYkxXzSh/grok-image-x6em5fj-edit-96291120058942.png" 
        className="w-8 h-8 rounded-full border border-white/10 flex-shrink-0"
        alt="Afnan"
      />
      <div className="flex flex-col gap-1 pt-1">
        <span className="text-[13px] font-bold text-gray-300">Afnan AI</span>
        <div className="flex gap-1.5 p-3 bg-white/5 rounded-2xl">
          <div className="typing-dot" />
          <div className="typing-dot" />
          <div className="typing-dot" />
        </div>
      </div>
    </div>
  </div>
);

// Feedback Modal
const FeedbackModal = ({
  isOpen,
  onClose
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const [text, setText] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!text.trim()) return;
    setSubmitted(true);
    setTimeout(() => {
      onClose();
      setText('');
      setSubmitted(false);
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-full max-w-sm glass rounded-3xl p-6 shadow-2xl animate-scale-in">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <WarningCircle weight="bold" className="w-5 h-5 text-yellow-400" />
          إبلاغ عن مشكلة
        </h3>
        
        {submitted ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
              <Check weight="bold" className="w-8 h-8 text-green-400" />
            </div>
            <p className="text-green-400 font-bold">تم الإرسال بنجاح!</p>
          </div>
        ) : (
          <>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={4}
              className="w-full bg-black/30 border border-white/10 rounded-2xl p-4 text-white text-sm mb-4 placeholder-gray-600 resize-none focus:outline-none focus:border-white/20"
              placeholder="اشرح المشكلة بوضوح..."
            />
            <button
              onClick={handleSubmit}
              disabled={!text.trim()}
              className="w-full bg-white text-black font-bold py-3.5 rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              إرسال
            </button>
          </>
        )}
      </div>
    </div>
  );
};

// Main App Component
function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [attachmentOpen, setAttachmentOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [showWelcome, setShowWelcome] = useState(true);
  
  const chatAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Check auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser: User | null) => {
      setUser(currentUser);
      setIsLoading(false);
      if (currentUser) {
        loadUserChats(currentUser.uid);
      }
    });
    return () => unsubscribe();
  }, []);

  // Load user chats
  const loadUserChats = async (userId: string) => {
    try {
      const userChats = await getUserChats(userId);
      setChats(userChats);
    } catch (error) {
      console.error('Error loading chats:', error);
    }
  };

  // Scroll to bottom
  useEffect(() => {
    if (chatAreaRef.current) {
      chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 128)}px`;
    }
  }, [inputText]);

  const handleSend = async () => {
    if (!inputText.trim() || !user) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setShowWelcome(false);
    setIsTyping(true);

    // Create or update chat
    try {
      let chatId = currentChatId;
      if (!chatId) {
        chatId = await createChat(user.uid, userMessage.text.substring(0, 30));
        setCurrentChatId(chatId);
      }
      
      await addMessage(user.uid, chatId, {
        text: userMessage.text,
        isUser: true
      });

      // Simulate bot response
      setTimeout(async () => {
        const botResponse: Message = {
          id: (Date.now() + 1).toString(),
          text: 'أهلاً بك! أنا Afnan AI، كيف يمكنني مساعدتك اليوم؟',
          isUser: false,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, botResponse]);
        setIsTyping(false);
        
        await addMessage(user.uid, chatId!, {
          text: botResponse.text,
          isUser: false
        });

        loadUserChats(user.uid);
      }, 1500);
    } catch (error) {
      console.error('Error saving message:', error);
      toast.error('حدث خطأ في حفظ الرسالة');
      setIsTyping(false);
    }
  };

  const handleNewChat = () => {
    setCurrentChatId(null);
    setMessages([]);
    setShowWelcome(true);
    setInputText('');
  };

  const handleSelectChat = async (chatId: string) => {
    if (!user) return;
    
    try {
      const chatMessages = await getChatMessages(user.uid, chatId);
      const formattedMessages: Message[] = chatMessages.map((msg: { id: string; text: string; isUser: boolean; timestamp: { toDate: () => Date } }) => ({
        id: msg.id,
        text: msg.text,
        isUser: msg.isUser,
        timestamp: msg.timestamp?.toDate() || new Date()
      }));
      
      setMessages(formattedMessages);
      setCurrentChatId(chatId);
      setShowWelcome(false);
    } catch (error) {
      console.error('Error loading chat messages:', error);
      toast.error('حدث خطأ في تحميل المحادثة');
    }
  };

  const handleDeleteChat = async (chatId: string) => {
    if (!user) return;
    
    try {
      await deleteChat(user.uid, chatId);
      if (chatId === currentChatId) {
        handleNewChat();
      }
      loadUserChats(user.uid);
      toast.success('تم حذف المحادثة');
    } catch (error) {
      console.error('Error deleting chat:', error);
      toast.error('حدث خطأ في حذف المحادثة');
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      setUser(null);
      setMessages([]);
      setChats([]);
      setCurrentChatId(null);
      setShowWelcome(true);
      toast.success('تم تسجيل الخروج');
    } catch (error) {
      toast.error('حدث خطأ في تسجيل الخروج');
    }
  };

  const handleCopy = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('تم النسخ!');
  }, []);

  const handleAttachment = (type: 'gallery' | 'camera' | 'file') => {
    toast.info(`سيتم فتح ${type === 'gallery' ? 'المعرض' : type === 'camera' ? 'الكاميرا' : 'المستندات'} قريباً`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner w-10 h-10" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen">
        <StarryBackground />
        <LoginPage onLogin={() => {}} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col relative" dir="rtl">
      <StarryBackground />

      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        chats={chats}
        currentChatId={currentChatId}
        onSelectChat={handleSelectChat}
        onNewChat={handleNewChat}
        onDeleteChat={handleDeleteChat}
        user={user}
        onLogout={handleLogout}
      />

      {/* Main Container */}
      <div className="relative z-10 flex flex-col h-screen max-w-3xl mx-auto w-full">
        
        {/* Header */}
        <header className="px-4 py-3 flex items-center justify-between z-20 glass border-b-0 rounded-b-2xl mx-2 mt-2">
          <button 
            onClick={() => setSidebarOpen(true)}
            className="p-2 text-gray-400 hover:text-white transition-colors rounded-xl hover:bg-white/5"
          >
            <Menu weight="bold" className="w-6 h-6" />
          </button>
          <span className="text-sm font-bold tracking-wider">Afnan AI</span>
          <button 
            onClick={handleNewChat}
            className="p-2 text-gray-400 hover:text-white transition-colors rounded-xl hover:bg-white/5"
          >
            <Plus weight="bold" className="w-6 h-6" />
          </button>
        </header>

        {/* Chat Area */}
        <div 
          ref={chatAreaRef}
          className="flex-1 overflow-y-auto px-4 flex flex-col no-scrollbar relative z-10 pb-4"
        >
          {/* Welcome Screen */}
          {showWelcome && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 pointer-events-none animate-fade-in">
              <div className="relative">
                <img 
                  src="https://i.postimg.cc/TYkxXzSh/grok-image-x6em5fj-edit-96291120058942.png" 
                  alt="Afnan Logo" 
                  className="w-24 h-24 object-contain drop-shadow-2xl"
                />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-black flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                </div>
              </div>
              <h1 className="text-2xl font-bold">مرحباً بك في Afnan AI</h1>
              <p className="text-gray-400 text-sm">اسألني أي شيء، أنا هنا للمساعدة</p>
            </div>
          )}

          {/* Messages */}
          <div className="flex flex-col gap-4 pt-4 pb-2 mt-auto">
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                onCopy={handleCopy}
                onReaction={() => {}}
                onFeedback={() => setFeedbackOpen(true)}
              />
            ))}
            {isTyping && <TypingIndicator />}
          </div>
        </div>

        {/* Input Area */}
        <div className="w-full pb-6 px-4 pt-2 bg-gradient-to-t from-black via-black/90 to-transparent z-20">
          <div className="relative">
            {/* Attachment Menu */}
            <AttachmentMenu
              isOpen={attachmentOpen}
              onClose={() => setAttachmentOpen(false)}
              onSelect={handleAttachment}
            />

            {/* Input Box */}
            <div className="input-glass rounded-[32px] flex flex-col w-full">
              <div className="flex items-end px-2 py-2 min-h-[60px]">
                <button 
                  onClick={() => setAttachmentOpen(!attachmentOpen)}
                  className="p-3 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-white/5"
                >
                  <Paperclip weight="bold" className="w-6 h-6" />
                </button>
                
                <textarea
                  ref={inputRef}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  rows={1}
                  placeholder="اسأل عن أي شيء..."
                  className="flex-1 bg-transparent border-none text-white text-base px-3 py-3 placeholder-gray-500 w-full resize-none focus:outline-none max-h-32 overflow-y-auto no-scrollbar"
                  dir="rtl"
                />
                
                <div className="flex items-center gap-2 pl-1">
                  <button className="flex items-center gap-1.5 text-gray-300 bg-white/5 hover:bg-white/10 rounded-full px-3 py-2 transition-colors border border-white/5 whitespace-nowrap text-xs">
                    <CaretDown weight="bold" className="w-3 h-3" />
                    <span className="font-bold font-sans">Flash</span>
                  </button>
                  
                  <button
                    onClick={handleSend}
                    disabled={!inputText.trim() || isTyping}
                    className="bg-white text-black w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    <ArrowUp weight="bold" className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={feedbackOpen}
        onClose={() => setFeedbackOpen(false)}
      />
    </div>
  );
}

export default App;
