/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: '#F3F0EA',
        paper: '#FBF9F5',
        ink: '#1C1B19',
        soft: '#6F6A62',
        line: '#E4DDD2',
        green: '#1F4D3A',
        brass: '#A6844A',
        clay: '#C4623A',
        over: '#9C3B2E',
        good: '#2E6B4F',
      },
      fontFamily: {
        sans: ['"IBM Plex Sans Thai"', 'sans-serif'],
      },
      borderRadius: {
        'card': '16px',
        'btn': '12px',
      },
      height: {
        'btn': '52px',
        'tab': '56px',
      },
      transitionDuration: {
        'forma': '240ms',
      },
      transitionTimingFunction: {
        'forma': 'cubic-bezier(0.2, 0, 0, 1)',
      }
    },
  },
  plugins: [],
};
