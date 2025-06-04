import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ShoppingCart as CartIcon, Plus, Minus, Trash2, Package, Sparkles, ArrowRight, Heart, Edit3, X, Check, Upload, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { apiCall, API_ENDPOINTS, buildImageUrl, buildApiUrl } from '../config/api';
import { cartSyncManager } from '../utils/cartSync';
import size1Image from '../assets/size1.png';
import size2Image from '../assets/size2.png';
import size3Image from '../assets/size3.png';

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
    dynamicOptions?: ProductOption[];
    specifications?: { name: string; value: string }[];
    sizeGuideImage?: string;
  };
}

interface ProductOption {
  optionName: string;
  optionType: 'select' | 'text' | 'number' | 'radio';
  required: boolean;
  options?: OptionValue[];
  placeholder?: string;
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
  };
}

interface OptionValue {
  value: string;
}

const ShoppingCart: React.FC = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [showSizeGuide, setShowSizeGuide] = useState<{show: boolean, productType: string}>({show: false, productType: ''});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  // إضافة ref للـ timeout
  const textSaveTimeoutRef = useRef<number | null>(null);

  // دالة لتحديد صورة المقاس المناسبة من assets
  const getSizeGuideImage = (productType: string): string => {
    // استخدام الصور الأصلية من مجلد src/assets
    const sizeGuideImages = {
      'جاكيت': size1Image,
      'عباية تخرج': size2Image, 
      'مريول مدرسي': size3Image
    };
    return sizeGuideImages[productType as keyof typeof sizeGuideImages] || size1Image;
  };

  // دالة لتحويل أسماء الحقول للعربية
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

  // تحميل السلة من الخادم
  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const userData = localStorage.getItem('user');
      console.log('👤 [Cart] User data from localStorage:', userData);
      
      let userId = 'guest'; // Default for guests
      let endpoint = '/api/cart?userId=guest'; // Guest cart endpoint
      
      // If user is logged in, use their specific cart
      if (userData) {
        try {
          const user = JSON.parse(userData);
          console.log('👤 [Cart] Parsed user:', user);
          
          if (user && user.id) {
            userId = user.id.toString();
            endpoint = `/api/user/${userId}/cart`;
            console.log('🛒 [Cart] Fetching cart for logged in user:', userId);
          } else {
            console.log('⚠️ [Cart] Invalid user object, using guest mode');
          }
        } catch (parseError) {
          console.error('❌ [Cart] Error parsing user data, using guest mode:', parseError);
        }
      } else {
        console.log('👤 [Cart] No user data found, using guest mode');
      }

      console.log('🛒 [Cart] Fetching cart from endpoint:', endpoint);
      
      // استخدام apiCall بدلاً من fetch مباشرة
      const data = await apiCall(endpoint);
      console.log('📦 [Cart] Raw API response:', data);
      
      if (Array.isArray(data)) {
        console.log('✅ [Cart] Cart items loaded:', data.length);
        const totalCount = data.reduce((sum, item) => sum + item.quantity, 0);
        const totalValue = data.reduce((sum, item) => 
          sum + (item.product?.price || 0) * item.quantity, 0
        );
        
        console.log('✅ [Cart] Cart summary:', {
          itemsCount: data.length,
          totalCount,
          totalValue,
          items: data.map(item => ({
            id: item.id,
            productId: item.productId,
            name: item.product?.name || 'Unknown',
            quantity: item.quantity,
            price: item.product?.price || 0
          }))
        });
        
        // تحديث cartSyncManager فوراً
        cartSyncManager.updateCart(totalCount, totalValue);
        
        data.forEach((item, index) => {
          console.log(`📦 [Cart] Item ${index + 1}:`, {
            id: item.id,
            productId: item.productId,
            productName: item.product?.name,
            quantity: item.quantity,
            selectedOptions: item.selectedOptions,
            optionsPricing: item.optionsPricing,
            attachments: item.attachments
          });
          
          // تحقق مفصل من الاختيارات
          if (item.selectedOptions) {
            console.log(`🎯 [Cart] Item ${item.id} selectedOptions:`, item.selectedOptions);
            Object.entries(item.selectedOptions).forEach(([key, value]) => {
              console.log(`  ✅ ${key}: ${value}`);
            });
          } else {
            console.log(`⚠️ [Cart] Item ${item.id} has NO selectedOptions`);
          }
          
          // تحقق من الملاحظات
          if (item.attachments?.text) {
            console.log(`📝 [Cart] Item ${item.id} has text: "${item.attachments.text}"`);
          }
        });
        setCartItems(data);
      } else {
        console.log('⚠️ [Cart] Unexpected data format:', data);
        setCartItems([]);
      }
    } catch (error) {
      console.error('❌ [Cart] Error fetching cart:', error);
      toast.error(`فشل في تحميل السلة: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`, {
        position: "top-center",
        autoClose: 4000,
        style: {
          background: '#DC2626',
          color: 'white',
          fontWeight: 'bold'
        }
      });
      setCartItems([]);
      setError(`فشل في تحميل السلة: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`);
    } finally {
      setLoading(false);
      setIsInitialLoading(false);
      console.log('✅ [Cart] fetchCart completed, isInitialLoading set to false');
    }
  }, []);

  useEffect(() => {
    console.log('🔄 [Cart] useEffect triggered, calling fetchCart...');
    fetchCart();
    
    // Auto-refresh مشروط - بس إذا مافيش عمليات جارية
    const autoRefreshInterval = setInterval(() => {
      // منع التحديث إذا كان المستخدم بيتفاعل مع السلة
      if (!loading && !uploadingImages) {
        console.log('🔄 [Cart] Auto-refresh triggered');
        fetchCart();
      }
    }, 10000); // زودت المدة ل 10 ثواني بدلاً من 3
    
    // التنظيف عند إلغاء التحميل
    return () => {
      clearInterval(autoRefreshInterval);
    };
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
      // الحصول على البيانات الحالية للمنتج
      const currentItem = cartItems.find(item => item.id === itemId);
      if (!currentItem) return;

      // تحضير البيانات المحدثة مع الحفاظ على selectedOptions و attachments
      const updateData = {
        quantity: newQuantity,
        selectedOptions: currentItem.selectedOptions || {},
        attachments: currentItem.attachments || {}
      };

      console.log('🔢 [Cart] Updating quantity with preserved data:', { itemId, newQuantity, updateData });

      // استخدام apiCall بدلاً من fetch مباشرة
      await apiCall(endpoint, {
        method: 'PUT',
        body: JSON.stringify(userId === 'guest' ? { quantity: newQuantity } : updateData)
      });
      
      // تحديث الحالة المحلية
      setCartItems(prev => prev.map(item => 
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      ));
      
      // Update cart sync manager immediately
      await cartSyncManager.syncWithServer();
      
      console.log('✅ [Cart] Quantity updated successfully while preserving options');
    } catch (error) {
      console.error('❌ [Cart] Error updating quantity:', error);
      toast.error(`فشل في تحديث الكمية: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`, {
        position: "top-center",
        autoClose: 3000,
        style: {
          background: '#DC2626',
          color: 'white'
        }
      });
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
      console.log('🗑️ [Cart] Removing item:', { itemId, userId, endpoint });
      
      // تحديث الحالة المحلية فوراً قبل الطلب
      setCartItems(prev => prev.filter(item => item.id !== itemId));
      
      // استخدام apiCall بدلاً من fetch مباشرة
      await apiCall(endpoint, {
        method: 'DELETE'
      });
      
      // Update cart sync manager immediately
      await cartSyncManager.syncWithServer();
      
      toast.success('تم حذف المنتج من السلة', {
        position: "top-center",
        autoClose: 2000,
        style: {
          background: '#10B981',
          color: 'white'
        }
      });
    } catch (error) {
      console.error('❌ [Cart] Error removing item:', error);
      // إعادة المنتج إذا فشل الحذف
      await fetchCart();
      toast.error(`فشل في حذف المنتج: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`, {
        position: "top-center",
        autoClose: 3000,
        style: {
          background: '#DC2626',
          color: 'white'
        }
      });
    }
  };

  // حساب المجموع الكلي
  const totalPrice = useMemo(() => {
    return cartItems.reduce((total, item) => {
      // تأكد من وجود بيانات المنتج
      if (!item.product || typeof item.product.price !== 'number') {
        console.warn('⚠️ [Cart] Product data missing for item:', item.id, 'productId:', item.productId);
        return total; // تجاهل المنتج إذا لم تكن بياناته متاحة
      }
      
      const basePrice = item.product.price;
      const optionsPrice = item.optionsPricing ? 
        Object.values(item.optionsPricing).reduce((sum, price) => sum + price, 0) : 0;
      return total + ((basePrice + optionsPrice) * item.quantity);
    }, 0);
  }, [cartItems]);

  const totalItemsCount = useMemo(() => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  }, [cartItems]);

  // التحقق من صحة البيانات المطلوبة - محدثة وأكثر صرامة
  const validateCartItems = () => {
    const incompleteItems: Array<{
      item: CartItem;
      missingOptions: string[];
      missingRequiredCount: number;
    }> = [];

    cartItems.forEach(item => {
      // تأكد من وجود بيانات المنتج
      if (!item.product) {
        console.warn('⚠️ [Cart] Product data missing for validation, item:', item.id, 'productId:', item.productId);
        return; // تجاهل المنتج إذا لم تكن بياناته متاحة
      }
      
      if (!item.product.dynamicOptions || item.product.dynamicOptions.length === 0) {
        return; // منتج بدون خيارات مطلوبة
      }
      
      const requiredOptions = item.product.dynamicOptions.filter(option => option.required);
      if (requiredOptions.length === 0) {
        return; // لا توجد خيارات مطلوبة
      }

      const missingOptions: string[] = [];
      
      requiredOptions.forEach(option => {
        const isOptionFilled = item.selectedOptions && 
                              item.selectedOptions[option.optionName] && 
                              item.selectedOptions[option.optionName].trim() !== '';
        
        if (!isOptionFilled) {
          missingOptions.push(getOptionDisplayName(option.optionName));
        }
      });

      if (missingOptions.length > 0) {
        incompleteItems.push({
          item,
          missingOptions,
          missingRequiredCount: missingOptions.length
        });
      }
    });
    
    console.log('🔍 [Cart Validation] Incomplete items:', incompleteItems);
    return incompleteItems;
  };

  const incompleteItemsDetailed = validateCartItems();
  const canProceedToCheckout = incompleteItemsDetailed.length === 0;

  // رفع الصور
  const handleImageUpload = async (files: FileList) => {
    setUploadingImages(true);
    const uploadedImages: string[] = [];

    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append('image', file);

        const response = await fetch(buildApiUrl('/upload'), {
          method: 'POST',
          body: formData
        });

        if (response.ok) {
          const data = await response.json();
          uploadedImages.push(data.imageUrl);
        }
      }

      toast.success(`تم رفع ${uploadedImages.length} صورة`);
    } catch (error) {
      console.error('Error uploading images:', error);
      toast.error('خطأ في رفع الصور');
    } finally {
      setUploadingImages(false);
    }
  };

  // إفراغ السلة
  const clearCart = async () => {
    if (!window.confirm('هل أنت متأكد من إفراغ السلة؟')) return;

    try {
      // إفراغ فوري من الواجهة
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

      console.log('🗑️ [Cart] Clearing cart:', { userId, endpoint });

      // استخدام apiCall بدلاً من fetch مباشرة
      await apiCall(endpoint, {
        method: 'DELETE'
      });

      // Update cart sync manager immediately
      await cartSyncManager.syncWithServer();

      toast.success('تم إفراغ السلة', {
        position: "top-center",
        autoClose: 2000,
        style: {
          background: '#10B981',
          color: 'white'
        }
      });
    } catch (error) {
      console.error('❌ [Cart] Error clearing cart:', error);
      toast.error(`خطأ في إفراغ السلة: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`, {
        position: "top-center",
        autoClose: 3000,
        style: {
          background: '#DC2626',
          color: 'white'
        }
      });
      fetchCart();
    }
  };

  console.log('🔄 Render state:', { 
    loading, 
    isInitialLoading, 
    error, 
    cartItemsCount: cartItems.length,
    totalItemsCount,
  });

  // إضافة تشخيص إضافي
  console.log('🔍 [Cart Debug] Current states:', {
    loading,
    isInitialLoading,
    error,
    cartItemsLength: cartItems.length,
    userData: !!localStorage.getItem('user')
  });

  // دالة محدثة لحفظ البيانات فوراً
  const saveOptionsToBackend = async (itemId: number, field: string, value: any) => {
    try {
      const userData = localStorage.getItem('user');
      let userId = 'guest';
      
      if (userData) {
        try {
          const user = JSON.parse(userData);
          if (user && user.id) {
            userId = user.id.toString();
          }
        } catch (parseError) {
          console.error('Error parsing user data:', parseError);
        }
      }

      if (userId === 'guest') {
        toast.info('تحديث السلة متاح للمستخدمين المسجلين فقط. سيتم حفظ التغييرات عند تسجيل الدخول.');
        return false;
      }
      
      // الحصول على البيانات الحالية للمنتج
      const currentItem = cartItems.find(item => item.id === itemId);
      if (!currentItem) {
        console.error('❌ [Cart] Item not found:', itemId);
        return false;
      }

      // تحضير البيانات المحدثة بنفس format اللي بيتستخدم في ProductDetail
      let updateData: any;
      
      if (field === 'selectedOptions') {
        updateData = {
          productId: currentItem.productId,
          quantity: currentItem.quantity,
          selectedOptions: value, // البيانات الجديدة كاملة
          optionsPricing: currentItem.optionsPricing || {},
          attachments: currentItem.attachments || {}
        };
      } else if (field === 'attachments') {
        updateData = {
          productId: currentItem.productId,
          quantity: currentItem.quantity,
          selectedOptions: currentItem.selectedOptions || {},
          optionsPricing: currentItem.optionsPricing || {},
          attachments: value // البيانات الجديدة كاملة
        };
      }

      console.log('💾 [Cart] SAVE ATTEMPT:', { 
        itemId, 
        field, 
        value, 
        currentItem: {
          id: currentItem.id,
          productId: currentItem.productId,
          currentSelectedOptions: currentItem.selectedOptions,
          currentAttachments: currentItem.attachments
        },
        updateData,
        url: `user/${userId}/cart/${itemId}`
      });

      // استخدام apiCall بدلاً من fetch مباشرة
      const result = await apiCall(`user/${userId}/cart/${itemId}`, {
        method: 'PUT',
        body: JSON.stringify(updateData)
      });

      console.log('✅ [Cart] Backend PUT successful:', result);
      return true;
    } catch (error) {
      console.error('❌ [Cart] Error saving to backend:', error);
      toast.error(`فشل في حفظ البيانات: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`, {
        position: "top-center",
        autoClose: 4000,
        style: {
          background: '#DC2626',
          color: 'white',
          fontWeight: 'bold'
        }
      });
      return false;
    }
  };

  if (isInitialLoading) {
    console.log('🔄 [Cart] Showing initial loading screen');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <CartIcon className="w-16 h-16 text-blue-500 mx-auto mb-4 animate-spin" />
          <h2 className="text-xl font-bold text-gray-800">جاري تحميل السلة...</h2>
          <p className="text-gray-600 mt-2">يرجى الانتظار</p>
          <p className="text-sm text-blue-600 mt-4">اختبار اتصال البكند...</p>
        </div>
      </div>
    );
  }

  if (error) {
    console.log('❌ [Cart] Showing error screen:', error);
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <div className="text-center max-w-md">
          <CartIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-red-800 mb-2">خطأ في تحميل السلة</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <div className="space-y-2">
            <button 
              onClick={fetchCart}
              className="w-full bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
            >
              إعادة المحاولة
            </button>
            <Link
              to="/cart/diagnostics"
              className="block w-full bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors text-center"
            >
              🔧 تشخيص المشكلة
            </Link>
            <button
              onClick={async () => {
                console.log('🔄 [Cart] Emergency reset from error screen');
                await cartSyncManager.hardRefresh();
                window.location.reload();
              }}
              className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              🔄 إعادة تعيين شامل
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    console.log('📦 [Cart] Showing empty cart screen - but checking if this is correct...');
    
    // اختبار سريع للتأكد إن السلة فارغة فعلاً
    setTimeout(async () => {
      try {
        const response = await fetch('http://localhost:3001/api/cart?userId=guest');
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          console.log('🚨 [Cart] ERROR: Cart appears empty but backend has', data.length, 'items!');
          toast.error(`🚨 خطأ! السلة تظهر فارغة لكن البكند فيه ${data.length} منتج`, {
            position: "top-center",
            autoClose: 5000,
            style: {
              background: '#DC2626',
              fontWeight: 'bold'
            }
          });
        }
      } catch (error) {
        console.log('📡 [Cart] Backend connectivity test failed:', error);
      }
    }, 1000);
    
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <CartIcon className="w-20 h-20 text-gray-400 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-800 mb-4">سلة التسوق فارغة</h2>
          <p className="text-gray-600 mb-6">لم تقم بإضافة أي منتجات إلى سلة التسوق بعد</p>
          <div className="space-y-4">
            <Link 
              to="/" 
              className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 font-bold transition-colors inline-block"
            >
              استعرض المنتجات
            </Link>
          </div>
        </div>
      </div>
    );
  }

  console.log('✅ [Cart] Showing main cart content with', cartItems.length, 'items');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100" dir="rtl">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-gray-800 to-black rounded-full flex items-center justify-center shadow-lg border border-gray-600">
              <CartIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-black bg-clip-text text-transparent">
                سلة التسوق
              </h1>
              <p className="text-gray-600 mt-2">مراجعة وتعديل طلبك</p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-4 mb-6">
            <div className="bg-gray-800 text-white px-6 py-3 rounded-full shadow-md border border-gray-600">
              <span className="text-lg font-bold">
                {cartItems.filter(item => item.product).length} منتج صحيح في السلة
                {cartItems.filter(item => !item.product).length > 0 && (
                  <span className="text-red-300 mr-2">
                    + {cartItems.filter(item => !item.product).length} ناقص
                  </span>
                )}
              </span>
            </div>
            <button
              onClick={clearCart}
              className="bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 rounded-full hover:from-red-700 hover:to-red-800 transition-all shadow-lg transform hover:scale-105 border border-red-500"
            >
              🗑️ إفراغ السلة
            </button>
          </div>

          {/* Status Indicator */}
          <div className="flex items-center justify-center gap-4">
            {!canProceedToCheckout && (
              <div className="bg-gradient-to-r from-red-900 to-red-800 border-2 border-red-600 rounded-full px-6 py-3 shadow-lg">
                <div className="flex items-center gap-2">
                  <span className="text-red-300 text-xl">⚠️</span>
                  <span className="font-bold text-red-200">
                    {incompleteItemsDetailed.length} منتج يحتاج إكمال التفاصيل
                  </span>
                </div>
              </div>
            )}
            {canProceedToCheckout && (
              <div className="bg-gradient-to-r from-green-900 to-green-800 border-2 border-green-600 rounded-full px-6 py-3 shadow-lg">
                <div className="flex items-center gap-2">
                  <span className="text-green-300 text-xl">✅</span>
                  <span className="font-bold text-green-200">جاهز للمتابعة</span>
                </div>
              </div>
            )}
          </div>

          {/* تفاصيل المنتجات الناقصة */}
          {!canProceedToCheckout && incompleteItemsDetailed.length > 0 && (
            <div className="bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-300 rounded-2xl p-6 mx-4 mb-6">
              <h3 className="text-xl font-bold text-red-800 mb-4 flex items-center gap-3">
                <span className="text-2xl">🚨</span>
                يجب إكمال هذه التفاصيل قبل المتابعة:
              </h3>
              <div className="space-y-4">
                {incompleteItemsDetailed.map(({ item, missingOptions }) => (
                  <div key={item.id} className="bg-white border border-red-200 rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-red-600 font-bold text-lg">📦</span>
                      <h4 className="font-bold text-red-800">{item.product?.name}</h4>
                    </div>
                    <p className="text-red-700 mb-2">الاختيارات المطلوبة الناقصة:</p>
                    <ul className="list-disc list-inside space-y-1 text-red-600">
                      {missingOptions.map((option, index) => (
                        <li key={index} className="font-semibold">
                          <span className="text-red-800">{option}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 bg-red-100 rounded-lg">
                <p className="text-red-800 font-bold text-center">
                  ⚠️ لن تتمكن من إتمام الطلب حتى تحديد جميع الاختيارات المطلوبة
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Cart Content */}
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
            {/* Cart Items - Takes 3 columns */}
            <div className="xl:col-span-3">
              <div className="space-y-8">
                {/* منتجات مفقودة البيانات */}
                {cartItems.filter(item => !item.product).length > 0 && (
                  <div className="bg-gradient-to-r from-red-900 to-red-800 border-2 border-red-600 rounded-2xl p-6 shadow-lg">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
                      <span className="text-2xl">⚠️</span>
                      منتجات تحتاج إصلاح ({cartItems.filter(item => !item.product).length})
                    </h3>
                    <div className="space-y-3">
                      {cartItems.filter(item => !item.product).map((item) => (
                        <div key={item.id} className="bg-red-800 border border-red-600 rounded-xl p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-red-200 font-bold">منتج #{item.productId}</p>
                              <p className="text-red-300 text-sm">الكمية: {item.quantity}</p>
                            </div>
                            <button
                              onClick={() => removeItem(item.id)}
                              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-all font-bold"
                            >
                              حذف
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="text-red-200 mt-4 text-center">
                      هذه المنتجات بياناتها مفقودة من قاعدة البيانات، يرجى حذفها أو تحديث السلة
                    </p>
                  </div>
                )}
                
                {/* المنتجات الصحيحة */}
                {cartItems.filter(item => item.product).map((item, index) => (
                  <div key={item.id} data-item-id={item.id} className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-500">
                    {/* Product Header */}
                    <div className="bg-gradient-to-r from-red-600 via-red-700 to-rose-600 text-white p-6">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-white bg-opacity-20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white border-opacity-30">
                            <span className="text-white font-bold text-lg">{index + 1}</span>
                          </div>
                          <div>
                            <h3 className="text-xl font-bold">{item.product?.name || 'منتج غير معروف'}</h3>
                            <p className="text-red-100">
                              {item.product?.description?.substring(0, 50)}...
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <button
                            onClick={() => removeItem(item.id)}
                            className="w-12 h-12 bg-red-800 bg-opacity-60 backdrop-blur-sm text-white rounded-xl flex items-center justify-center hover:bg-opacity-80 transition-all shadow-lg transform hover:scale-110 border border-red-400"
                            title="حذف المنتج"
                          >
                            <X className="w-6 h-6" />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 lg:p-8">
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Product Image and Price */}
                        <div className="lg:col-span-1">
                          <div className="space-y-6">
                            {/* Main Product Image */}
                            <div className="relative group">
                              <div className="w-full h-80 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl overflow-hidden shadow-lg border border-gray-200">
                                {item.product?.mainImage ? (
                                  <img 
                                    src={buildImageUrl(item.product.mainImage)}
                                    alt={item.product?.name || 'منتج'}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-5xl">
                                    📦
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Price and Quantity */}
                            <div className="bg-gradient-to-br from-red-600 to-rose-600 p-6 rounded-xl border-2 border-red-500 shadow-lg">
                              <div className="text-center mb-4">
                                <div className="text-3xl font-bold text-white">
                                  {((item.product?.price || 0) * item.quantity).toFixed(2)} ر.س
                                </div>
                                <div className="text-red-100 mt-1">
                                  {item.product?.price?.toFixed(2)} ر.س × {item.quantity}
                                </div>
                              </div>
                              
                              <div className="flex items-center justify-center gap-4">
                                <button
                                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                  className="w-12 h-12 bg-gradient-to-r from-white to-gray-50 text-red-600 rounded-xl flex items-center justify-center hover:from-gray-50 hover:to-gray-100 transition-all shadow-lg transform hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-200"
                                  disabled={item.quantity <= 1}
                                >
                                  <Minus className="w-6 h-6" />
                                </button>
                                <div className="w-20 text-center">
                                  <div className="text-2xl font-bold bg-white text-red-600 py-3 rounded-xl border-2 border-red-300 shadow-md">
                                    {item.quantity}
                                  </div>
                                </div>
                                <button
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                  className="w-12 h-12 bg-gradient-to-r from-white to-gray-50 text-red-600 rounded-xl flex items-center justify-center hover:from-gray-50 hover:to-gray-100 transition-all shadow-lg transform hover:scale-110 border border-gray-200"
                                >
                                  <Plus className="w-6 h-6" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Product Options and Details */}
                        <div className="lg:col-span-2">
                          <div className="space-y-6">
                            {/* Product Options */}
                            {item.product.dynamicOptions && item.product.dynamicOptions.length > 0 && (
                              <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl border-2 border-gray-200 shadow-lg">
                                <h5 className="text-2xl font-bold text-red-700 mb-6 flex items-center gap-3">
                                  <Package className="w-7 h-7 text-red-600" />
                                  خيارات المنتج
                                </h5>
                                
                                <div className="space-y-6">
                                  {item.product.dynamicOptions.map((option) => (
                                    <div key={option.optionName} className="space-y-3">
                                      <label className="block text-lg font-semibold text-gray-800">
                                        {getOptionDisplayName(option.optionName)}
                                        {option.required && <span className="text-red-500 mr-2">*</span>}
                                      </label>
                                      
                                      {option.optionType === 'select' && option.options ? (
                                        <select
                                          value={item.selectedOptions?.[option.optionName] || ''}
                                          onChange={async (e) => {
                                            const newValue = e.target.value;
                                            
                                            console.log('🎯 [Cart] BEFORE UPDATE:', {
                                              itemId: item.id,
                                              optionName: option.optionName,
                                              oldValue: item.selectedOptions?.[option.optionName],
                                              newValue: newValue,
                                              currentSelectedOptions: item.selectedOptions
                                            });
                                            
                                            // تحديث الحالة المحلية فوراً
                                            const newOptions = { 
                                              ...item.selectedOptions, 
                                              [option.optionName]: newValue 
                                            };
                                            
                                            console.log('🎯 [Cart] NEW OPTIONS OBJECT:', newOptions);
                                            
                                            setCartItems(prev => {
                                              const updated = prev.map(cartItem => 
                                                cartItem.id === item.id ? { 
                                                  ...cartItem, 
                                                  selectedOptions: newOptions 
                                                } : cartItem
                                              );
                                              console.log('🎯 [Cart] UPDATED CART ITEMS:', updated);
                                              return updated;
                                            });
                                            
                                            console.log('🎯 [Cart] CALLING SAVE TO BACKEND...');
                                            
                                            // حفظ في البكند
                                            const saved = await saveOptionsToBackend(item.id, 'selectedOptions', newOptions);
                                            console.log('🎯 [Cart] SAVE RESULT:', saved);
                                            
                                            if (saved) {
                                              toast.success(`✅ تم حفظ ${getOptionDisplayName(option.optionName)}: ${newValue}`, {
                                                position: "top-center",
                                                autoClose: 2000,
                                                hideProgressBar: true,
                                                style: {
                                                  background: '#10B981',
                                                  color: 'white',
                                                  fontSize: '16px',
                                                  fontWeight: 'bold'
                                                }
                                              });
                                            }
                                          }}
                                          className={`w-full px-4 py-3 border rounded-xl bg-white text-gray-800 border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 ${
                                            formErrors[option.optionName] ? 'border-red-500' : 'border-gray-300'
                                          }`}
                                          required={option.required}
                                        >
                                          <option value="">اختر {getOptionDisplayName(option.optionName)}</option>
                                          {option.options.map((opt) => (
                                            <option key={opt.value} value={opt.value}>
                                              {opt.value}
                                            </option>
                                          ))}
                                        </select>
                                      ) : option.optionType === 'radio' && option.options ? (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                          {option.options.map((opt) => (
                                            <label key={opt.value} className="flex items-center p-4 border-2 border-gray-300 bg-white rounded-xl hover:bg-gray-50 hover:border-red-300 cursor-pointer transition-all shadow-sm">
                                              <input
                                                type="radio"
                                                name={`${item.id}-${option.optionName}`}
                                                value={opt.value}
                                                checked={item.selectedOptions?.[option.optionName] === opt.value}
                                                onChange={async (e) => {
                                                  const newValue = e.target.value;
                                                  
                                                  console.log('🎯 [Cart] BEFORE UPDATE:', {
                                                    itemId: item.id,
                                                    optionName: option.optionName,
                                                    oldValue: item.selectedOptions?.[option.optionName],
                                                    newValue: newValue,
                                                    currentSelectedOptions: item.selectedOptions
                                                  });
                                                  
                                                  // تحديث الحالة المحلية فوراً
                                                  const newOptions = { 
                                                    ...item.selectedOptions, 
                                                    [option.optionName]: newValue 
                                                  };
                                                  
                                                  console.log('🎯 [Cart] NEW OPTIONS OBJECT:', newOptions);
                                                  
                                                  setCartItems(prev => {
                                                    const updated = prev.map(cartItem => 
                                                      cartItem.id === item.id ? { 
                                                        ...cartItem, 
                                                        selectedOptions: newOptions 
                                                      } : cartItem
                                                    );
                                                    console.log('🎯 [Cart] UPDATED CART ITEMS:', updated);
                                                    return updated;
                                                  });
                                                  
                                                  console.log('🎯 [Cart] CALLING SAVE TO BACKEND...');
                                                  
                                                  // حفظ في البكند
                                                  const saved = await saveOptionsToBackend(item.id, 'selectedOptions', newOptions);
                                                  console.log('🎯 [Cart] SAVE RESULT:', saved);
                                                  
                                                  if (saved) {
                                                    toast.success(`✅ تم حفظ ${getOptionDisplayName(option.optionName)}: ${newValue}`, {
                                                      position: "top-center",
                                                      autoClose: 2000,
                                                      hideProgressBar: true,
                                                      style: {
                                                        background: '#10B981',
                                                        color: 'white',
                                                        fontSize: '16px',
                                                        fontWeight: 'bold'
                                                      }
                                                    });
                                                  }
                                                }}
                                                className="ml-3 text-red-600 scale-125"
                                              />
                                              <span className="font-medium text-gray-700">{opt.value}</span>
                                            </label>
                                          ))}
                                        </div>
                                      ) : (
                                        <input
                                          type={option.optionType === 'number' ? 'number' : 'text'}
                                          value={item.selectedOptions?.[option.optionName] || ''}
                                          onChange={async (e) => {
                                            const newValue = e.target.value;
                                            
                                            console.log('🎯 [Cart] BEFORE UPDATE:', {
                                              itemId: item.id,
                                              optionName: option.optionName,
                                              oldValue: item.selectedOptions?.[option.optionName],
                                              newValue: newValue,
                                              currentSelectedOptions: item.selectedOptions
                                            });
                                            
                                            // تحديث الحالة المحلية فوراً
                                            const newOptions = { 
                                              ...item.selectedOptions, 
                                              [option.optionName]: newValue 
                                            };
                                            
                                            console.log('🎯 [Cart] NEW OPTIONS OBJECT:', newOptions);
                                            
                                            setCartItems(prev => {
                                              const updated = prev.map(cartItem => 
                                                cartItem.id === item.id ? { 
                                                  ...cartItem, 
                                                  selectedOptions: newOptions 
                                                } : cartItem
                                              );
                                              console.log('🎯 [Cart] UPDATED CART ITEMS:', updated);
                                              return updated;
                                            });
                                            
                                            console.log('🎯 [Cart] CALLING SAVE TO BACKEND...');
                                            
                                            // حفظ في البكند
                                            const saved = await saveOptionsToBackend(item.id, 'selectedOptions', newOptions);
                                            console.log('🎯 [Cart] SAVE RESULT:', saved);
                                            
                                            if (saved) {
                                              toast.success(`✅ تم حفظ ${getOptionDisplayName(option.optionName)}: ${newValue}`, {
                                                position: "top-center",
                                                autoClose: 2000,
                                                hideProgressBar: true,
                                                style: {
                                                  background: '#10B981',
                                                  color: 'white',
                                                  fontSize: '16px',
                                                  fontWeight: 'bold'
                                                }
                                              });
                                            }
                                          }}
                                          placeholder={option.placeholder}
                                          className={`w-full px-4 py-3 border rounded-xl bg-white text-gray-800 border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 ${
                                            formErrors[option.optionName] ? 'border-red-500' : 'border-gray-300'
                                          }`}
                                          required={option.required}
                                        />
                                      )}
                                      
                                      {/* Size Guide - Only for size option */}
                                      {option.optionName === 'size' && 
                                       item.product.productType && 
                                       (item.product.productType === 'جاكيت' || item.product.productType === 'عباية تخرج' || item.product.productType === 'مريول مدرسي') && (
                                        <div className="mt-3">
                                          <div className="bg-gradient-to-r from-gray-800 to-gray-900 border-2 border-gray-700 rounded-xl p-4">
                                            <div className="flex items-center justify-between">
                                              <h6 className="font-bold text-white flex items-center gap-2">
                                                <ImageIcon className="w-5 h-5 text-blue-400" />
                                                دليل المقاسات
                                              </h6>
                                              <button
                                                type="button"
                                                onClick={() => setShowSizeGuide({show: true, productType: item.product.productType || ''})}
                                                className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 transform hover:scale-105 shadow-lg border border-blue-500"
                                              >
                                                <span className="flex items-center gap-2">
                                                  <span>👁️</span>
                                                  <span>عرض دليل المقاسات</span>
                                                </span>
                                              </button>
                                            </div>
                                            <p className="text-gray-400 text-sm mt-2">اضغط على الزر لعرض جدول المقاسات</p>
                                          </div>
                                        </div>
                                      )}
                                      
                                      {/* Validation Error */}
                                      {option.required && !item.selectedOptions?.[option.optionName] && (
                                        <div className="bg-red-900 bg-opacity-50 border border-red-600 rounded-lg p-3">
                                          <p className="text-red-300 text-sm font-medium flex items-center gap-2">
                                            <span>⚠️</span>
                                            هذا الحقل مطلوب
                                          </p>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Selected Options Summary */}
                            {item.selectedOptions && Object.keys(item.selectedOptions).length > 0 && (
                              <div className="bg-gradient-to-br from-blue-800 to-blue-900 p-4 sm:p-6 rounded-xl sm:rounded-2xl border-2 border-blue-700 shadow-lg mb-4">
                                <h5 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4 flex items-center gap-2">
                                  <Check className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" />
                                  المواصفات المختارة
                                </h5>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                  {Object.entries(item.selectedOptions).map(([key, value]) => (
                                    <div key={key} className="bg-blue-700 p-3 sm:p-4 rounded-lg sm:rounded-xl border border-blue-600 shadow-sm">
                                      <span className="text-xs sm:text-sm text-blue-200 font-medium block mb-1">{getOptionDisplayName(key)}:</span>
                                      <span className="font-bold text-white text-sm sm:text-lg">{value}</span>
                                      {/* عرض السعر الإضافي إذا كان موجود */}
                                      {item.optionsPricing && item.optionsPricing[key] && item.optionsPricing[key] > 0 && (
                                        <span className="block text-xs text-green-300 mt-1">
                                          +{item.optionsPricing[key]} ر.س
                                        </span>
                                      )}
                                    </div>
                                  ))}
                                </div>
                                {/* إجمالي السعر مع الإضافات */}
                                {item.optionsPricing && Object.values(item.optionsPricing).some(price => price > 0) && (
                                  <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-green-700 rounded-lg sm:rounded-xl border border-green-600">
                                    <span className="text-xs sm:text-sm text-green-200 font-medium">إجمالي الإضافات:</span>
                                    <span className="font-bold text-white text-sm sm:text-lg mr-2">
                                      {Object.values(item.optionsPricing).reduce((sum, price) => sum + (price || 0), 0)} ر.س
                                    </span>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* رسالة تحذيرية إذا لم يتم اختيار مواصفات مطلوبة */}
                            {(!item.selectedOptions || Object.keys(item.selectedOptions).length === 0) && 
                             item.product.dynamicOptions && 
                             item.product.dynamicOptions.some(option => option.required) && (
                              <div className="bg-gradient-to-br from-red-800 to-red-900 p-4 sm:p-6 rounded-xl sm:rounded-2xl border-2 border-red-700 shadow-lg mb-4">
                                <h5 className="text-lg sm:text-xl font-bold text-white mb-3 flex items-center gap-2">
                                  <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-400" />
                                  مواصفات مطلوبة
                                </h5>
                                <p className="text-red-200 text-sm sm:text-base">
                                  يجب تحديد المقاسات والمواصفات المطلوبة لهذا المنتج قبل المتابعة
                                </p>
                              </div>
                            )}

                            {/* Attachments */}
                            <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl border-2 border-gray-200 shadow-lg">
                              <h5 className="text-xl font-bold text-red-700 mb-4 flex items-center gap-2">
                                <Sparkles className="w-6 h-6 text-red-600" />
                                ملاحظات وصور إضافية
                              </h5>
                              
                              <div className="space-y-4">
                                <div>
                                  <label className="block text-lg font-bold text-gray-800 mb-3">
                                    ملاحظات خاصة
                                  </label>
                                  <textarea
                                    value={item.attachments?.text || ''}
                                    onChange={async (e) => {
                                      const newText = e.target.value;
                                      
                                      // تحديث الحالة المحلية فوراً
                                      const newAttachments = { 
                                        ...item.attachments, 
                                        text: newText 
                                      };
                                      
                                      setCartItems(prev => prev.map(cartItem => 
                                        cartItem.id === item.id ? { 
                                          ...cartItem, 
                                          attachments: newAttachments 
                                        } : cartItem
                                      ));
                                      
                                      console.log('📝 [Cart] Text attachment changed:', {
                                        itemId: item.id,
                                        newText,
                                        allAttachments: newAttachments
                                      });
                                      
                                      // حفظ في البكند مع debounce لتجنب الحفظ المفرط
                                      if (textSaveTimeoutRef.current) {
                                        clearTimeout(textSaveTimeoutRef.current);
                                      }
                                      
                                      textSaveTimeoutRef.current = setTimeout(async () => {
                                        const saved = await saveOptionsToBackend(item.id, 'attachments', newAttachments);
                                        if (saved) {
                                          toast.success('✅ تم حفظ الملاحظات', {
                                            position: "bottom-right",
                                            autoClose: 1500,
                                            hideProgressBar: true,
                                            style: {
                                              background: '#8B5CF6',
                                              color: 'white',
                                              fontSize: '14px'
                                            }
                                          });
                                        }
                                      }, 1000);
                                    }}
                                    placeholder="أضف أي ملاحظات أو تعليمات خاصة..."
                                    className="w-full px-4 py-4 border-2 border-gray-300 bg-white text-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 shadow-md transition-all placeholder-gray-400"
                                    rows={4}
                                  />
                                </div>

                                <div>
                                  <label className="block text-lg font-bold text-gray-800 mb-3">
                                    صور إضافية
                                  </label>
                                  <div className="flex items-center gap-3 mb-4">
                                    <label className="cursor-pointer bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white px-6 py-3 rounded-xl flex items-center gap-3 transition-all shadow-lg transform hover:scale-105 border border-red-500">
                                      <Upload className="w-5 h-5" />
                                      <span className="font-medium">رفع صور</span>
                                      <input
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        onChange={(e) => e.target.files && handleImageUpload(e.target.files)}
                                        className="hidden"
                                      />
                                    </label>
                                    {uploadingImages && (
                                      <div className="text-red-600 font-medium">جاري الرفع...</div>
                                    )}
                                  </div>
                                  
                                  {/* Uploaded Images */}
                                  {item.attachments?.images && item.attachments.images.length > 0 && (
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                      {item.attachments.images.map((img, idx) => (
                                        <div key={idx} className="relative group">
                                          <img
                                            src={img}
                                            alt={`مرفق ${idx + 1}`}
                                            className="w-full h-24 object-cover rounded-xl border-2 border-gray-600 shadow-md group-hover:scale-105 transition-transform duration-300"
                                          />
                                          <button
                                            onClick={() => {
                                              const newImages = item.attachments?.images?.filter((_, i) => i !== idx) || [];
                                              const newAttachments = { ...item.attachments, images: newImages };
                                              setCartItems(prev => prev.map(cartItem => 
                                                cartItem.id === item.id ? { ...cartItem, attachments: newAttachments } : cartItem
                                              ));
                                              saveOptionsToBackend(item.id, 'attachments', newAttachments);
                                            }}
                                            className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm opacity-0 group-hover:opacity-100 transition-opacity shadow-lg transform hover:scale-110 border border-red-500"
                                          >
                                            ×
                                          </button>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary - Takes 1 column */}
            <div className="xl:col-span-1">
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden sticky top-8 border border-gray-200">
                {/* Summary Header */}
                <div className="bg-gradient-to-r from-red-600 via-red-700 to-rose-600 text-white p-6 border-b border-red-500">
                  <h3 className="text-2xl font-bold text-center">ملخص الطلب</h3>
                  <p className="text-center text-red-100 mt-2">مراجعة نهائية</p>
                </div>
                
                <div className="p-6">
                  <div className="space-y-6 mb-8">
                    <div className="flex justify-between items-center text-lg">
                      <span className="text-gray-600">المجموع الفرعي:</span>
                      <span className="font-bold text-red-600">{totalPrice.toFixed(2)} ر.س</span>
                    </div>
                    <div className="flex justify-between items-center text-lg">
                      <span className="text-gray-600">رسوم التوصيل:</span>
                      <span className="text-green-600 font-bold">مجاني</span>
                    </div>
                    <div className="flex justify-between items-center text-lg">
                      <span className="text-gray-600">الضريبة:</span>
                      <span className="text-gray-600">محتسبة</span>
                    </div>
                    <hr className="border-gray-300" />
                    <div className="flex justify-between items-center text-2xl font-bold">
                      <span className="text-gray-800">المجموع الكلي:</span>
                      <span className="text-red-600">
                        {totalPrice.toFixed(2)} ر.س
                      </span>
                    </div>
                  </div>

                  {/* Promo Code */}
                  <div className="mb-8">
                    <label className="block text-lg font-bold text-gray-800 mb-3">كود الخصم</label>
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        placeholder="أدخل كود الخصم"
                        className="w-full px-4 py-3 border-2 border-gray-300 bg-white text-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 shadow-md transition-all placeholder-gray-400"
                      />
                      <button 
                        className="w-full bg-gradient-to-r from-gray-600 to-gray-700 text-white py-3 rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all font-bold shadow-lg transform hover:scale-105 border border-gray-500"
                        onClick={() => {
                          if (promoCode.trim()) {
                            toast.info('جاري التحقق من كود الخصم...');
                            // Add promo code logic here
                          } else {
                            toast.error('يرجى إدخال كود الخصم');
                          }
                        }}
                      >
                        تطبيق الكود
                      </button>
                    </div>
                  </div>

                  {/* Validation Warning */}
                  {!canProceedToCheckout && (
                    <div className="bg-gradient-to-r from-red-900 to-red-800 border-2 border-red-600 rounded-xl p-4 mb-6 shadow-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-red-300 text-xl">⚠️</span>
                        <span className="font-bold text-red-200">يجب إكمال التفاصيل</span>
                      </div>
                      <p className="text-red-300 text-sm">
                        {incompleteItemsDetailed.length} منتج يحتاج تحديد المقاسات
                      </p>
                    </div>
                  )}

                  <div className="space-y-4">
                    <Link
                      to={canProceedToCheckout ? "/checkout" : "#"}
                      onClick={(e) => {
                        if (!canProceedToCheckout) {
                          e.preventDefault();
                          // رسالة تفصيلية عن المشاكل
                          const totalMissing = incompleteItemsDetailed.reduce((sum, item) => sum + item.missingRequiredCount, 0);
                          const itemsText = incompleteItemsDetailed.length === 1 ? 'منتج واحد' : `${incompleteItemsDetailed.length} منتجات`;
                          const optionsText = totalMissing === 1 ? 'اختيار واحد' : `${totalMissing} اختيارات`;
                          
                          toast.error(
                            `❌ لا يمكن إتمام الطلب!\n` +
                            `${itemsText} يحتاج إلى ${optionsText} مطلوبة\n` +
                            `يرجى إكمال جميع المقاسات والتفاصيل أولاً`, 
                            {
                              position: "top-center",
                              autoClose: 5000,
                              hideProgressBar: false,
                              closeOnClick: true,
                              pauseOnHover: true,
                              draggable: true,
                              style: {
                                background: '#DC2626',
                                color: 'white',
                                fontWeight: 'bold',
                                fontSize: '16px',
                                borderRadius: '12px',
                                zIndex: 999999,
                                lineHeight: '1.5'
                              }
                            }
                          );
                          
                          // التمرير إلى أول منتج ناقص
                          if (incompleteItemsDetailed.length > 0) {
                            const firstIncompleteElement = document.querySelector(`[data-item-id="${incompleteItemsDetailed[0].item.id}"]`);
                            if (firstIncompleteElement) {
                              firstIncompleteElement.scrollIntoView({ 
                                behavior: 'smooth', 
                                block: 'center' 
                              });
                            }
                          }
                        } else {
                          // تأكيد إضافي قبل الانتقال
                          console.log('✅ [Cart] All validations passed, proceeding to checkout');
                        }
                      }}
                      className={`w-full py-4 rounded-xl font-bold text-center block transition-all text-lg shadow-lg transform ${
                        canProceedToCheckout 
                          ? 'bg-gradient-to-r from-green-600 via-green-700 to-green-800 text-white hover:from-green-700 hover:via-green-800 hover:to-green-900 hover:scale-105 border border-green-500' 
                          : 'bg-gray-600 text-gray-300 cursor-not-allowed border border-gray-500 opacity-50'
                      }`}
                    >
                      {canProceedToCheckout ? (
                        <span className="flex items-center justify-center gap-2">
                          <span>🛒</span>
                          <span>إتمام الطلب</span>
                          <span className="text-green-200">({cartItems.length} منتج)</span>
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          <span>⚠️</span>
                          <span>أكمل التفاصيل أولاً</span>
                          <span className="text-gray-400">({incompleteItemsDetailed.length} ناقص)</span>
                        </span>
                      )}
                    </Link>
                    <Link
                      to="/"
                      className="w-full border-2 border-gray-300 bg-white text-gray-700 py-3 rounded-xl hover:bg-gray-50 hover:border-gray-400 font-bold text-center block transition-all transform hover:scale-105"
                    >
                      ← متابعة التسوق
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Size Guide Modal */}
      {showSizeGuide.show && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
          onClick={() => setShowSizeGuide({show: false, productType: ''})}
        >
          <div 
            className="bg-gray-800 rounded-2xl max-w-6xl max-h-[95vh] overflow-auto relative border border-gray-600"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-3xl font-bold text-white">جدول المقاسات</h3>
                <button
                  onClick={() => setShowSizeGuide({show: false, productType: ''})}
                  className="text-gray-400 hover:text-white text-3xl font-bold hover:bg-gray-700 rounded-full w-10 h-10 flex items-center justify-center transition-all duration-200"
                >
                  ✕
                </button>
              </div>
              <div className="text-center">
                <img
                  src={getSizeGuideImage(showSizeGuide.productType)}
                  alt="دليل المقاسات"
                  className="max-w-full max-h-[70vh] mx-auto rounded-lg shadow-xl border border-gray-600"
                  onError={(e) => {
                    // في حالة فشل تحميل الصورة، استخدام صورة بديلة
                    e.currentTarget.src = size1Image;
                  }}
                />
                <p className="text-gray-400 mt-6 text-lg font-medium">
                  اضغط في أي مكان خارج الصورة للإغلاق
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShoppingCart;