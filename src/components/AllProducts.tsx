import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Star, Heart, ShoppingCart, Package, Grid, List, Filter, SlidersHorizontal, Search } from 'lucide-react';
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-32">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل المنتجات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-32">
      <div className="max-w-7xl mx-auto">
        <div className="flex gap-6 p-4">
          
          {/* Sidebar - Exact OTE Store Style */}
          <aside className="w-80 bg-white rounded-lg shadow-sm border border-gray-200 h-fit sticky top-36">
            
            {/* Categories Section */}
            <div className="p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Package className="w-5 h-5 text-blue-600" />
                تسوق حسب الأقسام
              </h2>
              
              <div className="space-y-1">
                <button
                  onClick={() => handleCategoryChange(null)}
                  className={`w-full text-right px-4 py-3 rounded-lg transition-colors duration-200 flex items-center justify-between ${
                    selectedCategory === null 
                      ? 'bg-blue-50 text-blue-600 border border-blue-200' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span className="font-medium">جميع المنتجات</span>
                  <ChevronLeft className="w-4 h-4" />
                </button>
                
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryChange(category.id)}
                    className={`w-full text-right px-4 py-3 rounded-lg transition-colors duration-200 flex items-center justify-between ${
                      selectedCategory === category.id 
                        ? 'bg-blue-50 text-blue-600 border border-blue-200' 
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span className="font-medium">{category.name}</span>
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                ))}
              </div>
            </div>

            {/* Filter Section */}
            <div className="px-6 pb-6 border-t border-gray-200">
              <h3 className="text-sm font-bold text-gray-900 mb-4 mt-6 flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-blue-600" />
                فلترة النتائج
              </h3>
              
              {/* Price Range Filter */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">السعر</h4>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm text-gray-600">
                    <input type="checkbox" className="rounded border-gray-300" />
                    أقل من 100 ر.س
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-600">
                    <input type="checkbox" className="rounded border-gray-300" />
                    100 - 500 ر.س
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-600">
                    <input type="checkbox" className="rounded border-gray-300" />
                    500 - 1000 ر.س
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-600">
                    <input type="checkbox" className="rounded border-gray-300" />
                    أكثر من 1000 ر.س
                  </label>
                </div>
              </div>

              {/* Brand Filter */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">العلامة التجارية</h4>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm text-gray-600">
                    <input type="checkbox" className="rounded border-gray-300" />
                    العلامة المميزة
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-600">
                    <input type="checkbox" className="rounded border-gray-300" />
                    علامة طبية
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-600">
                    <input type="checkbox" className="rounded border-gray-300" />
                    مستورد
                  </label>
                </div>
              </div>
            </div>

            {/* Featured Categories - Like OTE */}
            <div className="p-6 border-t border-gray-200">
              <h3 className="text-sm font-bold text-gray-900 mb-4">الأقسام الرئيسية</h3>
              <div className="space-y-3">
                {categories.slice(0, 6).map((category) => (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryChange(category.id)}
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
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            
            {/* Header Section with Filters */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {selectedCategory 
                      ? categories.find(c => c.id === selectedCategory)?.name 
                      : searchQuery 
                        ? `نتائج البحث: "${searchQuery}"`
                        : 'جميع المنتجات'
                    }
                  </h1>
                  <p className="text-gray-600 mt-1">
                    {filteredProducts.length} منتج متوفر
                  </p>
                </div>
                
                <div className="flex items-center gap-4">
                  {/* Sort Dropdown */}
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-600">ترتيب حسب:</label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="newest">الأحدث</option>
                      <option value="price-low">السعر: من الأقل للأعلى</option>
                      <option value="price-high">السعر: من الأعلى للأقل</option>
                      <option value="name">الاسم أبجدياً</option>
                    </select>
                  </div>

                  {/* View Mode Buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded-lg border transition-colors duration-200 ${
                        viewMode === 'grid' 
                          ? 'bg-blue-50 border-blue-200 text-blue-600' 
                          : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <Grid className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded-lg border transition-colors duration-200 ${
                        viewMode === 'list' 
                          ? 'bg-blue-50 border-blue-200 text-blue-600' 
                          : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <List className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Active Filters */}
              {(selectedCategory || searchQuery) && (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm text-gray-600">الفلاتر النشطة:</span>
                  {selectedCategory && (
                    <div className="flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">
                      {categories.find(c => c.id === selectedCategory)?.name}
                      <button
                        onClick={() => handleCategoryChange(null)}
                        className="ml-1 text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </div>
                  )}
                  {searchQuery && (
                    <div className="flex items-center gap-1 bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm">
                      البحث: "{searchQuery}"
                      <button
                        onClick={() => setSearchQuery('')}
                        className="ml-1 text-green-600 hover:text-green-800"
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Products Grid - Exact OTE Style */}
            <div className={`grid gap-6 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                : 'grid-cols-1'
            }`}>
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-300 group ${
                    viewMode === 'list' ? 'flex' : ''
                  }`}
                >
                  {/* Product Image */}
                  <div className={`relative overflow-hidden ${
                    viewMode === 'list' ? 'w-48 h-48' : 'aspect-square'
                  }`}>
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

                    {/* Out of Stock */}
                    {product.stock === 0 && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold">نفد المخزون</span>
                      </div>
                    )}
                  </div>

                  {/* Product Info - OTE Style */}
                  <div className={`p-4 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                    {/* Product Model/Brand */}
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

                    {/* Rating - Like OTE */}
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

                    {/* Price Section - Exact OTE Style */}
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

                    {/* Add to Cart Button - OTE Style */}
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

                    {/* Additional Actions - OTE Style */}
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

                    {/* Stock Status Text */}
                    {product.stock > 0 && (
                      <div className="mt-2 text-xs">
                        <span className={`${
                          product.stock < 10 ? 'text-orange-600' : 'text-green-600'
                        }`}>
                          {product.stock < 10 
                            ? `⚠️ متبقي ${product.stock} قطع فقط` 
                            : '✅ متوفر'
                          }
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* No Products Found */}
            {filteredProducts.length === 0 && (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Package className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">لم يتم العثور على منتجات</h3>
                <p className="text-gray-600 mb-6">
                  {searchQuery 
                    ? `لا توجد منتجات تطابق "${searchQuery}"`
                    : selectedCategory
                      ? 'لا توجد منتجات في هذا التصنيف حالياً'
                      : 'لا توجد منتجات متاحة حالياً'
                  }
                </p>
                <button
                  onClick={() => {
                    handleCategoryChange(null);
                    setSearchQuery('');
                  }}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  عرض جميع المنتجات
                </button>
              </div>
            )}

            {/* Load More / Pagination */}
            {filteredProducts.length > 20 && (
              <div className="text-center mt-8">
                <button className="bg-white border border-gray-300 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium">
                  عرض المزيد من المنتجات
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