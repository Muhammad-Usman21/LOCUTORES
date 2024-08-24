const flowbite = require("flowbite-react/tailwind");

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}", flowbite.content()],
  theme: {
    extend: {
      fontSize: {
        xxs: "0.625rem", // Custom size smaller than `text-xs`
      },
    },
  },
  plugins: [flowbite.plugin()],
};
