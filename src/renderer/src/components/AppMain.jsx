import React from 'react';
import { AppContext } from '../providers';
import { Monitors, NewMonitorDialog, Tabs } from './';

/**
 * App main component
 * 
 * @returns {React.JSX}
 */
export default function AppMain() {
  const app = React.useContext(AppContext);
  const { ipcRenderer } = window.electron;

  /**
   * Handle new dialog click
   * 
   * @returns {void}
   */
  const onNewDialogClick = () => {
    app.setNewDialog(true);
  }

  /**
   * On menu events
   * 
   * @returns {void}
   */
  React.useEffect(() => {
    const onNewMonitor = () => {
      app.setNewDialog(true);
    }
    
    ipcRenderer.on('menu:new-monitor', onNewMonitor);

    return () => {
      ipcRenderer.removeListener('menu:new-monitor', onNewMonitor);
    }
  }, []);

  return (
    <>
      {Object.keys(app.tabs).length ? (
        <div className="flex flex-col h-full">
          <Tabs />
          <Monitors />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-full">
          <h1 className="font-bold text-3xl mb-5">Serial Monitor</h1>
          <button className="btn btn-dark" onClick={onNewDialogClick}>
            New Monitor
          </button>
        </div>
      )}  

      {app.newDialog && (<NewMonitorDialog />)}
    </>
  )
}