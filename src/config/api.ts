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
  
  // إذا كان base64 data URL
  if (imagePath.startsWith('data:image/')) {
    return imagePath;
  }
  
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
  const fallbackImages = {
    product: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=400&fit=crop&crop=center&auto=format,compress&q=80&ixlib=rb-4.0.3',
    category: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&h=300&fit=crop&crop=center&auto=format,compress&q=80&ixlib=rb-4.0.3',
    general: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=400&h=400&fit=crop&crop=center&auto=format,compress&q=80&ixlib=rb-4.0.3'
  };
  
  return fallbackImages[type];
};

// دالة محسنة مع retry logic وfallback للبيانات الوهمية
export const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const url = buildApiUrl(endpoint);
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      // إضافة timeout
      signal: AbortSignal.timeout(15000), // 15 seconds timeout
    });
    
    // إذا لم تكن الاستجابة ناجحة
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = { message: response.statusText };
      }
      
      // إنشاء خطأ مفصل مع معلومات إضافية
      const error = new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      (error as any).status = response.status;
      (error as any).statusText = response.statusText;
      (error as any).url = url;
      (error as any).data = errorData;
      
      throw error;
    }
    
    return await response.json();
  } catch (error) {
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
        errorMessage.includes('Failed to fetch')) {
      
      console.warn('🔄 Backend غير متاح، جاري استخدام البيانات التجريبية...');
      
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
    
    // إضافة معلومات إضافية للخطأ إذا لم تكن موجودة
    if (error instanceof Error && !(error as any).status) {
      if (errorMessage.includes('400')) {
        (error as any).status = 400;
      } else if (errorMessage.includes('401')) {
        (error as any).status = 401;
      } else if (errorMessage.includes('403')) {
        (error as any).status = 403;
      } else if (errorMessage.includes('404')) {
        (error as any).status = 404;
      } else if (errorMessage.includes('409')) {
        (error as any).status = 409;
      } else if (errorMessage.includes('422')) {
        (error as any).status = 422;
      } else if (errorMessage.includes('429')) {
        (error as any).status = 429;
      } else if (errorMessage.includes('500')) {
        (error as any).status = 500;
      }
    }
    
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