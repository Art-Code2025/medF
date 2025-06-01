import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, Heart, User, Menu, X, ChevronDown, Phone, Mail, Instagram, Facebook, Twitter, Stethoscope } from 'lucide-react';
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

  return (
    <>
      {/* Top Bar - Red Background like OTE Store */}
      <div className="bg-red-600 text-white py-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span>للاستفسار عن طلبك</span>
              </div>
              <div className="flex items-center gap-2">
                <span>☰</span>
                <span>قائمة المفضلة</span>
              </div>
              <div className="flex items-center gap-2">
                <span>❤</span>
                <span>تسجيل</span>
              </div>
              <div className="flex items-center gap-2">
                <span>💰</span>
                <span>دخول</span>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <span>تواصل معنا</span>
              <div className="flex items-center gap-2">
                <a href="#" className="hover:text-gray-200">
                  <Instagram className="w-4 h-4" />
                </a>
                <a href="#" className="hover:text-gray-200">
                  <Facebook className="w-4 h-4" />
                </a>
                <a href="#" className="hover:text-gray-200">
                  <Twitter className="w-4 h-4" />
                </a>
                <a href="#" className="hover:text-gray-200">
                  <Phone className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header - White Background with Red Accents */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            
            {/* Cart Icon - Left Side like OTE */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                  <ShoppingCart className="w-4 h-4 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500">0.00 - منتجات 0</div>
                </div>
              </div>
            </div>

            {/* Search Bar - Center */}
            <div className="flex-1 max-w-2xl mx-8">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="البحث عن..."
                  className="w-full px-4 py-3 pr-12 border-2 border-red-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white"
                />
                <button
                  type="submit"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-600 hover:text-red-700 transition-colors duration-200"
                >
                  <Search className="w-5 h-5" />
                </button>
              </form>
            </div>

            {/* Logo - Right Side */}
            <Link to="/" className="flex items-center gap-3">
              <div className="text-right">
                <h1 className="text-2xl font-bold text-gray-900">العينة الطبية</h1>
                <p className="text-sm text-red-600">لوازم مستشفيات وأدوات طبية</p>
              </div>
              <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center">
                <div className="text-white font-bold text-xs text-center">
                  <div>OTE</div>
                  <div className="text-[8px]">STORE</div>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Navigation Menu - Red Background */}
        <div className="bg-red-600 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center h-12">
              <nav className="flex items-center space-x-8 space-x-reverse">
                <Link 
                  to="/products" 
                  className="px-4 py-2 text-sm font-medium hover:bg-red-700 rounded transition-colors duration-200"
                >
                  جميع المنتجات
                </Link>
                <Link 
                  to="/products?category=1" 
                  className="px-4 py-2 text-sm font-medium hover:bg-red-700 rounded transition-colors duration-200"
                >
                  عروضنا التجارية
                </Link>
                <Link 
                  to="/products?category=2" 
                  className="px-4 py-2 text-sm font-medium hover:bg-red-700 rounded transition-colors duration-200"
                >
                  تسوق حسب الأقسام
                </Link>
              </nav>
            </div>
          </div>
        </div>

        {/* User Actions Bar */}
        <div className="bg-gray-50 border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-12">
              
              {/* Left Side - User Actions */}
              <div className="flex items-center gap-6">
                {/* User Menu */}
                <div className="relative">
                  {isCustomerLoggedIn ? (
                    <div>
                      <button
                        onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                        className="flex items-center gap-2 text-gray-700 hover:text-red-600 transition-colors duration-200"
                      >
                        <User className="w-5 h-5" />
                        <span className="text-sm">{customerName}</span>
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
                      className="flex items-center gap-1 text-gray-700 hover:text-red-600 transition-colors duration-200"
                    >
                      <User className="w-5 h-5" />
                      <span className="text-sm">مرحبا تسجيل الدخول</span>
                    </Link>
                  )}
                </div>

                {/* Wishlist */}
                <Link
                  to="/wishlist"
                  className="relative text-gray-700 hover:text-red-600 transition-colors duration-200 flex items-center gap-1"
                >
                  <Heart className="w-5 h-5" />
                  <span className="text-sm">رغباتي</span>
                  {wishlistCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                      {wishlistCount}
                    </span>
                  )}
                </Link>

                {/* Cart */}
                <Link
                  to="/cart"
                  className="relative text-gray-700 hover:text-red-600 transition-colors duration-200 flex items-center gap-1"
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span className="text-sm">سلة التسوق</span>
                  {totalCartItems > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                      {totalCartItems}
                    </span>
                  )}
                </Link>
              </div>

              {/* Right Side - Breadcrumb Style */}
              <div className="text-sm text-gray-600">
                <Link to="/" className="hover:text-red-600">الرئيسية</Link>
                <span className="mx-2">/</span>
                <span>المتجر</span>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden bg-white border-t border-gray-200">
            <div className="px-4 py-3 space-y-2">
              <Link
                to="/"
                className="block px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:text-red-600 hover:bg-gray-50"
                onClick={() => setIsMenuOpen(false)}
              >
                الرئيسية
              </Link>
              <Link
                to="/products"
                className="block px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:text-red-600 hover:bg-gray-50"
                onClick={() => setIsMenuOpen(false)}
              >
                جميع المنتجات
              </Link>
              <Link
                to="/cart"
                className="block px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:text-red-600 hover:bg-gray-50"
                onClick={() => setIsMenuOpen(false)}
              >
                سلة التسوق
              </Link>
              <Link
                to="/wishlist"
                className="block px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:text-red-600 hover:bg-gray-50"
                onClick={() => setIsMenuOpen(false)}
              >
                المفضلة
              </Link>
            </div>
          </div>
        )}
      </header>
    </>
  );
};

export default Navbar;