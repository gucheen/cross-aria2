'use strict';

const electron = require('electron');
// Module to control application life.
const app = electron.app;
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;

const path = require('path');

function runCMD(cmd, args, callBack) {
  const spawn = require('cross-spawn');
  const child = spawn(cmd, args);
  let resp = '';

  child.stdout.on('data', function (buffer) {
    resp += buffer.toString()
  });
  child.stderr.on('data', (data) => {
    console.log(`stderr: ${data}`);
  });
  child.stdout.on('end', function () {
    callBack(resp)
  });
}

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

function createWindow() {
  const aria2Bin = process.platform === 'win32' ? 'aria2/aria2c.exe' : 'aria2/aria2c'
  const homePath = app.getPath('home');
  const downloadsPath = app.getPath('downloads');
  runCMD(path.resolve(__dirname, aria2Bin),
    [
      `--conf-path=${path.resolve(__dirname, 'aria2.conf')}`,
      `--dir=${downloadsPath}`,
      `--input-file=${homePath}/.aria2/aria2.session`,
      `--save-session=${homePath}/.aria2/aria2.session`,
    ],
    (text) => {
      console.log('run aria2c', text);
    });

  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
    },
  });

  // and load the index.html of the app.
  mainWindow.loadURL('file://' + __dirname + '/public/index.html');

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    runCMD('killall', ['aria2c'], function (text) {
      console.log('kill all aria2c');
    });
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});
