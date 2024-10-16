const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { PosPrinter } = require('electron-pos-printer');
const { autoUpdater } = require('electron-updater');

let mainWindow;

async function createWindow() {
    const isDev = await import('electron-is-dev');  // Dynamic import for ES Module

    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
            enableRemoteModule: false,          
        },
    });

    const startUrl = isDev.default
        ? 'http://localhost:3000'
        : `file://${path.join(__dirname, '../build/index.html')}`;

    mainWindow.loadURL(startUrl);
    console.log('startUrl:', startUrl);

    mainWindow.on('closed', () => (mainWindow = null));

    if (!isDev.default) {
        console.log('Checking for updates...');
        autoUpdater.checkForUpdatesAndNotify();
    }

    ipcMain.handle('get-printers', async () => {
        try {
            const printers = await mainWindow.webContents.getPrintersAsync();
            return printers;
        } catch (error) {
            console.error('Error fetching printers:', error);
            throw error;
        }
    });

    ipcMain.handle('print-order', async (event, data, options) => {
        try {
            await PosPrinter.print(data, options);
            return { success: true };
        } catch (error) {
            console.error('Print failed:', error);
            return { success: false, error: error.message };
        }
    });

    mainWindow.webContents.once('did-finish-load', () => {
        console.log('Window finished loading');
    });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

// Auto-updater events
autoUpdater.on('update-available', () => {
    console.log('Update available.');
});

autoUpdater.on('update-downloaded', () => {
    console.log('Update downloaded; will install now.');
    autoUpdater.quitAndInstall();
});
