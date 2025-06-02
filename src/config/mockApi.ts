// Mock API للاختبار عند عدم توفر الخادم
export const MOCK_DATA = {
  categories: [
    { 
      id: 1, 
      name: 'معدات طبية أساسية', 
      description: 'أدوات ومعدات طبية أساسية للعيادات والمستشفيات', 
      image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop&crop=center&auto=format,compress&q=80&ixlib=rb-4.0.3', 
      isActive: true, 
      createdAt: '2025-05-30T00:00:00Z' 
    },
    { 
      id: 2, 
      name: 'أجهزة التشخيص', 
      description: 'أجهزة التشخيص والفحص الطبي المتقدمة', 
      image: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&h=300&fit=crop&crop=center&auto=format,compress&q=80&ixlib=rb-4.0.3', 
      isActive: true, 
      createdAt: '2025-05-30T00:00:00Z' 
    },
    { 
      id: 3, 
      name: 'مستلزمات طبية', 
      description: 'مستلزمات ولوازم طبية يومية للرعاية الصحية', 
      image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=400&h=300&fit=crop&crop=center&auto=format,compress&q=80&ixlib=rb-4.0.3', 
      isActive: true, 
      createdAt: '2025-05-30T00:00:00Z' 
    },
    { 
      id: 4, 
      name: 'أدوات جراحية', 
      description: 'أدوات جراحية عالية الدقة والجودة', 
      image: 'https://images.unsplash.com/photo-1551076805-e1869033e561?w=400&h=300&fit=crop&crop=center&auto=format,compress&q=80&ixlib=rb-4.0.3', 
      isActive: true, 
      createdAt: '2025-05-30T00:00:00Z' 
    },
    { 
      id: 5, 
      name: 'أجهزة مراقبة', 
      description: 'أجهزة مراقبة العلامات الحيوية والحالة الصحية', 
      image: 'https://images.unsplash.com/photo-1631815588090-d4bfec5b1ccf?w=400&h=300&fit=crop&crop=center&auto=format,compress&q=80&ixlib=rb-4.0.3', 
      isActive: true, 
      createdAt: '2025-05-30T00:00:00Z' 
    }
  ],
  
  products: [
    { 
      id: 1, 
      name: 'سماعة طبية رقمية', 
      description: 'سماعة طبية رقمية عالية الجودة لتشخيص دقيق', 
      price: 450, 
      originalPrice: 550, 
      stock: 25, 
      categoryId: 1, 
      productType: 'أداة تشخيص', 
      mainImage: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=600&h=600&fit=crop&crop=center&auto=format,compress&q=80&ixlib=rb-4.0.3', 
      detailedImages: [
        'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=800&fit=crop&crop=center&auto=format,compress&q=80&ixlib=rb-4.0.3',
        'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=800&h=800&fit=crop&crop=center&auto=format,compress&q=80&ixlib=rb-4.0.3'
      ], 
      specifications: [{ name: 'المادة', value: 'ستانلس ستيل طبي' }, { name: 'الضمان', value: 'سنتان' }], 
      isActive: true, 
      createdAt: '2025-05-30T00:00:00Z' 
    },
    { 
      id: 2, 
      name: 'جهاز قياس ضغط الدم', 
      description: 'جهاز قياس ضغط الدم الرقمي للاستخدام المنزلي والطبي', 
      price: 280, 
      stock: 40, 
      categoryId: 2, 
      productType: 'جهاز مراقبة', 
      mainImage: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=600&h=600&fit=crop&crop=center&auto=format,compress&q=80&ixlib=rb-4.0.3', 
      detailedImages: [
        'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=800&h=800&fit=crop&crop=center&auto=format,compress&q=80&ixlib=rb-4.0.3'
      ], 
      specifications: [{ name: 'الدقة', value: '±3 mmHg' }, { name: 'البطارية', value: 'قابلة للشحن' }], 
      isActive: true, 
      createdAt: '2025-05-30T00:00:00Z' 
    },
    { 
      id: 3, 
      name: 'ترمومتر رقمي بالأشعة تحت الحمراء', 
      description: 'ترمومتر رقمي دقيق وسريع للقياس عن بعد', 
      price: 120, 
      stock: 60, 
      categoryId: 2, 
      productType: 'أداة قياس', 
      mainImage: 'https://images.unsplash.com/photo-1631815588090-d4bfec5b1ccf?w=600&h=600&fit=crop&crop=center&auto=format,compress&q=80&ixlib=rb-4.0.3', 
      detailedImages: [
        'https://images.unsplash.com/photo-1631815588090-d4bfec5b1ccf?w=800&h=800&fit=crop&crop=center&auto=format,compress&q=80&ixlib=rb-4.0.3'
      ], 
      specifications: [{ name: 'الدقة', value: '±0.2°C' }, { name: 'المدى', value: '3-5 سم' }], 
      isActive: true, 
      createdAt: '2025-05-30T00:00:00Z' 
    },
    { 
      id: 4, 
      name: 'قفازات طبية معقمة', 
      description: 'قفازات طبية معقمة للاستخدام الواحد عالية الجودة', 
      price: 45, 
      stock: 200, 
      categoryId: 3, 
      productType: 'مستلزم طبي', 
      mainImage: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=600&h=600&fit=crop&crop=center&auto=format,compress&q=80&ixlib=rb-4.0.3', 
      detailedImages: [
        'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&h=800&fit=crop&crop=center&auto=format,compress&q=80&ixlib=rb-4.0.3'
      ], 
      specifications: [{ name: 'المادة', value: 'نيترايل' }, { name: 'العدد', value: '100 قفاز/علبة' }], 
      isActive: true, 
      createdAt: '2025-05-30T00:00:00Z' 
    },
    { 
      id: 5, 
      name: 'أدوات جراحية أساسية', 
      description: 'مجموعة أدوات جراحية أساسية للعمليات البسيطة', 
      price: 850, 
      originalPrice: 950, 
      stock: 15, 
      categoryId: 4, 
      productType: 'أدوات جراحية', 
      mainImage: 'https://images.unsplash.com/photo-1551076805-e1869033e561?w=600&h=600&fit=crop&crop=center&auto=format,compress&q=80&ixlib=rb-4.0.3', 
      detailedImages: [
        'https://images.unsplash.com/photo-1551076805-e1869033e561?w=800&h=800&fit=crop&crop=center&auto=format,compress&q=80&ixlib=rb-4.0.3'
      ], 
      specifications: [{ name: 'المادة', value: 'ستانلس ستيل جراحي' }, { name: 'العدد', value: '12 أداة' }], 
      isActive: true, 
      createdAt: '2025-05-30T00:00:00Z' 
    },
    { 
      id: 6, 
      name: 'جهاز قياس السكر', 
      description: 'جهاز قياس السكر في الدم سهل الاستخدام ودقيق', 
      price: 180, 
      stock: 35, 
      categoryId: 2, 
      productType: 'جهاز تحليل', 
      mainImage: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=600&h=600&fit=crop&crop=center&auto=format,compress&q=80&ixlib=rb-4.0.3', 
      detailedImages: [
        'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=800&h=800&fit=crop&crop=center&auto=format,compress&q=80&ixlib=rb-4.0.3'
      ], 
      specifications: [{ name: 'الدقة', value: '±10 mg/dL' }, { name: 'الذاكرة', value: '300 قراءة' }], 
      isActive: true, 
      createdAt: '2025-05-30T00:00:00Z' 
    },
    { 
      id: 7, 
      name: 'كمامات طبية N95', 
      description: 'كمامات طبية عالية الحماية N95 معتمدة', 
      price: 65, 
      stock: 150, 
      categoryId: 3, 
      productType: 'معدات حماية', 
      mainImage: 'https://images.unsplash.com/photo-1584362917165-526a968579e8?w=600&h=600&fit=crop&crop=center&auto=format,compress&q=80&ixlib=rb-4.0.3', 
      detailedImages: [
        'https://images.unsplash.com/photo-1584362917165-526a968579e8?w=800&h=800&fit=crop&crop=center&auto=format,compress&q=80&ixlib=rb-4.0.3'
      ], 
      specifications: [{ name: 'المعيار', value: 'N95' }, { name: 'العدد', value: '20 كمامة/علبة' }], 
      isActive: true, 
      createdAt: '2025-05-30T00:00:00Z' 
    },
    { 
      id: 8, 
      name: 'جهاز مراقبة نبضات القلب', 
      description: 'جهاز مراقبة نبضات القلب المحمول للاستخدام الشخصي', 
      price: 320, 
      stock: 20, 
      categoryId: 5, 
      productType: 'جهاز مراقبة', 
      mainImage: 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=600&h=600&fit=crop&crop=center&auto=format,compress&q=80&ixlib=rb-4.0.3', 
      detailedImages: [
        'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=800&h=800&fit=crop&crop=center&auto=format,compress&q=80&ixlib=rb-4.0.3'
      ], 
      specifications: [{ name: 'البطارية', value: '48 ساعة' }, { name: 'الاتصال', value: 'بلوتوث' }], 
      isActive: true, 
      createdAt: '2025-05-30T00:00:00Z' 
    }
  ],

  orders: [
    { id: 1, customerName: 'أحمد محمد علي', customerEmail: 'ahmed@example.com', customerPhone: '0551234567', address: 'حي النور، شارع العشرين', city: 'الرياض', items: [{ productId: 1, productName: 'سماعة طبية رقمية', price: 450, quantity: 1, totalPrice: 450 }], total: 296, status: 'pending', createdAt: '2025-05-30T00:00:00Z' },
    { id: 2, customerName: 'فاطمة عبدالله', customerEmail: 'fatma@example.com', customerPhone: '0559876543', address: 'حي الملك فهد، شارع الخامس', city: 'جدة', items: [{ productId: 2, productName: 'جهاز قياس ضغط الدم', price: 280, quantity: 2, totalPrice: 560 }], total: 167.25, status: 'confirmed', createdAt: '2025-05-29T00:00:00Z' },
    { id: 3, customerName: 'خالد السعيد', customerEmail: 'khalid@example.com', customerPhone: '0563456789', address: 'حي الأندلس، شارع التاسع', city: 'الدمام', items: [{ productId: 3, productName: 'ترمومتر رقمي بالأشعة تحت الحمراء', price: 120, quantity: 5, totalPrice: 600 }], total: 240.50, status: 'shipped', createdAt: '2025-05-28T00:00:00Z' },
    { id: 4, customerName: 'نورا أحمد', customerEmail: 'nora@example.com', customerPhone: '0571122334', address: 'حي السلام، شارع الثاني', city: 'مكة', items: [{ productId: 4, productName: 'قفازات طبية معقمة', price: 45, quantity: 1, totalPrice: 45 }], total: 150, status: 'delivered', createdAt: '2025-05-27T00:00:00Z' },
    { id: 5, customerName: 'محمد الغامدي', customerEmail: 'mohammed@example.com', customerPhone: '0551234567', address: 'حي الورود، شارع الستين', city: 'الرياض', items: [{ productId: 5, productName: 'أدوات جراحية أساسية', price: 850, quantity: 1, totalPrice: 850 }], total: 166.50, status: 'preparing', createdAt: '2025-05-26T00:00:00Z' }
  ],

  coupons: [
    { id: 1, name: 'كوبون ترحيبي', code: 'WELCOME10', description: 'خصم ترحيبي للعملاء الجدد', discountType: 'percentage', discountValue: 10, minimumAmount: 100, maxDiscount: 50, usageLimit: 100, usedCount: 15, isActive: true, expiryDate: '2025-12-31T00:00:00Z', createdAt: '2025-05-30T00:00:00Z' },
    { id: 2, name: 'خصم التخرج', code: 'GRADUATION25', description: 'خصم خاص على ملابس التخرج', discountType: 'percentage', discountValue: 25, minimumAmount: 200, maxDiscount: 100, usageLimit: 50, usedCount: 8, isActive: true, expiryDate: '2025-08-31T00:00:00Z', createdAt: '2025-05-30T00:00:00Z' },
    { id: 3, name: 'خصم ثابت', code: 'FIXED50', description: 'خصم ثابت 50 ريال', discountType: 'fixed', discountValue: 50, minimumAmount: 300, usageLimit: 30, usedCount: 5, isActive: true, expiryDate: '2025-07-31T00:00:00Z', createdAt: '2025-05-30T00:00:00Z' }
  ],

  customers: [],
  wishlistItems: [],
  cartItems: [],
  reviews: []
};

