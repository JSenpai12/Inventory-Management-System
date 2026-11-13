// FILE: vite.config.ts
// PURPOSE: Vite dev server / build config.
// WHAT TO DO: when the NestJS API runs, add a dev proxy, e.g. server:{proxy:{'/api':'http://localhost:3000'}}.
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
export default defineConfig({ plugins: [react()] })
