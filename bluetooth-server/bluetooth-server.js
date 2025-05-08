const express = require('express');
const bluetooth = require('bluetooth-serial-port');
const cors = require('cors'); // Import CORS module

const app = express();
const btSerial = new bluetooth.BluetoothSerialPort();

app.use(express.json());
app.use(cors());  // Enable CORS for all routes

// API to start Bluetooth scan
app.get('/start-scan', (req, res) => {
  const pairedDevices = [];  // Array to store paired devices
  const unpairedDevices = [];  // Array to store unpaired devices

  // Get paired devices
  btSerial.listPairedDevices(function(devices) {
    devices.forEach(device => {
      pairedDevices.push({ address: device.address, name: device.name, paired: true });
    });

    // Start scanning for unpaired devices
    btSerial.inquire();
    
    btSerial.on('found', function(address, name) {
      console.log('Found device:', name, address);
      
      // Clean the address by extracting only the Bluetooth address
      const addressRegex = /([0-9A-F]{2}(:[0-9A-F]{2}){5})/i;
      const match = address.match(addressRegex);

      if (match && match[0]) {
        address = match[0]; // Keep only the Bluetooth address
      } else {
        console.log('Invalid address format:', address);
      }

      unpairedDevices.push({ address, name, paired: false });  // Push the unpaired device to the array
    });

    btSerial.on('finished', function() {
      console.log('Scanning finished.');

      // Send the list of both paired and unpaired devices as a JSON response
      res.json({ paired: pairedDevices, unpaired: unpairedDevices });
    });

    btSerial.on('error', function(error) {
      console.error('Scanning error:', error);
      res.status(500).json({ error: 'Failed to scan Bluetooth devices' });
    });
  });
});

// API to connect to a Bluetooth device
app.post('/connect', (req, res) => {
  const { address } = req.body;

  console.log('Attempting to connect to Bluetooth device at address:', address);

  btSerial.findSerialPortChannel(address, function(channel) {
    console.log(`Found channel ${channel} for device ${address}`);

    btSerial.connect(address, channel, function() {
      console.log('Connected to device:', address);
      res.status(200).json({ message: 'Connected successfully' });
    }, function(error) {
      console.error('Error connecting to Bluetooth device:', error);
      res.status(500).json({ error: `Failed to connect to device: ${error.message || error}` });
    });

  }, function() {
    console.error('No serial port channel found for address:', address);
    res.status(500).json({ error: 'No serial port channel found for the device' });
  });
});

const port = 3000;
app.listen(port, () => {
  console.log(`Bluetooth server running on http://localhost:${port}`);
});
