import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from '../Toast/ToastProvider';

const Signup = () => {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const toast = useToast();
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        password: "",
        confirmPassword: ""
    });

    const handleSignup = async (e) => {
        e.preventDefault();
        const API_BASE = import.meta.env.VITE_API_URL || "http://13.201.48.229:8000";
        const { fullName, email, password, confirmPassword } = formData;

        if (!fullName || !email || !password || !confirmPassword) {
            setError("All authorization fields are required.");
        } else if (password !== confirmPassword) {
            setError("Security keys do not match.");
        } else {
            setError("");
        }
        let response;
        try {
            response = await fetch(`http://0.0.0.0:8000/auth/signup`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ fullName, email, password}),
            });
        } catch (networkErr) {
            console.error('Network error during signup:', networkErr);
            toast.error('Network error: could not reach server');
            setError('Network error: could not reach server');
            return;
        }

        let data = {};
        try {
            // Only attempt to parse JSON if server returned JSON
            const contentType = response.headers.get('content-type') || '';
            if (contentType.includes('application/json')) {
                data = await response.json();
            }
        } catch (err) {
            // Ignore JSON parse errors and keep data as {}
            data = {};
            console.log(err);
        }

        if (response.ok) {
            // If backend returns message-only, token may be missing; guard access
            if (data && data.access_token) {
                localStorage.setItem("token", data.access_token);
            }
            toast.success('Account created — redirecting to dashboard');
            setTimeout(() => { window.location.href = '/dashboard'; }, 900);
        } else {
            const detail = (data && (data.detail || data.message)) || 'Please try again';
            toast.error('Signup failed: ' + detail);
            setError(detail);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="min-h-screen w-full flex flex-col md:flex-row bg-white font-sans relative overflow-y-auto">

            {/* FIXED GO BACK BUTTON */}
            <button
                onClick={() => navigate("/")}
                className="fixed top-6 left-6 md:top-10 md:left-10 z-[100] flex items-center gap-2 text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] text-white hover:text-orange-500 transition-all group bg-black/40 backdrop-blur-md px-4 py-2 md:px-5 md:py-2.5 border border-white/10 shadow-xl"
            >
                <span className="text-lg group-hover:-translate-x-1 transition-transform">←</span> Go Back
            </button>

            {/* LEFT SIDE: Branding Panel (Identical to Login) */}
            <div className="w-full md:w-1/2 min-h-[40vh] md:h-screen bg-[#141210] relative flex items-end justify-center p-8 md:p-12 lg:p-24 pb-20 md:pb-32">
                <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-orange-600/10 blur-[80px] md:blur-[120px] rounded-full"></div>

                <div className="relative z-10 w-full max-w-lg">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="h-1 w-12 bg-orange-500"></div>
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-orange-500">Global Finance</span>
                    </div>

                    <h1 className="text-5xl lg:text-7xl font-bold text-white leading-[0.9] tracking-tighter mb-8">
                        Join the <br /> Future<span className="text-orange-500">.</span>
                    </h1>

                    <p className="text-zinc-400 text-base md:text-lg font-light leading-relaxed mb-12 max-w-sm">
                        Secure your assets with professional-grade infrastructure.
                    </p>

                    <div className="relative group max-w-xs hidden md:block">
                        <div className="absolute inset-0 bg-orange-500 translate-x-3 translate-y-3 -z-10 transition-transform group-hover:translate-x-0 group-hover:translate-y-0"></div>
                        <img
                            src="https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&q=80&w=800"
                            alt="Security"
                            className="w-full h-48 object-cover border border-white/10"
                        />
                    </div>
                </div>

                <div className="absolute bottom-6 md:bottom-10 left-8 md:left-12 right-8 md:right-12 flex justify-between items-center text-[8px] md:text-[9px] text-zinc-600 tracking-[0.2em] font-bold uppercase">
                    <span>New Identity Protocol</span>
                    <span>© 2026 Payoneer</span>
                </div>
            </div>

            {/* RIGHT SIDE: Signup Form Panel */}
            <div className="w-full md:w-1/2 min-h-screen flex flex-col items-center justify-center bg-white relative p-8 md:p-12 lg:p-24">
                <div className="w-full max-w-md py-12 md:py-0">
                    <header className="mb-10">
                        <h2 className="text-4xl md:text-5xl font-black text-black tracking-tighter uppercase mb-4">Register</h2>
                        <div className="h-2 w-20 bg-black"></div>
                    </header>

                    {/* Errors are shown via global toasts */}
                    <form className="space-y-4 md:space-y-5" onSubmit={handleSignup}>
                        {/* Grid Container for Inputs */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                            {/* FULL NAME */}
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Full Name</label>
                                <input
                                    type="text"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    className="w-full bg-zinc-50 border border-zinc-200 px-5 py-3 md:px-6 md:py-4 focus:border-black focus:outline-none transition-all font-semibold"
                                    placeholder="JOHN DOE"
                                />
                            </div>

                            {/* EMAIL */}
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Authorized Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full bg-zinc-50 border border-zinc-200 px-5 py-3 md:px-6 md:py-4 focus:border-black focus:outline-none transition-all font-semibold"
                                    placeholder="identity@global.com"
                                />
                            </div>

                            {/* PASSWORD */}
                            <div className="space-y-1">
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
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full bg-zinc-50 border border-zinc-200 px-5 py-3 md:px-6 md:py-4 focus:border-black focus:outline-none transition-all font-semibold"
                                    placeholder="••••••••"
                                />
                            </div>

                            {/* CONFIRM PASSWORD */}
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Confirm Key</label>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className="w-full bg-zinc-50 border border-zinc-200 px-5 py-3 md:px-6 md:py-4 focus:border-black focus:outline-none transition-all font-semibold"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        {/* Action Buttons (Stay Full Width) */}
                        <div className="space-y-4 pt-4">
                            <button
                                type="submit"
                                className="w-full bg-black py-4 md:py-5 text-white font-black uppercase tracking-[0.3em] text-xs hover:bg-orange-600 transition-colors active:scale-95 shadow-2xl"
                            >
                                Create Account
                            </button>

                            <div className="flex items-center gap-4 py-2">
                                <div className="h-[1px] flex-1 bg-zinc-100"></div>
                                <span className="text-[9px] font-black text-zinc-300 uppercase">ALREADY REGISTERED?</span>
                                <div className="h-[1px] flex-1 bg-zinc-100"></div>
                            </div>

                            <Link
                                to="/login"
                                className="w-full flex justify-center py-4 md:py-5 border border-zinc-200 text-black font-black uppercase tracking-[0.3em] text-xs hover:border-black transition-all active:scale-95"
                            >
                                Sign In to Dashboard
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Signup;
