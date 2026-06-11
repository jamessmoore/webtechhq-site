/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      screens: {
        nav: '601px',
      },
      colors: {
        brand: {
          bg:       '#030B18',
          'bg-hero':'#040C1C',
          'bg-card':'#071525',
          'bg-mark':'#071830',
          navy:     '#0E3A9A',
          blue:     '#3D7FD4',
          'blue-mid':'#2D5A9E',
          'blue-dim':'#1A3D7A',
          'blue-dark':'#162D5A',
          'blue-deep':'#0A1832',
          sky:      '#89D4FF',
          'sky-mid':'#7EC8F4',
          'sky-dim':'#5B90C8',
          white:    '#EEF6FF',
        },
      },
      fontFamily: {
        mono: ['"Courier New"', 'Courier', 'monospace'],
        sans: ['Arial', 'Helvetica', 'sans-serif'],
      },
      letterSpacing: {
        widest2: '0.25em',
        widest3: '0.35em',
      },
    },
  },
  plugins: [],
}
