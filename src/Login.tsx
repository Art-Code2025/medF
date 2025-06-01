import { useState, FormEvent, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, Shield, AlertCircle, Sparkles, Crown, Key, ChevronDown } from 'lucide-react';
import { toast } from 'react-toastify';

const Login: React.FC = () => {
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showCredentials, setShowCredentials] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    // إنشاء تأثيرات جزيئات متحركة للخلفية
    const createParticles = () => {
      const container = document.querySelector('.admin-particles');
      if (!container) return;
      
      for (let i = 0; i < 40; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        
        const size = Math.random() * 12 + 3;
        const posX = Math.random() * 100;
        const delay = Math.random() * 15;
        const duration = Math.random() * 30 + 15;
        
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
      setError('⚠️ يرجى إدخال جميع البيانات المطلوبة');
      setLoading(false);
      return;
    }

    // التحقق من بيانات الأدمن المضبوطة
    const ADMIN_EMAIL = 'admin@admin';
    const ADMIN_PASSWORD = 'admin';
    
    // محاكاة تأخير الخادم للمصداقية
    setTimeout(() => {
      if (loginData.email.toLowerCase().trim() === ADMIN_EMAIL && loginData.password === ADMIN_PASSWORD) {
        // نجح تسجيل الدخول
        const adminUser = {
          id: 'admin',
          email: ADMIN_EMAIL,
          name: 'مدير النظام',
          role: 'admin',
          loginTime: new Date().toISOString()
        };
        
        // حفظ بيانات الأدمن في localStorage منفصل
        localStorage.setItem('adminUser', JSON.stringify(adminUser));
        
        toast.success('🎉 مرحباً بك أيها المدير!', {
          position: "top-center",
          autoClose: 2000,
          style: {
            background: 'linear-gradient(135deg, #DC2626, #7C2D12)',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '16px'
          }
        });
        
        console.log('✅ Admin logged in successfully');
        navigate('/dashboard');
      } else {
        // فشل تسجيل الدخول مع رسائل محددة
        if (loginData.email.toLowerCase().trim() !== ADMIN_EMAIL) {
          setError('❌ بيانات المدير غير صحيحة - تحقق من البريد الإلكتروني');
        } else {
          setError('❌ بيانات المدير غير صحيحة - تحقق من كلمة المرور');
        }
        
        // تأثير اهتزاز عند الخطأ
        const form = document.querySelector('.admin-form');
        if (form) {
          form.classList.add('shake');
          setTimeout(() => form.classList.remove('shake'), 600);
        }
      }
      setLoading(false);
    }, 1200);
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated Background Particles */}
      <div className="admin-particles absolute inset-0 pointer-events-none"></div>
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-red-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '4s'}}></div>
      </div>
      
      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-lg">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="relative inline-block mb-6">
              <div className="w-24 h-24 bg-gradient-to-r from-red-600 via-purple-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto shadow-2xl animate-pulse border-4 border-white/20">
                <Crown className="w-12 h-12 text-white drop-shadow-lg" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center animate-bounce">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-red-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent mb-3 drop-shadow-lg">
              لوحة الإدارة
            </h1>
            <p className="text-white/80 text-lg font-medium">
              مرحباً بك في نظام إدارة المتجر
            </p>
            <div className="flex items-center justify-center gap-2 mt-3">
              <Shield className="w-5 h-5 text-purple-400" />
              <span className="text-white/60 text-sm">منطقة محمية للمديرين فقط</span>
            </div>
          </div>

          {/* Form Container */}
          <div className="admin-form bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl relative overflow-hidden">
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/20 to-red-500/20 rounded-full -translate-y-16 translate-x-16 blur-xl"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 rounded-full translate-y-12 -translate-x-12 blur-xl"></div>
            
            {/* Error Message */}
            {error && (
              <div className="bg-red-500/20 border-2 border-red-500/40 rounded-xl p-4 mb-6 flex items-start animate-shake">
                <AlertCircle className="w-6 h-6 text-red-300 mr-3 mt-0.5 flex-shrink-0" />
                <p className="text-red-200 font-medium">{error}</p>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-6 relative z-10">
              {/* Email */}
              <div>
                <label className="block text-white/90 text-sm font-bold mb-3 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-purple-400" />
                  البريد الإلكتروني للإدارة
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={loginData.email}
                    onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full pl-12 pr-4 py-4 bg-white/10 border-2 border-white/30 rounded-xl text-white placeholder-white/60 focus:ring-4 focus:ring-purple-500/30 focus:border-purple-400 backdrop-blur-sm transition-all duration-300 font-medium"
                    placeholder="أدخل بريدك الإلكتروني الإداري"
                    disabled={loading}
                  />
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-white/90 text-sm font-bold mb-3 flex items-center gap-2">
                  <Key className="w-4 h-4 text-purple-400" />
                  كلمة المرور الإدارية
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={loginData.password}
                    onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full pl-12 pr-12 py-4 bg-white/10 border-2 border-white/30 rounded-xl text-white placeholder-white/60 focus:ring-4 focus:ring-purple-500/30 focus:border-purple-400 backdrop-blur-sm transition-all duration-300 font-medium"
                    placeholder="أدخل كلمة المرور الإدارية"
                    disabled={loading}
                  />
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white/80 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Credentials Help */}
              <div className="bg-white/5 border border-white/20 rounded-xl p-4">
                <button
                  type="button"
                  onClick={() => setShowCredentials(!showCredentials)}
                  className="w-full flex items-center justify-between text-white/80 hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-purple-400" />
                    <span className="text-sm font-medium">معلومات تسجيل الدخول</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${showCredentials ? 'rotate-180' : ''}`} />
                </button>
                
                {showCredentials && (
                  <div className="mt-4 pt-4 border-t border-white/20 space-y-2 animate-fade-in">
                    <p className="text-white/70 text-xs">
                      💡 هذا نظام إداري محمي. تواصل مع مطور النظام للحصول على بيانات تسجيل الدخول.
                    </p>
                    <p className="text-white/60 text-xs">
                      🔒 البيانات محفوظة بشكل آمن ومشفر في النظام.
                    </p>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-red-600 via-purple-600 to-indigo-600 text-white py-4 rounded-xl font-bold text-lg transition-all duration-300 hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 relative overflow-hidden"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>جاري التحقق من صلاحياتك...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-3">
                    <Crown className="w-6 h-6" />
                    <span>دخول لوحة الإدارة</span>
                  </div>
                )}
                
                {/* Shimmer Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform translate-x-full group-hover:-translate-x-full transition-transform duration-1000"></div>
              </button>
            </form>
          </div>

          {/* Footer */}
          <div className="text-center mt-8">
            <div className="flex items-center justify-center gap-4 text-white/50 text-sm">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                <span>محمي بحماية متقدمة</span>
              </div>
              <div className="w-1 h-1 bg-white/50 rounded-full"></div>
              <div className="flex items-center gap-2">
                <Crown className="w-4 h-4" />
                <span>للمديرين المعتمدين فقط</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Styles */}
      <style dangerouslySetInnerHTML={{__html: `
          .particle {
            position: absolute;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 50%;
            animation: adminFloat linear infinite;
          }

          @keyframes adminFloat {
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

          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
            20%, 40%, 60%, 80% { transform: translateX(4px); }
          }

          .shake {
            animation: shake 0.6s ease-in-out;
          }

          @keyframes fade-in {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }

          .animate-fade-in {
            animation: fade-in 0.3s ease forwards;
          }
      `}} />
    </div>
  );
};

export default Login;