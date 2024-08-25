const flowbite = require("flowbite-react/tailwind");

/** @type {import('tailwindcss').Config} */
export default {
	content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}", flowbite.content()],
	theme: {
		extend: {
			fontSize: {
				xxs: "0.625rem", // Custom size smaller than `text-xs`
			},
			boxShadow: {
				whiteLg:
					"0 10px 15px rgba(255, 255, 255, 0.1), 0 4px 6px rgba(255, 255, 255, 0.05)",
			},
		},
	},
	plugins: [flowbite.plugin()],
};
