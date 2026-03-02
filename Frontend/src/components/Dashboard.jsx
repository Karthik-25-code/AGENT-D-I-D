import React, { useState, useRef, useEffect } from 'react';
import { useToast } from './Toast/ToastProvider';
import { motion, AnimatePresence } from 'framer-motion';

const Whiteboard = ({ isDrawingMode, darkMode, activeTool }) => {
    const canvasRef = useRef(null);
    const contextRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [color, setColor] = useState('#f97316');
    const [startPos, setStartPos] = useState({ x: 0, y: 0 });
    const [snapshot, setSnapshot] = useState(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const scale = window.devicePixelRatio || 1;
        canvas.width = canvas.offsetWidth * scale;
        canvas.height = canvas.offsetHeight * scale;

        const context = canvas.getContext('2d');
        context.scale(scale, scale);
        context.lineCap = 'round';
        context.strokeStyle = color;
        context.lineWidth = 3;
        contextRef.current = context;
    }, []);

    useEffect(() => {
        if (contextRef.current) contextRef.current.strokeStyle = color;
    }, [color]);

    const startDrawing = ({ nativeEvent }) => {
        if (!isDrawingMode) return;
        const { offsetX, offsetY } = nativeEvent;

        // Save the canvas state for shape preview
        const canvas = canvasRef.current;
        setSnapshot(contextRef.current.getImageData(0, 0, canvas.width, canvas.height));

        setStartPos({ x: offsetX, y: offsetY });
        contextRef.current.beginPath();
        contextRef.current.moveTo(offsetX, offsetY);
        setIsDrawing(true);
    };

    const draw = ({ nativeEvent }) => {
        if (!isDrawing || !isDrawingMode) return;
        const { offsetX, offsetY } = nativeEvent;

        if (activeTool === 'pencil') {
            contextRef.current.lineTo(offsetX, offsetY);
            contextRef.current.stroke();
        } else if (activeTool === 'square') {
            // Restore snapshot to prevent "trail" while dragging
            contextRef.current.putImageData(snapshot, 0, 0);
            contextRef.current.strokeRect(
                startPos.x,
                startPos.y,
                offsetX - startPos.x,
                offsetY - startPos.y
            );
        }
    };

    const stopDrawing = () => {
        contextRef.current.closePath();
        setIsDrawing(false);
    };

    const toast = useToast();

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        context.clearRect(0, 0, canvas.width, canvas.height);
        toast.success('Board cleared');
    };

    return (
        <div className="relative w-full h-full cursor-crosshair">
            <div className={`absolute top-4 left-1/2 -translate-x-1/2 flex gap-3 z-50 backdrop-blur-md p-2 rounded-xl border transition-colors ${darkMode ? 'bg-black/50 border-white/10' : 'bg-white/50 border-black/10'}`}>
                {['#f97316', '#3b82f6', darkMode ? '#ffffff' : '#000000'].map((c) => (
                    <button key={c} onClick={() => setColor(c)} className={`w-6 h-6 rounded-full border-2 ${color === c ? (darkMode ? 'border-white' : 'border-black') : 'border-transparent'}`} style={{ backgroundColor: c }} />
                ))}
                <div className={`w-[1px] h-6 mx-1 ${darkMode ? 'bg-white/20' : 'bg-black/20'}`} />
                <button onClick={clearCanvas} className={`text-[10px] font-black uppercase tracking-tighter hover:text-orange-500 transition-colors ${darkMode ? 'text-white' : 'text-black'}`}>Clear Board</button>
            </div>
            <canvas onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={stopDrawing} onMouseLeave={stopDrawing} ref={canvasRef} className="w-full h-full touch-none" />
        </div>
    );
};

const Dashboard = () => {
    const [mode, setMode] = useState('teach');
    const [darkMode, setDarkMode] = useState(true);
    const [activeTool, setActiveTool] = useState('pencil');
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState("");

    const toast = useToast();

    const recognitionRef = useRef(null);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            toast.error('Please sign in to access the dashboard');
            setTimeout(() => { window.location.href = '/login'; }, 800);
        }
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
            <aside className={`border-r transition-colors flex flex-col items-center py-8 w-20 ${darkMode ? 'bg-[#141210] border-white/5' : 'bg-white border-black/5'}`}>
                <div className="w-10 h-10 bg-orange-500 rounded-full mb-12 flex items-center justify-center font-black text-black shadow-lg shadow-orange-500/20">G</div>
                <div className="flex-1 space-y-6 flex flex-col items-center">
                    <button onClick={() => setActiveTool('pencil')} className={`p-3 rounded-xl transition-all ${activeTool === 'pencil' ? 'bg-orange-500 text-black' : 'text-zinc-500 hover:text-white'}`}>✎</button>
                    <button onClick={() => setActiveTool('square')} className={`p-3 rounded-xl transition-all ${activeTool === 'square' ? 'bg-orange-500 text-black' : 'text-zinc-500 hover:text-white'}`}>▢</button>

                    <div className={`w-8 h-[1px] ${darkMode ? 'bg-white/10' : 'bg-black/10'}`}></div>

                    <button onClick={toggleListening} className={`p-3 rounded-xl transition-all relative ${isListening ? 'bg-red-500 text-white animate-pulse' : (darkMode ? 'bg-white/5 text-zinc-500' : 'bg-black/5 text-zinc-400')}`}>
                        {isListening ? '●' : '🎤'}
                    </button>
                </div>
                <button onClick={() => setDarkMode(!darkMode)} className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all ${darkMode ? 'bg-zinc-800 border-white/10 text-yellow-400' : 'bg-zinc-100 border-black/10 text-indigo-600'}`}>{darkMode ? '☼' : '☾'}</button>
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
                    <Whiteboard isDrawingMode={mode === 'teach'} darkMode={darkMode} activeTool={activeTool} />

                    {/* IMPROVED VOICE TRANSCRIPT (BOTTOM BAR) */}
                    <AnimatePresence>
                        {isListening && (
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="absolute bottom-6 left-8 right-72 z-40">
                                <div className={`p-4 rounded-2xl border backdrop-blur-xl shadow-2xl flex items-start gap-4 ${darkMode ? 'bg-black/80 border-white/10 text-zinc-300' : 'bg-white/90 border-black/10 text-zinc-700'}`}>
                                    <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5 shrink-0 animate-pulse"></div>
                                    <p className="text-sm font-medium leading-relaxed italic">
                                        {transcript || "Speak to explain your thoughts..."}
                                    </p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* FLOATING AI VIDEO */}
                    <motion.div drag dragConstraints={{ left: -800, right: 0, top: 0, bottom: 0 }} className={`absolute bottom-8 right-8 w-60 h-72 rounded-3xl border shadow-2xl overflow-hidden z-30 cursor-grab ${darkMode ? 'bg-black border-white/10' : 'bg-white border-black/10'}`}>
                        <div className="w-full h-full relative">
                            <img src="https://images.unsplash.com/photo-1614728263952-84ea256f9679?auto=format&fit=crop&q=80&w=400" className="w-full h-full object-cover mix-blend-luminosity opacity-40" alt="AI" />
                            <div className={`absolute bottom-3 left-3 right-3 p-3 backdrop-blur-md rounded-xl border ${darkMode ? 'bg-white/10 border-white/10 text-zinc-300' : 'bg-black/5 border-black/10 text-zinc-800'}`}>
                                <p className="text-[10px] leading-tight font-bold uppercase tracking-tighter opacity-50 mb-1">AI Partner</p>
                                <p className="text-[11px] leading-tight italic">
                                    {mode === 'teach' ? "Can you explain that square block?" : "I'm detailing the symmetry now."}
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