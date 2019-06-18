'use strict';

import { app, protocol, BrowserWindow, ipcMain } from 'electron';
import { createProtocol, installVueDevtools } from 'vue-cli-plugin-electron-builder/lib';
import net from 'net';
const isDevelopment = process.env.NODE_ENV !== 'production';

const tcpClient = new net.Socket();
const tcpHost = '192.168.2.13';
const tcpPort = 7777;
const tcpHello = Buffer.from([ 0x00, 0xc0, 0xff, 0xee ]);
const tcpOlleh = Buffer.from([ 0x00, 0x0b, 0x00, 0xb5 ]);
let tcpIsConnected = false;
let tcpConnecting = false;

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win;

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([ { scheme: 'app', privileges: { secure: true, standard: true } } ]);

function createWindow() {
  // Create the browser window.
  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    }
  });

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    win.loadURL(process.env.WEBPACK_DEV_SERVER_URL);
    if (!process.env.IS_TEST) win.webContents.openDevTools();
  } else {
    createProtocol('app');
    // Load the index.html when not in development
    win.loadURL('app://./index.html');
  }

  win.on('closed', () => {
    win = null;
  });
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow();
  }
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      await installVueDevtools();
    } catch (e) {
      console.error('Vue Devtools failed to install:', e.toString());
    }
  }
  createWindow();
});

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit();
      }
    });
  } else {
    process.on('SIGTERM', () => {
      app.quit();
    });
  }
}

// ipcMain.on('asynchronous-message', (event, arg) => {
//   console.log(arg); // prints "ping"
//   event.reply('asynchronous-reply', 'pong');
// });
//
// ipcMain.on('synchronous-message', (event, arg) => {
//   console.log(arg); // prints "ping"
//   event.returnValue = 'pong';
// });

// var client = new net.Socket();
// function connectTcp() {
//   client.connect(8888, '192.168.2.13', function() {
//     console.log('Connected');
//     client.write('Espece dhuitre seche !');
//   });
// }
//
// let callbackEvent = [];
//
// ipcMain.on('connect-tcp', (event, arg) => {
//   console.log(arg); // prints "ping"
//   connectTcp();
//   callbackEvent.push(function(data) {
//     event.reply('asynchronous-reply', 'connected : ' + data);
//   });
// });
//
// ipcMain.on('close-tcp', (event, arg) => {
//   console.log(arg); // prints "ping"
//   //client.destroy();
// });
//
// client.on('data', (data) => {
//   console.log('Received: ' + data);
//   //client.destroy(); //.then(() => {
//   callbackEvent[0](data);
//   //  console.log('KILLL');
//   //}); // kill client after server's response
// });
//
// client.on('close', function() {
//   console.log('Connection closed');
// });

// ===============================
// Open connect TCP
// Close connect TCP
// Data connect TCP
//
// Send data to server TCP
//

let callbackTCPResponseEvent = function() {};
let callbackToSendToTCPServer = [];

function sendToTCPServer(message) {
  // if (!tcpIsConnected) return;
  console.log('Send to TCP : ', message);
  tcpClient.write(message);
}

function connectToTCPServer() {
  console.log('Connect to TCP');
  tcpClient.connect(tcpPort, tcpHost, function() {
    sendToTCPServer(tcpHello);
  });
}

function runTCPCallback() {
  for (let callback of callbackToSendToTCPServer) {
    callback();
  }
}

// Emitted when a socket is ready to be used.
tcpClient.on('ready', function() {});

tcpClient.on('data', (data) => {
  console.log('Data sended : ', data);
  if (tcpIsConnected) callbackTCPResponseEvent(data);
  if (data.toString() == tcpOlleh.toString()) {
    console.log('Correct response');
    tcpIsConnected = true;
    runTCPCallback();
  }
});

tcpClient.on('close', function() {
  tcpIsConnected = false;
});

// ==========================

ipcMain.on('tcp-main-event', (event, arg) => {
  console.log('Data sended : ' + arg);
  console.log('Save Event Callback');
  callbackTCPResponseEvent = function(data) {
    event.reply('tcp-renderer-response-event', 'data : ' + data);
  };

  if (tcpConnecting) {
    callbackTCPResponseEvent({ status: 'in progress', message: 'Main proccess is currently working' });
  }

  console.log('Check TCP is connected');
  if (!tcpIsConnected) {
    console.log('.. Not connected');
    tcpConnecting = true;
    connectToTCPServer();
    callbackToSendToTCPServer.push(function() {
      sendToTCPServer(arg);
    });
    return;
  }

  sendToTCPServer(arg);
});
