/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: "class",
    content: [
        "./src/**/*.{js,jsx,ts,tsx}",
        "./public/index.html"
    ],
    theme: {
        extend: {
            colors: {
                "primary": "#3b82f6",
                "accent-purple": "#7d30e8",
                "background-light": "#f7f6f8",
                "background-dark": "#0a070d",
                "glass": "rgba(255, 255, 255, 0.03)",
                "glass-border": "rgba(255, 255, 255, 0.08)",
            },
            fontFamily: {
                "display": ["Inter"]
            },
            borderRadius: { "DEFAULT": "0.25rem", "lg": "0.5rem", "xl": "0.75rem", "full": "9999px" },
        },
    },
    plugins: [],
}
