# React + TypeScript + Vite

## TODOS

### Small Things

- Get mobile right for the Transactions Page
- Figure out why bottom-0 not working for the fixed buttons on the bottom of page of the AddTransactionSheet
- Figure out rough pages for Spending
- Improve / Swap out sidebar component. If I'm in investing, that tab should be open etc...
- Create better Date Range Picker for Transactions. (most granular is months )
- Add Sheet for filters for Transactions?
- Add + button to receipts in Spending
- Fix the main Investing Home chart (relative spending)

## Larger Features

- Enable better spending tracking (so I quickly log spend e.g. 2 beers at night out)
- Hookup API to chess to scrape whether I played Chess that Day
- Subscription Management?
- Figure out what Stock Research Looks Like
- better portfolio analytics
  - E.g. average holding time of current shares. Average dividends received per share during holding period
    Unrealized P/L, Unrealized P/L per share net of dividends (% and ABS)

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ["./tsconfig.node.json", "./tsconfig.app.json"],
      tsconfigRootDir: import.meta.dirname,
    },
  },
});
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from "eslint-plugin-react-x";
import reactDom from "eslint-plugin-react-dom";

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    "react-x": reactX,
    "react-dom": reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs["recommended-typescript"].rules,
    ...reactDom.configs.recommended.rules,
  },
});
```
