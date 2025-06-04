import { toast } from 'react-toastify';
import { apiCall, API_ENDPOINTS, buildApiUrl, addToCartOptimized } from '../config/api';
import { cartSyncManager } from './cartSync';

// دالة موحدة لإضافة منتج إلى السلة (تدعم الضيوف والمستخدمين المسجلين) - محسنة للموبايل
export const addToCartUnified = async (
  productId: number, 
  productName: string, 
  quantity: number = 1,
  selectedOptions?: Record<string, string>,
  attachments?: any
) => {
  try {
    console.log('🛒 [CartUtils] Starting addToCart for:', { productId, productName, quantity });
    
    const userData = localStorage.getItem('user');
    let userId = 'guest'; // افتراضي للضيوف
    
    // إذا كان المستخدم مسجل دخول، استخدم ID الخاص به
    if (userData) {
      try {
        const user = JSON.parse(userData);
        if (user?.id) {
          userId = user.id.toString();
        }
      } catch (parseError) {
        console.warn('⚠️ [CartUtils] Error parsing user data, using guest mode:', parseError);
      }
    }

    console.log('👤 [CartUtils] User ID:', userId);

    // التحقق من المواصفات قبل الإرسال
    if (selectedOptions && Object.keys(selectedOptions).length > 0) {
      console.log('✅ [CartUtils] Valid selectedOptions found:', selectedOptions);
    } else {
      console.log('ℹ️ [CartUtils] No selectedOptions provided - using defaults');
    }

    const requestBody: any = {
      productId,
      quantity
    };

    // فقط أضف selectedOptions إذا كانت موجودة وليست فارغة
    if (selectedOptions && Object.keys(selectedOptions).length > 0) {
      requestBody.selectedOptions = selectedOptions;
      console.log('📝 [CartUtils] Including selectedOptions in request:', selectedOptions);
    }

    // فقط أضف attachments إذا كانت موجودة
    if (attachments && (attachments.text || attachments.images?.length > 0)) {
      requestBody.attachments = attachments;
      console.log('📎 [CartUtils] Including attachments in request:', attachments);
    }

    console.log('📦 [CartUtils] Final request body:', requestBody);

    // استخدام الدالة المحسنة للموبايل
    const result = await addToCartOptimized(userId, requestBody, 3);

    if (result) {
      console.log('✅ [CartUtils] Successfully added to cart:', result);
      
      // تحديث فوري لـ cartSyncManager
      await cartSyncManager.syncWithServer();
      
      // إرسال أحداث التحديث
      window.dispatchEvent(new Event('cartUpdated'));
      window.dispatchEvent(new Event('productAddedToCart'));
      window.dispatchEvent(new Event('forceCartUpdate'));
      
      // رسالة نجاح موجزة للموبايل - محسنة
      toast.success(`✅ تم إضافة "${productName}" للسلة!`, {
        position: "top-center",
        autoClose: 1500, // أقصر للموبايل
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: false, // منع pause على الموبايل
        draggable: false, // منع السحب على الموبايل
        style: {
          background: '#10b981',
          color: 'white',
          fontWeight: 'bold',
          fontSize: '14px',
          borderRadius: '12px',
          padding: '12px 16px',
          boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
          zIndex: 999999
        }
      });
      
      return true;
    } else {
      console.error('❌ [CartUtils] addToCartOptimized returned null/false');
      return false;
    }
  } catch (error: any) {
    console.error('❌ [CartUtils] Error in addToCartUnified:', error);
    
    // رسائل خطأ مخصصة حسب نوع الخطأ - محسنة للموبايل
    let errorMessage = 'حدث خطأ في إضافة المنتج للسلة';
    
    if (error.message) {
      // رسائل مبسطة للموبايل
      if (error.message.includes('timeout') || error.message.includes('انتهت مهلة')) {
        errorMessage = '⏱️ اتصال بطيء - يرجى المحاولة مرة أخرى';
      } else if (error.message.includes('network') || error.message.includes('شبكة')) {
        errorMessage = '📶 مشكلة في الاتصال - تحقق من الإنترنت';
      } else if (error.message.includes('CORS') || error.message.includes('blocked')) {
        errorMessage = '🔄 يرجى تحديث الصفحة والمحاولة مرة أخرى';
      } else {
        errorMessage = error.message;
      }
    }
    
    toast.error(errorMessage, {
      position: "top-center",
      autoClose: 3000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: false,
      draggable: false,
      style: {
        background: '#ef4444',
        color: 'white',
        fontWeight: 'bold',
        fontSize: '14px',
        borderRadius: '12px',
        padding: '12px 16px',
        boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
        zIndex: 999999
      }
    });
    
    return false;
  }
};

