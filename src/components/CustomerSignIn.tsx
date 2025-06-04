import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Eye, EyeOff, User, Mail, Lock, UserPlus, LogIn, Star, Shield, Crown, Sparkles } from 'lucide-react';
import { buildImageUrl, API_ENDPOINTS } from '../config/api';

const CustomerSignIn: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    const user = localStorage.getItem('user') || localStorage.getItem('customerUser');
    if (user) {
      const redirectPath = localStorage.getItem('redirectAfterAuth') || '/';
      localStorage.removeItem('redirectAfterAuth');
      navigate(redirectPath);
    }
  }, [navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      toast.error('🚨 يرجى ملء جميع الحقول المطلوبة');
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast.error('📧 يرجى إدخال بريد إلكتروني صحيح');
      return false;
    }

    if (formData.password.length < 6) {
      toast.error('🔒 يجب أن تكون كلمة المرور 6 أحرف على الأقل');
      return false;
    }

    if (isSignUp) {
      if (!formData.name) {
        toast.error('👤 يرجى إدخال اسمك الكامل');
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        toast.error('🔐 كلمتا المرور غير متطابقتين');
        return false;
      }
    }

    return true;
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      console.log('🔐 [SignIn] Attempting login with:', { email: formData.email });
      
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      });

      console.log('🔐 [SignIn] Response status:', response.status);
      const data = await response.json();
      console.log('🔐 [SignIn] Response data:', data);

      if (response.ok && data.user) {
        // حفظ بيانات المستخدم
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('customerUser', JSON.stringify(data.user));
        
        console.log('✅ [SignIn] Login successful:', data.user);
        
        // إضافة رسالة ترحيب جميلة
        toast.success(`🎉 أهلاً وسهلاً بك ${data.user.name || data.user.email}! تم تسجيل الدخول بنجاح`, {
          position: "top-center",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });

        // نقل سلة الضيف إلى حساب المستخدم
        await migrateGuestCart();
        
        // التوجه للصفحة المطلوبة
        const redirectPath = localStorage.getItem('redirectAfterAuth') || '/';
        localStorage.removeItem('redirectAfterAuth');
        
        setTimeout(() => {
          navigate(redirectPath);
        }, 1500);
        
      } else {
        console.error('❌ [SignIn] Login failed:', data);
        
        if (response.status === 401) {
          toast.error('🚫 البريد الإلكتروني أو كلمة المرور غير صحيحة');
        } else if (response.status === 404) {
          toast.error('👤 هذا الحساب غير موجود، يرجى إنشاء حساب جديد');
        } else {
          toast.error(`⚠️ ${data.message || 'خطأ في تسجيل الدخول، يرجى المحاولة مرة أخرى'}`);
        }
      }
    } catch (error) {
      console.error('❌ [SignIn] Network error:', error);
      toast.error('🌐 خطأ في الاتصال بالخادم، يرجى التحقق من الإنترنت والمحاولة مرة أخرى');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      console.log('📝 [SignUp] Attempting registration with:', { 
        name: formData.name, 
        email: formData.email 
      });
      
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password
        })
      });

      console.log('📝 [SignUp] Response status:', response.status);
      const data = await response.json();
      console.log('📝 [SignUp] Response data:', data);

      if (response.ok && data.user) {
        // حفظ بيانات المستخدم الجديد
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('customerUser', JSON.stringify(data.user));
        
        console.log('✅ [SignUp] Registration successful:', data.user);
        
        // رسالة ترحيب للعضو الجديد
        toast.success(`🎊 مرحباً بك في مواسم الطب ${data.user.name}! تم إنشاء حسابك بنجاح وأصبحت عضواً VIP`, {
          position: "top-center",
          autoClose: 4000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });

        // نقل سلة الضيف إلى الحساب الجديد
        await migrateGuestCart();
        
        // التوجه للصفحة المطلوبة
        const redirectPath = localStorage.getItem('redirectAfterAuth') || '/';
        localStorage.removeItem('redirectAfterAuth');
        
        setTimeout(() => {
          navigate(redirectPath);
        }, 2000);
        
      } else {
        console.error('❌ [SignUp] Registration failed:', data);
        
        if (response.status === 409 || response.status === 400) {
          if (data.message && data.message.includes('exists')) {
            toast.error('📧 هذا البريد الإلكتروني مُسجل مسبقاً، يرجى تسجيل الدخول أو استخدام بريد آخر');
          } else {
            toast.error('⚠️ البيانات المدخلة غير صحيحة، يرجى التحقق منها');
          }
        } else if (response.status >= 500) {
          toast.error('🔧 خطأ في الخادم، يرجى المحاولة لاحقاً');
        } else {
          toast.error(`⚠️ ${data.message || 'خطأ في إنشاء الحساب، يرجى المحاولة مرة أخرى'}`);
        }
      }
    } catch (error) {
      console.error('❌ [SignUp] Network error:', error);
      
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        toast.error('🌐 لا يمكن الاتصال بالخادم، يرجى التحقق من الإنترنت');
      } else {
        toast.error('💥 حدث خطأ غير متوقع، يرجى المحاولة في وقت لاحق');
      }
    } finally {
      setLoading(false);
    }
  };

  const migrateGuestCart = async () => {
    try {
      console.log('🔄 [Migration] Starting cart migration...');
      
      const userData = localStorage.getItem('user');
      if (!userData) {
        console.log('❌ [Migration] No user data found');
        return;
      }
      
      const user = JSON.parse(userData);
      
      console.log('📊 [Migration] Migration for user:', user.id);
      
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/migrate-cart`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          guestId: 'guest',
          userId: user.id 
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ [Migration] Cart migrated successfully:', result);
        
        // جلب السلة الجديدة فوراً
        const cartResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/user/${user.id}/cart`);
        if (cartResponse.ok) {
          const cartData = await cartResponse.json();
          const totalCount = cartData.reduce((sum: number, item: any) => sum + item.quantity, 0);
          const totalValue = cartData.reduce((sum: number, item: any) => sum + (item.price || item.product?.price || 0) * item.quantity, 0);
          
          // حفظ القيم الجديدة
          localStorage.setItem('lastCartCount', totalCount.toString());
          localStorage.setItem('lastCartValue', totalValue.toString());
          
          console.log('💰 [Migration] New cart totals:', {
            count: totalCount,
            value: totalValue
          });
          
          // إرسال تحديثات فورية
          window.dispatchEvent(new CustomEvent('cartUpdated', {
            detail: { newCount: totalCount, newValue: totalValue }
          }));
          window.dispatchEvent(new CustomEvent('forceCartUpdate', {
            detail: { newCount: totalCount, newValue: totalValue }
          }));
          
          // رسالة نجاح
          if (totalCount > 0) {
            toast.success(`🛒 تم نقل ${totalCount} منتج بقيمة ${totalValue.toFixed(2)} ر.س`, {
              position: "top-center",
              autoClose: 3000,
            });
          }
        }
      } else {
        console.error('❌ [Migration] Migration failed:', await response.text());
      }
    } catch (error) {
      console.error('❌ [Migration] Error migrating cart:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-rose-50 to-pink-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23e11d48%22%20fill-opacity%3D%220.03%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%224%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50"></div>
      
      <div className="max-w-lg w-full space-y-8 relative">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-20 w-20 bg-gradient-to-br from-red-600 to-rose-600 rounded-2xl flex items-center justify-center shadow-2xl mb-6">
            <div className="text-white">
              {isSignUp ? (
                <UserPlus className="h-10 w-10" />
              ) : (
                <LogIn className="h-10 w-10" />
              )}
            </div>
          </div>
          
          <h2 className="text-3xl font-black text-gray-900 mb-3">
            {isSignUp ? 'انضم إلى مواسم الطب' : 'أهلاً بعودتك'}
          </h2>
          
          <p className="text-gray-600 text-lg">
            {isSignUp ? (
              <>
                <span className="flex items-center justify-center gap-2 mb-2">
                  <Crown className="w-5 h-5 text-yellow-500" />
                  <span className="font-semibold text-red-600">عضوية VIP مجانية</span>
                  <Crown className="w-5 h-5 text-yellow-500" />
                </span>
                <span className="text-sm">أنشئ حسابك واحصل على مزايا حصرية</span>
              </>
            ) : (
              'سجل دخولك للوصول إلى حسابك'
            )}
          </p>
        </div>

        {/* VIP Benefits - Only show for sign up */}
        {isSignUp && (
          <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-yellow-200 rounded-2xl p-4 mb-6">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-yellow-600" />
              <h3 className="font-bold text-yellow-800">مزايا العضوية المجانية</h3>
              <Sparkles className="w-5 h-5 text-yellow-600" />
            </div>
            
            <div className="grid grid-cols-1 gap-2 text-sm">
              <div className="flex items-center gap-2 text-yellow-700">
                <Star className="w-4 h-4 text-yellow-500" />
                <span>خصومات حصرية على جميع المنتجات</span>
              </div>
              <div className="flex items-center gap-2 text-yellow-700">
                <Shield className="w-4 h-4 text-yellow-500" />
                <span>حفظ سلة التسوق والمفضلة</span>
              </div>
              <div className="flex items-center gap-2 text-yellow-700">
                <Crown className="w-4 h-4 text-yellow-500" />
                <span>خدمة عملاء VIP مخصصة</span>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <form className="mt-8 space-y-6" onSubmit={isSignUp ? handleSignUp : handleSignIn}>
          <div className="space-y-4">
            {/* Name Field - Sign Up Only */}
            {isSignUp && (
              <div>
                <label htmlFor="name" className="block text-sm font-bold text-gray-700 mb-2">
                  الاسم الكامل *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-red-400" />
                  </div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required={isSignUp}
                    value={formData.name}
                    onChange={handleInputChange}
                    className="appearance-none relative block w-full pr-10 pl-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:z-10 text-base bg-white/80 backdrop-blur-sm"
                    placeholder="أدخل اسمك الكامل"
                  />
                </div>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-2">
                البريد الإلكتروني *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-red-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="appearance-none relative block w-full pr-10 pl-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:z-10 text-base bg-white/80 backdrop-blur-sm"
                  placeholder="أدخل بريدك الإلكتروني"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-bold text-gray-700 mb-2">
                كلمة المرور *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-red-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete={isSignUp ? 'new-password' : 'current-password'}
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="appearance-none relative block w-full pr-10 pl-10 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:z-10 text-base bg-white/80 backdrop-blur-sm"
                  placeholder={isSignUp ? "أنشئ كلمة مرور قوية (6 أحرف على الأقل)" : "أدخل كلمة المرور"}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 left-0 pl-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password Field - Sign Up Only */}
            {isSignUp && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-bold text-gray-700 mb-2">
                  تأكيد كلمة المرور *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-red-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required={isSignUp}
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="appearance-none relative block w-full pr-10 pl-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:z-10 text-base bg-white/80 backdrop-blur-sm"
                    placeholder="أعد إدخال كلمة المرور"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-4 px-4 border border-transparent text-lg font-bold rounded-xl text-white bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
            >
              {loading ? (
                <div className="flex items-center gap-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>{isSignUp ? 'جاري إنشاء الحساب...' : 'جاري تسجيل الدخول...'}</span>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  {isSignUp ? (
                    <>
                      <UserPlus className="h-5 w-5" />
                      <span>إنشاء حساب VIP مجاني</span>
                    </>
                  ) : (
                    <>
                      <LogIn className="h-5 w-5" />
                      <span>تسجيل الدخول</span>
                    </>
                  )}
                </div>
              )}
            </button>
          </div>

          {/* Toggle Form */}
          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setFormData({ name: '', email: '', password: '', confirmPassword: '' });
              }}
              className="font-medium text-red-600 hover:text-red-500 text-base"
            >
              {isSignUp ? (
                <>
                  لديك حساب بالفعل؟{' '}
                  <span className="underline">سجل دخولك هنا</span>
                </>
              ) : (
                <>
                  لا تملك حساب؟{' '}
                  <span className="underline">انضم إلينا الآن مجاناً</span>
                </>
              )}
            </button>
          </div>

          {/* Back to Home */}
          <div className="text-center">
            <Link
              to="/"
              className="inline-flex items-center gap-2 font-medium text-gray-600 hover:text-gray-900 text-sm"
            >
              <span>العودة للرئيسية</span>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomerSignIn;