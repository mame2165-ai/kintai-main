const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');

let mainWindow;
let employeeWindow;

function createMainWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        },
        icon: path.join(__dirname, 'assets', 'icon.png')
    });

    const indexPath = isDev
        ? 'http://localhost:3000'
        : `file://${path.join(__dirname, 'build', 'kintai.html')}`;

    mainWindow.loadFile(path.join(__dirname, 'kintai.html'));

    mainWindow.webContents.openDevTools();

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

function createEmployeeWindow() {
    employeeWindow = new BrowserWindow({
        width: 900,
        height: 700,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        },
        icon: path.join(__dirname, 'assets', 'icon.png')
    });

    employeeWindow.loadFile(path.join(__dirname, 'employee.html'));
    employeeWindow.webContents.openDevTools();

    employeeWindow.on('closed', () => {
        employeeWindow = null;
    });
}

app.on('ready', () => {
    createMainWindow();
    createMenu();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (mainWindow === null) {
        createMainWindow();
    }
});

function createMenu() {
    const template = [
        {
            label: 'ファイル',
            submenu: [
                {
                    label: '従業員ポータルを開く',
                    click: () => {
                        if (employeeWindow === null) {
                            createEmployeeWindow();
                        } else {
                            employeeWindow.focus();
                        }
                    }
                },
                { type: 'separator' },
                { label: '終了', accelerator: 'CmdOrCtrl+Q', click: () => app.quit() }
            ]
        },
        {
            label: '編集',
            submenu: [
                { label: '戻す', accelerator: 'CmdOrCtrl+Z', role: 'undo' },
                { label: 'やり直す', accelerator: 'CmdOrCtrl+Y', role: 'redo' },
                { type: 'separator' },
                { label: '切り取り', accelerator: 'CmdOrCtrl+X', role: 'cut' },
                { label: 'コピー', accelerator: 'CmdOrCtrl+C', role: 'copy' },
                { label: '貼り付け', accelerator: 'CmdOrCtrl+V', role: 'paste' }
            ]
        },
        {
            label: '表示',
            submenu: [
                { label: '開発者ツール', accelerator: 'F12', role: 'toggleDevTools' }
            ]
        }
    ];

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
}

// IPC handlers for future NFC integration
ipcMain.handle('nfc:start', async () => {
    return { success: false, message: 'NFC not yet implemented' };
});

ipcMain.handle('nfc:stop', async () => {
    return { success: false, message: 'NFC not yet implemented' };
});
