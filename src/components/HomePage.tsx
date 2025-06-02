import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Star, Heart, ShoppingCart, Package, Truck, Shield, Award, Phone, Mail, MapPin, Clock, Facebook, Twitter, Instagram, Eye, Users, Briefcase, Home, Accessibility, Stethoscope, Sparkles, Crown, Gem, Zap } from 'lucide-react';
import { toast } from 'react-toastify';
import { buildImageUrl, apiCall, API_ENDPOINTS, getFallbackImage } from '../config/api';
import { addToCartUnified } from '../utils/cartUtils';
import { isInWishlist, addToWishlist, removeFromWishlist } from '../utils/wishlistUtils';
import ImageSlider from './ImageSlider';
import WhatsAppButton from './WhatsAppButton';

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

  useEffect(() => {
    loadData();
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

  // Slider data - ارتفاع أقل للموبايل
  const sliderData = [
    {
      id: 1,
      image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=2053&auto=format&fit=crop',
      title: 'العينة الطبية',
      subtitle: 'أحدث المعدات الطبية عالية الجودة',
      buttonText: 'استكشف المنتجات',
      buttonLink: '/products'
    },
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?q=80&w=2000&auto=format&fit=crop',
      title: 'معدات طبية متطورة',
      subtitle: 'تقنيات حديثة ومبتكرة للمؤسسات الطبية',
      buttonText: 'تصفح الآن',
      buttonLink: '/products'
    },
    {
      id: 3,
      image: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?q=80&w=2000&auto=format&fit=crop',
      title: 'رعاية صحية شاملة',
      subtitle: 'كل ما تحتاجه من معدات طبية',
      buttonText: 'ابدأ التسوق',
      buttonLink: '/products'
    }
  ];

  const featuredProducts = products.slice(0, 8);
  const newProducts = products.slice(0, 6);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-12 h-12 md:w-16 md:h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          </div>
          <p className="text-slate-600 font-medium text-sm md:text-base">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      
      {/* Image Slider - ارتفاع متجاوب */}
      <div className="w-full">
        <ImageSlider 
          slides={sliderData}
          autoPlay={true}
          autoPlayInterval={6000}
          height="h-[40vh] sm:h-[50vh] md:h-[60vh] lg:h-[70vh]"
        />
      </div>

      {/* Premium Installment Banner - responsive */}
      <div className="relative overflow-hidden bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 py-3 sm:py-4 md:py-6 shadow-2xl">
        <div className="relative max-w-7xl mx-auto px-2 sm:px-4 md:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-6">
            <div className="flex items-center gap-2 sm:gap-4 text-center sm:text-right">
              <div className="text-3xl sm:text-5xl md:text-6xl lg:text-8xl font-black text-white/20 select-none">0%</div>
              <div className="text-white">
                <h3 className="text-sm sm:text-lg md:text-2xl lg:text-3xl font-black mb-1 flex items-center gap-1 sm:gap-2">
                  <Gem className="w-3 h-3 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                  قسط مشترياتك على 4 دفعات
                </h3>
                <p className="text-xs sm:text-sm md:text-lg lg:text-xl font-medium text-white/90">بحد أقصى 5000 ريال</p>
              </div>
            </div>
            
            <div className="flex gap-2 sm:gap-3">
              <button className="group px-3 py-2 sm:px-4 sm:py-2 md:px-6 md:py-3 bg-gradient-to-r from-rose-500 to-pink-600 text-white font-black rounded-full shadow-xl text-xs sm:text-sm md:text-base">
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
                  تمارا
                </span>
              </button>
              <button className="group px-3 py-2 sm:px-4 sm:py-2 md:px-6 md:py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black rounded-full shadow-xl text-xs sm:text-sm md:text-base">
                <span className="flex items-center gap-1">
                  <Zap className="w-3 h-3 sm:w-4 sm:h-4" />
                  تابي
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-6 sm:py-8 md:py-12">
        
        {/* منتجات وصلت حديثاً - أصغر للموبايل */}
        <div className="mb-8 sm:mb-12 md:mb-16">
          <div className="text-center mb-6 sm:mb-8 md:mb-10">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-gray-900 mb-2 sm:mb-3 relative inline-block">
              <span className="flex items-center gap-2 sm:gap-3">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-amber-500" />
                منتجات وصلت حديثاً
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-amber-500" />
              </span>
              <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-12 sm:w-16 md:w-20 h-0.5 sm:h-1 bg-gradient-to-r from-red-500 to-rose-600 rounded-full"></div>
            </h2>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 font-medium">أحدث المنتجات الطبية في مجموعتنا</p>
          </div>
          
          {/* شبكة المنتجات الجديدة - responsive grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2 sm:gap-3 md:gap-4">
            {newProducts.map((product, index) => (
              <div
                key={product.id}
                className="group relative bg-white rounded-lg sm:rounded-xl md:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 overflow-hidden"
              >
                {/* New Badge - smaller */}
                <div className="absolute top-1 sm:top-2 right-1 sm:right-2 z-20">
                  <div className="px-1.5 py-0.5 sm:px-2 sm:py-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs font-black rounded-full shadow-lg flex items-center gap-1">
                    <Zap className="w-2 h-2 sm:w-3 sm:h-3" />
                    <span className="text-xs">جديد</span>
                  </div>
                </div>

                {/* Product Image - أصغر */}
                <div className="relative aspect-square overflow-hidden">
                  <Link to={`/product/${product.id}`}>
                    <img
                      src={buildImageUrl(product.mainImage)}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        e.currentTarget.src = getFallbackImage('product');
                      }}
                    />
                  </Link>
                  
                  {/* Quick Actions - smaller */}
                  <div className="absolute bottom-1 sm:bottom-2 left-1 sm:left-2 flex gap-1 sm:gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button
                      onClick={() => handleWishlistToggle(product)}
                      className="w-6 h-6 sm:w-8 sm:h-8 bg-white/90 backdrop-blur-sm rounded-lg flex items-center justify-center shadow-lg"
                    >
                      <Heart className={`w-3 h-3 sm:w-4 sm:h-4 ${isInWishlist(product.id) ? 'text-red-600 fill-current' : 'text-gray-600'}`} />
                    </button>
                    <Link
                      to={`/product/${product.id}`}
                      className="w-6 h-6 sm:w-8 sm:h-8 bg-white/90 backdrop-blur-sm rounded-lg flex items-center justify-center shadow-lg"
                    >
                      <Eye className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" />
                    </Link>
                  </div>
                </div>

                {/* Product Info - أصغر */}
                <div className="p-2 sm:p-3 md:p-4">
                  <div className="text-xs font-black text-green-600 mb-1 uppercase tracking-wider flex items-center gap-1">
                    <Gem className="w-2 h-2 sm:w-3 sm:h-3" />
                    <span className="text-xs">جديد</span>
                  </div>
                  
                  <Link to={`/product/${product.id}`}>
                    <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 hover:text-red-600 transition-colors text-xs sm:text-sm md:text-base leading-tight">
                      {product.name}
                    </h3>
                  </Link>

                  {/* Rating - smaller */}
                  <div className="flex items-center gap-1 mb-2">
                    <div className="flex items-center gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-2.5 h-2.5 sm:w-3 sm:h-3 ${
                            i < 4 ? 'text-amber-400 fill-current' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-gray-500 font-medium">(4.8)</span>
                  </div>

                  {/* Price - smaller */}
                  <div className="mb-2 sm:mb-3">
                    <div className="flex items-center gap-1 sm:gap-2">
                      <span className="text-sm sm:text-base md:text-lg font-black bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">
                        {product.price.toFixed(2)}
                      </span>
                      <span className="text-xs text-gray-600">ر.س</span>
                    </div>
                  </div>

                  {/* Add to Cart Button - smaller */}
                  <button
                    onClick={() => handleAddToCart(product)}
                    disabled={product.stock === 0}
                    className={`w-full py-1.5 sm:py-2 px-2 sm:px-3 rounded-lg font-bold text-xs transition-all duration-300 flex items-center justify-center gap-1 ${
                      product.stock === 0
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transform hover:scale-105'
                    }`}
                  >
                    <ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="text-xs">إضافة</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Categories Section - أصغر للموبايل */}
        <div className="mb-8 sm:mb-12 md:mb-16">
          <div className="text-center mb-6 sm:mb-8 md:mb-10">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-gray-900 mb-2 sm:mb-3 relative inline-block">
              الأقسام الرئيسية
              <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-12 sm:w-16 md:w-20 h-0.5 sm:h-1 bg-gradient-to-r from-red-500 to-rose-600 rounded-full"></div>
            </h2>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 font-medium">اختر من مجموعتنا المتنوعة</p>
          </div>
          
          {/* شبكة الأقسام - responsive وأصغر */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3 md:gap-4">
            {categories.map((category, index) => (
              <Link
                key={category.id}
                to={`/products?category=${category.id}`}
                className="group relative overflow-hidden bg-white rounded-lg sm:rounded-xl md:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100"
              >
                <div className="aspect-square relative overflow-hidden">
                  <img
                    src={buildImageUrl(category.image)}
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      e.currentTarget.src = getFallbackImage('category');
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
                  <div className="absolute top-1 sm:top-2 right-1 sm:right-2">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30">
                      <Package className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4 text-white" />
                    </div>
                  </div>
                </div>
                
                <div className="p-2 sm:p-3 md:p-4">
                  <h3 className="font-bold text-gray-900 text-xs sm:text-sm md:text-base mb-1 group-hover:text-red-600 transition-colors line-clamp-1">
                    {category.name}
                  </h3>
                  
                  <div className="flex items-center text-red-600 font-semibold text-xs group-hover:gap-1 transition-all">
                    <span>استكشف</span>
                    <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Featured Products Section - أصغر */}
        <div className="mb-8 sm:mb-12 md:mb-16">
          <div className="flex flex-col sm:flex-row items-center justify-between mb-6 sm:mb-8 md:mb-10 gap-3">
            <div className="text-center sm:text-right">
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-gray-900 mb-1 sm:mb-2 flex items-center gap-2 sm:gap-3">
                <Crown className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-amber-500" />
                منتجات مختارة بعناية
              </h2>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 font-medium">أفضل المنتجات الطبية</p>
            </div>
            <Link 
              to="/products" 
              className="group flex items-center gap-1 sm:gap-2 px-3 sm:px-4 md:px-6 py-2 sm:py-3 bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 text-xs sm:text-sm md:text-base"
            >
              عرض الكل
              <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          
          {/* شبكة المنتجات المميزة - responsive */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3 md:gap-4">
            {featuredProducts.map((product, index) => (
              <div
                key={product.id}
                className="group relative bg-white rounded-lg sm:rounded-xl md:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 overflow-hidden"
              >
                {/* Badges - smaller */}
                <div className="absolute top-1 sm:top-2 right-1 sm:right-2 z-20">
                  <div className="flex flex-col gap-1">
                    {product.originalPrice && product.originalPrice > product.price && (
                      <div className="px-1.5 py-0.5 sm:px-2 sm:py-1 bg-gradient-to-r from-red-500 to-rose-600 text-white text-xs font-black rounded-full shadow-lg">
                        خصم {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                      </div>
                    )}
                    <div className="px-1.5 py-0.5 sm:px-2 sm:py-1 bg-gradient-to-r from-amber-400 to-yellow-500 text-white text-xs font-black rounded-full shadow-lg flex items-center gap-1">
                      <Sparkles className="w-2 h-2 sm:w-3 sm:h-3" />
                      <span className="text-xs">مميز</span>
                    </div>
                  </div>
                </div>

                {/* Product Image */}
                <div className="relative aspect-square overflow-hidden">
                  <Link to={`/product/${product.id}`}>
                    <img
                      src={buildImageUrl(product.mainImage)}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        e.currentTarget.src = getFallbackImage('product');
                      }}
                    />
                  </Link>
                  
                  {/* Quick Actions */}
                  <div className="absolute bottom-1 sm:bottom-2 left-1 sm:left-2 flex gap-1 sm:gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button
                      onClick={() => handleWishlistToggle(product)}
                      className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 bg-white/90 backdrop-blur-sm rounded-lg flex items-center justify-center shadow-lg"
                    >
                      <Heart className={`w-3 h-3 sm:w-4 sm:h-4 ${isInWishlist(product.id) ? 'text-red-600 fill-current' : 'text-gray-600'}`} />
                    </button>
                    <Link
                      to={`/product/${product.id}`}
                      className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 bg-white/90 backdrop-blur-sm rounded-lg flex items-center justify-center shadow-lg"
                    >
                      <Eye className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" />
                    </Link>
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-2 sm:p-3 md:p-4">
                  <div className="text-xs font-semibold text-red-600 mb-1 uppercase tracking-wider">
                    {categories.find(c => c.id === product.categoryId)?.name || 'منتج طبي'}
                  </div>
                  
                  <Link to={`/product/${product.id}`}>
                    <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 hover:text-red-600 transition-colors text-xs sm:text-sm md:text-base leading-tight">
                      {product.name}
                    </h3>
                  </Link>

                  {/* Rating */}
                  <div className="flex items-center gap-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-2.5 h-2.5 sm:w-3 sm:h-3 ${
                          i < 4 ? 'text-amber-400 fill-current' : 'text-gray-300'
                        }`}
                      />
                    ))}
                    <span className="text-xs text-gray-500 mr-1">(4.0)</span>
                  </div>

                  {/* Price */}
                  <div className="mb-2 sm:mb-3">
                    <div className="flex items-center gap-1 sm:gap-2">
                      <span className="text-sm sm:text-base md:text-lg font-black text-red-600">
                        {product.price.toFixed(2)}
                      </span>
                      <span className="text-xs text-gray-600">ر.س</span>
                      {product.originalPrice && product.originalPrice > product.price && (
                        <span className="text-xs text-gray-500 line-through">
                          {product.originalPrice.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Add to Cart Button */}
                  <button
                    onClick={() => handleAddToCart(product)}
                    disabled={product.stock === 0}
                    className={`w-full py-1.5 sm:py-2 px-2 sm:px-3 rounded-lg font-bold text-xs transition-all duration-300 flex items-center justify-center gap-1 ${
                      product.stock === 0
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-red-600 to-rose-600 text-white hover:from-red-700 hover:to-rose-700 shadow-lg hover:shadow-xl transform hover:scale-105'
                    }`}
                  >
                    <ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4" />
                    {product.stock === 0 ? 'نفد' : 'إضافة'}
                  </button>

                  {/* Stock Status */}
                  {product.stock > 0 && (
                    <div className="mt-1 sm:mt-2 text-center">
                      <span className={`text-xs font-semibold ${
                        product.stock < 10 ? 'text-orange-600' : 'text-emerald-600'
                      }`}>
                        {product.stock < 10 
                          ? `متبقي ${product.stock}` 
                          : 'متوفر'
                        }
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Services Section - أصغر للموبايل */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-8 sm:mb-12 md:mb-16">
          <div className="text-center group">
            <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl sm:rounded-2xl md:rounded-3xl flex items-center justify-center mx-auto mb-2 sm:mb-3 md:mb-4 shadow-lg group-hover:shadow-xl transform group-hover:scale-105 transition-all duration-300">
              <Users className="w-5 h-5 sm:w-7 sm:h-7 md:w-10 md:h-10 text-white" />
            </div>
            <h3 className="font-bold text-gray-900 mb-1 text-xs sm:text-sm md:text-base">تواصل متعدد</h3>
            <p className="text-gray-600 font-medium text-xs sm:text-sm">خدمة 24/7</p>
          </div>
          
          <div className="text-center group">
            <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl sm:rounded-2xl md:rounded-3xl flex items-center justify-center mx-auto mb-2 sm:mb-3 md:mb-4 shadow-lg group-hover:shadow-xl transform group-hover:scale-105 transition-all duration-300">
              <Truck className="w-5 h-5 sm:w-7 sm:h-7 md:w-10 md:h-10 text-white" />
            </div>
            <h3 className="font-bold text-gray-900 mb-1 text-xs sm:text-sm md:text-base">شحن سريع</h3>
            <p className="text-gray-600 font-medium text-xs sm:text-sm">نفس اليوم</p>
          </div>
          
          <div className="text-center group">
            <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl sm:rounded-2xl md:rounded-3xl flex items-center justify-center mx-auto mb-2 sm:mb-3 md:mb-4 shadow-lg group-hover:shadow-xl transform group-hover:scale-105 transition-all duration-300">
              <Shield className="w-5 h-5 sm:w-7 sm:h-7 md:w-10 md:h-10 text-white" />
            </div>
            <h3 className="font-bold text-gray-900 mb-1 text-xs sm:text-sm md:text-base">ضمان الجودة</h3>
            <p className="text-gray-600 font-medium text-xs sm:text-sm">أصلية 100%</p>
          </div>
          
          <div className="text-center group">
            <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl sm:rounded-2xl md:rounded-3xl flex items-center justify-center mx-auto mb-2 sm:mb-3 md:mb-4 shadow-lg group-hover:shadow-xl transform group-hover:scale-105 transition-all duration-300">
              <Crown className="w-5 h-5 sm:w-7 sm:h-7 md:w-10 md:h-10 text-white" />
            </div>
            <h3 className="font-bold text-gray-900 mb-1 text-xs sm:text-sm md:text-base">خدمة VIP</h3>
            <p className="text-gray-600 font-medium text-xs sm:text-sm">تجربة فاخرة</p>
          </div>
        </div>
      </div>

      {/* Footer - responsive */}
      <footer className="relative bg-gradient-to-br from-white via-gray-50 to-gray-100 py-4 sm:py-6 md:py-8 lg:py-10 border-t border-gray-200/60">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-100/30 via-transparent to-gray-200/30" />
        
        <div className="relative container mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6 lg:gap-8 mb-3 sm:mb-4 md:mb-6 lg:mb-8">
            
            <div className="col-span-1 text-center mb-3 sm:mb-0 flex flex-col items-center">
              <h3 className="text-sm sm:text-base md:text-lg lg:text-xl font-black bg-gradient-to-r from-gray-700 to-gray-800 bg-clip-text text-transparent mb-2">
                العينة الطبية
              </h3>

              <div className="flex flex-row justify-center gap-2 sm:gap-3 mt-2">
                <a
                  href="https://www.instagram.com/ghem.store10?igsh=cXU5cTJqc2V2Nmg="
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white/90 border border-gray-200/60 p-1.5 sm:p-2 rounded-full hover:bg-pink-100 transition-all shadow-sm"
                >
                  <Instagram size={16} color="#ec4899" className="w-3 h-3 sm:w-4 sm:h-4" />
                </a>

                <a
                  href="https://wa.me/966551064118"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-green-50 border border-green-200/60 p-1.5 sm:p-2 rounded-full hover:bg-green-100 transition-all shadow-sm"
                >
                  <Phone size={16} color="#22c55e" className="w-3 h-3 sm:w-4 sm:h-4" />
                </a>
              </div>
            </div>

            <div className="text-center">
              <h4 className="font-bold text-gray-800 mb-2 text-xs sm:text-sm md:text-base">روابط سريعة</h4>
              <div className="grid grid-cols-2 gap-1 sm:gap-2">
                <Link to="/" className="text-xs text-gray-700 hover:text-gray-800 bg-white/80 border border-gray-200/50 px-2 py-1 rounded-lg hover:bg-gray-50/80 transition-all duration-300">الرئيسية</Link>
                <Link to="/products" className="text-xs text-gray-700 hover:text-gray-800 bg-white/80 border border-gray-200/50 px-2 py-1 rounded-lg hover:bg-gray-50/80 transition-all duration-300">المنتجات</Link>
                <Link to="/about" className="text-xs text-gray-700 hover:text-gray-800 bg-white/80 border border-gray-200/50 px-2 py-1 rounded-lg hover:bg-gray-50/80 transition-all duration-300">من نحن</Link>
                <Link to="/contact" className="text-xs text-gray-700 hover:text-gray-800 bg-white/80 border border-gray-200/50 px-2 py-1 rounded-lg hover:bg-gray-50/80 transition-all duration-300">اتصل بنا</Link>
              </div>
            </div>

            <div className="text-center md:text-left">
              <h4 className="font-bold text-gray-800 mb-2 text-xs sm:text-sm md:text-base">تواصل معنا</h4>
              <div className="space-y-1">
                <div className="text-xs text-gray-700 bg-white/80 border border-gray-200/50 px-2 py-1 rounded-lg flex items-center justify-center md:justify-start gap-1">
                  <span>📞</span>
                  <span className="truncate">+966551064118</span>
                </div>
                <div className="text-xs text-gray-700 bg-white/80 border border-gray-200/50 px-2 py-1 rounded-lg flex items-center justify-center md:justify-start gap-1">
                  <span>📍</span>
                  <span className="truncate">السعودية</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200/60 pt-2 sm:pt-3 md:pt-4 text-center">
            <div className="bg-gradient-to-r from-white/80 via-gray-50/90 to-white/80 border border-gray-200/50 rounded-lg p-2 sm:p-3 md:p-4 shadow-lg">
              <p className="text-xs text-gray-700 font-medium">
                © 2025 العينة الطبية - جميع الحقوق محفوظة
              </p>
            </div>
          </div>
        </div>
      </footer>

      <WhatsAppButton />
    </div>
  );
};

export default HomePage; 