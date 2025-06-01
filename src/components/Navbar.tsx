import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Menu, X, ShoppingCart, Heart, User, LogOut, Search, Package, Settings, Phone, Mail, MapPin, Clock, ChevronDown, Home, Grid3X3, Star, Award, Truck, Shield, Sparkles, Bell, ChevronLeft, Stethoscope, Plus, Activity } from 'lucide-react';
import logo from '../assets/logo.png';
import { createCategorySlug } from '../utils/slugify';
import { apiCall, API_ENDPOINTS, buildImageUrl } from '../config/api';

interface CartItem {
  id: number;
  productId: number;
  quantity: number;
}

interface Category {
  id: number;
  name: string;
  description: string;
  image: string;
}

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [cartItemsCount, setCartItemsCount] = useState<number>(0);
  const [wishlistItemsCount, setWishlistItemsCount] = useState<number>(0);
  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('cachedCategories');
    try {
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [user, setUser] = useState<any>(null);
  const [adminUser, setAdminUser] = useState<any>(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    const adminData = localStorage.getItem('adminUser');
    
    if (userData) {
      setUser(JSON.parse(userData));
    }
    if (adminData) {
      setAdminUser(JSON.parse(adminData));
    }
  }, [location]);

  useEffect(() => {
    fetchCartCount();
    fetchWishlistCount();
    fetchCategories();
    
    // إضافة مستمعين أكثر للأحداث لضمان دقة العداد
    const handleCartUpdate = () => {
      console.log('🔄 [Navbar] Cart update event received');
      fetchCartCount();
    };
    
    const handleWishlistUpdate = () => {
      console.log('🔄 [Navbar] Wishlist update event received');
      fetchWishlistCount();
    };
    
    const handleCategoriesUpdate = () => fetchCategories();
    
    // استماع لكل الأحداث المختلفة من cartUtils
    const cartEvents = [
      'cartUpdated',
      'productAddedToCart',
      'cartCountChanged',
      'forceCartUpdate'
    ];
    
    const wishlistEvents = [
      'wishlistUpdated',
      'productAddedToWishlist',
      'productRemovedFromWishlist'
    ];
    
    // إضافة مستمعين للأحداث
    cartEvents.forEach(event => {
      window.addEventListener(event, handleCartUpdate);
    });
    
    wishlistEvents.forEach(event => {
      window.addEventListener(event, handleWishlistUpdate);
    });
    
    window.addEventListener('categoriesUpdated', handleCategoriesUpdate);
    
    // استماع للتغييرات في localStorage أيضاً
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'cartUpdated' || e.key === 'lastCartUpdate' || e.key === 'forceCartRefresh') {
        console.log('🔄 [Navbar] Storage cart update detected');
        handleCartUpdate();
      }
      if (e.key === 'wishlistUpdated' || e.key === 'lastWishlistUpdate') {
        console.log('🔄 [Navbar] Storage wishlist update detected');
        handleWishlistUpdate();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // تحديث فوري من localStorage للمستخدم الحالي
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user?.id) {
      const savedCartCount = localStorage.getItem(`cartCount_${user.id}`);
      const savedWishlistCount = localStorage.getItem(`wishlistCount_${user.id}`);
      
      if (savedCartCount) {
        setCartItemsCount(parseInt(savedCartCount));
      }
      if (savedWishlistCount) {
        setWishlistItemsCount(parseInt(savedWishlistCount));
      }
    }
    
    return () => {
      // إزالة جميع المستمعين
      cartEvents.forEach(event => {
        window.removeEventListener(event, handleCartUpdate);
      });
      
      wishlistEvents.forEach(event => {
        window.removeEventListener(event, handleWishlistUpdate);
      });
      
      window.removeEventListener('categoriesUpdated', handleCategoriesUpdate);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const fetchCartCount = async () => {
    try {
      const userData = localStorage.getItem('user');
      if (!userData) {
        setCartItemsCount(0);
        localStorage.setItem('lastCartCount', '0');
        return;
      }
      
      const user = JSON.parse(userData);
      if (!user?.id) {
        setCartItemsCount(0);
        localStorage.setItem('lastCartCount', '0');
        return;
      }
      
      console.log('🔄 [Navbar] Fetching cart count for user:', user.id);
      const data = await apiCall(API_ENDPOINTS.USER_CART(user.id));
      const totalItems = data.reduce((sum: number, item: any) => sum + item.quantity, 0);
      
      console.log('📊 [Navbar] Cart count fetched:', totalItems);
      setCartItemsCount(totalItems);
      
      // حفظ العداد في localStorage بنفس طريقة cartUtils
      localStorage.setItem('lastCartCount', totalItems.toString());
      localStorage.setItem(`cartCount_${user.id}`, totalItems.toString());
      
      console.log('💾 [Navbar] Cart count saved to localStorage:', totalItems);
    } catch (error) {
      console.error('❌ [Navbar] Error fetching cart count:', error);
      setCartItemsCount(0);
      localStorage.setItem('lastCartCount', '0');
    }
  };

  const fetchWishlistCount = async () => {
    try {
      const userData = localStorage.getItem('user');
      if (!userData) {
        setWishlistItemsCount(0);
        localStorage.setItem('lastWishlistCount', '0');
        return;
      }
      
      const user = JSON.parse(userData);
      if (!user?.id) {
        setWishlistItemsCount(0);
        localStorage.setItem('lastWishlistCount', '0');
        return;
      }
      
      console.log('🔄 [Navbar] Fetching wishlist count for user:', user.id);
      const data = await apiCall(API_ENDPOINTS.USER_WISHLIST(user.id));
      const totalItems = data.length;
      
      console.log('📊 [Navbar] Wishlist count fetched:', totalItems);
      setWishlistItemsCount(totalItems);
      
      // حفظ العداد في localStorage
      localStorage.setItem('lastWishlistCount', totalItems.toString());
      localStorage.setItem(`wishlistCount_${user.id}`, totalItems.toString());
      
      console.log('💾 [Navbar] Wishlist count saved to localStorage:', totalItems);
    } catch (error) {
      console.error('❌ [Navbar] Error fetching wishlist count:', error);
      setWishlistItemsCount(0);
      localStorage.setItem('lastWishlistCount', '0');
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await apiCall(API_ENDPOINTS.CATEGORIES);
      setCategories(data);
      localStorage.setItem('cachedCategories', JSON.stringify(data));
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const isActive = (path: string) => location.pathname === path;

  const handleLoginSuccess = (userData: any) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    
    // حفظ بيانات إضافية لاستخدامها في الـ Checkout
    const checkoutData = {
      name: userData.name,
      phone: userData.phone || '',
      city: userData.city || '',
      email: userData.email,
      userId: userData.id
    };
    localStorage.setItem('userCheckoutData', JSON.stringify(checkoutData));
    console.log('💾 Checkout data saved for smooth experience:', checkoutData);
    
    // تحديث العدادات فوراً للمستخدم الجديد
    fetchCartCount();
    fetchWishlistCount();
    
    console.log('✅ User logged in successfully:', userData);
    toast.success(`مرحباً بك ${userData.name}!`);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('userCheckoutData');
    
    // إعادة تعيين العدادات
    setCartItemsCount(0);
    setWishlistItemsCount(0);
    localStorage.setItem('lastCartCount', '0');
    localStorage.setItem('lastWishlistCount', '0');
    
    setIsUserMenuOpen(false);
    toast.success('تم تسجيل الخروج بنجاح', {
      position: "top-center",
      autoClose: 2000,
      style: {
        background: 'linear-gradient(135deg, #1e3a8a, #1d4ed8)',
        color: 'white',
        fontWeight: 'bold'
      }
    });
    
    // توجيه للصفحة الرئيسية
    navigate('/');
  };

  const handleAdminLogout = () => {
    // مسح بيانات الأدمن فقط
    localStorage.removeItem('adminUser');
    setAdminUser(null);
    
    toast.success('تم تسجيل خروج المدير بنجاح', {
      position: "top-center",
      autoClose: 2000,
      style: {
        background: 'linear-gradient(135deg, #dc2626, #991b1b)',
        color: 'white',
        fontWeight: 'bold'
      }
    });
    
    navigate('/');
  };

  const navigateToSignIn = () => {
    navigate('/sign-in');
    setIsMenuOpen(false);
  };

  const handleCartClick = () => {
    if (!user) {
      toast.info('يرجى تسجيل الدخول لعرض السلة', {
        position: "top-center",
        autoClose: 3000,
        style: {
          background: 'linear-gradient(135deg, #1e3a8a, #1d4ed8)',
          color: 'white',
          fontWeight: 'bold'
        }
      });
      navigate('/sign-in');
      return;
    }
    navigate('/cart');
  };

  const handleWishlistClick = () => {
    if (!user) {
      toast.info('يرجى تسجيل الدخول لعرض المفضلة', {
        position: "top-center",
        autoClose: 3000,
        style: {
          background: 'linear-gradient(135deg, #1e3a8a, #1d4ed8)',
          color: 'white',
          fontWeight: 'bold'
        }
      });
      navigate('/sign-in');
      return;
    }
    navigate('/wishlist');
  };

  return (
    <>
      <nav className="bg-gradient-header shadow-nav sticky top-0 z-50 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link 
              to="/" 
              className="flex items-center space-x-3 group"
              onClick={() => setIsMenuOpen(false)}
            >
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center shadow-button transform group-hover:scale-105 transition-all duration-300">
                  <Stethoscope className="w-7 h-7 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-accent-emerald rounded-full flex items-center justify-center">
                  <Plus className="w-2 h-2 text-white" />
                </div>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
                  مواسم الطب
                </h1>
                <p className="text-xs text-gray-300 font-medium">
                  أدوات طبية متخصصة
                </p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-8">
              <Link 
                to="/" 
                className="text-white hover:text-blue-200 transition-colors duration-200 font-medium px-4 py-2 rounded-lg hover:bg-white/10"
              >
                الرئيسية
              </Link>
              <Link 
                to="/products" 
                className="text-white hover:text-blue-200 transition-colors duration-200 font-medium px-4 py-2 rounded-lg hover:bg-white/10 flex items-center gap-2"
              >
                <Package className="w-4 h-4" />
                المنتجات
              </Link>
              <Link 
                to="/about" 
                className="text-white hover:text-blue-200 transition-colors duration-200 font-medium px-4 py-2 rounded-lg hover:bg-white/10"
              >
                عن الشركة
              </Link>
              <Link 
                to="/contact" 
                className="text-white hover:text-blue-200 transition-colors duration-200 font-medium px-4 py-2 rounded-lg hover:bg-white/10"
              >
                التواصل
              </Link>
            </div>

            {/* User Actions */}
            <div className="flex items-center space-x-4">
              {/* Search Button */}
              <button className="p-2 text-white hover:text-blue-200 hover:bg-white/10 rounded-lg transition-all duration-200">
                <Search className="w-5 h-5" />
              </button>

              {/* Wishlist */}
              {user && (
                <button 
                  onClick={handleWishlistClick}
                  className="relative p-2 text-white hover:text-red-300 hover:bg-white/10 rounded-lg transition-all duration-200 group"
                >
                  <Heart className="w-5 h-5 group-hover:fill-current" />
                  {wishlistItemsCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-accent-red text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold animate-pulse">
                      {wishlistItemsCount}
                    </span>
                  )}
                </button>
              )}

              {/* Shopping Cart */}
              <button 
                onClick={handleCartClick}
                className="relative p-2 text-white hover:text-emerald-300 hover:bg-white/10 rounded-lg transition-all duration-200 group"
              >
                <ShoppingCart className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                {cartItemsCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-accent-emerald text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold animate-pulse">
                    {cartItemsCount}
                  </span>
                )}
              </button>

              {/* User Menu */}
              <div className="relative">
                {user ? (
                  <div className="flex items-center space-x-3">
                    <div className="hidden sm:block text-right">
                      <p className="text-white font-semibold text-sm">
                        مرحباً، {user.name}
                      </p>
                      <p className="text-gray-300 text-xs">
                        عميل مسجل
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-accent-emerald rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-white" />
                      </div>
                      <button
                        onClick={handleLogout}
                        className="p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
                        title="تسجيل الخروج"
                      >
                        <LogOut className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : adminUser ? (
                  <div className="flex items-center space-x-3">
                    <div className="hidden sm:block text-right">
                      <p className="text-white font-semibold text-sm">
                        {adminUser.name}
                      </p>
                      <p className="text-amber-300 text-xs font-medium">
                        مدير النظام
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center">
                        <Shield className="w-4 h-4 text-white" />
                      </div>
                      <Link
                        to="/dashboard"
                        className="p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
                        title="لوحة الإدارة"
                      >
                        <Activity className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={handleAdminLogout}
                        className="p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
                        title="تسجيل خروج المدير"
                      >
                        <LogOut className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Link
                      to="/sign-in"
                      className="bg-gradient-button text-white px-6 py-2 rounded-lg hover:shadow-button transition-all duration-300 transform hover:scale-105 font-medium"
                    >
                      تسجيل الدخول
                    </Link>
                    <Link
                      to="/login"
                      className="bg-white/10 text-white px-4 py-2 rounded-lg hover:bg-white/20 transition-all duration-200 font-medium border border-white/20"
                    >
                      الإدارة
                    </Link>
                  </div>
                )}
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden p-2 text-white hover:text-blue-200 hover:bg-white/10 rounded-lg transition-all duration-200"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden py-4 border-t border-white/10">
          <div className="space-y-2">
            <Link 
              to="/" 
              className="block text-white hover:text-blue-200 transition-colors duration-200 font-medium px-4 py-3 rounded-lg hover:bg-white/10"
              onClick={() => setIsMenuOpen(false)}
            >
              الرئيسية
            </Link>
            <Link 
              to="/products" 
              className="block text-white hover:text-blue-200 transition-colors duration-200 font-medium px-4 py-3 rounded-lg hover:bg-white/10"
              onClick={() => setIsMenuOpen(false)}
            >
              المنتجات
            </Link>
            <Link 
              to="/about" 
              className="block text-white hover:text-blue-200 transition-colors duration-200 font-medium px-4 py-3 rounded-lg hover:bg-white/10"
              onClick={() => setIsMenuOpen(false)}
            >
              عن الشركة
            </Link>
            <Link 
              to="/contact" 
              className="block text-white hover:text-blue-200 transition-colors duration-200 font-medium px-4 py-3 rounded-lg hover:bg-white/10"
              onClick={() => setIsMenuOpen(false)}
            >
              التواصل
            </Link>

            {/* Mobile User Actions */}
            {user && (
              <div className="border-t border-white/10 pt-4 mt-4">
                <div className="px-4 py-2">
                  <p className="text-white font-semibold">{user.name}</p>
                  <p className="text-gray-300 text-sm">عميل مسجل</p>
                </div>
                <button 
                  onClick={() => {
                    handleWishlistClick();
                    setIsMenuOpen(false);
                  }}
                  className="w-full text-right text-white hover:text-red-300 transition-colors duration-200 font-medium px-4 py-3 rounded-lg hover:bg-white/10 flex items-center justify-between"
                >
                  <span>المفضلة</span>
                  <div className="flex items-center">
                    {wishlistItemsCount > 0 && (
                      <span className="bg-accent-red text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold mr-2">
                        {wishlistItemsCount}
                      </span>
                    )}
                    <Heart className="w-4 h-4" />
                  </div>
                </button>
                <button 
                  onClick={() => {
                    handleCartClick();
                    setIsMenuOpen(false);
                  }}
                  className="w-full text-right text-white hover:text-emerald-300 transition-colors duration-200 font-medium px-4 py-3 rounded-lg hover:bg-white/10 flex items-center justify-between"
                >
                  <span>السلة</span>
                  <div className="flex items-center">
                    {cartItemsCount > 0 && (
                      <span className="bg-accent-emerald text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold mr-2">
                        {cartItemsCount}
                      </span>
                    )}
                    <ShoppingCart className="w-4 h-4" />
                  </div>
                </button>
                <button 
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="w-full text-right text-white hover:text-red-300 transition-colors duration-200 font-medium px-4 py-3 rounded-lg hover:bg-white/10 flex items-center justify-between"
                >
                  <span>تسجيل الخروج</span>
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}

            {adminUser && (
              <div className="border-t border-white/10 pt-4 mt-4">
                <div className="px-4 py-2">
                  <p className="text-white font-semibold">{adminUser.name}</p>
                  <p className="text-amber-300 text-sm">مدير النظام</p>
                </div>
                <Link 
                  to="/dashboard" 
                  className="block text-white hover:text-blue-200 transition-colors duration-200 font-medium px-4 py-3 rounded-lg hover:bg-white/10"
                  onClick={() => setIsMenuOpen(false)}
                >
                  لوحة الإدارة
                </Link>
                <button 
                  onClick={() => {
                    handleAdminLogout();
                    setIsMenuOpen(false);
                  }}
                  className="w-full text-right text-white hover:text-red-300 transition-colors duration-200 font-medium px-4 py-3 rounded-lg hover:bg-white/10 flex items-center justify-between"
                >
                  <span>تسجيل خروج المدير</span>
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default Navbar;