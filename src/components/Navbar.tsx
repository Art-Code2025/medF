import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  ShoppingCart, Heart, Search, Menu, X, User, 
  ChevronDown, Package, Stethoscope, Activity, 
  Plus, Shield, LogOut, Bell, Settings
} from 'lucide-react';
import { toast } from 'react-toastify';
import { getWishlistItems } from '../utils/wishlistUtils';

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();

  // المسارات التي لا تحتاج للنافبار
  const hideNavbarPaths = ['/login'];
  const shouldShowNavbar = !hideNavbarPaths.includes(location.pathname);

  useEffect(() => {
    // مراقبة التمرير
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // تحديث عدد المنتجات في السلة
    const updateCartCount = () => {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      setCartItems(cart);
    };

    // تحديث عدد منتجات المفضلة
    const updateWishlistCount = () => {
      const wishlistItems = getWishlistItems();
      setWishlistCount(wishlistItems.length);
    };

    updateCartCount();
    updateWishlistCount();

    // مراقبة تغييرات LocalStorage
    const handleStorageChange = () => {
      updateCartCount();
      updateWishlistCount();
    };

    window.addEventListener('storage', handleStorageChange);
    
    // مراقبة الأحداث المخصصة
    window.addEventListener('cartUpdated', updateCartCount);
    window.addEventListener('wishlistUpdated', updateWishlistCount);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('cartUpdated', updateCartCount);
      window.removeEventListener('wishlistUpdated', updateWishlistCount);
    };
  }, []);

  // التحقق من تسجيل دخول العميل
  const customerData = localStorage.getItem('customerUser');
  const isCustomerLoggedIn = !!customerData;
  let customerName = '';

  if (isCustomerLoggedIn) {
    try {
      const customer = JSON.parse(customerData);
      customerName = customer.name || 'عميل';
    } catch (error) {
      console.error('Error parsing customer data:', error);
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('customerUser');
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

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-white/95 backdrop-blur-xl shadow-lg border-b border-gray-200/50' 
        : 'bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
              isScrolled 
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600' 
                : 'bg-white/20 backdrop-blur-sm border border-white/30'
            } group-hover:scale-110`}>
              <Stethoscope className={`w-6 h-6 ${isScrolled ? 'text-white' : 'text-white'}`} />
            </div>
            <div className="hidden sm:block">
              <h1 className={`text-xl font-bold transition-colors duration-300 ${
                isScrolled ? 'text-slate-900' : 'text-white'
              }`}>
                مواسم الطب
              </h1>
              <p className={`text-xs transition-colors duration-300 ${
                isScrolled ? 'text-slate-600' : 'text-blue-200'
              }`}>
                للمنتجات الطبية
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8 space-x-reverse">
            <Link 
              to="/" 
              className={`relative px-4 py-2 rounded-lg font-semibold transition-all duration-300 group ${
                location.pathname === '/' 
                  ? (isScrolled ? 'text-blue-600 bg-blue-50' : 'text-white bg-white/20') 
                  : (isScrolled ? 'text-slate-700 hover:text-blue-600' : 'text-blue-100 hover:text-white')
              }`}
            >
              الرئيسية
              {location.pathname === '/' && (
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-current rounded-full"></div>
              )}
            </Link>
            
            <Link 
              to="/products" 
              className={`relative px-4 py-2 rounded-lg font-semibold transition-all duration-300 group ${
                location.pathname === '/products' 
                  ? (isScrolled ? 'text-blue-600 bg-blue-50' : 'text-white bg-white/20') 
                  : (isScrolled ? 'text-slate-700 hover:text-blue-600' : 'text-blue-100 hover:text-white')
              }`}
            >
              المنتجات
              {location.pathname === '/products' && (
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-current rounded-full"></div>
              )}
            </Link>
          </nav>

          {/* Search Bar */}
          <div className="hidden md:block flex-1 max-w-md mx-8">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث عن المنتجات الطبية..."
                className={`w-full px-4 py-3 pr-12 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 ${
                  isScrolled 
                    ? 'bg-white border-gray-200 text-slate-900 placeholder-slate-500 focus:ring-blue-500 focus:border-blue-500' 
                    : 'bg-white/20 backdrop-blur-sm border-white/30 text-white placeholder-blue-200 focus:ring-white/50 focus:border-white/50'
                }`}
              />
              <button
                type="submit"
                className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-lg transition-colors duration-300 ${
                  isScrolled ? 'text-slate-600 hover:text-blue-600' : 'text-blue-200 hover:text-white'
                }`}
              >
                <Search className="w-5 h-5" />
              </button>
            </form>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            
            {/* Wishlist */}
            <Link
              to="/wishlist"
              className={`relative p-3 rounded-xl transition-all duration-300 ${
                isScrolled 
                  ? 'text-slate-700 hover:text-red-600 hover:bg-red-50' 
                  : 'text-blue-100 hover:text-white hover:bg-white/20'
              }`}
            >
              <Heart className="w-6 h-6" />
              {wishlistCount > 0 && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {wishlistCount}
                </div>
              )}
            </Link>

            {/* Cart */}
            <Link
              to="/cart"
              className={`relative p-3 rounded-xl transition-all duration-300 ${
                isScrolled 
                  ? 'text-slate-700 hover:text-blue-600 hover:bg-blue-50' 
                  : 'text-blue-100 hover:text-white hover:bg-white/20'
              }`}
            >
              <ShoppingCart className="w-6 h-6" />
              {totalCartItems > 0 && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {totalCartItems}
                </div>
              )}
            </Link>

            {/* User Menu */}
            <div className="relative">
              {isCustomerLoggedIn ? (
                <div>
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 ${
                      isScrolled 
                        ? 'text-slate-700 hover:bg-slate-100' 
                        : 'text-blue-100 hover:bg-white/20'
                    }`}
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">{customerName.charAt(0)}</span>
                    </div>
                    <span className="hidden sm:block font-medium">{customerName}</span>
                    <ChevronDown className="w-4 h-4" />
                  </button>

                  {isUserMenuOpen && (
                    <div className="absolute left-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-200 py-2 z-50">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-semibold text-slate-900">{customerName}</p>
                        <p className="text-xs text-slate-600">عميل مميز</p>
                      </div>
                      
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-right text-red-600 hover:bg-red-50 transition-colors duration-200"
                      >
                        <LogOut className="w-4 h-4" />
                        تسجيل الخروج
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to="/sign-in"
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                    isScrolled 
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg transform hover:scale-105' 
                      : 'bg-white/20 backdrop-blur-sm text-white border border-white/30 hover:bg-white/30'
                  }`}
                >
                  <User className="w-4 h-4" />
                  <span className="hidden sm:block">تسجيل الدخول</span>
                </Link>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`lg:hidden p-2 rounded-lg transition-colors duration-300 ${
                isScrolled ? 'text-slate-700 hover:bg-slate-100' : 'text-blue-100 hover:bg-white/20'
              }`}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden bg-white/95 backdrop-blur-xl border-t border-gray-200/50 py-4">
            {/* Mobile Search */}
            <div className="mb-4">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ابحث عن المنتجات الطبية..."
                  className="w-full px-4 py-3 pr-12 bg-white border border-gray-200 rounded-xl text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  type="submit"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-slate-600 hover:text-blue-600"
                >
                  <Search className="w-5 h-5" />
                </button>
              </form>
            </div>

            {/* Mobile Navigation */}
            <nav className="space-y-2">
              <Link
                to="/"
                className={`block px-4 py-3 rounded-xl font-semibold transition-colors duration-200 ${
                  location.pathname === '/' 
                    ? 'text-blue-600 bg-blue-50' 
                    : 'text-slate-700 hover:text-blue-600 hover:bg-blue-50'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                الرئيسية
              </Link>
              
              <Link
                to="/products"
                className={`block px-4 py-3 rounded-xl font-semibold transition-colors duration-200 ${
                  location.pathname === '/products' 
                    ? 'text-blue-600 bg-blue-50' 
                    : 'text-slate-700 hover:text-blue-600 hover:bg-blue-50'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                المنتجات
              </Link>
            </nav>
          </div>
        )}
      </div>

      {/* Click outside handler for user menu */}
      {isUserMenuOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsUserMenuOpen(false)}
        />
      )}
    </header>
  );
};

export default Navbar;