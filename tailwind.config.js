/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  theme: {
    extend: {
      colors: {
        "mauritania-green": "#00a95c",
        "mauritania-green-dark": "#007a45",
        "mauritania-gold": "#ffc72c",
      },
      fontFamily: {
        tajawal: ["Tajawal", "sans-serif"],
      },
    },
  },
  plugins: [],
  corePlugins: {
    textAlign: true, // Ensure RTL text alignment works
  },
};
