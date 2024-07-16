import { SerialPort } from 'serialport';

/**
 * Serial port cache
 * 
 * @type {Object}
 */
const ports = {};

/**
 * Connect to a serial port
 * 
 * @param {Object} event
 * @param {Object} config
 * @param {Boolean} retry
 * 
 * @returns {Promise}
 */
export const connect = async (event, config, retry = false) => {
  // if retry is true, delete the port from the cache
  if (retry) {
    delete ports[config.path];
  }

  // create new serial port instance
  return new Promise((resolve, reject) => {
    // create new serial port instance
    const port = new SerialPort(config, (err) => {
      if (err) {
        return reject(err);
      }

      return resolve(true);
    });

    // listen for readable data
    port.on('readable', () => {
      console.log(port.read());
    });

    // listen for data stream
    port.on('data', (data) => {
      console.log('[serialport:data]', data);

      event
        .sender
        .send(`device:data-${config.locationId}`, { config, data })
    });

    // listen for errors
    port.on('error', (err) => {
      console.log('[serialport:err]', err);

      event
        .sender
        .send(`device:data-${config.locationId}`, { config, err })
    });

    // listen for close
    port.on('close', () => {
      console.log('[serialport:close]');

      // if port is closed via disconnect method, do not retry
      const retry = ports[config.path] ? true : false;

      event
        .sender
        .send(`device:close-${config.locationId}`, { config, retry })
    });

    // listen for disconnect
    port.on('disconnected', async (err) => {
      console.log('[serialport:disconnected]', err);

      // if port is closed via disconnect method, do not retry
      const retry = ports[config.path] ? true : false;

      event
        .sender
        .send(`device:disconnected-${config.locationId}`, { config, retry });     
    });

    // add port to cache
    ports[port.path] = port;
  });
}

/**
 * Disconnect from a serial port
 * 
 * @param {Object} event
 * @param {String} path
 * 
 * @returns {Promise}
 */
export const disconnect = async (event, path) => {
  return new Promise((resolve, reject) => {
    const port = ports[path];

    if (!port) {
      return reject(new Error('Port not found'));
    }

    delete ports[path];

    port.close((err) => {
      return resolve(true);
    });
  });
}

/**
 * Write data to a serial port
 * 
 * @param {Object} event
 * @param {String} path
 * @param {String} data
 * 
 * @returns {Promise}
 */
export const write = async (event, path, data) => {
  return new Promise((resolve, reject) => {
    const port = ports[path];

    if (!port) {
      return reject(new Error('Port not found'));
    }

    port.write(data + '\n', (err) => {
      if (err) {
        return reject(err);
      }

      return resolve(true);
    });
  });
}

/**
 * Get list of available devices
 * 
 * @returns {Promise}
 */
export const lists = async () => {
  return await SerialPort.list();
}
