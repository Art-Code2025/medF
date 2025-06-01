// Professional Navy Blue Theme for Medicine Company
export const professionalTheme = {
  // Primary Navy Blue Palette
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
  
  // Medical White & Gray Scale
  medical: {
    white: '#ffffff',
    snow: '#fafbfc',
    lightGray: '#f8fafc',
    gray: '#64748b',
    darkGray: '#475569',
    charcoal: '#334155',
    steel: '#1e293b'
  },
  
  // Professional Accent Colors
  accent: {
    emerald: '#059669', // Success/Health
    amber: '#d97706',   // Warning
    red: '#dc2626',     // Error/Critical
    blue: '#2563eb',    // Information
    teal: '#0891b2',    // Secondary actions
  },
  
  // Gradients for Professional Look
  gradients: {
    primary: 'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 50%, #2563eb 100%)',
    header: 'linear-gradient(90deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
    card: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
    button: 'linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%)',
    hero: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #1d4ed8 100%)'
  },
  
  // Professional Shadows
  shadows: {
    card: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    button: '0 10px 15px -3px rgba(30, 58, 138, 0.3), 0 4px 6px -2px rgba(30, 58, 138, 0.2)',
    nav: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    hero: '0 25px 50px -12px rgba(30, 58, 138, 0.25)'
  }
};

// Professional Typography
export const typography = {
  fonts: {
    primary: '"Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    heading: '"Poppins", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    mono: '"JetBrains Mono", "Fira Code", Consolas, monospace'
  },
  
  sizes: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
    '5xl': '3rem',
    '6xl': '3.75rem'
  }
};

// Professional Spacing
export const spacing = {
  container: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
  section: 'py-16 lg:py-24',
  card: 'p-6 lg:p-8',
  button: 'px-8 py-3'
};

export default professionalTheme; 