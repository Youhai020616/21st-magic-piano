import React, { useState, useEffect } from 'react';
import { cn } from '../utils';
import { motion, AnimatePresence } from 'framer-motion';

interface PianoKey {
  note: string;
  key: string;
  isBlack?: boolean;
  sound: string;
}

const pianoKeys: PianoKey[] = [
  { note: 'C', key: 'a', sound: 'C4' },
  { note: 'C#', key: 'w', isBlack: true, sound: 'C#4' },
  { note: 'D', key: 's', sound: 'D4' },
  { note: 'D#', key: 'e', isBlack: true, sound: 'D#4' },
  { note: 'E', key: 'd', sound: 'E4' },
  { note: 'F', key: 'f', sound: 'F4' },
  { note: 'F#', key: 't', isBlack: true, sound: 'F#4' },
  { note: 'G', key: 'g', sound: 'G4' },
  { note: 'G#', key: 'y', isBlack: true, sound: 'G#4' },
  { note: 'A', key: 'h', sound: 'A4' },
  { note: 'A#', key: 'u', isBlack: true, sound: 'A#4' },
  { note: 'B', key: 'j', sound: 'B4' },
];

interface PianoGameProps {
  className?: string;
}

export function PianoGame({ className }: PianoGameProps) {
  const [activeKeys, setActiveKeys] = useState<Set<string>>(new Set());
  const [score, setScore] = useState(0);
  const [sequence, setSequence] = useState<string[]>([]);
  const [userSequence, setUserSequence] = useState<string[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameMode, setGameMode] = useState<'practice' | 'challenge'>('practice');

  // 音频上下文和音源
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [oscillator, setOscillator] = useState<OscillatorNode | null>(null);

  useEffect(() => {
    const ctx = new AudioContext();
    setAudioContext(ctx);

    return () => {
      ctx.close();
    };
  }, []);

  const playNote = (frequency: number) => {
    if (!audioContext) return;

    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    
    osc.connect(gain);
    gain.connect(audioContext.destination);
    
    osc.frequency.setValueAtTime(frequency, audioContext.currentTime);
    gain.gain.setValueAtTime(0, audioContext.currentTime);
    gain.gain.linearRampToValueAtTime(0.5, audioContext.currentTime + 0.1);
    
    osc.start(audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 1);
    osc.stop(audioContext.currentTime + 1);
    
    setOscillator(osc);
  };

  const getFrequency = (note: string): number => {
    const noteToFreq: { [key: string]: number } = {
      'C4': 261.63, 'C#4': 277.18, 'D4': 293.66, 'D#4': 311.13,
      'E4': 329.63, 'F4': 349.23, 'F#4': 369.99, 'G4': 392.00,
      'G#4': 415.30, 'A4': 440.00, 'A#4': 466.16, 'B4': 493.88
    };
    return noteToFreq[note] || 440;
  };

  const handleKeyPress = (key: PianoKey) => {
    setActiveKeys(prev => new Set(prev.add(key.note)));
    playNote(getFrequency(key.sound));

    if (gameMode === 'challenge' && sequence.length > 0) {
      const newUserSequence = [...userSequence, key.note];
      setUserSequence(newUserSequence);

      // 检查用户输入是否正确
      if (newUserSequence[newUserSequence.length - 1] !== sequence[newUserSequence.length - 1]) {
        setScore(prev => Math.max(0, prev - 5));
        setUserSequence([]);
        setSequence([]);
        setIsPlaying(false);
      } else if (newUserSequence.length === sequence.length) {
        setScore(prev => prev + 10);
        setUserSequence([]);
        generateNewSequence();
      }
    }

    // 300ms 后移除激活状态
    setTimeout(() => {
      setActiveKeys(prev => {
        const next = new Set(prev);
        next.delete(key.note);
        return next;
      });
    }, 300);
  };

  const generateNewSequence = () => {
    const newSequence = Array.from({ length: Math.floor(score / 50) + 3 }, () => 
      pianoKeys[Math.floor(Math.random() * pianoKeys.length)].note
    );
    setSequence(newSequence);
    playSequence(newSequence);
  };

  const playSequence = async (notes: string[]) => {
    setIsPlaying(true);
    for (const note of notes) {
      const key = pianoKeys.find(k => k.note === note);
      if (key) {
        handleKeyPress(key);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    setIsPlaying(false);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = pianoKeys.find(k => k.key === e.key.toLowerCase());
      if (key && !activeKeys.has(key.note)) {
        handleKeyPress(key);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeKeys, sequence, userSequence, gameMode, score]);

  return (
    <div className={cn("flex flex-col items-center space-y-8 p-8", className)}>
      <div className="flex items-center space-x-4">
        <button
          onClick={() => setGameMode('practice')}
          className={cn(
            "px-4 py-2 rounded-lg transition-colors",
            gameMode === 'practice' 
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
          )}
        >
          练习模式
        </button>
        <button
          onClick={() => setGameMode('challenge')}
          className={cn(
            "px-4 py-2 rounded-lg transition-colors",
            gameMode === 'challenge'
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
          )}
        >
          挑战模式
        </button>
      </div>

      {gameMode === 'challenge' && (
        <div className="text-center space-y-4">
          <div className="text-2xl font-bold">得分: {score}</div>
          {!isPlaying && sequence.length === 0 && (
            <button
              onClick={generateNewSequence}
              className="px-6 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              开始新回合
            </button>
          )}
        </div>
      )}

      <div className="relative">
        <div className="flex">
          {pianoKeys.map((key) => (
            <motion.div
              key={key.note}
              className={cn(
                "relative select-none cursor-pointer transition-colors",
                key.isBlack
                  ? "w-10 h-32 -mx-5 z-10 bg-gray-900 rounded-b-lg"
                  : "w-14 h-48 bg-white border border-gray-300 rounded-b-lg",
                activeKeys.has(key.note) && (key.isBlack ? "bg-gray-700" : "bg-gray-100")
              )}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleKeyPress(key)}
            >
              <span
                className={cn(
                  "absolute bottom-4 left-1/2 -translate-x-1/2 text-xs font-medium",
                  key.isBlack ? "text-white" : "text-gray-900"
                )}
              >
                {key.key.toUpperCase()}
              </span>
            </motion.div>
          ))}
        </div>

        <AnimatePresence>
          {activeKeys.size > 0 && (
            <motion.div
              className="absolute -bottom-12 left-1/2 -translate-x-1/2 text-sm text-muted-foreground"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
            >
              {Array.from(activeKeys).join(' ')}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="text-center text-sm text-muted-foreground">
        使用键盘按键 (A-J) 来演奏钢琴
      </div>
    </div>
  );
}
