const {
  app,
  BrowserWindow,
  ipcMain,
  screen,
  globalShortcut,
} = require('electron');
const path = require('path');
const url = require('url');
const electronRemote = require('@electron/remote/main');
const notifier = require('node-notifier');
const Badge = require('electron-windows-badge');
const { Tray, Menu } = require('electron/main');
const {
  default: installExtension,
  REACT_DEVELOPER_TOOLS,
  MOBX_DEVTOOLS,
} = require('electron-devtools-installer');
const { isDev } = require('../package.json');
const minimist = require('minimist');
const AutoLaunch = require('auto-launch');

electronRemote.initialize();

let badge;
let mainWindow;
let tray;
let miniWindow;
let miniMode = false;
let isAppQuiting = false;
const args = minimist(process.argv.slice(app.isPackaged ? 1 : 2));

if (app.isPackaged) {
  const gotTheLock = app.requestSingleInstanceLock();
  if (gotTheLock) {
    app.on('second-instance', () => mainWindow?.show());
    app.whenReady().then(createWindow);
  } else {
    isAppQuiting = true;
    app.quit();
  }
} else {
  app.whenReady().then(createWindow);
  app.whenReady().then(() => installExtensions());
}

async function installExtensions() {
  const errCallback = (err) =>
    console.error(`An error occurred: ${JSON.stringify(err)}`);
  await installExtension(REACT_DEVELOPER_TOOLS).catch(errCallback);
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    show: !args['hidden'],
  });
  badge = new Badge(mainWindow, {
    color: '#0078D4',
    font: '100 10px "Segoe UI"',
  });
  electronRemote.enable(mainWindow.webContents);
  const indexHtmlUrl = url.pathToFileURL(
    path.resolve(__dirname, './index.html')
  ).href;
  if (app.isPackaged && !isDev) {
    globalShortcut.register('CommandOrControl+R', () => {});
    mainWindow.setMenu(null);
  } else {
    mainWindow.maximize();
    mainWindow.webContents.openDevTools();
  }
  mainWindow.loadURL(app.isPackaged ? indexHtmlUrl : 'http://localhost:3000');
  mainWindow.on('close', (event) => {
    if (!isAppQuiting) {
      event.preventDefault();
      mainWindow.hide();
    }
  });
  initTray();
}

app.on('before-quit', () => {
  isAppQuiting = true;
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

ipcMain.on('getUserDataPath', (event) => {
  event.returnValue = app.getPath('userData');
});

ipcMain.handle('notify', (event, args) => {
  return new Promise((resolve, reject) => {
    const { type, title, repeats } = args;
    if (type === 'reminder') {
      notifier.notify(
        {
          // appName: 'com.tariibaba.reminders',
          title,
          message: ' ',
          actions: [repeats ? 'Fast forward' : 'Stop'],
          wait: true,
          icon: path.join(__dirname, 'logo.png'),
        },
        (err, res, metadata) => {
          const button1Actions = ['Stop', 'Fast forward'];
          if (metadata.activationType === 'clicked') {
            getActiveWindow().show();
          }
          resolve({
            stopReminder: metadata.activationType === button1Actions[0],
            fastForwardReminder: metadata.activationType === button1Actions[1],
          });
        }
      );
    }
  });
});

function initTray() {
  tray = new Tray(path.join(__dirname, 'logo.png'));
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Quit',
      type: 'normal',
      click: () => {
        isAppQuiting = true;
        app.quit();
      },
    },
  ]);
  tray.on('click', () => {
    getActiveWindow().show();
    getActiveWindow().webContents.send('refresh-app-state');
  });
  tray.setContextMenu(contextMenu);
}

ipcMain.handle('mini-mode-start', () => {
  miniMode = true;
  mainWindow.hide();
  if (!miniWindow) {
    let display = screen.getPrimaryDisplay();
    let screenWidth = display.bounds.width;
    let screenHeight = display.bounds.height;
    const winWidth = 300;
    const winHeight = 400;
    const offset = Math.floor(screenWidth * 0.15);
    miniWindow = new BrowserWindow({
      width: winWidth,
      height: winHeight,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
      },
      alwaysOnTop: true,
      x: screenWidth - offset - winWidth / 2,
      y: screenHeight - offset - winHeight / 2,
      resizable: !app.isPackaged,
    });
    const indexHtmlUrl = url.pathToFileURL(
      path.resolve(__dirname, './index.html')
    ).href;
    if (app.isPackaged) {
      globalShortcut.register('CommandOrControl+R', () => {});
      miniWindow.setMenu(null);
    }
    miniWindow.loadURL(app.isPackaged ? indexHtmlUrl : 'http://localhost:3000');
    miniWindow.on('closed', () => {
      miniWindow = undefined;
    });
  } else refreshAppState();
  miniWindow.show();
});

ipcMain.handle('mini-mode-end', () => {
  miniMode = false;
  mainWindow.show();
  miniWindow.hide();
  refreshAppState();
});

ipcMain.handle('react-load', () => {
  updateWindowView();
});

function updateWindowView() {
  const win = getActiveWindow();
  win.webContents.send('load-window-mode', { miniMode });
}

function refreshAppState() {
  getActiveWindow().webContents.send('refresh-app-state');
}

function getActiveWindow() {
  return miniMode ? miniWindow : mainWindow;
}

const autoLauncher = new AutoLaunch({
  name: 'Reminders',
  path: process.execPath,
  isHidden: true,
});
ipcMain.handle('set-run-at-startup', (event, { value }) => {
  if (value) autoLauncher.enable();
  else autoLauncher.disable();
});
