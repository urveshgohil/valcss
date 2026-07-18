// valcss.config.js
// Place this file at your project root (next to package.json).
// This file stays as plain .js — it is loaded at runtime via require().

/** @type {import('./dist/types/index').ValCSSConfig} */
module.exports = {
  files: ["**/*.{html,js,jsx,ts,tsx,css,scss,sass,less}"],
  output: "valcss-main.css",

  inject: {
    mode: "link",       // "inline" | "link"
    targets: ["index.html"],
  },

  // Optional: override default breakpoints (xs/sm/md/lg/xl/xxl)
  // breakpoints: {
  //   lg: 990,
  // },

  plugins: [
    ({ addUtilities }) => {
      addUtilities(
        {
          "flex-center": {
            display: "flex",
            "justify-content": "center",
            "align-items": "center",
          },
          "flex-between": {
            display: "flex",
            "justify-content": "space-between",
            "align-items": "center",
          },
        },
        "*"
      );
    },
  ],
};
