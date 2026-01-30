"use client";

import Button from "@/components/ui/Button";
import Image from "next/image";

export default function FinalCTA() {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-6">
        <div className="relative bg-[#083b44] rounded-2xl overflow-hidden px-16 py-20 flex items-center justify-between">
          {/* LEFT CONTENT */}
          <div className="max-w-xl text-white z-10">
            <h2 className="text-5xl font-bold leading-tight mb-6">
              Get expert accounting assistance now
            </h2>
            <Button
            >
              Get Started
            </Button>
          </div>

          {/* RIGHT IMAGE */}
          <div className="hidden lg:block relative z-10">
            <Image
              width={412}
              height={1050}
              alt={"log"}
              src="https://framerusercontent.com/images/U2rjF15tssJbMbZPjIC1z6SoGT8.png?scale-down-to=1024"
              className="h-90"
            />
          </div>

          {/* BACKGROUND CIRCLES */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-32 w-80 h-80 bg-white/10 rounded-full blur-2xl"></div>
        </div>
      </div>
    </section>
  );
}
