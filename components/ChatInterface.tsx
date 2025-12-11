
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, MockDatabase, UserSession, ChartData, GeneratedFile } from '../types';
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

// --- COMPONENTS: CHARTS & DIAGRAMS ---

const ChartComponent: React.FC<{ data: ChartData }> = ({ data }) => {
  if (data.type === 'flowchart') {
    return (
      <div className="mt-3 p-4 bg-white rounded-lg border border-gray-200 shadow-sm w-full max-w-md">
        <h4 className="text-center font-bold text-gray-700 mb-4 text-sm uppercase border-b pb-2">{data.title}</h4>
        <div className="flex flex-col gap-2">
           {data.labels.map((step, idx) => (
             <div key={idx} className="flex items-center">
                <div className="flex-none flex flex-col items-center mr-3">
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shadow-md z-10">
                    {idx + 1}
                  </div>
                  {idx < data.labels.length - 1 && <div className="h-6 w-0.5 bg-gray-300 my-1"></div>}
                </div>
                <div className="flex-1 bg-blue-50 p-2 rounded text-sm text-gray-700 border border-blue-100 shadow-sm">
                   <p className="font-semibold">{step}</p>
                   {data.steps && data.steps[idx] && step !== data.steps[idx] && (
                     <p className="text-xs text-gray-500 mt-1">{data.steps[idx]}</p>
                   )}
                </div>
             </div>
           ))}
        </div>
      </div>
    );
  }

  // BAR CHART
  if (data.type === 'bar') {
    const maxValue = Math.max(...(data.values || [0]));
    const safeMax = maxValue === 0 ? 1 : maxValue; // Prevent divide by zero

    return (
      <div className="mt-3 p-4 bg-white rounded-lg border border-gray-200 shadow-sm w-full max-w-md">
        <h4 className="text-center font-bold text-gray-700 mb-4 text-sm uppercase">{data.title}</h4>
        <div className="flex items-end justify-center space-x-3 h-48 pb-2 border-b border-gray-300">
          {data.values.map((val, idx) => (
            <div key={idx} className="flex flex-col items-center group relative flex-1">
               <span className="absolute -top-6 text-xs font-bold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                 {val}
               </span>
               <div 
                 className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t hover:from-blue-600 hover:to-blue-500 transition-all duration-500 shadow-sm min-h-[1px]"
                 style={{ height: `${(val / safeMax) * 100}%` }}
               ></div>
            </div>
          ))}
        </div>
        <div className="flex justify-center space-x-3 mt-2">
          {data.labels.map((label, idx) => (
            <div key={idx} className="text-[10px] text-gray-500 flex-1 text-center truncate" title={label}>
              {label}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // PIE CHART
  if (data.type === 'pie') {
    const total = data.values.reduce((a, b) => a + b, 0);
    let cumulativePercent = 0;
    const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#6366f1'];
    
    const gradientString = data.values.map((val, idx) => {
        const percent = (val / total) * 100;
        const start = cumulativePercent;
        cumulativePercent += percent;
        return `${colors[idx % colors.length]} ${start}% ${cumulativePercent}%`;
    }).join(', ');

    return (
      <div className="mt-3 p-4 bg-white rounded-lg border border-gray-200 shadow-sm w-full max-w-md flex flex-col items-center">
        <h4 className="text-center font-bold text-gray-700 mb-4 text-sm uppercase">{data.title}</h4>
        <div className="flex items-center gap-6">
           {/* The Pie */}
           <div 
             className="w-32 h-32 rounded-full shadow-inner"
             style={{ background: `conic-gradient(${gradientString})` }}
           ></div>
           {/* Legend */}
           <div className="flex flex-col gap-1">
             {data.labels.map((label, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs text-gray-600">
                   <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors[idx % colors.length] }}></div>
                   <span>{label} ({Math.round((data.values[idx] / total) * 100)}%)</span>
                </div>
             ))}
           </div>
        </div>
      </div>
    );
  }

  return null;
};

// --- COMPONENT: FILE DOWNLOAD CARD ---

const FileDownloadCard: React.FC<{ file: GeneratedFile }> = ({ file }) => {
  const handleDownload = () => {
    // Determine Blob Type
    let mimeType = file.mimeType;
    if (!mimeType) mimeType = 'text/plain';

    // Create Blob
    const blob = new Blob([file.content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    // Trigger Download
    const a = document.createElement('a');
    a.href = url;
    a.download = file.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mt-3 p-3 bg-white border-l-4 border-green-500 rounded shadow-sm flex items-center justify-between max-w-sm">
      <div className="flex items-center gap-3">
         <div className="bg-green-100 p-2 rounded text-green-600">
           <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
             <path fillRule="evenodd" d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0016.5 9h-1.875a1.875 1.875 0 01-1.875-1.875V5.25A3.75 3.75 0 009 1.5H5.625zM7.5 15a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5A.75.75 0 017.5 15zm.75 2.25a.75.75 0 000 1.5H12a.75.75 0 000-1.5H8.25z" clipRule="evenodd" />
             <path d="M12.971 1.816A5.23 5.23 0 0114.25 5.25v1.875c0 .207.168.375.375.375H16.5a5.23 5.23 0 013.434 1.279 9.768 9.768 0 00-6.963-6.963z" />
           </svg>
         </div>
         <div>
           <p className="font-bold text-gray-800 text-sm">{file.filename}</p>
           <p className="text-xs text-gray-500">Siap diunduh</p>
         </div>
      </div>
      <button 
        onClick={handleDownload}
        className="px-3 py-1 bg-green-600 text-white text-xs font-semibold rounded hover:bg-green-700 transition"
      >
        Download
      </button>
    </div>
  );
};

// --- MAIN CHAT INTERFACE ---

const ChatInterface: React.FC<ChatInterfaceProps> = ({ database, user, setUser }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingLogs, setLoadingLogs] = useState<string[]>([]);
  const [authStep, setAuthStep] = useState<AuthStep>('IDLE');
  const [tempId, setTempId] = useState('');
  
  // File State
  const [selectedFile, setSelectedFile] = useState<{ name: string; type: string; data: string } | null>(null);
  
  const [rememberMe, setRememberMe] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showThinking, setShowThinking] = useState(true);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (messages.length === 0) {
      let welcomeText = "";

      if (user) {
        // Welcome text untuk user yang sudah login
        welcomeText = `👋 **Selamat datang kembali, ${user.name}!**\n\n`;
        welcomeText += `Anda login sebagai: **${user.role.toUpperCase()}**\n\n`;
        
        if (user.role === 'student') {
            welcomeText += `Apa yang ingin Anda cek hari ini?\n`;
            welcomeText += `✅ **Akademik**: "Berapa IPK saya?", "Jadwal kuliah hari ini"\n`;
            welcomeText += `✅ **Keuangan**: "Status SPP semester ini"\n`;
            welcomeText += `✅ **Surat**: "Buatkan surat cuti akademik"`;
        } else if (user.role === 'employee' || user.role === 'lecturer') {
            welcomeText += `Menu Staf:\n`;
            welcomeText += `💼 **HR**: "Cek slip gaji bulan lalu", "Rekap absensi saya"\n`;
            welcomeText += `📅 **Jadwal**: "Jadwal mengajar minggu ini"`;
        } else if (user.role === 'admin') {
            welcomeText += `⚠️ **ADMIN MODE AKTIF**\n`;
            welcomeText += `Anda memiliki akses penuh ke seluruh database.\n`;
            welcomeText += `Cobalah: "Buatkan laporan gaji seluruh pegawai dalam Excel" atau "Grafik sebaran IPK mahasiswa".`;
        }
      } else {
        // Welcome text untuk Guest (Tamu) - LEBIH LENGKAP
        welcomeText = `🤖 **Halo! Saya Campus AI Nexus.**\n`;
        welcomeText += `Asisten Cerdas Universitas Teknologi Masa Depan.\n\n`;
        welcomeText += `Fitur Publik (Tanpa Login):\n`;
        welcomeText += `🏢 **Info Kampus**: Denah Gedung, Sejarah, Fakultas.\n`;
        welcomeText += `📋 **Pendaftaran (PMB)**: Syarat masuk, Cara daftar.\n`;
        welcomeText += `💰 **Beasiswa**: Info beasiswa terbaru.\n`;
        welcomeText += `🏫 **Organisasi**: Daftar UKM dan kegiatan mahasiswa.\n\n`;
        
        welcomeText += `🔒 **Fitur Terkunci (Perlu Login):**\n`;
        welcomeText += `Ketik "Login" untuk mengakses:\n`;
        welcomeText += `- Nilai & Transkrip Akademik\n`;
        welcomeText += `- Pembayaran SPP\n`;
        welcomeText += `- Slip Gaji (Karyawan/Dosen)\n`;
        welcomeText += `- Absensi & Jadwal Personal\n\n`;
        
        welcomeText += `*Silakan tanya sesuatu atau ketik "Login" untuk masuk.*`;
      }
        
      setMessages([
        {
          id: 'init',
          role: 'model',
          text: welcomeText,
          timestamp: new Date()
        }
      ]);
    }
  }, [user]); 

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loadingLogs]);

  const addBotMessage = (text: string, chart?: ChartData, file?: GeneratedFile, logs?: string[]) => {
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: 'model',
      text,
      chartData: chart,
      generatedFile: file,
      debugLogs: logs,
      timestamp: new Date()
    }]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedFile({
          name: file.name,
          type: file.type,
          data: reader.result as string
        });
      };
      // Read as Data URL (Base64) for both images and PDFs
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
    if ((!input.trim() && !selectedFile) || isLoading) return;

    const userText = input.trim();
    const currentFile = selectedFile; // Capture current file ref
    
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: 'user',
      text: userText || (currentFile ? `Mengirim file: ${currentFile.name}` : ""),
      // If it's an image, show it in chat bubble
      image: (currentFile && currentFile.type.startsWith('image/')) ? currentFile.data : undefined, 
      timestamp: new Date()
    }]);
    
    setInput('');
    setSelectedFile(null); // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = "";
    
    setIsLoading(true);
    setLoadingLogs([]);

    // --- INTERCEPTOR: AUTHENTICATION ---
    if (user && (userText.toLowerCase() === 'logout' || userText.toLowerCase() === 'keluar')) {
      setUser(null);
      clearSession(); 
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

        // Auth Logic (Same as before)
        foundUser = database.students.find(s => s.nim === tempId && s.password === password);
        if (!foundUser) {
          foundUser = database.lecturers.find(l => l.nip === tempId && l.password === password);
          if (foundUser) role = 'lecturer';
        }
        if (!foundUser) {
          foundUser = database.employees.find(e => e.nik === tempId && e.password === password);
          if (foundUser) role = 'employee';
        }
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
          saveSession(newUserSession, rememberMe);
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

        const filePayload = currentFile ? { data: currentFile.data, mimeType: currentFile.type } : undefined;

        const result = await generateAIResponse(
          userText, 
          database, 
          history, 
          user, 
          filePayload,
          (log) => setLoadingLogs(prev => [...prev, log])
        );

        addBotMessage(result.text, result.chart, result.file, result.logs);
      }
    } catch (error) {
      console.error(error);
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
      
      {/* HEADER BAR */}
      <div className="bg-white px-4 py-2 border-b border-gray-200 flex justify-between items-center shadow-sm z-10">
         <div className="flex items-center gap-2">
           <div className={`w-2 h-2 rounded-full ${user ? 'bg-green-500' : 'bg-gray-400'}`}></div>
           <span className="text-xs font-semibold text-gray-600">
             {user ? 'Connected' : 'Guest Mode'}
           </span>
         </div>
         
         <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowThinking(!showThinking)}
              className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition ${showThinking ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}
              title="Tampilkan Proses Berpikir AI"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
                <path fillRule="evenodd" d="M.664 10.59a1.651 1.651 0 010-1.186A10.004 10.004 0 0110 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0110 17c-4.257 0-7.893-2.66-9.336-6.41zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
              </svg>
              <span>{showThinking ? 'Logic: ON' : 'Logic: OFF'}</span>
            </button>
         </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")', backgroundRepeat: 'repeat' }}>
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
             <div className={`max-w-[90%] md:max-w-[85%] rounded-lg px-4 py-2 shadow-sm text-sm ${
              msg.role === 'user' ? 'bg-[#dcf8c6] text-gray-800 rounded-tr-none' : 'bg-white text-gray-800 rounded-tl-none'
            } ${msg.isError ? 'border border-red-500' : ''}`}>
              
              {/* Image Bubble */}
              {msg.image && (
                <div className="mb-2">
                  <img src={msg.image} alt="User upload" className="max-w-full h-auto rounded-lg" />
                </div>
              )}
              
              <div className="whitespace-pre-wrap">{msg.text}</div>
              
              {/* Charts & Diagrams */}
              {msg.chartData && (
                <ChartComponent data={msg.chartData} />
              )}

              {/* Generated Files */}
              {msg.generatedFile && (
                <FileDownloadCard file={msg.generatedFile} />
              )}

              {/* Thinking Process Logs */}
              {msg.debugLogs && msg.debugLogs.length > 0 && showThinking && (
                <div className="mt-3 pt-2 border-t border-gray-100">
                  <details className="text-[10px] text-gray-400 cursor-pointer" open>
                    <summary className="hover:text-gray-600 transition-colors">Proses Berpikir (Thinking...)</summary>
                    <ul className="list-disc pl-3 mt-1 space-y-1 bg-gray-50 p-2 rounded max-h-40 overflow-y-auto scrollbar-hide">
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
             {showThinking && (
               <div className="text-[10px] font-mono text-gray-500 space-y-1 border-l-2 border-gray-200 pl-2">
                 {loadingLogs.map((log, i) => (
                   <div key={i} className="animate-in fade-in slide-in-from-left-2 duration-300">
                     &gt; {log}
                   </div>
                 ))}
               </div>
             )}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-[#f0f0f0] p-2 md:p-3">
        {selectedFile && (
          <div className="mb-2 px-4 relative w-fit">
             <div className="h-16 px-4 bg-white border border-gray-300 rounded-md flex items-center gap-2">
                <span className="text-xs font-bold text-gray-600 truncate max-w-[150px]">{selectedFile.name}</span>
                <span className="text-[10px] text-gray-400 uppercase border px-1 rounded">{selectedFile.type.split('/')[1] || 'FILE'}</span>
             </div>
             <button onClick={() => setSelectedFile(null)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1">
               <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
                 <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clipRule="evenodd" />
               </svg>
             </button>
          </div>
        )}
        <form onSubmit={handleSendMessage} className="flex gap-2 items-center">
          {/* File Upload (Universal: Image/PDF/CSV) */}
          <button 
            type="button" 
            onClick={() => fileInputRef.current?.click()}
            className="p-3 text-gray-500 hover:text-[#128c7e]"
            disabled={isLoading}
            title="Kirim File (Gambar, PDF, Excel)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
              <path fillRule="evenodd" d="M18.97 3.659a2.25 2.25 0 00-3.182 0l-10.94 10.94a3.75 3.75 0 105.304 5.303l7.693-7.693a.75.75 0 011.06 1.06l-7.693 7.693a5.25 5.25 0 11-7.424-7.424l10.939-10.94a3.75 3.75 0 115.303 5.304L9.097 18.835l-.008.008-.006.007-.002.002-.003.002A2.25 2.25 0 015.91 15.66l7.81-7.81a.75.75 0 011.061 1.06l-7.81 7.81a.75.75 0 001.054 1.068L18.97 6.84a2.25 2.25 0 000-3.182z" clipRule="evenodd" />
            </svg>
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileSelect} 
            accept="image/*,application/pdf,text/csv,text/plain" 
            className="hidden" 
          />
          
          <input
            type={authStep === 'ASK_PASSWORD' ? "password" : "text"}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              authStep === 'ASK_PASSWORD' 
                ? "Masukkan Password..." 
                : (user ? (isListening ? "Mendengarkan..." : "Ketik / Kirim file...") : "Tanya sesuatu...")
            }
            className={`flex-1 rounded-full border-none px-4 py-3 focus:outline-none focus:ring-1 focus:ring-[#128c7e] text-sm bg-white ${isListening ? 'ring-2 ring-red-500 bg-red-50' : ''}`}
            disabled={isLoading}
            autoFocus
          />

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

          <button type="submit" disabled={isLoading || (!input.trim() && !selectedFile)} className="bg-[#128c7e] text-white rounded-full p-3 disabled:opacity-50">
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
