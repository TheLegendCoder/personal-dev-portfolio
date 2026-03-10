import type {Config} from 'tailwindcss';

export default {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        body: ['Inter', 'sans-serif'],
        headline: ['Inter', 'sans-serif'],
        code: ['monospace'],
      },
      screens: {
        'xs': '475px',
        '3xl': '1680px',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
        '144': '36rem',
      },
      minHeight: {
        'screen-75': '75vh',
        'screen-50': '50vh',
        'screen-25': '25vh',
      },
      maxWidth: {
        '8xl': '88rem',
        '9xl': '96rem',
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))',
        },
      },
      borderRadius: {
        'none': '0',
        'sm': 'calc(var(--radius) - 4px)',
        DEFAULT: 'var(--radius)',
        'md': 'calc(var(--radius) - 2px)',
        'lg': 'var(--radius)',
        'xl': '1.5rem',
        '2xl': '2rem',     // spec: 2rem
        '3xl': '3rem',     // spec: 3rem
        'full': '9999px',
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '1rem' }],
      },
      transitionProperty: {
        'height': 'height',
        'spacing': 'margin, padding',
      },
      aspectRatio: {
        '4/3': '4 / 3',
        '3/2': '3 / 2',
        '2/3': '2 / 3',
        '9/16': '9 / 16',
      },
      keyframes: {
        // Existing keyframes
        'accordion-down': {
          from: {
            height: '0',
          },
          to: {
            height: 'var(--radix-accordion-content-height)',
          },
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)',
          },
          to: {
            height: '0',
          },
        },
        'fade-in': {
          '0%': { 
            opacity: '0',
            transform: 'translateY(10px)'
          },
          '100%': { 
            opacity: '1',
            transform: 'translateY(0)'
          },
        },
        'slide-in-from-left': {
          '0%': { 
            transform: 'translateX(-100%)'
          },
          '100%': { 
            transform: 'translateX(0)'
          },
        },
        'slide-in-from-right': {
          '0%': { 
            transform: 'translateX(100%)'
          },
          '100%': { 
            transform: 'translateX(0)'
          },
        },
        // Playful entrance animations
        'bounce-in': {
          '0%': {
            opacity: '0',
            transform: 'scale(0.3)'
          },
          '50%': {
            opacity: '1',
            transform: 'scale(1.05)'
          },
          '70%': {
            transform: 'scale(0.9)'
          },
          '100%': {
            opacity: '1',
            transform: 'scale(1)'
          },
        },
        'bounce-up': {
          '0%': {
            opacity: '0',
            transform: 'translateY(30px) scale(0.9)'
          },
          '50%': {
            opacity: '1',
            transform: 'translateY(-5px) scale(1.02)'
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0) scale(1)'
          },
        },
        'bounce-down': {
          '0%': {
            opacity: '0',
            transform: 'translateY(-30px) scale(0.9)'
          },
          '50%': {
            opacity: '1',
            transform: 'translateY(5px) scale(1.02)'
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0) scale(1)'
          },
        },
        'cascade-in': {
          '0%': {
            opacity: '0',
            transform: 'translateY(20px)'
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)'
          },
        },
        // Spring and playful hover effects
        'spring-scale': {
          '0%': {
            transform: 'scale(1)'
          },
          '50%': {
            transform: 'scale(1.08)'
          },
          '100%': {
            transform: 'scale(1.05)'
          },
        },
        'elastic-scale': {
          '0%': {
            transform: 'scale(1)'
          },
          '30%': {
            transform: 'scale(1.1)'
          },
          '55%': {
            transform: 'scale(0.98)'
          },
          '70%': {
            transform: 'scale(1.04)'
          },
          '100%': {
            transform: 'scale(1)'
          },
        },
        // Floating and idle animations
        'float': {
          '0%, 100%': {
            transform: 'translateY(0px)'
          },
          '50%': {
            transform: 'translateY(-8px)'
          },
        },
        'gentle-float': {
          '0%, 100%': {
            transform: 'translateY(0px)'
          },
          '50%': {
            transform: 'translateY(-4px)'
          },
        },
        'pulse-glow': {
          '0%, 100%': {
            opacity: '1',
            boxShadow: '0 0 0 0 rgba(59, 130, 246, 0.7)'
          },
          '50%': {
            boxShadow: '0 0 0 10px rgba(59, 130, 246, 0)'
          },
        },
        'pulse-color': {
          '0%, 100%': {
            color: 'hsl(var(--primary))'
          },
          '50%': {
            color: 'hsl(160, 60%, 45%)'
          },
        },
        // Shimmer and loading effects
        'shimmer': {
          '0%': {
            backgroundPosition: '-1000px 0'
          },
          '100%': {
            backgroundPosition: '1000px 0'
          },
        },
        'skeleton-pulse': {
          '0%, 100%': {
            opacity: '1'
          },
          '50%': {
            opacity: '0.5'
          },
        },
        // Ripple effect for buttons
        'ripple': {
          '0%': {
            transform: 'scale(0)',
            opacity: '1'
          },
          '100%': {
            transform: 'scale(4)',
            opacity: '0'
          },
        },
        // Wiggle and playful movements
        'wiggle': {
          '0%, 100%': {
            transform: 'rotate(-1deg)'
          },
          '50%': {
            transform: 'rotate(1deg)'
          },
        },
        // Swipe animations
        'swipe-in-right': {
          '0%': {
            opacity: '0',
            transform: 'translateX(100px)'
          },
          '100%': {
            opacity: '1',
            transform: 'translateX(0)'
          },
        },
        'swipe-in-left': {
          '0%': {
            opacity: '0',
            transform: 'translateX(-100px)'
          },
          '100%': {
            opacity: '1',
            transform: 'translateX(0)'
          },
        },
        // Stagger child animations (used with delay)
        'stagger-child': {
          '0%': {
            opacity: '0',
            transform: 'translateY(10px)'
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)'
          },
        },
        // Parallax effect
        'parallax-up': {
          '0%': {
            transform: 'translateY(40px)',
            opacity: '0'
          },
          '100%': {
            transform: 'translateY(0)',
            opacity: '1'
          },
        },
        // Text reveal
        'text-reveal': {
          '0%': {
            opacity: '0',
            clipPath: 'inset(0 100% 0 0)'
          },
          '100%': {
            opacity: '1',
            clipPath: 'inset(0 0 0 0)'
          },
        },
      },
      animation: {
        // Existing animations
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.5s ease-out',
        'slide-in-left': 'slide-in-from-left 0.3s ease-out',
        'slide-in-right': 'slide-in-from-right 0.3s ease-out',
        
        // Playful entrance animations with bouncy easing
        'bounce-in': 'bounce-in 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'bounce-up': 'bounce-up 0.7s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'bounce-down': 'bounce-down 0.7s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'cascade-in': 'cascade-in 0.5s ease-out',
        
        // Spring and hover effects
        'spring-scale': 'spring-scale 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'elastic-scale': 'elastic-scale 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
        
        // Floating animations
        'float': 'float 3s ease-in-out infinite',
        'gentle-float': 'gentle-float 4s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s infinite',
        'pulse-color': 'pulse-color 2s ease-in-out infinite',
        
        // Loading states
        'shimmer': 'shimmer 2s infinite',
        'skeleton-pulse': 'skeleton-pulse 2s ease-in-out infinite',
        
        // Interactive effects
        'ripple': 'ripple 0.6s ease-out',
        'wiggle': 'wiggle 0.3s ease-in-out',
        
        // Page transitions
        'swipe-in-right': 'swipe-in-right 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'swipe-in-left': 'swipe-in-left 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
        
        // Stagger children
        'stagger-child': 'stagger-child 0.5s ease-out backwards',
        
        // Parallax and reveals
        'parallax-up': 'parallax-up 0.7s ease-out',
        'text-reveal': 'text-reveal 0.6s ease-out',
      },
      transitionTimingFunction: {
        'bounce': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'elastic': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
    require('@tailwindcss/typography'),
  ],
} satisfies Config;
