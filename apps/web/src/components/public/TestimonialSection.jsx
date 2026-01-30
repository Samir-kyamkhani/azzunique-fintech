"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

const testimonials = [
  {
    name: "Natalie Evans",
    role: "CEO of Innovatech Solutions",
    image:
      "https://framerusercontent.com/images/evT8pi4EF2q0Uvlr9LtqiMharto.jpg",
    text: "Unmatched service and expertise! They revolutionized our financial strategy, unlocking significant savings while enhancing operational efficiency to drive exceptional results.",
  },
  {
    name: "James Carter",
    role: "Founder, FinCore",
    image:
      "https://framerusercontent.com/images/8aTY9vGkN9TQEIYwZRFL0RyBJk.jpg",
    text: "Their accounting guidance helped us scale with confidence. Highly professional and incredibly responsive.",
  },
];

export default function TestimonialSection() {
  const [index, setIndex] = useState(0);

  const next = () => setIndex((prev) => (prev + 1) % testimonials.length);
  const prev = () =>
    setIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);

  const t = testimonials[index];

  return (
    <section className="py-28 text-foreground">
      <div className="container mx-auto px-6 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-5xl font-bold mb-16"
        >
          Client testimonials and success stories
        </motion.h2>

        <div className="rounded-2xl shadow-lg-border p-12 flex flex-col lg:flex-row items-center gap-10 relative border border-border">
          {/* IMAGE */}
          <motion.div
            key={t.image}
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Image
              width={200}
              height={200}
              alt="client"
              src={t.image}
              className="w-48 h-48 object-cover rounded-xl shadow-md-border"
            />
          </motion.div>

          {/* TEXT */}
          <div className="text-left flex-1">
            <motion.h4
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xl font-semibold"
            >
              {t.name}
            </motion.h4>

            <p className="text-foreground/70 text-sm mb-6">{t.role}</p>

            <AnimatePresence mode="wait">
              <motion.p
                key={t.text}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="text-2xl leading-relaxed"
              >
                {t.text}
              </motion.p>
            </AnimatePresence>
          </div>

          {/* NAVIGATION */}
          <div className="absolute top-6 right-6 flex gap-3">
            <button
              onClick={prev}
              className="bg-[#083b44] text-white p-3 rounded-lg hover:scale-110 transition"
            >
              <ArrowLeft size={18} />
            </button>

            <button
              onClick={next}
              className="bg-[#083b44] text-white p-3 rounded-lg hover:scale-110 transition"
            >
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
