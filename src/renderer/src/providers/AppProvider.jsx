import React from 'react';

/**
 * Initial state
 * 
 * @type {Object}
 */
const initialState = {
  newDialog: false,
  tab: null,
  tabs: {}
}

/**
 * App context
 * 
 * @type {Object}
 * @param {Object} initialState
 * 
 * @returns {Object}
 */
export const AppContext = React.createContext(initialState);

/**
 * App provider
 * 
 * @param {Object} props
 * 
 * @returns {React.JSX}
 */
export default function AppProvider({ children }) {
  // app state
  const [ state, setState ] = React.useState(initialState);

  /**
   * Add tab
   * 
   * @param {String} id
   * @param {Object} tab
   * 
   * @returns {void}
   */
  const addTab = (id, tab) => {
    const current = Object.assign({}, state.tabs);
    const tabs = { ...current, [id]: tab };

    setState(prev => ({
      ...prev,
      tab: id,
      tabs
    }));
  }

  /**
   * Set active tab
   * 
   * @param {String} id
   * 
   * @returns {void}
   */
  const setTab = (id) => {
    setState(prev => ({
      ...prev,
      tab: id
    }))
  }

  /**
   * Set tab data
   * 
   * @param {String} id
   * @param {String} data
   * 
   * @returns {void}
   */
  const setTabData = (id, data) => {
    const current = Object.assign({}, state.tabs);

    if (!current[id]) {
      return;
    }

    const tabs = { 
      ...current, 
      [id]: {
        ...current[id],
        ...data
      }
    }

    setState(prev => ({
      ...prev,
      tabs
    }))
  } 

  /**
   * Remove tab
   * 
   * @param {String} id
   * 
   * @returns {void}
   */
  const removeTab = (id) => {
    // clone tabs
    const tabs = Object.assign({}, state.tabs);

    // get the tab id before this id
    const tabIds = Object.keys(tabs);
    const index = tabIds.indexOf(id);
    const prevTab = index > 0 ? tabIds[index - 1] : tabIds[index + 1];

    // remove tab
    delete tabs[id];

    // this is not working
    setState(prev => ({
      ...prev,
      tab: prevTab,
      tabs
    }))
  }

  /**
   * Set new dialog flag
   * 
   * @returns {void}
   */
  const setNewDialog = () => {
    setState(prev => ({
      ...prev,
      newDialog: !prev.newDialog
    }))
  }

  return (
    <AppContext.Provider value={{ 
      ...state, 
      addTab,
      setTab,
      setTabData,
      removeTab,
      setNewDialog
    }}>
      {children}
    </AppContext.Provider>
  )
}