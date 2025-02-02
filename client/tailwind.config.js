/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      './src/**/*.{js,jsx,ts,tsx}', // Add paths to your React components
      './node_modules/@shadcn/ui/**/*.{js,jsx,ts,tsx}' // Add ShadCN UI path
    ],
    theme: {
      extend: {},
    },
    plugins: [],
  }
  