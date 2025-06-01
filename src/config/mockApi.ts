// Mock API للاختبار عند عدم توفر الخادم
export const MOCK_DATA = {
  categories: [
    { id: 1, name: 'ملابس التخرج', description: 'مجموعة متنوعة من ملابس التخرج الأنيقة', image: '/images/graduation-clothes.jpg', isActive: true, createdAt: '2025-05-30T00:00:00Z' },
    { id: 2, name: 'الإكسسوارات', description: 'إكسسوارات التخرج والمناسبات الخاصة', image: '/images/accessories.jpg', isActive: true, createdAt: '2025-05-30T00:00:00Z' },
    { id: 3, name: 'الملابس المدرسية', description: 'زي مدرسي عالي الجودة ومريح', image: '/images/school-uniforms.jpg', isActive: true, createdAt: '2025-05-30T00:00:00Z' }
  ],
  
  products: [
    { id: 1, name: 'عباية تخرج كلاسيكية', description: 'عباية تخرج أنيقة مصنوعة من أجود الخامات', price: 250, originalPrice: 300, stock: 50, categoryId: 1, productType: 'عباية تخرج', mainImage: '/images/graduation-gown-1.jpg', detailedImages: [], specifications: [{ name: 'المادة', value: 'بوليستر عالي الجودة' }], isActive: true, createdAt: '2025-05-30T00:00:00Z' },
    { id: 2, name: 'كاب التخرج الأكاديمي', description: 'كاب تخرج تقليدي مع شرابة ذهبية', price: 80, stock: 100, categoryId: 2, productType: 'كاب فقط', mainImage: '/images/graduation-cap-1.jpg', detailedImages: [], specifications: [{ name: 'المادة', value: 'قطن مخلوط' }], isActive: true, createdAt: '2025-05-30T00:00:00Z' },
    { id: 3, name: 'وشاح التخرج الذهبي', description: 'وشاح تخرج أنيق باللون الذهبي', price: 45, stock: 75, categoryId: 2, productType: 'وشاح وكاب', mainImage: '/images/graduation-sash-1.jpg', detailedImages: [], specifications: [{ name: 'المادة', value: 'ساتان' }], isActive: true, createdAt: '2025-05-30T00:00:00Z' },
    { id: 4, name: 'مريول مدرسي للبنات', description: 'مريول مدرسي مريح وعملي', price: 120, stock: 60, categoryId: 3, productType: 'مريول مدرسي', mainImage: '/images/school-uniform-1.jpg', detailedImages: [], specifications: [{ name: 'المادة', value: 'قطن 100%' }], isActive: true, createdAt: '2025-05-30T00:00:00Z' },
    { id: 5, name: 'جاكيت التخرج الرسمي', description: 'جاكيت تخرج رسمي للمناسبات الخاصة', price: 180, originalPrice: 220, stock: 30, categoryId: 1, productType: 'جاكيت', mainImage: '/images/graduation-jacket-1.jpg', detailedImages: [], specifications: [{ name: 'المادة', value: 'صوف مخلوط' }], isActive: true, createdAt: '2025-05-30T00:00:00Z' }
  ],

  orders: [
    { id: 1, customerName: 'أحمد محمد علي', customerEmail: 'ahmed@example.com', customerPhone: '0551234567', address: 'حي النور، شارع العشرين', city: 'الرياض', items: [{ productId: 1, productName: 'عباية تخرج كلاسيكية', price: 250, quantity: 1, totalPrice: 250 }], total: 296, status: 'pending', createdAt: '2025-05-30T00:00:00Z' },
    { id: 2, customerName: 'فاطمة عبدالله', customerEmail: 'fatma@example.com', customerPhone: '0559876543', address: 'حي الملك فهد، شارع الخامس', city: 'جدة', items: [{ productId: 2, productName: 'كاب التخرج الأكاديمي', price: 80, quantity: 2, totalPrice: 160 }], total: 167.25, status: 'confirmed', createdAt: '2025-05-29T00:00:00Z' },
    { id: 3, customerName: 'خالد السعيد', customerEmail: 'khalid@example.com', customerPhone: '0563456789', address: 'حي الأندلس، شارع التاسع', city: 'الدمام', items: [{ productId: 3, productName: 'وشاح التخرج الذهبي', price: 45, quantity: 5, totalPrice: 225 }], total: 240.50, status: 'shipped', createdAt: '2025-05-28T00:00:00Z' },
    { id: 4, customerName: 'نورا أحمد', customerEmail: 'nora@example.com', customerPhone: '0571122334', address: 'حي السلام، شارع الثاني', city: 'مكة', items: [{ productId: 4, productName: 'مريول مدرسي للبنات', price: 120, quantity: 1, totalPrice: 120 }], total: 150, status: 'delivered', createdAt: '2025-05-27T00:00:00Z' },
    { id: 5, customerName: 'محمد الغامدي', customerEmail: 'mohammed@example.com', customerPhone: '0551234567', address: 'حي الورود، شارع الستين', city: 'الرياض', items: [{ productId: 5, productName: 'جاكيت التخرج الرسمي', price: 180, quantity: 1, totalPrice: 180 }], total: 166.50, status: 'preparing', createdAt: '2025-05-26T00:00:00Z' }
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