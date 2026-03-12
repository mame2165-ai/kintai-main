/**
 * PaSoRi UI Module
 * Provides UI components for PaSoRi card reading in Electron
 */

class PaSoRiUI {
    constructor() {
        this.isInitialized = false;
        this.isReading = false;
        this.lastCardData = null;
    }

    /**
     * Initialize PaSoRi UI
     */
    async initialize() {
        try {
            if (!window.electron?.pasori) {
                throw new Error('PaSoRi API not available. Running in non-Electron environment?');
            }

            // Initialize PaSoRi reader
            const result = await window.electron.pasori.initialize();
            if (!result.success) {
                throw new Error(result.message);
            }

            // Set up event listeners
            this.setupEventListeners();
            this.isInitialized = true;

            console.log('PaSoRi UI initialized successfully');
            return { success: true, message: 'PaSoRi initialized' };
        } catch (error) {
            console.error('Failed to initialize PaSoRi UI:', error);
            return { success: false, message: error.message };
        }
    }

    /**
     * Set up PaSoRi event listeners
     */
    setupEventListeners() {
        // Card read event
        window.electron.pasori.onCardRead((event, cardData) => {
            this.lastCardData = cardData;
            console.log('Card data received:', cardData);
            this.onCardRead?.(cardData);
        });

        // Card detected event
        window.electron.pasori.onCardDetected(() => {
            console.log('Card detected on PaSoRi');
            this.onCardDetected?.();
        });

        // Reader added event
        window.electron.pasori.onReaderAdded((event, readerName) => {
            console.log(`PaSoRi reader added: ${readerName}`);
            this.onReaderAdded?.(readerName);
        });

        // Reader removed event
        window.electron.pasori.onReaderRemoved(() => {
            console.log('PaSoRi reader removed');
            this.onReaderRemoved?.();
        });

        // Error event
        window.electron.pasori.onError((event, errorMessage) => {
            console.error('PaSoRi error:', errorMessage);
            this.onError?.(errorMessage);
        });
    }

