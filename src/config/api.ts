import { mockApiCall } from './mockApi';

// API Configuration for different environments
export const API_CONFIG = {
  // للتطوير المحلي
  development: {
    baseURL: 'http://localhost:3001',
  },
  // للإنتاج - PRODUCTION READY 🚀
  production: {
    baseURL: 'https://medb.onrender.com', // الـ URL الأساسي
    fallback: 'https://medicine-backend-api.vercel.app', // backup إذا كان متاح
  }
};

// الحصول على الـ base URL حسب البيئة مع نظام fallback
export const getApiBaseUrl = (): string => {
  // أولاً: تحقق من Environment Variable
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  
  // ثانياً: تحقق من البيئة
  const isDevelopment = import.meta.env.DEV;
  
  if (isDevelopment) {
    return API_CONFIG.development.baseURL;
  } else {
    // في Production، استخدم الـ URL الأساسي
    return API_CONFIG.production.baseURL;
  }
};

// دالة مساعدة لبناء URL كامل
export const buildApiUrl = (endpoint: string): string => {
  const baseUrl = getApiBaseUrl();
  // إزالة الـ slash الأول من endpoint إذا كان موجود
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  // إزالة api/ إذا كانت موجودة في endpoint لأنها ستضاف تلقائياً
  const finalEndpoint = cleanEndpoint.startsWith('api/') ? cleanEndpoint.slice(4) : cleanEndpoint;
  return `${baseUrl}/api/${finalEndpoint}`;
};

// دالة مساعدة لبناء URL الصور - محدثة ومحسنة
export const buildImageUrl = (imagePath: string): string => {
  // إذا لم يكن هناك مسار، استخدم صورة طبية افتراضية
  if (!imagePath) {
    return getFallbackImage('product');
  }
  
  // إذا كان المسار يبدأ بـ http، فهو URL كامل
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  // إذا كان base64 data URL - الطريقة الجديدة المفضلة
  if (imagePath.startsWith('data:image/')) {
    return imagePath;
  }
  
  // إذا كان مسار ملف قديم، حاول تحويله إلى URL للملف الستاتيك
  const baseUrl = getApiBaseUrl();
  let finalUrl = '';
  
  // إذا كان المسار يبدأ بـ /images/ فهو مسار نسبي من الباك إند
  if (imagePath.startsWith('/images/')) {
    finalUrl = `${baseUrl}${imagePath}`;
  }
  // إذا كان المسار يبدأ بـ images/ بدون slash
  else if (imagePath.startsWith('images/')) {
    finalUrl = `${baseUrl}/${imagePath}`;
  }
  // إذا كان مسار عادي، أضف /images/ قبله
  else {
    const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
    finalUrl = `${baseUrl}/images${cleanPath}`;
  }
  
  // في التطوير، اختبر توفر الصورة وأرجع احتياطية إذا كانت مفقودة
  if (import.meta.env.DEV) {
    // تأجيل فحص الصورة لتجنب blocking
    setTimeout(async () => {
      try {
        const response = await fetch(finalUrl, { method: 'HEAD' });
        if (!response.ok) {
          console.warn(`⚠️ [Image] Missing image: ${finalUrl}`);
        }
      } catch (error) {
        console.warn(`⚠️ [Image] Failed to check image: ${finalUrl}`, error);
      }
    }, 0);
  }
  
  return finalUrl;
};

// دالة مساعدة للحصول على صورة احتياطية حسب النوع
export const getFallbackImage = (type: 'product' | 'category' | 'general' = 'general'): string => {
  // إزالة الصور الافتراضية المزعجة وإرجاع placeholder بسيط
  return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDQwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMDAgMTAwQzE4My40MzEgMTAwIDE3MCAzMTMuNDMxIDE3MCAzMzBWMzQwQzE3MCAzNTYuNTY5IDE4My40MzEgMzcwIDIwMCAzNzBIMjEwQzIyNi41NjkgMzcwIDI0MCAzNTYuNTY5IDI0MCAzNDBWMzMwQzI0MCAzMTMuNDMxIDIyNi41NjkgMzAwIDIxMCAzMDBIMjAwQzE4My40MzEgMzAwIDE3MCAyODYuNTY5IDE3MCAyNzBWMjAwQzE3MCAzODMuNDMxIDE4My40MzEgMTAwIDIwMCAxMDBaIiBmaWxsPSIjRDFENU...';
};

