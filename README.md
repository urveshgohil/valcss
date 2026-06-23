# ⚡ valcss

**valcss** is a tiny, flexible CLI utility to generate atomic and utility-first CSS classes from usage in your HTML, React, Next.js, and custom plugins. It allows you to configure class patterns, outputs, breakpoints, and even inject CSS directly into your HTML or as a separate file.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Getting Started](#getting-started)
- [Configuration](#configuration)
- [Usage](#usage)
- [Plugin System](#plugin-system)
- [Injection Modes](#injection-modes)
- [Live Example](#live-example)
- [FAQ](#faq)
- [License](#license)

---

## Features

- ⚡ Instantly extracts and generates a CSS file from your HTML, JSX, and TSX.
- ⏳ Supports watch mode for live editing.
- 🧩 Extendable through custom plugins.
- 🔗 CSS injection: inline in HTML or as a <link>.
- 📦 Zero-dependency CLI.
- 🌈 Supports breakpoints (responsive utilities).
- 📝 Customizable with a simple JS config file.
- ⚛️ Supports React and Next.js `className` patterns.

---

## Installation

```bash
npm install -g valcss
```

---

## Getting Started

### 1. Scaffold a config file

```bash
valcss init
```

This creates a `valcss.config.cjs` file in your project. You can choose another format with `--js`, `--ts`, or `--json`:

```bash
valcss init --js
valcss init --ts
```

```js
// valcss.config.cjs
module.exports = {
  files: ["**/*.{html,js,jsx,ts,tsx}"],
  output: "valcss-main.css",
  inject: {
    mode: "link", // or "inline"
    targets: ["index.html"],
  },
  breakpoints: {
    lg: 990,
  },
  plugins: [
    ({ addUtilities }) => {
      addUtilities(
        {
          "flex-center": {
            display: "flex",
            "justify-content": "center",
            "align-items": "center",
          },
        },
        "*"
      );
    },
  ],
};
```

---

### 2. Add utility CSS classes in your markup:

Example ([index.html](https://github.com/hardik-143/valcss/blob/main/index.html)):

```html
<link rel="stylesheet" href="valcss-main.css" />
<div class="p-[25px] flex-center hover:flex-center lg:flex-center ...">
  <p class="text-[#000] bg-[#00ff00] border-[1px_solid_#000] ...">Hello</p>
</div>
```

```tsx
export function Card() {
  return (
    <section className="m-1 p-2 text-xl rounded-lg">
      <div className={true ? "w-full" : "mx-auto"}>Hello</div>
    </section>
  );
}
```

---

### 3. Build your CSS

```bash
valcss
```

- This scans your HTML, JSX, and TSX files, generates only the CSS classes you actually use, and writes them to `valcss-main.css`.
- The CSS is injected (as a link or inline) into your specified HTML targets.

---

## Configuration

The config file lets you control:

- **files**: Files/globs to scan for class usage.
- **output**: The CSS file output.
- **inject**: How and where to inject the styles.
- **breakpoints**: Custom responsive breakpoints.
- **plugins**: Extendable utility generators.

See [`valcss.config.cjs`](https://github.com/hardik-143/valcss/blob/main/valcss.config.cjs) for an example.

`**/*.{html,js,jsx,ts,tsx}` is a good default for mixed HTML, React, and Next.js projects. valcss skips common generated/vendor folders like `node_modules`, `dist`, `.next`, `coverage`, `build`, and `out` while resolving that pattern.

---

## Usage

| Command                  | Description                          |
| ------------------------ | ------------------------------------ |
| `valcss`                 | Run CSS extraction/generation        |
| `valcss --output <file>` | Override the default output file     |
| `valcss --watch`         | Enable file watching/live rebuilds   |
| `valcss init`            | Scaffold a config file               |
| `valcss init --js`       | Scaffold an ESM JS config file       |
| `valcss init --ts`       | Scaffold a TS config file            |
| `valcss --dry-run`       | Print generated CSS to terminal only |
| `valcss --help`          | Show help message                    |

**Example:**

```bash
valcss --watch --output custom.css
```

---

## Plugin System

Define your own utilities with the `plugins` array in your config:

```js
plugins: [
  ({ addUtilities }) => {
    addUtilities(
      {
        "flex-center": {
          display: "flex",
          "justify-content": "center",
          "align-items": "center",
        },
      },
      "*"
    );
  },
];
```

**This adds the `flex-center` class to your utility set:**

```css
.flex-center {
  display: flex;
  justify-content: center;
  align-items: center;
}
```

---

## Injection Modes

- `"link"`: Injects your built CSS using `<link rel="stylesheet" ...>`.
- `"inline"`: Injects the CSS directly inside `<style>` tags.
- **Targets**: Specify which HTML files receive the injection.

Edit these options under `inject` in your config file.

---

## Live Example

- [index.html](https://github.com/hardik-143/valcss/blob/main/index.html) with the generated classes applied.
- [valcss-main.css](https://github.com/hardik-143/valcss/blob/main/valcss-main.css) is the result.

---

## FAQ

### How does valcss work?

- Scans your specified files for ALL CSS classes used.
- Resolves and compiles only the classes you use into a single CSS file.
- Optionally injects that file into your HTML via link or inline style.

### How to add my own utility classes?

Use the plugin system in the config. See [Plugin System](#plugin-system).

### Does valcss support responsiveness?

Yes! Example:  
`.md:utility` or `.lg:flex-center` generates the correct breakpoint selectors.

---

## License

MIT © 2025 [@hardik-143](https://github.com/hardik-143)

---

> _Ready to make your CSS minimal, maintainable, and fast? Try valcss and get instant atomic CSS using only what you use!_
