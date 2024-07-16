import React from 'react';
import { AppContext } from '../providers';
import { PlusIcon, XMarkIcon } from '@heroicons/react/20/solid';
import { useToast } from '../hooks';

/**
 * Tabs component
 * 
 * @returns {React.JSX}
 */
export default function Tabs() {
  const app = React.useContext(AppContext);
  const { ipcRenderer } = window.electron;
  const { notify } = useToast();

  /**
   * Handle add monitor click
   * 
   * @returns {void}
   */
  const onAddMonitorClick = () => {
    app.setNewDialog(true);
  }

  /**
   * Handle tab click
   * 
   * @param {String} tab
   * 
   * @returns {void}
   */
  const onTabClick = (tab) => {
    app.setTab(tab);
  }

  /**
   * Handle remove click
   * 
   * @param {String} tab
   * 
   * @returns {void}
   */
  const onRemoveClick = async (tab) => {
    try {
      await ipcRenderer.invoke('device:disconnect', tab);
      app.removeTab(tab);
    } catch(e) {
      notify('error', 'Failed to disconnect');
    }
  }

  return (
    <div className="flex items-center border-b">
      <div className="w-full">
        {Object.keys(app.tabs).map((tab) => (
          <div 
            key={tab}
            className={`
              cursor-default
              inline-flex
              border-r
              inline-block
              p-2
              ${app.tab === tab ? 'border-t-4 border-t-black' : 'border-t-4'}
            `}
            onClick={() => onTabClick(tab)}
          >
            <span className="text-sm">
              {tab.split('/').pop()}
            </span>
            <button 
              className="font-lighter text-sm ml-3"
              onClick={() => onRemoveClick(tab)}
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
      <div className="border-l px-2">
        <button className="flex items-center" onClick={onAddMonitorClick}>
          <span className="text-sm">Add</span>
          <PlusIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}