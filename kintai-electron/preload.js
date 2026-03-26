const { contextBridge, ipcRenderer } = require('electron');

console.log('[preload] ============ Preload Script Loaded ============');

contextBridge.exposeInMainWorld('electron', {
    ipc: {
        invoke: (channel, ...args) => {
            console.log('[preload.ipc] invoke called:', channel);
            return ipcRenderer.invoke(channel, ...args);
        },
        send: (channel, ...args) => {
            console.log('[preload.ipc] send called:', channel);
            return ipcRenderer.send(channel, ...args);
        },
        on: (channel, listener) => {
            console.log('[preload.ipc] on called:', channel);
            return ipcRenderer.on(channel, listener);
        },
        once: (channel, listener) => {
            console.log('[preload.ipc] once called:', channel);
            return ipcRenderer.once(channel, listener);
        },
        removeListener: (channel, listener) => {
            console.log('[preload.ipc] removeListener called:', channel);
            return ipcRenderer.removeListener(channel, listener);
        }
    },
    nfc: {
        isSupported: () => {
            console.log('[preload.nfc] isSupported called');
            return ipcRenderer.invoke('nfc:isSupported');
        },
        start: () => {
            console.log('[preload.nfc] start called');
            return ipcRenderer.invoke('nfc:start');
        },
        stop: () => {
            console.log('[preload.nfc] stop called');
            return ipcRenderer.invoke('nfc:stop');
        },
        onCardRead: (listener) => {
            console.log('[preload.nfc] onCardRead listener registered');
            return ipcRenderer.on('nfc:cardRead', listener);
        },
        onStartScanning: (listener) => {
            console.log('[preload.nfc] onStartScanning listener registered');
            return ipcRenderer.on('nfc:startScanning', listener);
        },
        onStopScanning: (listener) => {
            console.log('[preload.nfc] onStopScanning listener registered');
            return ipcRenderer.on('nfc:stopScanning', listener);
        }
    }
});

// PaSoRi API は後で実装予定のため、コメント化
// contextBridge.exposeInMainWorld('electron.pasori', {
//     initialize: () => ipcRenderer.invoke('pasori:initialize'),
//     readCard: () => ipcRenderer.invoke('pasori:readCard'),
//     stop: () => ipcRenderer.invoke('pasori:stop'),
//     onCardRead: (listener) => ipcRenderer.on('pasori:cardRead', listener),
//     onCardDetected: (listener) => ipcRenderer.on('pasori:cardDetected', listener),
//     onReaderAdded: (listener) => ipcRenderer.on('pasori:readerAdded', listener),
//     onReaderRemoved: (listener) => ipcRenderer.on('pasori:readerRemoved', listener),
//     onError: (listener) => ipcRenderer.on('pasori:error', listener)
// });

console.log('[preload] ✅ All APIs exposed to renderer process');

contextBridge.exposeInMainWorld('app', {
    version: '1.0.0',
    platform: process.platform,
    isElectron: true
});