// Mock API function
export const mockApiCall = async (endpoint: string): Promise<any> => {
  // محاكاة delay للشبكة
  await new Promise(resolve => setTimeout(resolve, 500));
  
  switch (endpoint) {
    case 'categories':
      return MOCK_DATA.categories;
    case 'products':
      return MOCK_DATA.products;
    case 'orders':
      return MOCK_DATA.orders;
    case 'coupons':
      return MOCK_DATA.coupons;
    case 'customers':
      return MOCK_DATA.customers;
    case 'health':
      return {
        status: 'healthy (mock data)',
        database: 'Mock Database',
        categories: MOCK_DATA.categories.length,
        products: MOCK_DATA.products.length,
        coupons: MOCK_DATA.coupons.length,
        cartItems: MOCK_DATA.cartItems.length,
        wishlistItems: MOCK_DATA.wishlistItems.length,
        customers: MOCK_DATA.customers.length,
        orders: MOCK_DATA.orders.length,
        pendingOrders: MOCK_DATA.orders.filter(o => o.status === 'pending').length,
        reviews: MOCK_DATA.reviews.length,
        timestamp: new Date().toISOString()
      };
    default:
      // للـ endpoints المعقدة
      if (endpoint.startsWith('products/category/')) {
        const categoryId = parseInt(endpoint.split('/')[2]);
        return MOCK_DATA.products.filter(p => p.categoryId === categoryId);
      }
      if (endpoint.startsWith('categories/') || endpoint.startsWith('products/') || endpoint.startsWith('orders/')) {
        const id = parseInt(endpoint.split('/')[1]);
        const type = endpoint.split('/')[0];
        return MOCK_DATA[type as keyof typeof MOCK_DATA].find((item: any) => item.id === id);
      }
      return [];
  }
}; 