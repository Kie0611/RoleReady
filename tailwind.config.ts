import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans:  ["Archivo", "ui-sans-serif", "system-ui", "sans-serif"],
        mono:  ["Space Mono", "ui-monospace", "monospace"],
      },
      borderRadius: {
        sm: "0.25rem",
        DEFAULT: "0.25rem",
        md: "0.375rem",
      },
      colors: {
        background:  "oklch(0.956 0.012 86)",
        foreground:  "oklch(0.19 0.012 300)",
        card:        "oklch(0.982 0.008 88)",
        primary:     "oklch(0.19 0.012 300)",
        secondary:   "oklch(0.91 0.015 85)",
        muted:       "oklch(0.91 0.015 85)",
        "muted-foreground": "oklch(0.54 0.018 80)",
        accent:      "oklch(0.75 0.16 78)",
        "accent-foreground": "oklch(0.19 0.012 300)",
        border:      "oklch(0.86 0.018 82)",
        destructive: "oklch(0.58 0.18 35)",
        success:     "oklch(0.43 0.105 145)",
        info:        "oklch(0.34 0.16 275)",
        "success-foreground": "oklch(0.98 0.005 90)",
        "info-foreground":  "oklch(0.98 0.005 90)",
        warning:     "oklch(0.52 0.12 62)",
      },
    },
  },
  plugins: [],
};

export default config;