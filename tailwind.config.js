/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      animation: {
        float: "float 4s ease-in-out infinite",
        "scale-in": "scale-in 0.6s ease-out forwards",
        "achievement-pulse": "achievement-pulse 2s infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": {
            transform: "translateY(0px) rotate(0deg)",
          },
          "50%": {
            transform: "translateY(-20px) rotate(180deg)",
          },
        },
        "scale-in": {
          "0%": {
            transform: "scale(0.5) rotate(-10deg)",
            opacity: "0",
          },
          "50%": {
            transform: "scale(1.05) rotate(5deg)",
            opacity: "0.8",
          },
          "100%": {
            transform: "scale(1) rotate(0deg)",
            opacity: "1",
          },
        },
        "achievement-pulse": {
          "0%, 100%": {
            transform: "scale(1)",
            boxShadow: "0 0 0 0 rgba(59, 130, 246, 0.7)",
          },
          "50%": {
            transform: "scale(1.05)",
            boxShadow: "0 0 0 10px rgba(59, 130, 246, 0)",
          },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