// دالة موحدة لإضافة منتج إلى المفضلة
export const addToWishlistUnified = async (productId: number, productName: string) => {
  try {
    const userData = localStorage.getItem('user');
    if (!userData) {
      toast.error('يجب تسجيل الدخول أولاً');
      return false;
    }

    const user = JSON.parse(userData);
    if (!user?.id) {
      toast.error('يجب تسجيل الدخول أولاً');
      return false;
    }

    console.log('❤️ Adding to wishlist:', { productId, productName });

    const response = await fetch(buildApiUrl(`/user/${user.id}/wishlist`), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'فشل في إضافة المنتج إلى المفضلة');
    }

    // تحديث العدد فوراً في localStorage
    const currentWishlistCount = localStorage.getItem('lastWishlistCount');
    const newWishlistCount = currentWishlistCount ? parseInt(currentWishlistCount) + 1 : 1;
    localStorage.setItem('lastWishlistCount', newWishlistCount.toString());
    console.log('🔄 Updated wishlist count in localStorage:', newWishlistCount);
    
    // تحديث فوري للكونتر في الـ DOM مباشرة
    const updateWishlistCountInDOM = () => {
      // تحديث العداد في النافيجيشن بار
      const wishlistCountElements = document.querySelectorAll('[data-wishlist-count]');
      wishlistCountElements.forEach(element => {
        element.textContent = newWishlistCount.toString();
        console.log('🔄 [CartUtils] Updated wishlist counter in Navbar:', newWishlistCount);
      });
      
      // تحديث أي عناصر أخرى قد تحتوي على عدد المفضلة
      const wishlistBadges = document.querySelectorAll('.wishlist-counter-badge, .wishlist-badge, [class*="wishlist-count"]');
      wishlistBadges.forEach(element => {
        element.textContent = newWishlistCount.toString();
        console.log('🔄 [CartUtils] Updated wishlist badge:', newWishlistCount);
      });
      
      // تحديث أي spans أخرى قد تحتوي على العداد
      const spans = document.querySelectorAll('span');
      spans.forEach(span => {
        if (span.parentElement?.querySelector('svg[data-lucide="heart"]') || 
            span.classList.contains('wishlist-count') ||
            span.getAttribute('data-wishlist-count') !== null) {
          span.textContent = newWishlistCount.toString();
          console.log('🔄 [CartUtils] Updated span wishlist counter:', newWishlistCount);
        }
      });
    };
    
    updateWishlistCountInDOM();
    
    // إرسال أحداث متعددة لضمان تحديث الكونتر
    console.log('✅ Product added to wishlist successfully, triggering events...');
    
    // أحداث فورية
    window.dispatchEvent(new Event('wishlistUpdated'));
    window.dispatchEvent(new CustomEvent('productAddedToWishlist', {
      detail: { productId, productName }
    }));
    
    // تحديث localStorage
    localStorage.setItem('wishlistUpdated', Date.now().toString());
    localStorage.setItem('lastWishlistUpdate', new Date().toISOString());
    
    // إرسال storage event
    window.dispatchEvent(new Event('storage'));
    
    // أحداث مؤجلة للتأكد
    setTimeout(() => {
      window.dispatchEvent(new Event('wishlistUpdated'));
      console.log('🔄 Delayed wishlist update event sent');
    }, 100);
    
    setTimeout(() => {
      window.dispatchEvent(new Event('wishlistUpdated'));
      console.log('🔄 Second delayed wishlist update event sent');
    }, 500);

    // رسالة نجاح بسيطة وفعالة للمفضلة
    toast.success(`❤️ تم إضافة "${productName}" إلى المفضلة بنجاح!`, {
      position: "top-center",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      style: {
        background: '#EC4899',
        color: 'white',
        fontWeight: 'bold',
        fontSize: '16px',
        borderRadius: '12px',
        zIndex: 999999
      }
    });
    
    console.log('💖 Wishlist success message displayed for:', productName);

    return true;
  } catch (error) {
    console.error('❌ Error adding to wishlist:', error);
    toast.error(`❌ فشل في إضافة "${productName}" إلى المفضلة: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`, {
      autoClose: 4000,
      style: {
        background: '#EF4444',
        color: 'white',
        fontWeight: 'bold',
        fontSize: '14px',
        borderRadius: '12px',
        boxShadow: '0 10px 25px rgba(239, 68, 68, 0.3)'
      }
    });
    return false;
  }
};

