/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#003366', // Deep Blue
                    light: '#0055aa',
                },
                secondary: {
                    DEFAULT: '#e6fffa', // Soft Green/Teal background
                    accent: '#38b2ac', // Soft Green
                },
                warning: '#ff9800', // Orange
                danger: '#e53e3e', // Red
            },
            boxShadow: {
                'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05), 0 2px 10px -2px rgba(0, 0, 0, 0.02)',
            }
        },
    },
    plugins: [],
}
