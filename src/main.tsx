import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { WixDesignSystemProvider } from '@wix/design-system';
import './index.css'
import "@wix/design-system/styles.global.css";

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <WixDesignSystemProvider>
      <App />
    </WixDesignSystemProvider>
  </React.StrictMode>,
)
