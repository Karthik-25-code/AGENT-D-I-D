import React from 'react';
import { motion } from 'framer-motion';

const m = motion;
console.log(m);

const WhyUs = () => {
    return (
        <section id="why-us" className="bg-[#F9F7F2] py-32 px-8 md:px-20 border-b border-black/5">
            <div className="max-w-7xl mx-auto">

                {/* Section Header */}
                <div className="mb-24">
                    <span className="font-sans text-[10px] font-black uppercase tracking-[0.5em] text-zinc-400 block mb-4">
                        The Pedagogical Framework
                    </span>
                    <h2 className="text-5xl md:text-7xl font-normal tracking-tighter leading-none">
                        Beyond Passive <br /> <span className="italic text-zinc-400">Consumption.</span>
                    </h2>
                </div>

                {/* Feature Grid */}
                <div className="grid lg:grid-cols-2 gap-px bg-black/10 border border-black/10">

                    {/* Mode 1: The Protégé */}
                    <div className="bg-white p-12 md:p-20 flex flex-col justify-between group hover:bg-[#1A1A1A] transition-all duration-700">
                        <div>
                            <div className="font-sans text-[10px] font-black mb-10 group-hover:text-zinc-500 transition-colors">01 / THE PROTÉGÉ</div>
                            <h3 className="text-4xl font-bold uppercase tracking-tighter mb-6 group-hover:text-white transition-colors">
                                The Feynman <br />Effect
                            </h3>
                            <p className="font-sans text-sm leading-relaxed text-zinc-500 group-hover:text-zinc-400 transition-colors max-w-sm">
                                To teach is to learn twice. When you dominate the whiteboard, the Agent adopts a state of curated ignorance. It challenges your sketches and questions your logic, forcing you to distill complex ideas into their most fundamental truths.
                            </p>
                        </div>
                        <div className="mt-12 opacity-20 group-hover:opacity-100 transition-opacity">
                            <span className="text-[10px] font-black tracking-widest text-white uppercase">User as Mentor</span>
                        </div>
                    </div>

                    {/* Mode 2: The Polymath */}
                    <div className="bg-white p-12 md:p-20 flex flex-col justify-between group hover:bg-[#1A1A1A] transition-all duration-700">
                        <div>
                            <div className="font-sans text-[10px] font-black mb-10 group-hover:text-zinc-500 transition-colors">02 / THE POLYMATH</div>
                            <h3 className="text-4xl font-bold uppercase tracking-tighter mb-6 group-hover:text-white transition-colors">
                                Visual <br />Synthesis
                            </h3>
                            <p className="font-sans text-sm leading-relaxed text-zinc-500 group-hover:text-zinc-400 transition-colors max-w-sm">
                                When the abstract becomes overwhelming, the Agent takes the marker. It doesn't just provide text; it constructs hierarchical diagrams and spatial metaphors in real-time, acting as the 'Topper Friend' who makes the difficult look effortless.
                            </p>
                        </div>
                        <div className="mt-12 opacity-20 group-hover:opacity-100 transition-opacity">
                            <span className="text-[10px] font-black tracking-widest text-white uppercase">AI as Architect</span>
                        </div>
                    </div>
                </div>

                {/* Bottom Statement */}
                <div className="mt-24 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                    <p className="font-serif italic text-2xl max-w-2xl text-zinc-600">
                        "We don't build tools for answers; we build environments for understanding."
                    </p>

                </div>
            </div>
        </section>
    );
};

export default WhyUs;