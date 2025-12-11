import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, MockDatabase, UserSession, ChartData } from '../types';
import { generateAIResponse } from '../services/geminiService';
import { saveSession, clearSession } from '../utils/storage';

interface ChatInterfaceProps {
  database: MockDatabase;
  user: UserSession | null;
  setUser: (user: UserSession | null) => void;
}

type AuthStep = 'IDLE' | 'ASK_ID' | 'ASK_PASSWORD';

// Declare Web Speech API types (Cross-browser support)
declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

const SimpleChart: React.FC<{ data: ChartData }> = ({ data }) => {
  const maxValue = Math.max(...data.values);
  return (
    <div className="mt-3 p-4 bg-white rounded-lg border border-gray-200 shadow-sm w-full max-w-md">
      <h4 className="text-center font-bold text-gray-700 mb-4 text-sm uppercase">{data.title}</h4>
      <div className="flex items-end justify-center space-x-2 h-40 pb-2 border-b border-gray-300">
        {data.values.map((val, idx) => (
          <div key={idx} className="flex flex-col items-center group relative w-1/5">
             <span className="absolute -top-6 text-xs font-bold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
               {val}
             </span>
             <div 
               className="w-full bg-blue-500 rounded-t hover:bg-blue-600 transition-all duration-500"
               style={{ height: `${(val / maxValue) * 100}%` }}
             ></div>
          </div>
        ))}
      </div>
      <div className="flex justify-center space-x-2 mt-2">
        {data.labels.map((label, idx) => (
          <div key={idx} className="text-[10px] text-gray-500 w-1/5 text-center truncate" title={label}>
            {label}
          </div>
        ))}
      </div>
    </div>
  );
};

