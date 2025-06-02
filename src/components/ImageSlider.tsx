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
  height = 'h-[50vh] sm:h-[60vh] lg:h-[70vh]'
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
          <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">جاري تحميل الصور...</p>
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

      {/* Content Overlay */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center text-white max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`transform transition-all duration-1000 ${
            currentSlide >= 0 ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
          }`}>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-4 leading-tight">
              <span className="bg-gradient-to-r from-white via-red-100 to-white bg-clip-text text-transparent">
                {slides[currentSlide]?.title}
              </span>
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl mb-8 text-gray-200 font-medium max-w-2xl mx-auto leading-relaxed">
              {slides[currentSlide]?.subtitle}
            </p>
            {slides[currentSlide]?.buttonText && slides[currentSlide]?.buttonLink && (
              <a
                href={slides[currentSlide].buttonLink}
                className="inline-flex items-center gap-3 bg-gradient-to-r from-red-600 via-rose-500 to-red-700 hover:from-red-700 hover:via-rose-600 hover:to-red-800 text-white font-bold px-8 py-4 rounded-full shadow-2xl transform hover:scale-105 transition-all duration-300 border border-white/20 backdrop-blur-sm"
              >
                <span>{slides[currentSlide].buttonText}</span>
                <ChevronLeft className="w-5 h-5" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      {showArrows && slides.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 sm:left-6 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-3 sm:p-4 rounded-full shadow-2xl transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110 border border-white/30"
            aria-label="الصورة السابقة"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 sm:right-6 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-3 sm:p-4 rounded-full shadow-2xl transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110 border border-white/30"
            aria-label="الصورة التالية"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </>
      )}

      {/* Dots Indicator */}
      {showDots && slides.length > 1 && (
        <div className="absolute bottom-4 sm:bottom-6 left-1/2 transform -translate-x-1/2 flex gap-2 sm:gap-3">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full transition-all duration-300 border-2 border-white/50 ${
                index === currentSlide
                  ? 'bg-white scale-125 shadow-lg'
                  : 'bg-white/30 hover:bg-white/50 hover:scale-110'
              }`}
              aria-label={`انتقل للصورة ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Auto Play Controls */}
      {autoPlay && slides.length > 1 && (
        <button
          onClick={toggleAutoPlay}
          className="absolute top-4 right-4 sm:top-6 sm:right-6 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-2 sm:p-3 rounded-full shadow-lg transition-all duration-300 opacity-0 group-hover:opacity-100 border border-white/30"
          aria-label={isPlaying ? 'إيقاف التشغيل التلقائي' : 'تشغيل التشغيل التلقائي'}
        >
          {isPlaying ? (
            <Pause className="w-4 h-4 sm:w-5 sm:h-5" />
          ) : (
            <Play className="w-4 h-4 sm:w-5 sm:h-5" />
          )}
        </button>
      )}

      {/* Progress Bar */}
      {isPlaying && slides.length > 1 && (
        <div className="absolute bottom-0 left-0 w-full h-1 bg-white/20">
          <div
            className="h-full bg-gradient-to-r from-red-500 to-rose-600 transition-all duration-300"
            style={{
              width: `${((currentSlide + 1) / slides.length) * 100}%`
            }}
          />
        </div>
      )}

      {/* Slide Counter */}
      <div className="absolute top-4 left-4 sm:top-6 sm:left-6 bg-black/50 backdrop-blur-sm text-white px-3 py-1 sm:px-4 sm:py-2 rounded-full text-sm font-medium border border-white/20">
        {currentSlide + 1} / {slides.length}
      </div>
    </div>
  );
};

export default ImageSlider;