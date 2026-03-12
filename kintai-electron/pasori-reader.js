/**
 * PaSoRi (RC-S380) Reader Module for Windows
 * Communicates with PaSoRi via PC/SC Lite (WinSCard on Windows)
 */

let pcsclite;
try {
    pcsclite = require('pcsclite');
} catch (error) {
    console.warn('pcsclite not installed. Install with: npm install pcsclite');
    console.warn('For Windows: Ensure Visual Studio Build Tools with C++ are installed');
    pcsclite = null;
}

class PaSoRiReader {
    constructor() {
        this.pcsc = null;
        this.reader = null;
        this.isReading = false;
        this.cardId = null;
    }

    /**
     * Initialize PaSoRi connection
     */
    async initialize() {
        return new Promise((resolve, reject) => {
            try {
                if (!pcsclite) {
                    throw new Error(
                        'pcsclite is not installed.\n' +
                        'To use PaSoRi on Windows, install pcsclite using:\n' +
                        'npm install pcsclite\n\n' +
                        'Requirements:\n' +
                        '- Visual Studio Build Tools with C++ workload\n' +
                        '- Python 3.x\n\n' +
                        'See PASORI_GUIDE.md for detailed instructions.'
                    );
                }

                this.pcsc = pcsclite();

                this.pcsc.on('reader_added', (reader) => {
                    console.log(`PaSoRi reader added: ${reader.name}`);
                    this.reader = reader;
                    this.onReaderAdded?.(reader.name);

                    reader.on('status', (status) => {
                        this.handleReaderStatus(status);
                    });

                    reader.on('error', (error) => {
                        console.error('PaSoRi reader error:', error);
                        this.onError?.(error);
                    });

                    reader.on('end', () => {
                        console.log('PaSoRi reader disconnected');
                        this.reader = null;
                        this.onReaderRemoved?.();
                    });
                });

                this.pcsc.on('error', (error) => {
                    console.error('PC/SC error:', error);
                    this.onError?.(error);
                });

                // Give readers time to initialize
                setTimeout(() => {
                    if (this.reader) {
                        resolve({ success: true, message: 'PaSoRi initialized' });
                    } else {
                        reject(new Error('PaSoRi reader not found. Please connect PaSoRi.'));
                    }
                }, 1000);

            } catch (error) {
                console.error('Failed to initialize PaSoRi:', error);
                reject(error);
            }
        });
    }

    /**
     * Handle reader status changes
     */
    handleReaderStatus(status) {
        const hasCard = status.state & 0x20; // SCARD_STATE_PRESENT

        if (hasCard) {
            console.log('Card detected on PaSoRi');
            this.onCardDetected?.();
            // Auto-read card after a short delay
            setTimeout(() => this.readCard(), 100);
        }
    }

    /**
     * Read FeliCa card from PaSoRi
     */
    async readCard() {
        if (!this.reader) {
            throw new Error('PaSoRi reader not initialized');
        }

        return new Promise((resolve, reject) => {
            this.reader.transmit(
                this.buildReadCommand(),
                40,
                (err, data) => {
                    if (err) {
                        console.error('Card read error:', err);
                        this.onError?.(err);
                        reject(err);
                    } else {
                        try {
                            const cardData = this.parseCardData(data);
                            this.cardId = cardData.id;
                            console.log('Card read successfully:', cardData);
                            this.onCardRead?.(cardData);
                            resolve(cardData);
                        } catch (error) {
                            console.error('Failed to parse card data:', error);
                            this.onError?.(error);
                            reject(error);
                        }
                    }
                }
            );
        });
    }

    /**
     * Build FeliCa read command for PaSoRi
     * Command structure for FeliCa polling and block read
     */
    buildReadCommand() {
        // FeliCa Polling command
        // FF 00 00 00 05 | D6 06 00 00 FF 00
        // This command polls for FeliCa cards and returns system code
        return Buffer.from([
            0xFF, // CLA - Class byte
            0x00, // INS - Instruction byte
            0x00, // P1
            0x00, // P2
            0x05, // Le - Expected response length
            0xD6, 0x06, 0x00, 0x00, 0xFF // FeliCa Polling parameters
        ]);
    }

    /**
     * Parse card ID from FeliCa response
     */
    parseCardData(responseBuffer) {
        try {
            if (!responseBuffer || responseBuffer.length < 10) {
                throw new Error('Invalid response from PaSoRi');
            }

            // FeliCa card response contains IDm (unique ID)
            // Typical structure: [Response data] [IDm (8 bytes)] [PMm (8 bytes)]
            // We extract the IDm which is typically at bytes 10-17 (0-indexed)

            let idm = '';
            // IDm is usually in the response after the header
            for (let i = 10; i < Math.min(18, responseBuffer.length); i++) {
                idm += responseBuffer[i].toString(16).padStart(2, '0').toUpperCase();
            }

            if (!idm || idm.length === 0) {
                // Fallback: use entire response as card ID
                idm = responseBuffer.slice(10, 18).toString('hex').toUpperCase();
            }

            return {
                id: idm || 'UNKNOWN',
                timestamp: new Date().toISOString(),
                type: 'FeliCa',
                manufacturer: this.parseManufacturer(responseBuffer)
            };
        } catch (error) {
            console.error('Error parsing card data:', error);
            throw error;
        }
    }

    /**
     * Parse manufacturer from card response
     */
    parseManufacturer(buffer) {
        if (!buffer || buffer.length < 10) return 'Unknown';

        // Check response structure to determine card type
        if (buffer[2] === 0x10) return 'Felica (Lite)';
        if (buffer[2] === 0x11) return 'Felica (Standard)';
        return 'Felica';
    }

    /**
     * Stop reading and close connection
     */
    stop() {
        if (this.pcsc) {
            this.pcsc.close();
            this.pcsc = null;
            this.reader = null;
            console.log('PaSoRi connection closed');
        }
    }

    /**
     * Callbacks
     */
    onCardRead = null;
    onCardDetected = null;
    onReaderAdded = null;
    onReaderRemoved = null;
    onError = null;
}

module.exports = PaSoRiReader;