// دالة محسنة مع retry logic وfallback للبيانات الوهمية
export const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const url = buildApiUrl(endpoint);
  
  // إعدادات محسنة للموبايل
  const mobileOptimizedOptions = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Cache-Control': 'no-cache',
      ...options.headers,
    },
    // timeout أطول للموبايل
    signal: AbortSignal.timeout(30000), // 30 seconds timeout
    // إضافة keepalive للاتصالات المستمرة
    keepalive: true,
  };
  
  // محاولة أولى
  try {
    console.log(`🌐 [API] Making request to: ${url}`);
    const response = await fetch(url, mobileOptimizedOptions);
    
    // إذا لم تكن الاستجابة ناجحة
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = { message: response.statusText };
      }
      
      console.error(`❌ [API] Error ${response.status}:`, errorData);
      
      // إنشاء خطأ مفصل مع معلومات إضافية
      const error = new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      (error as any).status = response.status;
      (error as any).statusText = response.statusText;
      (error as any).url = url;
      (error as any).data = errorData;
      
      throw error;
    }
    
    const data = await response.json();
    console.log(`✅ [API] Success:`, endpoint);
    return data;
  } catch (error: any) {
    console.error('❌ [API] First attempt failed:', error);
    
    // محاولة ثانية مع إعدادات مختلفة للموبايل
    if (!error.message?.includes('AbortError') && !error.message?.includes('TimeoutError')) {
      try {
        console.log(`🔄 [API] Retrying with mobile-friendly settings...`);
        
        // إعدادات للمحاولة الثانية - أكثر تساهلاً
        const retryOptions = {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            'Accept': '*/*',
            ...options.headers,
          },
          signal: AbortSignal.timeout(45000), // 45 seconds
          mode: 'cors' as RequestMode,
          credentials: 'omit' as RequestCredentials,
        };
        
        const retryResponse = await fetch(url, retryOptions);
        
        if (!retryResponse.ok) {
          throw new Error(`Retry failed: ${retryResponse.status}`);
        }
        
        const retryData = await retryResponse.json();
        console.log(`✅ [API] Retry successful:`, endpoint);
        return retryData;
      } catch (retryError) {
        console.error('❌ [API] Retry also failed:', retryError);
      }
    }
    
    console.error('API Error:', error);
    console.error('Failed URL:', url);
    
    // في حالة فشل الاتصال، استخدم البيانات الوهمية
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorName = error instanceof Error ? error.name : '';
    
    // أخطاء الشبكة والاتصال
    if (errorName === 'TimeoutError' || 
        errorName === 'AbortError' ||
        errorMessage.includes('net::ERR_FAILED') || 
        errorMessage.includes('fetch') ||
        errorMessage.includes('NetworkError') ||
        errorMessage.includes('Failed to fetch') ||
        errorMessage.includes('CORS') ||
        errorMessage.includes('blocked')) {
      
      console.warn('🔄 Backend غير متاح أو مشكلة شبكة، جاري استخدام البيانات التجريبية...');
      
      // في حالة أخطاء المصادقة أو الحساب، لا نستخدم البيانات الوهمية
      if (endpoint.includes('auth/') || endpoint.includes('login') || endpoint.includes('register')) {
        const networkError = new Error('Network connection failed');
        (networkError as any).status = 0;
        (networkError as any).isNetworkError = true;
        throw networkError;
      }
      
      // استخدام البيانات الوهمية للـ endpoints الأخرى فقط
      return await mockApiCall(endpoint);
    }
    
    // إعادة إلقاء الخطأ للأخطاء الأخرى
    throw error;
  }
};

// تصدير الثوابت المفيدة
export const API_ENDPOINTS = {
  // Products
  PRODUCTS: 'products',
  PRODUCT_BY_ID: (id: string | number) => `products/${id}`,
  PRODUCTS_BY_CATEGORY: (categoryId: string | number) => `products/category/${categoryId}`,
  PRODUCT_REVIEWS: (id: string | number) => `products/${id}/reviews`,
  PRODUCT_DEFAULT_OPTIONS: (productType: string) => `products/default-options/${encodeURIComponent(productType)}`,
  
  // Categories
  CATEGORIES: 'categories',
  CATEGORY_BY_ID: (id: string | number) => `categories/${id}`,
  
  // Cart
  USER_CART: (userId: string | number) => `user/${userId}/cart`,
  CART_UPDATE_OPTIONS: (userId: string | number) => `user/${userId}/cart/update-options`,
  CART_PRODUCT: (userId: string | number, productId: string | number) => `user/${userId}/cart/product/${productId}`,
  MIGRATE_CART: 'migrate-cart',
  
  // Wishlist
  USER_WISHLIST: (userId: string | number) => `user/${userId}/wishlist`,
  WISHLIST_CHECK: (userId: string | number, productId: string | number) => `user/${userId}/wishlist/check/${productId}`,
  WISHLIST_PRODUCT: (userId: string | number, productId: string | number) => `user/${userId}/wishlist/product/${productId}`,
  
  // Orders
  CHECKOUT: 'checkout',
  ORDERS: 'orders',
  ORDER_BY_ID: (id: string | number) => `orders/${id}`,
  ORDER_STATUS: (id: string | number) => `orders/${id}/status`,
  
  // Auth
  LOGIN: 'auth/login',
  REGISTER: 'auth/register',
  CHANGE_PASSWORD: 'auth/change-password',
  
  // Customer Authentication
  CUSTOMER_LOGIN: 'auth/customer/login',
  CUSTOMER_REGISTER: 'auth/customer/register',
  
  // Coupons
  COUPONS: 'coupons',
  VALIDATE_COUPON: 'coupons/validate',
  COUPON_BY_ID: (id: string | number) => `coupons/${id}`,
  
  // Customers
  CUSTOMERS: 'customers',
  CUSTOMER_STATS: 'customers/stats',
  CUSTOMER_BY_ID: (id: string | number) => `customers/${id}`,
  
  // Health Check
  HEALTH: 'health',
  
  // Services (if needed)
  SERVICES: 'services',
  SERVICE_BY_ID: (id: string | number) => `services/${id}`,
};

