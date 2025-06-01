import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Shield, Eye, EyeOff, Crown, Lock, Mail, ChevronDown, ChevronUp } from 'lucide-react';

const Login: React.FC = () => {
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showHelp, setShowHelp] = useState(false);
  const [isShaking, setIsShaking] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // التحقق من بيانات الأدمن المحددة مسبقاً
    if (credentials.email === 'admin' && credentials.password === '11111') {
      // إنشاء بيانات الأدمن
      const adminUser = {
        id: 1,
        name: 'مدير النظام',
        email: 'admin',
        role: 'admin',
        isAdmin: true,
        loginTime: new Date().toISOString()
      };

      // حفظ بيانات الأدمن
      localStorage.setItem('adminUser', JSON.stringify(adminUser));

      // رسالة نجاح
      toast.success('🎉 مرحباً بك مدير النظام!', {
        position: "top-center",
        autoClose: 2000,
        style: {
          background: 'linear-gradient(135deg, #dc2626, #991b1b)',
          color: 'white',
          fontWeight: 'bold',
          fontSize: '16px'
        }
      });

      // التوجه للوحة الإدارة
      setTimeout(() => {
        navigate('/admin');
      }, 1000);

    } else {
      // بيانات خاطئة
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);

      if (credentials.email !== 'admin') {
        setError('❌ اسم المستخدم غير صحيح');
      } else if (credentials.password !== '11111') {
        setError('❌ كلمة المرور غير صحيحة');
      } else {
        setError('❌ بيانات تسجيل الدخول غير صحيحة');
      }
    }

    setLoading(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-red-900 relative overflow-hidden">
      {/* Animated Background Particles */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white/20 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      <div className="min-h-screen flex items-center justify-center p-4 relative z-10">
        <div className={`w-full max-w-md transform transition-all duration-500 ${isShaking ? 'animate-bounce' : ''}`}>
          {/* Logo Section */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-red-500 to-purple-600 rounded-full mb-4 relative">
              <Crown className="w-10 h-10 text-white" />
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                <Shield className="w-3 h-3 text-yellow-800" />
              </div>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              لوحة إدارة مواسم الطب
            </h1>
            <p className="text-gray-400 text-sm mt-2">نظام إدارة متقدم للمنتجات الطبية</p>
          </div>

          {/* Main Form */}
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Email Field */}
              <div className="space-y-2">
                <label className="text-white font-semibold flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  اسم المستخدم
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="email"
                    value={credentials.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-4 bg-white/20 border border-white/30 rounded-xl text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                    placeholder="أدخل اسم المستخدم"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label className="text-white font-semibold flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  كلمة المرور
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={credentials.password}
                    onChange={handleInputChange}
                    className="w-full px-4 py-4 bg-white/20 border border-white/30 rounded-xl text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 pr-12"
                    placeholder="أدخل كلمة المرور"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-300 hover:text-white transition-colors duration-200"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-500/20 border border-red-500/40 rounded-xl p-4 text-red-200 text-center font-medium animate-pulse">
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-red-600 to-purple-600 hover:from-red-700 hover:to-purple-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-red-500/25"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>جاري تسجيل الدخول...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <Shield className="w-5 h-5" />
                    <span>دخول لوحة الإدارة</span>
                  </div>
                )}
              </button>
            </form>

            {/* Help Section */}
            <div className="mt-6">
              <button
                type="button"
                onClick={() => setShowHelp(!showHelp)}
                className="w-full flex items-center justify-center gap-2 text-gray-300 hover:text-white transition-colors duration-200 py-2 rounded-lg hover:bg-white/10"
              >
                <span className="text-sm">معلومات تسجيل الدخول</span>
                {showHelp ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              
              {showHelp && (
                <div className="mt-4 p-4 bg-white/5 rounded-xl border border-white/10">
                  <div className="text-gray-300 text-sm space-y-2">
                    <p className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-red-400" />
                      <span>هذه لوحة إدارة محمية</span>
                    </p>
                    <p className="text-gray-400">
                      تسجيل الدخول متاح للمديرين المصرحين فقط
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-6">
            <p className="text-gray-400 text-sm">
              © 2024 مواسم الطب. جميع الحقوق محفوظة
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;