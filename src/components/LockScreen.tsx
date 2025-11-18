import { useState, useEffect } from 'react';
import { Lock, AlertTriangle, ShieldAlert } from 'lucide-react';

interface LockScreenProps {
  onUnlock: () => void;
}

export default function LockScreen({ onUnlock }: LockScreenProps) {
  const [password, setPassword] = useState('');
  const [isLocked, setIsLocked] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);
  const [shake, setShake] = useState(false);
  const [error, setError] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());

  const CORRECT_PASSWORD = localStorage.getItem('lockPassword') || '1234';

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (remainingTime > 0) {
      const timer = setInterval(() => {
        setRemainingTime((prev) => {
          if (prev <= 1) {
            setIsLocked(false);
            setError('');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [remainingTime]);

  const playAlarmSound = () => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const gainNode = audioContext.createGain();

    gainNode.connect(audioContext.destination);
    gainNode.gain.setValueAtTime(0.4, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 4);

    const frequencies = [900, 700, 850, 750, 900, 700, 850, 750];
    const duration = 0.25;

    frequencies.forEach((freq, index) => {
      const osc = audioContext.createOscillator();
      osc.connect(gainNode);
      osc.frequency.value = freq;
      osc.type = 'square';

      const startTime = audioContext.currentTime + (index * duration);
      osc.start(startTime);
      osc.stop(startTime + duration);
    });

    for (let i = 0; i < 12; i++) {
      setTimeout(() => {
        const osc = audioContext.createOscillator();
        osc.connect(gainNode);
        osc.frequency.value = 1200 + (i % 3) * 200;
        osc.type = 'triangle';

        const now = audioContext.currentTime;
        osc.start(now);
        osc.stop(now + 0.15);
      }, i * 300 + 2000);
    }
  };

  const triggerShake = () => {
    playAlarmSound();
    if (navigator.vibrate) {
      navigator.vibrate([300, 150, 300, 150, 300, 150, 500, 200, 500]);
    }
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isLocked) {
      triggerShake();
      return;
    }

    if (password === CORRECT_PASSWORD) {
      setError('');
      onUnlock();
    } else {
      const currentAttempts = parseInt(localStorage.getItem('failedAttempts') || '0');
      const newAttempts = currentAttempts + 1;
      localStorage.setItem('failedAttempts', newAttempts.toString());

      triggerShake();
      setPassword('');

      if (newAttempts >= 3) {
        setIsLocked(true);
        setRemainingTime(30);
        setError('تم قفل الجهاز لمدة 30 ثانية بسبب المحاولات الفاشلة المتكررة!');
        localStorage.setItem('failedAttempts', '0');
      } else {
        setError(`كلمة مرور خاطئة! المحاولة ${newAttempts} من 3`);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDateTime = (date: Date) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const day = date.toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    return { time: `${hours}:${minutes}`, day };
  };

  const { time, day } = formatDateTime(currentTime);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-50"></div>

      <div className={`relative z-10 w-full max-w-md ${shake ? 'animate-shake' : ''}`}>
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
          <div className="p-8 text-center">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full shadow-lg mb-4">
                {isLocked ? (
                  <ShieldAlert className="w-10 h-10 text-white" />
                ) : (
                  <Lock className="w-10 h-10 text-white" />
                )}
              </div>
              <h1 className="text-6xl font-light text-white mb-2">{time}</h1>
              <p className="text-blue-200 text-sm">{day}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-3">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isLocked ? 'مقفل...' : 'أدخل كلمة المرور'}
                  disabled={isLocked}
                  className={`w-full px-6 py-4 bg-white/10 border-2 ${
                    isLocked
                      ? 'border-red-500/50'
                      : error
                      ? 'border-red-400'
                      : 'border-white/20'
                  } rounded-2xl text-white placeholder-blue-200/50 text-center text-lg tracking-widest focus:outline-none focus:border-blue-400 transition-all disabled:cursor-not-allowed`}
                  autoFocus={!isLocked}
                />

                {error && (
                  <div className={`flex items-center justify-center gap-2 text-sm ${
                    isLocked ? 'text-red-300' : 'text-yellow-300'
                  } bg-black/20 p-3 rounded-xl`}>
                    <AlertTriangle className="w-4 h-4" />
                    <span>{error}</span>
                  </div>
                )}

                {isLocked && (
                  <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4">
                    <div className="text-red-300 text-sm mb-2">الوقت المتبقي للفتح</div>
                    <div className="text-3xl font-bold text-red-200">{formatTime(remainingTime)}</div>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isLocked || !password}
                className={`w-full py-4 rounded-2xl font-semibold text-white transition-all transform ${
                  isLocked || !password
                    ? 'bg-gray-500/50 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 active:scale-95 shadow-lg hover:shadow-xl'
                }`}
              >
                {isLocked ? 'مقفل' : 'فتح'}
              </button>

              <div className="text-xs text-blue-200/60 text-center">
                {isLocked
                  ? 'تم حظر المحاولات بعد 3 محاولات فاشلة'
                  : 'اذهب للإعدادات لتغيير كلمة المرور'}
              </div>
            </form>
          </div>
        </div>

        <div className="mt-6 text-center">
          <button className="text-white/70 hover:text-white transition-colors text-sm">
            نسيت كلمة المرور؟
          </button>
        </div>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
          20%, 40%, 60%, 80% { transform: translateX(10px); }
        }
        .animate-shake {
          animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
        }
      `}</style>
    </div>
  );
}
