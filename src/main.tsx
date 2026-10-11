import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter } from 'react-router'
import { Colors } from './types/color'

for (const [name, value] of Object.entries(Colors)) {
  const cssName = name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)
  document.documentElement.style.setProperty(`--color-${cssName}`, value)
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
