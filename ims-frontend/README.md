# StockWise IMS frontend
FILE: README.md. PURPOSE: how to run and extend the project. WHAT TO DO: read once, then delete or edit.

1. `npm install` then `npm run dev`.
2. Data comes from `src/services/api.ts` (mock). Swap its functions for NestJS `fetch` calls, then delete `src/data/mock.ts`.
3. Restyle by editing the 4 colors in `tailwind.config.js` and the classes in `src/index.css`.
4. Every source file starts with a FILE / PURPOSE / WHAT TO DO comment.
