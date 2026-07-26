/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Pulled from the Figma file — keep these as the single source of truth.
        ink: "#0F1B2D", // headings / footer background
        brand: {
          DEFAULT: "#2B6CB0", // primary blue: buttons, links, CTA band
          tint: "rgba(37,99,235,0.05)", // hero panel wash
        },
        teal: {
          DEFAULT: "#2D6A6A",
          tint: "#F0F7F7", // pale teal used on badges + icon chips
          border: "#CCFBF1",
        },
        amber: "#F59E0B",
        body: "#4B5563", // body copy
        muted: "#6B7280", // secondary / meta copy
        slate: "#4A5568", // nav links
        line: {
          DEFAULT: "#E2E8F0",
          soft: "#F3F4F6",
          strong: "#D1D5DB",
          edge: "#E5E7EB", // card borders on the audience/pricing frames
        },
        page: "#F7FAFC",
        mist: "#F9FAFB", // trust bar + dashboard chrome
        panel: "#F5F7FA", // pricing band + auth portal background
        footext: "#9CA3AF",
        heading: "#1F2937",
        subtle: "#374151",
        // Educator app shell (1:495 and siblings)
        sidebar: "#14294B",
        sidebarmuted: "#B6C2D4",
        // Auth portal frames (1:198, 186:1103) use their own greys
        authink: "#1A202C",
        authslate: "#64748B",
        authline: "#D5DAE0",
        authchip: "#E9F1F1",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
      },
      maxWidth: {
        shell: "1280px", // the 1280 container inside the 1440 frame
        prose: "896px", // CTA copy width
      },
      boxShadow: {
        card: "0 8px 15px rgba(0,0,0,0.04)",
        btn: "0 4px 10px rgba(0,0,0,0.05)",
      },
      borderRadius: {
        card: "16px",
        chip: "12px",
      },
    },
  },
  plugins: [],
};
