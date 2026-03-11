/**
 * NFC Card Handler for Web NFC API
 * Supports reading NFC/PASORI cards in Electron and modern browsers
 */

class NFCHandler {
    constructor() {
        this.isScanning = false;
        this.reader = null;
        this.cardData = null;
    }

    /**
     * Check if Web NFC is supported
     */
    static isSupported() {
        return 'NDEFReader' in window;
    }

    /**
     * Start scanning for NFC cards
     */
    async startScanning() {
        if (!NFCHandler.isSupported()) {
            throw new Error('Web NFC API is not supported in this browser');
        }

        if (this.isScanning) {
            console.warn('Already scanning for NFC cards');
            return;
        }

        try {
            this.reader = new NDEFReader();
            this.isScanning = true;

            await this.reader.scan();

            this.reader.onreading = (event) => {
                this.handleCardRead(event);
            };

            this.reader.onerror = (error) => {
                console.error('NFC reading error:', error);
                this.isScanning = false;
                this.onError?.(error);
            };

            console.log('NFC scanning started');
            this.onScanStart?.();

        } catch (error) {
            this.isScanning = false;
            console.error('Failed to start NFC scanning:', error);
            throw error;
        }
    }

    /**
     * Stop scanning for NFC cards
     */
    stopScanning() {
        if (this.reader) {
            this.reader.stop?.();
            this.isScanning = false;
            console.log('NFC scanning stopped');
            this.onScanStop?.();
        }
    }

    /**
     * Handle NFC card read event
     */
    handleCardRead(event) {
        try {
            const message = event.message;
            let cardId = '';
            let cardData = {};

            // Extract NDEF records from the card
            if (message && message.records && message.records.length > 0) {
                message.records.forEach((record) => {
                    if (record.recordType === 'text') {
                        // Text record - might contain card ID
                        const textData = new TextDecoder().decode(record.data);
                        if (!cardId) cardId = textData;
                    } else if (record.recordType === 'url') {
                        // URL record
                        const urlData = new TextDecoder().decode(record.data);
                        cardData.url = urlData;
                    } else if (record.recordType === 'json') {
                        // JSON record
                        const jsonData = new TextDecoder().decode(record.data);
                        try {
                            cardData = { ...cardData, ...JSON.parse(jsonData) };
                        } catch (e) {
                            console.warn('Failed to parse JSON from card:', e);
                        }
                    }
                });
            }

            // Generate card ID from event data if not found in records
            if (!cardId && event.serialNumber) {
                cardId = event.serialNumber;
            }

            this.cardData = {
                id: cardId || 'UNKNOWN',
                timestamp: new Date().toISOString(),
                data: cardData
            };

            console.log('NFC card read:', this.cardData);
            this.onCardRead?.(this.cardData);

        } catch (error) {
            console.error('Error handling NFC card read:', error);
            this.onError?.(error);
        }
    }

    /**
     * Write NDEF message to NFC card
     */
    async writeCard(message) {
        if (!NFCHandler.isSupported()) {
            throw new Error('Web NFC API is not supported');
        }

        try {
            const writer = new NDEFWriter();
            await writer.write(message);
            console.log('Successfully wrote to NFC card');
            this.onCardWrite?.(message);
        } catch (error) {
            console.error('Failed to write to NFC card:', error);
            throw error;
        }
    }

    /**
     * Callbacks
     */
    onCardRead = null;
    onCardWrite = null;
    onScanStart = null;
    onScanStop = null;
    onError = null;
}

// Export for Node.js environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NFCHandler;
}
