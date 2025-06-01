import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft, Package, CreditCard, Truck } from 'lucide-react';
import { toast } from 'react-toastify';
import { buildImageUrl } from '../config/api';

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
  stock?: number;
}

const Cart: React.FC = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCartItems();
  }, []);

  const loadCartItems = () => {
    try {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        setCartItems(parsedCart);
      }
    } catch (error) {
      console.error('Error loading cart:', error);
      toast.error('حدث خطأ في تحميل السلة');
    } finally {
      setLoading(false);
    }
  };

  const updateCartInStorage = (items: CartItem[]) => {
    localStorage.setItem('cart', JSON.stringify(items));
    window.dispatchEvent(new CustomEvent('cartUpdated'));
  };

  const updateQuantity = (id: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(id);
      return;
    }

    const updatedItems = cartItems.map(item =>
      item.id === id ? { ...item, quantity: newQuantity } : item
    );
    
    setCartItems(updatedItems);
    updateCartInStorage(updatedItems);
    toast.success('تم تحديث الكمية');
  };

  const removeItem = (id: number) => {
    const updatedItems = cartItems.filter(item => item.id !== id);
    setCartItems(updatedItems);
    updateCartInStorage(updatedItems);
    toast.success('تم حذف المنتج من السلة');
  };

  const clearCart = () => {
    setCartItems([]);
    updateCartInStorage([]);
    toast.success('تم إفراغ السلة');
  };

  const totalPrice = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const shippingCost = totalPrice > 100 ? 0 : 15;
  const finalTotal = totalPrice + shippingCost;

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
              <li className="text-gray-600 font-medium">سلة التسوق</li>
            </ol>
          </nav>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">سلة التسوق</h1>
              <p className="text-gray-600 mt-1">{totalItems} عنصر في السلة</p>
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
                <div className="flex items-center gap-4">
                  
                  {/* Product Image */}
                  <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={buildImageUrl(item.image)}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/product/${item.id}`}
                      className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors duration-200 line-clamp-2"
                    >
                      {item.name}
                    </Link>
                    
                    <div className="mt-2 flex items-center gap-4">
                      <span className="text-xl font-bold text-gray-900">
                        {item.price.toFixed(2)} ر.س
                      </span>
                      <span className="text-sm text-gray-500">
                        للقطعة الواحدة
                      </span>
                    </div>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center border border-gray-300 rounded-lg">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-2 hover:bg-gray-100 transition-colors duration-200"
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
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Item Total */}
                <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    {item.quantity} × {item.price.toFixed(2)} ر.س
                  </span>
                  <span className="text-lg font-bold text-gray-900">
                    {(item.price * item.quantity).toFixed(2)} ر.س
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-36">
              <h2 className="text-xl font-bold text-gray-900 mb-6">ملخص الطلب</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">المجموع الفرعي ({totalItems} عنصر)</span>
                  <span className="font-medium text-gray-900">{totalPrice.toFixed(2)} ر.س</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">الشحن</span>
                  <span className="font-medium text-gray-900">
                    {shippingCost === 0 ? 'مجاني' : `${shippingCost.toFixed(2)} ر.س`}
                  </span>
                </div>
                
                {shippingCost === 0 && (
                  <div className="flex items-center gap-2 text-green-600 text-sm">
                    <Truck className="w-4 h-4" />
                    <span>شحن مجاني للطلبات أكثر من 100 ر.س</span>
                  </div>
                )}
                
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex items-center justify-between text-lg font-bold">
                    <span className="text-gray-900">المجموع الكلي</span>
                    <span className="text-gray-900">{finalTotal.toFixed(2)} ر.س</span>
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    شامل ضريبة القيمة المضافة
                  </div>
                </div>
              </div>

              {/* Checkout Button */}
              <Link
                to="/checkout"
                className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-semibold text-center flex items-center justify-center gap-2"
              >
                <CreditCard className="w-5 h-5" />
                متابعة الدفع
              </Link>

              {/* Continue Shopping */}
              <Link
                to="/products"
                className="w-full mt-3 border border-gray-300 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium text-center block"
              >
                متابعة التسوق
              </Link>

              {/* Security Features */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">مميزات الشراء</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Package className="w-4 h-4 text-green-600" />
                    <span>تغليف آمن ومحمي</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Truck className="w-4 h-4 text-green-600" />
                    <span>توصيل سريع وموثوق</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <CreditCard className="w-4 h-4 text-green-600" />
                    <span>دفع آمن ومشفر</span>
                  </div>
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