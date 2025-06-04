import React from 'react';
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Heart, Eye } from 'lucide-react';
import { createProductSlug } from '../utils/slugify';
import { addToCartUnified, addToWishlistUnified, removeFromWishlistUnified } from '../utils/cartUtils';
import { buildImageUrl, apiCall, API_ENDPOINTS, getFallbackImage } from '../config/api';


interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  stock: number;
  categoryId?: number | null;
  productType?: string;
  dynamicOptions?: any[];
  mainImage: string;
  detailedImages?: string[];
  specifications?: { name: string; value: string }[];
  createdAt?: string;
}

interface ProductCardProps {
  product: Product;
  viewMode?: 'grid' | 'list';
}

const ProductCard: React.FC<ProductCardProps> = ({ product, viewMode = 'grid' }) => {
  const [isInWishlist, setIsInWishlist] = useState(false);
  // No loading states - instant actions
  const [quantity, setQuantity] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    checkWishlistStatus();
    // eslint-disable-next-line
  }, [product.id]);

  // إضافة مستمع لتحديث حالة المفضلة عند تغييرها
  useEffect(() => {
    const handleWishlistUpdate = () => {
      checkWishlistStatus();
    };

    window.addEventListener('wishlistUpdated', handleWishlistUpdate);
    window.addEventListener('productAddedToWishlist', handleWishlistUpdate);
    window.addEventListener('productRemovedFromWishlist', handleWishlistUpdate);

    return () => {
      window.removeEventListener('wishlistUpdated', handleWishlistUpdate);
      window.removeEventListener('productAddedToWishlist', handleWishlistUpdate);
      window.removeEventListener('productRemovedFromWishlist', handleWishlistUpdate);
    };
  }, []);

  const checkWishlistStatus = async () => {
    const userData = localStorage.getItem('user');
    if (!userData) return;

    try {
      const user = JSON.parse(userData);
      const data = await apiCall(API_ENDPOINTS.WISHLIST_CHECK(user.id, product.id));
      setIsInWishlist(data.isInWishlist);
    } catch (error) {
      console.error('Error checking wishlist status:', error);
    }
  };

  const toggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault(); // منع فتح صفحة المنتج
    e.stopPropagation(); // منع انتشار الحدث
    
    console.log('🤍 [ProductCard] toggleWishlist called:', { productId: product.id, currentState: isInWishlist });
    
    try {
      if (isInWishlist) {
        console.log('💔 [ProductCard] Removing from wishlist...');
        const success = await removeFromWishlistUnified(product.id, product.name);
        if (success) {
          setIsInWishlist(false);
          console.log('✅ [ProductCard] Product removed from wishlist successfully');
        } else {
          console.log('❌ [ProductCard] Failed to remove from wishlist');
        }
      } else {
        console.log('❤️ [ProductCard] Adding to wishlist...');
        const success = await addToWishlistUnified(product.id, product.name);
        if (success) {
          setIsInWishlist(true);
          console.log('✅ [ProductCard] Product added to wishlist successfully');
        } else {
          console.log('❌ [ProductCard] Failed to add to wishlist');
        }
      }
    } catch (error) {
      console.error('❌ [ProductCard] Error in toggleWishlist:', error);
    }
  };

  const isOutOfStock = product.stock <= 0;

  const addToCart = async (e: React.MouseEvent) => {
    e.preventDefault(); // منع فتح صفحة المنتج
    e.stopPropagation(); // منع انتشار الحدث
    
    console.log('🛒 [ProductCard] addToCart called:', { productId: product.id, quantity });
    
    try {
      // تحديث فوري لعدد السلة في localStorage
      const currentCount = parseInt(localStorage.getItem('lastCartCount') || '0');
      const newCount = currentCount + quantity;
      localStorage.setItem('lastCartCount', newCount.toString());
      
      // إرسال أحداث التحديث الفورية
      window.dispatchEvent(new Event('cartUpdated'));
      window.dispatchEvent(new Event('productAddedToCart'));
      window.dispatchEvent(new Event('forceCartUpdate'));
      
      // عرض رسالة نجاح فورية
      toast.success(`🛒 تم إضافة ${quantity} من "${product.name}" إلى السلة بنجاح!`, {
        position: "top-center",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      
      // استدعاء API في الخلفية
      const success = await addToCartUnified(product.id, product.name, quantity);
      
      if (success) {
        console.log('✅ [ProductCard] Product added to cart successfully via API');
        
        // تحديث إضافي للتأكد من التزامن مع قاعدة البيانات
        setTimeout(() => {
          window.dispatchEvent(new Event('forceCartUpdate'));
        }, 500);
      } else {
        console.log('❌ [ProductCard] Failed to add to cart via API, reverting local changes');
        
        // إذا فشل API، نعكس التغييرات المحلية
        localStorage.setItem('lastCartCount', currentCount.toString());
        window.dispatchEvent(new Event('forceCartUpdate'));
        
        toast.error('⚠️ حدث خطأ أثناء إضافة المنتج للسلة، يرجى المحاولة مرة أخرى');
      }
    } catch (error) {
      console.error('❌ [ProductCard] Error in addToCart:', error);
      
      // إعادة العدد للحالة السابقة في حالة الخطأ
      const currentCount = parseInt(localStorage.getItem('lastCartCount') || '0');
      const revertedCount = Math.max(0, currentCount - quantity);
      localStorage.setItem('lastCartCount', revertedCount.toString());
      window.dispatchEvent(new Event('forceCartUpdate'));
      
      toast.error('💥 حدث خطأ غير متوقع، يرجى المحاولة مرة أخرى');
    }
  };

  const increaseQuantity = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (quantity < product.stock) {
      setQuantity(prev => prev + 1);
    }
  };

  const decreaseQuantity = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const handleProductClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const productPath = `/product/${createProductSlug(product.id, product.name)}`;
    console.log('🔗 [ProductCard] Navigating to:', productPath);
    navigate(productPath);
  };

  // ---- LIST VIEW ----
  if (viewMode === 'list') {
    return (
      <div 
        className="bg-white rounded-xl sm:rounded-2xl md:rounded-3xl border border-gray-100 shadow-md sm:shadow-lg overflow-hidden hover:shadow-lg sm:hover:shadow-xl transition-all duration-300 cursor-pointer"
        onClick={handleProductClick}
      >
        <div className="flex flex-col md:flex-row p-3 sm:p-4 md:p-6 gap-3 sm:gap-4 md:gap-6">
          <div className="relative w-full md:w-40 lg:w-48 xl:w-64 h-48 sm:h-56 md:h-64 lg:h-72 flex-shrink-0 bg-gray-50 rounded-lg sm:rounded-xl md:rounded-2xl overflow-hidden">
            <img
              src={buildImageUrl(product.mainImage)}
              alt={product.name}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              loading="lazy"
              onError={(e) => {
                e.currentTarget.src = getFallbackImage('product');
              }}
            />
            <div className="absolute top-2 sm:top-3 md:top-4 left-2 sm:left-3 md:left-4 bg-pink-500 text-white px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-semibold shadow-md">
              جديد
            </div>
            {isOutOfStock && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-lg sm:rounded-xl md:rounded-2xl">
                <span className="text-white font-semibold bg-red-600 px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 rounded-lg text-xs sm:text-sm">
                  نفذت الكمية
                </span>
              </div>
            )}
            <div className="absolute top-2 sm:top-3 md:top-4 right-2 sm:right-3 md:right-4">
              <button
                onClick={toggleWishlist}
                disabled={false}
                className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-md sm:rounded-lg bg-white shadow-md flex items-center justify-center hover:bg-gray-100 transition-colors duration-200"
              >
                <Heart className={`w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 ${isInWishlist ? 'text-red-500 fill-current' : 'text-gray-600'}`} />
              </button>
            </div>
          </div>
          
          <div className="flex-1 flex flex-col justify-between min-h-0">
            <div>
              <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-semibold text-gray-800 mb-2 sm:mb-3 leading-tight hover:text-pink-500 transition-colors duration-200">
                {product.name}
              </h3>
              <div className="flex flex-col items-start gap-1 mb-2 sm:mb-3">
                {product.originalPrice && product.originalPrice > product.price ? (
                  <div className="flex flex-col gap-1">
                    <div className="flex items-baseline gap-1 sm:gap-2">
                      <span className="text-xs sm:text-sm text-gray-400 line-through font-medium">
                        {product.originalPrice.toFixed(2)}
                      </span>
                      <span className="text-xs text-gray-400">ر.س</span>
                      <span className="bg-red-500 text-white px-1 sm:px-1.5 py-0.5 rounded-full text-xs font-bold">
                        -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                      </span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-lg sm:text-xl md:text-2xl font-bold text-pink-600">
                        {product.price.toFixed(2)}
                      </span>
                      <span className="text-sm sm:text-base text-gray-600">ر.س</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-baseline gap-1">
                    <span className="text-lg sm:text-xl md:text-2xl font-bold text-pink-600">
                      {product.price.toFixed(2)}
                    </span>
                    <span className="text-sm sm:text-base text-gray-600">ر.س</span>
                  </div>
                )}
              </div>
              {isOutOfStock && (
                <p className="text-sm sm:text-base font-semibold text-red-600">نفذت الكمية</p>
              )}
            </div>
            
            {!isOutOfStock && (
              <div className="space-y-2 sm:space-y-3 mt-3 sm:mt-4">
                {/* Quantity Controls */}
                <div className="flex items-center gap-2 sm:gap-3">
                  <button
                    onClick={decreaseQuantity}
                    disabled={quantity <= 1}
                    className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-lg bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-gray-700 font-bold transition-all duration-200 hover:scale-105 text-sm sm:text-base shadow-sm border border-gray-200"
                  >
                    -
                  </button>
                  <span className="w-10 sm:w-12 md:w-14 h-7 sm:h-8 md:h-9 flex items-center justify-center font-bold text-gray-800 text-base sm:text-lg md:text-xl bg-gradient-to-r from-red-50 to-rose-50 rounded-lg border-2 border-red-200 shadow-sm">{quantity}</span>
                  <button
                    onClick={increaseQuantity}
                    disabled={quantity >= product.stock}
                    className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-lg bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-gray-700 font-bold transition-all duration-200 hover:scale-105 text-sm sm:text-base shadow-sm border border-gray-200"
                  >
                    +
                  </button>
                </div>
                
                <div className="flex items-center gap-2 sm:gap-3">
                  <button
                    onClick={addToCart}
                    disabled={false}
                    className="flex-1 bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 disabled:opacity-50 text-white px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 md:py-3.5 rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm md:text-base shadow-lg transition-all duration-300 flex items-center justify-center gap-2 border border-red-400/30 hover:scale-[1.02] hover:shadow-xl"
                  >
                    <span>إضافة {quantity > 1 ? `${quantity} قطع` : ''} للسلة</span>
                    {quantity > 1 && <span className="bg-white/20 px-2 py-1 rounded-full text-xs">{quantity}</span>}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ---- GRID VIEW - PROFESSIONAL AND MODERN ----
  return (
    <div 
      className="bg-white rounded-2xl sm:rounded-3xl border border-gray-100 shadow-lg sm:shadow-xl overflow-hidden hover:shadow-xl sm:hover:shadow-2xl transition-all duration-300 sm:duration-500 hover:scale-[1.02] sm:hover:scale-[1.03] w-full max-w-[280px] sm:max-w-xs md:max-w-sm lg:w-80 h-auto group relative mx-auto cursor-pointer"
      onClick={handleProductClick}
    >
      {/* Gradient Border Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 sm:from-pink-500/20 via-transparent to-purple-500/10 sm:to-purple-500/20 rounded-2xl sm:rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 sm:duration-500 -z-10"></div>
      
      {/* Product Image - Taller for mobile, even taller for desktop */}
      <div className="relative h-[280px] sm:h-[320px] md:h-[380px] lg:h-[420px] overflow-hidden rounded-t-2xl sm:rounded-t-3xl bg-gradient-to-br from-gray-50 to-gray-100">
        <img
          src={buildImageUrl(product.mainImage)}
          alt={product.name}
          className="w-full h-full object-cover transition-all duration-500 sm:duration-700 group-hover:scale-105"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = getFallbackImage('product');
          }}
        />
        
        {/* Premium Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/5 sm:from-black/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 sm:duration-500"></div>
        
        {/* New Badge */}
        <div className="absolute top-3 sm:top-4 left-3 sm:left-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs font-bold shadow-lg backdrop-blur-sm border border-pink-400/30">
          جديد
        </div>
        
        {/* Wishlist Button Only */}
        <div className="absolute top-3 sm:top-4 right-3 sm:right-4 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-0 sm:translate-x-2 group-hover:translate-x-0">
          <button
            onClick={toggleWishlist}
            disabled={false}
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-white/90 sm:bg-white/95 backdrop-blur-sm shadow-md sm:shadow-lg flex items-center justify-center hover:bg-white border border-white/40 transition-all duration-200 hover:scale-105 sm:hover:scale-110"
          >
            <Heart className={`w-3 h-3 sm:w-4 sm:h-4 ${isInWishlist ? 'text-red-500 fill-current' : 'text-gray-600'}`} />
          </button>
        </div>
        
        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/60 sm:bg-black/70 flex items-center justify-center backdrop-blur-sm">
            <span className="text-white font-bold bg-red-600 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm shadow-lg border border-red-500">
              نفذت الكمية
            </span>
          </div>
        )}
      </div>
      
      {/* Product Info - Smaller padding on mobile */}
      <div className="p-4 sm:p-6 flex flex-col items-center text-center space-y-3 sm:space-y-4">
        {/* Product Name - Smaller on mobile */}
        <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-800 leading-tight hover:text-pink-600 transition-colors duration-300 line-clamp-2 min-h-[2.5rem] sm:min-h-[3rem]">
          {product.name}
        </h3>
        
        {/* Elegant Divider - Smaller on mobile */}
        <div className="h-px bg-gradient-to-r from-transparent via-pink-300 to-transparent w-12 sm:w-16"></div>
        
        {/* Price - Smaller on mobile */}
        <div className="flex flex-col items-center space-y-1 sm:space-y-2">
          {product.originalPrice && product.originalPrice > product.price ? (
            <>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="text-xs sm:text-sm text-gray-400 line-through font-medium">
                  {product.originalPrice.toFixed(0)} ر.س
                </span>
                <span className="bg-red-500 text-white px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-bold">
                  -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                </span>
              </div>
              <div className="text-xl sm:text-2xl font-bold text-pink-600">
                {product.price.toFixed(0)} <span className="text-base sm:text-lg text-gray-600">ر.س</span>
              </div>
            </>
          ) : (
            <div className="text-xl sm:text-2xl font-bold text-pink-600">
              {product.price.toFixed(0)} <span className="text-base sm:text-lg text-gray-600">ر.س</span>
            </div>
          )}
        </div>
        
        {isOutOfStock && (
          <p className="text-xs sm:text-sm font-bold text-red-600 bg-red-50 px-2 sm:px-3 py-1 rounded-full">نفذت الكمية</p>
        )}
        
        {/* Actions - Smaller on mobile */}
        {!isOutOfStock && (
          <div className="w-full space-y-2 sm:space-y-3 mt-3 sm:mt-4">
            {/* Quantity Controls - Smaller on mobile */}
            <div className="flex items-center justify-center gap-2 sm:gap-3">
              <button
                onClick={decreaseQuantity}
                disabled={quantity <= 1}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-gray-700 font-bold transition-all duration-200 hover:scale-105 sm:hover:scale-110 text-base shadow-sm border border-gray-200"
              >
                -
              </button>
              <span className="w-12 sm:w-14 h-8 sm:h-9 flex items-center justify-center font-bold text-gray-800 text-lg sm:text-xl bg-gradient-to-r from-red-50 to-rose-50 rounded-lg border-2 border-red-200 shadow-sm">{quantity}</span>
              <button
                onClick={increaseQuantity}
                disabled={quantity >= product.stock}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-gray-700 font-bold transition-all duration-200 hover:scale-105 sm:hover:scale-110 text-base shadow-sm border border-gray-200"
              >
                +
              </button>
            </div>
            
            {/* Add to Cart Button - Smaller on mobile */}
            <button
              onClick={addToCart}
              disabled={false}
              className="w-full bg-gradient-to-r from-red-500 to-rose-500 text-white px-4 sm:px-6 py-3 sm:py-3.5 rounded-xl font-bold text-sm sm:text-base shadow-lg hover:from-red-600 hover:to-rose-600 disabled:opacity-50 transition-all duration-300 backdrop-blur-sm border border-red-400/30 hover:scale-[1.02] sm:hover:scale-105 hover:shadow-xl flex items-center justify-center gap-2"
            >
              <span>إضافة {quantity > 1 ? `${quantity} قطع` : ''} للسلة</span>
              {quantity > 1 && <span className="bg-white/20 px-2 py-1 rounded-full text-xs">{quantity}</span>}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;