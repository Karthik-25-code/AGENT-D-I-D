import React, { useState, useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import { useToast } from '../Toast/ToastProvider';
import rough from 'roughjs/bin/rough';

const Whiteboard = forwardRef(({ isDrawingMode, darkMode, activeTool, activeColor, aiSteps }, ref) => {
    const canvasRef = useRef(null);
    const contextRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [startPos, setStartPos] = useState({ x: 0, y: 0 });
    const [snapshot, setSnapshot] = useState(null);
    const toast = useToast();

    // --- UI CONFIG FROM CONTEXT 1 ---
    const bgColor = darkMode ? '#141210' : '#FCFCFB';

    const gridStyle = {
        backgroundColor: bgColor,
        backgroundImage: darkMode 
            ? 'linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px)' 
            : 'linear-gradient(to right, rgba(0, 0, 0, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(0, 0, 0, 0.05) 1px, transparent 1px)',
        backgroundSize: '40px 40px'
    };

    useImperativeHandle(ref, () => ({
        clearCanvas: () => {
            const canvas = canvasRef.current;
            const ctx = contextRef.current;
            if (canvas && ctx) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                toast.success('Board cleared');
            }
        }
    }));

    // Initialize Canvas
    useEffect(() => {
        const canvas = canvasRef.current;
        const scale = window.devicePixelRatio || 1;
        
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        
        canvas.width = canvas.offsetWidth * scale;
        canvas.height = canvas.offsetHeight * scale;

        const context = canvas.getContext('2d');
        context.scale(scale, scale);
        context.lineCap = 'round';
        context.lineJoin = 'round';
        contextRef.current = context;
    }, []);

    // Handle Tool and Color changes
    useEffect(() => {
        if (!contextRef.current) return;
        const ctx = contextRef.current;

        if (activeTool === 'eraser') {
            ctx.strokeStyle = bgColor; // Uses the dynamic bgColor from UI context
            ctx.lineWidth = 25; 
        } else {
            ctx.strokeStyle = activeColor;
            ctx.lineWidth = 3;
        }
    }, [activeColor, activeTool, bgColor]);

    // --- AUTOMATED AI DRAWING ENGINE (with speech) ---
    useEffect(() => {
        if (!aiSteps || aiSteps.length === 0) return;
        const canvas = canvasRef.current;
        const ctx = contextRef.current;
        const rc = rough.canvas(canvas);

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const speak = (text) => {
            return new Promise((resolve) => {
                if (!text || !('speechSynthesis' in window)) return resolve();
                try {
                    const utter = new SpeechSynthesisUtterance(text);
                    utter.onend = () => resolve();
                    utter.onerror = () => resolve();
                    utter.rate = 0.95;
                    window.speechSynthesis.cancel();
                    window.speechSynthesis.speak(utter);
                } catch (e) {
                    resolve();
                }
            });
        };

        const drawItem = (item) => {
            const options = { ...item.options, stroke: darkMode ? '#ffffff' : '#000000' };
            if (item.type === 'rectangle') rc.rectangle(...item.args, options);
            else if (item.type === 'circle') rc.circle(item.args[0], item.args[1], item.args[2] * 2, options);
            else if (item.type === 'line') rc.line(...item.args, options);

            if (item.text) {
                const { text, args } = item;
                const x = args[0], y = args[1] - 15;
                ctx.font = "600 16px 'Outfit', sans-serif";
                const textWidth = ctx.measureText(text).width;

                ctx.fillStyle = darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)';
                ctx.beginPath();
                if (ctx.roundRect) ctx.roundRect(x - 8, y - 18, textWidth + 16, 24, 8);
                ctx.fill();

                ctx.fillStyle = darkMode ? '#F97316' : '#EA580C';
                ctx.fillText(text, x, y);
            }
        };

        const runSequence = async () => {
            for (let i = 0; i < aiSteps.length; i++) {
                const item = aiSteps[i];
                drawItem(item);

                const speech = item.speech_reference || item.speech || '';
                if (speech && speech.trim().length) {
                    await speak(speech);
                } else {
                    await new Promise(r => setTimeout(r, 700));
                }
            }
            try { window.dispatchEvent(new CustomEvent('aiStepsCompleted', { detail: { count: aiSteps.length } })); } catch (e) {}
        };

        runSequence();

        return () => { if ('speechSynthesis' in window) window.speechSynthesis.cancel(); };
    }, [aiSteps, darkMode]);

    // --- MANUAL DRAWING ---
    const startDrawing = ({ nativeEvent }) => {
        if (!isDrawingMode) return;
        const { offsetX, offsetY } = nativeEvent;
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

        if (activeTool === 'pencil' || activeTool === 'eraser') {
            contextRef.current.lineTo(offsetX, offsetY);
            contextRef.current.stroke();
        } else if (activeTool === 'square') {
            contextRef.current.putImageData(snapshot, 0, 0);
            contextRef.current.strokeRect(startPos.x, startPos.y, offsetX - startPos.x, offsetY - startPos.y);
        }
    };

    const stopDrawing = () => {
        if (isDrawing) {
            contextRef.current.closePath();
            setIsDrawing(false);
        }
    };

    return (
        <div 
            className="relative w-full h-full cursor-crosshair transition-colors duration-500" 
            style={gridStyle}
        >
            <canvas 
                onMouseDown={startDrawing} 
                onMouseMove={draw} 
                onMouseUp={stopDrawing} 
                onMouseLeave={stopDrawing} 
                ref={canvasRef} 
                className="w-full h-full touch-none" 
            />
        </div>
    );
});

export default Whiteboard;