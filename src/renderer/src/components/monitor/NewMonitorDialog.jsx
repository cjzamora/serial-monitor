import React from 'react';
import { AppContext } from '../../providers';
import { useToast } from '../../hooks';

/**
 * Initial state
 * 
 * @type {Object}
 */
const initialState = {
  path: null,
  baudRate: 9600,
  locationId: null
}

/**
 * New monitor dialog component
 * 
 * @returns {React.JSX}
 */
export default function NewMonitorDialog() {
  const app = React.useContext(AppContext);
  const { ipcRenderer } = window.electron;
  const [ state, setState ] = React.useState(initialState);
  const [ devices, setDevices ] = React.useState([]);
  const { notify } = useToast();

  /**
   * Handle device change
   * 
   * @param {Object} e
   * 
   * @returns {void}
   */
  const onDeviceChange = (e) => {
    setState({
      ...state,
      path: e.target.value,
      locationId: e.target.options[e.target.selectedIndex].getAttribute('data-location-id')
    });
  }

  /**
   * Handle baud rate change
   * 
   * @param {Object} e
   * 
   * @returns {void}
   */
  const onBaudRateChange = (e) => {
    setState({
      ...state,
      baudRate: parseInt(e.target.value)
    });
  }

  /**
   * Handle start monitor click
   * 
   * @returns {void}
   */
  const onStartMonitorClick = async () => {
    let connected = false;
    try {
      connected = await ipcRenderer.invoke('device:connect', state);
    } catch(e) {
      notify('error', 'Failed to connect to device');
    }

    app.addTab(state.path, { ...state, connected });
    app.setNewDialog(false);

    setState(initialState);
  }

  /**
   * Handle close click
   * 
   * @returns {void}
   */
  const onCloseClick = () => {
    app.setNewDialog(false);
  }

  /**
   * Initialize and fetch devices
   * 
   * @returns {void}
   */
  React.useEffect(() => {
    const init = async () => {
      const results = await ipcRenderer.invoke('device:list');
      setDevices(results);
    }

    init();
  }, []);

  return (
    <div className="
      bg-white 
      absolute 
      top-0 
      left-0 
      h-full 
      w-full
      p-5
    ">
      <div className="text-right">
        <button className="text-sm" onClick={onCloseClick}>
          Close
        </button>
      </div>

      <div className="flex flex-col justify-center h-full max-w-[500px] m-auto">
        <h1 className="font-bold text-3xl mb-5">
          New Monitor
        </h1>
        
        <div className="mb-5 w-full">
          <span className="text-sm block">
            Select Device
          </span>
          <select 
            className="border rounded-md p-3 w-full"
            onChange={onDeviceChange}
          >
            <option>-</option>
            {devices.map((device, index) => (
              <option key={index} value={device.path} data-location-id={device.locationId}>
                {device.path}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-5 w-full">
          <span className="text-sm block">
            Select Baud Rate
          </span>
          <select 
            className="border rounded-md p-3 w-full"
            onChange={onBaudRateChange}
            value={state.baudRate}
          >
            <option>-</option>
            <option value="9600">9600</option>
            <option value="19200">19200</option>
            <option value="38400">38400</option>
            <option value="57600">57600</option>
            <option value="115200">115200</option>
          </select>
        </div>

        <button 
          className="btn btn-dark"
          onClick={onStartMonitorClick}
        >
          Start Monitor
        </button>
      </div>
    </div>
  )
}