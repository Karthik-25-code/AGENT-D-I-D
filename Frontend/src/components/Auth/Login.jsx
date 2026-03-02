import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from '../Toast/ToastProvider';

const Login = () => {
    const navigate = useNavigate();

    const toast = useToast();
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = async (e) => {
        e.preventDefault();
        setError(""); // Reset errors

        if (!email || !password) {
            setError("Please provide both an authorized email and security key.");
            return;
        }

        try {
            const response = await fetch("http://127.0.0.1:8000/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem("token", data.access_token);
                toast.success("Identity verified — accessing dashboard...");

                // Wait 1.5 seconds so the user can see the success message
                setTimeout(() => {
                    navigate("/dashboard");
                }, 1500);
            } else {
                toast.error(data.detail || "Login failed. Please check your credentials.");
                setError(data.detail || "Login failed. Please check your credentials.");
            }
        } catch (err) {
            toast.error("Server connection failed. Please try again later.");
            setError("Server connection failed. Please try again later.");
        }
    };

    return (
        /* Changed h-screen to min-h-screen and overflow-hidden to overflow-y-auto */
        <div className="min-h-screen w-full flex flex-col md:flex-row bg-white font-sans relative overflow-y-auto">

            {/* GO BACK BUTTON - Fixed position so it stays visible while scrolling */}
            <button
                onClick={() => navigate("/")}
                className="fixed top-6 left-6 md:top-10 md:left-10 z-[100] flex items-center gap-2 text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] text-white hover:text-orange-500 transition-all group bg-black/40 backdrop-blur-md px-4 py-2 md:px-5 md:py-2.5 border border-white/10 shadow-xl"
            >
                <span className="text-lg group-hover:-translate-x-1 transition-transform">←</span> Go Back
            </button>

            {/* LEFT SIDE: Branding Panel */}
            <div className="w-full md:w-1/2 min-h-[50vh] md:h-screen bg-[#141210] relative flex items-end justify-center p-8 md:p-12 lg:p-24 pb-20 md:pb-32">
                <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-orange-600/10 blur-[80px] md:blur-[120px] rounded-full"></div>

                <div className="relative z-10 w-full max-w-lg">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="h-1 w-12 bg-orange-500"></div>
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-orange-500">Global Finance</span>
                    </div>

                    <h1 className="text-5xl lg:text-7xl font-bold text-white leading-[0.9] tracking-tighter mb-8">
                        Future <br /> Wealth<span className="text-orange-500">.</span>
                    </h1>

                    <p className="text-zinc-400 text-base md:text-lg font-light leading-relaxed mb-12 max-w-sm">
                        Professional-grade asset management for the modern digital economy.
                    </p>

                    <div className="relative group max-w-xs hidden md:block">
                        <div className="absolute inset-0 bg-orange-500 translate-x-3 translate-y-3 -z-10 transition-transform group-hover:translate-x-0 group-hover:translate-y-0"></div>
                        <img
                            src="https://images.unsplash.com/photo-1616077168079-7e09a677fb2c?auto=format&fit=crop&q=80&w=800"
                            alt="Terminal"
                            className="w-full h-48 object-cover border border-white/10"
                        />
                    </div>
                </div>

                <div className="absolute bottom-6 md:bottom-10 left-8 md:left-12 right-8 md:right-12 flex justify-between items-center text-[8px] md:text-[9px] text-zinc-600 tracking-[0.2em] font-bold uppercase">
                    <span>Encrypted Session</span>
                    <span>© 2026 Payoneer</span>
                </div>
            </div>

            {/* Global toasts are used instead of inline global banners */}

            {/* RIGHT SIDE: Form Panel */}
            <div className="w-full md:w-1/2 min-h-screen flex flex-col items-center justify-center md:justify-end bg-white relative p-8 md:p-12 lg:p-24 pb-[10vh]">
                <div className="w-full max-w-md py-12 md:py-0">
                    <header className="mb-10">
                        <h2 className="text-4xl md:text-5xl font-black text-black tracking-tighter uppercase mb-4">Sign In</h2>
                        <div className="h-2 w-20 bg-black"></div>
                    </header>

                    {/* Errors are shown via global toasts */}

                    <form className="space-y-5 md:space-y-6" onSubmit={handleLogin}>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Authorized Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-zinc-50 border border-zinc-200 px-5 py-3 md:px-6 md:py-4 focus:border-black focus:outline-none transition-all font-semibold"
                                placeholder="identity@global.com"
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Security Key</label>
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="text-[10px] font-bold text-zinc-400 hover:text-black tracking-widest uppercase"
                                >
                                    {showPassword ? "Hide" : "Show"}
                                </button>
                            </div>
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-zinc-50 border border-zinc-200 px-5 py-3 md:px-6 md:py-4 focus:border-black focus:outline-none transition-all font-semibold"
                                placeholder="••••••••"
                            />
                        </div>

                        <div className="flex items-center justify-between gap-2">
                            <label className="flex items-center gap-2 md:gap-3 cursor-pointer">
                                <input type="checkbox" className="w-4 h-4 accent-black" />
                                <span className="text-[10px] font-bold text-zinc-400 uppercase">Remember Identity</span>
                            </label>
                            <a href="#" className="text-[10px] font-bold text-zinc-400 hover:text-black uppercase">Forgot Key?</a>
                        </div>

                        <div className="space-y-4 pt-4">
                            <button
                                type="submit"
                                className="w-full bg-black py-4 md:py-5 text-white font-black uppercase tracking-[0.3em] text-xs hover:bg-orange-600 transition-colors active:scale-95"
                            >
                                Access Dashboard
                            </button>

                            <div className="flex items-center gap-4 py-2">
                                <div className="h-[1px] flex-1 bg-zinc-100"></div>
                                <span className="text-[9px] font-black text-zinc-300 uppercase">OR</span>
                                <div className="h-[1px] flex-1 bg-zinc-100"></div>
                            </div>

                            <Link
                                to="/signup"
                                className="w-full flex justify-center py-4 md:py-5 border border-zinc-200 text-black font-black uppercase tracking-[0.3em] text-xs hover:border-black transition-all active:scale-95"
                            >
                                Create New Account
                            </Link>
                        </div>
                    </form>


                </div>
            </div>
        </div>
    );
};

export default Login;