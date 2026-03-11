const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
    ipc: {
        invoke: (channel, ...args) => ipcRenderer.invoke(channel, ...args),
        send: (channel, ...args) => ipcRenderer.send(channel, ...args),
        on: (channel, listener) => ipcRenderer.on(channel, listener),
        once: (channel, listener) => ipcRenderer.once(channel, listener),
        removeListener: (channel, listener) => ipcRenderer.removeListener(channel, listener)
    },
    nfc: {
        isSupported: () => ipcRenderer.invoke('nfc:isSupported'),
        start: () => ipcRenderer.invoke('nfc:start'),
        stop: () => ipcRenderer.invoke('nfc:stop'),
        onCardRead: (listener) => ipcRenderer.on('nfc:cardRead', listener),
        onStartScanning: (listener) => ipcRenderer.on('nfc:startScanning', listener),
        onStopScanning: (listener) => ipcRenderer.on('nfc:stopScanning', listener)
    }
});

contextBridge.exposeInMainWorld('app', {
    version: '1.0.0',
    platform: process.platform,
    isElectron: true
});
