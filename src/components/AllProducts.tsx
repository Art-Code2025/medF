import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Star, Heart, ShoppingCart, Package, Grid, List, Filter, SlidersHorizontal, Search, Eye, Crown, Sparkles, Gem, Zap } from 'lucide-react';
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

const AllProducts: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadData();
    
    // Check for search params
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    
    if (category) {
      setSelectedCategory(parseInt(category));
    }
    if (search) {
      setSearchQuery(search);
    }
  }, [searchParams]);

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

  const handleCategoryChange = (categoryId: number | null) => {
    setSelectedCategory(categoryId);
    const newSearchParams = new URLSearchParams(searchParams);
    
    if (categoryId) {
      newSearchParams.set('category', categoryId.toString());
    } else {
      newSearchParams.delete('category');
    }
    
    setSearchParams(newSearchParams);
  };

  const handleAddToCart = async (product: Product) => {
    try {
      await addToCartUnified(
        product.id,
        product.name,
        1
      );
      
      toast.success(`تم إضافة ${product.name} إلى السلة`, {
        position: "top-center",
        autoClose: 2000
      });
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

  // Filter and sort products
  let filteredProducts = products;

  // Filter by category
  if (selectedCategory) {
    filteredProducts = filteredProducts.filter(product => product.categoryId === selectedCategory);
  }

  // Filter by search
  if (searchQuery) {
    filteredProducts = filteredProducts.filter(product => 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  // Sort products
  switch (sortBy) {
    case 'price-low':
      filteredProducts.sort((a, b) => a.price - b.price);
      break;
    case 'price-high':
      filteredProducts.sort((a, b) => b.price - a.price);
      break;
    case 'name':
      filteredProducts.sort((a, b) => a.name.localeCompare(b.name, 'ar'));
      break;
    default:
      // newest - keep original order
      break;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center pt-32">
        <div className="text-center">
          <div className="relative mb-8">
            <div className="w-20 h-20 border-4 border-gradient-to-r from-red-500 to-rose-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 w-20 h-20 border-4 border-gradient-to-r from-amber-400 to-orange-500 border-t-transparent rounded-full animate-ping mx-auto opacity-20"></div>
          </div>
          <p className="text-slate-600 font-medium text-lg">جاري تحميل المنتجات الفاخرة...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 pt-40">
      <div className="max-w-7xl mx-auto">
        <div className="flex gap-8 p-6">
          
          {/* Premium Sidebar */}
          <aside className="w-96 bg-white rounded-3xl shadow-2xl border border-gray-100 h-fit sticky top-44 overflow-hidden">
            
            {/* Premium Categories Section */}
            <div className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-red-600 to-rose-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Package className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-gray-900">الأقسام الفاخرة</h2>
                  <p className="text-sm text-gray-600 font-medium">اختر التصنيف المطلوب</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <button
                  onClick={() => handleCategoryChange(null)}
                  className={`w-full text-right px-6 py-4 rounded-2xl transition-all duration-300 flex items-center justify-between group ${
                    selectedCategory === null 
                      ? 'bg-gradient-to-r from-red-50 to-rose-50 text-red-600 border-2 border-red-200 shadow-lg' 
                      : 'text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-red-50/30 border-2 border-transparent hover:border-red-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Crown className="w-5 h-5" />
                    <span className="font-bold">جميع المنتجات</span>
                  </div>
                  <ChevronLeft className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryChange(category.id)}
                    className={`w-full text-right px-6 py-4 rounded-2xl transition-all duration-300 flex items-center justify-between group ${
                      selectedCategory === category.id 
                        ? 'bg-gradient-to-r from-red-50 to-rose-50 text-red-600 border-2 border-red-200 shadow-lg' 
                        : 'text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-red-50/30 border-2 border-transparent hover:border-red-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Gem className="w-5 h-5" />
                      <span className="font-bold">{category.name}</span>
                    </div>
                    <ChevronLeft className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                ))}
              </div>
            </div>

            {/* Premium Filter Section */}
            <div className="px-8 pb-8 border-t border-gray-100">
              <div className="flex items-center gap-3 mb-6 mt-8">
                <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                  <SlidersHorizontal className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-black text-gray-900">فلاتر متقدمة</h3>
              </div>
              
              {/* Premium Price Range Filter */}
              <div className="mb-6">
                <h4 className="text-sm font-black text-gray-700 mb-4 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  نطاق السعر
                </h4>
                <div className="space-y-3">
                  {[
                    { label: 'أقل من 100 ر.س', gradient: 'from-emerald-500 to-teal-600' },
                    { label: '100 - 500 ر.س', gradient: 'from-blue-500 to-cyan-600' },
                    { label: '500 - 1000 ر.س', gradient: 'from-purple-500 to-pink-600' },
                    { label: 'أكثر من 1000 ر.س', gradient: 'from-red-500 to-rose-600' }
                  ].map((item, index) => (
                    <label key={index} className="flex items-center gap-3 text-sm text-gray-600 font-medium cursor-pointer group">
                      <div className="relative">
                        <input type="checkbox" className="sr-only" />
                        <div className={`w-5 h-5 bg-gradient-to-r ${item.gradient} rounded-lg opacity-20 group-hover:opacity-40 transition-opacity`}></div>
                        <div className="absolute inset-0 w-5 h-5 border-2 border-gray-300 rounded-lg group-hover:border-red-400 transition-colors"></div>
                      </div>
                      {item.label}
                    </label>
                  ))}
                </div>
              </div>

              {/* Premium Brand Filter */}
              <div>
                <h4 className="text-sm font-black text-gray-700 mb-4 flex items-center gap-2">
                  <Crown className="w-4 h-4 text-amber-500" />
                  العلامات التجارية
                </h4>
                <div className="space-y-3">
                  {[
                    { label: 'العلامة المميزة', gradient: 'from-red-500 to-rose-600' },
                    { label: 'علامة طبية فاخرة', gradient: 'from-purple-500 to-pink-600' },
                    { label: 'منتجات مستوردة', gradient: 'from-blue-500 to-cyan-600' }
                  ].map((item, index) => (
                    <label key={index} className="flex items-center gap-3 text-sm text-gray-600 font-medium cursor-pointer group">
                      <div className="relative">
                        <input type="checkbox" className="sr-only" />
                        <div className={`w-5 h-5 bg-gradient-to-r ${item.gradient} rounded-lg opacity-20 group-hover:opacity-40 transition-opacity`}></div>
                        <div className="absolute inset-0 w-5 h-5 border-2 border-gray-300 rounded-lg group-hover:border-red-400 transition-colors"></div>
                      </div>
                      {item.label}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Premium Main Content */}
          <main className="flex-1">
            
            {/* Premium Header Section */}
            <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 mb-8 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-red-500/5 to-rose-600/5 rounded-full transform translate-x-32 -translate-y-32"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-16 h-16 bg-gradient-to-r from-red-600 to-rose-600 rounded-2xl flex items-center justify-center shadow-xl">
                        <Package className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h1 className="text-4xl font-black text-gray-900 mb-2">
                          {selectedCategory 
                            ? categories.find(c => c.id === selectedCategory)?.name 
                            : searchQuery 
                              ? `نتائج البحث: "${searchQuery}"`
                              : 'المجموعة الفاخرة'
                          }
                        </h1>
                        <p className="text-gray-600 font-medium text-lg flex items-center gap-2">
                          <Crown className="w-5 h-5 text-amber-500" />
                          {filteredProducts.length} منتج فاخر متوفر
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    {/* Premium Sort Dropdown */}
                    <div className="flex items-center gap-3">
                      <label className="text-sm font-bold text-gray-600">ترتيب حسب:</label>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="border-2 border-red-200 rounded-xl px-4 py-3 text-sm font-medium focus:ring-4 focus:ring-red-100 focus:border-red-500 bg-gradient-to-r from-white to-red-50/30 shadow-lg"
                      >
                        <option value="newest">الأحدث</option>
                        <option value="price-low">السعر: من الأقل للأعلى</option>
                        <option value="price-high">السعر: من الأعلى للأقل</option>
                        <option value="name">الاسم أبجدياً</option>
                      </select>
                    </div>

                    {/* Premium View Mode Buttons */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setViewMode('grid')}
                        className={`p-3 rounded-xl border-2 transition-all duration-300 ${
                          viewMode === 'grid' 
                            ? 'bg-gradient-to-r from-red-50 to-rose-50 border-red-200 text-red-600 shadow-lg' 
                            : 'border-gray-200 text-gray-600 hover:bg-gradient-to-r hover:from-gray-50 hover:to-red-50/30 hover:border-red-100'
                        }`}
                      >
                        <Grid className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => setViewMode('list')}
                        className={`p-3 rounded-xl border-2 transition-all duration-300 ${
                          viewMode === 'list' 
                            ? 'bg-gradient-to-r from-red-50 to-rose-50 border-red-200 text-red-600 shadow-lg' 
                            : 'border-gray-200 text-gray-600 hover:bg-gradient-to-r hover:from-gray-50 hover:to-red-50/30 hover:border-red-100'
                        }`}
                      >
                        <List className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Premium Active Filters */}
                {(selectedCategory || searchQuery) && (
                  <div className="flex items-center gap-4 flex-wrap">
                    <span className="text-sm font-bold text-gray-600 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      الفلاتر النشطة:
                    </span>
                    {selectedCategory && (
                      <div className="flex items-center gap-2 bg-gradient-to-r from-red-50 to-rose-50 text-red-700 px-4 py-2 rounded-full text-sm font-bold border border-red-200 shadow-md">
                        {categories.find(c => c.id === selectedCategory)?.name}
                        <button
                          onClick={() => handleCategoryChange(null)}
                          className="ml-2 w-5 h-5 bg-red-200 text-red-600 rounded-full flex items-center justify-center hover:bg-red-300 transition-colors"
                        >
                          ×
                        </button>
                      </div>
                    )}
                    {searchQuery && (
                      <div className="flex items-center gap-2 bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 px-4 py-2 rounded-full text-sm font-bold border border-emerald-200 shadow-md">
                        البحث: "{searchQuery}"
                        <button
                          onClick={() => setSearchQuery('')}
                          className="ml-2 w-5 h-5 bg-emerald-200 text-emerald-600 rounded-full flex items-center justify-center hover:bg-emerald-300 transition-colors"
                        >
                          ×
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Premium Products Grid */}
            <div className={`grid gap-8 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' 
                : 'grid-cols-1'
            }`}>
              {filteredProducts.map((product, index) => (
                <div
                  key={product.id}
                  className={`group relative bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-4 border border-gray-100 overflow-hidden ${
                    viewMode === 'list' ? 'flex' : ''
                  }`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Premium Badges */}
                  <div className="absolute top-4 right-4 z-20">
                    <div className="flex flex-col gap-2">
                      {product.originalPrice && product.originalPrice > product.price && (
                        <div className="px-3 py-1 bg-gradient-to-r from-red-500 to-rose-600 text-white text-xs font-black rounded-full shadow-xl">
                          خصم {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                        </div>
                      )}
                      <div className="px-3 py-1 bg-gradient-to-r from-amber-400 to-yellow-500 text-white text-xs font-black rounded-full shadow-xl flex items-center gap-1">
                        <Crown className="w-3 h-3" />
                        فاخر
                      </div>
                    </div>
                  </div>

                  {/* Premium Product Image */}
                  <div className={`relative overflow-hidden ${
                    viewMode === 'list' ? 'w-64 h-64' : 'aspect-square'
                  }`}>
                    <Link to={`/product/${product.id}`}>
                      <img
                        src={buildImageUrl(product.mainImage)}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    </Link>
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent group-hover:from-black/40 transition-all duration-300"></div>
                    
                    {/* Premium Quick Actions */}
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

                    {/* Premium Stock Status */}
                    {product.stock < 10 && product.stock > 0 && (
                      <div className="absolute bottom-4 right-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white px-3 py-1 rounded-full text-xs font-black shadow-xl">
                        آخر {product.stock} قطع
                      </div>
                    )}

                    {/* Out of Stock */}
                    {product.stock === 0 && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
                        <span className="bg-gradient-to-r from-red-600 to-rose-600 text-white px-6 py-3 rounded-2xl font-black shadow-xl">نفد المخزون</span>
                      </div>
                    )}
                  </div>

                  {/* Premium Product Info */}
                  <div className={`p-6 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                    <div className="text-xs font-black text-red-600 mb-2 uppercase tracking-wider flex items-center gap-2">
                      <Gem className="w-3 h-3" />
                      {categories.find(c => c.id === product.categoryId)?.name || 'منتج طبي فاخر'}
                    </div>

                    <Link to={`/product/${product.id}`}>
                      <h3 className="font-black text-gray-900 mb-3 line-clamp-2 hover:text-red-600 transition-colors text-xl leading-tight">
                        {product.name}
                      </h3>
                    </Link>
                    
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
                      {product.description}
                    </p>

                    {/* Premium Rating */}
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
                      <span className="text-xs text-red-600 font-bold bg-red-50 px-2 py-1 rounded-full">تقييم ممتاز</span>
                    </div>

                    {/* Premium Price Section */}
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

                    {/* Premium Add to Cart Button */}
                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={product.stock === 0}
                      className={`w-full py-4 px-6 rounded-2xl font-black text-sm transition-all duration-300 flex items-center justify-center gap-3 shadow-xl ${
                        product.stock === 0
                          ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          : 'bg-gradient-to-r from-red-600 via-rose-500 to-red-700 text-white hover:from-red-700 hover:via-rose-600 hover:to-red-800 hover:shadow-2xl transform hover:scale-105'
                      }`}
                    >
                      <ShoppingCart className="w-5 h-5" />
                      {product.stock === 0 ? 'نفد المخزون' : 'إضافة للسلة الفاخرة'}
                      <Sparkles className="w-4 h-4" />
                    </button>

                    {/* Premium Additional Actions */}
                    <div className="flex items-center justify-between mt-4 text-xs">
                      <button
                        onClick={() => handleWishlistToggle(product)}
                        className="text-red-600 hover:text-red-800 transition-colors duration-300 font-bold flex items-center gap-1"
                      >
                        <Heart className="w-4 h-4" />
                        إضافة للمفضلة
                      </button>
                      <button className="text-purple-600 hover:text-purple-800 transition-colors duration-300 font-bold flex items-center gap-1">
                        <Gem className="w-4 h-4" />
                        مقارنة فاخرة
                      </button>
                    </div>

                    {/* Premium Stock Status Text */}
                    {product.stock > 0 && (
                      <div className="mt-4 text-center">
                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                          product.stock < 10 
                            ? 'text-amber-600 bg-amber-50 border border-amber-200' 
                            : 'text-emerald-600 bg-emerald-50 border border-emerald-200'
                        }`}>
                          {product.stock < 10 
                            ? `⚡ كمية محدودة - متبقي ${product.stock} قطع` 
                            : '✨ متوفر الآن - شحن فوري'
                          }
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Premium No Products Found */}
            {filteredProducts.length === 0 && (
              <div className="text-center py-20">
                <div className="w-32 h-32 bg-gradient-to-r from-red-100 to-rose-100 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl">
                  <Package className="w-16 h-16 text-red-400" />
                </div>
                <h3 className="text-3xl font-black text-gray-900 mb-4">لم يتم العثور على منتجات فاخرة</h3>
                <p className="text-gray-600 mb-8 text-lg font-medium max-w-md mx-auto leading-relaxed">
                  {searchQuery 
                    ? `لا توجد منتجات تطابق "${searchQuery}" في مجموعتنا الفاخرة`
                    : selectedCategory
                      ? 'لا توجد منتجات في هذا التصنيف الفاخر حالياً'
                      : 'لا توجد منتجات فاخرة متاحة حالياً'
                  }
                </p>
                <button
                  onClick={() => {
                    handleCategoryChange(null);
                    setSearchQuery('');
                  }}
                  className="bg-gradient-to-r from-red-600 to-rose-600 text-white px-8 py-4 rounded-2xl hover:from-red-700 hover:to-rose-700 transition-all duration-300 font-black shadow-xl hover:shadow-2xl transform hover:scale-105"
                >
                  <span className="flex items-center gap-2">
                    <Crown className="w-5 h-5" />
                    استكشف المجموعة الفاخرة
                  </span>
                </button>
              </div>
            )}

            {/* Premium Load More */}
            {filteredProducts.length > 20 && (
              <div className="text-center mt-12">
                <button className="bg-white border-2 border-red-200 text-gray-700 px-10 py-4 rounded-2xl hover:bg-gradient-to-r hover:from-red-50 hover:to-rose-50 hover:border-red-300 transition-all duration-300 font-black shadow-lg hover:shadow-xl transform hover:scale-105">
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-red-600" />
                    عرض المزيد من المنتجات الفاخرة
                  </span>
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default AllProducts;