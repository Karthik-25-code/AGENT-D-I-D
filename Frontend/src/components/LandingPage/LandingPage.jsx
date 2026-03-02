import { React, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import WhyUs from './WhyUs';
import FAQ from './FAQ';

const m = motion;
console.log(m);
const LandingPage = () => {
    // Animation Variants
    const { hash } = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        if (hash) {
            const element = document.getElementById(hash.replace('#', ''));
            if (element) {
                // Timeout ensures the DOM is fully rendered before scrolling
                setTimeout(() => {
                    element.scrollIntoView({ behavior: 'smooth' });
                }, 100);
            }
        }
    }, [hash]);

    const HandleStart = () => {
        const token = localStorage.getItem("token");
        if (token) {
            navigate("/dashboard");
        }
        else {
            navigate("/signup");
        }
    }

    const containerFade = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.2, delayChildren: 0.3 }
        }
    };

    const itemSlide = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
    };

    return (
        /* pt-24 provides the gap for your fixed Navbar */
        <div className="min-h-screen bg-[#F9F7F2] text-[#1A1A1A] font-serif pt-24 selection:bg-black selection:text-white">

            {/* Hero: Responsive Split Design */}
            <section className="flex flex-col  lg:flex-row min-h-[calc(100vh-6rem)] border-b border-black/5">

                {/* Left Side: Editorial Content */}
                <motion.div
                    variants={containerFade}
                    initial="hidden"
                    animate="visible"
                    className="lg:w-1/2 p-8 md:p-16 lg:p-24 flex flex-col justify-center bg-white"
                >
                    <motion.span variants={itemSlide} className="font-sans text-[10px] font-black uppercase tracking-[0.5em] text-zinc-400 mb-8">
                        Established 2026
                    </motion.span>

                    <motion.h1 variants={itemSlide} className="text-5xl md:text-7xl lg:text-8xl font-normal leading-[0.9] mb-10 tracking-tighter">
                        Mastery <br />
                        <span className="italic text-zinc-400 text-4xl md:text-6xl lg:text-7xl block mt-2">through teaching.</span>
                    </motion.h1>

                    <motion.p variants={itemSlide} className="font-sans text-base md:text-lg text-zinc-500 max-w-md leading-relaxed mb-12">
                        A collaborative digital ecosystem where you and an AI peer trade the role of teacher. Bridge the gap between knowing and understanding.
                    </motion.p>

                    <motion.div variants={itemSlide}>
                        <button
                            onClick={HandleStart}
                            className="group relative border-2 border-black px-10 py-5 font-sans text-[10px] font-black uppercase tracking-[0.3em] overflow-hidden transition-all">
                            <span className="relative z-10 group-hover:text-white transition-colors duration-500">Get Started</span>
                            <div className="absolute inset-0 bg-black translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                        </button>
                    </motion.div>
                </motion.div>

                {/* Right Side: Visual Logic Split - Adjusted to be Static & Aligned */}
                <div className="lg:w-1/2 flex flex-col bg-[#1A1A1A] text-[#F9F7F2]">

                    {/* Top Panel: The Student (AI) */}
                    <div className="relative flex-1 p-12 border-b border-white/5 flex flex-col justify-center bg-[#1A1A1A] hover:bg-[#222] transition-colors duration-500 group overflow-hidden">
                        <span className="absolute -right-4 -bottom-4 text-9xl font-black text-white/5 uppercase select-none pointer-events-none font-sans">01</span>

                        <motion.div initial={{ opacity: 0.8 }} whileHover={{ opacity: 1 }} className="relative z-10">
                            <span className="font-sans text-[10px] font-bold uppercase tracking-[0.4em] mb-4 text-orange-500 block">Phase I: The Curious Peer</span>
                            <h2 className="text-3xl md:text-5xl italic font-light mb-6 transition-transform duration-500 group-hover:translate-x-2">
                                "Wait, explain that part again... I'm not seeing the link."
                            </h2>
                            <p className="font-sans text-[11px] leading-loose max-w-sm opacity-40 group-hover:opacity-100 transition-opacity duration-500">
                                The AI takes the role of a confused friend. You become the teacher, using the whiteboard to draw rough sketches and explain the core logic. By simplifying it for the AI, you actually master it yourself.
                            </p>
                        </motion.div>
                    </div>

                    {/* Bottom Panel: The Mentor (AI) */}
                    <div className="relative flex-1 p-12 flex flex-col justify-center bg-[#151515] hover:bg-[#222] transition-colors duration-500 group overflow-hidden">
                        <span className="absolute -right-4 -bottom-4 text-9xl font-black text-white/5 uppercase select-none pointer-events-none font-sans">02</span>

                        <motion.div initial={{ opacity: 0.8 }} whileHover={{ opacity: 1 }} className="relative z-10">
                            <span className="font-sans text-[10px] font-bold uppercase tracking-[0.4em] mb-4 text-orange-500 block">Phase II: The Topper Friend</span>
                            <h2 className="text-3xl md:text-5xl italic font-light mb-6 transition-transform duration-500 group-hover:translate-x-2">
                                "Look, it's simple. Let's sketch out the axioms."
                            </h2>
                            <p className="font-sans text-[11px] leading-loose max-w-sm opacity-40 group-hover:opacity-100 transition-opacity duration-500">
                                When things get complex, the AI takes the pen. Like a "topper" friend's back-of-the-napkin doodle, it breaks down high-level concepts into intuitive, hand-drawn visual logic that just clicks.
                            </p>
                        </motion.div>
                    </div>
                </div>
            </section>
            <WhyUs />
            <FAQ />

        </div>
    );
};

export default LandingPage;