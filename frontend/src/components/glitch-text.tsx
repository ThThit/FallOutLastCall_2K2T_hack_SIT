import { useEffect, useState } from "react";

interface GlitchTextProps {
  text: string;
  intensity?: number;
}

export function GlitchText({ text, intensity = 0.3 }: GlitchTextProps) {
  const [glitched, setGlitched] = useState(text);

  useEffect(() => {
    const glitchChars = ['█', '▓', '▒', '░', '_', '¯', '▀', '▄'];
    const interval = setInterval(() => {
      if (Math.random() < intensity) {
        const chars = text.split('');
        const glitchedChars = chars.map((char) => {
          if (Math.random() < 0.15) {
            return glitchChars[Math.floor(Math.random() * glitchChars.length)];
          }
          return char;
        });
        setGlitched(glitchedChars.join(''));
        setTimeout(() => setGlitched(text), 50);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [text, intensity]);

  return <span>{glitched}</span>;
}
