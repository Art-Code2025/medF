import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, Star, Heart, ShoppingCart, Package, Grid, List, Phone, Mail, MapPin, Clock, Facebook, Twitter, Instagram, ArrowRight, TrendingUp, Award, Truck, Shield } from 'lucide-react';
import { toast } from 'react-toastify';
import { buildImageUrl, apiCall, API_ENDPOINTS } from '../config/api';
import { addToCartUnified } from '../utils/cartUtils';
import { isInWishlist, addToWishlist, removeFromWishlist } from '../utils/wishlistUtils';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  stock: number;
  categoryId: number;
  mainImage: string;
  detailedImages: string[];
}

interface Category {
  id: number;
  name: string;
  description: string;
  image: string;
}

const HomePage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  // Hero slider effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % 3);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const loadData = async () => {
    try {
      const [productsData, categoriesData] = await Promise.all([
        apiCall(API_ENDPOINTS.PRODUCTS),
        apiCall(API_ENDPOINTS.CATEGORIES)
      ]);
      
      setProducts(productsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('حدث خطأ في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (product: Product) => {
    try {
      await addToCartUnified(product.id, product.name, 1);
      toast.success(`تم إضافة ${product.name} إلى السلة`);
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('حدث خطأ في إضافة المنتج للسلة');
    }
  };

  const handleWishlistToggle = (product: Product) => {
    const inWishlist = isInWishlist(product.id);
    
    if (inWishlist) {
      removeFromWishlist(product.id);
      toast.success('تم إزالة المنتج من المفضلة');
    } else {
      addToWishlist({
        id: Date.now(),
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.mainImage
      });
      toast.success('تم إضافة المنتج للمفضلة');
    }
  };

  const featuredProducts = products.slice(0, 8);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-32">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-32">
      <div className="max-w-7xl mx-auto">
        <div className="flex gap-6 p-4">
          
          {/* Sidebar - Categories exactly like OTE Store */}
          <aside className="w-80 bg-white rounded-lg shadow-sm border border-gray-200 h-fit sticky top-36">
            
            {/* Categories Section */}
            <div className="p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Package className="w-5 h-5 text-blue-600" />
                تسوق حسب الأقسام
              </h2>
              
              <div className="space-y-1">
                <Link
                  to="/products"
                  className="w-full text-right px-4 py-3 rounded-lg transition-colors duration-200 flex items-center justify-between text-gray-700 hover:bg-gray-50"
                >
                  <span className="font-medium">جميع المنتجات</span>
                  <ChevronLeft className="w-4 h-4" />
                </Link>
                
                {categories.map((category) => (
                  <Link
                    key={category.id}
                    to={`/products?category=${category.id}`}
                    className="w-full text-right px-4 py-3 rounded-lg transition-colors duration-200 flex items-center justify-between text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                  >
                    <span className="font-medium">{category.name}</span>
                    <ChevronLeft className="w-4 h-4" />
                  </Link>
                ))}
              </div>
            </div>

            {/* Featured Categories - Like OTE */}
            <div className="p-6 border-t border-gray-200">
              <h3 className="text-sm font-bold text-gray-900 mb-4">الأقسام الرئيسية</h3>
              <div className="space-y-3">
                {categories.slice(0, 6).map((category) => (
                  <Link
                    key={category.id}
                    to={`/products?category=${category.id}`}
                    className="w-full flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                  >
                    <img
                      src={buildImageUrl(category.image)}
                      alt={category.name}
                      className="w-12 h-12 object-cover rounded-lg"
                    />
                    <div className="text-right flex-1">
                      <h4 className="font-medium text-gray-900 text-sm">{category.name}</h4>
                      <p className="text-xs text-gray-500 line-clamp-1">{category.description}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Special Offers Section */}
            <div className="p-6 border-t border-gray-200">
              <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Award className="w-4 h-4 text-yellow-500" />
                عروض خاصة
              </h3>
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4">
                <div className="text-blue-800 font-bold text-sm mb-1">خصم حتى 30%</div>
                <div className="text-blue-600 text-xs">على جميع المعدات الطبية</div>
                <Link 
                  to="/products"
                  className="mt-2 inline-block bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700 transition-colors"
                >
                  تسوق الآن
                </Link>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 space-y-8">
            
            {/* Hero Section - OTE Style */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="relative h-96">
                {/* Hero Images */}
                <div className="absolute inset-0">
                  <div className="h-full bg-gradient-to-r from-blue-600 to-blue-800 flex items-center">
                    <div className="max-w-2xl mx-auto text-center text-white px-8">
                      <h1 className="text-4xl font-bold mb-4">أفضل المعدات الطبية</h1>
                      <p className="text-xl mb-6">جودة عالية وأسعار منافسة</p>
                      <Link 
                        to="/products"
                        className="bg-white text-blue-600 px-8 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors inline-flex items-center gap-2"
                      >
                        تسوق الآن
                        <ArrowRight className="w-5 h-5" />
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Hero Navigation Dots */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                  {[0, 1, 2].map((index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentSlide(index)}
                      className={`w-3 h-3 rounded-full transition-colors ${
                        currentSlide === index ? 'bg-white' : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Categories Grid - OTE Style */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">تسوق حسب الفئة</h2>
                <Link 
                  to="/products"
                  className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                >
                  عرض الكل
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {categories.slice(0, 8).map((category) => (
                  <Link
                    key={category.id}
                    to={`/products?category=${category.id}`}
                    className="group bg-gray-50 rounded-lg p-4 hover:bg-blue-50 transition-colors duration-200"
                  >
                    <div className="text-center">
                      <img
                        src={buildImageUrl(category.image)}
                        alt={category.name}
                        className="w-16 h-16 object-cover rounded-lg mx-auto mb-3 group-hover:scale-105 transition-transform duration-200"
                      />
                      <h3 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                        {category.name}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">{category.description}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Featured Products - OTE Style */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                  المنتجات المميزة
                </h2>
                <Link 
                  to="/products"
                  className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                >
                  عرض الكل
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {featuredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-300 group"
                  >
                    {/* Product Image */}
                    <div className="aspect-square relative overflow-hidden">
                      <Link to={`/product/${product.id}`}>
                        <img
                          src={buildImageUrl(product.mainImage)}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </Link>
                      
                      {/* Wishlist Button */}
                      <button
                        onClick={() => handleWishlistToggle(product)}
                        className={`absolute top-3 right-3 p-2 rounded-full transition-all duration-200 ${
                          isInWishlist(product.id)
                            ? 'bg-red-500 text-white'
                            : 'bg-white/80 text-gray-600 hover:bg-red-50 hover:text-red-600'
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
                      </button>

                      {/* Discount Badge */}
                      {product.originalPrice && product.originalPrice > product.price && (
                        <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                          خصم {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                        </div>
                      )}

                      {/* Stock Status */}
                      {product.stock < 10 && product.stock > 0 && (
                        <div className="absolute bottom-3 left-3 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                          آخر {product.stock} قطع
                        </div>
                      )}
                    </div>

                    {/* Product Info - OTE Style */}
                    <div className="p-4">
                      <div className="text-xs text-gray-500 mb-1">
                        الموديل: {product.id}
                      </div>

                      <Link to={`/product/${product.id}`}>
                        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-blue-600 transition-colors duration-200">
                          {product.name}
                        </h3>
                      </Link>
                      
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {product.description}
                      </p>

                      {/* Rating */}
                      <div className="flex items-center gap-1 mb-3">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>

                      {/* Price Section */}
                      <div className="mb-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg font-bold text-gray-900">
                            {product.price.toFixed(2)} ر.س
                          </span>
                          {product.originalPrice && product.originalPrice > product.price && (
                            <span className="text-sm text-gray-500 line-through">
                              {product.originalPrice.toFixed(2)} ر.س
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500">
                          السعر بدون ضريبة: {product.price.toFixed(2)} ر.س
                        </div>
                      </div>

                      {/* Add to Cart Button */}
                      <button
                        onClick={() => handleAddToCart(product)}
                        disabled={product.stock === 0}
                        className={`w-full py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 font-medium text-sm ${
                          product.stock === 0
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                      >
                        <ShoppingCart className="w-4 h-4" />
                        {product.stock === 0 ? 'نفد المخزون' : 'اضافة للسلة'}
                      </button>

                      {/* Additional Actions */}
                      <div className="flex items-center justify-between mt-3 text-xs">
                        <button
                          onClick={() => handleWishlistToggle(product)}
                          className="text-blue-600 hover:text-blue-800 transition-colors duration-200"
                        >
                          إضافة لرغباتي
                        </button>
                        <button className="text-blue-600 hover:text-blue-800 transition-colors duration-200">
                          اضافة للمقارنة
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Features Section - OTE Style */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Truck className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">شحن مجاني</h3>
                <p className="text-gray-600 text-sm">للطلبات أكثر من 100 ريال</p>
              </div>
              
              <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">ضمان الجودة</h3>
                <p className="text-gray-600 text-sm">منتجات أصلية 100%</p>
              </div>
              
              <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">خدمة ممتازة</h3>
                <p className="text-gray-600 text-sm">دعم فني متخصص</p>
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Footer - OTE Style */}
      <footer className="bg-gray-900 text-white mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            
            {/* Company Info */}
            <div>
              <h3 className="text-lg font-bold mb-4">مواسم الطب</h3>
              <p className="text-gray-400 mb-4 text-sm">
                متجرك الموثوق للمعدات والمستلزمات الطبية عالية الجودة
              </p>
              <div className="flex items-center gap-3">
                <a href="#" className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors">
                  <Facebook className="w-4 h-4" />
                </a>
                <a href="#" className="w-8 h-8 bg-blue-400 rounded-full flex items-center justify-center hover:bg-blue-500 transition-colors">
                  <Twitter className="w-4 h-4" />
                </a>
                <a href="#" className="w-8 h-8 bg-pink-600 rounded-full flex items-center justify-center hover:bg-pink-700 transition-colors">
                  <Instagram className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold mb-4">روابط سريعة</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="/products" className="hover:text-white transition-colors">جميع المنتجات</Link></li>
                <li><Link to="/cart" className="hover:text-white transition-colors">سلة التسوق</Link></li>
                <li><Link to="/wishlist" className="hover:text-white transition-colors">المفضلة</Link></li>
                <li><Link to="/sign-in" className="hover:text-white transition-colors">تسجيل الدخول</Link></li>
              </ul>
            </div>

            {/* Categories */}
            <div>
              <h4 className="font-semibold mb-4">الأقسام</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                {categories.slice(0, 4).map((category) => (
                  <li key={category.id}>
                    <Link 
                      to={`/products?category=${category.id}`}
                      className="hover:text-white transition-colors"
                    >
                      {category.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-semibold mb-4">تواصل معنا</h4>
              <div className="space-y-3 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span>+966 50 123 4567</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span>info@mawasimmed.com</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>الرياض، المملكة العربية السعودية</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>24/7 خدمة العملاء</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2024 مواسم الطب. جميع الحقوق محفوظة.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage; 