    /**
     * Manually read card
     */
    async readCard() {
        try {
            if (!this.isInitialized) {
                throw new Error('PaSoRi not initialized');
            }

            this.isReading = true;
            const result = await window.electron.pasori.readCard();

            if (result.success) {
                this.lastCardData = result.data;
                this.onCardRead?.(result.data);
                return { success: true, data: result.data };
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            console.error('Failed to read card:', error);
            this.onError?.(error.message);
            return { success: false, message: error.message };
        } finally {
            this.isReading = false;
        }
    }

    /**
     * Stop PaSoRi
     */
    async stop() {
        try {
            const result = await window.electron.pasori.stop();
            this.isInitialized = false;
            return result;
        } catch (error) {
            console.error('Failed to stop PaSoRi:', error);
            return { success: false, message: error.message };
        }
    }

    /**
     * Get last card data
     */
    getLastCardData() {
        return this.lastCardData;
    }

    /**
     * Check if is reading
     */
    getIsReading() {
        return this.isReading;
    }

    /**
     * Create and inject PaSoRi reader UI element
     */
    createReaderUI(options = {}) {
        const {
            containerId = 'pasori-container',
            onSuccess = null,
            onError = null,
            autoStart = true
        } = options;

        const container = document.getElementById(containerId);
        if (!container) {
            console.warn(`Container with ID '${containerId}' not found`);
            return null;
        }

        const html = `
            <div id="pasori-reader-ui" class="pasori-reader-ui">
                <div class="pasori-status">
                    <div class="status-indicator" id="status-indicator">
                        <span class="status-dot"></span>
                        <span class="status-text" id="status-text">待機中...</span>
                    </div>
                </div>
                <div class="pasori-message" id="pasori-message">
                    パソリにICカードをかざしてください
                </div>
                <div class="pasori-card-info" id="pasori-card-info" style="display:none;">
                    <div class="card-id" id="card-id">カードID: </div>
                    <div class="card-timestamp" id="card-timestamp">読み込み時刻: </div>
                </div>
                <button id="pasori-manual-read" class="btn-secondary" style="margin-top:10px;">
                    手動読み込み
                </button>
            </div>
            <style>
                .pasori-reader-ui {
                    padding: 20px;
                    border: 2px solid #007bff;
                    border-radius: 8px;
                    background-color: #f0f8ff;
                    text-align: center;
                    font-family: 'Arial', sans-serif;
                }
                .pasori-status {
                    margin-bottom: 15px;
                }
                .status-indicator {
                    display: inline-flex;
                    align-items: center;
                    gap: 10px;
                }
                .status-dot {
                    width: 12px;
                    height: 12px;
                    border-radius: 50%;
                    background-color: #28a745;
                    animation: pulse 2s infinite;
                }
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }
                .status-text {
                    font-weight: bold;
                    color: #28a745;
                }
                .pasori-message {
                    font-size: 16px;
                    color: #333;
                    margin: 15px 0;
                }
                .pasori-card-info {
                    background-color: #e8f5e9;
                    border-left: 4px solid #28a745;
                    padding: 15px;
                    margin: 15px 0;
                    text-align: left;
                    border-radius: 4px;
                }
                .card-id {
                    font-weight: bold;
                    margin-bottom: 10px;
                    word-break: break-all;
                }
                .card-timestamp {
                    font-size: 12px;
                    color: #666;
                }
                .btn-secondary {
                    padding: 8px 16px;
                    background-color: #6c757d;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 14px;
                }
                .btn-secondary:hover {
                    background-color: #5a6268;
                }
                .btn-secondary:disabled {
                    background-color: #ccc;
                    cursor: not-allowed;
                }
            </style>
        `;

        container.innerHTML = html;

        // Set up event handlers
        const manualReadBtn = document.getElementById('pasori-manual-read');
        if (manualReadBtn) {
            manualReadBtn.addEventListener('click', async () => {
                manualReadBtn.disabled = true;
                const result = await this.readCard();
                manualReadBtn.disabled = false;

                if (result.success) {
                    this.displayCardInfo(result.data);
                    onSuccess?.(result.data);
                } else {
                    this.showError(result.message);
                    onError?.(result.message);
                }
            });
        }

        // Set up PaSoRi callbacks
        this.onCardRead = (cardData) => {
            this.displayCardInfo(cardData);
            onSuccess?.(cardData);
        };

        this.onCardDetected = () => {
            this.updateStatus('読み込み中...', '#ffc107');
        };

        this.onReaderAdded = () => {
            this.updateStatus('準備完了', '#28a745');
        };

        this.onReaderRemoved = () => {
            this.updateStatus('リーダー未接続', '#dc3545');
            document.getElementById('pasori-card-info').style.display = 'none';
        };

        this.onError = (message) => {
            this.showError(message);
        };

        if (autoStart) {
            this.initialize();
        }

        return container;
    }

    /**
     * Update status display
     */
    updateStatus(text, color = '#28a745') {
        const statusText = document.getElementById('status-text');
        const statusDot = document.querySelector('.status-dot');

        if (statusText) {
            statusText.textContent = text;
        }
        if (statusDot) {
            statusDot.style.backgroundColor = color;
        }
    }

    /**
     * Display card information
     */
    displayCardInfo(cardData) {
        const cardInfoDiv = document.getElementById('pasori-card-info');
        const cardIdDiv = document.getElementById('card-id');
        const cardTimestampDiv = document.getElementById('card-timestamp');

        if (cardInfoDiv && cardIdDiv && cardTimestampDiv) {
            cardIdDiv.textContent = `カードID: ${cardData.id}`;
            const timestamp = new Date(cardData.timestamp).toLocaleString('ja-JP');
            cardTimestampDiv.textContent = `読み込み時刻: ${timestamp}`;
            cardInfoDiv.style.display = 'block';
        }

        this.updateStatus('カード読み込み完了', '#28a745');
    }

    /**
     * Show error message
     */
    showError(message) {
        const messageDiv = document.getElementById('pasori-message');
        if (messageDiv) {
            messageDiv.textContent = `エラー: ${message}`;
            messageDiv.style.color = '#dc3545';
        }
        this.updateStatus('エラー発生', '#dc3545');

        // Reset message after 5 seconds
        setTimeout(() => {
            if (messageDiv) {
                messageDiv.textContent = 'パソリにICカードをかざしてください';
                messageDiv.style.color = '#333';
            }
        }, 5000);
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

// Export for use in HTML
if (typeof window !== 'undefined') {
    window.PaSoRiUI = PaSoRiUI;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = PaSoRiUI;
}
