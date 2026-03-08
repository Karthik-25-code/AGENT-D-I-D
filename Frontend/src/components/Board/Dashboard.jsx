import React, { useState, useRef, useEffect } from 'react';
import { useToast } from '../Toast/ToastProvider';
import { motion, AnimatePresence } from 'framer-motion';
import Whiteboard from './WhiteBoard';

const Dashboard = () => {
    const [mode, setMode] = useState('teach');
    const [darkMode, setDarkMode] = useState(true);
    const [activeTool, setActiveTool] = useState('pencil');
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState("");
    const [userEmail, setUserEmail] = useState('');
    const [activeColor, setActiveColor] = useState('#f97316');

    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const dropdownRef = useRef(null); // Useful for closing when clicking outside
    const toast = useToast();

    const recognitionRef = useRef(null);
    const whiteboardRef = useRef(null);

    // Inside Dashboard component
    const [aiSteps, setAiSteps] = useState([]);
    const [aiResponseText, setAiResponseText] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);

    const colors = ['#f97316', '#3b82f6', '#22c55e']; // Orange, Blue, Green
    // 2. Wrap the API call with the loading state
    const handleClearBoard = () => {
        if (whiteboardRef.current) {
            whiteboardRef.current.clearCanvas();
        }
    };
    const handleSendInput = async () => {
        if (!transcript.trim() || isProcessing) return;

        setIsProcessing(true);
        await triggerAIAction(transcript);
        setTranscript(""); // Clear input after sending
        setIsProcessing(false);
    };

    const triggerAIAction = async (userInput) => {
        try {
            const response = await fetch('http://127.0.0.1:8000/run_test', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: "ranjit_01",
                    topic: "Machine Learning",
                    user_input: userInput
                })
            });
            const data = await response.json();

            // 1. Send steps to whiteboard
            setAiSteps(data.whiteboard_actions);

            // 2. Extract clean text for the AI Video bubble
            const lastMsg = data.messages[data.messages.length - 1].content;
            const cleanText = lastMsg.split("###")[0].trim(); // Get text before Task markers
            setAiResponseText(cleanText);

        } catch (err) {
            toast.error("AI failed to respond");
        }
    };

    // You can trigger this when Voice Recognition stops or on a button click

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            toast.error('Please sign in to access the dashboard');
            setTimeout(() => { window.location.href = '/login'; }, 800);
        } else {
            // Try to decode JWT payload for an email, else fallback to localStorage 'email'
            try {
                const parts = token.split('.');
                if (parts.length === 3) {
                    const payload = parts[1];
                    const b64 = payload.replace(/-/g, '+').replace(/_/g, '/');
                    const jsonPayload = decodeURIComponent(atob(b64).split('').map(function (c) {
                        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                    }).join(''));
                    const data = JSON.parse(jsonPayload);
                    if (data && (data.email || data.sub)) setUserEmail(data.email || data.sub);
                }
            } catch {
                const storedEmail = localStorage.getItem('email');
                if (storedEmail) setUserEmail(storedEmail);
            }
        }
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowProfileMenu(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = true;
            recognitionRef.current.onresult = (event) => {
                const text = Array.from(event.results).map(result => result[0].transcript).join('');
                setTranscript(text);
            };
        }
    }, []);

    const toggleListening = () => {
        if (isListening) {
            recognitionRef.current.stop();
            toast.info('Voice recognition stopped');
        } else {
            recognitionRef.current.start();
            toast.info('Voice recognition started');
        }
        setIsListening(!isListening);
    };

    return (
        <div className={`h-screen w-full font-sans overflow-hidden flex transition-colors duration-500 ${darkMode ? 'bg-[#0F0E0D] text-white' : 'bg-[#F5F5F3] text-black'}`}>

            {/* SIDEBAR */}
            <aside className={`border-r transition-colors flex flex-col items-center py-8 w-20 relative z-[60] ${darkMode ? 'bg-[#141210] border-white/5' : 'bg-white border-black/5'}`}>

                {/* Profile Section */}
                <div className="relative mb-10" ref={dropdownRef}>
                    <button onClick={() => setShowProfileMenu(!showProfileMenu)} className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center font-black text-black shadow-lg">
                        {userEmail ? userEmail.charAt(0).toUpperCase() : 'G'}
                    </button>
                    {/* ... Dropdown AnimatePresence stays here ... */}
                </div>

                {/* TOOL BELT */}
                <div className="flex-1 space-y-4 flex flex-col items-center">
                    {/* Drawing Tools */}
                    <button onClick={() => setActiveTool('pencil')} className={`p-3 rounded-xl transition-all ${activeTool === 'pencil' ? 'bg-orange-500 text-black' : 'text-zinc-500 hover:text-white'}`}>✎</button>
                    <button onClick={() => setActiveTool('square')} className={`p-3 rounded-xl transition-all ${activeTool === 'square' ? 'bg-orange-500 text-black' : 'text-zinc-500 hover:text-white'}`}>▢</button>
                    <button onClick={() => setActiveTool('eraser')} className={`p-3 rounded-xl transition-all ${activeTool === 'eraser' ? 'bg-orange-500 text-black' : 'text-zinc-500 hover:text-white'}`}>🧹</button>
                    {/* 3. ADD THE TRASH BUTTON HERE */}
                    <button
                        onClick={handleClearBoard}
                        className={`p-3 rounded-xl transition-all text-red-500 hover:bg-red-500/10 active:scale-90`}
                        title="Clear Board"
                    >
                        🗑️
                    </button>

                    <div className={`w-8 h-[1px] my-2 ${darkMode ? 'bg-white/10' : 'bg-black/10'}`}></div>

                    {/* COLOR PICKER */}
                    {colors.map((c) => (
                        <button
                            key={c}
                            onClick={() => { setActiveColor(c); setActiveTool('pencil'); }}
                            className={`w-6 h-6 rounded-full transition-transform hover:scale-125 ${activeColor === c && activeTool !== 'eraser' ? 'ring-2 ring-offset-2 ring-white scale-110' : ''}`}
                            style={{ backgroundColor: c }}
                        />
                    ))}

                    <div className={`w-8 h-[1px] my-2 ${darkMode ? 'bg-white/10' : 'bg-black/10'}`}></div>

                    <button onClick={toggleListening} className={`p-3 rounded-xl transition-all relative ${isListening ? 'bg-red-500 text-white animate-pulse' : (darkMode ? 'bg-white/5 text-zinc-500' : 'bg-black/5 text-zinc-400')}`}>
                        {isListening ? '●' : '🎤'}
                    </button>
                </div>

                <button onClick={() => setDarkMode(!darkMode)} className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all ${darkMode ? 'bg-zinc-800 border-white/10 text-yellow-400' : 'bg-zinc-100 border-black/10 text-indigo-600'}`}>
                    {darkMode ? '☼' : '☾'}
                </button>
            </aside>

            {/* MAIN WORKSPACE */}
            <main className="flex-1 flex flex-col relative">
                <header className={`h-16 border-b flex items-center justify-between px-8 backdrop-blur-md z-20 transition-colors ${darkMode ? 'bg-[#0F0E0D]/80 border-white/5' : 'bg-white/80 border-black/5'}`}>
                    <div className="flex items-center gap-6">
                        <div className={`flex p-1 rounded-full border ${darkMode ? 'bg-black border-white/5' : 'bg-zinc-100 border-black/5'}`}>
                            <button onClick={() => setMode('teach')} className={`px-6 py-1 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'teach' ? 'bg-orange-500 text-black' : (darkMode ? 'text-zinc-500' : 'text-zinc-400')}`}>I am Teaching</button>
                            <button onClick={() => setMode('learn')} className={`px-6 py-1 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'learn' ? 'bg-orange-500 text-black' : (darkMode ? 'text-zinc-500' : 'text-zinc-400')}`}>I am Learning</button>
                        </div>
                    </div>
                </header>

                <div className={`flex-1 relative overflow-hidden transition-colors ${darkMode ? 'bg-[#141210]' : 'bg-[#FCFCFB]'}`}>
                    <Whiteboard
                        ref={whiteboardRef}
                        isDrawingMode={mode === 'teach'}
                        darkMode={darkMode}
                        activeTool={activeTool}
                        activeColor={activeColor} // NEW PROP
                        aiSteps={aiSteps}
                    />

                    {/* --- FLOATING INPUT BAR --- */}
                    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4 z-50">
                        <div className={`relative flex items-center gap-2 p-2 rounded-2xl border backdrop-blur-2xl shadow-2xl transition-all ${darkMode ? 'bg-black/60 border-white/10' : 'bg-white/80 border-black/10'
                            }`}>
                            <input
                                type="text"
                                value={transcript}
                                onChange={(e) => setTranscript(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSendInput()}
                                placeholder="Ask AI to draw something (e.g., 'Draw a neural network')"
                                className={`flex-1 bg-transparent px-4 py-2 text-sm outline-none ${darkMode ? 'text-white placeholder:text-zinc-500' : 'text-black placeholder:text-zinc-400'
                                    }`}
                            />
                            <button
                                onClick={handleSendInput}
                                disabled={isProcessing}
                                className={`px-6 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${isProcessing
                                    ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                                    : 'bg-orange-500 text-black hover:scale-105 active:scale-95'
                                    }`}
                            >
                                {isProcessing ? "Processing..." : "Ask AI"}
                            </button>
                        </div>
                    </div>

                    {/* FLOATING AI VIDEO */}
                    <motion.div drag dragConstraints={{ left: -800, right: 0, top: 0, bottom: 0 }} className={`absolute bottom-8 right-8 w-60 h-72 rounded-3xl border shadow-2xl overflow-hidden z-30 cursor-grab ${darkMode ? 'bg-black border-white/10' : 'bg-white border-black/10'}`}>
                        <div className="w-full h-full relative">
                            <img src="https://images.unsplash.com/photo-1614728263952-84ea256f9679?auto=format&fit=crop&q=80&w=400" className="w-full h-full object-cover mix-blend-luminosity opacity-40" alt="AI" />
                            <div className={`absolute bottom-3 left-3 right-3 p-3 backdrop-blur-md rounded-xl border ${darkMode ? 'bg-white/10 border-white/10 text-zinc-300' : 'bg-black/5 border-black/10 text-zinc-800'}`}>
                                <p className="text-[10px] leading-tight font-bold uppercase tracking-tighter opacity-50 mb-1">AI Partner</p>
                                <p className="text-[11px] leading-tight italic">
                                    {aiResponseText || (mode === 'teach' ? "I'm ready to help you teach!" : "What should we learn today?")}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;