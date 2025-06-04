// Cart Synchronization Utility
// يدير مزامنة حالة السلة بين الضيوف والمستخدمين المسجلين

export class CartSyncManager {
  private static instance: CartSyncManager;
  private updateListeners: (() => void)[] = [];
  private syncInProgress = false;

  private constructor() {
    this.initializeEventListeners();
  }

  static getInstance(): CartSyncManager {
    if (!CartSyncManager.instance) {
      CartSyncManager.instance = new CartSyncManager();
    }
    return CartSyncManager.instance;
  }

  // تهيئة مستمعي الأحداث
  private initializeEventListeners() {
    // مراقبة تغييرات localStorage
    window.addEventListener('storage', this.handleStorageChange.bind(this));
    
    // مراقبة أحداث السلة
    const cartEvents = [
      'cartUpdated',
      'cartMigrated', 
      'userCartLoaded',
      'cartItemAdded',
      'cartItemRemoved',
      'cartItemUpdated',
      'userSignedIn',
      'userSignedOut'
    ];

    cartEvents.forEach(event => {
      window.addEventListener(event, this.handleCartEvent.bind(this));
    });
  }

  // معالج تغييرات localStorage
  private handleStorageChange(event: StorageEvent) {
    if (event.key === 'lastCartCount' || event.key === 'lastCartValue' || event.key === 'user') {
      console.log(`🔄 [CartSync] Storage change detected:`, event.key, event.newValue);
      this.notifyListeners();
    }
  }

  // معالج أحداث السلة
  private handleCartEvent(event: Event) {
    console.log(`🎯 [CartSync] Cart event received:`, event.type);
    this.notifyListeners();
  }

  // إضافة مستمع للتحديثات
  addUpdateListener(listener: () => void) {
    this.updateListeners.push(listener);
    return () => {
      this.updateListeners = this.updateListeners.filter(l => l !== listener);
    };
  }

  // إشعار جميع المستمعين
  private notifyListeners() {
    this.updateListeners.forEach(listener => {
      try {
        listener();
      } catch (error) {
        console.error('❌ [CartSync] Error in update listener:', error);
      }
    });
  }

  // جلب عدد السلة الحالي
  getCurrentCartCount(): number {
    const savedCount = localStorage.getItem('lastCartCount');
    const count = savedCount ? parseInt(savedCount, 10) : 0;
    return isNaN(count) || count < 0 ? 0 : count;
  }

  // جلب قيمة السلة الحالية
  getCurrentCartValue(): number {
    const savedValue = localStorage.getItem('lastCartValue');
    const value = savedValue ? parseFloat(savedValue) : 0;
    return isNaN(value) || value < 0 ? 0 : value;
  }

  // تحديث عداد السلة
  updateCartCount(count: number) {
    const currentCount = this.getCurrentCartCount();
    if (currentCount !== count) {
      localStorage.setItem('lastCartCount', count.toString());
      console.log(`📦 [CartSync] Cart count updated: ${currentCount} → ${count}`);
      this.dispatchCartUpdate(count, this.getCurrentCartValue());
    }
  }

  // تحديث قيمة السلة
  updateCartValue(value: number) {
    const currentValue = this.getCurrentCartValue();
    if (currentValue !== value) {
      localStorage.setItem('lastCartValue', value.toString());
      console.log(`💰 [CartSync] Cart value updated: ${currentValue} → ${value}`);
      this.dispatchCartUpdate(this.getCurrentCartCount(), value);
    }
  }

  // تحديث كل من العدد والقيمة
  updateCart(count: number, value: number) {
    const currentCount = this.getCurrentCartCount();
    const currentValue = this.getCurrentCartValue();
    
    let updated = false;
    
    if (currentCount !== count) {
      localStorage.setItem('lastCartCount', count.toString());
      updated = true;
    }
    
    if (currentValue !== value) {
      localStorage.setItem('lastCartValue', value.toString());
      updated = true;
    }
    
    if (updated) {
      console.log(`🔄 [CartSync] Cart updated: count=${count}, value=${value}`);
      this.dispatchCartUpdate(count, value);
    }
  }

