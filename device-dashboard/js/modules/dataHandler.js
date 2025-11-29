/* ============================================
   Data Handler Module
   Handles SSE streams and replay functionality
   ============================================ */

import { CONFIG } from '../config.js';

export class DataHandler {
    constructor(onDataPoint) {
        this.onDataPoint = onDataPoint;
        this.data = [];
        this.eventSource = null;
        this.replayInterval = null;
        this.replayData = [];
        this.replayIndex = 0;
        this.lastUpdateTime = null;
        this.isLiveMode = true;
    }

    /**
     * Start SSE stream connection
     */
    startSSE() {
        this.stop();
        this.isLiveMode = true;
        console.log('Connecting to SSE server at:', CONFIG.SSE_URL);
        this.eventSource = new EventSource(CONFIG.SSE_URL);
        
        this.eventSource.onopen = () => {
            console.log('SSE connection opened successfully');
        };
        
        this.eventSource.onmessage = (event) => {
            try {
                const record = JSON.parse(event.data);
                // For live stream, use current time instead of file timestamp
                record.ts = new Date().toISOString();
                this.addDataPoint(record);
            } catch (e) {
                console.error('Error parsing SSE data:', e, 'Raw data:', event.data);
            }
        };

        this.eventSource.onerror = (error) => {
            console.error('SSE error:', error);
            console.error('EventSource readyState:', this.eventSource?.readyState);
            // readyState: 0 = CONNECTING, 1 = OPEN, 2 = CLOSED
            if (this.eventSource?.readyState === EventSource.CLOSED) {
                if (this.onError) {
                    this.onError('Connection lost. Please check SSE server.');
                }
            }
        };
    }

    /**
     * Start replay from JSONL data
     */
    startReplay(jsonlData) {
        this.stop();
        this.isLiveMode = false;
        this.data = [];
        this.replayData = jsonlData;
        this.replayIndex = 0;
        
        this.replayInterval = setInterval(() => {
            if (this.replayIndex < this.replayData.length) {
                this.addDataPoint(this.replayData[this.replayIndex]);
                this.replayIndex++;
            } else {
                this.stop();
            }
        }, 1000);
    }

    /**
     * Add a data point and trigger callback
     */
    addDataPoint(record) {
        const timestamp = new Date(record.ts);
        record.timestamp = timestamp;
        
        // Check for gaps
        if (this.lastUpdateTime) {
            const gap = timestamp - this.lastUpdateTime;
            if (gap > CONFIG.GAP_THRESHOLD) {
                if (this.onGap) {
                    this.onGap(gap);
                }
            } else {
                if (this.onNoGap) {
                    this.onNoGap();
                }
            }
        }
        
        this.lastUpdateTime = timestamp;
        this.data.push(record);
        
        // Trigger callback
        if (this.onDataPoint) {
            this.onDataPoint(record);
        }
    }

    /**
     * Stop all data streams
     */
    stop() {
        if (this.eventSource) {
            this.eventSource.close();
            this.eventSource = null;
        }
        if (this.replayInterval) {
            clearInterval(this.replayInterval);
            this.replayInterval = null;
        }
    }

    /**
     * Get all data
     */
    getData() {
        return this.data;
    }

    /**
     * Clear all data
     */
    clearData() {
        this.data = [];
        this.lastUpdateTime = null;
    }

    /**
     * Set error callback
     */
    setErrorCallback(callback) {
        this.onError = callback;
    }

    /**
     * Set gap detection callback
     */
    setGapCallback(callback) {
        this.onGap = callback;
    }

    /**
     * Set no-gap callback (for hiding badge)
     */
    setNoGapCallback(callback) {
        this.onNoGap = callback;
    }
}