const ChatInterface: React.FC<ChatInterfaceProps> = ({ database, user, setUser }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingLogs, setLoadingLogs] = useState<string[]>([]);
  const [authStep, setAuthStep] = useState<AuthStep>('IDLE');
  const [tempId, setTempId] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(false);
  const [isListening, setIsListening] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (messages.length === 0) {
      const welcomeText = user 
        ? `Selamat datang kembali, **${user.name}**! \nSesi Anda telah dipulihkan. Ada yang bisa saya bantu terkait ${user.role === 'student' ? 'nilai/SPP' : 'gaji/absensi'} hari ini?`
        : `Halo! Saya **Campus AI Nexus**.\n\nSaya dapat membantu:\n🎓 **Mahasiswa**: Nilai, Jadwal, SPP.\n👔 **Pegawai/Dosen**: Cek Gaji, Absensi.\n🏫 **Info Umum**: Denah Gedung, Cara Pendaftaran.\n\nKetik "login" untuk akses fitur personal.`;
        
      setMessages([
        {
          id: 'init',
          role: 'model',
          text: welcomeText,
          timestamp: new Date()
        }
      ]);
    }
  }, [user]); // Re-run if user restores from session

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loadingLogs]);

  const addBotMessage = (text: string, chart?: ChartData, logs?: string[]) => {
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: 'model',
      text,
      chartData: chart,
      debugLogs: logs,
      timestamp: new Date()
    }]);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Browser ini tidak mendukung fitur Voice Recognition. Gunakan Chrome atau Edge terbaru.");
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'id-ID';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
      if (event.error === 'not-allowed') {
        alert("Akses mikrofon ditolak. Izinkan akses mikrofon di pengaturan browser.");
      }
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
    };

    try {
      recognition.start();
    } catch (e) {
      console.error("Failed to start recognition", e);
      setIsListening(false);
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if ((!input.trim() && !selectedImage) || isLoading) return;

    const userText = input.trim();
    const userImage = selectedImage;
    
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: 'user',
      text: userText,
      image: userImage || undefined,
      timestamp: new Date()
    }]);
    
    setInput('');
    setSelectedImage(null);
    setIsLoading(true);
    setLoadingLogs([]);

    // --- INTERCEPTOR: AUTHENTICATION ---
    if (user && (userText.toLowerCase() === 'logout' || userText.toLowerCase() === 'keluar')) {
      setUser(null);
      clearSession(); // Hapus sesi
      setAuthStep('IDLE');
      setIsLoading(false);
      setTimeout(() => addBotMessage("Anda telah logout. Kembali ke mode Tamu."), 500);
      return;
    }

    if (!user) {
      if (authStep === 'IDLE' && userText.toLowerCase() === 'login') {
        setAuthStep('ASK_ID');
        setIsLoading(false);
        setTimeout(() => addBotMessage("Masukkan NIM (Mhs), NIP (Dosen), NIK (Pegawai), atau Username Admin:"), 500);
        return;
      }
      if (authStep === 'ASK_ID') {
        setTempId(userText);
        setAuthStep('ASK_PASSWORD');
        setIsLoading(false);
        setTimeout(() => addBotMessage(`ID terdeteksi. Masukkan Password:`), 500);
        return;
      }
      if (authStep === 'ASK_PASSWORD') {
        const password = userText;
        let foundUser: any = null;
        let role: 'student' | 'lecturer' | 'admin' | 'employee' = 'student';

        // 1. Check Student
        foundUser = database.students.find(s => s.nim === tempId && s.password === password);
        
        // 2. Check Lecturer
        if (!foundUser) {
          foundUser = database.lecturers.find(l => l.nip === tempId && l.password === password);
          if (foundUser) role = 'lecturer';
        }

        // 3. Check Employee (New)
        if (!foundUser) {
          foundUser = database.employees.find(e => e.nik === tempId && e.password === password);
          if (foundUser) role = 'employee';
        }

        // 4. Check Admin
        if (!foundUser) {
          foundUser = database.admins.find(a => a.username === tempId && a.password === password);
          if (foundUser) role = 'admin';
        }

        if (foundUser) {
          const newUserSession: UserSession = {
            id: foundUser.id,
            role: role,
            name: foundUser.name,
            identifier: role === 'student' ? foundUser.nim : 
                        (role === 'lecturer' ? foundUser.nip : 
                        (role === 'employee' ? foundUser.nik : foundUser.username))
          };
          
          setUser(newUserSession);
          saveSession(newUserSession, rememberMe); // SIMPAN SESI DISINI

          setAuthStep('IDLE');
          setTempId('');
          setIsLoading(false);
          setTimeout(() => addBotMessage(`✅ Login Berhasil sebagai ${role.toUpperCase()} (${foundUser.name})!`), 500);
        } else {
          setAuthStep('IDLE');
          setTempId('');
          setIsLoading(false);
          setTimeout(() => addBotMessage("❌ Login Gagal. ID/Password salah."), 500);
        }
        return;
      }
    }

    // --- AI PROCESSING ---
    try {
      if (authStep === 'IDLE') {
        const history = messages.map(m => {
          const parts: any[] = [];
          if (m.text) parts.push({ text: m.text });
          if (m.image) {
             const mimeType = m.image.substring(m.image.indexOf(":") + 1, m.image.indexOf(";"));
             const data = m.image.split(",")[1];
             parts.push({ inlineData: { mimeType, data } });
          }
          return { role: m.role, parts: parts };
        });

        const result = await generateAIResponse(
          userText, 
          database, 
          history, 
          user, 
          userImage || undefined,
          (log) => setLoadingLogs(prev => [...prev, log])
        );

        addBotMessage(result.text, result.chart, result.logs);
      }
    } catch (error) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'model',
        text: 'Maaf, terjadi kesalahan pada sistem AI.',
        timestamp: new Date(),
        isError: true
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#e5ddd5]">
      {/* Header handled in App.tsx now, but we keep this container clean */}
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")', backgroundRepeat: 'repeat' }}>
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
             <div className={`max-w-[85%] rounded-lg px-4 py-2 shadow-sm text-sm ${
              msg.role === 'user' ? 'bg-[#dcf8c6] text-gray-800 rounded-tr-none' : 'bg-white text-gray-800 rounded-tl-none'
            } ${msg.isError ? 'border border-red-500' : ''}`}>
              
              {msg.image && (
                <div className="mb-2">
                  <img src={msg.image} alt="User upload" className="max-w-full h-auto rounded-lg" />
                </div>
              )}
              
              <div className="whitespace-pre-wrap">{msg.text}</div>
              
              {msg.chartData && (
                <SimpleChart data={msg.chartData} />
              )}

              {msg.debugLogs && msg.debugLogs.length > 0 && (
                <div className="mt-3 pt-2 border-t border-gray-100">
                  <details className="text-[10px] text-gray-400 cursor-pointer">
                    <summary>Proses Berpikir (Thinking...)</summary>
                    <ul className="list-disc pl-3 mt-1 space-y-1 bg-gray-50 p-2 rounded">
                      {msg.debugLogs.map((log, i) => (
                        <li key={i}>{log}</li>
                      ))}
                    </ul>
                  </details>
                </div>
              )}

              <div className="text-[10px] text-right mt-1 text-gray-500 opacity-70">
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="bg-white rounded-lg rounded-tl-none px-4 py-3 shadow-sm w-fit max-w-[80%]">
             <div className="flex items-center space-x-2 mb-2">
               <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
               <span className="text-xs font-semibold text-gray-600">AI sedang menganalisis...</span>
             </div>
             <div className="text-[10px] font-mono text-gray-500 space-y-1 border-l-2 border-gray-200 pl-2">
               {loadingLogs.map((log, i) => (
                 <div key={i} className="animate-in fade-in slide-in-from-left-2 duration-300">
                   &gt; {log}
                 </div>
               ))}
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Auth Checkbox (Only when logging in) */}
      {authStep === 'ASK_PASSWORD' && (
        <div className="px-4 py-2 bg-[#f0f0f0] flex items-center justify-center">
          <label className="flex items-center space-x-2 text-xs text-gray-600 cursor-pointer">
            <input 
              type="checkbox" 
              checked={rememberMe} 
              onChange={(e) => setRememberMe(e.target.checked)}
              className="form-checkbox rounded text-[#128c7e] focus:ring-[#128c7e]" 
            />
            <span>Remember Me (Tetap Login)</span>
          </label>
        </div>
      )}

      {/* Input */}
      <div className="bg-[#f0f0f0] p-2 md:p-3">
        {selectedImage && (
          <div className="mb-2 px-4 relative w-fit">
             <img src={selectedImage} alt="Preview" className="h-20 rounded-md border border-gray-300" />
             <button onClick={() => setSelectedImage(null)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1">
               <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
                 <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clipRule="evenodd" />
               </svg>
             </button>
          </div>
        )}
        <form onSubmit={handleSendMessage} className="flex gap-2 items-center">
          {/* File Upload */}
          <button 
            type="button" 
            onClick={() => fileInputRef.current?.click()}
            className="p-3 text-gray-500 hover:text-[#128c7e]"
            disabled={isLoading}
            title="Kirim Foto Dokumen"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
              <path fillRule="evenodd" d="M18.97 3.659a2.25 2.25 0 00-3.182 0l-10.94 10.94a3.75 3.75 0 105.304 5.303l7.693-7.693a.75.75 0 011.06 1.06l-7.693 7.693a5.25 5.25 0 11-7.424-7.424l10.939-10.94a3.75 3.75 0 115.303 5.304L9.097 18.835l-.008.008-.006.007-.002.002-.003.002A2.25 2.25 0 015.91 15.66l7.81-7.81a.75.75 0 011.061 1.06l-7.81 7.81a.75.75 0 001.054 1.068L18.97 6.84a2.25 2.25 0 000-3.182z" clipRule="evenodd" />
            </svg>
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImageSelect} 
            accept="image/*" 
            className="hidden" 
          />
          
          <input
            type={authStep === 'ASK_PASSWORD' ? "password" : "text"}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              authStep === 'ASK_PASSWORD' 
                ? "Masukkan Password..." 
                : (user ? (isListening ? "Mendengarkan..." : "Ketik pesan...") : "Tanya sesuatu...")
            }
            className={`flex-1 rounded-full border-none px-4 py-3 focus:outline-none focus:ring-1 focus:ring-[#128c7e] text-sm bg-white ${isListening ? 'ring-2 ring-red-500 bg-red-50' : ''}`}
            disabled={isLoading}
            autoFocus
          />

          {/* Microphone Button (Speech to Text) */}
          <button
            type="button"
            onClick={toggleListening}
            disabled={isLoading}
            className={`p-3 rounded-full transition-colors ${isListening ? 'bg-red-500 text-white animate-pulse' : 'text-gray-500 hover:text-[#128c7e]'}`}
            title="Voice Input"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M8.25 4.5a3.75 3.75 0 117.5 0v8.25a3.75 3.75 0 11-7.5 0V4.5z" />
              <path d="M6 10.5a.75.75 0 01.75.75v1.5a5.25 5.25 0 1010.5 0v-1.5a.75.75 0 011.5 0v1.5a6.751 6.751 0 01-6 6.709v2.291h3a.75.75 0 010 1.5h-7.5a.75.75 0 010-1.5h3v-2.291a6.751 6.751 0 01-6-6.709v-1.5A.75.75 0 016 10.5z" />
            </svg>
          </button>

          <button type="submit" disabled={isLoading || (!input.trim() && !selectedImage)} className="bg-[#128c7e] text-white rounded-full p-3 disabled:opacity-50">
             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;