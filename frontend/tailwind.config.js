/** @type {import('tailwindcss').Config} */
module.exports = {
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
          green: "#2F7D32",
          "green-dark": "#1F5A24",
          "green-light": "#EAF4E7",
          coffee: "#6B3518",
          orange: "#F28C00",
          yellow: "#F5B700",
          blue: "#2878C7",
          red: "#D32F2F",
          cream: "#F7F5ED",
          surface: "#FFFFFF",
          text: "#18201A",
          muted: "#68736B",
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