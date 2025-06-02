import React, { useState, useEffect } from 'react';
import { MessageCircle, X } from 'lucide-react';

const WhatsAppButton: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    // Show button after a delay
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleWhatsAppClick = () => {
    const phoneNumber = '966551064118';
    const message = encodeURIComponent('السلام عليكم، أريد الاستفسار عن منتجاتكم الطبية');
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  if (!isVisible) return null;

  return (
    <>
      {/* WhatsApp Button */}
      <div
        className={`fixed bottom-6 right-6 z-50 transition-all duration-500 transform ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0'
        }`}
      >
        <button
          onClick={handleWhatsAppClick}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="group relative bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-full p-4 shadow-2xl hover:shadow-green-500/25 transition-all duration-300 transform hover:scale-110 animate-bounce hover:animate-none"
          aria-label="تواصل معنا عبر WhatsApp"
        >
          {/* Ripple Effect */}
          <div className="absolute inset-0 rounded-full bg-green-400 opacity-20 animate-ping"></div>
          
          {/* Icon */}
          <div className="relative z-10">
            <MessageCircle className="w-7 h-7 group-hover:scale-110 transition-transform duration-300" />
          </div>

          {/* Notification Badge */}
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
            <span className="text-xs font-bold text-white">1</span>
          </div>
        </button>

        {/* Hover Tooltip */}
        <div
          className={`absolute bottom-full right-0 mb-3 transition-all duration-300 ${
            isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
          }`}
        >
          <div className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap shadow-xl">
            تواصل معنا عبر WhatsApp
            <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
          </div>
        </div>
      </div>

      {/* Chat Widget Popup (Optional) */}
      {isHovered && (
        <div className="fixed bottom-24 right-6 z-40 bg-white rounded-2xl shadow-2xl border border-gray-200 p-6 max-w-sm transform transition-all duration-300 animate-in slide-in-from-bottom-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-gray-900 mb-1">خدمة العملاء</h4>
              <p className="text-gray-600 text-sm mb-3">
                مرحباً! كيف يمكننا مساعدتك؟
              </p>
              <button
                onClick={handleWhatsAppClick}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
              >
                ابدأ المحادثة
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default WhatsAppButton;