import React from 'react';
import { AppMain } from './components';
import { AppProvider } from './providers';
import { ToastContainer } from 'react-toastify';

import 'react-toastify/dist/ReactToastify.css';

/**
 * App component
 * 
 * @returns {React.JSX}
 */
export default function App() {
  return (
    <AppProvider>
      <AppMain />
      <ToastContainer />
    </AppProvider>
  )
}
