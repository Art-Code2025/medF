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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900" dir="rtl">
      <div className="container mx-auto px-4 py-8">
        {/* Luxury Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 rounded-full flex items-center justify-center shadow-2xl border-4 border-amber-300 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 transform -skew-x-12 animate-pulse"></div>
              <CartIcon className="w-10 h-10 text-white relative z-10" />
            </div>
            <div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 bg-clip-text text-transparent drop-shadow-lg">
                سلة التسوق
              </h1>
              <p className="text-amber-200 mt-2 text-lg font-medium">تجربة تسوق فاخرة ومميزة</p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-6 mb-8">
            <div className="bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-700 text-white px-8 py-4 rounded-full shadow-2xl border-2 border-amber-400 backdrop-blur-sm">
              <span className="text-lg font-bold flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-200" />
                {cartItems.filter(item => item.product).length} منتج مميز في السلة
                {cartItems.filter(item => !item.product).length > 0 && (
                  <span className="text-red-300 mr-2">
                    + {cartItems.filter(item => !item.product).length} ناقص
                  </span>
                )}
              </span>
            </div>
            <button
              onClick={clearCart}
              className="bg-gradient-to-r from-red-600 via-red-700 to-red-800 text-white px-8 py-4 rounded-full hover:from-red-700 hover:to-red-900 transition-all shadow-2xl transform hover:scale-105 border-2 border-red-400 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transform -skew-x-12 transition-all duration-500"></div>
              <span className="relative z-10 flex items-center gap-2 font-bold">
                🗑️ إفراغ السلة
              </span>
            </button>
          </div>

          {/* Premium Status Indicator */}
          <div className="flex items-center justify-center gap-4">
            {!canProceedToCheckout && (
              <div className="bg-gradient-to-r from-red-800 via-red-900 to-red-800 border-3 border-red-500 rounded-full px-8 py-4 shadow-2xl backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <span className="text-red-300 text-2xl animate-pulse">⚠️</span>
                  <span className="font-bold text-red-100 text-lg">
                    {incompleteItemsDetailed.length} منتج يحتاج إكمال التفاصيل
                  </span>
                </div>
              </div>
            )}
            {canProceedToCheckout && (
              <div className="bg-gradient-to-r from-emerald-800 via-green-900 to-emerald-800 border-3 border-emerald-500 rounded-full px-8 py-4 shadow-2xl backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <span className="text-emerald-300 text-2xl animate-bounce">✅</span>
                  <span className="font-bold text-emerald-100 text-lg">جاهز للمتابعة</span>
                </div>
              </div>
            )}
          </div>

          {/* Luxury incomplete items warning */}
          {!canProceedToCheckout && incompleteItemsDetailed.length > 0 && (
            <div className="bg-gradient-to-br from-red-50 via-pink-50 to-red-100 border-3 border-red-400 rounded-3xl p-8 mx-4 mb-8 shadow-2xl backdrop-blur-sm">
              <h3 className="text-2xl font-bold text-red-800 mb-6 flex items-center justify-center gap-4">
                <span className="text-3xl animate-pulse">🚨</span>
                يجب إكمال هذه التفاصيل قبل المتابعة:
              </h3>
              <div className="space-y-6">
                {incompleteItemsDetailed.map(({ item, missingOptions }) => (
                  <div key={item.id} className="bg-white/80 backdrop-blur-sm border-2 border-red-300 rounded-2xl p-6 shadow-xl">
                    <div className="flex items-center gap-4 mb-3">
                      <span className="text-red-600 font-bold text-xl">📦</span>
                      <h4 className="font-bold text-red-800 text-lg">{item.product?.name}</h4>
                    </div>
                    <p className="text-red-700 mb-3 font-semibold">الاختيارات المطلوبة الناقصة:</p>
                    <ul className="list-disc list-inside space-y-2 text-red-600">
                      {missingOptions.map((option, index) => (
                        <li key={index} className="font-semibold text-base">
                          <span className="text-red-800">{option}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              <div className="mt-6 p-4 bg-red-200/80 backdrop-blur-sm rounded-2xl shadow-lg">
                <p className="text-red-800 font-bold text-center text-lg">
                  ⚠️ لن تتمكن من إتمام الطلب حتى تحديد جميع الاختيارات المطلوبة
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Premium Cart Content */}
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-10">
            {/* Luxury Cart Items - Takes 3 columns */}
            <div className="xl:col-span-3">
              <div className="space-y-10">
                {/* منتجات مفقودة البيانات */}
                {cartItems.filter(item => !item.product).length > 0 && (
                  <div className="bg-gradient-to-br from-red-900 via-red-800 to-red-900 border-3 border-red-600 rounded-3xl p-8 shadow-2xl backdrop-blur-sm">
                    <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-4">
                      <span className="text-3xl animate-pulse">⚠️</span>
                      منتجات تحتاج إصلاح ({cartItems.filter(item => !item.product).length})
                    </h3>
                    <div className="space-y-4">
                      {cartItems.filter(item => !item.product).map((item) => (
                        <div key={item.id} className="bg-red-800/80 backdrop-blur-sm border-2 border-red-600 rounded-2xl p-6 shadow-xl">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-red-200 font-bold text-lg">منتج #{item.productId}</p>
                              <p className="text-red-300">الكمية: {item.quantity}</p>
                            </div>
                            <button
                              onClick={() => removeItem(item.id)}
                              className="bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 rounded-xl hover:from-red-700 hover:to-red-800 transition-all font-bold shadow-lg transform hover:scale-105"
                            >
                              حذف
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="text-red-200 mt-6 text-center text-lg">
                      هذه المنتجات بياناتها مفقودة من قاعدة البيانات، يرجى حذفها أو تحديث السلة
                    </p>
                  </div>
                )}
                
                {/* Luxury Products Cards */}
                {cartItems.filter(item => item.product).map((item, index) => (
                  <div 
                    key={item.id} 
                    data-item-id={item.id} 
                    className="bg-gradient-to-br from-white via-gray-50 to-white rounded-3xl shadow-2xl overflow-hidden border-3 border-amber-200 hover:border-amber-300 hover:shadow-3xl transition-all duration-700 transform hover:scale-[1.02] relative group"
                    style={{
                      background: `
                        linear-gradient(135deg, 
                          rgba(255, 255, 255, 0.95) 0%, 
                          rgba(249, 250, 251, 0.95) 50%, 
                          rgba(255, 255, 255, 0.95) 100%
                        ),
                        radial-gradient(ellipse at top left, rgba(251, 191, 36, 0.1), transparent 50%),
                        radial-gradient(ellipse at bottom right, rgba(139, 69, 19, 0.05), transparent 50%)
                      `,
                      backdropFilter: 'blur(20px)',
                      boxShadow: `
                        0 25px 50px -12px rgba(0, 0, 0, 0.25),
                        0 0 0 1px rgba(251, 191, 36, 0.1),
                        inset 0 1px 0 rgba(255, 255, 255, 0.8)
                      `
                    }}
                  >
                    {/* Luxury Product Header */}
                    <div className="bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-700 text-white p-8 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-10 transform -skew-x-12 animate-pulse"></div>
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-300"></div>
                      
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
                        <div className="flex items-center gap-6">
                          <div className="w-16 h-16 bg-gradient-to-br from-white via-amber-50 to-white bg-opacity-20 backdrop-blur-sm rounded-2xl flex items-center justify-center border-3 border-white border-opacity-40 shadow-xl relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 transform -skew-x-12 animate-pulse"></div>
                            <span className="text-amber-800 font-bold text-2xl relative z-10">{index + 1}</span>
                          </div>
                          <div>
                            <h3 className="text-2xl font-bold drop-shadow-lg">{item.product?.name || 'منتج غير معروف'}</h3>
                            <p className="text-amber-100 text-lg mt-1">
                              {item.product?.description?.substring(0, 60)}...
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-4">
                          <button
                            onClick={() => removeItem(item.id)}
                            className="w-14 h-14 bg-gradient-to-br from-red-600 to-red-700 bg-opacity-80 backdrop-blur-sm text-white rounded-2xl flex items-center justify-center hover:bg-opacity-100 transition-all shadow-xl transform hover:scale-110 border-2 border-red-400 relative overflow-hidden group"
                            title="حذف المنتج"
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transform -skew-x-12 transition-all duration-500"></div>
                            <X className="w-7 h-7 relative z-10" />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="p-8 lg:p-10">
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                        {/* Luxury Product Image and Price */}
                        <div className="lg:col-span-1">
                          <div className="space-y-8">
                            {/* Premium Product Image */}
                            <div className="relative group">
                              <div className="w-full h-96 bg-gradient-to-br from-gray-50 via-white to-gray-100 rounded-2xl overflow-hidden shadow-2xl border-3 border-amber-200 relative">
                                <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent z-10"></div>
                                {item.product?.mainImage ? (
                                  <img 
                                    src={buildImageUrl(item.product.mainImage)}
                                    alt={item.product?.name || 'منتج'}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 relative z-0"
                                    onError={(e) => {
                                      console.warn('🖼️ [Cart] Image load failed, using fallback:', item.product?.mainImage);
                                      e.currentTarget.src = 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=400&fit=crop&crop=center&auto=format,compress&q=80&ixlib=rb-4.0.3';
                                      e.currentTarget.onerror = null;
                                    }}
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-amber-400 text-6xl">
                                    <Package className="w-20 h-20" />
                                  </div>
                                )}
                                <div className="absolute top-4 right-4 bg-gradient-to-r from-amber-500 to-yellow-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg z-20">
                                  منتج #{index + 1}
                                </div>
                              </div>
                            </div>

                            {/* Luxury Price and Quantity */}
                            <div className="bg-gradient-to-br from-amber-600 via-yellow-600 to-amber-700 p-8 rounded-2xl border-3 border-amber-400 shadow-2xl relative overflow-hidden">
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-10 transform -skew-x-12 animate-pulse"></div>
                              
                              <div className="text-center mb-6 relative z-10">
                                <div className="text-4xl font-bold text-white drop-shadow-lg">
                                  {((item.product?.price || 0) * item.quantity).toFixed(2)} ر.س
                                </div>
                                <div className="text-amber-100 mt-2 text-lg">
                                  {item.product?.price?.toFixed(2)} ر.س × {item.quantity}
                                </div>
                              </div>
                              
                              <div className="flex items-center justify-center gap-6 relative z-10">
                                <button
                                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                  className="w-14 h-14 bg-gradient-to-br from-white to-amber-50 text-amber-700 rounded-2xl flex items-center justify-center hover:from-amber-50 hover:to-amber-100 transition-all shadow-xl transform hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed border-3 border-amber-300"
                                  disabled={item.quantity <= 1}
                                >
                                  <Minus className="w-7 h-7 font-bold" />
                                </button>
                                <div className="w-24 text-center">
                                  <div className="text-3xl font-bold bg-gradient-to-br from-white to-amber-50 text-amber-800 py-4 rounded-2xl border-3 border-amber-300 shadow-xl">
                                    {item.quantity}
                                  </div>
                                </div>
                                <button
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                  className="w-14 h-14 bg-gradient-to-br from-white to-amber-50 text-amber-700 rounded-2xl flex items-center justify-center hover:from-amber-50 hover:to-amber-100 transition-all shadow-xl transform hover:scale-110 border-3 border-amber-300"
                                >
                                  <Plus className="w-7 h-7 font-bold" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Product Options and Details */}
                        <div className="lg:col-span-2">
                          <div className="space-y-8">
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

                            {/* Luxury Selected Options Summary */}
                            {item.selectedOptions && Object.keys(item.selectedOptions).length > 0 && (
                              <div className="bg-gradient-to-br from-emerald-800 via-green-800 to-emerald-900 p-6 sm:p-8 rounded-2xl sm:rounded-3xl border-3 border-emerald-600 shadow-2xl mb-6 backdrop-blur-sm relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-5 transform -skew-x-12 animate-pulse"></div>
                                <h5 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6 flex items-center gap-3 relative z-10">
                                  <div className="w-8 h-8 bg-gradient-to-r from-emerald-400 to-green-400 rounded-xl flex items-center justify-center">
                                    <Check className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                                  </div>
                                  المواصفات المختارة
                                </h5>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 relative z-10">
                                  {Object.entries(item.selectedOptions).map(([key, value]) => (
                                    <div key={key} className="bg-gradient-to-br from-emerald-700 to-green-700 p-4 sm:p-6 rounded-xl sm:rounded-2xl border-2 border-emerald-500 shadow-xl backdrop-blur-sm relative overflow-hidden">
                                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-10 transform -skew-x-12"></div>
                                      <span className="text-sm sm:text-base text-emerald-200 font-semibold block mb-2 relative z-10">{getOptionDisplayName(key)}:</span>
                                      <span className="font-bold text-white text-lg sm:text-xl relative z-10">{value}</span>
                                      {/* عرض السعر الإضافي إذا كان موجود */}
                                      {item.optionsPricing && item.optionsPricing[key] && item.optionsPricing[key] > 0 && (
                                        <span className="block text-sm text-emerald-300 mt-2 font-medium relative z-10">
                                          +{item.optionsPricing[key]} ر.س إضافي
                                        </span>
                                      )}
                                    </div>
                                  ))}
                                </div>
                                {/* إجمالي السعر مع الإضافات */}
                                {item.optionsPricing && Object.values(item.optionsPricing).some(price => price > 0) && (
                                  <div className="mt-4 sm:mt-6 p-4 sm:p-6 bg-gradient-to-r from-amber-600 to-yellow-600 rounded-xl sm:rounded-2xl border-2 border-amber-400 shadow-xl relative z-10">
                                    <span className="text-sm sm:text-base text-amber-100 font-semibold">إجمالي الإضافات:</span>
                                    <span className="font-bold text-white text-xl sm:text-2xl mr-3">
                                      {Object.values(item.optionsPricing).reduce((sum, price) => sum + (price || 0), 0)} ر.س
                                    </span>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* رسالة تحذيرية فاخرة إذا لم يتم اختيار مواصفات مطلوبة */}
                            {(!item.selectedOptions || Object.keys(item.selectedOptions).length === 0) && 
                             item.product.dynamicOptions && 
                             item.product.dynamicOptions.some(option => option.required) && (
                              <div className="bg-gradient-to-br from-red-800 via-red-900 to-red-800 p-6 sm:p-8 rounded-2xl sm:rounded-3xl border-3 border-red-600 shadow-2xl mb-6 backdrop-blur-sm relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-5 transform -skew-x-12 animate-pulse"></div>
                                <h5 className="text-xl sm:text-2xl font-bold text-white mb-4 flex items-center gap-3 relative z-10">
                                  <div className="w-8 h-8 bg-gradient-to-r from-red-400 to-pink-400 rounded-xl flex items-center justify-center animate-pulse">
                                    <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                                  </div>
                                  مواصفات مطلوبة
                                </h5>
                                <p className="text-red-100 text-base sm:text-lg relative z-10">
                                  يجب تحديد المقاسات والمواصفات المطلوبة لهذا المنتج قبل المتابعة
                                </p>
                              </div>
                            )}

                            {/* Luxury Attachments */}
                            <div className="bg-gradient-to-br from-slate-50 via-gray-50 to-white p-8 rounded-2xl border-3 border-amber-300 shadow-2xl backdrop-blur-sm relative overflow-hidden">
                              <div className="absolute inset-0 bg-gradient-to-r from-amber-100/20 via-yellow-100/20 to-amber-100/20"></div>
                              <h5 className="text-2xl font-bold text-amber-800 mb-6 flex items-center gap-3 relative z-10">
                                <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-2xl flex items-center justify-center shadow-lg">
                                  <Sparkles className="w-6 h-6 text-white" />
                                </div>
                                ملاحظات وصور إضافية
                              </h5>
                              
                              <div className="space-y-8 relative z-10">
                                <div>
                                  <label className="block text-xl font-bold text-amber-900 mb-4">
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
                                              background: 'linear-gradient(135deg, #F59E0B, #D97706)',
                                              color: 'white',
                                              fontSize: '16px',
                                              fontWeight: 'bold',
                                              borderRadius: '12px',
                                              boxShadow: '0 10px 25px rgba(251, 191, 36, 0.3)'
                                            }
                                          });
                                        }
                                      }, 1000);
                                    }}
                                    placeholder="أضف أي ملاحظات أو تعليمات خاصة للمنتج..."
                                    className="w-full px-6 py-6 border-3 border-amber-300 bg-gradient-to-br from-white to-amber-50 text-amber-900 rounded-2xl focus:outline-none focus:ring-4 focus:ring-amber-400 focus:border-amber-500 shadow-xl transition-all placeholder-amber-500 text-lg font-medium"
                                    rows={5}
                                  />
                                </div>

                                <div>
                                  <label className="block text-xl font-bold text-amber-900 mb-4">
                                    صور إضافية
                                  </label>
                                  <div className="flex items-center gap-4 mb-6">
                                    <label className="cursor-pointer bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white px-8 py-4 rounded-2xl flex items-center gap-4 transition-all shadow-2xl transform hover:scale-105 border-3 border-amber-400 relative overflow-hidden group">
                                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transform -skew-x-12 transition-all duration-500"></div>
                                      <Upload className="w-6 h-6 relative z-10" />
                                      <span className="font-bold text-lg relative z-10">رفع صور</span>
                                      <input
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        onChange={(e) => e.target.files && handleImageUpload(e.target.files)}
                                        className="hidden"
                                      />
                                    </label>
                                    {uploadingImages && (
                                      <div className="text-amber-700 font-bold text-lg flex items-center gap-2">
                                        <div className="w-6 h-6 border-3 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
                                        جاري الرفع...
                                      </div>
                                    )}
                                  </div>
                                  
                                  {/* Luxury Uploaded Images */}
                                  {item.attachments?.images && item.attachments.images.length > 0 && (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                                      {item.attachments.images.map((img, idx) => (
                                        <div key={idx} className="relative group">
                                          <div className="relative rounded-2xl overflow-hidden shadow-2xl border-3 border-amber-300 hover:border-amber-400 transition-all duration-300">
                                            <img
                                              src={img}
                                              alt={`مرفق ${idx + 1}`}
                                              className="w-full h-32 object-cover group-hover:scale-110 transition-transform duration-500"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                          </div>
                                          <button
                                            onClick={() => {
                                              const newImages = item.attachments?.images?.filter((_, i) => i !== idx) || [];
                                              const newAttachments = { ...item.attachments, images: newImages };
                                              setCartItems(prev => prev.map(cartItem => 
                                                cartItem.id === item.id ? { ...cartItem, attachments: newAttachments } : cartItem
                                              ));
                                              saveOptionsToBackend(item.id, 'attachments', newAttachments);
                                            }}
                                            className="absolute -top-3 -right-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-full w-10 h-10 flex items-center justify-center text-lg opacity-0 group-hover:opacity-100 transition-all shadow-2xl transform hover:scale-110 border-2 border-red-400 font-bold"
                                          >
                                            ×
                                          </button>
                                          <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                            صورة {idx + 1}
                                          </div>
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

            {/* Luxury Order Summary - Takes 1 column */}
            <div className="xl:col-span-1">
              <div className="bg-gradient-to-br from-slate-900 via-gray-900 to-slate-900 rounded-3xl shadow-2xl overflow-hidden sticky top-8 border-3 border-amber-400 backdrop-blur-sm relative">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-400/5 via-yellow-400/5 to-amber-400/5"></div>
                
                {/* Luxury Summary Header */}
                <div className="bg-gradient-to-r from-amber-700 via-yellow-600 to-amber-800 text-white p-8 border-b-3 border-amber-500 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-10 transform -skew-x-12 animate-pulse"></div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-white via-amber-50 to-white bg-opacity-20 backdrop-blur-sm rounded-2xl flex items-center justify-center border-2 border-white border-opacity-40 shadow-xl">
                        <Sparkles className="w-7 h-7 text-amber-800" />
                      </div>
                      <h3 className="text-3xl font-bold drop-shadow-lg">ملخص الطلب</h3>
                    </div>
                    <p className="text-center text-amber-100 text-lg font-medium">مراجعة نهائية فاخرة</p>
                  </div>
                </div>
                
                <div className="p-8 relative z-10 space-y-8">
                  {/* Luxury Price Breakdown */}
                  <div className="space-y-6 mb-8">
                    <div className="bg-gradient-to-r from-slate-800 to-gray-800 p-6 rounded-2xl border-2 border-amber-300 shadow-xl backdrop-blur-sm">
                      <div className="flex justify-between items-center text-lg">
                        <span className="text-amber-200 font-semibold">المجموع الفرعي:</span>
                        <span className="font-bold text-amber-400 text-2xl drop-shadow-lg">{totalPrice.toFixed(2)} ر.س</span>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-emerald-800 to-green-800 p-6 rounded-2xl border-2 border-emerald-400 shadow-xl backdrop-blur-sm">
                      <div className="flex justify-between items-center text-lg">
                        <span className="text-emerald-200 font-semibold">رسوم التوصيل:</span>
                        <span className="text-emerald-300 font-bold text-xl flex items-center gap-2">
                          <span className="text-2xl">🎁</span>
                          مجاني
                        </span>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-blue-800 to-indigo-800 p-6 rounded-2xl border-2 border-blue-400 shadow-xl backdrop-blur-sm">
                      <div className="flex justify-between items-center text-lg">
                        <span className="text-blue-200 font-semibold">الضريبة:</span>
                        <span className="text-blue-300 font-bold">محتسبة</span>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-amber-700 via-yellow-600 to-amber-800 p-8 rounded-3xl border-3 border-amber-400 shadow-2xl backdrop-blur-sm relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-10 transform -skew-x-12 animate-pulse"></div>
                      <div className="flex justify-between items-center text-2xl font-bold relative z-10">
                        <span className="text-white drop-shadow-lg flex items-center gap-3">
                          <span className="text-3xl">💎</span>
                          المجموع الكلي:
                        </span>
                        <span className="text-white text-4xl drop-shadow-lg">
                          {totalPrice.toFixed(2)} ر.س
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Luxury Promo Code Section */}
                  <div className="bg-gradient-to-br from-purple-900 via-indigo-900 to-purple-900 p-8 rounded-3xl border-3 border-purple-500 shadow-2xl backdrop-blur-sm relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-400/10 via-pink-400/10 to-purple-400/10"></div>
                    <div className="relative z-10">
                      <label className="block text-2xl font-bold text-white mb-6 flex items-center gap-3">
                        <span className="text-3xl">🎫</span>
                        كود الخصم الحصري
                      </label>
                      <div className="space-y-4">
                        <div className="relative">
                          <input
                            type="text"
                            value={promoCode}
                            onChange={(e) => setPromoCode(e.target.value)}
                            placeholder="أدخل كود الخصم الحصري"
                            className="w-full px-6 py-4 bg-gradient-to-br from-white via-purple-50 to-white text-purple-900 rounded-2xl focus:outline-none focus:ring-4 focus:ring-purple-400 shadow-xl transition-all placeholder-purple-500 text-lg font-semibold border-3 border-purple-300"
                          />
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-600">
                            <Sparkles className="w-6 h-6" />
                          </div>
                        </div>
                        <button 
                          className="w-full bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 text-white py-4 rounded-2xl hover:from-purple-700 hover:to-purple-800 transition-all font-bold shadow-2xl transform hover:scale-105 border-3 border-purple-400 text-lg relative overflow-hidden group"
                          onClick={() => {
                            if (promoCode.trim()) {
                              toast.info('🔍 جاري التحقق من كود الخصم...', {
                                style: {
                                  background: 'linear-gradient(135deg, #8B5CF6, #6366F1)',
                                  color: 'white',
                                  fontWeight: 'bold',
                                  borderRadius: '12px'
                                }
                              });
                              // Add promo code logic here
                            } else {
                              toast.error('⚠️ يرجى إدخال كود الخصم', {
                                style: {
                                  background: 'linear-gradient(135deg, #EF4444, #DC2626)',
                                  color: 'white',
                                  fontWeight: 'bold',
                                  borderRadius: '12px'
                                }
                              });
                            }
                          }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transform -skew-x-12 transition-all duration-500"></div>
                          <span className="relative z-10 flex items-center justify-center gap-3">
                            <span className="text-2xl">✨</span>
                            تطبيق الكود الحصري
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Luxury Validation Warning */}
                  {!canProceedToCheckout && (
                    <div className="bg-gradient-to-br from-red-900 via-red-800 to-red-900 border-3 border-red-500 rounded-3xl p-8 shadow-2xl backdrop-blur-sm relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-red-400/10 via-pink-400/10 to-red-400/10"></div>
                      <div className="relative z-10">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl flex items-center justify-center animate-pulse">
                            <span className="text-white text-2xl">⚠️</span>
                          </div>
                          <span className="font-bold text-red-200 text-xl">يجب إكمال التفاصيل</span>
                        </div>
                        <p className="text-red-300 text-lg font-medium">
                          {incompleteItemsDetailed.length} منتج يحتاج تحديد المقاسات والتفاصيل
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Luxury Action Buttons */}
                  <div className="space-y-6">
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
                                background: 'linear-gradient(135deg, #DC2626, #B91C1C)',
                                color: 'white',
                                fontWeight: 'bold',
                                fontSize: '16px',
                                borderRadius: '12px',
                                zIndex: 999999,
                                lineHeight: '1.5',
                                boxShadow: '0 25px 50px rgba(220, 38, 38, 0.3)'
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
                      className={`w-full py-6 rounded-3xl font-bold text-center block transition-all text-xl shadow-2xl transform border-3 relative overflow-hidden group ${
                        canProceedToCheckout 
                          ? 'bg-gradient-to-r from-emerald-700 via-green-600 to-emerald-800 text-white hover:from-emerald-800 hover:via-green-700 hover:to-emerald-900 hover:scale-105 border-emerald-400' 
                          : 'bg-gradient-to-r from-gray-700 to-gray-800 text-gray-400 cursor-not-allowed border-gray-600 opacity-70'
                      }`}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transform -skew-x-12 transition-all duration-500"></div>
                      {canProceedToCheckout ? (
                        <span className="flex items-center justify-center gap-4 relative z-10">
                          <span className="text-3xl">🛒</span>
                          <span>إتمام الطلب الفاخر</span>
                          <span className="text-emerald-200 text-lg">({cartItems.length} منتج)</span>
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-4 relative z-10">
                          <span className="text-3xl">⚠️</span>
                          <span>أكمل التفاصيل أولاً</span>
                          <span className="text-gray-500 text-lg">({incompleteItemsDetailed.length} ناقص)</span>
                        </span>
                      )}
                    </Link>
                    
                    <Link
                      to="/"
                      className="w-full bg-gradient-to-r from-slate-700 via-gray-700 to-slate-800 border-3 border-amber-400 text-amber-200 py-5 rounded-3xl hover:from-slate-800 hover:to-gray-900 hover:border-amber-300 font-bold text-center block transition-all transform hover:scale-105 shadow-2xl text-xl relative overflow-hidden group"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-10 transform -skew-x-12 transition-all duration-500"></div>
                      <span className="flex items-center justify-center gap-4 relative z-10">
                        <span className="text-2xl">🛍️</span>
                        متابعة التسوق الفاخر
                        <ArrowRight className="w-6 h-6" />
                      </span>
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