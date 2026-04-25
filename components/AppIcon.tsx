"use client";

import Image from "next/image";
import { useState } from "react";
import { Zap } from "lucide-react";

interface AppIconProps {
  src: string;
  name: string;
  size?: number;
  className?: string;
}

export default function AppIcon({ src, name, size = 64, className = "" }: AppIconProps) {
  const [error, setError] = useState(false);

  if (!src || error) {
    // Fallback: gradient placeholder with first letter
    const letter = name?.charAt(0)?.toUpperCase() || "A";
    return (
      <div
        className={`flex items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 font-bold text-white select-none ${className}`}
        style={{ width: size, height: size, fontSize: size * 0.4 }}
        aria-label={`${name} icon`}
      >
        {letter}
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden rounded-2xl ${className}`}
      style={{ width: size, height: size }}
    >
      <Image
        src={src}
        alt={`${name} icon`}
        fill
        className="object-cover"
        onError={() => setError(true)}
        unoptimized
      />
    </div>
  );
}
