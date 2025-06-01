import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Trash2, ArrowLeft, Star } from 'lucide-react';
import { toast } from 'react-toastify';
import { buildImageUrl } from '../config/api';
import { getWishlistItems, removeFromWishlist } from '../utils/wishlistUtils';
import { addToCartUnified } from '../utils/cartUtils';

interface WishlistItem {
  id: number;
  productId: number;
  name: string;
  price: number;
  image: string;
}

const Wishlist: React.FC = () => {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWishlistItems();
  }, []);

  const loadWishlistItems = () => {
    try {
      const items = getWishlistItems();
      setWishlistItems(items);
    } catch (error) {
      console.error('Error loading wishlist:', error);
      toast.error('حدث خطأ في تحميل المفضلة');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromWishlist = (productId: number) => {
    removeFromWishlist(productId);
    setWishlistItems(prev => prev.filter(item => item.productId !== productId));
    toast.success('تم حذف المنتج من المفضلة');
  };

  const handleAddToCart = async (item: WishlistItem) => {
    try {
      await addToCartUnified(item.productId, item.name, 1);
      toast.success(`تم إضافة ${item.name} إلى السلة`);
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('حدث خطأ في إضافة المنتج للسلة');
    }
  };

  const clearWishlist = () => {
    localStorage.removeItem('wishlist');
    setWishlistItems([]);
    window.dispatchEvent(new CustomEvent('wishlistUpdated'));
    toast.success('تم مسح جميع المفضلات');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-32">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل المفضلة...</p>
        </div>
      </div>
    );
  }

  if (wishlistItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 pt-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">المفضلة فارغة</h3>
            <p className="text-gray-600 mb-8">لم تقم بإضافة أي منتجات للمفضلة بعد</p>
            <Link
              to="/products"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
            >
              تصفح المنتجات
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <nav className="mb-4">
            <ol className="flex items-center space-x-2 space-x-reverse text-sm">
              <li>
                <Link to="/" className="text-blue-600 hover:text-blue-800">الرئيسية</Link>
              </li>
              <li className="text-gray-400">
                <ArrowLeft className="w-4 h-4" />
              </li>
              <li className="text-gray-600 font-medium">المفضلة</li>
            </ol>
          </nav>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">قائمة المفضلة</h1>
              <p className="text-gray-600 mt-1">{wishlistItems.length} منتج في المفضلة</p>
            </div>
            
            {wishlistItems.length > 0 && (
              <button
                onClick={clearWishlist}
                className="text-red-600 hover:text-red-800 transition-colors duration-200 text-sm font-medium"
              >
                مسح الكل
              </button>
            )}
          </div>
        </div>

        {/* Wishlist Items Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlistItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-300 group"
            >
              {/* Product Image */}
              <div className="aspect-square relative overflow-hidden">
                <Link to={`/product/${item.productId}`}>
                  <img
                    src={buildImageUrl(item.image)}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </Link>
                
                {/* Remove from Wishlist Button */}
                <button
                  onClick={() => handleRemoveFromWishlist(item.productId)}
                  className="absolute top-3 right-3 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors duration-200"
                >
                  <Heart className="w-4 h-4 fill-current" />
                </button>
              </div>

              {/* Product Info */}
              <div className="p-4">
                <Link to={`/product/${item.productId}`}>
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-blue-600 transition-colors duration-200">
                    {item.name}
                  </h3>
                </Link>

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
                  <span className="text-xs text-gray-500 mr-1">(4.0)</span>
                </div>

                {/* Price */}
                <div className="mb-4">
                  <span className="text-lg font-bold text-gray-900">
                    {item.price.toFixed(2)} ر.س
                  </span>
                  <div className="text-xs text-gray-500 mt-1">
                    السعر بدون ضريبة: {item.price.toFixed(2)} ر.س
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2">
                  <button
                    onClick={() => handleAddToCart(item)}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center gap-2 font-medium"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    إضافة للسلة
                  </button>
                  
                  <button
                    onClick={() => handleRemoveFromWishlist(item.productId)}
                    className="w-full border border-red-300 text-red-600 py-2 px-4 rounded-lg hover:bg-red-50 transition-colors duration-200 flex items-center justify-center gap-2 font-medium"
                  >
                    <Trash2 className="w-4 h-4" />
                    حذف من المفضلة
                  </button>
                </div>

                {/* Additional Links */}
                <div className="flex items-center justify-between mt-3 text-xs">
                  <Link
                    to={`/product/${item.productId}`}
                    className="text-blue-600 hover:text-blue-800 transition-colors duration-200"
                  >
                    عرض التفاصيل
                  </Link>
                  <button className="text-blue-600 hover:text-blue-800 transition-colors duration-200">
                    إضافة للمقارنة
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mt-12 bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-center">
            <h2 className="text-xl font-bold text-gray-900 mb-4">إجراءات سريعة</h2>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => {
                  wishlistItems.forEach(item => handleAddToCart(item));
                }}
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium"
              >
                إضافة الكل للسلة
              </button>
              
              <Link
                to="/products"
                className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium"
              >
                متابعة التسوق
              </Link>
              
              <button
                onClick={clearWishlist}
                className="border border-red-300 text-red-600 px-6 py-3 rounded-lg hover:bg-red-50 transition-colors duration-200 font-medium"
              >
                مسح الكل
              </button>
            </div>
          </div>
        </div>

        {/* Related Categories */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">قد يعجبك أيضاً</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['المعدات الطبية', 'الأدوات الجراحية', 'أجهزة القياس', 'المستلزمات الطبية'].map((category, index) => (
              <Link
                key={index}
                to={`/products?category=${index + 1}`}
                className="bg-white rounded-lg border border-gray-200 p-4 text-center hover:shadow-md transition-all duration-200"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Heart className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-medium text-gray-900">{category}</h3>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Wishlist;