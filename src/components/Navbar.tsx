import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, Heart, User, Menu, X, ChevronDown, Phone, Mail, Instagram, Facebook, Twitter, Stethoscope, Crown, Sparkles, Gem } from 'lucide-react';
import { toast } from 'react-toastify';
import { cartSyncManager } from '../utils/cartSync';

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [isCustomerLoggedIn, setIsCustomerLoggedIn] = useState(false);
  const [customerName, setCustomerName] = useState('');
  
  // إضافة state منفصل للعدادات لضمان التحديث الفوري
  const [cartItemsCount, setCartItemsCount] = useState(0);
  const [cartValue, setCartValue] = useState(0);
  const [wishlistItemsCount, setWishlistItemsCount] = useState(0);

  // Check for routes where navbar should be hidden
  const shouldShowNavbar = !location.pathname.startsWith('/admin') && location.pathname !== '/login';

  // تحديث السلة من الـ API
  const fetchCart = async () => {
    try {
      const userData = localStorage.getItem('user');
      let endpoint = '/api/cart?userId=guest';
      
      if (userData) {
        try {
          const user = JSON.parse(userData);
          if (user && user.id) {
            endpoint = `/api/user/${user.id}/cart`;
          }
        } catch (parseError) {
          console.error('Error parsing user data:', parseError);
        }
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}${endpoint}`);
      if (response.ok) {
        const cartData = await response.json();
        if (Array.isArray(cartData)) {
          setCartItems(cartData);
          const totalCount = cartData.reduce((sum, item) => sum + item.quantity, 0);
          const totalValue = cartData.reduce((sum, item) => sum + (item.price || item.product?.price || 0) * item.quantity, 0);
          
          setCartItemsCount(totalCount);
          setCartValue(totalValue);
          
          // حفظ العدد والقيمة في localStorage للاستخدام الفوري
          localStorage.setItem('lastCartCount', totalCount.toString());
          localStorage.setItem('lastCartValue', totalValue.toString());
          console.log('✅ [Navbar] Cart updated from API:', { count: totalCount, value: totalValue });
        }
      }
    } catch (error) {
      console.error('❌ [Navbar] Error fetching cart:', error);
    }
  }

  // تحديث المفضلة من الـ API
  const fetchWishlist = async () => {
    try {
      const userData = localStorage.getItem('user');
      let endpoint = '/api/wishlist?userId=guest';
      
      if (userData) {
        try {
          const user = JSON.parse(userData);
          if (user && user.id) {
            endpoint = `/api/user/${user.id}/wishlist`;
          }
        } catch (parseError) {
          console.error('Error parsing user data:', parseError);
        }
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}${endpoint}`);
      if (response.ok) {
        const wishlistData = await response.json();
        if (Array.isArray(wishlistData)) {
          setWishlistCount(wishlistData.length);
          setWishlistItemsCount(wishlistData.length);
          
          // حفظ العدد في localStorage للاستخدام الفوري
          localStorage.setItem('lastWishlistCount', wishlistData.length.toString());
          console.log('✅ [Navbar] Wishlist updated from API:', wishlistData.length);
        }
      }
    } catch (error) {
      console.error('❌ [Navbar] Error fetching wishlist:', error);
    }
  }

  useEffect(() => {
    console.log('🎯 [Navbar] Starting initialization...');
    
    // Initialize cart sync manager
    const unsubscribe = cartSyncManager.addUpdateListener(() => {
      const count = cartSyncManager.getCurrentCartCount();
      const value = cartSyncManager.getCurrentCartValue();
      
      setCartItemsCount(count);
      setCartValue(value);
      
      console.log('🔄 [Navbar] Cart updated via sync manager:', { count, value });
    });
    
    // تهيئة البيانات من localStorage أولاً (إذا كانت موجودة)
    const savedCount = localStorage.getItem('lastCartCount');
    const savedValue = localStorage.getItem('lastCartValue');
    
    if (savedCount) {
      const count = parseInt(savedCount);
      if (!isNaN(count)) {
        setCartItemsCount(count);
      }
    }
    
    if (savedValue) {
      const value = parseFloat(savedValue);
      if (!isNaN(value)) {
        setCartValue(value);
      }
    }
    
    // Initial sync with server
    cartSyncManager.syncWithServer().then(({ count, value }) => {
      setCartItemsCount(count);
      setCartValue(value);
      console.log('🚀 [Navbar] Initial sync completed:', { count, value });
    }).catch(error => {
      console.error('❌ [Navbar] Initial sync failed:', error);
      // في حالة فشل المزامنة، اعرض صفر
      setCartItemsCount(0);
      setCartValue(0);
    });
    
    // تحديث حالة تسجيل الدخول
    const customerData = localStorage.getItem('customerUser') || localStorage.getItem('user');
    if (customerData) {
      try {
        const customer = JSON.parse(customerData);
        setIsCustomerLoggedIn(true);
        setCustomerName(customer.name || customer.email);
        console.log('👤 [Navbar] User logged in:', customer.name || customer.email);
      } catch (error) {
        console.error('❌ [Navbar] Error parsing user data:', error);
        localStorage.removeItem('customerUser');
        localStorage.removeItem('user');
      }
    }

    // جلب البيانات الحديثة من الـ API
    console.log('🔄 [Navbar] Fetching fresh data from API...');
    fetchCart();
    fetchWishlist();

    // التعامل مع تحديثات السلة - معالج محسن مع لوغ
    const handleCartUpdate = (event?: Event) => {
      console.log('🔥 [Navbar] Cart update event received:', (event as CustomEvent)?.detail || 'No details');
      
      // تحديث فوري من localStorage إذا متوفر
      const savedCartCount = localStorage.getItem('lastCartCount');
      const savedCartValue = localStorage.getItem('lastCartValue');
      
      console.log('📦 [Navbar] Current localStorage values:', {
        count: savedCartCount,
        value: savedCartValue
      });
      
      if (savedCartCount !== null) {
        const count = parseInt(savedCartCount);
        if (!isNaN(count) && count !== cartItemsCount) {
          setCartItemsCount(count);
          console.log('✅ [Navbar] Cart count updated:', count);
        }
      }
      
      if (savedCartValue !== null) {
        const value = parseFloat(savedCartValue);
        if (!isNaN(value) && value !== cartValue) {
          setCartValue(value);
          console.log('💰 [Navbar] Cart value updated:', value);
        }
      }
      
      // جلب البيانات المحدثة من الـ API أيضاً (للتأكيد)
      fetchCart();
    };

    // التعامل مع تحديثات المفضلة - معالج محسن مع لوغ
    const handleWishlistUpdate = (event?: Event) => {
      console.log('💖 [Navbar] Wishlist update event received:', (event as CustomEvent)?.detail || 'No details');
      
      // تحديث فوري من localStorage إذا متوفر
      const savedWishlistCount = localStorage.getItem('lastWishlistCount');
      console.log('❤️ [Navbar] Current wishlist localStorage value:', savedWishlistCount);
      
      if (savedWishlistCount) {
        const count = parseInt(savedWishlistCount);
        console.log('⚡ [Navbar] Setting wishlist count immediately:', count);
        setWishlistItemsCount(count);
      }
      
      // جلب البيانات المحدثة من الـ API أيضاً (للتأكيد)
      fetchWishlist();
    };

    // إضافة معالجات الأحداث
    const allCartEvents = [
      'cartUpdated', 
      'productAddedToCart', 
      'cartCountChanged',
      'forceCartUpdate',
      'cartMigrated',
      'userCartLoaded',
      'cartItemRemoved',
      'cartItemUpdated'
    ];
    
    const allWishlistEvents = [
      'wishlistUpdated', 
      'productAddedToWishlist',
      'productRemovedFromWishlist',
      'forceWishlistUpdate'
    ];
    
    allCartEvents.forEach(eventName => {
      window.addEventListener(eventName, handleCartUpdate);
    });
    
    allWishlistEvents.forEach(eventName => {
      window.addEventListener(eventName, handleWishlistUpdate);
    });
    
    // معالج تغييرات localStorage
    const handleStorageChange = (e: StorageEvent) => {
      console.log('🗄️ [Navbar] Storage event received:', e.key, e.newValue);
      if (e.key === 'lastCartCount' || e.key === 'lastCartValue' || e.key === 'cartUpdated') {
        handleCartUpdate();
      }
      if (e.key === 'lastWishlistCount' || e.key === 'wishlistUpdated') {
        handleWishlistUpdate();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    console.log('✅ [Navbar] Storage event listener added');

    // تنظيف معالجات الأحداث
    return () => {
      unsubscribe();
      
      allCartEvents.forEach(eventName => {
        window.removeEventListener(eventName, handleCartUpdate);
      });
      
      allWishlistEvents.forEach(eventName => {
        window.removeEventListener(eventName, handleWishlistUpdate);
      });
      
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const handleLogout = async () => {
    localStorage.removeItem('customerUser');
    localStorage.removeItem('user');
    setIsCustomerLoggedIn(false);
    setCustomerName('');
    setIsUserMenuOpen(false);
    
    // Use cart sync manager for post-logout sync
    await cartSyncManager.syncAfterLogout();
    
    toast.success('تم تسجيل الخروج بنجاح');
    navigate('/');
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  }

  if (!shouldShowNavbar) {
    return null;
  }

  // استخدام العدادات المحدثة
  const totalCartItems = cartItemsCount;
  const totalCartValue = cartValue;

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      <header className="bg-white shadow-lg border-b border-gray-100">
        {/* Top Bar */}
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 py-2">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between text-white text-xs">
              <div className="flex items-center space-x-4 space-x-reverse">
                <div className="flex items-center gap-1">
                  <Phone className="w-3 h-3" />
                  <span className="font-medium">+966 50 123 4567</span>
                </div>
                <div className="hidden sm:flex items-center gap-1">
                  <Mail className="w-3 h-3" />
                  <span className="font-medium">info@mawasiem.com</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 space-x-reverse">
                <span className="hidden sm:block font-medium">تابعنا على:</span>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <a href="#" className="hover:text-yellow-300 transition-colors">
                    <Instagram className="w-3 h-3" />
                  </a>
                  <a href="#" className="hover:text-yellow-300 transition-colors">
                    <Facebook className="w-3 h-3" />
                  </a>
                  <a href="#" className="hover:text-yellow-300 transition-colors">
                    <Twitter className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Navbar */}
        <div className="bg-white shadow-lg">
          <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 xl:px-8">
            <div className="flex items-center justify-between h-12 sm:h-14 md:h-16 lg:h-18">
              
              {/* Mobile Menu Button - Right side */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                {isMenuOpen ? (
                  <X className="w-4 h-4 text-gray-600" />
                ) : (
                  <Menu className="w-4 h-4 text-gray-600" />
                )}
              </button>

              {/* Logo */}
              <Link to="/" className="flex items-center gap-1 sm:gap-2 md:gap-3">
                <div className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 bg-gradient-to-r from-red-600 to-rose-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg">
                  <Stethoscope className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl font-black bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">
                    مواسم الطب
                  </div>
                  <div className="text-xs text-gray-500 font-medium leading-tight hidden sm:block">
                    Medical Seasons
                  </div>
                </div>
              </Link>

              {/* Search Bar - Center (Hidden on mobile) */}
              <div className="hidden md:flex flex-1 max-w-lg mx-4 lg:mx-8">
                <form onSubmit={handleSearch} className="relative w-full">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="ابحث عن المنتجات الطبية..."
                    className="w-full px-3 lg:px-4 py-2 lg:py-3 pr-8 lg:pr-10 border-2 border-red-200 rounded-lg lg:rounded-xl focus:ring-2 focus:ring-red-100 focus:border-red-500 bg-gray-50 text-sm lg:text-base font-medium placeholder-gray-400 shadow-md"
                  />
                  <button
                    type="submit"
                    className="absolute right-2 lg:right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 lg:w-6 lg:h-6 bg-gradient-to-r from-red-600 to-rose-600 rounded-lg flex items-center justify-center text-white shadow-lg hover:shadow-xl transition-all"
                  >
                    <Search className="w-3 h-3 lg:w-4 lg:h-4" />
                  </button>
                </form>
              </div>

              {/* Action Buttons - Left */}
              <div className="flex items-center gap-1 sm:gap-2 md:gap-3">
                {/* Cart - تصميم بسيط ومُحسن */}
                <Link to="/cart" className="group relative">
                  <div className="flex items-center gap-2 p-2 sm:p-3 bg-gradient-to-r from-red-50 to-rose-50 rounded-lg sm:rounded-xl border border-red-200 hover:border-red-300 shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-105">
                    
                    {/* Cart Icon */}
                    <div className="relative">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-red-600 to-rose-600 rounded-lg flex items-center justify-center shadow-md">
                        <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                      </div>
                      
                      {/* Cart Count Badge */}
                      {totalCartItems > 0 && (
                        <div className="absolute -top-2 -right-2 min-w-[20px] h-5 sm:min-w-[24px] sm:h-6 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full flex items-center justify-center text-white text-xs sm:text-sm font-bold shadow-lg animate-pulse px-1"
                          data-cart-count>
                          {totalCartItems > 99 ? '99+' : totalCartItems}
                        </div>
                      )}
                    </div>
                    
                    {/* Cart Info */}
                    <div className="text-right min-w-0">
                      <div className="text-xs sm:text-sm text-gray-600 font-medium">
                        🛒 السلة
                      </div>
                      <div className="text-sm sm:text-base font-bold text-red-600">
                        {totalCartItems > 0 ? (
                          <span>{totalCartItems > 99 ? '99+' : totalCartItems} منتج</span>
                        ) : (
                          <span className="text-gray-400">فارغة</span>
                        )}
                      </div>
                      {totalCartValue > 0 && (
                        <div className="text-xs text-green-600 font-semibold">
                          {totalCartValue > 9999 
                            ? `${(totalCartValue/1000).toFixed(1)}K` 
                            : totalCartValue.toFixed(0)
                          } ر.س
                        </div>
                      )}
                    </div>
                  </div>
                </Link>

                {/* Wishlist - Hidden on very small screens */}
                <Link
                  to="/wishlist"
                  className="hidden sm:flex relative items-center gap-1 p-1.5 sm:p-2 bg-white border border-gray-200 rounded-lg hover:shadow-lg transition-all duration-300"
                >
                  <div className="relative">
                    <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 group-hover:text-red-600 transition-colors" />
                    {wishlistItemsCount > 0 && (
                      <div 
                        className="absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-gradient-to-r from-red-500 to-rose-600 rounded-full flex items-center justify-center text-white text-xs font-black"
                        data-wishlist-count
                      >
                        {wishlistItemsCount}
                      </div>
                    )}
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-gray-700 hidden md:block">المفضلة</span>
                </Link>

                {/* User Menu */}
                <div className="relative">
                  {isCustomerLoggedIn ? (
                    <div>
                      <button
                        onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                        className="group flex items-center gap-1 sm:gap-2 p-1.5 sm:p-2 bg-white border border-gray-200 rounded-lg hover:shadow-lg transition-all duration-300"
                      >
                        <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-r from-red-600 to-rose-600 rounded-lg flex items-center justify-center">
                          <User className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />
                        </div>
                        <div className="text-right hidden md:block">
                          <div className="text-xs font-bold text-gray-900 max-w-20 truncate">{customerName}</div>
                          <div className="text-xs text-red-600 font-medium">VIP</div>
                        </div>
                        <ChevronDown className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-gray-400 hidden md:block" />
                      </button>

                      {isUserMenuOpen && (
                        <div className="absolute left-0 mt-2 w-48 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 z-50">
                          <div className="px-3 py-2 border-b border-gray-100">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 bg-gradient-to-r from-red-600 to-rose-600 rounded-lg flex items-center justify-center">
                                <Crown className="w-3 h-3 text-white" />
                              </div>
                              <div>
                                <p className="font-bold text-gray-900 text-sm truncate">{customerName}</p>
                                <p className="text-xs text-red-600 font-semibold">عضو VIP</p>
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={handleLogout}
                            className="w-full text-right px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 transition-all"
                          >
                            تسجيل الخروج
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <Link
                      to="/sign-in"
                      className="group flex items-center gap-1 sm:gap-2 p-1.5 sm:p-2 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-lg hover:shadow-lg transition-all duration-300 font-semibold text-xs sm:text-sm"
                    >
                      <User className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="hidden sm:block">دخول</span>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Search Bar */}
          <div className="md:hidden px-2 pb-3">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث عن المنتجات..."
                className="w-full px-3 py-2 pr-8 border-2 border-red-200 rounded-lg focus:ring-2 focus:ring-red-100 focus:border-red-500 bg-white text-sm font-medium placeholder-gray-400 shadow-lg"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 w-6 h-6 bg-gradient-to-r from-red-600 to-rose-600 rounded-lg flex items-center justify-center text-white"
              >
                <Search className="w-3 h-3" />
              </button>
            </form>
          </div>

          {/* Navigation Menu - Hidden on mobile, shown on larger screens */}
          <div className="hidden md:block bg-gradient-to-r from-red-600 via-rose-600 to-red-700 shadow-xl">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-center h-10 lg:h-12">
                <nav className="flex items-center space-x-1 space-x-reverse">
                  <Link 
                    to="/products" 
                    className="group px-3 py-1.5 lg:px-4 lg:py-2 text-xs lg:text-sm font-bold text-white hover:bg-white/20 rounded-lg transition-all duration-300 backdrop-blur-sm border border-white/10 hover:border-white/30"
                  >
                    <span className="flex items-center gap-1 lg:gap-2">
                      <Sparkles className="w-3 h-3 lg:w-4 lg:h-4" />
                      جميع المنتجات
                    </span>
                  </Link>
                  <Link 
                    to="/products?category=1" 
                    className="group px-3 py-1.5 lg:px-4 lg:py-2 text-xs lg:text-sm font-bold text-white hover:bg-white/20 rounded-lg transition-all duration-300 backdrop-blur-sm border border-white/10 hover:border-white/30"
                  >
                    <span className="flex items-center gap-1 lg:gap-2">
                      <Crown className="w-3 h-3 lg:w-4 lg:h-4" />
                      العروض المميزة
                    </span>
                  </Link>
                  <Link 
                    to="/products?category=2" 
                    className="group px-3 py-1.5 lg:px-4 lg:py-2 text-xs lg:text-sm font-bold text-white hover:bg-white/20 rounded-lg transition-all duration-300 backdrop-blur-sm border border-white/10 hover:border-white/30"
                  >
                    <span className="flex items-center gap-1 lg:gap-2">
                      <Gem className="w-3 h-3 lg:w-4 lg:h-4" />
                      التصنيفات الفاخرة
                    </span>
                  </Link>
                </nav>
              </div>
            </div>
          </div>

          {/* Mobile Menu Overlay */}
          {isMenuOpen && (
            <div className="md:hidden bg-white border-t border-gray-200 shadow-xl">
              <div className="px-4 py-4 space-y-3">
                <Link
                  to="/"
                  className="block px-3 py-2 text-sm font-bold rounded-lg text-gray-700 hover:text-red-600 hover:bg-red-50 transition-all duration-300"
                  onClick={() => setIsMenuOpen(false)}
                >
                  🏠 الرئيسية
                </Link>
                <Link
                  to="/products"
                  className="block px-3 py-2 text-sm font-bold rounded-lg text-gray-700 hover:text-red-600 hover:bg-red-50 transition-all duration-300"
                  onClick={() => setIsMenuOpen(false)}
                >
                  🛍️ جميع المنتجات
                </Link>
                <Link
                  to="/wishlist"
                  className="block px-3 py-2 text-sm font-bold rounded-lg text-gray-700 hover:text-red-600 hover:bg-red-50 transition-all duration-300 flex items-center justify-between"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span>❤️ المفضلة</span>
                  {wishlistItemsCount > 0 && (
                    <span 
                      className="bg-red-100 text-red-600 px-2 py-1 rounded-full text-xs font-black"
                      data-wishlist-count
                    >
                      {wishlistItemsCount}
                    </span>
                  )}
                </Link>
                <Link
                  to="/cart"
                  className="block px-3 py-2 text-sm font-bold rounded-lg text-gray-700 hover:text-red-600 hover:bg-red-50 transition-all duration-300 flex items-center justify-between"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className="flex items-center gap-2">
                    🛒 <span>سلة التسوق</span>
                  </span>
                  <div className="flex items-center gap-2">
                    {totalCartItems > 0 ? (
                      <>
                        <span 
                          className="bg-red-100 text-red-600 px-2 py-1 rounded-full text-xs font-black min-w-[20px] text-center"
                          data-cart-count
                        >
                          {totalCartItems > 99 ? '99+' : totalCartItems}
                        </span>
                        {totalCartValue > 0 && (
                          <span className="text-xs font-bold text-green-600 whitespace-nowrap">
                            {totalCartValue > 9999 ? `${(totalCartValue/1000).toFixed(1)}K` : totalCartValue.toFixed(0)} ر.س
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="text-xs text-gray-400 font-medium">فارغة</span>
                    )}
                  </div>
                </Link>
              </div>
            </div>
          )}
          </div>
        </header>
      </div>
    );
};

export default Navbar;