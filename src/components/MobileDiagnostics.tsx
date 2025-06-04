import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Smartphone, Wifi, Server, Database, CheckCircle, XCircle, AlertCircle, Loader, RefreshCw } from 'lucide-react';
import { testApiConnection, checkNetworkStatus, addToCartOptimized, buildApiUrl } from '../config/api';

interface DiagnosticResult {
  test: string;
  status: 'success' | 'error' | 'warning' | 'loading';
  message: string;
  details?: any;
  duration?: number;
}

const MobileDiagnostics: React.FC = () => {
  const [diagnostics, setDiagnostics] = useState<DiagnosticResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState<any>({});

  useEffect(() => {
    // جمع معلومات الجهاز
    const info = {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      cookiesEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine,
      screenSize: `${screen.width}x${screen.height}`,
      windowSize: `${window.innerWidth}x${window.innerHeight}`,
      connection: (navigator as any).connection ? {
        effectiveType: (navigator as any).connection.effectiveType,
        downlink: (navigator as any).connection.downlink,
        rtt: (navigator as any).connection.rtt,
        saveData: (navigator as any).connection.saveData
      } : 'غير متاح',
      isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
      isTouch: 'ontouchstart' in window,
      timestamp: new Date().toISOString()
    };
    setDeviceInfo(info);
  }, []);

  const updateDiagnostic = (test: string, status: DiagnosticResult['status'], message: string, details?: any, duration?: number) => {
    setDiagnostics(prev => {
      const index = prev.findIndex(d => d.test === test);
      const newResult = { test, status, message, details, duration };
      
      if (index >= 0) {
        const updated = [...prev];
        updated[index] = newResult;
        return updated;
      } else {
        return [...prev, newResult];
      }
    });
  };

  const runDiagnostics = async () => {
    setIsRunning(true);
    setDiagnostics([]);

    // 1. فحص حالة الشبكة
    updateDiagnostic('network', 'loading', 'فحص حالة الشبكة...');
    try {
      const networkStatus = await checkNetworkStatus();
      updateDiagnostic('network', networkStatus ? 'success' : 'error', 
        networkStatus ? 'الشبكة متصلة' : 'مشكلة في الاتصال بالشبكة');
    } catch (error) {
      updateDiagnostic('network', 'error', `خطأ في فحص الشبكة: ${error}`);
    }

    // 2. اختبار اتصال API
    updateDiagnostic('api', 'loading', 'اختبار اتصال API...');
    try {
      const connectionResult = await testApiConnection();
      updateDiagnostic('api', connectionResult.isConnected ? 'success' : 'error',
        connectionResult.isConnected ? 
          `API متصل - زمن الاستجابة: ${connectionResult.latency}ms` : 
          'فشل في الاتصال بـ API',
        connectionResult);
    } catch (error) {
      updateDiagnostic('api', 'error', `خطأ في اختبار API: ${error}`);
    }

    // 3. اختبار Mobile-specific endpoint
    updateDiagnostic('mobile', 'loading', 'اختبار endpoint الموبايل...');
    try {
      const startTime = performance.now();
      const response = await fetch(buildApiUrl('mobile-test'), {
        method: 'GET',
        signal: AbortSignal.timeout(10000),
        mode: 'cors',
        credentials: 'omit',
      });
      const duration = performance.now() - startTime;
      
      if (response.ok) {
        const data = await response.json();
        updateDiagnostic('mobile', 'success', 
          `اختبار الموبايل نجح - ${data.message}`, 
          data, Math.round(duration));
      } else {
        updateDiagnostic('mobile', 'error', `فشل اختبار الموبايل: ${response.status}`);
      }
    } catch (error: any) {
      updateDiagnostic('mobile', 'error', `خطأ في اختبار الموبايل: ${error.message}`);
    }

    // 4. اختبار إضافة منتج للسلة
    updateDiagnostic('cart', 'loading', 'اختبار إضافة منتج للسلة...');
    try {
      const testProduct = {
        productId: 1,
        quantity: 1,
        selectedOptions: {},
        attachments: {}
      };
      
      const startTime = performance.now();
      await addToCartOptimized('guest', testProduct, 2);
      const duration = performance.now() - startTime;
      
      updateDiagnostic('cart', 'success', 
        'نجح اختبار إضافة المنتج للسلة', 
        testProduct, Math.round(duration));
    } catch (error: any) {
      updateDiagnostic('cart', 'error', `فشل اختبار السلة: ${error.message}`);
    }

    // 5. فحص CORS
    updateDiagnostic('cors', 'loading', 'فحص إعدادات CORS...');
    try {
      const response = await fetch(buildApiUrl('health'), {
        method: 'OPTIONS',
        signal: AbortSignal.timeout(5000),
        mode: 'cors',
      });
      
      updateDiagnostic('cors', response.ok ? 'success' : 'warning',
        response.ok ? 'CORS مُعد بشكل صحيح' : 'مشكلة محتملة في CORS');
    } catch (error: any) {
      updateDiagnostic('cors', 'error', `خطأ في CORS: ${error.message}`);
    }

    setIsRunning(false);
  };

  const getStatusIcon = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'error': return <XCircle className="w-5 h-5 text-red-600" />;
      case 'warning': return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case 'loading': return <Loader className="w-5 h-5 text-blue-600 animate-spin" />;
    }
  };

  const getStatusColor = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success': return 'bg-green-50 border-green-200';
      case 'error': return 'bg-red-50 border-red-200';
      case 'warning': return 'bg-yellow-50 border-yellow-200';
      case 'loading': return 'bg-blue-50 border-blue-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4" dir="rtl">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <Smartphone className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">تشخيص مشاكل الموبايل</h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Smartphone className="w-5 h-5" />
                معلومات الجهاز
              </h3>
              <div className="space-y-2 text-sm">
                <div><span className="font-medium">النوع:</span> {deviceInfo.isMobile ? 'موبايل' : 'سطح المكتب'}</div>
                <div><span className="font-medium">اللمس:</span> {deviceInfo.isTouch ? 'مدعوم' : 'غير مدعوم'}</div>
                <div><span className="font-medium">حجم الشاشة:</span> {deviceInfo.screenSize}</div>
                <div><span className="font-medium">حجم النافذة:</span> {deviceInfo.windowSize}</div>
                <div><span className="font-medium">الحالة:</span> {deviceInfo.onLine ? 'متصل' : 'غير متصل'}</div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Wifi className="w-5 h-5" />
                معلومات الاتصال
              </h3>
              <div className="space-y-2 text-sm">
                <div><span className="font-medium">اللغة:</span> {deviceInfo.language}</div>
                <div><span className="font-medium">الكوكيز:</span> {deviceInfo.cookiesEnabled ? 'مفعل' : 'معطل'}</div>
                {deviceInfo.connection && typeof deviceInfo.connection === 'object' && (
                  <>
                    <div><span className="font-medium">نوع الاتصال:</span> {deviceInfo.connection.effectiveType}</div>
                    <div><span className="font-medium">سرعة التحميل:</span> {deviceInfo.connection.downlink} Mbps</div>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-4 mb-6">
            <button
              onClick={runDiagnostics}
              disabled={isRunning}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {isRunning ? (
                <Loader className="w-5 h-5 animate-spin" />
              ) : (
                <RefreshCw className="w-5 h-5" />
              )}
              {isRunning ? 'جاري التشخيص...' : 'بدء التشخيص'}
            </button>

            <button
              onClick={() => {
                navigator.clipboard.writeText(JSON.stringify({ deviceInfo, diagnostics }, null, 2));
                toast.success('تم نسخ تقرير التشخيص');
              }}
              className="flex items-center gap-2 bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 font-medium"
            >
              📋 نسخ التقرير
            </button>
          </div>

          {diagnostics.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">نتائج التشخيص:</h3>
              {diagnostics.map((diagnostic, index) => (
                <div key={index} className={`border rounded-lg p-4 ${getStatusColor(diagnostic.status)}`}>
                  <div className="flex items-center gap-3 mb-2">
                    {getStatusIcon(diagnostic.status)}
                    <span className="font-medium text-gray-900">{diagnostic.test}</span>
                    {diagnostic.duration && (
                      <span className="text-sm text-gray-600">({diagnostic.duration}ms)</span>
                    )}
                  </div>
                  <p className="text-gray-700">{diagnostic.message}</p>
                  {diagnostic.details && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-sm text-gray-600">عرض التفاصيل</summary>
                      <pre className="mt-2 text-xs bg-white p-2 rounded border overflow-auto">
                        {JSON.stringify(diagnostic.details, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MobileDiagnostics; 