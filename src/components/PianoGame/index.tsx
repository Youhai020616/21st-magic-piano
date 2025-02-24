import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface PianoKey {
  note: string;
  key: string;
  isBlack?: boolean;
  sound: string;
}

const pianoKeys: PianoKey[] = [
  // 低音区
  { note: 'C3', key: '1', sound: 'C3' },
  { note: 'C#3', key: 'q', isBlack: true, sound: 'C#3' },
  { note: 'D3', key: '2', sound: 'D3' },
  { note: 'D#3', key: 'w', isBlack: true, sound: 'D#3' },
  { note: 'E3', key: '3', sound: 'E3' },
  { note: 'F3', key: '4', sound: 'F3' },
  { note: 'F#3', key: 'r', isBlack: true, sound: 'F#3' },
  { note: 'G3', key: '5', sound: 'G3' },
  { note: 'G#3', key: 't', isBlack: true, sound: 'G#3' },
  { note: 'A3', key: '6', sound: 'A3' },
  { note: 'A#3', key: 'y', isBlack: true, sound: 'A#3' },
  { note: 'B3', key: '7', sound: 'B3' },
  
  // 中音区
  { note: 'C4', key: '8', sound: 'C4' },
  { note: 'C#4', key: 'i', isBlack: true, sound: 'C#4' },
  { note: 'D4', key: '9', sound: 'D4' },
  { note: 'D#4', key: 'o', isBlack: true, sound: 'D#4' },
  { note: 'E4', key: '0', sound: 'E4' },
  { note: 'F4', key: 'a', sound: 'F4' },
  { note: 'F#4', key: 'z', isBlack: true, sound: 'F#4' },
  { note: 'G4', key: 's', sound: 'G4' },
  { note: 'G#4', key: 'x', isBlack: true, sound: 'G#4' },
  { note: 'A4', key: 'd', sound: 'A4' },
  { note: 'A#4', key: 'c', isBlack: true, sound: 'A#4' },
  { note: 'B4', key: 'f', sound: 'B4' },

  // 高音区
  { note: 'C5', key: 'g', sound: 'C5' },
  { note: 'C#5', key: 'b', isBlack: true, sound: 'C#5' },
  { note: 'D5', key: 'h', sound: 'D5' },
  { note: 'D#5', key: 'n', isBlack: true, sound: 'D#5' },
  { note: 'E5', key: 'j', sound: 'E5' },
  { note: 'F5', key: 'k', sound: 'F5' },
  { note: 'F#5', key: 'm', isBlack: true, sound: 'F#5' },
  { note: 'G5', key: 'l', sound: 'G5' },
  { note: 'G#5', key: ',', isBlack: true, sound: 'G#5' },
  { note: 'A5', key: ';', sound: 'A5' },
  { note: 'A#5', key: '.', isBlack: true, sound: 'A#5' },
  { note: 'B5', key: '/', sound: 'B5' },
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
      // 低音区 (第3八度)
      'C3': 130.81, 'C#3': 138.59, 'D3': 146.83, 'D#3': 155.56,
      'E3': 164.81, 'F3': 174.61, 'F#3': 185.00, 'G3': 196.00,
      'G#3': 207.65, 'A3': 220.00, 'A#3': 233.08, 'B3': 246.94,
      
      // 中音区 (第4八度)
      'C4': 261.63, 'C#4': 277.18, 'D4': 293.66, 'D#4': 311.13,
      'E4': 329.63, 'F4': 349.23, 'F#4': 369.99, 'G4': 392.00,
      'G#4': 415.30, 'A4': 440.00, 'A#4': 466.16, 'B4': 493.88,
      
      // 高音区 (第5八度)
      'C5': 523.25, 'C#5': 554.37, 'D5': 587.33, 'D#5': 622.25,
      'E5': 659.26, 'F5': 698.46, 'F#5': 739.99, 'G5': 783.99,
      'G#5': 830.61, 'A5': 880.00, 'A#5': 932.33, 'B5': 987.77
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

      <div className="relative w-full overflow-hidden">
        <div className="flex justify-center">
          <div className="relative" style={{ width: '1024px' }}>
            <div className="flex justify-center">
              {pianoKeys.map((key) => (
                <motion.div
                  key={key.note}
                  className={cn(
                    "relative select-none cursor-pointer transition-colors",
                    key.isBlack
                      ? "w-8 h-28 -mx-4 z-10 bg-gray-900 rounded-b-lg"
                      : "w-12 h-40 bg-white border border-gray-300 rounded-b-lg",
                    activeKeys.has(key.note) && (key.isBlack ? "bg-gray-700" : "bg-gray-100")
                  )}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleKeyPress(key)}
                >
                  <span
                    className={cn(
                      "absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] font-medium",
                      key.isBlack ? "text-white" : "text-gray-900"
                    )}
                  >
                    {key.key.toUpperCase()}
                  </span>
                  <span
                    className={cn(
                      "absolute bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-medium",
                      key.isBlack ? "text-white/60" : "text-gray-500"
                    )}
                  >
                    {key.note}
                  </span>
                </motion.div>
              ))}
            </div>

            <AnimatePresence>
              {activeKeys.size > 0 && (
                <motion.div
                  className="absolute -bottom-12 left-1/2 -translate-x-1/2 text-sm text-muted-foreground whitespace-nowrap"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                >
                  {Array.from(activeKeys).join(' ')}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="w-full max-w-4xl mx-auto mt-16">
        <div className="text-center text-sm text-muted-foreground space-y-4">
          <div className="font-medium text-lg">键盘控制说明</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-card p-4 rounded-lg space-y-2">
              <div className="font-medium text-primary">低音区</div>
              <div>白键：1 2 3 4 5 6 7</div>
              <div>黑键：Q W R T Y</div>
            </div>
            <div className="bg-card p-4 rounded-lg space-y-2">
              <div className="font-medium text-primary">中音区</div>
              <div>白键：8 9 0 A S D F</div>
              <div>黑键：I O Z X C</div>
            </div>
            <div className="bg-card p-4 rounded-lg space-y-2">
              <div className="font-medium text-primary">高音区</div>
              <div>白键：G H J K L ; /</div>
              <div>黑键：B N M , .</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
