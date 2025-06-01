import { useState, FormEvent, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, User, AlertCircle, UserPlus, LogIn, RefreshCw, Heart, Star, Sparkles, Key, ArrowRight } from 'lucide-react';
import { toast } from 'react-toastify';
import { apiCall, API_ENDPOINTS } from '../config/api';

const CustomerSignIn: React.FC = () => {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
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
  const [forgotData, setForgotData] = useState({
    email: ''
  });
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [resetSent, setResetSent] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    // إنشاء تأثير الجزيئات المتحركة في الخلفية
    const createParticles = () => {
      const container = document.querySelector('.customer-particles');
      if (!container) return;
      
      for (let i = 0; i < 60; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        
        const size = Math.random() * 10 + 2;
        const posX = Math.random() * 100;
        const delay = Math.random() * 12;
        const duration = Math.random() * 25 + 12;
        
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

    // منع الأدمن من تسجيل الدخول هنا
    if (loginData.email === 'admin' || loginData.email === 'admin@admin') {
      setError('🚫 هذه الصفحة للعملاء فقط. الإدارة لها نظام منفصل.');
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
        setError('🚫 هذه الصفحة للعملاء فقط. الإدارة لها نظام منفصل.');
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
      
      toast.success(`🎉 مرحباً بك ${data.user.name}!`, {
        position: "top-center",
        autoClose: 2000,
        style: {
          background: 'linear-gradient(135deg, #059669, #065F46)',
          color: 'white',
          fontWeight: 'bold',
          fontSize: '16px'
        }
      });
      
      setTimeout(() => {
        navigate('/'); // توجيه للصفحة الرئيسية فقط
      }, 500);
      
    } catch (error: any) {
      console.error('Login error:', error);
      
      // رسائل خطأ مفصلة ودقيقة
      if (error.message.includes('User not found') || error.message.includes('Invalid email')) {
        setError('❌ البريد الإلكتروني غير موجود في نظامنا');
      } else if (error.message.includes('Invalid password') || error.message.includes('Incorrect password')) {
        setError('❌ كلمة المرور غير صحيحة');
      } else if (error.message.includes('Invalid credentials')) {
        setError('❌ البيانات المدخلة غير صحيحة، تحقق من البريد وكلمة المرور');
      } else {
        setError(error.message || '❌ حدث خطأ في تسجيل الدخول، حاول مرة أخرى');
      }
      
      // تأثير اهتزاز عند الخطأ
      const form = document.querySelector('.customer-form');
      if (form) {
        form.classList.add('shake');
        setTimeout(() => form.classList.remove('shake'), 600);
      }
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
      setError('⚠️ يرجى إدخال جميع البيانات المطلوبة');
      setLoading(false);
      return;
    }

    // منع إنشاء حساب بـ email admin
    if (registerData.email === 'admin' || registerData.email === 'admin@admin') {
      setError('🚫 لا يمكن إنشاء حساب بهذا البريد الإلكتروني');
      setLoading(false);
      return;
    }

    if (registerData.password.length < 6) {
      setError('⚠️ كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      setLoading(false);
      return;
    }

    if (registerData.password !== registerData.confirmPassword) {
      setError('❌ كلمة المرور غير متطابقة');
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
      
      toast.success('🎉 تم إنشاء حسابك بنجاح!', {
        position: "top-center",
        autoClose: 2000,
        style: {
          background: 'linear-gradient(135deg, #059669, #065F46)',
          color: 'white',
          fontWeight: 'bold',
          fontSize: '16px'
        }
      });
      
      setTimeout(() => {
        navigate('/');
      }, 500);
      
    } catch (error: any) {
      console.error('Register error:', error);
      
      // رسائل خطأ مفصلة
      if (error.message.includes('Email already exists') || error.message.includes('User already exists')) {
        setError('❌ البريد الإلكتروني مستخدم بالفعل، جرب تسجيل الدخول أو استخدم بريد آخر');
      } else if (error.message.includes('Invalid email')) {
        setError('❌ تأكد من صحة البريد الإلكتروني');
      } else {
        setError(error.message || '❌ حدث خطأ في إنشاء الحساب، حاول مرة أخرى');
      }
      
      // تأثير اهتزاز عند الخطأ
      const form = document.querySelector('.customer-form');
      if (form) {
        form.classList.add('shake');
        setTimeout(() => form.classList.remove('shake'), 600);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!forgotData.email.trim()) {
      setError('⚠️ يرجى إدخال البريد الإلكتروني');
      setLoading(false);
      return;
    }

    try {
      // محاكاة إرسال بريد إعادة تعيين كلمة المرور
      // في التطبيق الحقيقي، هذا سيرسل طلب للخادم
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setResetSent(true);
      toast.success('✅ تم إرسال رابط إعادة تعيين كلمة المرور لبريدك الإلكتروني', {
        position: "top-center",
        autoClose: 4000,
        style: {
          background: 'linear-gradient(135deg, #3B82F6, #1E40AF)',
          color: 'white',
          fontWeight: 'bold',
          fontSize: '16px'
        }
      });
    } catch (error: any) {
      setError('❌ حدث خطأ في إرسال البريد، حاول مرة أخرى');
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
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-emerald-900 via-teal-800 to-cyan-900">
      {/* Particles Container */}
      <div className="customer-particles absolute inset-0 pointer-events-none"></div>
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '4s'}}></div>
      </div>
      
      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-lg">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="relative inline-block mb-6">
              <div className="w-24 h-24 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-full flex items-center justify-center mx-auto shadow-2xl animate-pulse border-4 border-white/20">
                {mode === 'login' ? (
                  <User className="w-12 h-12 text-white drop-shadow-lg" />
                ) : mode === 'register' ? (
                  <UserPlus className="w-12 h-12 text-white drop-shadow-lg" />
                ) : (
                  <Key className="w-12 h-12 text-white drop-shadow-lg" />
                )}
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center animate-bounce">
                <Heart className="w-4 h-4 text-white" />
              </div>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent mb-3 drop-shadow-lg">
              {mode === 'login' ? 'مرحباً بعودتك' : mode === 'register' ? 'انضم إلينا' : 'استرداد كلمة المرور'}
            </h1>
            <p className="text-white/80 text-lg font-medium">
              {mode === 'login' ? 'سجل دخولك واستمتع بتجربة تسوق مميزة' : 
               mode === 'register' ? 'أنشئ حساباً جديداً وابدأ رحلة التسوق' : 
               'سنساعدك في استرداد حسابك'}
            </p>
            <div className="flex items-center justify-center gap-2 mt-3">
              <Star className="w-5 h-5 text-emerald-400" />
              <span className="text-white/60 text-sm">منصة التسوق الموثوقة</span>
              <Star className="w-5 h-5 text-emerald-400" />
            </div>
          </div>

          {/* Form Container */}
          <div className="customer-form bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl relative overflow-hidden">
            {/* Decorative Elements */}
            <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-full -translate-y-16 -translate-x-16 blur-xl"></div>
            <div className="absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-tr from-cyan-500/20 to-emerald-500/20 rounded-full translate-y-12 translate-x-12 blur-xl"></div>
            
            {/* Error Message */}
            {error && (
              <div className="bg-red-500/20 border-2 border-red-500/40 rounded-xl p-4 mb-6 flex items-start animate-shake">
                <AlertCircle className="w-6 h-6 text-red-300 mr-3 mt-0.5 flex-shrink-0" />
                <p className="text-red-200 font-medium">{error}</p>
              </div>
            )}

            {/* Success Message for Password Reset */}
            {resetSent && mode === 'forgot' && (
              <div className="bg-green-500/20 border-2 border-green-500/40 rounded-xl p-4 mb-6 flex items-start animate-bounce-in">
                <Mail className="w-6 h-6 text-green-300 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-green-200 font-bold">تم الإرسال بنجاح!</p>
                  <p className="text-green-300 text-sm mt-1">تحقق من بريدك الإلكتروني واتبع الرابط لإعادة تعيين كلمة المرور</p>
                </div>
              </div>
            )}

            {/* Login Form */}
            {mode === 'login' && (
              <form onSubmit={handleLogin} className="space-y-6 relative z-10">
                {/* Email */}
                <div>
                  <label className="block text-white/90 text-sm font-bold mb-3 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-emerald-400" />
                    البريد الإلكتروني
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={loginData.email}
                      onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full pl-12 pr-4 py-4 bg-white/10 border-2 border-white/30 rounded-xl text-white placeholder-white/60 focus:ring-4 focus:ring-emerald-500/30 focus:border-emerald-400 backdrop-blur-sm transition-all duration-300 font-medium"
                      placeholder="أدخل بريدك الإلكتروني"
                      disabled={loading}
                    />
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-white/90 text-sm font-bold mb-3 flex items-center gap-2">
                    <Lock className="w-4 h-4 text-emerald-400" />
                    كلمة المرور
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={loginData.password}
                      onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                      className="w-full pl-12 pr-12 py-4 bg-white/10 border-2 border-white/30 rounded-xl text-white placeholder-white/60 focus:ring-4 focus:ring-emerald-500/30 focus:border-emerald-400 backdrop-blur-sm transition-all duration-300 font-medium"
                      placeholder="أدخل كلمة المرور"
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

                {/* Forgot Password Link */}
                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => setMode('forgot')}
                    className="text-white/80 hover:text-white text-sm font-medium underline transition-colors"
                  >
                    نسيت كلمة المرور؟
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white py-4 rounded-xl font-bold text-lg transition-all duration-300 hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 relative overflow-hidden"
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>جاري تسجيل الدخول...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-3">
                      <LogIn className="w-6 h-6" />
                      <span>تسجيل الدخول</span>
                    </div>
                  )}
                  
                  {/* Shimmer Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform translate-x-full group-hover:-translate-x-full transition-transform duration-1000"></div>
                </button>
              </form>
            )}

            {/* Register Form */}
            {mode === 'register' && (
              <form onSubmit={handleRegister} className="space-y-4 relative z-10">
                {/* Name */}
                <div>
                  <label className="block text-white/90 text-sm font-bold mb-2 flex items-center gap-2">
                    <User className="w-4 h-4 text-emerald-400" />
                    الاسم الكامل
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={registerData.name}
                      onChange={(e) => setRegisterData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full pl-12 pr-4 py-3 bg-white/10 border-2 border-white/30 rounded-xl text-white placeholder-white/60 focus:ring-4 focus:ring-emerald-500/30 focus:border-emerald-400 backdrop-blur-sm transition-all duration-300 font-medium text-sm"
                      placeholder="أحمد محمد"
                      disabled={loading}
                    />
                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/60" />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-white/90 text-sm font-bold mb-2 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-emerald-400" />
                    البريد الإلكتروني
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={registerData.email}
                      onChange={(e) => setRegisterData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full pl-12 pr-4 py-3 bg-white/10 border-2 border-white/30 rounded-xl text-white placeholder-white/60 focus:ring-4 focus:ring-emerald-500/30 focus:border-emerald-400 backdrop-blur-sm transition-all duration-300 font-medium text-sm"
                      placeholder="example@domain.com"
                      disabled={loading}
                    />
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/60" />
                  </div>
                </div>

                {/* Phone & City */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-white/90 text-sm font-bold mb-2">
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
                      className="w-full px-3 py-3 bg-white/10 border-2 border-white/30 rounded-xl text-white placeholder-white/60 focus:ring-4 focus:ring-emerald-500/30 focus:border-emerald-400 backdrop-blur-sm transition-all duration-300 font-medium text-sm"
                      placeholder="5XX XXX XXX"
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <label className="block text-white/90 text-sm font-bold mb-2">
                      المدينة
                    </label>
                    <input
                      type="text"
                      value={registerData.city}
                      onChange={(e) => setRegisterData(prev => ({ ...prev, city: e.target.value }))}
                      className="w-full px-3 py-3 bg-white/10 border-2 border-white/30 rounded-xl text-white placeholder-white/60 focus:ring-4 focus:ring-emerald-500/30 focus:border-emerald-400 backdrop-blur-sm transition-all duration-300 font-medium text-sm"
                      placeholder="الرياض"
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Passwords */}
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <label className="block text-white/90 text-sm font-bold mb-2 flex items-center gap-2">
                      <Lock className="w-4 h-4 text-emerald-400" />
                      كلمة المرور
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={registerData.password}
                        onChange={(e) => setRegisterData(prev => ({ ...prev, password: e.target.value }))}
                        className="w-full pl-12 pr-12 py-3 bg-white/10 border-2 border-white/30 rounded-xl text-white placeholder-white/60 focus:ring-4 focus:ring-emerald-500/30 focus:border-emerald-400 backdrop-blur-sm transition-all duration-300 font-medium text-sm"
                        placeholder="••••••••"
                        disabled={loading}
                      />
                      <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/60" />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white/80 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-white/90 text-sm font-bold mb-2">
                      تأكيد كلمة المرور
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={registerData.confirmPassword}
                        onChange={(e) => setRegisterData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        className="w-full pl-12 pr-12 py-3 bg-white/10 border-2 border-white/30 rounded-xl text-white placeholder-white/60 focus:ring-4 focus:ring-emerald-500/30 focus:border-emerald-400 backdrop-blur-sm transition-all duration-300 font-medium text-sm"
                        placeholder="••••••••"
                        disabled={loading}
                      />
                      <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/60" />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white/80 transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white py-3 rounded-xl font-bold transition-all duration-300 hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 relative overflow-hidden"
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      جاري إنشاء الحساب...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <UserPlus className="w-4 h-4" />
                      إنشاء حساب جديد
                    </div>
                  )}
                  
                  {/* Shimmer Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform translate-x-full group-hover:-translate-x-full transition-transform duration-1000"></div>
                </button>
              </form>
            )}

            {/* Forgot Password Form */}
            {mode === 'forgot' && (
              <form onSubmit={handleForgotPassword} className="space-y-6 relative z-10">
                <div className="text-center mb-6">
                  <p className="text-white/80 text-sm leading-relaxed">
                    أدخل بريدك الإلكتروني وسنرسل لك رابط لإعادة تعيين كلمة المرور
                  </p>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-white/90 text-sm font-bold mb-3 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-emerald-400" />
                    البريد الإلكتروني
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={forgotData.email}
                      onChange={(e) => setForgotData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full pl-12 pr-4 py-4 bg-white/10 border-2 border-white/30 rounded-xl text-white placeholder-white/60 focus:ring-4 focus:ring-emerald-500/30 focus:border-emerald-400 backdrop-blur-sm transition-all duration-300 font-medium"
                      placeholder="أدخل بريدك الإلكتروني المسجل"
                      disabled={loading || resetSent}
                    />
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || resetSent}
                  className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white py-4 rounded-xl font-bold text-lg transition-all duration-300 hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 relative overflow-hidden"
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>جاري الإرسال...</span>
                    </div>
                  ) : resetSent ? (
                    <div className="flex items-center justify-center gap-3">
                      <Mail className="w-6 h-6" />
                      <span>تم الإرسال</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-3">
                      <RefreshCw className="w-6 h-6" />
                      <span>إرسال رابط إعادة التعيين</span>
                    </div>
                  )}
                  
                  {/* Shimmer Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform translate-x-full group-hover:-translate-x-full transition-transform duration-1000"></div>
                </button>

                {resetSent && (
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => {
                        setResetSent(false);
                        setForgotData({ email: '' });
                      }}
                      className="text-white/80 hover:text-white text-sm font-medium underline transition-colors"
                    >
                      إرسال مرة أخرى
                    </button>
                  </div>
                )}
              </form>
            )}

            {/* Toggle Mode */}
            <div className="mt-6 text-center relative z-10">
              {mode === 'login' && (
                <p className="text-white/80 text-sm">
                  ليس لديك حساب؟
                  <button
                    type="button"
                    onClick={() => {
                      setMode('register');
                      setError('');
                    }}
                    className="text-white font-bold mr-2 underline hover:text-white/80 transition-colors"
                  >
                    إنشاء حساب جديد
                  </button>
                </p>
              )}
              
              {mode === 'register' && (
                <p className="text-white/80 text-sm">
                  لديك حساب بالفعل؟
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setError('');
                    }}
                    className="text-white font-bold mr-2 underline hover:text-white/80 transition-colors"
                  >
                    تسجيل الدخول
                  </button>
                </p>
              )}
              
              {mode === 'forgot' && (
                <p className="text-white/80 text-sm">
                  تذكرت كلمة المرور؟
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setError('');
                      setResetSent(false);
                      setForgotData({ email: '' });
                    }}
                    className="text-white font-bold mr-2 underline hover:text-white/80 transition-colors flex items-center gap-1 justify-center mt-2"
                  >
                    <ArrowRight className="w-4 h-4" />
                    العودة لتسجيل الدخول
                  </button>
                </p>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-8">
            <div className="flex items-center justify-center gap-4 text-white/50 text-sm">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                <span>تسوق آمن وموثوق</span>
              </div>
              <div className="w-1 h-1 bg-white/50 rounded-full"></div>
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4" />
                <span>خدمة عملاء متميزة</span>
              </div>
            </div>
            <p className="text-white/40 text-xs mt-3">
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
            animation: customerFloat linear infinite;
          }

          @keyframes customerFloat {
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

          @keyframes bounce-in {
            0% { transform: scale(0.3); opacity: 0; }
            50% { transform: scale(1.1); }
            70% { transform: scale(0.9); }
            100% { transform: scale(1); opacity: 1; }
          }

          .animate-bounce-in {
            animation: bounce-in 0.6s ease forwards;
          }
      `}} />
    </div>
  );
};

export default CustomerSignIn; 