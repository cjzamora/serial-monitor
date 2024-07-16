import React from 'react';
import { AppMain } from './components';
import { AppProvider } from './providers';
import { ToastContainer } from 'react-toastify';

import 'react-toastify/dist/ReactToastify.css';

export default function App() {
  return (
    <AppProvider>
      <AppMain />
      <ToastContainer />
    </AppProvider>
  )
}
