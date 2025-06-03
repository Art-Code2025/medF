import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft, Package, CreditCard, Truck, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import { buildImageUrl, apiCall } from '../config/api';

interface CartItem {
  id: number;
  productId: number;
  quantity: number;
  selectedOptions?: Record<string, string>;
  optionsPricing?: Record<string, number>;
  attachments?: {
    images?: string[];
    text?: string;
  };
  product: {
    id: number;
    name: string;
    description?: string;
    price: number;
    originalPrice?: number;
    mainImage: string;
    detailedImages?: string[];
    stock: number;
    productType?: string;
    dynamicOptions?: any[];
    specifications?: { name: string; value: string }[];
    sizeGuideImage?: string;
  };
}

const Cart: React.FC = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // تحميل السلة من الخادم
  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const userData = localStorage.getItem('user');
      let endpoint = '/api/cart?userId=guest'; // Default for guests
      
      // If user is logged in, use their specific cart
      if (userData) {
        try {
          const user = JSON.parse(userData);
          if (user && user.id) {
            endpoint = `/api/user/${user.id}/cart`;
            console.log('🛒 [Cart] Fetching cart for logged in user:', user.id);
          } else {
            console.log('🛒 [Cart] Invalid user object, using guest mode');
          }
        } catch (parseError) {
          console.error('❌ [Cart] Error parsing user data, using guest mode:', parseError);
        }
      } else {
        console.log('🛒 [Cart] No user data found, using guest mode');
      }

      console.log('🛒 [Cart] Fetching cart from endpoint:', endpoint);
      
      const data = await apiCall(endpoint);
      console.log('📦 [Cart] Raw API response:', data);
      
      if (Array.isArray(data)) {
        console.log('✅ [Cart] Cart items loaded:', data.length);
        setCartItems(data);
      } else {
        console.log('⚠️ [Cart] Unexpected data format:', data);
        setCartItems([]);
      }
    } catch (error) {
      console.error('❌ [Cart] Error fetching cart:', error);
      toast.error('فشل في تحميل السلة');
      setCartItems([]);
      setError(`فشل في تحميل السلة: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // تحديث كمية المنتج
  const updateQuantity = async (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
      
    const userData = localStorage.getItem('user');
    let userId = 'guest';
    let endpoint = `/api/cart/${itemId}`;

    if (userData) {
      try {
        const user = JSON.parse(userData);
        if (user && user.id) {
          userId = user.id.toString();
          endpoint = `/api/user/${userId}/cart/${itemId}`;
        }
      } catch (parseError) {
        console.error('Error parsing user data:', parseError);
      }
    }

    try {
      const currentItem = cartItems.find(item => item.id === itemId);
      if (!currentItem) return;

      const updateData = {
        quantity: newQuantity,
        selectedOptions: currentItem.selectedOptions || {},
        attachments: currentItem.attachments || {}
      };

      if (userId === 'guest') {
        await apiCall(endpoint, {
          method: 'PUT',
          body: JSON.stringify({ quantity: newQuantity })
        });
      } else {
        await apiCall(endpoint, {
          method: 'PUT',
          body: JSON.stringify(updateData)
        });
      }
      
      setCartItems(prev => prev.map(item => 
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      ));
      
      toast.success('تم تحديث الكمية');
    } catch (error) {
      console.error('❌ [Cart] Error updating quantity:', error);
      toast.error('فشل في تحديث الكمية');
    }
  };

  // حذف منتج من السلة
  const removeItem = async (itemId: number) => {
    const userData = localStorage.getItem('user');
    let userId = 'guest';
    let endpoint = `/api/cart/${itemId}`;

    if (userData) {
      try {
        const user = JSON.parse(userData);
        if (user && user.id) {
          userId = user.id.toString();
          endpoint = `/api/user/${userId}/cart/${itemId}`;
        }
      } catch (parseError) {
        console.error('Error parsing user data:', parseError);
      }
    }

    try {
      await apiCall(endpoint, {
        method: 'DELETE'
      });
      
      setCartItems(prev => prev.filter(item => item.id !== itemId));
      toast.success('تم حذف المنتج من السلة');
    } catch (error) {
      console.error('Error removing item:', error);
      toast.error('فشل في حذف المنتج');
    }
  };

  // إفراغ السلة
  const clearCart = async () => {
    if (!window.confirm('هل أنت متأكد من إفراغ السلة؟')) return;

    try {
      setCartItems([]);

      const userData = localStorage.getItem('user');
      let userId = 'guest';
      let endpoint = '/api/cart?userId=guest';

      if (userData) {
        try {
          const user = JSON.parse(userData);
          if (user && user.id) {
            userId = user.id.toString();
            endpoint = `/api/user/${userId}/cart`;
          }
        } catch (parseError) {
          console.error('Error parsing user data:', parseError);
        }
      }

      await apiCall(endpoint, {
        method: 'DELETE'
      });

      toast.success('تم إفراغ السلة');
    } catch (error) {
      console.error('Error clearing cart:', error);
      toast.error('خطأ في إفراغ السلة');
      fetchCart();
    }
  };

  const totalPrice = cartItems.reduce((sum, item) => {
    const basePrice = item.product?.price || 0;
    const optionsPrice = item.optionsPricing ? 
      Object.values(item.optionsPricing).reduce((optSum, price) => optSum + (price || 0), 0) : 0;
    return sum + ((basePrice + optionsPrice) * item.quantity);
  }, 0);

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const shippingCost = totalPrice >= 100 ? 0 : 15;
  const finalTotal = totalPrice + shippingCost;

  const getOptionDisplayName = (optionName: string): string => {
    const names: Record<string, string> = {
      nameOnSash: 'الاسم على الوشاح',
      embroideryColor: 'لون التطريز',
      capFabric: 'قماش الكاب',
      size: 'المقاس',
      color: 'اللون',
      capColor: 'لون الكاب',
      dandoshColor: 'لون الدندوش'
    };
    return names[optionName] || optionName;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-32">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل السلة...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-32">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-red-800 mb-2">خطأ في تحميل السلة</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={fetchCart}
            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 pt-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">السلة فارغة</h3>
            <p className="text-gray-600 mb-8">لم تقم بإضافة أي منتجات للسلة بعد</p>
            <Link
              to="/products"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
            >
              تسوق الآن
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-32" dir="rtl">
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
              <li className="text-gray-600 font-medium">سلة التسوق</li>
            </ol>
          </nav>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">سلة التسوق</h1>
              <p className="text-gray-600 mt-1">{totalItems} منتج في السلة</p>
            </div>
            
            {cartItems.length > 0 && (
              <button
                onClick={clearCart}
                className="text-red-600 hover:text-red-800 transition-colors duration-200 text-sm font-medium"
              >
                إفراغ السلة
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex items-start gap-4">
                  
                  {/* Product Image */}
                  <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={buildImageUrl(item.product?.mainImage || '')}
                      alt={item.product?.name || 'منتج'}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/product/${item.productId}`}
                      className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors duration-200 line-clamp-2"
                    >
                      {item.product?.name || 'منتج غير معروف'}
                    </Link>
                    
                    {/* Selected Options */}
                    {item.selectedOptions && Object.keys(item.selectedOptions).length > 0 && (
                      <div className="mt-2 p-2 bg-blue-50 rounded-lg">
                        <p className="text-xs font-bold text-blue-700 mb-1">المواصفات:</p>
                        <div className="grid grid-cols-2 gap-1">
                          {Object.entries(item.selectedOptions).map(([optionName, value]) => (
                            <div key={optionName} className="text-xs">
                              <span className="text-gray-600">{getOptionDisplayName(optionName)}:</span>
                              <span className="font-semibold text-gray-800 mr-1">{value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Attachments */}
                    {item.attachments && (item.attachments.text || (item.attachments.images && item.attachments.images.length > 0)) && (
                      <div className="mt-2 p-2 bg-purple-50 rounded-lg">
                        <p className="text-xs font-bold text-purple-700 mb-1">مرفقات:</p>
                        {item.attachments.text && (
                          <p className="text-xs text-gray-700">📝 {item.attachments.text.substring(0, 50)}...</p>
                        )}
                        {item.attachments.images && item.attachments.images.length > 0 && (
                          <p className="text-xs text-purple-600">🖼️ {item.attachments.images.length} صورة</p>
                        )}
                      </div>
                    )}
                    
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <span className="text-xl font-bold text-gray-900">
                          {((item.product?.price || 0) * item.quantity).toFixed(2)} ر.س
                        </span>
                        <span className="text-sm text-gray-500">
                          {(item.product?.price || 0).toFixed(2)} ر.س × {item.quantity}
                        </span>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-3">
                        <div className="flex items-center border border-gray-300 rounded-lg">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-2 hover:bg-gray-100 transition-colors duration-200"
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="px-4 py-2 text-center min-w-[60px] border-x border-gray-300 font-medium">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-2 hover:bg-gray-100 transition-colors duration-200"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>

                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors duration-200"
                          title="حذف المنتج"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Package className="w-5 h-5" />
                ملخص الطلب
              </h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">المجموع الفرعي:</span>
                  <span className="font-medium">{totalPrice.toFixed(2)} ر.س</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">رسوم التوصيل:</span>
                  <span className="font-medium">
                    {shippingCost === 0 ? (
                      <span className="text-green-600">مجاني</span>
                    ) : (
                      `${shippingCost} ر.س`
                    )}
                  </span>
                </div>

                {shippingCost === 0 && (
                  <div className="text-sm text-green-600 bg-green-50 p-2 rounded">
                    🎉 تهانينا! حصلت على التوصيل المجاني
                  </div>
                )}
                
                <hr className="border-gray-200" />
                
                <div className="flex justify-between text-lg font-bold">
                  <span>المجموع الكلي:</span>
                  <span className="text-blue-600">{finalTotal.toFixed(2)} ر.س</span>
                </div>
              </div>

              <div className="space-y-3">
                <Link
                  to="/checkout"
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium text-center block"
                >
                  متابعة للدفع
                </Link>
                
                <Link
                  to="/products"
                  className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium text-center block"
                >
                  متابعة التسوق
                </Link>
              </div>

              {/* Shipping & Security Info */}
              <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Truck className="w-4 h-4" />
                  <span>التوصيل خلال 1-3 أيام عمل</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <CreditCard className="w-4 h-4" />
                  <span>دفع آمن ومحمي</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart; 