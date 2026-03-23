/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Space Grotesk", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["Fraunces", "ui-serif", "Georgia", "serif"],
      },
      colors: {
        ink: {
          900: "#121018",
          700: "#2d2438",
          500: "#5a5168",
        },
        dawn: {
          50: "#fff7ed",
          200: "#fddfca",
          400: "#f2a57f",
        },
        haze: {
          100: "#e9e6f1",
          200: "#d7d3e2",
          300: "#bdb6cf",
        },
      },
      boxShadow: {
        glow: "0 24px 60px -32px rgba(242, 165, 127, 0.65)",
        card: "0 18px 50px -28px rgba(18, 16, 24, 0.6)",
      },
    },
  },
  plugins: [],
}

