import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ArrowRight, Plus, Minus, X, Upload, Image as ImageIcon, Save, Eye, Package, Tag, DollarSign, Hash, FileText, Layers } from 'lucide-react';
import { buildImageUrl, apiCall, API_ENDPOINTS, buildApiUrl } from '../config/api';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  stock: number;
  categoryId: number | null;
  mainImage: string;
  detailedImages: string[];
}

interface Category {
  id: number;
  name: string;
  description: string;
  image: string;
}

const ProductForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [product, setProduct] = useState<Product>({
    id: 0,
    name: '',
    description: '',
    price: 0,
    originalPrice: undefined,
    stock: 0,
    categoryId: null,
    mainImage: '',
    detailedImages: []
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [mainImagePreview, setMainImagePreview] = useState<string>('');
  const [detailedImagesPreviews, setDetailedImagesPreviews] = useState<string[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  // دالة لتحويل ملف إلى base64
  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  useEffect(() => {
    const loadData = async () => {
      // Load categories
      try {
        const data = await apiCall(API_ENDPOINTS.CATEGORIES);
        setCategories(data);
      } catch (error) {
        console.error('Error fetching categories:', error);
        toast.error('فشل في جلب التصنيفات');
      }

      if (isEditing) {
        setLoading(true);
        try {
          const data = await apiCall(API_ENDPOINTS.PRODUCT_BY_ID(id!));
          setProduct(data);
          setLoading(false);
        } catch (error) {
          console.error('Error fetching product:', error);
          toast.error(error instanceof Error ? error.message : 'حدث خطأ');
          setLoading(false);
          navigate('/admin');
        }
      }
    };

    loadData();
  }, [id, isEditing, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'price' || name === 'originalPrice') {
      const numericValue = value.replace(/[^0-9.]/g, '');
      setProduct(prev => ({ 
        ...prev, 
        [name]: numericValue ? parseFloat(numericValue) : 0 
      }));
    } else if (name === 'categoryId') {
      setProduct(prev => ({ 
        ...prev, 
        [name]: value ? parseInt(value) : null 
      }));
    } else {
      setProduct(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const productData = {
        name: product.name,
        description: product.description,
        price: product.price.toString(),
        originalPrice: product.originalPrice?.toString() || '',
        stock: product.stock.toString(),
        categoryId: product.categoryId?.toString() || '',
        mainImage: mainImagePreview || product.mainImage,
        detailedImages: detailedImagesPreviews.length > 0 ? detailedImagesPreviews : product.detailedImages
      };

      let response;
      if (id) {
        // تعديل منتج موجود
        response = await fetch(buildApiUrl(API_ENDPOINTS.PRODUCT_BY_ID(id)), {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(productData),
        });
      } else {
        // إضافة منتج جديد
        response = await fetch(buildApiUrl(API_ENDPOINTS.PRODUCTS), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(productData),
        });
      }

      if (response.ok) {
        const data = await response.json();
        toast.success(id ? 'تم تحديث المنتج بنجاح!' : 'تم إضافة المنتج بنجاح!', {
          position: "top-center",
          autoClose: 3000,
          style: {
            background: 'linear-gradient(135deg, #1e3a8a, #1d4ed8)',
            color: 'white',
            fontWeight: 'bold'
          }
        });
        navigate('/admin');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'حدث خطأ أثناء حفظ المنتج');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error(error instanceof Error ? error.message : 'حدث خطأ أثناء حفظ المنتج');
    } finally {
      setSubmitting(false);
    }
  };

  const handleMainImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        // التحقق من نوع الملف
        if (!file.type.startsWith('image/')) {
          toast.error('يرجى اختيار ملف صورة صحيح');
          return;
        }
        
        // التحقق من حجم الملف (5MB)
        if (file.size > 5 * 1024 * 1024) {
          toast.error('حجم الصورة كبير جداً. الحد الأقصى 5MB');
          return;
        }

        const base64 = await convertFileToBase64(file);
        setMainImagePreview(base64);
        toast.success('تم تحميل الصورة بنجاح');
      } catch (error) {
        console.error('Error converting image:', error);
        toast.error('خطأ في تحميل الصورة');
      }
    }
  };

  const handleDetailedImagesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    try {
      // التحقق من عدد الملفات
      if (files.length > 5) {
        toast.error('يمكنك رفع حد أقصى 5 صور');
        return;
      }

      const base64Images: string[] = [];
      for (const file of files) {
        // التحقق من نوع الملف
        if (!file.type.startsWith('image/')) {
          toast.error(`الملف ${file.name} ليس صورة صحيحة`);
          continue;
        }
        
        // التحقق من حجم الملف
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`الصورة ${file.name} كبيرة جداً. الحد الأقصى 5MB`);
          continue;
        }

        const base64 = await convertFileToBase64(file);
        base64Images.push(base64);
      }

      setDetailedImagesPreviews(base64Images);
      toast.success(`تم تحميل ${base64Images.length} صورة بنجاح`);
    } catch (error) {
      console.error('Error converting images:', error);
      toast.error('خطأ في تحميل الصور');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-medical-light via-white to-medical-snow flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-medical-gray font-medium">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-medical-light via-white to-medical-snow">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-medical-charcoal">
                  {isEditing ? 'تعديل المنتج' : 'إضافة منتج جديد'}
                </h1>
                <p className="text-medical-gray">
                  {isEditing ? 'قم بتحديث بيانات المنتج' : 'أدخل بيانات المنتج الطبي الجديد'}
                </p>
              </div>
            </div>
            
            <button
              onClick={() => navigate('/admin')}
              className="flex items-center gap-2 px-4 py-2 text-medical-gray hover:text-medical-charcoal transition-colors duration-200"
            >
              <ArrowRight className="w-4 h-4" />
              <span>العودة</span>
            </button>
          </div>
        </div>

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Left Column - Basic Info */}
            <div className="space-y-6">
              {/* Product Basic Info */}
              <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-6">
                <h3 className="text-xl font-bold text-medical-charcoal mb-6 flex items-center gap-3">
                  <div className="w-8 h-8 bg-accent-blue rounded-lg flex items-center justify-center">
                    <Tag className="w-4 h-4 text-white" />
                  </div>
                  المعلومات الأساسية
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-medical-charcoal mb-2">
                      اسم المنتج *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={product.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                      placeholder="أدخل اسم المنتج الطبي"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-medical-charcoal mb-2">
                      وصف المنتج
                    </label>
                    <textarea
                      name="description"
                      value={product.description}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                      placeholder="أدخل وصف تفصيلي للمنتج الطبي"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-medical-charcoal mb-2">
                      التصنيف *
                    </label>
                    <select
                      name="categoryId"
                      value={product.categoryId || ''}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                    >
                      <option value="">اختر التصنيف</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Pricing & Stock */}
              <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-6">
                <h3 className="text-xl font-bold text-medical-charcoal mb-6 flex items-center gap-3">
                  <div className="w-8 h-8 bg-accent-emerald rounded-lg flex items-center justify-center">
                    <DollarSign className="w-4 h-4 text-white" />
                  </div>
                  السعر والمخزون
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-medical-charcoal mb-2">
                      السعر *
                    </label>
                    <input
                      type="text"
                      name="price"
                      value={product.price || ''}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-medical-charcoal mb-2">
                      السعر الأصلي (اختياري)
                    </label>
                    <input
                      type="text"
                      name="originalPrice"
                      value={product.originalPrice || ''}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-semibold text-medical-charcoal mb-2">
                    المخزون *
                  </label>
                  <input
                    type="text"
                    name="stock"
                    value={product.stock || ''}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, '');
                      setProduct(prev => ({ ...prev, stock: value ? parseInt(value) : 0 }));
                    }}
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                    placeholder="عدد القطع المتوفرة"
                  />
                </div>
              </div>
            </div>

            {/* Right Column - Images */}
            <div className="space-y-6">
              {/* Main Image */}
              <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-6">
                <h3 className="text-xl font-bold text-medical-charcoal mb-6 flex items-center gap-3">
                  <div className="w-8 h-8 bg-accent-amber rounded-lg flex items-center justify-center">
                    <ImageIcon className="w-4 h-4 text-white" />
                  </div>
                  الصورة الرئيسية
                </h3>
                
                <div className="space-y-4">
                  {product.mainImage && !mainImagePreview && (
                    <div className="relative">
                      <img
                        src={buildImageUrl(product.mainImage)}
                        alt="الصورة الرئيسية"
                        className="w-full h-48 object-cover rounded-xl border border-gray-200"
                      />
                      <div className="absolute top-2 right-2 bg-primary-500 text-white px-2 py-1 rounded-lg text-xs">
                        الصورة الحالية
                      </div>
                    </div>
                  )}
                  
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-primary-500 transition-colors duration-200">
                    <input
                      type="file"
                      id="mainImage"
                      accept="image/*"
                      onChange={handleMainImageChange}
                      className="hidden"
                    />
                    <label htmlFor="mainImage" className="cursor-pointer">
                      <div className="flex flex-col items-center">
                        <Upload className="w-8 h-8 text-medical-gray mb-2" />
                        <p className="text-sm font-medium text-medical-charcoal">
                          {mainImagePreview ? 'تم تحميل الصورة' : 'اختر صورة رئيسية'}
                        </p>
                        <p className="text-xs text-medical-gray mt-1">
                          PNG, JPG, JPEG (حد أقصى 5MB)
                        </p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Detailed Images */}
              <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-6">
                <h3 className="text-xl font-bold text-medical-charcoal mb-6 flex items-center gap-3">
                  <div className="w-8 h-8 bg-accent-teal rounded-lg flex items-center justify-center">
                    <Layers className="w-4 h-4 text-white" />
                  </div>
                  صور تفصيلية
                </h3>
                
                <div className="space-y-4">
                  {product.detailedImages && product.detailedImages.length > 0 && detailedImagesPreviews.length === 0 && (
                    <div className="grid grid-cols-2 gap-3">
                      {product.detailedImages.map((image, index) => (
                        <div key={index} className="relative">
                          <img
                            src={buildImageUrl(image)}
                            alt={`صورة تفصيلية ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg border border-gray-200"
                          />
                          <div className="absolute top-1 right-1 bg-primary-500 text-white px-1 py-0.5 rounded text-xs">
                            {index + 1}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-primary-500 transition-colors duration-200">
                    <input
                      type="file"
                      id="detailedImages"
                      multiple
                      accept="image/*"
                      onChange={handleDetailedImagesChange}
                      className="hidden"
                    />
                    <label htmlFor="detailedImages" className="cursor-pointer">
                      <div className="flex flex-col items-center">
                        <Upload className="w-8 h-8 text-medical-gray mb-2" />
                        <p className="text-sm font-medium text-medical-charcoal">
                          {detailedImagesPreviews.length > 0 
                            ? `تم اختيار ${detailedImagesPreviews.length} صور` 
                            : 'اختر صور تفصيلية'
                          }
                        </p>
                        <p className="text-xs text-medical-gray mt-1">
                          يمكنك اختيار عدة صور (اختياري)
                        </p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => navigate('/admin')}
                className="px-6 py-3 border border-gray-300 rounded-xl text-medical-gray hover:text-medical-charcoal hover:border-gray-400 transition-all duration-200"
              >
                إلغاء
              </button>

              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 px-8 py-3 bg-gradient-primary text-white rounded-xl hover:shadow-button transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>جاري الحفظ...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>{isEditing ? 'حفظ التغييرات' : 'إضافة المنتج'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;