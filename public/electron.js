const { app, BrowserWindow } = require('electron');
const path = require('path');
const url = require('url');
const electronRemote = require('@electron/remote/main');

electronRemote.initialize();

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });
  electronRemote.enable(mainWindow.webContents);

  const indexHtmlUrl = url.pathToFileURL(
    path.resolve(__dirname, './index.html')
  ).href;
  mainWindow.loadURL(app.isPackaged ? indexHtmlUrl : 'http://localhost:3000');
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});
