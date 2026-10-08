/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        agro: {
          green: "rgb(var(--agro-green) / <alpha-value>)",
          "green-dark": "rgb(var(--agro-green-dark) / <alpha-value>)",
          "green-light": "rgb(var(--agro-green-light) / <alpha-value>)",
          coffee: "rgb(var(--agro-coffee) / <alpha-value>)",
          orange: "rgb(var(--agro-orange) / <alpha-value>)",
          yellow: "rgb(var(--agro-yellow) / <alpha-value>)",
          blue: "rgb(var(--agro-blue) / <alpha-value>)",
          red: "rgb(var(--agro-red) / <alpha-value>)",
          cream: "rgb(var(--agro-cream) / <alpha-value>)",
          surface: "rgb(var(--agro-surface) / <alpha-value>)",
          text: "rgb(var(--agro-text) / <alpha-value>)",
          muted: "rgb(var(--agro-muted) / <alpha-value>)",
          line: "rgb(var(--agro-line) / <alpha-value>)",
          soft: "rgb(var(--agro-soft) / <alpha-value>)",
        },
      },

      fontFamily: {
        poppins: ["Poppins_400Regular"],
        "poppins-semibold": ["Poppins_600SemiBold"],
        "poppins-bold": ["Poppins_700Bold"],
        inter: ["Inter_400Regular"],
        "inter-medium": ["Inter_500Medium"],
        "inter-semibold": ["Inter_600SemiBold"],
      },

      borderRadius: {
        card: "24px",
        button: "16px",
      },
    },
  },
  plugins: [],
};
