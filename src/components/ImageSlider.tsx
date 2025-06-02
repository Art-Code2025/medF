import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';
// تأكد أن مسار ملف الـ CSS هذا صحيح، وأنه لا يحتوي على ستايلات تتعارض مع أسهم السلايدر
// import '../styles/mobile-slider.css'; 

interface SlideData {
  id: number;
  image: string;
  title: string;
  subtitle: string;
  buttonText?: string;
  buttonLink?: string;
}

interface ImageSliderProps {
  slides: SlideData[];
  autoPlay?: boolean;
  autoPlayInterval?: number;
  showDots?: boolean;
  showArrows?: boolean;
  height?: string;
}

const ImageSlider: React.FC<ImageSliderProps> = ({
  slides,
  autoPlay = true,
  autoPlayInterval = 5000,
  showDots = true,
  showArrows = true,
  height = 'h-[40vh] sm:h-[50vh] md:h-[60vh] lg:h-[70vh]'
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isLoading, setIsLoading] = useState(true);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const toggleAutoPlay = () => {
    setIsPlaying(!isPlaying);
  };

  // Auto play functionality
  useEffect(() => {
    if (isPlaying && slides.length > 1) {
      const interval = setInterval(nextSlide, autoPlayInterval);
      return () => clearInterval(interval);
    }
  }, [isPlaying, nextSlide, autoPlayInterval, slides.length]);

  // Preload images
  useEffect(() => {
    const imagePromises = slides.map((slide) => {
      return new Promise<void>((resolve) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = () => resolve(); // Continue even if image fails to load
        img.src = slide.image;
      });
    });

    Promise.all(imagePromises).then(() => {
      setIsLoading(false);
    });
  }, [slides]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        nextSlide();
      } else if (e.key === 'ArrowRight') {
        prevSlide();
      } else if (e.key === ' ') {
        e.preventDefault();
        toggleAutoPlay();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [nextSlide, prevSlide]);

  if (isLoading) {
    return (
      <div className={`${height} bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse flex items-center justify-center`}>
        <div className="text-center">
          <div className="w-8 h-8 sm:w-12 sm:h-12 md:w-16 md:h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-2 sm:mb-4"></div>
          <p className="text-gray-600 font-medium text-sm sm:text-base">جاري تحميل الصور...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${height} overflow-hidden group bg-gray-900`}>
      {/* Background Slides */}
      <div className="relative w-full h-full">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
              index === currentSlide 
                ? 'opacity-100 scale-100' 
                : 'opacity-0 scale-105'
            }`}
          >
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover"
              loading={index === 0 ? 'eager' : 'lazy'}
            />
            
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/40"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
          </div>
        ))}
      </div>

      {/* Content Overlay - Responsive */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center text-white max-w-4xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8">
          <div className={`transform transition-all duration-1000 ${
            currentSlide >= 0 ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
          }`}>
            <h1 className="text-lg sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-black mb-2 sm:mb-3 md:mb-4 leading-tight">
              <span className="bg-gradient-to-r from-white via-red-100 to-white bg-clip-text text-transparent">
                {slides[currentSlide]?.title}
              </span>
            </h1>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl mb-4 sm:mb-6 md:mb-8 text-gray-200 font-medium max-w-2xl mx-auto leading-relaxed">
              {slides[currentSlide]?.subtitle}
            </p>
            {slides[currentSlide]?.buttonText && slides[currentSlide]?.buttonLink && (
              <a
                href={slides[currentSlide].buttonLink}
                className="inline-flex items-center gap-1 sm:gap-2 md:gap-3 bg-gradient-to-r from-red-600 via-rose-500 to-red-700 hover:from-red-700 hover:via-rose-600 hover:to-red-800 text-white font-bold px-3 py-2 sm:px-4 sm:py-2 md:px-6 md:py-3 lg:px-8 lg:py-4 rounded-full shadow-2xl transform hover:scale-105 transition-all duration-300 border border-white/20 backdrop-blur-sm text-xs sm:text-sm md:text-base"
              >
                <span>{slides[currentSlide].buttonText}</span>
                <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Arrows - Responsive */}
      {showArrows && slides.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-1 sm:left-2 md:left-4 lg:left-6 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-2 sm:p-3 md:p-4 rounded-full shadow-2xl transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110 border border-white/30"
            aria-label="الصورة السابقة"
          >
            <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 lg:w-6 lg:h-6" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-1 sm:right-2 md:right-4 lg:right-6 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-2 sm:p-3 md:p-4 rounded-full shadow-2xl transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110 border border-white/30"
            aria-label="الصورة التالية"
          >
            <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 lg:w-6 lg:h-6" />
          </button>
        </>
      )}

      {/* Dots Indicator - Responsive */}
      {showDots && slides.length > 1 && (
        <div className="absolute bottom-2 sm:bottom-3 md:bottom-4 lg:bottom-6 left-1/2 transform -translate-x-1/2 flex gap-1 sm:gap-2 md:gap-3">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 sm:w-3 sm:h-3 md:w-4 md:h-4 rounded-full transition-all duration-300 border-2 border-white/50 ${
                index === currentSlide
                  ? 'bg-white scale-125 shadow-lg'
                  : 'bg-white/30 hover:bg-white/50 hover:scale-110'
              }`}
              aria-label={`انتقل للصورة ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Auto Play Controls - Responsive */}
      {autoPlay && slides.length > 1 && (
        <button
          onClick={toggleAutoPlay}
          className="absolute top-2 right-2 sm:top-3 sm:right-3 md:top-4 md:right-4 lg:top-6 lg:right-6 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-1.5 sm:p-2 md:p-3 rounded-full shadow-lg transition-all duration-300 opacity-0 group-hover:opacity-100 border border-white/30"
          aria-label={isPlaying ? 'إيقاف التشغيل التلقائي' : 'تشغيل التشغيل التلقائي'}
        >
          {isPlaying ? (
            <Pause className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
          ) : (
            <Play className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
          )}
        </button>
      )}

      {/* Progress Bar */}
      {isPlaying && slides.length > 1 && (
        <div className="absolute bottom-0 left-0 w-full h-0.5 sm:h-1 bg-white/20">
          <div
            className="h-full bg-gradient-to-r from-red-500 to-rose-600 transition-all duration-300"
            style={{
              width: `${((currentSlide + 1) / slides.length) * 100}%`
            }}
          />
        </div>
      )}

      {/* Slide Counter - Responsive */}
      <div className="absolute top-2 left-2 sm:top-3 sm:left-3 md:top-4 md:left-4 lg:top-6 lg:left-6 bg-black/50 backdrop-blur-sm text-white px-2 py-1 sm:px-3 sm:py-1 md:px-4 md:py-2 rounded-full text-xs sm:text-sm font-medium border border-white/20">
        {currentSlide + 1} / {slides.length}
      </div>
    </div>
  );
};

export default ImageSlider;