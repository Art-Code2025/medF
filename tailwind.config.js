/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Professional Navy Blue Primary Colors
        primary: {
          50: '#f0f4ff',
          100: '#e0eaff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#1e3a8a', // Main Navy Blue
          600: '#1e40af',
          700: '#1d4ed8',
          800: '#1e3a8a',
          900: '#1e293b',
          950: '#0f172a'
        },
        
        // Medical Professional Colors
        medical: {
          white: '#ffffff',
          snow: '#fafbfc',
          light: '#f8fafc',
          gray: '#64748b',
          dark: '#475569',
          charcoal: '#334155',
          steel: '#1e293b'
        },
        
        // Professional Accent Colors
        accent: {
          emerald: '#059669',
          amber: '#d97706',
          red: '#dc2626',
          blue: '#2563eb',
          teal: '#0891b2'
        },
        cream: {
          50: '#f8f5f0', // اللون الكريمي الفاتح
          100: '#f0ece5',
        },
        gold: {
          500: '#d4af37', // ذهبي فاتح
          600: '#c19a2e', // ذهبي غامق شوية
          700: '#af8725', // ذهبي أغمق
        },
      },
      screens: {
        'xs': '475px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      fontSize: {
        'responsive-xs': 'clamp(0.75rem, 2vw, 0.875rem)',
        'responsive-sm': 'clamp(0.875rem, 2.5vw, 1rem)',
        'responsive-base': 'clamp(1rem, 3vw, 1.125rem)',
        'responsive-lg': 'clamp(1.125rem, 3.5vw, 1.25rem)',
        'responsive-xl': 'clamp(1.25rem, 4vw, 1.5rem)',
        'responsive-2xl': 'clamp(1.5rem, 5vw, 2rem)',
        'responsive-3xl': 'clamp(1.875rem, 6vw, 2.5rem)',
        'responsive-4xl': 'clamp(2.25rem, 7vw, 3rem)',
        'responsive-5xl': 'clamp(3rem, 8vw, 4rem)',
      },
      maxWidth: {
        'container-sm': '640px',
        'container-md': '768px',
        'container-lg': '1024px',
        'container-xl': '1280px',
        'container-2xl': '1536px',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.6s ease-out',
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 3s ease-in-out infinite'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' }
        }
      },
      // Professional Gradients
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 50%, #2563eb 100%)',
        'gradient-header': 'linear-gradient(90deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
        'gradient-card': 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
        'gradient-button': 'linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%)',
        'gradient-hero': 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #1d4ed8 100%)',
        'gradient-navy': 'linear-gradient(180deg, #1e3a8a 0%, #0f172a 100%)'
      },
      
      // Professional Shadows
      boxShadow: {
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'button': '0 10px 15px -3px rgba(30, 58, 138, 0.3), 0 4px 6px -2px rgba(30, 58, 138, 0.2)',
        'nav': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        'hero': '0 25px 50px -12px rgba(30, 58, 138, 0.25)',
        'professional': '0 20px 25px -5px rgba(30, 58, 138, 0.1), 0 10px 10px -5px rgba(30, 58, 138, 0.04)'
      },
      
      // Professional Typography
      fontFamily: {
        'primary': ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        'heading': ['Poppins', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        'mono': ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace']
      },
      
      // Professional Border Radius
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem'
      },
    },
  },
  plugins: [
    function({ addUtilities }) {
      const newUtilities = {
        '.container-responsive': {
          'width': '100%',
          'margin-left': 'auto',
          'margin-right': 'auto',
          'padding-left': '1rem',
          'padding-right': '1rem',
          '@screen sm': {
            'padding-left': '1.5rem',
            'padding-right': '1.5rem',
            'max-width': '640px',
          },
          '@screen md': {
            'padding-left': '2rem',
            'padding-right': '2rem',
            'max-width': '768px',
          },
          '@screen lg': {
            'padding-left': '2rem',
            'padding-right': '2rem',
            'max-width': '1024px',
          },
          '@screen xl': {
            'padding-left': '2.5rem',
            'padding-right': '2.5rem',
            'max-width': '1280px',
          },
          '@screen 2xl': {
            'max-width': '1536px',
          },
        },
        '.text-responsive': {
          'font-size': 'clamp(1rem, 2.5vw, 1.125rem)',
          'line-height': '1.6',
        },
        '.heading-responsive': {
          'font-size': 'clamp(1.5rem, 5vw, 2.5rem)',
          'line-height': '1.2',
          'font-weight': '700',
        },
        '.card-responsive': {
          'padding': '1rem',
          'border-radius': '0.75rem',
          '@screen sm': {
            'padding': '1.5rem',
            'border-radius': '1rem',
          },
          '@screen lg': {
            'padding': '2rem',
            'border-radius': '1.5rem',
          },
        },
        '.grid-responsive': {
          'display': 'grid',
          'grid-template-columns': 'repeat(1, minmax(0, 1fr))',
          'gap': '1rem',
          '@screen sm': {
            'grid-template-columns': 'repeat(2, minmax(0, 1fr))',
            'gap': '1.5rem',
          },
          '@screen md': {
            'grid-template-columns': 'repeat(3, minmax(0, 1fr))',
          },
          '@screen lg': {
            'grid-template-columns': 'repeat(4, minmax(0, 1fr))',
            'gap': '2rem',
          },
        },
      }
      addUtilities(newUtilities)
    }
  ],
}