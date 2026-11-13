// FILE: src/main.tsx
// PURPOSE: app entry point. Mounts <App/> and loads global CSS.
// WHAT TO DO: nothing. Wrap <App/> here with an auth or router provider later.
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><App /></React.StrictMode>)
