'use client';

import { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { supabase } from '@/lib/supabase';
import { UserPlus, Play, RotateCcw, PlusCircle, Trash2, Lock } from 'lucide-react';

type Participant = {
  id: string;
  name: string;
  emoji: string;
  color: string;
  progress: number;
};

const EMOJIS = ['🏎️', '🚀', '🐎', '🐢', '🏃', '🦄', '🦖', '🐒', '⚡', '☄️', '⚽'];
const COLORS = [
  'linear-gradient(135deg, #ef4444, #b91c1c)', // Red
  'linear-gradient(135deg, #3b82f6, #1d4ed8)', // Blue
  'linear-gradient(135deg, #10b981, #047857)', // Green
  'linear-gradient(135deg, #f59e0b, #b45309)', // Yellow
  'linear-gradient(135deg, #8b5cf6, #5b21b6)', // Purple
  'linear-gradient(135deg, #ec4899, #be185d)', // Pink
  'linear-gradient(135deg, #f97316, #c2410c)', // Orange
  'linear-gradient(135deg, #06b6d4, #0e7490)', // Cyan
];

type Phase = 'setup' | 'racing' | 'result';

export default function Home() {
  const [phase, setPhase] = useState<Phase>('setup');
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [newName, setNewName] = useState('');
  const [winner, setWinner] = useState<Participant | null>(null);
  const raceInterval = useRef<NodeJS.Timeout | null>(null);
  const [authenticated, setAuthenticated] = useState(!process.env.NEXT_PUBLIC_SITE_PASSWORD);
  const [passwordInput, setPasswordInput] = useState('');

  // Global click for confetti
  useEffect(() => {
    const handleGlobalClick = () => {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: Math.random() * 0.8 + 0.2, x: Math.random() },
        zIndex: 100,
        disableForReducedMotion: true,
        shapes: ['square', 'circle', 'star'],
      });
    };
    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, []);

  const addParticipant = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newName.trim()) return;

    if (participants.length >= 8) {
      alert("Maximum 8 racers allowed!");
      return;
    }

    const newParticipant: Participant = {
      id: Math.random().toString(36).substr(2, 9),
      name: newName.trim(),
      emoji: EMOJIS[participants.length % EMOJIS.length],
      color: COLORS[participants.length % COLORS.length],
      progress: 0,
    };

    setParticipants([...participants, newParticipant]);
    setNewName('');
  };

  const removeParticipant = (id: string) => {
    setParticipants(participants.filter(p => p.id !== id));
  };

  const startRace = () => {
    if (participants.length < 2) {
      alert("Add at least 2 racers to start!");
      return;
    }
    setParticipants(pts => pts.map(p => ({ ...p, progress: 0 })));
    setWinner(null);
    setPhase('racing');

    // We add a tiny delay so the UI updates to 'racing' before the interval starts
    setTimeout(() => {
      raceInterval.current = setInterval(updateRace, 50);
    }, 500);
  };

  const updateRace = () => {
    setParticipants(currentPts => {
      let isFinished = false;
      let winningParticipant: Participant | null = null;

      const newPts = currentPts.map(p => {
        if (isFinished) return p;

        // Random increment between 0.1 and 1.5
        const increment = Math.random() * 1.5;
        const newProgress = Math.min(100, p.progress + increment);

        if (newProgress >= 100 && !isFinished) {
          isFinished = true;
          winningParticipant = { ...p, progress: 100 };
        }

        return { ...p, progress: newProgress };
      });

      if (isFinished && winningParticipant) {
        if (raceInterval.current) clearInterval(raceInterval.current);
        handleWin(winningParticipant, newPts);
      }

      return newPts;
    });
  };

  const handleWin = async (winningRacer: Participant, finalPts: Participant[]) => {
    setWinner(winningRacer);
    setPhase('result');

    // Big confetti blast
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'],
        shapes: ['square', 'circle', 'star']
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'],
        shapes: ['square', 'circle', 'star']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();

    // Log to Supabase silently
    try {
      await supabase.from('race_history').insert({
        participants: finalPts.map(p => p.name),
        winner_name: winningRacer.name,
      });
    } catch (err) {
      console.error('Failed to log to Supabase. Make sure race_history table exists.', err);
    }
  };

  const resetRace = (keepParticipants: boolean) => {
    setPhase('setup');
    setWinner(null);
    if (!keepParticipants) {
      setParticipants([]);
    } else {
      setParticipants(pts => pts.map(p => ({ ...p, progress: 0 })));
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === process.env.NEXT_PUBLIC_SITE_PASSWORD) {
      setAuthenticated(true);
    } else {
      alert("Incorrect password!");
    }
  };

  if (!authenticated) {
    return (
      <main className="container">
        <div className="glass-panel" style={{ maxWidth: '400px', margin: '10vh auto' }}>
          <header className="app-header">
            <img src="/logo.png" alt="Chore Race Logo" className="logo" />
            <h1 className="title" style={{ fontSize: '2.5rem' }}>Chore Race</h1>
          </header>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>This app is password protected.</p>
            <input
              type="password"
              className="input"
              placeholder="Enter Passcode"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              onFocus={(e) => e.target.placeholder = ''}
              onBlur={(e) => e.target.placeholder = 'Enter Passcode'}
              autoComplete="new-password"
              autoFocus
            />
            <button type="submit" className="btn btn-large" style={{ marginTop: '0' }}>
              <Lock size={20} /> Unlock
            </button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="container">
      <div className="glass-panel">
        <header className="app-header">
          <img src="/logo.png" alt="Chore Race Logo" className="logo" />
          <div>
            <h1 className="title">Chore Race</h1>
            <p className="subtitle">Turn boring decisions into a playful race!</p>
          </div>
        </header>

        {phase === 'setup' && (
          <div className="setup-container">
            <form onSubmit={addParticipant} className="input-group">
              <input
                type="text"
                className="input"
                placeholder="Enter a name..."
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                maxLength={30}
              />
              <button type="submit" className="btn">
                <UserPlus size={20} /> <span className="btn-text">Add</span>
              </button>
            </form>

            <div className="participants-list">
              {participants.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '1rem' }}>
                  No racers added yet. Add some names above!
                </div>
              ) : (
                participants.map((p) => (
                  <div key={p.id} className="participant-item">
                    <div className="participant-info">
                      <div className="avatar" style={{ background: p.color }}>
                        {p.emoji}
                      </div>
                      <span>{p.name}</span>
                    </div>
                    <button
                      className="btn btn-danger"
                      style={{ padding: '0.4rem', borderRadius: '50%' }}
                      onClick={() => removeParticipant(p.id)}
                      title="Remove"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>

            <button
              className="btn btn-large"
              onClick={startRace}
              disabled={participants.length < 2}
            >
              <Play size={24} /> Start the Race!
            </button>
          </div>
        )}

        {(phase === 'racing' || phase === 'result') && (
          <div className="race-container">
            {phase === 'result' && winner && (
              <div className="winner-banner">
                <h2 style={{ fontSize: '1.5rem', color: 'var(--text-main)', marginBottom: '0' }}>WE HAVE A WINNER!</h2>
                <h2>{winner.name}</h2>
                <div className="winner-racer" style={{ background: winner.color }}>
                  {winner.emoji}
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                  <button className="btn btn-large" onClick={() => resetRace(true)} style={{ flex: 1 }}>
                    <RotateCcw size={20} /> Rematch
                  </button>
                  <button className="btn btn-large" onClick={() => resetRace(false)} style={{ flex: 1, background: 'var(--panel-bg)', border: '1px solid var(--accent)' }}>
                    <PlusCircle size={20} /> New Race
                  </button>
                </div>
              </div>
            )}

            {participants.map((p) => (
              <div key={p.id} className="track" style={{ opacity: phase === 'result' && winner?.id !== p.id ? 0.4 : 1 }}>
                <div className="finish-line-marker"></div>
                <div
                  className="racer"
                  style={{
                    left: `calc(${p.progress}% - ${p.progress * 0.48}px)`,
                    background: p.color
                  }}
                >
                  <div className="racer-name">{p.name}</div>
                  {p.emoji}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </main>

  );
}
