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
    
    // مسح localStorage المفسد إذا كان موجود
    const lastCartCount = localStorage.getItem('lastCartCount');
    const lastCartValue = localStorage.getItem('lastCartValue');
    
    console.log('🔍 [Cart] Current localStorage values:', {
      lastCartCount,
      lastCartValue,
      userData: !!localStorage.getItem('user')
    });
    
    // استدعاء fetchCart
    fetchCart();
    
    // Auto-refresh مشروط - بس إذا مافيش عمليات جارية
    const autoRefreshInterval = setInterval(() => {
      // منع التحديث إذا كان المستخدم بيتفاعل مع السلة
      if (!loading && !uploadingImages) {
        console.log('🔄 [Cart] Auto-refresh triggered');
        fetchCart();
      }
    }, 15000); // زودت المدة ل 15 ثانية لتقليل الضغط
    
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
        const userData = localStorage.getItem('user');
        let testEndpoint = '/api/cart?userId=guest';
        
        if (userData) {
          try {
            const user = JSON.parse(userData);
            if (user && user.id) {
              testEndpoint = `/api/user/${user.id}/cart`;
            }
          } catch (parseError) {
            console.error('Parse error in test:', parseError);
          }
        }
        
        const response = await apiCall(testEndpoint);
        if (Array.isArray(response) && response.length > 0) {
          console.log('🚨 [Cart] ERROR: Cart appears empty but API has', response.length, 'items!');
          console.log('🚨 [Cart] API Response:', response);
          toast.error(`🚨 خطأ! السلة تظهر فارغة لكن البكند فيه ${response.length} منتج`, {
            position: "top-center",
            autoClose: 8000,
            style: {
              background: '#DC2626',
              fontWeight: 'bold'
            }
          });
          
          // إعادة تحميل فوري
          console.log('🔄 [Cart] Force refreshing cart due to mismatch...');
          setCartItems(response);
          const totalCount = response.reduce((sum, item) => sum + item.quantity, 0);
          const totalValue = response.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0);
          cartSyncManager.updateCart(totalCount, totalValue);
        } else {
          console.log('✅ [Cart] Confirmed: Cart is actually empty');
        }
      } catch (error) {
        console.log('📡 [Cart] Backend connectivity test failed:', error);
        toast.error(`🔧 مشكلة في الاتصال: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`, {
          position: "top-center",
          autoClose: 5000,
          style: {
            background: '#F59E0B',
            color: 'white',
            fontWeight: 'bold'
          }
        });
      }
    }, 1000);
    
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <CartIcon className="w-20 h-20 text-gray-400 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-800 mb-4">سلة التسوق فارغة</h2>
          <p className="text-gray-600 mb-6">لم تقم بإضافة أي منتجات إلى سلة التسوق بعد</p>
          
          {/* إضافة معلومات تشخيصية */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 max-w-md mx-auto">
            <p className="text-blue-800 text-sm">
              <strong>حالة التحميل:</strong> {loading ? 'جاري التحميل...' : 'مكتمل'}<br/>
              <strong>المستخدم:</strong> {localStorage.getItem('user') ? 'مسجل' : 'ضيف'}<br/>
              <strong>عدد المنتجات:</strong> {cartItems.length}
            </p>
          </div>
          
          <div className="space-y-4">
            <Link 
              to="/" 
              className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 font-bold transition-colors inline-block"
            >
              استعرض المنتجات
            </Link>
            
            <div className="flex gap-2 justify-center">
              <button
                onClick={fetchCart}
                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 font-bold transition-colors text-sm"
              >
                🔄 إعادة تحميل
              </button>
              <Link
                to="/test-cart-fix.html"
                className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 font-bold transition-colors text-sm"
              >
                🔧 تشخيص
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  console.log('✅ [Cart] Showing main cart content with', cartItems.length, 'items');

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Add top padding for navbar */}
      <div className="pt-20">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          {/* Improved Header */}
          <div className="mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center shadow-md">
                    <CartIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">سلة التسوق</h1>
                    <p className="text-gray-600 mt-1">
                      {cartItems.filter(item => item.product).length} منتج في السلة
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-red-600">
                    {totalPrice.toFixed(2)} ر.س
                  </div>
                  <p className="text-sm text-gray-500">المجموع الكلي</p>
                </div>
              </div>
            </div>
          </div>

          {/* Validation Warning - Improved */}
          {!canProceedToCheckout && incompleteItemsDetailed.length > 0 && (
            <div className="bg-red-50 border-l-4 border-red-400 rounded-xl p-6 mb-8 shadow-sm">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-red-600 text-lg">⚠️</span>
                </div>
                <h3 className="text-lg font-bold text-red-800">يجب إكمال هذه التفاصيل قبل المتابعة</h3>
              </div>
              <div className="space-y-4 mr-11">
                {incompleteItemsDetailed.map(({ item, missingOptions }) => (
                  <div key={item.id} className="bg-white border border-red-200 rounded-lg p-4">
                    <h4 className="font-semibold text-red-800 mb-2">{item.product?.name}</h4>
                    <p className="text-red-700 text-sm mb-2">الاختيارات المطلوبة:</p>
                    <div className="flex flex-wrap gap-2">
                      {missingOptions.map((option, index) => (
                        <span key={index} className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                          {option}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items - Better proportioned */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                    <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                      <Package className="w-5 h-5 text-gray-600" />
                      المنتجات
                    </h2>
                    <button
                      onClick={clearCart}
                      className="text-red-600 hover:text-red-700 text-sm font-medium px-3 py-1 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      إفراغ السلة
                    </button>
                  </div>

                  <div className="space-y-6">
                    {cartItems.filter(item => item.product).map((item, index) => (
                      <div key={item.id} data-item-id={item.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                        <div className="flex gap-6">
                          {/* Product Image - Better sized */}
                          <div className="flex-shrink-0">
                            <div className="w-24 h-24 bg-gray-100 rounded-xl overflow-hidden border border-gray-200">
                              {item.product?.mainImage ? (
                                <img 
                                  src={buildImageUrl(item.product.mainImage)}
                                  alt={item.product?.name || 'منتج'}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.currentTarget.src = 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=400&fit=crop&crop=center&auto=format,compress&q=80&ixlib=rb-4.0.3';
                                    e.currentTarget.onerror = null;
                                  }}
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                  <Package className="w-8 h-8" />
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                  {item.product?.name || 'منتج غير معروف'}
                                </h3>
                                <p className="text-sm text-gray-600 mb-3">
                                  {item.product?.description?.substring(0, 100)}...
                                </p>

                                {/* Product Options - Better layout */}
                                {item.product.dynamicOptions && item.product.dynamicOptions.length > 0 && (
                                  <div className="space-y-4 mb-4">
                                    {item.product.dynamicOptions.map((option) => (
                                      <div key={option.optionName} className="bg-gray-50 rounded-lg p-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                          {getOptionDisplayName(option.optionName)}
                                          {option.required && <span className="text-red-500 mr-1">*</span>}
                                        </label>
                                        
                                        {option.optionType === 'select' && option.options ? (
                                          <select
                                            value={item.selectedOptions?.[option.optionName] || ''}
                                            onChange={async (e) => {
                                              const newValue = e.target.value;
                                              const newOptions = { 
                                                ...item.selectedOptions, 
                                                [option.optionName]: newValue 
                                              };
                                              
                                              setCartItems(prev => prev.map(cartItem => 
                                                cartItem.id === item.id ? { 
                                                  ...cartItem, 
                                                  selectedOptions: newOptions 
                                                } : cartItem
                                              ));
                                              
                                              const saved = await saveOptionsToBackend(item.id, 'selectedOptions', newOptions);
                                              if (saved) {
                                                toast.success(`تم حفظ ${getOptionDisplayName(option.optionName)}`, {
                                                  position: "top-center",
                                                  autoClose: 2000,
                                                  style: { background: '#10B981', color: 'white' }
                                                });
                                              }
                                            }}
                                            className={`w-full px-4 py-3 border rounded-lg bg-white text-sm font-medium ${
                                              formErrors[option.optionName] ? 'border-red-300' : 'border-gray-300'
                                            } focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors`}
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
                                          <div className="grid grid-cols-2 gap-3">
                                            {option.options.map((opt) => (
                                              <label key={opt.value} className="flex items-center p-3 border border-gray-300 rounded-lg hover:bg-white cursor-pointer transition-colors">
                                                <input
                                                  type="radio"
                                                  name={`${item.id}-${option.optionName}`}
                                                  value={opt.value}
                                                  checked={item.selectedOptions?.[option.optionName] === opt.value}
                                                  onChange={async (e) => {
                                                    const newValue = e.target.value;
                                                    const newOptions = { 
                                                      ...item.selectedOptions, 
                                                      [option.optionName]: newValue 
                                                    };
                                                    
                                                    setCartItems(prev => prev.map(cartItem => 
                                                      cartItem.id === item.id ? { 
                                                        ...cartItem, 
                                                        selectedOptions: newOptions 
                                                      } : cartItem
                                                    ));
                                                    
                                                    const saved = await saveOptionsToBackend(item.id, 'selectedOptions', newOptions);
                                                    if (saved) {
                                                      toast.success(`تم حفظ ${getOptionDisplayName(option.optionName)}`, {
                                                        position: "top-center",
                                                        autoClose: 2000,
                                                        style: { background: '#10B981', color: 'white' }
                                                      });
                                                    }
                                                  }}
                                                  className="ml-2 text-red-600"
                                                />
                                                <span className="text-sm font-medium text-gray-700">{opt.value}</span>
                                              </label>
                                            ))}
                                          </div>
                                        ) : (
                                          <input
                                            type={option.optionType === 'number' ? 'number' : 'text'}
                                            value={item.selectedOptions?.[option.optionName] || ''}
                                            onChange={async (e) => {
                                              const newValue = e.target.value;
                                              const newOptions = { 
                                                ...item.selectedOptions, 
                                                [option.optionName]: newValue 
                                              };
                                              
                                              setCartItems(prev => prev.map(cartItem => 
                                                cartItem.id === item.id ? { 
                                                  ...cartItem, 
                                                  selectedOptions: newOptions 
                                                } : cartItem
                                              ));
                                              
                                              const saved = await saveOptionsToBackend(item.id, 'selectedOptions', newOptions);
                                              if (saved) {
                                                toast.success(`تم حفظ ${getOptionDisplayName(option.optionName)}`, {
                                                  position: "top-center",
                                                  autoClose: 2000,
                                                  style: { background: '#10B981', color: 'white' }
                                                });
                                              }
                                            }}
                                            placeholder={option.placeholder}
                                            className={`w-full px-4 py-3 border rounded-lg bg-white text-sm font-medium ${
                                              formErrors[option.optionName] ? 'border-red-300' : 'border-gray-300'
                                            } focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors`}
                                            required={option.required}
                                          />
                                        )}

                                        {/* Size Guide */}
                                        {option.optionName === 'size' && 
                                         item.product.productType && 
                                         (item.product.productType === 'جاكيت' || item.product.productType === 'عباية تخرج' || item.product.productType === 'مريول مدرسي') && (
                                          <button
                                            type="button"
                                            onClick={() => setShowSizeGuide({show: true, productType: item.product.productType || ''})}
                                            className="mt-2 text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
                                          >
                                            <ImageIcon className="w-4 h-4" />
                                            عرض دليل المقاسات
                                          </button>
                                        )}

                                        {/* Error */}
                                        {option.required && !item.selectedOptions?.[option.optionName] && (
                                          <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                                            <span>⚠️</span>
                                            هذا الحقل مطلوب
                                          </p>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                )}

                                {/* Selected Options Summary - Improved */}
                                {item.selectedOptions && Object.keys(item.selectedOptions).length > 0 && (
                                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                                    <h5 className="text-sm font-semibold text-green-800 mb-3 flex items-center gap-2">
                                      <Check className="w-4 h-4" />
                                      المواصفات المختارة
                                    </h5>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                      {Object.entries(item.selectedOptions).map(([key, value]) => (
                                        <div key={key} className="bg-white rounded-md p-3 border border-green-100">
                                          <span className="text-xs text-green-600 font-medium block mb-1">
                                            {getOptionDisplayName(key)}
                                          </span>
                                          <span className="text-sm font-semibold text-green-800">{value}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Notes - Better styling */}
                                <div className="bg-gray-50 rounded-lg p-4">
                                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                    <Edit3 className="w-4 h-4" />
                                    ملاحظات إضافية
                                  </label>
                                  <textarea
                                    value={item.attachments?.text || ''}
                                    onChange={async (e) => {
                                      const newText = e.target.value;
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
                                      
                                      if (textSaveTimeoutRef.current) {
                                        clearTimeout(textSaveTimeoutRef.current);
                                      }
                                      
                                      textSaveTimeoutRef.current = setTimeout(async () => {
                                        const saved = await saveOptionsToBackend(item.id, 'attachments', newAttachments);
                                        if (saved) {
                                          toast.success('تم حفظ الملاحظات', {
                                            position: "bottom-right",
                                            autoClose: 1500,
                                            style: { background: '#10B981', color: 'white' }
                                          });
                                        }
                                      }, 1000);
                                    }}
                                    placeholder="أضف ملاحظات أو تعليمات خاصة..."
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm resize-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                                    rows={3}
                                  />
                                </div>
                              </div>

                              <button
                                onClick={() => removeItem(item.id)}
                                className="text-gray-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition-colors"
                                title="حذف المنتج"
                              >
                                <X className="w-5 h-5" />
                              </button>
                            </div>

                            {/* Price and Quantity - Better aligned */}
                            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                              <div className="flex items-center gap-3">
                                <button
                                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                  className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 transition-colors"
                                  disabled={item.quantity <= 1}
                                >
                                  <Minus className="w-4 h-4" />
                                </button>
                                <div className="w-16 text-center">
                                  <span className="text-lg font-semibold text-gray-900">{item.quantity}</span>
                                </div>
                                <button
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                  className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50"
                                >
                                  <Plus className="w-4 h-4" />
                                </button>
                              </div>
                              <div className="text-right">
                                <div className="text-xl font-bold text-gray-900">
                                  {((item.product?.price || 0) * item.quantity).toFixed(2)} ر.س
                                </div>
                                <div className="text-sm text-gray-500">
                                  {item.product?.price?.toFixed(2)} ر.س × {item.quantity}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Order Summary - Better proportioned */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 sticky top-24">
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-red-600" />
                    ملخص الطلب
                  </h3>
                  
                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between items-center py-3 border-b border-gray-100">
                      <span className="text-gray-600 font-medium">المجموع الفرعي</span>
                      <span className="font-semibold text-gray-900">{totalPrice.toFixed(2)} ر.س</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-gray-100">
                      <span className="text-gray-600 font-medium">الشحن</span>
                      <span className="text-green-600 font-semibold flex items-center gap-1">
                        <span className="text-sm">🚚</span>
                        مجاني
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-4 bg-gray-50 rounded-lg px-4">
                      <span className="text-lg font-semibold text-gray-900">المجموع الكلي</span>
                      <span className="text-2xl font-bold text-red-600">{totalPrice.toFixed(2)} ر.س</span>
                    </div>
                  </div>

                  {/* Promo Code - Better design */}
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                      <span className="text-lg">🎫</span>
                      كود الخصم
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        placeholder="أدخل الكود"
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                      />
                      <button 
                        className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm font-medium transition-colors"
                        onClick={() => {
                          if (promoCode.trim()) {
                            toast.info('جاري التحقق من كود الخصم...');
                          } else {
                            toast.error('يرجى إدخال كود الخصم');
                          }
                        }}
                      >
                        تطبيق
                      </button>
                    </div>
                  </div>

                  {/* Actions - Better spacing */}
                  <div className="space-y-4">
                    <Link
                      to={canProceedToCheckout ? "/checkout" : "#"}
                      onClick={(e) => {
                        if (!canProceedToCheckout) {
                          e.preventDefault();
                          toast.error('يجب إكمال جميع التفاصيل المطلوبة أولاً', {
                            position: "top-center",
                            autoClose: 3000,
                            style: { background: '#DC2626', color: 'white' }
                          });
                        }
                      }}
                      className={`w-full py-4 rounded-lg font-semibold text-center block text-lg transition-all ${
                        canProceedToCheckout 
                          ? 'bg-red-600 text-white hover:bg-red-700 shadow-md hover:shadow-lg' 
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {canProceedToCheckout ? 'إتمام الطلب' : 'أكمل التفاصيل'}
                    </Link>
                    <Link
                      to="/"
                      className="w-full py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 font-medium text-center block transition-all"
                    >
                      متابعة التسوق
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Size Guide Modal - Improved */}
      {showSizeGuide.show && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowSizeGuide({show: false, productType: ''})}
        >
          <div 
            className="bg-white rounded-xl max-w-4xl max-h-[90vh] overflow-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
                <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <ImageIcon className="w-6 h-6 text-red-600" />
                  جدول المقاسات
                </h3>
                <button
                  onClick={() => setShowSizeGuide({show: false, productType: ''})}
                  className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="text-center">
                <img
                  src={getSizeGuideImage(showSizeGuide.productType)}
                  alt="دليل المقاسات"
                  className="max-w-full max-h-[70vh] mx-auto rounded-lg shadow-lg border border-gray-200"
                  onError={(e) => {
                    e.currentTarget.src = size1Image;
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShoppingCart;