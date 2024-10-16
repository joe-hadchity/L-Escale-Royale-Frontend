const { contextBridge, ipcRenderer } = require('electron');
console.log('Preload script loaded');
console.log('contextBridge:', contextBridge);
console.log('ipcRenderer:', ipcRenderer);


contextBridge.exposeInMainWorld('electronAPI', {
    getPrinters: () => ipcRenderer.invoke('get-printers'),  // Expose the get-printers function
    printOrder: (data, options) => ipcRenderer.invoke('print-order', data, options),
    onPrintResponse: (callback) => ipcRenderer.on('print-response', callback),  // Listen for print response
});