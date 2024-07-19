import React from 'react';
import { AppContext } from '../../providers';
import { useToast } from '../../hooks';
import { ArrowPathIcon, CheckCircleIcon, PaperAirplaneIcon, XCircleIcon } from '@heroicons/react/20/solid';
import { Buffer } from 'buffer';

/**
 * Retry count
 * 
 * @type {Number}
 */
let retry = 0;

/**
 * Maximum retry
 * 
 * @type {Number}
 */
let maxRetry = 10;

/**
 * Monitor component
 * 
 * @param {Object} props
 * 
 * @returns {React.JSX}
 */
export default function Monitor({ device }) {
  const app = React.useContext(AppContext);
  const { ipcRenderer } = window.electron;
  const { notify } = useToast();

  // states
  const [ mounted, setMounted ] = React.useState(false);
  const [ reconnecting, setReconnecting ] = React.useState(false);
  const [ lines, setLines ] = React.useState([]);
  const [ write, setWrite ] = React.useState('');
  const [ scrollTop, setScrollTop ] = React.useState(0);

  // refs (this sucks but react...)
  const appRef = React.useRef(app);
  const mountedRef = React.useRef(mounted);

  /**
   * Attach event listeners
   * 
   * @returns {void}
   */
  const attachListeners = () => {
    ipcRenderer.on(`device:data-${device.locationId || 'none'}`, onData);
    ipcRenderer.on(`device:error-${device.locationId || 'none'}`, onError);
    ipcRenderer.on(`device:close-${device.locationId || 'none'}`, onClose);
  }

  /**
   * Detach event listeners
   * 
   * @returns {void}
   */
  const detachListeners = () => {
    ipcRenderer.removeListener(`device:data-${device.locationId || 'none'}`, onData);
    ipcRenderer.removeListener(`device:error-${device.locationId || 'none'}`, onError);
    ipcRenderer.removeListener(`device:close-${device.locationId || 'none'}`, onClose);
  }

  /**
   * Reconnects the device upon disconnection
   * 
   * @returns {void}
   */
  const reconnect = async () => {
    // update states
    appRef.current.setTabData(appRef.current.tab, { connected: false });
    setReconnecting(true);

    // wait for 2 seconds before reconnecting
    await new Promise(resolve => setTimeout(resolve, 2000));

    // do not reconnect if we are not mounted
    if (!mountedRef.current) {
      return;
    }

    // if retry exceeds maximum retry
    if (retry >= maxRetry) {
      setReconnecting(false);
      return;
    }

    try {
      // invoke device connect
      await ipcRenderer.invoke('device:connect', device, true);
      // update states
      appRef.current.setTabData(appRef.current.tab, { connected: true });

      // reset retry count
      retry = 0;
      setReconnecting(false);
    } catch(e) {
      // increment retry count
      retry++;
      // reconnect
      reconnect();
    }
  }

  /**
   * Handle data event
   * 
   * @param {Object} event
   * 
   * @returns {void}
   */
  const onData = (_, { data }) => {
    const buffer = Buffer.from(data);
    const date = new Date().toLocaleTimeString();
    setLines(prev => ([ ...prev, `[${date}]: ${buffer.toString()}` ]));
  }

  /**
   * Handle error event
   * 
   * @param {Object} event
   * 
   * @returns {void}
   */
  const onError = (_, { err }) => {
    console.log('error');
  }

  /**
   * Handle close event
   * 
   * @param {Object} event
   * 
   * @returns {void}
   */
  const onClose = async (_, { retry }) => {
    // if closed via disconnect method, do not retry
    if (!retry) {
      // make sure to detach listeners
      detachListeners();
      return;
    }

    reconnect();
  }

  /**
   * Handle write click
   * 
   * @returns {void}
   */
  const onWriteClick = async () => {
    // invoke device write
    const success = await ipcRenderer.invoke('device:write', device.path, write);

    if (!success) {
      notify('error', 'Failed to send data');
      return;
    }

    setWrite('');
  }

  /**
   * Handle clear click
   * 
   * @returns {void}
   */
  const onClearClick = () => {
    setLines([]);
  }

  /**
   * Handle reconnect click
   * 
   * @returns {void}
   */
  const onReconnectClick = async () => {
    retry = 0;
    reconnect();
  }

  /**
   * On mount initialize event listeners
   * 
   * @returns {void}
   */
  React.useEffect(() => {
    // if we are already mounted
    if (mounted) {
      return;
    }

    detachListeners();
    setMounted(true);
    attachListeners();

    mountedRef.current = true;

    return () => {
      setMounted(false);
      detachListeners();

      mountedRef.current = false;
    }
  }, []);

  /**
   * Update refs
   * 
   * @returns {void}
   */
  React.useEffect(() => {
    appRef.current = app;
  }, [app.tab, app.tabs]);

  /**
   * Observe last scroll position
   * 
   * @returns {void}
   */
  React.useEffect(() => {
    const element = document.getElementById('lines');
    const onScroll = (e) => setScrollTop(e.target.scrollTop);

    element.addEventListener('scroll', onScroll);

    return () => {
      element.removeEventListener('scroll', onScroll);
    }
  }, []);

  /**
   * Scroll to bottom on lines change
   * 
   * @returns {void}
   */
  React.useEffect(() => {
    const element = document.getElementById('lines');
    const currentScroll = element.scrollHeight - element.clientHeight - 200;

    if (scrollTop < currentScroll) {
      return;
    }

    element.scrollTop = element.scrollHeight;
  }, [lines.length]);

  return (
    <div className={`flex flex-col h-full ${device.path != app.tab ? 'hidden' : ''}`}>
      <div id="lines" className="h-full overflow-y-scroll p-3">
        {lines.map((line, index) => (
          <p key={index}>{line}</p>
        ))}
      </div>

      <div className="border-y">
        <div className="flex gap-3 p-3">
          <input 
            className="border px-2 py-2 w-full rounded-md"
            type="text" 
            onChange={(e) => setWrite(e.target.value)}
            value={write}
          />
          <button 
            className="btn btn-dark"
            disabled={!device.connected && !write.length}
            onClick={onWriteClick}
          >
            <PaperAirplaneIcon className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-center justify-between border-t text-gray-500 text-[12px] px-3 py-1">
          <div className="flex items-baseline justify-between gap-2">
            {retry == maxRetry && !reconnecting && (
              <>
                <button className="flex items-center gap-1" onClick={onReconnectClick}>
                  <span>Reconnect</span>
                  <ArrowPathIcon className="w-3 h-3" />
                </button>
                <p>|</p>
              </>
            )}

            {reconnecting && (
              <>
                <span>Reconnecting...</span>
                <p>|</p>
              </>
            )}
            
            <button onClick={onClearClick}>
              Clear
            </button>
          </div>
          <div className="flex items-baseline justify-end  gap-2 text-[12px]">
            <p className="flex items-center gap-1">
              <span>Connected:</span>
              {device.connected ? (
                <CheckCircleIcon className="w-4 h-4 text-green-500" />
              ) : (
                <>
                  <XCircleIcon className="w-4 h-4 text-red-500" />
                </>
              )}
            </p>
            <p>|</p>
            <p>
              Path: {device.path || '-'}
            </p>
            <p>|</p>
            <p>
              Baud Rate: {device.baudRate || '-'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}