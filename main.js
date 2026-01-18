
const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 450,
    height: 850,
    titleBarStyle: 'hiddenInset', // Kiểu thanh tiêu đề chuẩn macOS
    backgroundColor: '#f8fafc',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  // Trong môi trường phát triển, ta load index.html
  win.loadFile('index.html');
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
