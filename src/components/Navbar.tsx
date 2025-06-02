import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, Heart, User, Menu, X, ChevronDown, Phone, Mail, Instagram, Facebook, Twitter, Stethoscope, Crown, Sparkles, Gem } from 'lucide-react';
import { toast } from 'react-toastify';

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

  // Check for routes where navbar should be hidden
  const shouldShowNavbar = !location.pathname.startsWith('/admin') && location.pathname !== '/login';

  useEffect(() => {
    // Load cart and wishlist counts
    const updateCartCount = () => {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      setCartItems(cart);
    };

    const updateWishlistCount = () => {
      const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
      setWishlistCount(wishlist.length);
    };

    const handleStorageChange = () => {
      updateCartCount();
      updateWishlistCount();
    };

    // Check customer login status
    const customerData = localStorage.getItem('customerUser');
    if (customerData) {
      try {
        const customer = JSON.parse(customerData);
        setIsCustomerLoggedIn(true);
        setCustomerName(customer.name || customer.email);
      } catch (error) {
        localStorage.removeItem('customerUser');
      }
    }

    // Initial load
    updateCartCount();
    updateWishlistCount();

    // Listen for storage changes
    window.addEventListener('cartUpdated', handleStorageChange);
    window.addEventListener('wishlistUpdated', handleStorageChange);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('cartUpdated', handleStorageChange);
      window.removeEventListener('wishlistUpdated', handleStorageChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('customerUser');
    setIsCustomerLoggedIn(false);
    setCustomerName('');
    setIsUserMenuOpen(false);
    toast.success('تم تسجيل الخروج بنجاح');
    navigate('/');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  if (!shouldShowNavbar) {
    return null;
  }

  const totalCartItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalCartValue = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      {/* Premium Top Bar */}
      <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white py-2 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2 font-medium">
                <Phone className="w-4 h-4" />
                <span>للاستفسار: 920033213</span>
              </div>
              <div className="hidden md:flex items-center gap-2 font-medium">
                <Sparkles className="w-4 h-4" />
                <span>خدمة VIP متاحة</span>
              </div>
              <div className="hidden lg:flex items-center gap-2 font-medium">
                <Crown className="w-4 h-4" />
                <span>شحن مجاني +500 ر.س</span>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              <span className="hidden md:block font-semibold">تواصل معنا</span>
              <div className="flex items-center gap-3">
                <a href="#" className="w-7 h-7 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all duration-300 border border-white/30">
                  <Instagram className="w-3 h-3" />
                </a>
                <a href="#" className="w-7 h-7 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all duration-300 border border-white/30">
                  <Facebook className="w-3 h-3" />
                </a>
                <a href="#" className="w-7 h-7 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all duration-300 border border-white/30">
                  <Twitter className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header - Premium Design */}
      <header className="bg-white shadow-xl border-b border-gray-100 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            
            {/* Premium Cart Display - Left Side */}
            <div className="flex items-center gap-4">
              <Link to="/cart" className="group">
                <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-red-50 to-rose-50 rounded-2xl border border-red-100 hover:shadow-lg transition-all duration-300">
                  <div className="relative">
                    <div className="w-10 h-10 bg-gradient-to-r from-red-600 to-rose-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                      <ShoppingCart className="w-5 h-5 text-white" />
                    </div>
                    {totalCartItems > 0 && (
                      <div className="absolute -top-2 -right-2 w-5 h-5 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full flex items-center justify-center text-white text-xs font-black shadow-lg animate-pulse">
                        {totalCartItems}
                      </div>
                    )}
                  </div>
                  <div className="text-right hidden md:block">
                    <div className="text-xs text-gray-500 font-medium">إجمالي السلة</div>
                    <div className="font-black text-red-600">{totalCartValue.toFixed(2)} ر.س</div>
                  </div>
                </div>
              </Link>
            </div>

            {/* Premium Search Bar - Center */}
            <div className="flex-1 max-w-2xl mx-8">
              <form onSubmit={handleSearch} className="relative">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="ابحث عن المنتجات الطبية الفاخرة..."
                    className="w-full px-6 py-3 pr-12 border-2 border-red-200 rounded-2xl focus:ring-4 focus:ring-red-100 focus:border-red-500 bg-gradient-to-r from-white to-red-50/30 text-lg font-medium placeholder-gray-400 shadow-lg transition-all duration-300"
                  />
                  <button
                    type="submit"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-gradient-to-r from-red-600 to-rose-600 rounded-xl flex items-center justify-center text-white hover:shadow-lg transition-all duration-300 group"
                  >
                    <Search className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  </button>
                </div>
              </form>
            </div>

            {/* Premium Logo - Right Side */}
            <Link to="/" className="group flex items-center gap-3">
              <div className="text-right">
                <h1 className="text-2xl font-black bg-gradient-to-r from-gray-900 via-red-600 to-gray-900 bg-clip-text text-transparent">
                  العينة الطبية
                </h1>
                <p className="text-xs font-semibold text-red-600">لوازم مستشفيات وأدوات طبية فاخرة</p>
              </div>
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-r from-red-600 via-rose-500 to-red-700 rounded-2xl flex items-center justify-center shadow-2xl border-4 border-white group-hover:shadow-3xl transition-all duration-300 group-hover:scale-105">
                  <div className="text-white font-black text-xs text-center">
                    <div className="text-sm">OTE</div>
                    <div className="text-xs opacity-90">STORE</div>
                  </div>
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full flex items-center justify-center animate-pulse border-2 border-white shadow-lg">
                  <Crown className="w-3 h-3 text-white" />
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Premium Navigation Menu */}
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 shadow-2xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center h-12">
              <nav className="flex items-center space-x-1 space-x-reverse">
                <Link 
                  to="/products" 
                  className="group px-4 py-2 text-sm font-bold text-white hover:bg-white/20 rounded-xl transition-all duration-300 backdrop-blur-sm border border-white/10 hover:border-white/30 hover:shadow-lg"
                >
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                    جميع المنتجات
                  </span>
                </Link>
                <Link 
                  to="/products?category=1" 
                  className="group px-4 py-2 text-sm font-bold text-white hover:bg-white/20 rounded-xl transition-all duration-300 backdrop-blur-sm border border-white/10 hover:border-white/30 hover:shadow-lg"
                >
                  <span className="flex items-center gap-2">
                    <Crown className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    العروض المميزة
                  </span>
                </Link>
                <Link 
                  to="/products?category=2" 
                  className="group px-4 py-2 text-sm font-bold text-white hover:bg-white/20 rounded-xl transition-all duration-300 backdrop-blur-sm border border-white/10 hover:border-white/30 hover:shadow-lg"
                >
                  <span className="flex items-center gap-2">
                    <Gem className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    التصنيفات الفاخرة
                  </span>
                </Link>
              </nav>
            </div>
          </div>
        </div>

        {/* Premium User Actions Bar */}
        <div className="bg-gradient-to-r from-gray-50 to-red-50/30 border-b border-gray-100 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-12">
              
              {/* Left Side - Premium User Actions */}
              <div className="flex items-center gap-6">
                {/* Premium User Menu */}
                <div className="relative">
                  {isCustomerLoggedIn ? (
                    <div>
                      <button
                        onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                        className="group flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-xl hover:shadow-lg transition-all duration-300"
                      >
                        <div className="w-6 h-6 bg-gradient-to-r from-red-600 to-rose-600 rounded-lg flex items-center justify-center">
                          <User className="w-3 h-3 text-white" />
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-bold text-gray-900">{customerName}</div>
                          <div className="text-xs text-red-600 font-medium">عضو VIP</div>
                        </div>
                        <ChevronDown className="w-3 h-3 text-gray-400 group-hover:text-red-600 transition-colors" />
                      </button>

                      {isUserMenuOpen && (
                        <div className="absolute left-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 py-3 z-50 backdrop-blur-md">
                          <div className="px-4 py-2 border-b border-gray-100">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-gradient-to-r from-red-600 to-rose-600 rounded-xl flex items-center justify-center">
                                <Crown className="w-4 h-4 text-white" />
                              </div>
                              <div>
                                <p className="font-black text-gray-900 text-sm">{customerName}</p>
                                <p className="text-xs text-red-600 font-semibold">عضو VIP مميز</p>
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={handleLogout}
                            className="w-full text-right px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 transition-all duration-300"
                          >
                            تسجيل الخروج
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <Link
                      to="/sign-in"
                      className="group flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 font-semibold text-sm"
                    >
                      <User className="w-4 h-4" />
                      <span>تسجيل الدخول VIP</span>
                    </Link>
                  )}
                </div>

                {/* Premium Wishlist */}
                <Link
                  to="/wishlist"
                  className="group relative flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-xl hover:shadow-lg transition-all duration-300"
                >
                  <div className="relative">
                    <Heart className="w-4 h-4 text-gray-600 group-hover:text-red-600 transition-colors" />
                    {wishlistCount > 0 && (
                      <div className="absolute -top-2 -right-2 w-4 h-4 bg-gradient-to-r from-red-500 to-rose-600 rounded-full flex items-center justify-center text-white text-xs font-black">
                        {wishlistCount}
                      </div>
                    )}
                  </div>
                  <span className="text-sm font-semibold text-gray-700 group-hover:text-red-600 transition-colors">المفضلة</span>
                </Link>

                {/* Premium Cart Link */}
                <Link
                  to="/cart"
                  className="group relative flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-xl hover:shadow-lg transition-all duration-300"
                >
                  <div className="relative">
                    <ShoppingCart className="w-4 h-4 text-gray-600 group-hover:text-red-600 transition-colors" />
                    {totalCartItems > 0 && (
                      <div className="absolute -top-2 -right-2 w-4 h-4 bg-gradient-to-r from-red-600 to-rose-600 rounded-full flex items-center justify-center text-white text-xs font-black">
                        {totalCartItems}
                      </div>
                    )}
                  </div>
                  <span className="text-sm font-semibold text-gray-700 group-hover:text-red-600 transition-colors">السلة</span>
                </Link>
              </div>

              {/* Right Side - Premium Breadcrumb */}
              <div className="flex items-center gap-2 text-sm">
                <div className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-xl shadow-sm">
                  <Link to="/" className="font-semibold text-red-600 hover:text-red-800 transition-colors text-xs">الرئيسية</Link>
                  <span className="text-gray-400">/</span>
                  <span className="text-gray-600 font-medium text-xs">المتجر الفاخر</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Premium Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden bg-white border-t border-gray-200 shadow-xl">
            <div className="px-6 py-6 space-y-4">
              <Link
                to="/"
                className="block px-4 py-3 text-sm font-bold rounded-xl text-gray-700 hover:text-red-600 hover:bg-red-50 transition-all duration-300"
                onClick={() => setIsMenuOpen(false)}
              >
                الرئيسية
              </Link>
              <Link
                to="/products"
                className="block px-4 py-3 text-sm font-bold rounded-xl text-gray-700 hover:text-red-600 hover:bg-red-50 transition-all duration-300"
                onClick={() => setIsMenuOpen(false)}
              >
                جميع المنتجات
              </Link>
              <Link
                to="/cart"
                className="block px-4 py-3 text-sm font-bold rounded-xl text-gray-700 hover:text-red-600 hover:bg-red-50 transition-all duration-300"
                onClick={() => setIsMenuOpen(false)}
              >
                سلة التسوق
              </Link>
              <Link
                to="/wishlist"
                className="block px-4 py-3 text-sm font-bold rounded-xl text-gray-700 hover:text-red-600 hover:bg-red-50 transition-all duration-300"
                onClick={() => setIsMenuOpen(false)}
              >
                المفضلة
              </Link>
            </div>
          </div>
        )}
      </header>
    </div>
  );
};

export default Navbar;