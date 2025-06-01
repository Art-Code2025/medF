import { useState, FormEvent, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, Shield, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import { apiCall, API_ENDPOINTS } from './config/api';

const Login: React.FC = () => {
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    // إنشاء تأثير الجزيئات المتحركة في الخلفية
    const createParticles = () => {
      const container = document.querySelector('.particles-container');
      if (!container) return;
      
      for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        
        const size = Math.random() * 8 + 2;
        const posX = Math.random() * 100;
        const delay = Math.random() * 10;
        const duration = Math.random() * 20 + 10;
        
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.left = `${posX}%`;
        particle.style.animationDelay = `${delay}s`;
        particle.style.animationDuration = `${duration}s`;
        
        container.appendChild(particle);
      }
    };
    
    createParticles();
  }, []);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // التحقق من البيانات
    if (!loginData.email.trim() || !loginData.password.trim()) {
      setError('الرجاء إدخال جميع البيانات المطلوبة');
      setLoading(false);
      return;
    }

    // التحقق من أن هذا المدخل للأدمن فقط
    if (loginData.email !== 'admin') {
      setError('هذه صفحة تسجيل دخول الإدارة فقط. العملاء يسجلون الدخول من الصفحة الرئيسية.');
      setLoading(false);
      return;
    }

    try {
      const data = await apiCall(API_ENDPOINTS.LOGIN, {
        method: 'POST',
        body: JSON.stringify(loginData)
      });

      // التحقق من أن المستخدم أدمن
      if (data.user.role !== 'admin' && data.user.email !== 'admin') {
        setError('غير مصرح لك بالوصول لصفحة الإدارة');
        setLoading(false);
        return;
      }

      // حفظ بيانات المستخدم
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // إشارة نجاح
      const form = document.querySelector('.login-form');
      form?.classList.add('success-animation');
      
      toast.success(`مرحباً بك في لوحة الإدارة ${data.user.name}!`);
        
      setTimeout(() => {
        navigate('/admin'); // توجيه للداش بورد فقط
      }, 500);
      
    } catch (error: any) {
      console.error('Login error:', error);
      setError(error.message || 'خطأ في تسجيل الدخول');
      
      const errorElement = document.querySelector('.error-message');
      errorElement?.classList.add('shake-animation');
      setTimeout(() => {
        errorElement?.classList.remove('shake-animation');
      }, 500);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-red-900 via-purple-900 to-indigo-900">
      {/* Particles Container */}
      <div className="particles-container absolute inset-0 pointer-events-none"></div>
      
      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-lg border border-white/30">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
              لوحة الإدارة
            </h1>
            <p className="text-white/80 text-lg">
              تسجيل دخول المديرين
            </p>
            <p className="text-white/60 text-sm mt-2">
              للإدارة فقط • صفحة محمية
            </p>
          </div>

          {/* Form Container */}
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl login-form">
            {/* Error Message */}
            {error && (
              <div className="bg-red-500/20 border border-red-500/40 rounded-xl p-4 mb-6 error-message flex items-start">
                <AlertCircle className="w-5 h-5 text-red-300 mr-3 mt-0.5 flex-shrink-0" />
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-6">
              {/* Email */}
              <div>
                <label className="block text-white/90 text-sm font-medium mb-2">
                  اسم المستخدم
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={loginData.email}
                    onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/30 rounded-xl text-white placeholder-white/60 focus:ring-2 focus:ring-white/50 focus:border-white/50 backdrop-blur-sm"
                    placeholder="admin"
                    disabled={loading}
                  />
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-white/90 text-sm font-medium mb-2">
                  كلمة المرور
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={loginData.password}
                    onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full pl-12 pr-12 py-4 bg-white/10 border border-white/30 rounded-xl text-white placeholder-white/60 focus:ring-2 focus:ring-white/50 focus:border-white/50 backdrop-blur-sm"
                    placeholder="••••••••"
                    disabled={loading}
                  />
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white/80"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-white text-gray-900 py-4 rounded-xl font-bold text-lg transition-all duration-300 hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl hover:shadow-2xl transform hover:scale-105"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
                    جاري تسجيل الدخول...
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <Shield className="w-5 h-5" />
                    دخول لوحة الإدارة
                  </div>
                )}
              </button>
            </form>

            {/* Admin Info */}
            <div className="mt-6 text-center">
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <p className="text-white/70 text-xs mb-2">🔐 بيانات الدخول للاختبار:</p>
                <p className="text-white/90 text-sm font-mono">
                  اسم المستخدم: <span className="text-yellow-300">admin</span>
                </p>
                <p className="text-white/90 text-sm font-mono">
                  كلمة المرور: <span className="text-yellow-300">11111</span>
                </p>
              </div>
            </div>

            {/* Back to site */}
            <div className="mt-6 text-center">
              <p className="text-white/80 text-sm">
                عميل عادي؟
                <button
                  type="button"
                  onClick={() => navigate('/sign-in')}
                  className="text-white font-medium mr-2 underline hover:text-white/80"
                >
                  تسجيل دخول العملاء
                </button>
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-8">
            <p className="text-white/60 text-sm">
              صفحة محمية للإدارة فقط • جميع الأنشطة مُراقبة
            </p>
            <button
              onClick={() => navigate('/')}
              className="text-white/80 hover:text-white text-sm mt-2 underline"
            >
              ← العودة للموقع الرئيسي
            </button>
          </div>
        </div>
      </div>

      {/* Styles */}
      <style dangerouslySetInnerHTML={{__html: `
          .particle {
            position: absolute;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 50%;
            animation: float linear infinite;
          }

          @keyframes float {
            0% {
              transform: translateY(100vh) rotate(0deg);
              opacity: 0;
            }
            10% {
              opacity: 1;
            }
            90% {
              opacity: 1;
            }
            100% { 
              transform: translateY(-100px) rotate(360deg);
              opacity: 0;
            }
          }
          
          .shake-animation {
            animation: shake 0.5s ease-in-out;
          }
          
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            75% { transform: translateX(5px); }
          }
          
          .success-animation {
            animation: success 0.5s ease-in-out;
          }
          
          @keyframes success {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
          }
      `}} />
    </div>
  );
};

export default Login;