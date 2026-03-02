import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

const m = motion;
console.log(m);

const Navbar = () => {
    const [time, setTime] = useState(new Date());
    const Navigate = useNavigate();
    const { scrollY } = useScroll();

    // Height and Shadow transitions to make it feel "Big" then "Compact"
    const navHeight = useTransform(scrollY, [0, 100], ["110px", "85px"]);
    const navShadow = useTransform(
        scrollY,
        [0, 100],
        ["0px 0px 0px rgba(0,0,0,0)", "0px 4px 20px rgba(0,0,0,0.03)"]
    );

    const handleButton= () => {
        const token = localStorage.getItem("token");
        if (token) {
            Navigate("/dashboard"); 
        } else {
            Navigate("/login");
        }
    }

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <motion.nav
            style={{ height: navHeight, boxShadow: navShadow }}
            className="fixed w-full z-50 px-8 md:px-20 flex justify-between items-center bg-[#F9F7F2] border-b border-black/5 transition-all duration-300"
        >
            {/* Left: Branding */}
            <div className="flex items-center gap-10">
                <div className="group cursor-pointer">
                    <div className="text-black text-lg font-black tracking-[0.4em] uppercase leading-none">
                        The Agent
                    </div>
                    <div className="text-[9px] tracking-[0.3em] uppercase text-zinc-400 font-bold mt-2">
                        D I D • ARCHITECTURE
                    </div>
                </div>

                {/* Live Clock - Large & Clear */}
                <div className="hidden xl:block h-10 w-px bg-black/10 mx-2"></div>
                <div className="hidden xl:flex flex-col text-[14px] tracking-[0.2em] uppercase text-black font-black">
                    <span className="tabular-nums">
                        {time.toLocaleTimeString([], { hour12: false })}
                    </span>
                    <span className="text-[8px] text-zinc-400 tracking-[0.5em] font-bold">SYSTEM TIME</span>
                </div>
            </div>

            {/* Center: Bold Links */}
            <div className="hidden md:flex text-[11px] tracking-[0.4em] uppercase gap-12 items-center font-black">
                <Link
                    to="/#why-us"
                    className="text-zinc-400 hover:text-black transition-all duration-500 relative group"
                >
                    Why Us?
                    <span className="absolute -bottom-2 left-0 w-0 h-[2px] bg-black transition-all duration-500 group-hover:w-full" />
                </Link>
                <Link
                    to="/#faq"
                    className="text-zinc-400 hover:text-black transition-all duration-500 relative group"
                >
                    FAQ
                    <span className="absolute -bottom-2 left-0 w-0 h-[2px] bg-black transition-all duration-500 group-hover:w-full" />
                </Link>
            </div>

            {/* Right: Portal Access */}
            <div className="flex items-center">
                <motion.button
                    whileHover={{ scale: 1.05, backgroundColor: "#000", color: "#fff" }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleButton}
                    className="bg-transparent border-2 border-black text-black px-10 py-4 text-[11px] font-black uppercase tracking-[0.3em] flex items-center gap-4 transition-all duration-300"
                >
                    <span>Enter Portal</span>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M1 6H11M11 6L6 1M11 6L6 11" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square" />
                    </svg>
                </motion.button>
            </div>
        </motion.nav>
    );
};

export default Navbar;