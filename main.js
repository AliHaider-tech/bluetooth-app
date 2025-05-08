const { app, BrowserWindow, ipcMain } = require('electron');
const noble = require('@abandonware/noble'); // Bluetooth library for Desktop (Windows/macOS)
const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const serve = require('electron-serve');

// SQLite Database setup
const dbPath = path.join(__dirname, 'transfer-logs.db');
const loadURL = serve({ directory: 'dist/file-transfer-app' });

let win;

function isDev() {
  return !app.isPackaged;
}

function createWindow() {
  win = new BrowserWindow({
    width: 1369,
    height: 732,
    minWidth: 260,
    minHeight: 360,
    frame: false,
    transparent: true,
    backgroundColor: 'white',
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
      contextIsolation: false,
      devTools: !app.isPackaged
    }
  });

  win.webContents.setFrameRate(60);

  if (isDev()) {
    win.loadURL('http://localhost:4200/');
  } else {
    loadURL(win);
  }

  win.on('closed', function () {
    win = null;
  });
}

app.on('ready', () => {
  setTimeout(createWindow, 10);

  // Setup SQLite database
  const db = new sqlite3.Database(dbPath);
  db.run(`CREATE TABLE IF NOT EXISTS transfers (
    id INTEGER PRIMARY KEY,
    filename TEXT,
    timestamp TEXT
  )`);

  // Bluetooth Scanning with noble for desktop (Windows/macOS)
  ipcMain.handle('scan-bluetooth', async (event) => {
    let devices = [];
    
    try {
      // Start scanning immediately when called
      noble.on('stateChange', (state) => {
        if (state === 'poweredOn') {
          noble.startScanning([], false); // Start scanning for all peripherals (both Android and Desktop)
        } else {
          console.log("Bluetooth is not powered on.");
        }
      });

      noble.on('discover', (peripheral) => {
        // Check if a device has a local name and is not already added to the list
        if (peripheral.advertisement.localName) {
          const device = {
            name: peripheral.advertisement.localName,
            address: peripheral.address
          };
          
          // Avoid adding duplicate devices
          if (!devices.some(d => d.address === device.address)) {
            devices.push(device);
            event.sender.send('bluetooth-devices', devices); // Send the device list in real-time to renderer process
          }
        }
      });

      noble.on('error', (err) => {
        console.error('Noble error:', err);
      });

      // Stop scanning after 10 seconds (for better performance and to avoid continuous scanning)
      setTimeout(() => {
        noble.stopScanning();
        event.sender.send('bluetooth-devices', devices); // Final devices list after scan ends
      }, 10000); // You can adjust the time duration for scanning

    } catch (error) {
      console.error('Error during Bluetooth scanning:', error);
      event.sender.send('bluetooth-devices', []); // If an error occurs, send an empty list
    }
  });

  // Bluetooth File Transfer (dummy, file transfer logic needs implementation)
  ipcMain.handle('send-file-bluetooth', async (event, filePath, deviceAddress) => {
    fs.readFile(filePath, (err, data) => {
      if (err) {
        event.reply('transfer-failed', 'Error reading file');
        return;
      }

      noble.startScanning([], false); // Start scanning to find the device with deviceAddress
      noble.on('discover', (peripheral) => {
        if (peripheral.address === deviceAddress) {
          // Implement your Bluetooth file transfer logic here (using the SPP profile)
          event.reply('transfer-success', 'File sent successfully!');
          
          // Store transfer log in SQLite
          db.run(`INSERT INTO transfers (filename, timestamp) VALUES (?, ?)`, 
            [path.basename(filePath), new Date().toISOString()]);
        }
      });

      setTimeout(() => {
        noble.stopScanning();
        event.reply('transfer-failed', 'Bluetooth connection failed');
      }, 5000);
    });
  });

  // Secure Authentication
  const storedHash = bcrypt.hashSync('123456', 10);
  ipcMain.handle('authenticate', async (event, enteredCode) => {
    const match = bcrypt.compareSync(enteredCode, storedHash);
    event.reply('auth-result', match ? 'Success' : 'Failed');
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function () {
  if (win === null) {
    createWindow();
  }
});