  // إرسال أحداث تحديث السلة
  private dispatchCartUpdate(count: number, value: number) {
    const updateEvents = [
      'cartUpdated',
      'cartCountChanged',
      'cartValueChanged',
      'forceCartUpdate'
    ];

    updateEvents.forEach(eventName => {
      window.dispatchEvent(new CustomEvent(eventName, {
        detail: { newCount: count, newValue: value, timestamp: Date.now() }
      }));
    });

    // تحديث DOM مباشرة
    this.updateCartCountInDOM(count);
    
    // إشعار المستمعين
    this.notifyListeners();
  }

  // تحديث عداد السلة في DOM
  private updateCartCountInDOM(count: number) {
    const cartCountElements = document.querySelectorAll('[data-cart-count]');
    cartCountElements.forEach(element => {
      if (element.textContent !== count.toString()) {
        element.textContent = count > 99 ? '99+' : count.toString();
      }
    });
  }

  // مزامنة السلة مع الخادم
  async syncWithServer(): Promise<{ count: number, value: number }> {
    if (this.syncInProgress) {
      console.log('⏳ [CartSync] Sync already in progress, skipping...');
      return { count: this.getCurrentCartCount(), value: this.getCurrentCartValue() };
    }

    this.syncInProgress = true;
    
    try {
      const userData = localStorage.getItem('user');
      let endpoint = '/api/cart?userId=guest';
      
      if (userData) {
        try {
          const user = JSON.parse(userData);
          if (user?.id && user.id !== 'guest') {
            endpoint = `/api/user/${user.id}/cart`;
          }
        } catch (parseError) {
          console.warn('🚨 [CartSync] Error parsing user data:', parseError);
        }
      }

      console.log(`🔄 [CartSync] Syncing with server: ${endpoint}`);
      
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}${endpoint}`);
      
      if (response.ok) {
        const cartData = await response.json();
        
        if (Array.isArray(cartData)) {
          const count = cartData.reduce((sum: number, item: any) => sum + item.quantity, 0);
          const value = cartData.reduce((sum: number, item: any) => 
            sum + (item.price || item.product?.price || 0) * item.quantity, 0
          );
          
          this.updateCart(count, value);
          console.log(`✅ [CartSync] Synced with server: count=${count}, value=${value}`);
          
          return { count, value };
        }
      } else {
        console.warn(`⚠️ [CartSync] Server sync failed:`, response.status);
      }
    } catch (error) {
      console.error('❌ [CartSync] Error syncing with server:', error);
    } finally {
      this.syncInProgress = false;
    }

    return { count: this.getCurrentCartCount(), value: this.getCurrentCartValue() };
  }

  // مزامنة السلة بعد تسجيل الدخول
  async syncAfterLogin(): Promise<void> {
    console.log('🔐 [CartSync] Starting post-login sync...');
    
    try {
      // انتظار قصير للتأكد من اكتمال تسجيل الدخول
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // مزامنة مع الخادم
      const { count, value } = await this.syncWithServer();
      
      // إرسال حدث خاص لتسجيل الدخول
      window.dispatchEvent(new CustomEvent('userCartLoaded', {
        detail: { count, value, postLogin: true }
      }));
      
      console.log(`✅ [CartSync] Post-login sync completed: count=${count}, value=${value}`);
    } catch (error) {
      console.error('❌ [CartSync] Post-login sync failed:', error);
    }
  }

  // مزامنة السلة بعد تسجيل الخروج
  async syncAfterLogout(): Promise<void> {
    console.log('🚪 [CartSync] Starting post-logout sync...');
    
    try {
      // مسح بيانات المستخدم من localStorage
      localStorage.removeItem('user');
      localStorage.removeItem('customerUser');
      
      // إعادة تعيين عدادات السلة (للضيف)
      const { count, value } = await this.syncWithServer();
      
      console.log(`✅ [CartSync] Post-logout sync completed: count=${count}, value=${value}`);
    } catch (error) {
      console.error('❌ [CartSync] Post-logout sync failed:', error);
    }
  }

  // تنشيط مزامنة دورية
  startPeriodicSync(intervalMs: number = 30000) {
    setInterval(async () => {
      await this.syncWithServer();
    }, intervalMs);
    
    console.log(`🕐 [CartSync] Periodic sync started (every ${intervalMs}ms)`);
  }
}

// تصدير instance مفرد
export const cartSyncManager = CartSyncManager.getInstance(); 