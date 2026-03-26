const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const path = require('path');
const http = require('http');
const fs = require('fs');
const url = require('url');

let mainWindow;
let employeeWindow;
let server;

// ============================================
// Helper function to inject Electron API into renderer
// ============================================
function injectElectronAPI(browserWindow) {
    console.log('[main.injectElectronAPI] Injecting Electron API...');

    const code = `
    console.log('[injected] Setting up window.electron API...');

    window.electron = {
        ipc: {
            invoke: (channel, ...args) => {
                console.log('[injected.ipc] invoke called:', channel);
                return new Promise((resolve, reject) => {
                    const { ipcRenderer } = require('electron');
                    ipcRenderer.invoke(channel, ...args).then(resolve).catch(reject);
                });
            }
        }
    };

    console.log('[injected] ✅ window.electron API is now available');
    `;

    browserWindow.webContents.executeJavaScript(code).then(() => {
        console.log('[main.injectElectronAPI] ✅ Electron API injection succeeded');
    }).catch((error) => {
        console.error('[main.injectElectronAPI] ❌ Electron API injection failed:', error);
    });
}

// Simple HTTP server for localhost (required for Web NFC API)
function startServer() {
    const PORT = 3000;
    const appDir = __dirname;

    server = http.createServer((req, res) => {
        let filePath = path.join(appDir, req.url === '/' ? 'kintai.html' : req.url);
        const extname = String(path.extname(filePath)).toLowerCase();
        const mimeTypes = {
            '.html': 'text/html',
            '.js': 'text/javascript',
            '.css': 'text/css',
            '.json': 'application/json',
            '.png': 'image/png',
            '.jpg': 'image/jpg',
            '.gif': 'image/gif',
            '.svg': 'image/svg+xml'
        };

        const contentType = mimeTypes[extname] || 'application/octet-stream';

        fs.readFile(filePath, (error, content) => {
            if (error) {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end('<h1>404 Not Found</h1>', 'utf-8');
            } else {
                res.writeHead(200, { 'Content-Type': contentType });
                res.end(content, 'utf-8');
            }
        });
    });

    server.listen(PORT, '0.0.0.0', () => {
        const os = require('os');
        const interfaces = os.networkInterfaces();
        let ipAddress = 'localhost';

        // ローカルIPアドレスを取得
        for (const name of Object.keys(interfaces)) {
            for (const iface of interfaces[name]) {
                if (iface.family === 'IPv4' && !iface.internal) {
                    ipAddress = iface.address;
                    break;
                }
            }
        }

        console.log(`\n========== サーバー起動 ==========`);
        console.log(`ローカルアクセス: http://localhost:${PORT}/`);
        console.log(`リモートアクセス: http://${ipAddress}:${PORT}/`);
        console.log(`  管理画面: http://${ipAddress}:${PORT}/kintai.html`);
        console.log(`  従業員画面: http://${ipAddress}:${PORT}/employee.html`);
        console.log(`================================\n`);
    });
}

function createMainWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: false,  // Changed to false to allow preload execution
            preload: path.join(__dirname, 'preload.js')
        },
        icon: path.join(__dirname, 'assets', 'icon.png')
    });

    mainWindow.loadURL('http://localhost:3000/kintai.html');

    // Inject electron API for HTTP-loaded pages
    mainWindow.webContents.on('did-finish-load', () => {
        console.log('[main] mainWindow did-finish-load event');
        injectElectronAPI(mainWindow);
    });

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
            contextIsolation: false,  // Changed to false to allow preload execution
            preload: path.join(__dirname, 'preload.js')
        },
        icon: path.join(__dirname, 'assets', 'icon.png')
    });

    employeeWindow.loadURL('http://localhost:3000/employee.html');

    // Inject electron API for HTTP-loaded pages
    employeeWindow.webContents.on('did-finish-load', () => {
        console.log('[main] employeeWindow did-finish-load event');
        injectElectronAPI(employeeWindow);
    });

    employeeWindow.webContents.openDevTools();

    employeeWindow.on('closed', () => {
        employeeWindow = null;
    });
}

app.on('ready', () => {
    startServer();
    setTimeout(() => {
        createMainWindow();
        createMenu();
    }, 500);
});

app.on('window-all-closed', () => {
    if (server) server.close();
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

// IPC handlers for Web NFC API
ipcMain.handle('nfc:isSupported', async () => {
    // Web NFC API support is determined at renderer level
    return { supported: true, apiType: 'Web NFC API' };
});

ipcMain.handle('nfc:start', async (event) => {
    try {
        // Notify the renderer to start NFC scanning via Web NFC API
        event.sender.send('nfc:startScanning');
        return { success: true, message: 'NFC scanning started' };
    } catch (error) {
        return { success: false, message: error.message };
    }
});

ipcMain.handle('nfc:stop', async (event) => {
    try {
        event.sender.send('nfc:stopScanning');
        return { success: true, message: 'NFC scanning stopped' };
    } catch (error) {
        return { success: false, message: error.message };
    }
});

// Receive card read events from renderer
ipcMain.on('nfc:cardRead', (event, cardData) => {
    console.log('Card read in main process:', cardData);
    // Broadcast to all windows
    BrowserWindow.getAllWindows().forEach(win => {
        if (win !== event.sender) {
            win.webContents.send('nfc:cardRead', cardData);
        }
    });
});
