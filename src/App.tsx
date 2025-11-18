import { useState } from 'react';
import { Settings } from 'lucide-react';
import LockScreen from './components/LockScreen';

function App() {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isFirstTime, setIsFirstTime] = useState(() => !localStorage.getItem('lockPassword'));
  const [password, setPassword] = useState(() => localStorage.getItem('lockPassword') || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [settingMessage, setSettingMessage] = useState('');

  const handleSavePassword = () => {
    if (!newPassword.trim()) {
      setSettingMessage('أدخل كلمة مرور جديدة');
      return;
    }
    if (newPassword !== confirmPassword) {
      setSettingMessage('كلمات المرور غير متطابقة');
      return;
    }
    localStorage.setItem('lockPassword', newPassword);
    setPassword(newPassword);
    setNewPassword('');
    setConfirmPassword('');
    setSettingMessage('تم تحديث كلمة المرور بنجاح!');
    setTimeout(() => {
      setSettingMessage('');
      if (isFirstTime) setIsFirstTime(false);
    }, 1500);
  };

  // شاشة الإعداد لأول مرة
  if (isFirstTime) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4">
        <div className="w-full max-w-md bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8">
          <h1 className="text-3xl font-bold text-white mb-4 text-center">إعداد الأمان</h1>

          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="أدخل كلمة مرور جديدة"
            className="w-full px-4 py-3 mb-4 rounded-xl text-center text-white placeholder-blue-200/50 bg-white/10 border border-white/20 focus:outline-none focus:border-blue-400"
            autoFocus
          />

          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="أعد إدخال كلمة المرور"
            className="w-full px-4 py-3 mb-4 rounded-xl text-center text-white placeholder-blue-200/50 bg-white/10 border border-white/20 focus:outline-none focus:border-blue-400"
          />

          {settingMessage && (
            <div className="p-3 text-center text-sm text-white">
              {settingMessage}
            </div>
          )}

          <button
            onClick={handleSavePassword}
            className="w-full py-3 bg-blue-500 rounded-xl text-white font-semibold"
            disabled={!newPassword || !confirmPassword}
          >
            إعداد كلمة المرور
          </button>
        </div>
      </div>
    );
  }

  // شاشة القفل
  if (!isUnlocked) {
    return (
      <LockScreen
        onUnlock={() => setIsUnlocked(true)}
      />
    );
  }

  // بعد فك القفل → يظهر كلمة صغيرة + زر Settings ينقلك للينك
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="text-center p-6 bg-white rounded-xl shadow-md border w-fit">

        {/* الكلمة الصغيرة */}
        <p className="text-gray-700 text-sm mb-3">
          تم فتح القفل بنجاح ✔️
        </p>

        {/* زر Settings يفتح لينك */}
        <button
          onClick={() => {
            window.location.href = "https://protexa-main.vercel.app/"; // 👈 غير اللينك هنا
          }}
          className="px-4 py-1 text-xs bg-gray-800 text-white rounded-md hover:bg-black transition flex items-center gap-1 mx-auto"
        >
          <Settings className="w-3 h-3" />
          Settings
        </button>
      </div>
    </div>
  );
}

export default App;
