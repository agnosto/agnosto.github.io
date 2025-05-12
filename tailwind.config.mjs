/** @type {import('tailwindcss').Config} */
export default {
    content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
    theme: {
        extend: {
            colors: {
                'cyber-black': '#0b0b0f',
                'cyber-dark': '#131320',
                'cyber-blue': '#05d9e8',
                'cyber-pink': '#ff2a6d',
                'cyber-purple': '#d300c5',
                'cyber-yellow': '#f9f871'
            },
            fontFamily: {
                'cyber': ['Orbitron', 'sans-serif'],
                'anime': ['Noto Sans JP', 'sans-serif']
            }
        },
    },
    plugins: [],
}