// دالة خاصة محسنة لإضافة المنتجات إلى السلة (للموبايل)
export const addToCartOptimized = async (
  userId: string | number, 
  productData: any, 
  maxRetries: number = 3
): Promise<any> => {
  const endpoint = userId === 'guest' ? 'cart?userId=guest' : `user/${userId}/cart`;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🛒 [Cart] Attempt ${attempt}/${maxRetries} - Adding to cart:`, {
        userId,
        productId: productData.productId,
        endpoint
      });
      
      // إعدادات خاصة لإضافة المنتجات
      const addToCartOptions = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Cache-Control': 'no-store',
          'Pragma': 'no-cache',
        },
        body: JSON.stringify(productData),
        // timeout متدرج
        signal: AbortSignal.timeout(attempt * 15000), // 15s, 30s, 45s
        mode: 'cors' as RequestMode,
        credentials: 'omit' as RequestCredentials,
      };
      
      const result = await apiCall(endpoint, addToCartOptions);
      console.log(`✅ [Cart] Successfully added to cart on attempt ${attempt}`);
      return result;
      
    } catch (error: any) {
      console.error(`❌ [Cart] Attempt ${attempt} failed:`, error);
      
      if (attempt === maxRetries) {
        // آخر محاولة - اعرض رسالة مفيدة
        const errorMessage = error.message || 'Unknown error';
        
        if (errorMessage.includes('timeout') || errorMessage.includes('AbortError')) {
          throw new Error('انتهت مهلة الاتصال. يرجى التحقق من اتصال الإنترنت والمحاولة مرة أخرى.');
        } else if (errorMessage.includes('CORS') || errorMessage.includes('blocked')) {
          throw new Error('مشكلة في الأمان. يرجى تحديث الصفحة والمحاولة مرة أخرى.');
        } else if (errorMessage.includes('Failed to fetch')) {
          throw new Error('فشل في الاتصال بالخادم. يرجى التحقق من اتصال الإنترنت.');
        } else {
          throw new Error(`فشل في إضافة المنتج إلى السلة: ${errorMessage}`);
        }
      }
      
      // انتظار قبل المحاولة التالية
      await new Promise(resolve => setTimeout(resolve, attempt * 1000));
    }
  }
};

// دالة مساعدة للتحقق من حالة الشبكة
export const checkNetworkStatus = async (): Promise<boolean> => {
  try {
    const response = await fetch(buildApiUrl('health'), {
      method: 'HEAD',
      signal: AbortSignal.timeout(5000),
      mode: 'cors',
      credentials: 'omit',
    });
    return response.ok;
  } catch {
    return false;
  }
};

// دالة للتحقق من إمكانية الوصول للـ API
export const testApiConnection = async (): Promise<{
  isConnected: boolean;
  latency: number;
  endpoint: string;
}> => {
  const startTime = performance.now();
  const endpoint = buildApiUrl('health');
  
  try {
    const response = await fetch(endpoint, {
      method: 'GET',
      signal: AbortSignal.timeout(10000),
      mode: 'cors',
      credentials: 'omit',
    });
    
    const latency = performance.now() - startTime;
    
    return {
      isConnected: response.ok,
      latency: Math.round(latency),
      endpoint
    };
  } catch (error) {
    const latency = performance.now() - startTime;
    console.error('API connection test failed:', error);
    
    return {
      isConnected: false,
      latency: Math.round(latency),
      endpoint
    };
  }
}; 