import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Star, Heart, ShoppingCart, Package, Truck, Shield, Award, Phone, Mail, MapPin, Clock, Facebook, Twitter, Instagram, Eye, Users, Briefcase, Home, Accessibility, Stethoscope } from 'lucide-react';
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

  const featuredProducts = products.slice(0, 5);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-32">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-32">
      
      {/* Hero Section - Exact OTE Style */}
      <div className="relative">
        <div 
          className="h-96 bg-cover bg-center relative"
          style={{
            backgroundImage: 'url("https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=2053&auto=format&fit=crop")'
          }}
        >
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="absolute inset-0 flex items-center justify-end pr-16">
            <div className="text-right text-white max-w-md">
              <div className="flex items-center justify-end mb-4">
                <div className="bg-white rounded-full p-4 ml-4">
                  <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">العينة<br/>الطبية</span>
                  </div>
                </div>
                <div>
                  <h1 className="text-4xl font-bold mb-2">العينــة الطبيــة</h1>
                  <p className="text-xl">لوازم مستشفيات وأدوات طبية</p>
                </div>
              </div>
              <h2 className="text-5xl font-bold mb-4">نجتهد لتخفف معاناتهم</h2>
            </div>
          </div>
        </div>
      </div>

      {/* Installment Offer Banner */}
      <div className="bg-gradient-to-r from-orange-400 to-orange-600 py-6">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-6xl font-bold text-white opacity-20">0</div>
            <div className="text-white">
              <h3 className="text-2xl font-bold">قسط مشترياتك على 4 دفعات بدون رسوم</h3>
              <p className="text-lg">بحد أقصى 2000 ريال لإجمالي قيمة السلة</p>
            </div>
          </div>
          <div className="flex gap-4">
            <button className="bg-gradient-to-r from-orange-500 to-pink-500 text-white px-8 py-3 rounded-full font-bold">
              تمارا
            </button>
            <button className="bg-gradient-to-r from-green-400 to-green-600 text-white px-8 py-3 rounded-full font-bold">
              تابي
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Recent Products Section - Exact OTE Style */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">منتجات وصلت حديثاً</h2>
            <Link to="/products" className="text-red-600 hover:text-red-800 font-medium">
              عرض المزيد
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {featuredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 group relative"
              >
                {/* Discount Badge */}
                {product.originalPrice && product.originalPrice > product.price && (
                  <div className="absolute top-3 right-3 bg-red-600 text-white px-2 py-1 rounded text-xs font-bold z-10">
                    خصم {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                  </div>
                )}

                {/* Product Image */}
                <div className="relative overflow-hidden aspect-square">
                  <Link to={`/product/${product.id}`}>
                    <img
                      src={buildImageUrl(product.mainImage)}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </Link>
                  
                  {/* Quick Actions */}
                  <div className="absolute bottom-3 left-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleWishlistToggle(product)}
                      className="bg-white p-2 rounded-full shadow-md hover:bg-red-50"
                    >
                      <Heart className={`w-4 h-4 ${isInWishlist(product.id) ? 'text-red-600 fill-current' : 'text-gray-600'}`} />
                    </button>
                    <Link
                      to={`/product/${product.id}`}
                      className="bg-white p-2 rounded-full shadow-md hover:bg-blue-50"
                    >
                      <Eye className="w-4 h-4 text-gray-600" />
                    </Link>
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-4">
                  <div className="text-xs text-gray-500 mb-1">
                    {categories.find(c => c.id === product.categoryId)?.name || 'منتج طبي'}
                  </div>
                  
                  <Link to={`/product/${product.id}`}>
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-red-600 transition-colors text-sm">
                      {product.name}
                    </h3>
                  </Link>

                  {/* Rating */}
                  <div className="flex items-center gap-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 ${
                          i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>

                  {/* Price */}
                  <div className="mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-red-600">
                        {product.price.toFixed(2)} ر.س
                      </span>
                      {product.originalPrice && product.originalPrice > product.price && (
                        <span className="text-sm text-gray-500 line-through">
                          {product.originalPrice.toFixed(2)} ر.س
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Add to Cart Button */}
                  <button
                    onClick={() => handleAddToCart(product)}
                    disabled={product.stock === 0}
                    className={`w-full py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 font-medium text-sm ${
                      product.stock === 0
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-red-600 text-white hover:bg-red-700'
                    }`}
                  >
                    <ShoppingCart className="w-4 h-4" />
                    {product.stock === 0 ? 'نفد المخزون' : 'اضافة للسلة'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Categories Section - OTE Style Grid */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">منتجات مختارة</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* وسائل الراحة والاسترخاء */}
            <Link
              to="/products?category=1"
              className="relative h-64 bg-gradient-to-br from-brown-400 to-brown-600 rounded-lg overflow-hidden group"
            >
              <div className="absolute inset-0 bg-black/20"></div>
              <div className="absolute bottom-6 right-6">
                <div className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold">
                  وسائل الراحة والاسترخاء
                </div>
              </div>
              <div 
                className="w-full h-full bg-cover bg-center group-hover:scale-105 transition-transform duration-300"
                style={{
                  backgroundImage: 'url("https://images.unsplash.com/photo-1586297135537-94bc9ba060aa?q=80&w=2000&auto=format&fit=crop")'
                }}
              ></div>
            </Link>

            {/* قسم الرعاية التنفسية */}
            <Link
              to="/products?category=2"
              className="relative h-64 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg overflow-hidden group"
            >
              <div className="absolute inset-0 bg-black/20"></div>
              <div className="absolute bottom-6 right-6">
                <div className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold">
                  قسم الرعاية التنفسية
                </div>
              </div>
              <div 
                className="w-full h-full bg-cover bg-center group-hover:scale-105 transition-transform duration-300"
                style={{
                  backgroundImage: 'url("https://images.unsplash.com/photo-1559757148-5c350d0d3c56?q=80&w=2000&auto=format&fit=crop")'
                }}
              ></div>
            </Link>

            {/* الممارسين الصحيين */}
            <Link
              to="/products?category=3"
              className="relative h-64 bg-gradient-to-br from-teal-400 to-teal-600 rounded-lg overflow-hidden group"
            >
              <div className="absolute inset-0 bg-black/20"></div>
              <div className="absolute bottom-6 right-6">
                <div className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold">
                  الممارسين الصحيين
                </div>
              </div>
              <div 
                className="w-full h-full bg-cover bg-center group-hover:scale-105 transition-transform duration-300"
                style={{
                  backgroundImage: 'url("https://images.unsplash.com/photo-1582750433449-648ed127bb54?q=80&w=2000&auto=format&fit=crop")'
                }}
              ></div>
            </Link>

            {/* قسم أداء المناسك */}
            <Link
              to="/products?category=4"
              className="relative h-64 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg overflow-hidden group"
            >
              <div className="absolute inset-0 bg-black/20"></div>
              <div className="absolute bottom-6 right-6">
                <div className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold">
                  قسم أداء المناسك
                </div>
              </div>
              <div 
                className="w-full h-full bg-cover bg-center group-hover:scale-105 transition-transform duration-300"
                style={{
                  backgroundImage: 'url("https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?q=80&w=2000&auto=format&fit=crop")'
                }}
              ></div>
            </Link>

            {/* قسم الرعاية المنزلية */}
            <Link
              to="/products?category=5"
              className="relative h-64 bg-gradient-to-br from-green-400 to-green-600 rounded-lg overflow-hidden group"
            >
              <div className="absolute inset-0 bg-black/20"></div>
              <div className="absolute bottom-6 right-6">
                <div className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold">
                  قسم الرعاية المنزلية
                </div>
              </div>
              <div 
                className="w-full h-full bg-cover bg-center group-hover:scale-105 transition-transform duration-300"
                style={{
                  backgroundImage: 'url("https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?q=80&w=2000&auto=format&fit=crop")'
                }}
              ></div>
            </Link>

            {/* تجهيزات ذوي الهمم */}
            <Link
              to="/products?category=6"
              className="relative h-64 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-lg overflow-hidden group"
            >
              <div className="absolute inset-0 bg-black/20"></div>
              <div className="absolute bottom-6 right-6">
                <div className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold">
                  تجهيزات ذوي الهمم
                </div>
              </div>
              <div 
                className="w-full h-full bg-cover bg-center group-hover:scale-105 transition-transform duration-300"
                style={{
                  backgroundImage: 'url("https://images.unsplash.com/photo-1559757175-0eb30cd8c063?q=80&w=2000&auto=format&fit=crop")'
                }}
              ></div>
            </Link>
          </div>
        </div>

        {/* Services Icons Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          <div className="text-center">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Users className="w-10 h-10 text-blue-600" />
            </div>
            <h3 className="font-bold text-gray-900 mb-1">قنوات تواصل</h3>
            <p className="text-sm text-gray-600">متعددة لخدمتكم</p>
          </div>
          
          <div className="text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Truck className="w-10 h-10 text-green-600" />
            </div>
            <h3 className="font-bold text-gray-900 mb-1">خيارات شحن</h3>
            <p className="text-sm text-gray-600">متميزة</p>
          </div>
          
          <div className="text-center">
            <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Package className="w-10 h-10 text-yellow-600" />
            </div>
            <h3 className="font-bold text-gray-900 mb-1">خيارات دفع</h3>
            <p className="text-sm text-gray-600">متنوعة وآمنة</p>
          </div>
          
          <div className="text-center">
            <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <MapPin className="w-10 h-10 text-purple-600" />
            </div>
            <h3 className="font-bold text-gray-900 mb-1">خدمات الاستعلام الفوري</h3>
            <p className="text-sm text-gray-600">من أقرب فرع</p>
          </div>
        </div>

        {/* Featured Products Carousel - OTE Style */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          
          {/* كرسي حمام */}
          <div className="bg-gradient-to-br from-teal-500 to-blue-600 rounded-lg p-8 text-white relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-2xl font-bold mb-2">كرسي حمام</h3>
              <p className="mb-4">تتميز المقاعد بخصائص خاصة للمرضى لتجعل المستخدم في أقصى الراحة والكرامة</p>
              <button className="bg-red-600 text-white px-6 py-2 rounded-full font-bold hover:bg-red-700 transition-colors">
                اطلب الآن
              </button>
            </div>
            <div className="absolute bottom-0 left-0 w-40 h-40 opacity-20">
              <Stethoscope className="w-full h-full" />
            </div>
          </div>

          {/* كرسي كهربائي */}
          <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg p-8 text-white relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-2xl font-bold mb-2">كرسي كهربائي</h3>
              <p className="mb-4">كرسي كهربائي يحكم في الحركة السلسة والمناورة القادرة لتجعل المنصف في أقصى الراحة</p>
              <button className="bg-red-600 text-white px-6 py-2 rounded-full font-bold hover:bg-red-700 transition-colors">
                اطلب الآن
              </button>
            </div>
            <div className="absolute bottom-0 left-0 w-40 h-40 opacity-20">
              <Accessibility className="w-full h-full" />
            </div>
          </div>
        </div>
      </div>

      {/* Footer - OTE Style */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-12">
          
          {/* Social Media Icons */}
          <div className="flex justify-center gap-4 mb-8">
            <a href="#" className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors">
              <Instagram className="w-6 h-6" />
            </a>
            <a href="#" className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors">
              <Phone className="w-6 h-6" />
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-center">
            
            {/* خدمة العملاء */}
            <div>
              <h3 className="font-bold text-lg mb-4">خدمة العملاء</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>تواصل معنا</li>
                <li>الإرجاع والاستبدال</li>
                <li>شروطنا</li>
                <li>تحصيل</li>
              </ul>
            </div>

            {/* عن الموقع */}
            <div>
              <h3 className="font-bold text-lg mb-4">عن الموقع</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>عن العينة</li>
                <li>الخصوصية</li>
                <li>شروط الاستخدام</li>
                <li>سياسة الإرجاع والاستبدال</li>
                <li>آلية الشكاوي</li>
              </ul>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="mt-8 pt-8 border-t border-gray-800 text-center">
            <p className="text-sm text-gray-400">
              البوابة الطبية جميع الحقوق محفوظة © 2023 • Alamazon.com
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage; 