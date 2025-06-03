import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, User, Mail, Lock, ArrowLeft, Stethoscope, Shield } from 'lucide-react';
import { toast } from 'react-toastify';
import { apiCall, API_ENDPOINTS } from '../config/api';

const CustomerSignIn: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      toast.error('يرجى إدخال البريد الإلكتروني وكلمة المرور');
      return false;
    }

    if (!isLogin) {
      if (!formData.name) {
        toast.error('يرجى إدخال الاسم');
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        toast.error('كلمة المرور غير متطابقة');
        return false;
      }
      if (formData.password.length < 6) {
        toast.error('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
        return false;
      }
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('يرجى إدخال بريد إلكتروني صحيح');
      return false;
    }

    return true;
  };

  const migrateGuestCart = async (userId: string) => {
    try {
      console.log('🔄 [Auth] Starting cart migration for user:', userId);
      
      const response = await apiCall(API_ENDPOINTS.MIGRATE_CART, {
        method: 'POST',
        body: JSON.stringify({ userId: userId })
      });
      
      if (response.totalProcessed > 0) {
        toast.success(`🛒 تم نقل ${response.totalProcessed} منتج من سلة التسوق!`, {
          position: "top-center",
          autoClose: 3000,
        });
        console.log('✅ [Auth] Cart migration completed:', response);
      } else {
        console.log('ℹ️ [Auth] No items to migrate');
      }
      
      // Trigger cart update events
      window.dispatchEvent(new Event('cartUpdated'));
      localStorage.setItem('cartUpdated', Date.now().toString());
      
    } catch (error) {
      console.error('❌ [Auth] Cart migration failed:', error);
      // Don't show error to user as this is not critical
    }
  };

  const handleSuccessfulAuth = async (user: any, isNewUser: boolean = false) => {
    // Store user data
    localStorage.setItem('customerUser', JSON.stringify(user));
    localStorage.setItem('user', JSON.stringify(user));
    
    // Migrate guest cart if user has items
    await migrateGuestCart(user.id.toString());
    
    // Show success message
    if (isNewUser) {
      toast.success('🎉 تم إنشاء حسابك بنجاح! مرحباً بك في مواسم الطب');
    } else {
      toast.success('✅ مرحباً بك مرة أخرى!');
    }
    
    // Check if user should be redirected to checkout
    const redirectPath = localStorage.getItem('redirectAfterLogin');
    if (redirectPath) {
      localStorage.removeItem('redirectAfterLogin');
      console.log('🔄 [Auth] Redirecting to:', redirectPath);
      navigate(redirectPath);
    } else {
      navigate('/');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);

    try {
      if (isLogin) {
        const response = await apiCall(API_ENDPOINTS.CUSTOMER_LOGIN, {
          method: 'POST',
          body: JSON.stringify({
            email: formData.email,
            password: formData.password
          })
        });

        if (response.user) {
          await handleSuccessfulAuth(response.user, false);
        } else {
          // Handle specific error cases with user-friendly Arabic messages
          if (response.status === 401) {
            toast.error('البيانات المدخلة غير صحيحة. يرجى التحقق من البريد الإلكتروني وكلمة المرور');
          } else if (response.status === 409) {
            toast.error('البريد الإلكتروني مستخدم بالفعل');
          } else if (response.message?.includes('Network') || response.message?.includes('fetch')) {
            toast.error('لا يمكن الاتصال بالخادم. يرجى التحقق من اتصال الإنترنت');
          } else {
            toast.error(response.message || 'حدث خطأ في تسجيل الدخول');
          }
        }
      } else {
        const response = await apiCall(API_ENDPOINTS.CUSTOMER_REGISTER, {
          method: 'POST',
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            password: formData.password
          })
        });

        if (response.user) {
          await handleSuccessfulAuth(response.user, true);
        } else {
          if (response.status === 409) {
            toast.error('البريد الإلكتروني مستخدم بالفعل');
          } else if (response.message?.includes('Network') || response.message?.includes('fetch')) {
            toast.error('لا يمكن الاتصال بالخادم. يرجى التحقق من اتصال الإنترنت');
          } else {
            toast.error(response.message || 'حدث خطأ في إنشاء الحساب');
          }
        }
      }
    } catch (error) {
      console.error('Authentication error:', error);
      if (error instanceof Error) {
        if (error.message.includes('Network') || error.message.includes('fetch')) {
          toast.error('لا يمكن الاتصال بالخادم. يرجى التحقق من اتصال الإنترنت والمحاولة مرة أخرى');
        } else {
          toast.error('حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى');
        }
      } else {
        toast.error('حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى');
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleForm = () => {
    setIsLogin(!isLogin);
    setFormData({ name: '', email: '', password: '', confirmPassword: '' });
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-32">
      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <nav className="mb-4">
            <ol className="flex items-center space-x-2 space-x-reverse text-sm">
              <li>
                <Link to="/" className="text-blue-600 hover:text-blue-800">الرئيسية</Link>
              </li>
              <li className="text-gray-400">
                <ArrowLeft className="w-4 h-4" />
              </li>
              <li className="text-gray-600 font-medium">
                {isLogin ? 'تسجيل الدخول' : 'إنشاء حساب'}
              </li>
            </ol>
          </nav>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8">
          
          {/* Logo and Title */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Stethoscope className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {isLogin ? 'تسجيل الدخول' : 'إنشاء حساب جديد'}
            </h1>
            <p className="text-gray-600">
              {isLogin 
                ? 'مرحباً بك في مواسم الطب' 
                : 'انضم إلى مجتمع مواسم الطب'
              }
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Name Field (Register only) */}
            {!isLogin && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  الاسم الكامل
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full pl-4 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    placeholder="أدخل اسمك الكامل"
                    required={!isLogin}
                  />
                  <User className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                البريد الإلكتروني
              </label>
              <div className="relative">
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-4 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  placeholder="example@email.com"
                  required
                />
                <Mail className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                كلمة المرور
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  placeholder={isLogin ? 'أدخل كلمة المرور' : 'اختر كلمة مرور قوية'}
                  required
                />
                <Lock className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password Field (Register only) */}
            {!isLogin && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  تأكيد كلمة المرور
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    placeholder="أعد إدخال كلمة المرور"
                    required={!isLogin}
                  />
                  <Lock className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors duration-200 flex items-center justify-center gap-2 ${
                loading
                  ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-gray-700 border-t-transparent rounded-full animate-spin"></div>
                  جاري المعالجة...
                </>
              ) : (
                <>
                  <User className="w-5 h-5" />
                  {isLogin ? 'تسجيل الدخول' : 'إنشاء حساب'}
                </>
              )}
            </button>
          </form>

          {/* Toggle Form */}
          <div className="mt-6 pt-6 border-t border-gray-200 text-center">
            <p className="text-gray-600 mb-4">
              {isLogin ? 'ليس لديك حساب؟' : 'لديك حساب بالفعل؟'}
            </p>
            <button
              onClick={toggleForm}
              className="text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200"
            >
              {isLogin ? 'إنشاء حساب جديد' : 'تسجيل الدخول'}
            </button>
          </div>

          {/* Security Notice */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Shield className="w-4 h-4 text-green-600" />
              <span>بياناتك محمية بأعلى معايير الأمان</span>
            </div>
          </div>

          {/* Back to Home */}
          <div className="mt-6 text-center">
            <Link
              to="/"
              className="text-gray-600 hover:text-gray-800 text-sm transition-colors duration-200 flex items-center justify-center gap-1"
            >
              <ArrowLeft className="w-4 h-4" />
              العودة للرئيسية
            </Link>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 leading-relaxed">
            بتسجيلك موافق على 
            <Link to="/terms" className="text-blue-600 hover:text-blue-800 mx-1">شروط الاستخدام</Link>
            و
            <Link to="/privacy" className="text-blue-600 hover:text-blue-800 mx-1">سياسة الخصوصية</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default CustomerSignIn; 