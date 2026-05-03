import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { MealProvider } from "./templates/MealContext.jsx"
import { ToastProvider } from "./components/Toast.jsx"
import './index.css'
import './App.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ToastProvider>
      <MealProvider>
        <App />
      </MealProvider>
    </ToastProvider>
  </StrictMode>,
)
