import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Package, Users, ShoppingCart, TrendingUp, Plus, Search, Filter, 
  Calendar, Download, Bell, Settings, Activity, Stethoscope, 
  BarChart3, PieChart, Eye, Edit, Trash2, Star, ChevronDown,
  RefreshCw, FileText, Award, Heart, Shield, Microscope, Crown,
  Zap, Target, Globe, Sparkles, Layers, Database, Code, MonitorPlay
} from 'lucide-react';
import { toast } from 'react-toastify';
import { buildImageUrl, apiCall, API_ENDPOINTS } from '../config/api';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  stock: number;
  categoryId: number;
  mainImage: string;
  detailedImages: string[];
}

interface Category {
  id: number;
  name: string;
  description: string;
  image: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  city?: string;
  createdAt: string;
}

interface Order {
  id: number;
  userId: number;
  total: number;
  status: string;
  createdAt: string;
  items: any[];
}

type TabType = 'overview' | 'products' | 'categories' | 'users' | 'orders';

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalCategories: 0,
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    lowStockProducts: 0
  });

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Get tab from URL params
    const urlParams = new URLSearchParams(location.search);
    const tab = urlParams.get('tab') as TabType;
    if (tab && ['overview', 'products', 'categories', 'users', 'orders'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [location]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [productsData, categoriesData, usersData] = await Promise.all([
        apiCall(API_ENDPOINTS.PRODUCTS),
        apiCall(API_ENDPOINTS.CATEGORIES),
        // For now, we'll just use empty array for users until the endpoint is available
        Promise.resolve([])
      ]);

      setProducts(productsData);
      setCategories(categoriesData);
      setUsers(usersData);

      // Calculate stats
      const lowStock = productsData.filter((p: Product) => p.stock < 10);
      setStats({
        totalProducts: productsData.length,
        totalCategories: categoriesData.length,
        totalUsers: usersData.length,
        totalOrders: 0, // Will be updated when orders API is available
        totalRevenue: productsData.reduce((sum: number, p: Product) => sum + (p.price * p.stock), 0),
        lowStockProducts: lowStock.length
      });

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('حدث خطأ في تحميل بيانات لوحة الإدارة');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    navigate(`/admin?tab=${tab}`);
  };

  const handleDeleteProduct = async (productId: number) => {
    if (!confirm('هل أنت متأكد من حذف هذا المنتج؟')) return;
    
    try {
      await apiCall(API_ENDPOINTS.PRODUCT_BY_ID(productId.toString()), {
        method: 'DELETE'
      });
      
      setProducts(prev => prev.filter(p => p.id !== productId));
      toast.success('تم حذف المنتج بنجاح');
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('حدث خطأ في حذف المنتج');
    }
  };

  const handleDeleteCategory = async (categoryId: number) => {
    if (!confirm('هل أنت متأكد من حذف هذا التصنيف؟')) return;
    
    try {
      await apiCall(API_ENDPOINTS.CATEGORY_BY_ID(categoryId.toString()), {
        method: 'DELETE'
      });
      
      setCategories(prev => prev.filter(c => c.id !== categoryId));
      toast.success('تم حذف التصنيف بنجاح');
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('حدث خطأ في حذف التصنيف');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-red-900 flex items-center justify-center relative overflow-hidden">
        {/* Animated particles */}
        <div className="absolute inset-0">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white/30 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${1 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>
        
        <div className="text-center relative z-10">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-red-500 to-purple-600 rounded-full mb-6 relative">
            <Crown className="w-12 h-12 text-white animate-pulse" />
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center animate-spin">
              <Sparkles className="w-4 h-4 text-yellow-800" />
            </div>
          </div>
          <div className="relative">
            <div className="w-20 h-20 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-6"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-red-500/30 border-b-red-500 rounded-full animate-spin mx-auto mt-2"></div>
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">جاري تحميل النظام الإداري المتقدم</h3>
          <p className="text-gray-300">تحضير لوحة الإدارة المتطورة...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-red-900">
      
      {/* Ultra Professional Header */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-purple-900 shadow-2xl border-b border-white/20 relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 via-purple-500/10 to-blue-500/10 animate-pulse"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex items-center justify-between h-24">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl transform hover:scale-110 transition-all duration-300">
                  <Crown className="w-8 h-8 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce">
                  <Zap className="w-3 h-3 text-yellow-800" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent">
                  لوحة الإدارة المتقدمة
                </h1>
                <p className="text-gray-300 text-lg font-medium">مواسم الطب - نظام إدارة ذكي</p>
                <div className="flex items-center gap-4 mt-1">
                  <div className="flex items-center gap-1">
                    <Shield className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400 text-sm">آمن</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Target className="w-4 h-4 text-blue-400" />
                    <span className="text-blue-400 text-sm">دقيق</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Globe className="w-4 h-4 text-purple-400" />
                    <span className="text-purple-400 text-sm">متطور</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-3 border border-white/20">
                <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
                <span className="text-white font-medium">نظام نشط</span>
              </div>
              
              <button className="p-3 text-white hover:text-yellow-300 hover:bg-white/10 rounded-xl transition-all duration-300 relative">
                <Bell className="w-6 h-6" />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">3</span>
                </div>
              </button>
              
              <button className="p-3 text-white hover:text-blue-300 hover:bg-white/10 rounded-xl transition-all duration-300">
                <Settings className="w-6 h-6" />
              </button>
              
              <button 
                onClick={loadData}
                className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-3 rounded-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 font-semibold"
              >
                <RefreshCw className="w-5 h-5" />
                <span className="hidden sm:block">تحديث البيانات</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Ultra Advanced Navigation Tabs */}
        <div className="bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 mb-8 relative overflow-hidden">
          {/* Background effects */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-red-500/5"></div>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 relative z-10">
            {[
              { key: 'overview', label: 'لوحة المؤشرات', icon: MonitorPlay, color: 'from-blue-600 to-cyan-600', accent: 'blue' },
              { key: 'products', label: 'إدارة المنتجات', icon: Package, color: 'from-purple-600 to-pink-600', accent: 'purple' },
              { key: 'categories', label: 'إدارة التصنيفات', icon: Layers, color: 'from-emerald-600 to-teal-600', accent: 'emerald' },
              { key: 'users', label: 'إدارة العملاء', icon: Users, color: 'from-orange-600 to-red-600', accent: 'orange' },
              { key: 'orders', label: 'إدارة الطلبات', icon: ShoppingCart, color: 'from-yellow-600 to-amber-600', accent: 'yellow' }
            ].map(({ key, label, icon: Icon, color, accent }) => (
              <button
                key={key}
                onClick={() => handleTabChange(key as TabType)}
                className={`group relative p-6 rounded-2xl transition-all duration-500 transform hover:scale-105 border-2 ${
                  activeTab === key
                    ? 'border-white/50 bg-white/20 shadow-2xl'
                    : 'border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/15'
                }`}
              >
                {/* Glow effect for active tab */}
                {activeTab === key && (
                  <div className={`absolute inset-0 bg-gradient-to-r ${color} opacity-20 rounded-2xl blur-xl`}></div>
                )}
                
                <div className="relative z-10">
                  <div className={`w-16 h-16 bg-gradient-to-r ${color} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl group-hover:shadow-2xl transition-all duration-300`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className={`font-bold text-center transition-colors duration-300 ${
                    activeTab === key ? 'text-white' : 'text-gray-300 group-hover:text-white'
                  }`}>
                    {label}
                  </h3>
                  
                  {/* Active indicator */}
                  {activeTab === key && (
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-white rounded-full"></div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Ultra Advanced Statistics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { title: 'إجمالي المنتجات', value: stats.totalProducts, icon: Package, color: 'from-blue-600 to-cyan-600', bgColor: 'from-blue-500/20 to-cyan-500/20' },
                { title: 'التصنيفات النشطة', value: stats.totalCategories, icon: Layers, color: 'from-purple-600 to-pink-600', bgColor: 'from-purple-500/20 to-pink-500/20' },
                { title: 'العملاء المسجلين', value: stats.totalUsers, icon: Users, color: 'from-emerald-600 to-teal-600', bgColor: 'from-emerald-500/20 to-teal-500/20' },
                { title: 'المنتجات قليلة المخزون', value: stats.lowStockProducts, icon: TrendingUp, color: 'from-red-600 to-pink-600', bgColor: 'from-red-500/20 to-pink-500/20' },
                { title: 'القيمة الإجمالية للمخزون', value: `${stats.totalRevenue.toLocaleString()} ر.س`, icon: Award, color: 'from-yellow-600 to-amber-600', bgColor: 'from-yellow-500/20 to-amber-500/20' },
                { title: 'معدل النمو الشهري', value: '+15%', icon: BarChart3, color: 'from-indigo-600 to-blue-600', bgColor: 'from-indigo-500/20 to-blue-500/20' },
              ].map((stat, index) => (
                <div key={index} className={`bg-gradient-to-br ${stat.bgColor} backdrop-blur-xl rounded-2xl p-8 border border-white/20 shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:scale-105 relative overflow-hidden group`}>
                  {/* Animated background */}
                  <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                  
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-6">
                      <div className={`w-16 h-16 bg-gradient-to-r ${stat.color} rounded-2xl flex items-center justify-center shadow-xl`}>
                        <stat.icon className="w-8 h-8 text-white" />
                      </div>
                      <Sparkles className="w-6 h-6 text-white/50 group-hover:text-white/80 transition-colors duration-300" />
                    </div>
                    
                    <h3 className="text-white/80 text-sm font-semibold mb-2">{stat.title}</h3>
                    <p className="text-3xl font-bold text-white mb-4">{stat.value}</p>
                    
                    {/* Progress bar */}
                    <div className="w-full bg-white/20 rounded-full h-2">
                      <div className={`bg-gradient-to-r ${stat.color} h-2 rounded-full`} style={{width: '75%'}}></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Advanced Activity Monitor */}
            <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-blue-500/5 to-purple-500/5"></div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-2xl font-bold text-white flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl flex items-center justify-center">
                      <Activity className="w-6 h-6 text-white" />
                    </div>
                    مراقب النشاط المباشر
                  </h3>
                  <div className="flex items-center gap-2 bg-emerald-500/20 rounded-full px-4 py-2">
                    <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
                    <span className="text-emerald-400 font-semibold">مباشر</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    {[
                      { icon: Plus, color: 'emerald', title: 'تم إضافة منتج جديد', desc: 'منذ 5 دقائق', time: 'الآن' },
                      { icon: Users, color: 'blue', title: 'عميل جديد انضم للمنصة', desc: 'منذ 15 دقيقة', time: 'مؤخراً' },
                      { icon: ShoppingCart, color: 'purple', title: 'طلب جديد تم استلامه', desc: 'منذ 30 دقيقة', time: 'حديث' },
                      { icon: Award, color: 'yellow', title: 'تحديث إعدادات النظام', desc: 'منذ ساعة', time: 'مكتمل' }
                    ].map((activity, index) => (
                      <div key={index} className="flex items-center gap-4 p-6 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all duration-300">
                        <div className={`w-14 h-14 bg-gradient-to-r from-${activity.color}-600 to-${activity.color}-500 rounded-2xl flex items-center justify-center shadow-xl`}>
                          <activity.icon className="w-7 h-7 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-white mb-1">{activity.title}</h4>
                          <p className="text-gray-300 text-sm">{activity.desc}</p>
                        </div>
                        <div className="text-right">
                          <span className={`text-${activity.color}-400 text-sm font-semibold`}>{activity.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Real-time chart placeholder */}
                  <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-2xl p-6 border border-white/10">
                    <h4 className="text-white font-bold mb-4 flex items-center gap-2">
                      <BarChart3 className="w-5 h-5" />
                      إحصائيات الأداء المباشر
                    </h4>
                    <div className="h-48 flex items-end justify-between gap-2">
                      {[...Array(12)].map((_, i) => (
                        <div key={i} className="bg-gradient-to-t from-blue-600 to-purple-600 rounded-t flex-1 transition-all duration-300 hover:from-purple-600 hover:to-pink-600" style={{height: `${Math.random() * 100 + 20}%`}}></div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="space-y-8">
            <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-blue-500/5 to-emerald-500/5"></div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-2xl font-bold text-white flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                      <Package className="w-6 h-6 text-white" />
                    </div>
                    إدارة المنتجات المتقدمة
                  </h3>
                  <Link
                    to="/admin/product/new"
                    className="flex items-center gap-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-8 py-4 rounded-2xl font-bold hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                  >
                    <Plus className="w-5 h-5" />
                    إضافة منتج جديد
                  </Link>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/20">
                        <th className="text-right py-6 px-8 font-bold text-white">المنتج</th>
                        <th className="text-right py-6 px-8 font-bold text-white">السعر</th>
                        <th className="text-right py-6 px-8 font-bold text-white">المخزون</th>
                        <th className="text-center py-6 px-8 font-bold text-white">الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.slice(0, 10).map((product) => (
                        <tr key={product.id} className="border-b border-white/10 hover:bg-white/5 transition-all duration-300">
                          <td className="py-6 px-8">
                            <div className="flex items-center gap-4">
                              <img
                                src={buildImageUrl(product.mainImage)}
                                alt={product.name}
                                className="w-16 h-16 object-cover rounded-xl border border-white/20 shadow-lg"
                              />
                              <div>
                                <p className="font-bold text-white mb-1">{product.name}</p>
                                <p className="text-gray-300 text-sm line-clamp-2">{product.description}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-6 px-8">
                            <span className="font-bold text-white text-lg">{product.price} ر.س</span>
                            {product.originalPrice && product.originalPrice > product.price && (
                              <span className="block text-sm text-gray-400 line-through">
                                {product.originalPrice} ر.س
                              </span>
                            )}
                          </td>
                          <td className="py-6 px-8">
                            <span className={`px-4 py-2 rounded-full text-sm font-bold ${
                              product.stock < 10 
                                ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            }`}>
                              {product.stock} قطعة
                            </span>
                          </td>
                          <td className="py-6 px-8">
                            <div className="flex items-center justify-center gap-3">
                              <Link
                                to={`/admin/product/${product.id}`}
                                className="p-3 text-blue-400 hover:bg-blue-500/20 rounded-xl transition-all duration-300 border border-blue-500/30 hover:border-blue-400"
                                title="تعديل"
                              >
                                <Edit className="w-5 h-5" />
                              </Link>
                              <button
                                onClick={() => handleDeleteProduct(product.id)}
                                className="p-3 text-red-400 hover:bg-red-500/20 rounded-xl transition-all duration-300 border border-red-500/30 hover:border-red-400"
                                title="حذف"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Categories Tab */}
        {activeTab === 'categories' && (
          <div className="space-y-8">
            <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-teal-500/5 to-cyan-500/5"></div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-2xl font-bold text-white flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl flex items-center justify-center">
                      <Layers className="w-6 h-6 text-white" />
                    </div>
                    إدارة التصنيفات المتقدمة
                  </h3>
                  <Link
                    to="/admin/category/new"
                    className="flex items-center gap-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-2xl font-bold hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                  >
                    <Plus className="w-5 h-5" />
                    إضافة تصنيف جديد
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {categories.map((category) => (
                    <div key={category.id} className="bg-gradient-to-br from-white/10 to-white/5 rounded-2xl overflow-hidden border border-white/20 hover:shadow-2xl transition-all duration-500 transform hover:scale-105 group">
                      <div className="relative h-56 overflow-hidden">
                        <img
                          src={buildImageUrl(category.image)}
                          alt={category.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                        <div className="absolute top-4 left-4 flex gap-3">
                          <Link
                            to={`/admin/category/${category.id}`}
                            className="p-3 bg-white/20 backdrop-blur-sm text-blue-400 rounded-xl hover:bg-blue-500/20 transition-all duration-300 border border-blue-500/30"
                            title="تعديل"
                          >
                            <Edit className="w-5 h-5" />
                          </Link>
                          <button
                            onClick={() => handleDeleteCategory(category.id)}
                            className="p-3 bg-white/20 backdrop-blur-sm text-red-400 rounded-xl hover:bg-red-500/20 transition-all duration-300 border border-red-500/30"
                            title="حذف"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                      <div className="p-6">
                        <h4 className="text-xl font-bold text-white mb-3">{category.name}</h4>
                        <p className="text-gray-300 text-sm line-clamp-3">{category.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-8">
            <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 via-red-500/5 to-pink-500/5"></div>
              
              <div className="relative z-10">
                <h3 className="text-2xl font-bold text-white mb-8 flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-orange-600 to-red-600 rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  إدارة العملاء المتقدمة
                </h3>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/20">
                        <th className="text-right py-6 px-8 font-bold text-white">العميل</th>
                        <th className="text-right py-6 px-8 font-bold text-white">البريد الإلكتروني</th>
                        <th className="text-right py-6 px-8 font-bold text-white">الهاتف</th>
                        <th className="text-right py-6 px-8 font-bold text-white">تاريخ التسجيل</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user.id} className="border-b border-white/10 hover:bg-white/5 transition-all duration-300">
                          <td className="py-6 px-8">
                            <div className="flex items-center gap-4">
                              <div className="w-14 h-14 bg-gradient-to-r from-orange-600 to-red-600 rounded-full flex items-center justify-center shadow-xl">
                                <span className="text-white font-bold text-lg">{user.name.charAt(0)}</span>
                              </div>
                              <div>
                                <p className="font-bold text-white text-lg">{user.name}</p>
                                <p className="text-gray-300 text-sm">{user.city}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-6 px-8 text-white font-medium">{user.email}</td>
                          <td className="py-6 px-8 text-white font-medium">{user.phone || 'غير محدد'}</td>
                          <td className="py-6 px-8 text-gray-300">
                            {new Date(user.createdAt).toLocaleDateString('ar-SA')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 via-amber-500/5 to-orange-500/5"></div>
            
            <div className="relative z-10">
              <h3 className="text-2xl font-bold text-white mb-8 flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-yellow-600 to-amber-600 rounded-xl flex items-center justify-center">
                  <ShoppingCart className="w-6 h-6 text-white" />
                </div>
                إدارة الطلبات المتقدمة
              </h3>
              
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gradient-to-r from-yellow-600 to-amber-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
                  <ShoppingCart className="w-12 h-12 text-white" />
                </div>
                <h4 className="text-2xl font-bold text-white mb-4">لا توجد طلبات حالياً</h4>
                <p className="text-gray-300 text-lg">سيتم عرض الطلبات هنا عند توفرها</p>
                <div className="mt-8">
                  <div className="inline-flex items-center gap-2 bg-yellow-500/20 rounded-full px-6 py-3 border border-yellow-500/30">
                    <Database className="w-5 h-5 text-yellow-400" />
                    <span className="text-yellow-400 font-semibold">نظام الطلبات جاهز للتشغيل</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard; 