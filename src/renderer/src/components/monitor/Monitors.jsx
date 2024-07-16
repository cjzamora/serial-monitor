import React from 'react';
import { AppContext } from '../../providers';
import { Monitor } from './';

/**
 * Monitors component
 * 
 * @returns {React.JSX}
 */
export default function Monitors() {
  const app = React.useContext(AppContext);

  return (
    <div className="h-full overflow-hidden">
      {Object.keys(app.tabs).map((tab) => (
        <Monitor 
          key={tab} 
          device={app.tabs[tab]}
        />
      ))}
    </div>
  )
}