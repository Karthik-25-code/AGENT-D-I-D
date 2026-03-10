import React, { useState, useRef, useEffect } from 'react';
import { useToast } from '../Toast/ToastProvider';
import { motion, AnimatePresence } from 'framer-motion';
import Whiteboard from './WhiteBoard';

const Dashboard = () => {
    // --- LOGIC STATES ---
    const [darkMode, setDarkMode] = useState(false);
    const [activeTool, setActiveTool] = useState('pencil');
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState("");
    const [activeColor, setActiveColor] = useState('#f97316');
    const [showTextInput, setShowTextInput] = useState(false);
    
    const [aiSteps, setAiSteps] = useState([]);
    const [aiResponseText, setAiResponseText] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);
    const [userEmail, setUserEmail] = useState(''); // Kept for auth check

    const toast = useToast();
    const recognitionRef = useRef(null);
    const whiteboardRef = useRef(null);

    const colors = [darkMode ? '#ffffff' : '#000000', '#f97316', '#3b82f6', '#22c55e'];

    // --- EFFECTS ---

    // 1. Color Sync Logic
    useEffect(() => {
        if (activeColor === '#000000' && darkMode) setActiveColor('#ffffff');
        if (activeColor === '#ffffff' && !darkMode) setActiveColor('#000000');
    }, [darkMode, activeColor]);

    // 2. Auth Logic
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            toast.error('Please sign in to access the dashboard');
            setTimeout(() => { window.location.href = '/login'; }, 800);
        } else {
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
    }, [toast]);

    // 3. Speech Recognition Logic
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

    // --- ACTIONS & HANDLERS ---

    const handleClearBoard = () => {
        if (whiteboardRef.current) whiteboardRef.current.clearCanvas();
    };

    const handleSendInput = async () => {
        if (!transcript.trim() || isProcessing) return;

        setIsProcessing(true);
        await triggerAIAction(transcript);
        setTranscript(""); 
        setIsProcessing(false);
        setShowTextInput(false); // Auto-close text input after sending
    };

    const triggerAIAction = async (userInput) => {
        try {
            const response = await fetch('/api/run_test', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: "ranjit_01",
                    topic: "Machine Learning",
                    user_input: userInput
                })
            });
            const data = await response.json();

            setAiSteps(data.whiteboard_actions);

            const lastMsg = data.messages[data.messages.length - 1].content;
            const cleanText = lastMsg.split("###")[0].trim(); 
            setAiResponseText(cleanText);

            setTimeout(() => setAiResponseText(""), 8000);
        } catch (err) {
            toast.error("AI failed to respond");
        }
    };

    const toggleListening = () => {
        if (isListening) {
            recognitionRef.current.stop();
            toast.info('Mic muted');
        } else {
            recognitionRef.current.start();
            toast.info('Mic active');
        }
        setIsListening(!isListening);
    };

    return (
        <div className={`relative h-screen w-full font-sans overflow-hidden transition-colors duration-500 ${darkMode ? 'bg-[#141210] text-white' : 'bg-[#FCFCFB] text-black'}`}>

            {/* INFINITE CANVAS LAYER */}
            <div className="absolute inset-0 z-10">
                <Whiteboard
                    ref={whiteboardRef}
                    isDrawingMode={true} 
                    darkMode={darkMode}
                    activeTool={activeTool}
                    activeColor={activeColor}
                    aiSteps={aiSteps}
                />
            </div>

            {/* FLOATING TOOLBAR (Left Side) */}
            <div className={`absolute left-6 top-1/2 -translate-y-1/2 z-20 flex flex-col items-center gap-2 p-3 rounded-2xl border shadow-lg backdrop-blur-md transition-all ${darkMode ? 'bg-black/60 border-white/10' : 'bg-white/80 border-black/10'}`}>
                
                <button onClick={() => setActiveTool('pencil')} className={`p-3 rounded-xl transition-all ${activeTool === 'pencil' ? 'bg-orange-500 text-black shadow-md' : 'text-zinc-500 hover:text-orange-500'}`}>✎</button>
                <button onClick={() => setActiveTool('square')} className={`p-3 rounded-xl transition-all ${activeTool === 'square' ? 'bg-orange-500 text-black shadow-md' : 'text-zinc-500 hover:text-orange-500'}`}>▢</button>
                <button onClick={() => setActiveTool('eraser')} className={`p-3 rounded-xl transition-all ${activeTool === 'eraser' ? 'bg-orange-500 text-black shadow-md' : 'text-zinc-500 hover:text-orange-500'}`}>🧹</button>
                
                <div className={`w-8 h-[1px] my-1 ${darkMode ? 'bg-white/10' : 'bg-black/10'}`}></div>

                <div className="flex flex-col gap-3 py-2">
                    {colors.map((c) => (
                        <button
                            key={c}
                            onClick={() => { setActiveColor(c); setActiveTool('pencil'); }}
                            className={`w-5 h-5 rounded-full transition-transform hover:scale-125 ${activeColor === c && activeTool !== 'eraser' ? 'ring-2 ring-offset-2 ring-orange-500 scale-110' : ''}`}
                            style={{ backgroundColor: c, border: c === '#ffffff' ? '1px solid #e5e7eb' : 'none' }}
                        />
                    ))}
                </div>

                <div className={`w-8 h-[1px] my-1 ${darkMode ? 'bg-white/10' : 'bg-black/10'}`}></div>

                <button onClick={handleClearBoard} className="p-3 rounded-xl transition-all text-red-500 hover:bg-red-500/10" title="Clear Board">🗑️</button>
                <button onClick={() => setDarkMode(!darkMode)} className={`p-3 rounded-xl transition-all ${darkMode ? 'text-yellow-400' : 'text-indigo-600'}`}>
                    {darkMode ? '☼' : '☾'}
                </button>
            </div>

            {/* AI CALL HUD (Top Right) */}
            <motion.div 
                drag 
                dragConstraints={{ left: -800, right: 0, top: 0, bottom: 600 }} 
                className={`absolute top-8 right-8 z-30 flex items-center gap-4 p-2 pr-6 rounded-full border shadow-lg backdrop-blur-md cursor-grab active:cursor-grabbing transition-all ${darkMode ? 'bg-zinc-900/90 border-white/10' : 'bg-white/90 border-black/10'}`}
            >
                <div className={`relative w-10 h-10 rounded-full flex items-center justify-center border-2 ${isProcessing ? 'border-orange-500 bg-orange-500/10' : (darkMode ? 'border-zinc-700 bg-zinc-800' : 'border-zinc-200 bg-zinc-100')}`}>
                    <span className="text-lg">🤖</span>
                    {isProcessing && <div className="absolute inset-0 rounded-full bg-orange-500/20 animate-pulse"></div>}
                </div>
                <div className="flex flex-col select-none">
                    <span className={`text-sm font-bold leading-tight ${darkMode ? 'text-white' : 'text-black'}`}>AI Partner</span>
                    <div className="flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${isProcessing ? 'bg-orange-500 animate-pulse' : 'bg-green-500'}`}></span>
                        <span className={`text-[10px] uppercase font-bold tracking-wider ${darkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>
                            {isProcessing ? 'Thinking...' : 'Connected'}
                        </span>
                    </div>
                </div>
            </motion.div>

            {/* BOTTOM CONTROLS (CC + Input/Voice Bar) */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-4 w-full max-w-xl px-4 pointer-events-none">
                
                {/* CC Subtitles */}
                <div className="pointer-events-auto">
                    <AnimatePresence>
                        {aiResponseText && (
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className={`px-6 py-3 rounded-2xl border shadow-xl backdrop-blur-md text-center max-w-md ${darkMode ? 'bg-black/80 border-white/10 text-white' : 'bg-white/90 border-black/10 text-black'}`}
                            >
                                <p className="text-sm font-medium">{aiResponseText}</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Input / Voice Controls */}
                <div className="pointer-events-auto w-full flex justify-center">
                    {showTextInput ? (
                        /* TEXT INPUT BAR */
                        <div className={`flex items-center gap-2 p-2 rounded-2xl border backdrop-blur-xl shadow-2xl transition-all w-full max-w-xl ${darkMode ? 'bg-black/80 border-white/10' : 'bg-white/90 border-black/10'}`}>
                            <button 
                                onClick={() => setShowTextInput(false)} 
                                className={`p-2 rounded-xl transition-all ${darkMode ? 'text-zinc-400 hover:bg-white/10' : 'text-zinc-500 hover:bg-black/5'}`}
                                title="Back to Voice"
                            >
                                🎤
                            </button>
                            <input
                                type="text"
                                value={transcript}
                                onChange={(e) => setTranscript(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSendInput()}
                                placeholder="Type to speak with AI..."
                                autoFocus
                                className={`flex-1 bg-transparent px-2 py-2 text-sm outline-none ${darkMode ? 'text-white placeholder:text-zinc-500' : 'text-black placeholder:text-zinc-400'}`}
                            />
                            <button onClick={handleSendInput} disabled={isProcessing} className={`px-6 py-2 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${isProcessing ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' : 'bg-orange-500 text-black hover:scale-105 active:scale-95 shadow-md'}`}>
                                {isProcessing ? "..." : "Send"}
                            </button>
                        </div>
                    ) : (
                        /* VOICE CALL BAR */
                        <div className="flex items-center gap-3">
                            <div className={`flex items-center gap-4 pr-6 p-2 rounded-full border backdrop-blur-xl shadow-2xl transition-all ${darkMode ? 'bg-zinc-900/90 border-white/10' : 'bg-white/90 border-black/10'}`}>
                                <button 
                                    onClick={toggleListening} 
                                    className={`w-12 h-12 rounded-full flex items-center justify-center text-xl transition-all shadow-md ${isListening ? 'bg-red-500 text-white animate-pulse' : (darkMode ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700' : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200')}`}
                                >
                                    🎤
                                </button>
                                <div className="flex flex-col min-w-[120px]">
                                    <span className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-black'}`}>
                                        {isListening ? 'Listening...' : 'Mic is off'}
                                    </span>
                                    <span className={`text-[10px] uppercase font-bold tracking-wider truncate max-w-[150px] ${isListening ? 'text-red-500' : (darkMode ? 'text-zinc-500' : 'text-zinc-400')}`}>
                                        {isListening ? (transcript || 'Speak now...') : 'Tap to speak'}
                                    </span>
                                </div>
                            </div>

                            {/* Small Message Toggle Button */}
                            <button 
                                onClick={() => setShowTextInput(true)}
                                className={`w-12 h-12 rounded-full flex items-center justify-center border backdrop-blur-xl shadow-xl transition-all hover:scale-105 active:scale-95 ${darkMode ? 'bg-zinc-900/90 border-white/10 text-zinc-400 hover:text-white' : 'bg-white/90 border-black/10 text-zinc-500 hover:text-black'}`}
                                title="Open text chat"
                            >
                                💬
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
