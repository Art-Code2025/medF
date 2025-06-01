import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Star, Heart, ShoppingCart, Package, Truck, Shield, Award, Phone, Mail, MapPin, Clock, Facebook, Twitter, Instagram, Eye, Users, Briefcase, Home, Accessibility, Stethoscope, Sparkles, Crown, Gem, Zap } from 'lucide-react';
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

  const featuredProducts = products.slice(0, 8);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center pt-32">
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 pt-32">
      
      {/* Hero Section - Ultra Luxury */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-red-900 to-slate-800"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItMnptLTEtMXYyaDJWMzN6bS0yIDJ2Mmgzdi0yem0tMSAxdjJoMnYtMnptLTEgMXYyaDN2LTJ6bS0xIDJ2Mmgydi0yem0wLTJ2Mmgydi0yeiIvPjwvZz48L2c+PC9zdmc+')] opacity-10"></div>
        
        <div className="relative h-[32rem] flex items-center justify-center">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <div className="mb-8">
              <div className="inline-flex items-center gap-4 mb-6">
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-r from-red-600 via-rose-500 to-red-700 rounded-full flex items-center justify-center shadow-2xl border-4 border-white/20 backdrop-blur-sm">
                    <div className="text-white font-black text-sm text-center">
                      <div>OTE</div>
                      <div className="text-xs opacity-90">STORE</div>
                    </div>
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full flex items-center justify-center animate-pulse">
                    <Crown className="w-3 h-3 text-white" />
                  </div>
                </div>
                <div className="text-right text-white">
                  <h1 className="text-5xl font-black mb-2 bg-gradient-to-r from-white via-red-100 to-white bg-clip-text text-transparent">
                    العينــة الطبيــة
                  </h1>
                  <p className="text-xl font-medium text-red-100">لوازم مستشفيات وأدوات طبية فاخرة</p>
                </div>
              </div>
              
              <h2 className="text-6xl font-black mb-8 bg-gradient-to-r from-white via-amber-200 to-white bg-clip-text text-transparent leading-tight">
                نجتهد لتخفف معاناتهم
              </h2>
              
              <p className="text-xl text-red-100 mb-10 max-w-3xl mx-auto leading-relaxed">
                اكتشف مجموعتنا الحصرية من المعدات الطبية عالية الجودة والمصممة بأحدث التقنيات لضمان أفضل رعاية صحية
              </p>
              
              <div className="flex items-center justify-center gap-6">
                <Link
                  to="/products"
                  className="group relative px-8 py-4 bg-gradient-to-r from-red-600 via-rose-500 to-red-700 text-white font-bold rounded-full shadow-2xl transform hover:scale-105 transition-all duration-300 border border-white/20 backdrop-blur-sm"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    استكشف المجموعة
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </Link>
                
                <Link
                  to="/sign-in"
                  className="px-8 py-4 bg-white/10 text-white font-semibold rounded-full border-2 border-white/30 backdrop-blur-sm hover:bg-white/20 transition-all duration-300"
                >
                  انضم إلينا
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Premium Installment Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 py-8 shadow-2xl">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iYSIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiBwYXR0ZXJuVHJhbnNmb3JtPSJyb3RhdGUoNDUpIj48cmVjdCB3aWR0aD0iMSIgaGVpZ2h0PSIyMCIgZmlsbD0iI2ZmZiIgZmlsbC1vcGFjaXR5PSIwLjA1Ii8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2EpIi8+PC9zdmc+')] opacity-30"></div>
        
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
        
        {/* Categories Section - Luxury Style */}
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

        {/* Featured Products Section - Premium Design */}
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
                {/* Premium Badge */}
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

                {/* Product Image */}
                <div className="relative aspect-square overflow-hidden">
                  <Link to={`/product/${product.id}`}>
                    <img
                      src={buildImageUrl(product.mainImage)}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  </Link>
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent group-hover:from-black/30 transition-all duration-300"></div>
                  
                  {/* Quick Actions */}
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

                {/* Product Info */}
                <div className="p-6">
                  <div className="text-xs font-semibold text-red-600 mb-2 uppercase tracking-wider">
                    {categories.find(c => c.id === product.categoryId)?.name || 'منتج طبي'}
                  </div>
                  
                  <Link to={`/product/${product.id}`}>
                    <h3 className="font-black text-gray-900 mb-3 line-clamp-2 hover:text-red-600 transition-colors text-lg leading-tight">
                      {product.name}
                    </h3>
                  </Link>

                  {/* Rating */}
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

                  {/* Price */}
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

                  {/* Add to Cart Button */}
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

                  {/* Stock Status */}
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

        {/* Services Section - Premium Icons */}
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
          
          {/* Bathroom Chair */}
          <div className="relative overflow-hidden bg-gradient-to-br from-teal-500 via-cyan-600 to-blue-700 rounded-3xl shadow-2xl group">
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSI0Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30"></div>
            
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

          {/* Electric Chair */}
          <div className="relative overflow-hidden bg-gradient-to-br from-purple-500 via-pink-600 to-rose-700 rounded-3xl shadow-2xl group">
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzR2Mi0yem0tMS0xdjJoMnYtMXptLTIgMnYyaDN2LTJ6bS0xIDF2Mmgydi0yem0tMSAxdjJoM3YtMnptLTEgMnYyaDJ2LTJ6bTAtMnYyaDJ2LTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30"></div>
            
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

      {/* Premium Footer */}
      <footer className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-gray-900 to-slate-800">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDYwIDAgTCAwIDAgMCA2MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZmZmZmZmIiBzdHJva2Utb3BhY2l0eT0iMC4wMyIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 py-16">
          
          {/* Social Media Icons */}
          <div className="flex justify-center gap-6 mb-12">
            <a href="#" className="group w-14 h-14 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center hover:shadow-2xl transform hover:scale-110 transition-all duration-300 border border-blue-500/30">
              <Instagram className="w-7 h-7 text-white group-hover:scale-110 transition-transform" />
            </a>
            <a href="#" className="group w-14 h-14 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center hover:shadow-2xl transform hover:scale-110 transition-all duration-300 border border-blue-400/30">
              <Facebook className="w-7 h-7 text-white group-hover:scale-110 transition-transform" />
            </a>
            <a href="#" className="group w-14 h-14 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center hover:shadow-2xl transform hover:scale-110 transition-all duration-300 border border-emerald-400/30">
              <Phone className="w-7 h-7 text-white group-hover:scale-110 transition-transform" />
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-center mb-12">
            
            {/* خدمة العملاء */}
            <div>
              <h3 className="font-black text-2xl text-white mb-6 flex items-center justify-center gap-2">
                <Crown className="w-6 h-6 text-amber-400" />
                خدمة العملاء المميزة
              </h3>
              <ul className="space-y-3 text-gray-300">
                <li className="hover:text-white transition-colors cursor-pointer font-medium">تواصل معنا</li>
                <li className="hover:text-white transition-colors cursor-pointer font-medium">الإرجاع والاستبدال</li>
                <li className="hover:text-white transition-colors cursor-pointer font-medium">الشروط والأحكام</li>
                <li className="hover:text-white transition-colors cursor-pointer font-medium">الدعم الفني</li>
              </ul>
            </div>

            {/* عن الموقع */}
            <div>
              <h3 className="font-black text-2xl text-white mb-6 flex items-center justify-center gap-2">
                <Gem className="w-6 h-6 text-amber-400" />
                العينة الطبية
              </h3>
              <ul className="space-y-3 text-gray-300">
                <li className="hover:text-white transition-colors cursor-pointer font-medium">من نحن</li>
                <li className="hover:text-white transition-colors cursor-pointer font-medium">سياسة الخصوصية</li>
                <li className="hover:text-white transition-colors cursor-pointer font-medium">شروط الاستخدام</li>
                <li className="hover:text-white transition-colors cursor-pointer font-medium">آلية الشكاوى</li>
              </ul>
            </div>
          </div>

          {/* Premium Copyright */}
          <div className="pt-8 border-t border-white/10 text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-rose-600 rounded-full flex items-center justify-center">
                <Crown className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-black text-white">العينة الطبية</span>
            </div>
            <p className="text-gray-400 font-medium">
              © 2024 العينة الطبية - جميع الحقوق محفوظة | تصميم فاخر للمعدات الطبية
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage; 