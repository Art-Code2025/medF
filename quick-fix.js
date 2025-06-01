
// 🔧 إصلاح سريع للداش بورد
// قم بتشغيل هذا الكود في console المتصفح

console.log('🚀 بدء الإصلاح السريع...');

// 1. تسجيل دخول تلقائي
localStorage.setItem('isAuthenticated', 'true');
console.log('✅ تم تسجيل الدخول');

// 2. فحص الاتصال بالخادم
fetch('http://localhost:3001/api/health')
    .then(response => response.json())
    .then(data => {
        console.log('✅ الخادم يعمل:', data);
    })
    .catch(error => {
        console.error('❌ مشكلة في الخادم:', error);
    });

// 3. فحص البيانات
Promise.all([
    fetch('http://localhost:3001/api/products').then(r => r.json()),
    fetch('http://localhost:3001/api/categories').then(r => r.json()),
    fetch('http://localhost:3001/api/coupons').then(r => r.json())
]).then(([products, categories, coupons]) => {
    console.log('📊 البيانات:');
    console.log('- المنتجات:', products.length);
    console.log('- التصنيفات:', categories.length);
    console.log('- الكوبونات:', coupons.length);
}).catch(error => {
    console.error('❌ خطأ في جلب البيانات:', error);
});

// 4. إعادة تحميل الصفحة
setTimeout(() => {
    console.log('🔄 إعادة تحميل الصفحة...');
    window.location.reload();
}, 2000);
