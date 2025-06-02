import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Star, Heart, ShoppingCart, Package, Truck, Shield, Award, Phone, Mail, MapPin, Clock, Facebook, Twitter, Instagram, Eye, Users, Briefcase, Home, Accessibility, Stethoscope, Sparkles, Crown, Gem, Zap } from 'lucide-react';
import { toast } from 'react-toastify';
import { buildImageUrl, apiCall, API_ENDPOINTS } from '../config/api';
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

  // Slider data
  const sliderData = [
    {
      id: 1,
      image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=2053&auto=format&fit=crop',
      title: 'العينة الطبية',
      subtitle: 'أحدث المعدات الطبية عالية الجودة لضمان أفضل رعاية صحية',
      buttonText: 'استكشف المنتجات',
      buttonLink: '/products'
    },
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?q=80&w=2000&auto=format&fit=crop',
      title: 'معدات طبية متطورة',
      subtitle: 'تقنيات حديثة ومبتكرة للمؤسسات الطبية والمستشفيات',
      buttonText: 'تصفح الآن',
      buttonLink: '/products'
    },
    {
      id: 3,
      image: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?q=80&w=2000&auto=format&fit=crop',
      title: 'رعاية صحية شاملة',
      subtitle: 'كل ما تحتاجه من معدات طبية تحت سقف واحد',
      buttonText: 'ابدأ التسوق',
      buttonLink: '/products'
    }
  ];

  const featuredProducts = products.slice(0, 8);
  const newProducts = products.slice(0, 6); // منتجات وصلت حديثاً

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-gradient-to-r from-red-500 to-rose-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            <div className="absolute inset-0 w-20 h-20 border-4 border-gradient-to-r from-amber-400 to-orange-500 border-t-transparent rounded-full animate-ping mx-auto opacity-20"></div>
          </div>
          <p className="text-slate-600 font-medium">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      
      {/* Image Slider - بدون فراغات */}
      <div className="w-full">
        <ImageSlider 
          slides={sliderData}
          autoPlay={true}
          autoPlayInterval={6000}
          height="h-[60vh] sm:h-[70vh] lg:h-[80vh]"
        />
      </div>

      {/* Premium Installment Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 py-8 shadow-2xl">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="text-8xl font-black text-white/20 select-none">0%</div>
            <div className="text-white">
              <h3 className="text-3xl font-black mb-2 flex items-center gap-2">
                <Gem className="w-8 h-8" />
                قسط مشترياتك الفاخرة على 4 دفعات بدون فوائد
              </h3>
              <p className="text-xl font-medium text-white/90">بحد أقصى 5000 ريال - تسوق الآن وادفع لاحقاً</p>
            </div>
          </div>
          
          <div className="flex gap-4">
            <button className="group px-8 py-3 bg-gradient-to-r from-rose-500 to-pink-600 text-white font-black rounded-full shadow-xl transform hover:scale-105 transition-all duration-300 border border-white/20">
              <span className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                تمارا
              </span>
            </button>
            <button className="group px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black rounded-full shadow-xl transform hover:scale-105 transition-all duration-300 border border-white/20">
              <span className="flex items-center gap-2">
                <Zap className="w-5 h-5 group-hover:scale-110 transition-transform" />
                تابي
              </span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-16">
        
        {/* منتجات وصلت حديثاً */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black text-gray-900 mb-4 relative inline-block">
              <span className="flex items-center gap-3">
                <Sparkles className="w-8 h-8 text-amber-500" />
                منتجات وصلت حديثاً
                <Sparkles className="w-8 h-8 text-amber-500" />
              </span>
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-20 h-1 bg-gradient-to-r from-red-500 to-rose-600 rounded-full"></div>
            </h2>
            <p className="text-xl text-gray-600 font-medium">أحدث المنتجات الطبية الفاخرة في مجموعتنا</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {newProducts.map((product, index) => (
              <div
                key={product.id}
                className="group relative bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 border border-gray-100 overflow-hidden"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* New Badge */}
                <div className="absolute top-4 right-4 z-20">
                  <div className="px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs font-black rounded-full shadow-xl flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    جديد
                  </div>
                </div>

                <div className="relative aspect-square overflow-hidden">
                  <Link to={`/product/${product.id}`}>
                    <img
                      src={buildImageUrl(product.mainImage)}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  </Link>
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent group-hover:from-black/30 transition-all duration-300"></div>
                  
                  <div className="absolute bottom-4 left-4 flex gap-3 opacity-0 group-hover:opacity-100 transform translate-y-6 group-hover:translate-y-0 transition-all duration-300">
                    <button
                      onClick={() => handleWishlistToggle(product)}
                      className="w-12 h-12 bg-white/90 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-xl hover:bg-red-50 transition-all duration-300 border border-white/50 group/btn"
                    >
                      <Heart className={`w-6 h-6 group-hover/btn:scale-110 transition-transform ${isInWishlist(product.id) ? 'text-red-600 fill-current' : 'text-gray-600'}`} />
                    </button>
                    <Link
                      to={`/product/${product.id}`}
                      className="w-12 h-12 bg-white/90 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-xl hover:bg-blue-50 transition-all duration-300 border border-white/50 group/btn"
                    >
                      <Eye className="w-6 h-6 text-gray-600 group-hover/btn:scale-110 transition-transform" />
                    </Link>
                  </div>
                </div>

                <div className="p-6">
                  <div className="text-xs font-black text-green-600 mb-2 uppercase tracking-wider flex items-center gap-2">
                    <Gem className="w-3 h-3" />
                    {categories.find(c => c.id === product.categoryId)?.name || 'منتج طبي جديد'}
                  </div>
                  
                  <Link to={`/product/${product.id}`}>
                    <h3 className="font-black text-gray-900 mb-3 line-clamp-2 hover:text-red-600 transition-colors text-xl leading-tight">
                      {product.name}
                    </h3>
                  </Link>

                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < 4 ? 'text-amber-400 fill-current' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-500 font-medium">(4.8)</span>
                    <span className="text-xs text-green-600 font-bold bg-green-50 px-2 py-1 rounded-full">جديد</span>
                  </div>

                  <div className="mb-6">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-3xl font-black bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">
                        {product.price.toFixed(2)}
                      </span>
                      <span className="text-sm font-bold text-gray-600">ر.س</span>
                      {product.originalPrice && product.originalPrice > product.price && (
                        <span className="text-sm text-gray-500 line-through font-medium">
                          {product.originalPrice.toFixed(2)} ر.س
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handleAddToCart(product)}
                    disabled={product.stock === 0}
                    className={`w-full py-4 px-6 rounded-2xl font-black text-sm transition-all duration-300 flex items-center justify-center gap-3 shadow-xl ${
                      product.stock === 0
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-green-600 via-emerald-500 to-green-700 text-white hover:from-green-700 hover:via-emerald-600 hover:to-green-800 hover:shadow-2xl transform hover:scale-105'
                    }`}
                  >
                    <ShoppingCart className="w-5 h-5" />
                    {product.stock === 0 ? 'نفد المخزون' : 'إضافة للسلة'}
                    <Sparkles className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Categories Section */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black text-gray-900 mb-4 relative inline-block">
              الأقسام الرئيسية
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-20 h-1 bg-gradient-to-r from-red-500 to-rose-600 rounded-full"></div>
            </h2>
            <p className="text-xl text-gray-600 font-medium">اختر من مجموعتنا المتنوعة من المنتجات الطبية الفاخرة</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {categories.map((category, index) => (
              <Link
                key={category.id}
                to={`/products?category=${category.id}`}
                className="group relative overflow-hidden bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100"
              >
                <div className="aspect-square relative overflow-hidden">
                  <img
                    src={buildImageUrl(category.image)}
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                  <div className="absolute top-4 right-4">
                    <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30">
                      <Package className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className="font-black text-gray-900 text-lg mb-2 group-hover:text-red-600 transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed line-clamp-2">
                    {category.description}
                  </p>
                  
                  <div className="mt-4 flex items-center text-red-600 font-semibold group-hover:gap-2 transition-all">
                    <span>استكشف</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
                
                <div className="absolute inset-0 bg-gradient-to-t from-red-500/0 to-red-500/0 group-hover:from-red-500/5 group-hover:to-transparent transition-all duration-300 rounded-3xl"></div>
              </Link>
            ))}
          </div>
        </div>

        {/* Featured Products Section */}
        <div className="mb-20">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-4xl font-black text-gray-900 mb-2 flex items-center gap-3">
                <Crown className="w-8 h-8 text-amber-500" />
                منتجات مختارة بعناية
              </h2>
              <p className="text-xl text-gray-600 font-medium">أفضل المنتجات الطبية عالية الجودة</p>
            </div>
            <Link 
              to="/products" 
              className="group flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              عرض الكل
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.map((product, index) => (
              <div
                key={product.id}
                className="group relative bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 border border-gray-100 overflow-hidden"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="absolute top-4 right-4 z-20">
                  <div className="flex flex-col gap-2">
                    {product.originalPrice && product.originalPrice > product.price && (
                      <div className="px-3 py-1 bg-gradient-to-r from-red-500 to-rose-600 text-white text-xs font-black rounded-full shadow-lg">
                        خصم {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                      </div>
                    )}
                    <div className="px-3 py-1 bg-gradient-to-r from-amber-400 to-yellow-500 text-white text-xs font-black rounded-full shadow-lg flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      مميز
                    </div>
                  </div>
                </div>

                <div className="relative aspect-square overflow-hidden">
                  <Link to={`/product/${product.id}`}>
                    <img
                      src={buildImageUrl(product.mainImage)}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  </Link>
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent group-hover:from-black/30 transition-all duration-300"></div>
                  
                  <div className="absolute bottom-4 left-4 flex gap-2 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                    <button
                      onClick={() => handleWishlistToggle(product)}
                      className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-red-50 transition-colors border border-white/50"
                    >
                      <Heart className={`w-5 h-5 ${isInWishlist(product.id) ? 'text-red-600 fill-current' : 'text-gray-600'}`} />
                    </button>
                    <Link
                      to={`/product/${product.id}`}
                      className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-blue-50 transition-colors border border-white/50"
                    >
                      <Eye className="w-5 h-5 text-gray-600" />
                    </Link>
                  </div>
                </div>

                <div className="p-6">
                  <div className="text-xs font-semibold text-red-600 mb-2 uppercase tracking-wider">
                    {categories.find(c => c.id === product.categoryId)?.name || 'منتج طبي'}
                  </div>
                  
                  <Link to={`/product/${product.id}`}>
                    <h3 className="font-black text-gray-900 mb-3 line-clamp-2 hover:text-red-600 transition-colors text-lg leading-tight">
                      {product.name}
                    </h3>
                  </Link>

                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < 4 ? 'text-amber-400 fill-current' : 'text-gray-300'
                        }`}
                      />
                    ))}
                    <span className="text-sm text-gray-500 mr-2">(4.0)</span>
                  </div>

                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-2xl font-black text-red-600">
                        {product.price.toFixed(2)}
                      </span>
                      <span className="text-sm font-medium text-gray-600">ر.س</span>
                      {product.originalPrice && product.originalPrice > product.price && (
                        <span className="text-sm text-gray-500 line-through font-medium">
                          {product.originalPrice.toFixed(2)} ر.س
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handleAddToCart(product)}
                    disabled={product.stock === 0}
                    className={`w-full py-3 px-4 rounded-full font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
                      product.stock === 0
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-red-600 to-rose-600 text-white hover:from-red-700 hover:to-rose-700 shadow-lg hover:shadow-xl transform hover:scale-105'
                    }`}
                  >
                    <ShoppingCart className="w-4 h-4" />
                    {product.stock === 0 ? 'نفد المخزون' : 'إضافة للسلة'}
                  </button>

                  {product.stock > 0 && (
                    <div className="mt-3 text-center">
                      <span className={`text-xs font-semibold ${
                        product.stock < 10 ? 'text-orange-600' : 'text-emerald-600'
                      }`}>
                        {product.stock < 10 
                          ? `⚡ متبقي ${product.stock} قطع فقط` 
                          : '✨ متوفر الآن'
                        }
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Services Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20">
          <div className="text-center group">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-xl group-hover:shadow-2xl transform group-hover:scale-110 transition-all duration-300">
              <Users className="w-10 h-10 text-white" />
            </div>
            <h3 className="font-black text-gray-900 mb-2">قنوات تواصل متعددة</h3>
            <p className="text-gray-600 font-medium">خدمة عملاء 24/7</p>
          </div>
          
          <div className="text-center group">
            <div className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-xl group-hover:shadow-2xl transform group-hover:scale-110 transition-all duration-300">
              <Truck className="w-10 h-10 text-white" />
            </div>
            <h3 className="font-black text-gray-900 mb-2">شحن سريع ومجاني</h3>
            <p className="text-gray-600 font-medium">توصيل في نفس اليوم</p>
          </div>
          
          <div className="text-center group">
            <div className="w-20 h-20 bg-gradient-to-r from-amber-500 to-orange-600 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-xl group-hover:shadow-2xl transform group-hover:scale-110 transition-all duration-300">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <h3 className="font-black text-gray-900 mb-2">ضمان الجودة</h3>
            <p className="text-gray-600 font-medium">منتجات أصلية 100%</p>
          </div>
          
          <div className="text-center group">
            <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-600 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-xl group-hover:shadow-2xl transform group-hover:scale-110 transition-all duration-300">
              <Crown className="w-10 h-10 text-white" />
            </div>
            <h3 className="font-black text-gray-900 mb-2">خدمة VIP</h3>
            <p className="text-gray-600 font-medium">تجربة تسوق فاخرة</p>
          </div>
        </div>

        {/* Premium CTA Banners */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          <div className="relative overflow-hidden bg-gradient-to-br from-teal-500 via-cyan-600 to-blue-700 rounded-3xl shadow-2xl group">
            <div className="absolute inset-0 bg-black/20"></div>
            
            <div className="relative p-8 h-64 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Accessibility className="w-8 h-8 text-white" />
                  <span className="text-white/80 font-semibold">كراسي طبية فاخرة</span>
                </div>
                <h3 className="text-3xl font-black text-white mb-3">كرسي حمام احترافي</h3>
                <p className="text-white/90 leading-relaxed">مصمم بأحدث التقنيات لضمان الراحة والكرامة القصوى للمرضى</p>
              </div>
              
              <Link
                to="/products?category=1"
                className="group inline-flex items-center gap-2 bg-white text-teal-700 px-6 py-3 rounded-full font-black hover:bg-white/90 transition-all duration-300 transform hover:scale-105 shadow-xl w-fit"
              >
                <Sparkles className="w-5 h-5" />
                اطلب الآن
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            
            <div className="absolute top-4 right-4 w-16 h-16 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20">
              <Gem className="w-8 h-8 text-white" />
            </div>
          </div>

          <div className="relative overflow-hidden bg-gradient-to-br from-purple-500 via-pink-600 to-rose-700 rounded-3xl shadow-2xl group">
            <div className="absolute inset-0 bg-black/20"></div>
            
            <div className="relative p-8 h-64 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Zap className="w-8 h-8 text-white" />
                  <span className="text-white/80 font-semibold">تقنية متقدمة</span>
                </div>
                <h3 className="text-3xl font-black text-white mb-3">كرسي كهربائي ذكي</h3>
                <p className="text-white/90 leading-relaxed">تحكم كامل بالحركة والمناورة مع أحدث أنظمة التحكم الذكية</p>
              </div>
              
              <Link
                to="/products?category=2"
                className="group inline-flex items-center gap-2 bg-white text-purple-700 px-6 py-3 rounded-full font-black hover:bg-white/90 transition-all duration-300 transform hover:scale-105 shadow-xl w-fit"
              >
                <Sparkles className="w-5 h-5" />
                اطلب الآن
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            
            <div className="absolute top-4 right-4 w-16 h-16 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20">
              <Crown className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Premium Footer - Mobile Optimized */}
      <footer className="relative bg-gradient-to-br from-white via-gray-50 to-gray-100 py-6 sm:py-8 lg:py-10 border-t border-gray-200/60 overflow-visible">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-100/30 via-transparent to-gray-200/30" />
        <div className="absolute top-0 left-0 w-48 h-48 sm:w-72 sm:h-72 lg:w-96 lg:h-96 bg-gray-200/15 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-48 h-48 sm:w-72 sm:h-72 lg:w-96 lg:h-96 bg-gray-300/15 rounded-full blur-3xl" />

        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-4 sm:mb-6 lg:mb-8">
            
            <div className="col-span-1 text-center mb-4 sm:mb-0 min-h-[100px] brand-section flex flex-col items-center">
              <h3 className="text-lg sm:text-xl lg:text-2xl font-black bg-gradient-to-r from-gray-700 to-gray-800 bg-clip-text text-transparent mb-2">
                العينة الطبية
              </h3>

              <div className="flex flex-row justify-center gap-x-3 gap-y-2 mt-3 social-media-icons sm:flex-row sm:justify-start">
                <a
                  href="https://www.instagram.com/ghem.store10?igsh=cXU5cTJqc2V2Nmg="
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Visit our Instagram page"
                  className="bg-white/90 backdrop-blur-xl border border-gray-200/60 p-2 rounded-full hover:bg-pink-100 transition-all shadow-sm z-50"
                >
                  <Instagram size={20} color="#ec4899" />
                </a>

                <a
                  href="https://wa.me/966551064118"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Contact us on WhatsApp"
                  className="bg-green-50 backdrop-blur-xl border border-green-200/60 p-2 rounded-full hover:bg-green-100 transition-all shadow-sm z-50"
                >
                  <Phone size={20} color="#22c55e" />
                </a>
              </div>
            </div>

            <div className="text-center">
              <h4 className="font-bold text-gray-800 mb-2 sm:mb-3 text-sm sm:text-base">روابط سريعة</h4>
              <div className="grid grid-cols-2 gap-1 sm:gap-2">
                <Link to="/" className="text-xs sm:text-sm text-gray-700 hover:text-gray-800 bg-white/80 backdrop-blur-xl border border-gray-200/50 px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg hover:bg-gray-50/80 transition-all duration-300">الرئيسية</Link>
                <Link to="/products" className="text-xs sm:text-sm text-gray-700 hover:text-gray-800 bg-white/80 backdrop-blur-xl border border-gray-200/50 px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg hover:bg-gray-50/80 transition-all duration-300">المنتجات</Link>
                <Link to="/about" className="text-xs sm:text-sm text-gray-700 hover:text-gray-800 bg-white/80 backdrop-blur-xl border border-gray-200/50 px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg hover:bg-gray-50/80 transition-all duration-300">من نحن</Link>
                <Link to="/contact" className="text-xs sm:text-sm text-gray-700 hover:text-gray-800 bg-white/80 backdrop-blur-xl border border-gray-200/50 px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg hover:bg-gray-50/80 transition-all duration-300">اتصل بنا</Link>
                <Link to="/privacy-policy" className="text-xs sm:text-sm text-gray-700 hover:text-gray-800 bg-white/80 backdrop-blur-xl border border-gray-200/50 px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg hover:bg-gray-50/80 transition-all duration-300">سياسة الخصوصية</Link>
                <Link to="/return-policy" className="text-xs sm:text-sm text-gray-700 hover:text-gray-800 bg-white/80 backdrop-blur-xl border border-gray-200/50 px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg hover:bg-gray-50/80 transition-all duration-300">سياسة الاسترجاع</Link>
              </div>
            </div>

            <div className="text-center md:text-left">
              <h4 className="font-bold text-gray-800 mb-2 sm:mb-3 text-sm sm:text-base">تواصل معنا</h4>
              <div className="space-y-1 sm:space-y-2">
                <div className="text-xs sm:text-sm text-gray-700 bg-white/80 backdrop-blur-xl border border-gray-200/50 px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg flex items-center justify-center md:justify-start gap-1">
                  <span>📞</span>
                  <span className="truncate">+966551064118</span>
                </div>
                <div className="text-xs sm:text-sm text-gray-700 bg-white/80 backdrop-blur-xl border border-gray-200/50 px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg flex items-center justify-center md:justify-start gap-1">
                  <span>✉️</span>
                  <span className="truncate">support@alamena.store</span>
                </div>
                <div className="text-xs sm:text-sm text-gray-700 bg-white/80 backdrop-blur-xl border border-gray-200/50 px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg flex items-center justify-center md:justify-start gap-1">
                  <span>📍</span>
                  <span className="truncate">السعودية</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200/60 pt-3 sm:pt-4 text-center">
            <div className="bg-gradient-to-r from-white/80 via-gray-50/90 to-white/80 backdrop-blur-xl border border-gray-200/50 rounded-lg sm:rounded-xl p-3 sm:p-4 max-w-full mx-auto shadow-lg">
              <p className="text-xs sm:text-sm text-gray-700 font-medium">
                © 2025 العينة الطبية - جميع الحقوق محفوظة
              </p>
            </div>
          </div>
        </div>
      </footer>

      {/* WhatsApp Button */}
      <WhatsAppButton />
    </div>
  );
};

export default HomePage; 