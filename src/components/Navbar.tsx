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
      {/* Top Bar - مخفي على الشاشات الصغيرة */}
      <div className="hidden md:block bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white py-1.5 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between text-xs lg:text-sm">
            <div className="flex items-center gap-4 lg:gap-8">
              <div className="flex items-center gap-1 lg:gap-2 font-medium">
                <Phone className="w-3 h-3 lg:w-4 lg:h-4" />
                <span>للاستفسار: 920033213</span>
              </div>
              <div className="hidden lg:flex items-center gap-2 font-medium">
                <Sparkles className="w-4 h-4" />
                <span>خدمة VIP متاحة</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3 lg:gap-6">
              <span className="hidden lg:block font-semibold">تواصل معنا</span>
              <div className="flex items-center gap-2">
                <a href="#" className="w-5 h-5 lg:w-6 lg:h-6 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all">
                  <Instagram className="w-2.5 h-2.5 lg:w-3 lg:h-3" />
                </a>
                <a href="#" className="w-5 h-5 lg:w-6 lg:h-6 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all">
                  <Facebook className="w-2.5 h-2.5 lg:w-3 lg:h-3" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header - Responsive */}
      <header className="bg-white shadow-lg border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16 lg:h-20">
            
            {/* Mobile Menu Button - Left */}
            <div className="flex items-center md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-1.5 rounded-lg text-gray-600 hover:text-red-600 hover:bg-red-50 transition-all"
              >
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>

            {/* Logo - Right Side */}
            <Link to="/" className="group flex items-center gap-2 sm:gap-3">
              <div className="text-right">
                <h1 className="text-sm sm:text-lg md:text-xl lg:text-2xl font-black bg-gradient-to-r from-gray-900 via-red-600 to-gray-900 bg-clip-text text-transparent">
                  العينة الطبية
                </h1>
                <p className="text-xs sm:text-sm font-semibold text-red-600 hidden sm:block">لوازم مستشفيات وأدوات طبية</p>
              </div>
              <div className="relative">
                <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-16 lg:h-16 bg-gradient-to-r from-red-600 via-rose-500 to-red-700 rounded-lg sm:rounded-xl md:rounded-2xl flex items-center justify-center shadow-xl border-2 sm:border-4 border-white group-hover:scale-105 transition-all duration-300">
                  <div className="text-white font-black text-center">
                    <div className="text-xs sm:text-sm md:text-base">OTE</div>
                    <div className="text-xs opacity-90 hidden sm:block">STORE</div>
                  </div>
                </div>
                <div className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full flex items-center justify-center animate-pulse border border-white shadow-lg">
                  <Crown className="w-1.5 h-1.5 sm:w-2 sm:h-2 md:w-2.5 md:h-2.5 lg:w-3 lg:h-3 text-white" />
                </div>
              </div>
            </Link>

            {/* Search Bar - Center (Hidden on mobile) */}
            <div className="hidden md:flex flex-1 max-w-md lg:max-w-2xl mx-4 lg:mx-8">
              <form onSubmit={handleSearch} className="relative w-full">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ابحث عن المنتجات..."
                  className="w-full px-3 py-2 lg:px-4 lg:py-3 pr-8 lg:pr-10 border-2 border-red-200 rounded-lg lg:rounded-xl focus:ring-2 lg:focus:ring-4 focus:ring-red-100 focus:border-red-500 bg-gradient-to-r from-white to-red-50/30 text-sm lg:text-base font-medium placeholder-gray-400 shadow-lg transition-all duration-300"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 w-6 h-6 lg:w-8 lg:h-8 bg-gradient-to-r from-red-600 to-rose-600 rounded-lg flex items-center justify-center text-white hover:shadow-lg transition-all duration-300"
                >
                  <Search className="w-3 h-3 lg:w-4 lg:h-4" />
                </button>
              </form>
            </div>

            {/* Action Buttons - Left */}
            <div className="flex items-center gap-1 sm:gap-2 md:gap-3">
              {/* Cart - Always visible */}
              <Link to="/cart" className="group relative">
                <div className="flex items-center gap-1 sm:gap-2 p-1.5 sm:p-2 md:p-3 bg-gradient-to-r from-red-50 to-rose-50 rounded-lg sm:rounded-xl border border-red-100 hover:shadow-lg transition-all duration-300">
                  <div className="relative">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 bg-gradient-to-r from-red-600 to-rose-600 rounded-lg flex items-center justify-center shadow-lg">
                      <ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-white" />
                    </div>
                    {totalCartItems > 0 && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full flex items-center justify-center text-white text-xs font-black shadow-lg animate-pulse">
                        {totalCartItems}
                      </div>
                    )}
                  </div>
                  <div className="text-right hidden lg:block">
                    <div className="text-xs text-gray-500 font-medium">السلة</div>
                    <div className="font-black text-red-600 text-sm">{totalCartValue.toFixed(2)} ر.س</div>
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
                  {wishlistCount > 0 && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-gradient-to-r from-red-500 to-rose-600 rounded-full flex items-center justify-center text-white text-xs font-black">
                      {wishlistCount}
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
                {wishlistCount > 0 && (
                  <span className="bg-red-100 text-red-600 px-2 py-1 rounded-full text-xs font-black">{wishlistCount}</span>
                )}
              </Link>
              <Link
                to="/cart"
                className="block px-3 py-2 text-sm font-bold rounded-lg text-gray-700 hover:text-red-600 hover:bg-red-50 transition-all duration-300 flex items-center justify-between"
                onClick={() => setIsMenuOpen(false)}
              >
                <span>🛒 سلة التسوق</span>
                {totalCartItems > 0 && (
                  <span className="bg-red-100 text-red-600 px-2 py-1 rounded-full text-xs font-black">{totalCartItems}</span>
                )}
              </Link>
            </div>
          </div>
        )}
      </header>
    </div>
  );
};

export default Navbar;