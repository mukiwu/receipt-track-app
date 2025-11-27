import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // 打字機配色
        thermal: {
          cream: "#F5F1EB",
          beige: "#E8E4DC",
          paper: "#FDF9F3",
          dark: "#3A3D38",
          screen: "#2D302A",
          amber: "#C4A574",
          red: "#D35233",
          green: "#5CB85C",
          text: "#333333",
        },
      },
      fontFamily: {
        mono: ["'Space Mono'", "'Courier New'", "monospace"],
        thermal: ["'Special Elite'", "'Courier New'", "monospace"],
      },
      boxShadow: {
        printer: "0 20px 60px rgba(0, 0, 0, 0.15), 0 8px 20px rgba(0, 0, 0, 0.1)",
        button: "0 6px 0 #A63D25, 0 8px 15px rgba(0, 0, 0, 0.2)",
        "button-pressed": "0 2px 0 #A63D25, 0 3px 8px rgba(0, 0, 0, 0.2)",
        receipt: "0 4px 20px rgba(0, 0, 0, 0.1)",
        screen: "inset 0 4px 15px rgba(0, 0, 0, 0.3)",
      },
      animation: {
        "cursor-blink": "cursor-blink 1s step-end infinite",
        "paper-print": "paper-print 0.8s ease-out forwards",
        "tear-shake": "tear-shake 0.3s ease-in-out",
        typing: "typing 0.1s ease-out",
      },
      keyframes: {
        "cursor-blink": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
        "paper-print": {
          "0%": { transform: "translateY(-100%)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "tear-shake": {
          "0%, 100%": { transform: "rotate(0deg)" },
          "25%": { transform: "rotate(-2deg)" },
          "75%": { transform: "rotate(2deg)" },
        },
        typing: {
          "0%": { transform: "scale(1.1)" },
          "100%": { transform: "scale(1)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;

