import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  ShoppingCart, Heart, Search, Menu, X, User, 
  ChevronDown, Package, Stethoscope, Phone, Mail, MapPin
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
  
  const location = useLocation();
  const navigate = useNavigate();

  // المسارات التي لا تحتاج للنافبار
  const hideNavbarPaths = ['/login'];
  const shouldShowNavbar = !hideNavbarPaths.includes(location.pathname);

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

  return (
    <>
      {/* Top Bar - Similar to OTE Store */}
      <div className="hidden lg:block bg-gray-100 border-b border-gray-200 py-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-gray-600">
                <Phone className="w-4 h-4" />
                <span>للاستفسار: 920033213</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Mail className="w-4 h-4" />
                <span>info@mawasim-medical.com</span>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="text-gray-600">تابعنا على:</span>
              <div className="flex items-center gap-2">
                <a href="#" className="text-blue-600 hover:text-blue-800">Facebook</a>
                <a href="#" className="text-blue-400 hover:text-blue-600">Twitter</a>
                <a href="#" className="text-pink-600 hover:text-pink-800">Instagram</a>
                <a href="#" className="text-green-600 hover:text-green-800">WhatsApp</a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header - Clean Medical Style */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo - Medical Style */}
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Stethoscope className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">مواسم الطب</h1>
                <p className="text-xs text-gray-500">للمنتجات الطبية</p>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center space-x-8 space-x-reverse">
              <Link 
                to="/" 
                className={`px-3 py-2 text-sm font-medium transition-colors duration-200 ${
                  location.pathname === '/' 
                    ? 'text-blue-600 border-b-2 border-blue-600' 
                    : 'text-gray-700 hover:text-blue-600'
                }`}
              >
                الرئيسية
              </Link>
              <Link 
                to="/products" 
                className={`px-3 py-2 text-sm font-medium transition-colors duration-200 ${
                  location.pathname === '/products' 
                    ? 'text-blue-600 border-b-2 border-blue-600' 
                    : 'text-gray-700 hover:text-blue-600'
                }`}
              >
                جميع المنتجات
              </Link>
              <a href="#categories" className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors duration-200">
                الأقسام
              </a>
              <a href="#about" className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors duration-200">
                من نحن
              </a>
              <a href="#contact" className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors duration-200">
                تواصل معنا
              </a>
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center gap-4">
              
              {/* User Menu */}
              <div className="relative">
                {isCustomerLoggedIn ? (
                  <div>
                    <button
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                      className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors duration-200"
                    >
                      <User className="w-5 h-5" />
                      <span className="hidden sm:block text-sm">{customerName}</span>
                      <ChevronDown className="w-4 h-4" />
                    </button>

                    {isUserMenuOpen && (
                      <div className="absolute left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                        <div className="px-4 py-2 border-b border-gray-100">
                          <p className="text-sm font-medium text-gray-900">{customerName}</p>
                          <p className="text-xs text-gray-500">عميل مسجل</p>
                        </div>
                        <button
                          onClick={handleLogout}
                          className="w-full text-right px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
                        >
                          تسجيل الخروج
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    to="/sign-in"
                    className="flex items-center gap-1 text-gray-700 hover:text-blue-600 transition-colors duration-200"
                  >
                    <User className="w-5 h-5" />
                    <span className="hidden sm:block text-sm">دخول</span>
                  </Link>
                )}
              </div>

              {/* Wishlist */}
              <Link
                to="/wishlist"
                className="relative text-gray-700 hover:text-red-600 transition-colors duration-200"
              >
                <Heart className="w-5 h-5" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Cart */}
              <Link
                to="/cart"
                className="relative text-gray-700 hover:text-blue-600 transition-colors duration-200"
              >
                <ShoppingCart className="w-5 h-5" />
                {totalCartItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {totalCartItems}
                  </span>
                )}
              </Link>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden text-gray-700 hover:text-blue-600 transition-colors duration-200"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Search Bar - Prominent like OTE Store */}
        <div className="bg-gray-50 border-t border-gray-200 py-3">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث عن المنتجات الطبية، الأدوات، الأجهزة..."
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors duration-200"
              >
                <Search className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden bg-white border-t border-gray-200">
            <div className="px-4 py-3 space-y-2">
              <Link
                to="/"
                className={`block px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                  location.pathname === '/' 
                    ? 'text-blue-600 bg-blue-50' 
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                الرئيسية
              </Link>
              <Link
                to="/products"
                className={`block px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                  location.pathname === '/products' 
                    ? 'text-blue-600 bg-blue-50' 
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                جميع المنتجات
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Click outside handler for user menu */}
      {isUserMenuOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsUserMenuOpen(false)}
        />
      )}
    </>
  );
};

export default Navbar;