// دالة موحدة لحذف منتج من المفضلة
export const removeFromWishlistUnified = async (productId: number, productName: string) => {
  try {
    const userData = localStorage.getItem('user');
    if (!userData) {
      toast.error('يجب تسجيل الدخول أولاً');
      return false;
    }

    const user = JSON.parse(userData);
    if (!user?.id) {
      toast.error('يجب تسجيل الدخول أولاً');
      return false;
    }

    console.log('💔 Removing from wishlist:', { productId, productName });

    const response = await fetch(buildApiUrl(`/user/${user.id}/wishlist/product/${productId}`), {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'فشل في حذف المنتج من المفضلة');
    }

    // تحديث العدد فوراً في localStorage
    const currentWishlistCount = localStorage.getItem('lastWishlistCount');
    const newWishlistCount = currentWishlistCount ? Math.max(0, parseInt(currentWishlistCount) - 1) : 0;
    localStorage.setItem('lastWishlistCount', newWishlistCount.toString());
    console.log('🔄 Updated wishlist count in localStorage after removal:', newWishlistCount);
    
    // تحديث فوري للكونتر في الـ DOM مباشرة
    const updateWishlistCountInDOM = () => {
      // تحديث العداد في النافيجيشن بار
      const wishlistCountElements = document.querySelectorAll('[data-wishlist-count]');
      wishlistCountElements.forEach(element => {
        element.textContent = newWishlistCount.toString();
        console.log('🔄 [CartUtils] Updated wishlist counter in Navbar:', newWishlistCount);
      });
      
      // تحديث أي عناصر أخرى قد تحتوي على عدد المفضلة
      const wishlistBadges = document.querySelectorAll('.wishlist-counter-badge, .wishlist-badge, [class*="wishlist-count"]');
      wishlistBadges.forEach(element => {
        element.textContent = newWishlistCount.toString();
        console.log('🔄 [CartUtils] Updated wishlist badge:', newWishlistCount);
      });
      
      // تحديث أي spans أخرى قد تحتوي على العداد
      const spans = document.querySelectorAll('span');
      spans.forEach(span => {
        if (span.parentElement?.querySelector('svg[data-lucide="heart"]') || 
            span.classList.contains('wishlist-count') ||
            span.getAttribute('data-wishlist-count') !== null) {
          span.textContent = newWishlistCount.toString();
          console.log('🔄 [CartUtils] Updated span wishlist counter:', newWishlistCount);
        }
      });
    };
    
    updateWishlistCountInDOM();

    // إرسال أحداث متعددة لضمان تحديث الكونتر
    console.log('✅ Product removed from wishlist successfully, triggering events...');
    
    // أحداث فورية
    window.dispatchEvent(new Event('wishlistUpdated'));
    window.dispatchEvent(new CustomEvent('productRemovedFromWishlist', {
      detail: { productId, productName }
    }));
    
    // تحديث localStorage
    localStorage.setItem('wishlistUpdated', Date.now().toString());
    localStorage.setItem('lastWishlistUpdate', new Date().toISOString());
    
    // إرسال storage event
    window.dispatchEvent(new Event('storage'));
    
    // أحداث مؤجلة للتأكد
    setTimeout(() => {
      window.dispatchEvent(new Event('wishlistUpdated'));
    }, 100);

    // رسالة حذف بسيطة وفعالة
    toast.info(`🗑️ تم حذف "${productName}" من المفضلة`, {
      position: "top-center",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      style: {
        background: '#6B7280',
        color: 'white',
        fontWeight: 'bold',
        fontSize: '16px',
        borderRadius: '12px',
        zIndex: 999999
      }
    });
    
    console.log('🗑️ Remove message displayed for:', productName);

    return true;
  } catch (error) {
    console.error('❌ Error removing from wishlist:', error);
    toast.error(`❌ فشل في حذف "${productName}" من المفضلة: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`, {
      autoClose: 4000,
      style: {
        background: '#EF4444',
        color: 'white',
        fontWeight: 'bold',
        fontSize: '14px',
        borderRadius: '12px',
        boxShadow: '0 10px 25px rgba(239, 68, 68, 0.3)'
      }
    });
    return false;
  }
}; 