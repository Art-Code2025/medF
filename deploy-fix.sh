#!/bin/bash

echo "🚀 إعادة نشر التطبيق مع Backend URL الصحيح"
echo "==============================================="

echo "📋 التحقق من الإعدادات الحالية..."
echo "VITE_API_BASE_URL=$(cat .env.production | grep VITE_API_BASE_URL)"
echo "netlify.toml: $(grep 'VITE_API_BASE_URL.*medb' netlify.toml | head -1)"

echo ""
echo "🔨 بناء التطبيق..."
npm run build

echo ""
echo "✅ التطبيق جاهز للنشر!"
echo ""
echo "📤 خيارات النشر:"
echo "1. النشر التلقائي (Git):"
echo "   git add ."
echo "   git commit -m 'Fix: Update backend URL to medb.onrender.com'"
echo "   git push origin main"
echo ""
echo "2. النشر اليدوي (Netlify CLI):"
echo "   netlify deploy --prod --dir=dist"
echo ""
echo "3. النشر اليدوي (رفع ملفات):"
echo "   - اذهب لـ: https://app.netlify.com"
echo "   - اسحب مجلد 'dist' للموقع"
echo ""
echo "🔗 بعد النشر، اختبر: https://medicinef.netlify.app/admin"
echo "🔐 بيانات الدخول: admin / 11111" 