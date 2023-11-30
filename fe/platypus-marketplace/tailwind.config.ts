/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      transitionProperty: {
        width: "width",
      },
      gridTemplateColumns: {
        "2-prod-card": "repeat(auto-fit, 160px)",
        "4-prod-card": "repeat(auto-fit, 190px)",
        "6-prod-card": "repeat(auto-fit, 200px))",
        "4-search-card": "repeat(auto-fit, 170px)",
        "6-search-card": "repeat(auto-fit, 180px)",
        "base-rec-card": "repeat(auto-fit, 150px)",
        "md-rec-card": "repeat(auto-fit, 185px)",
        "xl-rec-card": "repeat(auto-fit, 210px)",
        "3-merchant-card": "repeat(3, 195px)",
        "4-merchant-card": "repeat(4, 200px)",
        "6-merchant-card": "repeat(6, 200px)",
        "5-merchant-card": "repeat(5, 200px)",
        "repeat-fill-m": "repeat(auto-fill, minmax(150px, 1fr))",
        "repeat-fill-s": "repeat(auto-fill, minmax(100px, 1fr))",
      },
      gridAutoColumns: {
        "repeat-cat-m": "minmax(150px, 1fr)",
        "repeat-cat-s": "minmax(100px, 1fr)",
      },
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
      translate: {
        "2full": "200%",
        "3full": "300%",
        "4full": "400%",
        "5full": "500%",
        "6full": "600%",
      },
      boxShadow: {
        "huge-up": "0px 4px 3px 0px rgba(0, 0, 0, 0.75)",
        "drop-line-sm": "0px 0px 3px 0px rgba(0,0,0,0.25)",
        "drop-line": "0px 0px 5px 0px rgba(0,0,0,0.25)",
        "drop-line-lg": "0px 0px 10px 0px rgba(0,0,0,0.25)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
        quantum_bouncing: {
          "0%": { opacity: "0%", transform: "scale(0)", visibility: "visible" },
          "50%": {
            opacity: "0%",
            transform: "scale(0)",
            visibility: "visible",
          },
          "80%": { opacity: "100%", transform: "scale(1.2)" },
          "100%": { opacity: "100%", transform: "scale(1)" },
        },
        slide_full_right: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(100%)" },
        },
        slide_right_to_left: {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0%)" },
        },
        slide_bottom_to_top: {
          "0%": { transform: "translateY(100%)" },
          "100%": { transform: "translateY(0%)" },
        },
        move_up: {
          "0%": { transform: "translateY(0)", opacity: "1" },
          "50%": {
            transform: "translateY(-100%) rotate(180deg)",
            opacity: "0",
          },
          "51%": { transform: "translateY(100%)", opacity: "0" },
          "100%": { transform: "translateY(0) rotate(360deg)", opacity: "1" },
        },
        move_down: {
          "0%": { transform: "translateY(0) rotate(180deg)", opacity: "1" },
          "50%": { transform: "translateY(100%) rotate(360deg)", opacity: "0" },
          "51%": {
            transform: "translateY(-100%)",
            opacity: "0",
          },
          "100%": { transform: "translateY(0) rotate(180deg)", opacity: "1" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        slide_full_right: "slide_full_right 0.5s forwards",
        slide_right_to_left: "slide_right_to_left 0.5s forwards",
        slide_bottom_to_top: "slide_bottom_to_top 0.3s forwards",
        quantum_bouncing: "quantum_bouncing 0.5s forwards",
        move_up: "move_up 1s forwards",
        move_down: "move_down 1s forwards",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("daisyui")],
};
