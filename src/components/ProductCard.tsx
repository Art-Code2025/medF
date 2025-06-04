import React from 'react';
import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Heart, Eye, Loader2, Check } from 'lucide-react';
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
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isCartAdded, setIsCartAdded] = useState(false);
  
  // حماية من multiple clicks
  const lastClickTimeRef = useRef<number>(0);
  const isProcessingRef = useRef<boolean>(false);
  
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

  const addToCart = async (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // حماية بسيطة جداً - 200ms فقط للحماية من double tap
    const now = Date.now();
    if (now - lastClickTimeRef.current < 200) {
      return;
    }
    
    if (isProcessingRef.current) {
      return;
    }
    
    lastClickTimeRef.current = now;
    isProcessingRef.current = true;
    
    console.log('🛒 [ProductCard] addToCart called:', { productId: product.id, quantity });
    
    try {
      // إضافة فورية للسلة محلياً أولاً
      const currentCart = JSON.parse(localStorage.getItem('cart') || '[]');
      const existingItemIndex = currentCart.findIndex((item: any) => item.productId === product.id);
      
      if (existingItemIndex >= 0) {
        currentCart[existingItemIndex].quantity += quantity;
      } else {
        currentCart.push({
          id: Date.now(),
          productId: product.id,
          name: product.name,
          price: product.price,
          image: product.mainImage,
          quantity: quantity
        });
      }
      
      // حفظ فوري في localStorage
      localStorage.setItem('cart', JSON.stringify(currentCart));
      
      // تحديث العداد فوراً
      const totalQuantity = currentCart.reduce((total: number, item: any) => total + item.quantity, 0);
      localStorage.setItem('lastCartCount', totalQuantity.toString());
      
      // تحديث UI فوراً
      setIsCartAdded(true);
      
      // إرسال أحداث التحديث فوراً
      window.dispatchEvent(new Event('cartUpdated'));
      window.dispatchEvent(new Event('productAddedToCart'));
      window.dispatchEvent(new Event('forceCartUpdate'));
      
      // رسالة نجاح فورية
      toast.success(`✅ تم إضافة ${product.name} للسلة!`, {
        position: "top-center",
        autoClose: 1000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: false,
        style: {
          background: '#10b981',
          color: 'white',
          fontWeight: 'bold',
          fontSize: '14px',
          borderRadius: '12px',
          padding: '8px 12px'
        }
      });
      
      // إخفاء success state بعد ثانية واحدة
      setTimeout(() => {
        setIsCartAdded(false);
      }, 1000);
      
      // استدعاء API في الخلفية لمزامنة الخادم (بدون انتظار)
      addToCartUnified(product.id, product.name, quantity).catch(error => {
        console.warn('API sync failed but local cart updated:', error);
        // في حالة فشل API، لا نعكس التغيير لأن المستخدم شاف النجاح
        // ممكن نعمل retry mechanism في الخلفية
      });
      
    } catch (error) {
      console.error('❌ [ProductCard] Error in addToCart:', error);
      setIsCartAdded(false);
      toast.error('حدث خطأ، يرجى المحاولة مرة أخرى');
    } finally {
      isProcessingRef.current = false;
    }
  };

  const increaseQuantity = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (quantity < product.stock) {
      setQuantity(prev => prev + 1);
    }
  };

  const decreaseQuantity = (e: React.MouseEvent | React.TouchEvent) => {
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
                {/* Big Quantity Controls with Clear Label */}
                <div className="bg-gradient-to-br from-red-50 to-rose-50 p-4 rounded-xl border-2 border-red-200 shadow-md">
                  <div className="text-center mb-3">
                    <div className="text-base font-black text-red-700 mb-2">🛒 اختر الكمية</div>
                    <div className="flex items-center gap-4 justify-center">
                      <button
                        onClick={decreaseQuantity}
                        disabled={quantity <= 1}
                        className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-white font-black transition-all duration-200 hover:scale-110 text-xl shadow-lg border-2 border-red-500/30 hover:border-red-400"
                      >
                        -
                      </button>
                      <div className="w-20 h-12 flex items-center justify-center font-black text-red-800 text-2xl bg-white rounded-xl border-3 border-red-400 shadow-lg ring-2 ring-red-200">
                        {quantity}
                      </div>
                      <button
                        onClick={increaseQuantity}
                        disabled={quantity >= product.stock}
                        className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-white font-black transition-all duration-200 hover:scale-110 text-xl shadow-lg border-2 border-red-500/30 hover:border-red-400"
                      >
                        +
                      </button>
                    </div>
                    <div className="text-sm text-red-600 font-semibold mt-2">المتوفر: {product.stock} قطعة</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 sm:gap-3">
                  <button
                    onClick={addToCart}
                    onTouchEnd={addToCart} // إضافة touch support
                    disabled={isCartAdded || isOutOfStock}
                    className={`
                      w-full px-4 sm:px-6 py-4 sm:py-5 rounded-xl font-black text-base sm:text-lg shadow-xl 
                      transition-all duration-300 backdrop-blur-sm border-2 
                      flex items-center justify-center gap-3
                      touch-manipulation select-none
                      ${isCartAdded 
                        ? 'bg-gradient-to-r from-green-600 to-emerald-600 border-green-400/30 text-white' 
                        : 'bg-gradient-to-r from-green-500 to-emerald-500 border-green-400/30 text-white hover:from-green-600 hover:to-emerald-600 hover:scale-[1.02] sm:hover:scale-105 hover:shadow-2xl active:scale-95'
                      }
                      disabled:opacity-75 disabled:cursor-not-allowed disabled:transform-none
                      focus:outline-none focus:ring-4 focus:ring-green-300/50
                    `}
                    style={{
                      WebkitTapHighlightColor: 'transparent',
                      WebkitTouchCallout: 'none',
                      WebkitUserSelect: 'none',
                      userSelect: 'none'
                    }}
                  >
                    {isCartAdded ? (
                      <>
                        <Check className="w-5 h-5" />
                        <span>تم الإضافة! ✅</span>
                      </>
                    ) : (
                      <>
                        <span>🛒 إضافة {quantity > 1 ? `${quantity} قطع` : ''} للسلة</span>
                        {quantity > 1 && <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-bold">{quantity}</span>}
                      </>
                    )}
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
        
        {/* Stock Badge */}
        {product.stock > 0 && (
          <div className="absolute top-3 sm:top-4 right-3 sm:right-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs font-bold shadow-lg backdrop-blur-sm border border-green-400/30">
            متوفر: {product.stock}
          </div>
        )}
        
        {/* Wishlist Button */}
        <div className="absolute bottom-3 sm:bottom-4 right-3 sm:right-4 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-0 sm:translate-x-2 group-hover:translate-x-0">
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
        
        {/* Actions - Bigger and More Visible */}
        {!isOutOfStock && (
          <div className="w-full space-y-3 sm:space-y-4 mt-4 sm:mt-6 bg-gradient-to-br from-gray-50 to-red-50 p-3 sm:p-4 rounded-xl border border-gray-200">
            {/* Big Quantity Controls with Clear Label */}
            <div className="bg-gradient-to-br from-red-50 to-rose-50 p-4 rounded-xl border-2 border-red-200 shadow-md">
              <div className="text-center mb-3">
                <div className="text-base font-black text-red-700 mb-2">�� اختر الكمية</div>
                <div className="flex items-center gap-4 justify-center">
                  <button
                    onClick={decreaseQuantity}
                    disabled={quantity <= 1}
                    className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-white font-black transition-all duration-200 hover:scale-110 text-xl shadow-lg border-2 border-red-500/30 hover:border-red-400"
                  >
                    -
                  </button>
                  <div className="w-20 h-12 flex items-center justify-center font-black text-red-800 text-2xl bg-white rounded-xl border-3 border-red-400 shadow-lg ring-2 ring-red-200">
                    {quantity}
                  </div>
                  <button
                    onClick={increaseQuantity}
                    disabled={quantity >= product.stock}
                    className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-white font-black transition-all duration-200 hover:scale-110 text-xl shadow-lg border-2 border-red-500/30 hover:border-red-400"
                  >
                    +
                  </button>
                </div>
                <div className="text-sm text-red-600 font-semibold mt-2">المتوفر: {product.stock} قطعة</div>
              </div>
            </div>
            
            {/* Big Add to Cart Button - محسن للموبايل */}
            <button
              onClick={addToCart}
              onTouchEnd={addToCart} // إضافة touch support
              disabled={isCartAdded || isOutOfStock}
              className={`
                w-full px-4 sm:px-6 py-4 sm:py-5 rounded-xl font-black text-base sm:text-lg shadow-xl 
                transition-all duration-300 backdrop-blur-sm border-2 
                flex items-center justify-center gap-3
                touch-manipulation select-none
                ${isCartAdded 
                  ? 'bg-gradient-to-r from-green-600 to-emerald-600 border-green-400/30 text-white' 
                  : 'bg-gradient-to-r from-green-500 to-emerald-500 border-green-400/30 text-white hover:from-green-600 hover:to-emerald-600 hover:scale-[1.02] sm:hover:scale-105 hover:shadow-2xl active:scale-95'
                }
                disabled:opacity-75 disabled:cursor-not-allowed disabled:transform-none
                focus:outline-none focus:ring-4 focus:ring-green-300/50
              `}
              style={{
                WebkitTapHighlightColor: 'transparent',
                WebkitTouchCallout: 'none',
                WebkitUserSelect: 'none',
                userSelect: 'none'
              }}
            >
              {isCartAdded ? (
                <>
                  <Check className="w-5 h-5" />
                  <span>تم الإضافة! ✅</span>
                </>
              ) : (
                <>
                  <span>🛒 إضافة {quantity > 1 ? `${quantity} قطع` : ''} للسلة</span>
                  {quantity > 1 && <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-bold">{quantity}</span>}
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;