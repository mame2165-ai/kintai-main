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
    },
    pasori: {
        initialize: () => ipcRenderer.invoke('pasori:initialize'),
        readCard: () => ipcRenderer.invoke('pasori:readCard'),
        stop: () => ipcRenderer.invoke('pasori:stop'),
        onCardRead: (listener) => ipcRenderer.on('pasori:cardRead', listener),
        onCardDetected: (listener) => ipcRenderer.on('pasori:cardDetected', listener),
        onReaderAdded: (listener) => ipcRenderer.on('pasori:readerAdded', listener),
        onReaderRemoved: (listener) => ipcRenderer.on('pasori:readerRemoved', listener),
        onError: (listener) => ipcRenderer.on('pasori:error', listener)
    }
});

contextBridge.exposeInMainWorld('app', {
    version: '1.0.0',
    platform: process.platform,
    isElectron: true
});
