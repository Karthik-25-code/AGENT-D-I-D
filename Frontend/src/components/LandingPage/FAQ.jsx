import React from 'react'
import {motion} from 'framer-motion';

console.log(motion);
const FAQ = () => {
  return (
   <div>
        <section id="faq" className="max-w-7xl mx-auto py-32 px-8">
            <div className="grid lg:grid-cols-3 gap-16">
                <div className="lg:col-span-1">
                    <h2 className="text-5xl italic sticky top-32 leading-tight tracking-tighter">Common <br />Inquiries</h2>
                </div>
                <div className="lg:col-span-2 grid md:grid-cols-2 gap-x-12 gap-y-20">
                    <InquiryItem
                        num="01"
                        title="Cognitive Load"
                        text="Our system balances the difficulty based on your drawing speed and vocal clarity, ensuring the 'Student' mode stays challenging but fair."
                    />
                    <InquiryItem
                        num="02"
                        title="Persistent Canvas"
                        text="Every stroke is versioned in DynamoDB. Revisit a session from months ago to see exactly how your mental model of a topic evolved."
                    />
                    <InquiryItem
                        num="03"
                        title="Latency & Realtime"
                        text="Built on AWS infrastructure to ensure the video call and shared whiteboard remain synchronized within milliseconds."
                    />
                    <InquiryItem
                        num="04"
                        title="Visual Dialectic"
                        text="The AI doesn't just talk; it draws. From flowcharts to abstract metaphors, it visualizes the 'why' behind the 'what'."
                    />
                </div>
            </div>
        </section>
   </div>
  )
}


const InquiryItem = ({ num, title, text }) => (
    <motion.div
        whileInView={{ opacity: 1, x: 0 }}
        initial={{ opacity: 0, x: 20 }}
        viewport={{ once: true }}
        className="group border-t border-black/10 pt-8"
    >
        <div className="font-sans text-[10px] font-black mb-6 flex items-center gap-4">
            <span className="w-8 h-px bg-black"></span> {num}
        </div>
        <h3 className="text-xl font-bold mb-4 uppercase tracking-widest group-hover:italic transition-all duration-300">
            {title}
        </h3>
        <p className="text-zinc-500 font-sans leading-relaxed text-sm">
            {text}
        </p>
    </motion.div>
);


export default FAQ
