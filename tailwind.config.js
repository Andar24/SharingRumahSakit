/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/main/resources/templates/**/*.html",
        "./src/main/resources/static/**/*.js"
    ],
    theme: {
        extend: {
            colors: {
                primary: "#004ac6",
                "primary-fixed": "#dbe1ff",
                surface: "#f7f9fb",
                "on-surface": "#191c1e",
                "on-surface-variant": "#434655",
                "surface-container-lowest": "#ffffff",
                "outline-variant": "#c3c6d7",
                error: "#ba1a1a",
                secondary: "#4059aa"
            },
            fontFamily: {
                display: ["Plus Jakarta Sans", "sans-serif"],
                body: ["Inter", "sans-serif"]
            }
        }
    },
    plugins: [
        require('@tailwindcss/forms')
    ],
}