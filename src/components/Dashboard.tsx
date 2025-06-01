import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Package, Users, ShoppingCart, TrendingUp, Plus, Search, Filter, 
  Calendar, Download, Bell, Settings, Activity, Stethoscope, 
  BarChart3, PieChart, Eye, Edit, Trash2, Star, ChevronDown,
  RefreshCw, FileText, Award, Heart, Shield, Microscope
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
        apiCall(API_ENDPOINTS.USERS)
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
    navigate(`/dashboard?tab=${tab}`);
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
      <div className="min-h-screen bg-gradient-to-br from-medical-light via-white to-medical-snow flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-medical-gray font-medium">جاري تحميل لوحة الإدارة...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-medical-light via-white to-medical-snow">
      
      {/* Header */}
      <div className="bg-gradient-header shadow-nav border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
                <Stethoscope className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">لوحة إدارة مواسم الطب</h1>
                <p className="text-gray-300 text-sm">إدارة شاملة للمنتجات الطبية</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <button className="p-2 text-white hover:text-blue-200 hover:bg-white/10 rounded-lg transition-all duration-200">
                <Bell className="w-5 h-5" />
              </button>
              <button className="p-2 text-white hover:text-blue-200 hover:bg-white/10 rounded-lg transition-all duration-200">
                <Settings className="w-5 h-5" />
              </button>
              <button 
                onClick={loadData}
                className="flex items-center gap-2 bg-accent-emerald text-white px-4 py-2 rounded-lg hover:bg-accent-emerald/90 transition-all duration-200"
              >
                <RefreshCw className="w-4 h-4" />
                تحديث
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Navigation Tabs */}
        <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-6 mb-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { key: 'overview', label: 'نظرة عامة', icon: BarChart3, color: 'bg-primary-500' },
              { key: 'products', label: 'المنتجات', icon: Package, color: 'bg-accent-blue' },
              { key: 'categories', label: 'التصنيفات', icon: FileText, color: 'bg-accent-emerald' },
              { key: 'users', label: 'العملاء', icon: Users, color: 'bg-accent-teal' },
              { key: 'orders', label: 'الطلبات', icon: ShoppingCart, color: 'bg-accent-amber' }
            ].map(({ key, label, icon: Icon, color }) => (
              <button
                key={key}
                onClick={() => handleTabChange(key as TabType)}
                className={`relative p-6 rounded-2xl transition-all duration-300 transform hover:scale-105 border-2 ${
                  activeTab === key
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 bg-white hover:border-primary-300'
                }`}
              >
                <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center mx-auto mb-3`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className={`font-semibold ${
                  activeTab === key ? 'text-primary-600' : 'text-medical-charcoal'
                }`}>
                  {label}
                </h3>
                {activeTab === key && (
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-primary-500 rounded-full"></div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-medical-gray text-sm font-medium">إجمالي المنتجات</p>
                    <p className="text-3xl font-bold text-medical-charcoal">{stats.totalProducts}</p>
                  </div>
                  <div className="w-12 h-12 bg-accent-blue rounded-xl flex items-center justify-center">
                    <Package className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-medical-gray text-sm font-medium">إجمالي التصنيفات</p>
                    <p className="text-3xl font-bold text-medical-charcoal">{stats.totalCategories}</p>
                  </div>
                  <div className="w-12 h-12 bg-accent-emerald rounded-xl flex items-center justify-center">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-medical-gray text-sm font-medium">إجمالي العملاء</p>
                    <p className="text-3xl font-bold text-medical-charcoal">{stats.totalUsers}</p>
                  </div>
                  <div className="w-12 h-12 bg-accent-teal rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-medical-gray text-sm font-medium">المنتجات قليلة المخزون</p>
                    <p className="text-3xl font-bold text-accent-red">{stats.lowStockProducts}</p>
                  </div>
                  <div className="w-12 h-12 bg-accent-red rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-medical-gray text-sm font-medium">القيمة الإجمالية</p>
                    <p className="text-3xl font-bold text-medical-charcoal">{stats.totalRevenue.toLocaleString()} ر.س</p>
                  </div>
                  <div className="w-12 h-12 bg-accent-amber rounded-xl flex items-center justify-center">
                    <Award className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-medical-gray text-sm font-medium">معدل النمو</p>
                    <p className="text-3xl font-bold text-accent-emerald">+15%</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
                    <Activity className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-6">
              <h3 className="text-xl font-bold text-medical-charcoal mb-6 flex items-center gap-3">
                <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                  <Activity className="w-4 h-4 text-white" />
                </div>
                النشاط الأخير
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-medical-light rounded-xl">
                  <div className="w-10 h-10 bg-accent-emerald rounded-full flex items-center justify-center">
                    <Plus className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-medical-charcoal">تم إضافة منتج جديد</p>
                    <p className="text-sm text-medical-gray">منذ 5 دقائق</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 p-4 bg-medical-light rounded-xl">
                  <div className="w-10 h-10 bg-accent-blue rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-medical-charcoal">عميل جديد انضم</p>
                    <p className="text-sm text-medical-gray">منذ 15 دقيقة</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 p-4 bg-medical-light rounded-xl">
                  <div className="w-10 h-10 bg-accent-amber rounded-full flex items-center justify-center">
                    <ShoppingCart className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-medical-charcoal">طلب جديد تم استلامه</p>
                    <p className="text-sm text-medical-gray">منذ 30 دقيقة</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-medical-charcoal flex items-center gap-3">
                  <div className="w-8 h-8 bg-accent-blue rounded-lg flex items-center justify-center">
                    <Package className="w-4 h-4 text-white" />
                  </div>
                  إدارة المنتجات
                </h3>
                <Link
                  to="/admin/product/new"
                  className="flex items-center gap-2 bg-gradient-primary text-white px-6 py-3 rounded-xl font-semibold hover:shadow-button transition-all duration-300 transform hover:scale-105"
                >
                  <Plus className="w-4 h-4" />
                  إضافة منتج جديد
                </Link>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-right py-4 px-6 font-semibold text-medical-charcoal">المنتج</th>
                      <th className="text-right py-4 px-6 font-semibold text-medical-charcoal">السعر</th>
                      <th className="text-right py-4 px-6 font-semibold text-medical-charcoal">المخزون</th>
                      <th className="text-center py-4 px-6 font-semibold text-medical-charcoal">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.slice(0, 10).map((product) => (
                      <tr key={product.id} className="border-b border-gray-100 hover:bg-medical-light transition-colors duration-200">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-4">
                            <img
                              src={buildImageUrl(product.mainImage)}
                              alt={product.name}
                              className="w-12 h-12 object-cover rounded-lg border border-gray-200"
                            />
                            <div>
                              <p className="font-medium text-medical-charcoal">{product.name}</p>
                              <p className="text-sm text-medical-gray line-clamp-1">{product.description}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className="font-bold text-medical-charcoal">{product.price} ر.س</span>
                          {product.originalPrice && product.originalPrice > product.price && (
                            <span className="block text-sm text-medical-gray line-through">
                              {product.originalPrice} ر.س
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-6">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            product.stock < 10 
                              ? 'bg-accent-red/10 text-accent-red' 
                              : 'bg-accent-emerald/10 text-accent-emerald'
                          }`}>
                            {product.stock} قطعة
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center justify-center gap-2">
                            <Link
                              to={`/admin/product/${product.id}`}
                              className="p-2 text-accent-blue hover:bg-accent-blue/10 rounded-lg transition-colors duration-200"
                              title="تعديل"
                            >
                              <Edit className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() => handleDeleteProduct(product.id)}
                              className="p-2 text-accent-red hover:bg-accent-red/10 rounded-lg transition-colors duration-200"
                              title="حذف"
                            >
                              <Trash2 className="w-4 h-4" />
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
        )}

        {/* Categories Tab */}
        {activeTab === 'categories' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-medical-charcoal flex items-center gap-3">
                  <div className="w-8 h-8 bg-accent-emerald rounded-lg flex items-center justify-center">
                    <FileText className="w-4 h-4 text-white" />
                  </div>
                  إدارة التصنيفات
                </h3>
                <Link
                  to="/admin/category/new"
                  className="flex items-center gap-2 bg-gradient-primary text-white px-6 py-3 rounded-xl font-semibold hover:shadow-button transition-all duration-300 transform hover:scale-105"
                >
                  <Plus className="w-4 h-4" />
                  إضافة تصنيف جديد
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map((category) => (
                  <div key={category.id} className="bg-medical-light rounded-2xl overflow-hidden border border-gray-200 hover:shadow-card transition-all duration-300">
                    <div className="relative h-48">
                      <img
                        src={buildImageUrl(category.image)}
                        alt={category.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 left-3 flex gap-2">
                        <Link
                          to={`/admin/category/${category.id}`}
                          className="p-2 bg-white/90 text-accent-blue rounded-lg hover:bg-white transition-colors duration-200"
                          title="تعديل"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDeleteCategory(category.id)}
                          className="p-2 bg-white/90 text-accent-red rounded-lg hover:bg-white transition-colors duration-200"
                          title="حذف"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="p-6">
                      <h4 className="text-lg font-bold text-medical-charcoal mb-2">{category.name}</h4>
                      <p className="text-medical-gray text-sm line-clamp-2">{category.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-6">
              <h3 className="text-xl font-bold text-medical-charcoal mb-6 flex items-center gap-3">
                <div className="w-8 h-8 bg-accent-teal rounded-lg flex items-center justify-center">
                  <Users className="w-4 h-4 text-white" />
                </div>
                إدارة العملاء
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-right py-4 px-6 font-semibold text-medical-charcoal">العميل</th>
                      <th className="text-right py-4 px-6 font-semibold text-medical-charcoal">البريد الإلكتروني</th>
                      <th className="text-right py-4 px-6 font-semibold text-medical-charcoal">الهاتف</th>
                      <th className="text-right py-4 px-6 font-semibold text-medical-charcoal">تاريخ التسجيل</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-b border-gray-100 hover:bg-medical-light transition-colors duration-200">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-accent-teal rounded-full flex items-center justify-center">
                              <span className="text-white font-semibold">{user.name.charAt(0)}</span>
                            </div>
                            <div>
                              <p className="font-medium text-medical-charcoal">{user.name}</p>
                              <p className="text-sm text-medical-gray">{user.city}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-medical-charcoal">{user.email}</td>
                        <td className="py-4 px-6 text-medical-charcoal">{user.phone || 'غير محدد'}</td>
                        <td className="py-4 px-6 text-medical-gray">
                          {new Date(user.createdAt).toLocaleDateString('ar-SA')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-6">
            <h3 className="text-xl font-bold text-medical-charcoal mb-6 flex items-center gap-3">
              <div className="w-8 h-8 bg-accent-amber rounded-lg flex items-center justify-center">
                <ShoppingCart className="w-4 h-4 text-white" />
              </div>
              إدارة الطلبات
            </h3>
            
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-medical-light rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingCart className="w-8 h-8 text-medical-gray" />
              </div>
              <h4 className="text-lg font-semibold text-medical-charcoal mb-2">لا توجد طلبات حالياً</h4>
              <p className="text-medical-gray">سيتم عرض الطلبات هنا عند توفرها</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard; 