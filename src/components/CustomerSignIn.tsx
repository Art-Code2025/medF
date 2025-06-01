import { useState, FormEvent, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, User, AlertCircle, UserPlus, LogIn } from 'lucide-react';
import { toast } from 'react-toastify';
import { apiCall, API_ENDPOINTS } from '../config/api';

const CustomerSignIn: React.FC = () => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });
  const [registerData, setRegisterData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    phone: '',
    city: ''
  });
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
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

    // منع الأدمن من تسجيل الدخول هنا
    if (loginData.email === 'admin' || loginData.email === 'admin@admin') {
      setError('هذه الصفحة للعملاء فقط. الإدارة لها نظام منفصل.');
      setLoading(false);
      return;
    }

    try {
      const data = await apiCall(API_ENDPOINTS.LOGIN, {
        method: 'POST',
        body: JSON.stringify(loginData)
      });

      // التحقق من أن المستخدم عميل عادي فقط
      if (data.user.role === 'admin') {
        setError('هذه الصفحة للعملاء فقط. الإدارة لها نظام منفصل.');
        setLoading(false);
        return;
      }

      // حفظ بيانات العميل فقط
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // حفظ بيانات إضافية لاستخدامها في الـ Checkout
      const checkoutData = {
        name: data.user.name,
        phone: data.user.phone || '',
        city: data.user.city || '',
        email: data.user.email,
        userId: data.user.id
      };
      localStorage.setItem('userCheckoutData', JSON.stringify(checkoutData));
      console.log('💾 Checkout data saved for smooth experience:', checkoutData);
      
      toast.success(`مرحباً بك ${data.user.name}!`);
      
      setTimeout(() => {
        navigate('/'); // توجيه للصفحة الرئيسية فقط
      }, 500);
      
    } catch (error: any) {
      console.error('Login error:', error);
      setError(error.message || 'خطأ في تسجيل الدخول');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // التحقق من البيانات
    if (!registerData.email.trim() || !registerData.password.trim() || !registerData.name.trim()) {
      setError('الرجاء إدخال جميع البيانات المطلوبة');
      setLoading(false);
      return;
    }

    // منع إنشاء حساب بـ email admin
    if (registerData.email === 'admin' || registerData.email === 'admin@admin') {
      setError('لا يمكن إنشاء حساب بهذا البريد الإلكتروني');
      setLoading(false);
      return;
    }

    if (registerData.password.length < 6) {
      setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      setLoading(false);
      return;
    }

    if (registerData.password !== registerData.confirmPassword) {
      setError('كلمة المرور غير متطابقة');
      setLoading(false);
      return;
    }

    try {
      const data = await apiCall(API_ENDPOINTS.REGISTER, {
        method: 'POST',
        body: JSON.stringify({
          email: registerData.email.toLowerCase(),
          password: registerData.password,
          name: registerData.name,
          phone: registerData.phone,
          city: registerData.city
        })
      });

      // حفظ بيانات المستخدم
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // حفظ بيانات إضافية لاستخدامها في الـ Checkout
      const checkoutData = {
        name: data.user.name,
        phone: data.user.phone || '',
        city: data.user.city || '',
        email: data.user.email,
        userId: data.user.id
      };
      localStorage.setItem('userCheckoutData', JSON.stringify(checkoutData));
      console.log('💾 Checkout data saved for smooth experience:', checkoutData);
      
      toast.success('تم إنشاء حسابك بنجاح!');
      
      setTimeout(() => {
        navigate('/');
      }, 500);
      
    } catch (error: any) {
      console.error('Register error:', error);
      setError(error.message || 'خطأ في إنشاء الحساب');
    } finally {
      setLoading(false);
    }
  };

  // Format Saudi phone number
  const formatSaudiPhone = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
    return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 9)}`;
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-emerald-900 via-teal-900 to-cyan-900">
      {/* Particles Container */}
      <div className="particles-container absolute inset-0 pointer-events-none"></div>
      
      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-lg border border-white/30">
              <User className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
              {mode === 'login' ? 'تسجيل الدخول' : 'إنشاء حساب جديد'}
            </h1>
            <p className="text-white/80 text-lg">
              {mode === 'login' ? 'أدخل بيانات حسابك للمتابعة' : 'أنشئ حساباً جديداً معنا'}
            </p>
            <p className="text-white/60 text-sm mt-2">
              للعملاء فقط • صفحة تسجيل الدخول العامة
            </p>
          </div>

          {/* Form Container */}
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl">
            {/* Error Message */}
            {error && (
              <div className="bg-red-500/20 border border-red-500/40 rounded-xl p-4 mb-6 flex items-start">
                <AlertCircle className="w-5 h-5 text-red-300 mr-3 mt-0.5 flex-shrink-0" />
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}

            {/* Login Form */}
            {mode === 'login' && (
              <form onSubmit={handleLogin} className="space-y-6">
                {/* Email */}
                <div>
                  <label className="block text-white/90 text-sm font-medium mb-2">
                    البريد الإلكتروني
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={loginData.email}
                      onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/30 rounded-xl text-white placeholder-white/60 focus:ring-2 focus:ring-white/50 focus:border-white/50 backdrop-blur-sm"
                      placeholder="example@domain.com"
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
                      <LogIn className="w-5 h-5" />
                      تسجيل الدخول
                    </div>
                  )}
                </button>
              </form>
            )}

            {/* Register Form */}
            {mode === 'register' && (
              <form onSubmit={handleRegister} className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-white/90 text-sm font-medium mb-2">
                    الاسم الكامل
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={registerData.name}
                      onChange={(e) => setRegisterData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/30 rounded-xl text-white placeholder-white/60 focus:ring-2 focus:ring-white/50 focus:border-white/50 backdrop-blur-sm text-sm"
                      placeholder="أحمد محمد"
                      disabled={loading}
                    />
                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/60" />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-white/90 text-sm font-medium mb-2">
                    البريد الإلكتروني
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={registerData.email}
                      onChange={(e) => setRegisterData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/30 rounded-xl text-white placeholder-white/60 focus:ring-2 focus:ring-white/50 focus:border-white/50 backdrop-blur-sm text-sm"
                      placeholder="example@domain.com"
                      disabled={loading}
                    />
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/60" />
                  </div>
                </div>

                {/* Phone & City */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-white/90 text-sm font-medium mb-2">
                      الجوال
                    </label>
                    <input
                      type="text"
                      value={registerData.phone}
                      onChange={(e) => {
                        const digits = e.target.value.replace(/\D/g, '');
                        if (digits.length <= 9) {
                          const formatted = formatSaudiPhone(digits);
                          setRegisterData(prev => ({ ...prev, phone: formatted }));
                        }
                      }}
                      className="w-full px-3 py-3 bg-white/10 border border-white/30 rounded-xl text-white placeholder-white/60 focus:ring-2 focus:ring-white/50 focus:border-white/50 backdrop-blur-sm text-sm"
                      placeholder="5XX XXX XXX"
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <label className="block text-white/90 text-sm font-medium mb-2">
                      المدينة
                    </label>
                    <input
                      type="text"
                      value={registerData.city}
                      onChange={(e) => setRegisterData(prev => ({ ...prev, city: e.target.value }))}
                      className="w-full px-3 py-3 bg-white/10 border border-white/30 rounded-xl text-white placeholder-white/60 focus:ring-2 focus:ring-white/50 focus:border-white/50 backdrop-blur-sm text-sm"
                      placeholder="الرياض"
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Passwords */}
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <label className="block text-white/90 text-sm font-medium mb-2">
                      كلمة المرور
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={registerData.password}
                        onChange={(e) => setRegisterData(prev => ({ ...prev, password: e.target.value }))}
                        className="w-full pl-12 pr-12 py-3 bg-white/10 border border-white/30 rounded-xl text-white placeholder-white/60 focus:ring-2 focus:ring-white/50 focus:border-white/50 backdrop-blur-sm text-sm"
                        placeholder="••••••••"
                        disabled={loading}
                      />
                      <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/60" />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white/80"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-white/90 text-sm font-medium mb-2">
                      تأكيد كلمة المرور
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={registerData.confirmPassword}
                        onChange={(e) => setRegisterData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        className="w-full pl-12 pr-12 py-3 bg-white/10 border border-white/30 rounded-xl text-white placeholder-white/60 focus:ring-2 focus:ring-white/50 focus:border-white/50 backdrop-blur-sm text-sm"
                        placeholder="••••••••"
                        disabled={loading}
                      />
                      <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/60" />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white/80"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-white text-gray-900 py-3 rounded-xl font-bold transition-all duration-300 hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl hover:shadow-2xl transform hover:scale-105"
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
                      جاري إنشاء الحساب...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <UserPlus className="w-4 h-4" />
                      إنشاء حساب جديد
                    </div>
                  )}
                </button>
              </form>
            )}

            {/* Toggle Mode */}
            <div className="mt-6 text-center">
              <p className="text-white/80 text-sm">
                {mode === 'login' ? 'ليس لديك حساب؟' : 'لديك حساب بالفعل؟'}
                <button
                  type="button"
                  onClick={() => {
                    setMode(mode === 'login' ? 'register' : 'login');
                    setError('');
                  }}
                  className="text-white font-medium mr-2 underline hover:text-white/80"
                >
                  {mode === 'login' ? 'إنشاء حساب جديد' : 'تسجيل الدخول'}
                </button>
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-8">
            <p className="text-white/60 text-sm">
              بالمتابعة، أنت توافق على شروط الاستخدام وسياسة الخصوصية
            </p>
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
      `}} />
    </div>
  );
};

export default CustomerSignIn; 