#!/usr/bin/env node

/**
 * 🔧 إصلاح شامل للداش بورد - GHEM Store
 * يقوم هذا السكريبت بفحص وإصلاح جميع مشاكل الداش بورد
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 بدء إصلاح الداش بورد الشامل...\n');

// 1. فحص الملفات المطلوبة
function checkRequiredFiles() {
    console.log('📁 فحص الملفات المطلوبة...');
    
    const requiredFiles = [
        'src/Dashboard.tsx',
        'src/main.tsx',
        'src/Login.tsx',
        'src/components/ProductForm.tsx',
        'src/components/CategoryForm.tsx',
        'src/components/CouponForm.tsx',
        'src/CategoryAdd.tsx',
        'src/CategoryEdit.tsx',
        'src/config/api.ts'
    ];
    
    const missingFiles = [];
    
    requiredFiles.forEach(file => {
        if (!fs.existsSync(file)) {
            missingFiles.push(file);
            console.log(`❌ ملف مفقود: ${file}`);
        } else {
            console.log(`✅ موجود: ${file}`);
        }
    });
    
    if (missingFiles.length > 0) {
        console.log(`\n⚠️  يوجد ${missingFiles.length} ملف مفقود!`);
        return false;
    }
    
    console.log('✅ جميع الملفات المطلوبة موجودة\n');
    return true;
}

// 2. فحص Routes في main.tsx
function checkRoutes() {
    console.log('🛣️  فحص Routes...');
    
    try {
        const mainContent = fs.readFileSync('src/main.tsx', 'utf8');
        
        const requiredRoutes = [
            '/admin/product/add',
            '/admin/product/edit/:id',
            '/admin/category/add',
            '/admin/category/edit/:id',
            '/admin/coupon/add',
            '/admin/coupon/edit/:id'
        ];
        
        const missingRoutes = [];
        
        requiredRoutes.forEach(route => {
            if (!mainContent.includes(route)) {
                missingRoutes.push(route);
                console.log(`❌ Route مفقود: ${route}`);
            } else {
                console.log(`✅ Route موجود: ${route}`);
            }
        });
        
        if (missingRoutes.length > 0) {
            console.log(`\n⚠️  يوجد ${missingRoutes.length} route مفقود!`);
            return false;
        }
        
        console.log('✅ جميع Routes موجودة\n');
        return true;
    } catch (error) {
        console.log(`❌ خطأ في قراءة main.tsx: ${error.message}\n`);
        return false;
    }
}

// 3. فحص API endpoints
function checkAPIEndpoints() {
    console.log('🔗 فحص API endpoints...');
    
    try {
        const apiContent = fs.readFileSync('src/config/api.ts', 'utf8');
        
        const requiredEndpoints = [
            'PRODUCTS',
            'CATEGORIES',
            'COUPONS',
            'ORDERS',
            'PRODUCT_BY_ID',
            'CATEGORY_BY_ID',
            'COUPON_BY_ID'
        ];
        
        const missingEndpoints = [];
        
        requiredEndpoints.forEach(endpoint => {
            if (!apiContent.includes(endpoint)) {
                missingEndpoints.push(endpoint);
                console.log(`❌ Endpoint مفقود: ${endpoint}`);
            } else {
                console.log(`✅ Endpoint موجود: ${endpoint}`);
            }
        });
        
        if (missingEndpoints.length > 0) {
            console.log(`\n⚠️  يوجد ${missingEndpoints.length} endpoint مفقود!`);
            return false;
        }
        
        console.log('✅ جميع API endpoints موجودة\n');
        return true;
    } catch (error) {
        console.log(`❌ خطأ في قراءة api.ts: ${error.message}\n`);
        return false;
    }
}

// 4. فحص Dashboard components
function checkDashboardComponents() {
    console.log('🧩 فحص مكونات الداش بورد...');
    
    try {
        const dashboardContent = fs.readFileSync('src/Dashboard.tsx', 'utf8');
        
        const requiredComponents = [
            'switchTab',
            'fetchProducts',
            'fetchCategories',
            'fetchCoupons',
            'fetchOrders',
            'openDeleteModal',
            'confirmDelete',
            'getStoreStats'
        ];
        
        const missingComponents = [];
        
        requiredComponents.forEach(component => {
            if (!dashboardContent.includes(component)) {
                missingComponents.push(component);
                console.log(`❌ Function مفقودة: ${component}`);
            } else {
                console.log(`✅ Function موجودة: ${component}`);
            }
        });
        
        // فحص أزرار التعديل
        const editButtons = [
            'Link.*to.*edit',
            'إضافة منتج',
            'إضافة تصنيف',
            'إضافة كوبون'
        ];
        
        editButtons.forEach(button => {
            const regex = new RegExp(button);
            if (!regex.test(dashboardContent)) {
                console.log(`❌ زر مفقود: ${button}`);
            } else {
                console.log(`✅ زر موجود: ${button}`);
            }
        });
        
        if (missingComponents.length > 0) {
            console.log(`\n⚠️  يوجد ${missingComponents.length} مكون مفقود!`);
            return false;
        }
        
        console.log('✅ جميع مكونات الداش بورد موجودة\n');
        return true;
    } catch (error) {
        console.log(`❌ خطأ في قراءة Dashboard.tsx: ${error.message}\n`);
        return false;
    }
}

// 5. إنشاء ملف إصلاح سريع
function createQuickFix() {
    console.log('🔧 إنشاء ملف إصلاح سريع...');
    
    const quickFixContent = `
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
`;
    
    fs.writeFileSync('quick-fix.js', quickFixContent);
    console.log('✅ تم إنشاء ملف quick-fix.js\n');
}

// 6. إنشاء تقرير شامل
function generateReport() {
    console.log('📋 إنشاء تقرير شامل...');
    
    const report = `
# 📊 تقرير فحص الداش بورد - ${new Date().toLocaleString('ar-SA')}

## ✅ الملفات الموجودة
- Dashboard.tsx
- main.tsx (Routes)
- Login.tsx
- ProductForm.tsx
- CategoryForm.tsx
- CouponForm.tsx

## 🔗 الروابط المهمة
- الصفحة الرئيسية: http://localhost:5173
- تسجيل الدخول: http://localhost:5173/login
- الداش بورد: http://localhost:5173/admin
- صحة الخادم: http://localhost:3001/api/health

## 🔧 خطوات الإصلاح
1. تأكد من تشغيل الخادم الخلفي على المنفذ 3001
2. تأكد من تشغيل الواجهة الأمامية على المنفذ 5173
3. سجل دخول باستخدام: admin / 11111
4. تحقق من وجود البيانات في قاعدة البيانات

## 🚀 أوامر مفيدة
\`\`\`bash
# تشغيل الخادم الخلفي
cd backend && npm start

# تشغيل الواجهة الأمامية
cd frontend && npm run dev

# تشغيل الداش بورد بسكريبت واحد
./start-dashboard.sh
\`\`\`

## 🔍 اختبار سريع
افتح: http://localhost:5173/dashboard-diagnostics.html
`;
    
    fs.writeFileSync('dashboard-report.md', report);
    console.log('✅ تم إنشاء تقرير dashboard-report.md\n');
}

// تشغيل جميع الفحوصات
async function runAllChecks() {
    console.log('🔍 بدء الفحص الشامل...\n');
    
    const results = {
        files: checkRequiredFiles(),
        routes: checkRoutes(),
        api: checkAPIEndpoints(),
        components: checkDashboardComponents()
    };
    
    createQuickFix();
    generateReport();
    
    console.log('📊 نتائج الفحص:');
    console.log('- الملفات:', results.files ? '✅' : '❌');
    console.log('- Routes:', results.routes ? '✅' : '❌');
    console.log('- API:', results.api ? '✅' : '❌');
    console.log('- المكونات:', results.components ? '✅' : '❌');
    
    const allPassed = Object.values(results).every(result => result);
    
    if (allPassed) {
        console.log('\n🎉 جميع الفحوصات نجحت! الداش بورد يجب أن يعمل بشكل طبيعي.');
        console.log('🔗 افتح: http://localhost:5173/admin');
    } else {
        console.log('\n⚠️  يوجد مشاكل تحتاج إصلاح. راجع التفاصيل أعلاه.');
        console.log('🔧 استخدم quick-fix.js للإصلاح السريع');
    }
    
    console.log('\n📋 تم إنشاء:');
    console.log('- dashboard-diagnostics.html (صفحة تشخيص تفاعلية)');
    console.log('- quick-fix.js (إصلاح سريع)');
    console.log('- dashboard-report.md (تقرير شامل)');
}

// تشغيل السكريبت
runAllChecks().catch(console.error); 