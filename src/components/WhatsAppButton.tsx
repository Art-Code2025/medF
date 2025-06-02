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
      {/* WhatsApp Button - Responsive */}
      <div
        className={`fixed bottom-3 right-3 sm:bottom-4 sm:right-4 md:bottom-6 md:right-6 z-50 transition-all duration-500 transform ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0'
        }`}
      >
        <button
          onClick={handleWhatsAppClick}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="group relative bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-full p-3 sm:p-4 shadow-2xl hover:shadow-green-500/25 transition-all duration-300 transform hover:scale-110 animate-bounce hover:animate-none"
          aria-label="تواصل معنا عبر WhatsApp"
        >
          {/* Ripple Effect */}
          <div className="absolute inset-0 rounded-full bg-green-400 opacity-20 animate-ping"></div>
          
          {/* Icon - Responsive */}
          <div className="relative z-10">
            <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 group-hover:scale-110 transition-transform duration-300" />
          </div>

          {/* Notification Badge - Responsive */}
          <div className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 w-3 h-3 sm:w-4 sm:h-4 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
            <span className="text-xs font-bold text-white">1</span>
          </div>
        </button>

        {/* Hover Tooltip - Responsive */}
        <div
          className={`absolute bottom-full right-0 mb-2 sm:mb-3 transition-all duration-300 ${
            isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
          }`}
        >
          <div className="bg-gray-900 text-white px-2 py-1 sm:px-3 sm:py-2 md:px-4 md:py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap shadow-xl">
            تواصل معنا عبر WhatsApp
            <div className="absolute top-full right-2 sm:right-3 md:right-4 w-0 h-0 border-l-2 sm:border-l-4 border-r-2 sm:border-r-4 border-t-2 sm:border-t-4 border-transparent border-t-gray-900"></div>
          </div>
        </div>
      </div>

      {/* Chat Widget Popup - Responsive (hidden on very small screens) */}
      {isHovered && (
        <div className="hidden sm:block fixed bottom-16 right-3 sm:bottom-20 sm:right-4 md:bottom-24 md:right-6 z-40 bg-white rounded-xl sm:rounded-2xl shadow-2xl border border-gray-200 p-3 sm:p-4 md:p-6 max-w-xs sm:max-w-sm transform transition-all duration-300 animate-in slide-in-from-bottom-4">
          <div className="flex items-start gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
              <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-gray-900 mb-1 text-sm sm:text-base">خدمة العملاء</h4>
              <p className="text-gray-600 text-xs sm:text-sm mb-2 sm:mb-3">
                مرحباً! كيف يمكننا مساعدتك؟
              </p>
              <button
                onClick={handleWhatsAppClick}
                className="bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors duration-200"
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