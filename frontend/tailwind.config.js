/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gov: {
          primary: '#0B3B60',    // Deep Indian Government Navy
          secondary: '#1A5F7A',  // Teal Blue
          accent: '#FF9933',     // Saffron / India Gold Accent
          green: '#138808',      // Ashoka Green Accent
          light: '#F8FAFC',      // Slate light
          card: '#FFFFFF',
          dark: '#0F172A',
          muted: '#64748B',
          border: '#E2E8F0',
        },
        competency: {
          statistical: '#3B82F6',
          technical: '#8B5CF6',
          digital: '#10B981',
          behavioural: '#F59E0B',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'gov-sm': '0 1px 3px 0 rgba(11, 59, 96, 0.08), 0 1px 2px -1px rgba(11, 59, 96, 0.08)',
        'gov-md': '0 4px 6px -1px rgba(11, 59, 96, 0.1), 0 2px 4px -2px rgba(11, 59, 96, 0.1)',
        'gov-lg': '0 10px 15px -3px rgba(11, 59, 96, 0.12), 0 4px 6px -4px rgba(11, 59, 96, 0.12)',
      }
    },
  },
  plugins: [],
}
