import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Star, Heart, ShoppingCart, Package, Users, Award, Truck, Shield, Stethoscope, Activity, TrendingUp, CheckCircle, ArrowRight, HeartHandshake, Microscope, Pill } from 'lucide-react';
import { toast } from 'react-toastify';
import { addToCartUnified } from '../utils/cartUtils';
import { buildImageUrl, apiCall, API_ENDPOINTS } from '../config/api';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  stock: number;
  mainImage: string;
  categoryId: number;
}

interface Category {
  id: number;
  name: string;
  description: string;
  image: string;
}

const HomePage: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        const [productsData, categoriesData] = await Promise.all([
          apiCall(API_ENDPOINTS.PRODUCTS),
          apiCall(API_ENDPOINTS.CATEGORIES)
        ]);
        
        // Get first 8 products as featured
        setFeaturedProducts(productsData.slice(0, 8));
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error loading data:', error);
        toast.error('حدث خطأ في تحميل البيانات');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleAddToCart = async (productId: number, productName: string) => {
    try {
      await addToCartUnified(productId, productName, 1);
      toast.success(`تم إضافة ${productName} إلى السلة`, {
        position: "top-center",
        autoClose: 2000,
        style: {
          background: 'linear-gradient(135deg, #1e3a8a, #1d4ed8)',
          color: 'white',
          fontWeight: 'bold'
        }
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('حدث خطأ في إضافة المنتج للسلة');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-medical-light via-white to-medical-snow flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-medical-gray font-medium">جاري تحميل الصفحة...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-medical-light via-white to-medical-snow">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-hero py-20 lg:py-32">
        <div className="absolute inset-0 bg-primary-950/20"></div>
        
        {/* Floating Medical Icons */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-8 h-8 text-primary-300/20 animate-float">
            <Stethoscope className="w-full h-full" />
          </div>
          <div className="absolute top-40 right-20 w-12 h-12 text-primary-200/20 animate-pulse">
            <Activity className="w-full h-full" />
          </div>
          <div className="absolute bottom-32 left-1/4 w-6 h-6 text-primary-300/20 animate-float" style={{animationDelay: '2s'}}>
            <Pill className="w-full h-full" />
          </div>
          <div className="absolute top-1/2 right-10 w-10 h-10 text-primary-200/20 animate-pulse" style={{animationDelay: '3s'}}>
            <Microscope className="w-full h-full" />
          </div>
        </div>

        <div className="relative container-responsive">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-right">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
                <Award className="w-4 h-4 text-accent-emerald" />
                <span className="text-white text-sm font-medium">شركة رائدة في المجال الطبي</span>
              </div>
              
              <h1 className="heading-responsive text-white font-bold leading-tight mb-6">
                <span className="block">حلول طبية متخصصة</span>
                <span className="block text-accent-emerald">لمستقبل أفضل</span>
              </h1>
              
              <p className="text-responsive text-gray-200 mb-8 max-w-2xl mx-auto lg:mx-0">
                نوفر أجود المنتجات الطبية والأدوات المتخصصة مع الالتزام بأعلى معايير الجودة والسلامة
                لخدمة المجتمع الطبي والمرضى على حد سواء.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link
                  to="/products"
                  className="inline-flex items-center gap-2 bg-accent-emerald hover:bg-accent-emerald/90 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-professional"
                >
                  <Package className="w-5 h-5" />
                  تصفح منتجاتنا
                </Link>
                <Link
                  to="/about"
                  className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 border border-white/30"
                >
                  عن الشركة
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
            
            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/20">
                    <Stethoscope className="w-8 h-8 text-accent-emerald mx-auto mb-3" />
                    <h3 className="text-white font-semibold mb-1">أدوات طبية</h3>
                    <p className="text-gray-300 text-sm">عالية الجودة</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/20">
                    <Shield className="w-8 h-8 text-accent-blue mx-auto mb-3" />
                    <h3 className="text-white font-semibold mb-1">ضمان الجودة</h3>
                    <p className="text-gray-300 text-sm">معايير عالمية</p>
                  </div>
                </div>
                <div className="space-y-4 pt-8">
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/20">
                    <Activity className="w-8 h-8 text-accent-teal mx-auto mb-3" />
                    <h3 className="text-white font-semibold mb-1">دعم فني</h3>
                    <p className="text-gray-300 text-sm">متاح دائماً</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/20">
                    <Truck className="w-8 h-8 text-accent-amber mx-auto mb-3" />
                    <h3 className="text-white font-semibold mb-1">توصيل سريع</h3>
                    <p className="text-gray-300 text-sm">في جميع أنحاء المملكة</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-16 bg-white border-b border-gray-100">
        <div className="container-responsive">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-medical-charcoal mb-2">+10K</h3>
              <p className="text-medical-gray">عميل راضٍ</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-medical-charcoal mb-2">+500</h3>
              <p className="text-medical-gray">منتج طبي</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-medical-charcoal mb-2">15+</h3>
              <p className="text-medical-gray">سنة خبرة</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-medical-charcoal mb-2">99%</h3>
              <p className="text-medical-gray">معدل الرضا</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      {categories.length > 0 && (
        <section className="py-20">
          <div className="container-responsive">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-primary-50 rounded-full px-4 py-2 mb-4">
                <Package className="w-4 h-4 text-primary-600" />
                <span className="text-primary-600 text-sm font-medium">تصنيفاتنا الطبية</span>
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-medical-charcoal mb-4">
                مجموعة شاملة من المنتجات الطبية
              </h2>
              <p className="text-responsive text-medical-gray max-w-2xl mx-auto">
                نغطي جميع احتياجاتك الطبية من خلال تشكيلة واسعة من المنتجات المتخصصة والمعتمدة
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {categories.slice(0, 6).map((category) => (
                <Link
                  key={category.id}
                  to={`/products?category=${category.id}`}
                  className="group bg-white rounded-2xl overflow-hidden shadow-card hover:shadow-professional transition-all duration-300 transform hover:-translate-y-2 border border-gray-100"
                >
                  <div className="relative overflow-hidden h-48">
                    <img
                      src={buildImageUrl(category.image)}
                      alt={category.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-medical-charcoal/60 via-transparent to-transparent"></div>
                    <div className="absolute bottom-4 right-4">
                      <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                        <ArrowRight className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-medical-charcoal mb-2 group-hover:text-primary-600 transition-colors duration-200">
                      {category.name}
                    </h3>
                    <p className="text-medical-gray text-sm line-clamp-2">
                      {category.description}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products Section */}
      {featuredProducts.length > 0 && (
        <section className="py-20 bg-medical-light">
          <div className="container-responsive">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-accent-emerald/10 rounded-full px-4 py-2 mb-4">
                <Star className="w-4 h-4 text-accent-emerald" />
                <span className="text-accent-emerald text-sm font-medium">منتجات مميزة</span>
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-medical-charcoal mb-4">
                أحدث منتجاتنا الطبية
              </h2>
              <p className="text-responsive text-medical-gray max-w-2xl mx-auto">
                اكتشف أحدث وأفضل منتجاتنا الطبية المختارة بعناية لتلبية احتياجاتك المهنية
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredProducts.map((product) => (
                <div
                  key={product.id}
                  className="group bg-white rounded-2xl overflow-hidden shadow-card hover:shadow-professional transition-all duration-300 transform hover:-translate-y-2 border border-gray-100"
                >
                  <div className="relative overflow-hidden h-48">
                    <img
                      src={buildImageUrl(product.mainImage)}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    {product.originalPrice && product.originalPrice > product.price && (
                      <div className="absolute top-3 right-3 bg-accent-red text-white px-2 py-1 rounded-lg text-xs font-bold">
                        وفر {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                      </div>
                    )}
                    <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center hover:bg-accent-red hover:text-white transition-colors duration-200">
                        <Heart className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-medical-charcoal mb-2 group-hover:text-primary-600 transition-colors duration-200 line-clamp-2">
                      {product.name}
                    </h3>
                    
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-2xl font-bold text-medical-charcoal">
                        {product.price} ر.س
                      </span>
                      {product.originalPrice && product.originalPrice > product.price && (
                        <span className="text-sm text-medical-gray line-through">
                          {product.originalPrice} ر.س
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-accent-amber text-accent-amber" />
                        ))}
                        <span className="text-xs text-medical-gray mr-1">(4.8)</span>
                      </div>
                      
                      <button
                        onClick={() => handleAddToCart(product.id, product.name)}
                        className="flex items-center gap-1 bg-gradient-primary text-white px-4 py-2 rounded-lg hover:shadow-button transition-all duration-300 transform hover:scale-105 text-sm font-medium"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        أضف
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="text-center mt-12">
              <Link
                to="/products"
                className="inline-flex items-center gap-2 bg-gradient-primary text-white px-8 py-4 rounded-xl font-semibold hover:shadow-button transition-all duration-300 transform hover:scale-105"
              >
                عرض جميع المنتجات
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Why Choose Us Section */}
      <section className="py-20 bg-white">
        <div className="container-responsive">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-medical-charcoal mb-4">
              لماذا نحن الخيار الأمثل؟
            </h2>
            <p className="text-responsive text-medical-gray max-w-2xl mx-auto">
              نلتزم بتقديم أعلى مستويات الجودة والخدمة في مجال المنتجات الطبية
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-accent-emerald/5 to-accent-emerald/10 border border-accent-emerald/20">
              <div className="w-16 h-16 bg-accent-emerald rounded-2xl flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-medical-charcoal mb-4">جودة معتمدة</h3>
              <p className="text-medical-gray">
                جميع منتجاتنا معتمدة من هيئة الغذاء والدواء ومطابقة للمعايير الدولية
              </p>
            </div>
            
            <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-accent-blue/5 to-accent-blue/10 border border-accent-blue/20">
              <div className="w-16 h-16 bg-accent-blue rounded-2xl flex items-center justify-center mx-auto mb-6">
                <HeartHandshake className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-medical-charcoal mb-4">خدمة عملاء متميزة</h3>
              <p className="text-medical-gray">
                فريق دعم متخصص ومدرب لمساعدتك في جميع استفساراتك على مدار الساعة
              </p>
            </div>
            
            <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-accent-teal/5 to-accent-teal/10 border border-accent-teal/20">
              <div className="w-16 h-16 bg-accent-teal rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Truck className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-medical-charcoal mb-4">توصيل احترافي</h3>
              <p className="text-medical-gray">
                نضمن وصول منتجاتك بأمان وفي الوقت المحدد مع خدمات التوصيل المتخصصة
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 bg-primary-950/30"></div>
        <div className="relative container-responsive text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
              ابدأ رحلتك الطبية معنا اليوم
            </h2>
            <p className="text-xl text-gray-200 mb-8">
              انضم إلى آلاف العملاء الذين يثقون في منتجاتنا الطبية عالية الجودة
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/products"
                className="inline-flex items-center gap-2 bg-accent-emerald hover:bg-accent-emerald/90 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-professional"
              >
                <Package className="w-5 h-5" />
                تصفح المنتجات
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 border border-white/30"
              >
                تواصل معنا
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage; 