/* ============================================
   Device Stream Dashboard - Main Class
   Orchestrates all dashboard functionality
   ============================================ */

import { CONFIG } from './config.js';
import { animateValue, hasSignificantChange } from './utils.js';
import { DataHandler } from './modules/dataHandler.js';
import { KPICalculator } from './modules/kpiCalculator.js';
import { InsightsGenerator } from './modules/insightsGenerator.js';
import { ChartManager } from './modules/chartManager.js';
import { CSVExporter } from './modules/csvExporter.js';

class DeviceDashboard {
    constructor() {
        // Initialize modules
        this.dataHandler = new DataHandler((record) => this.onDataPoint(record));
        this.chartManager = new ChartManager();
        
        // Dashboard state
        this.windowSize = CONFIG.DEFAULT_WINDOW_SIZE;
        this.lastKPIValues = {};
        this.lastChartUpdate = 0;
        this.insightElements = [];
        this.lastInsightTypes = [];
        
        // Update throttling
        this.lastUpdate = 0;
        this.pendingUpdate = false;
        
        // Setup callbacks
        this.setupDataHandlerCallbacks();
        
        // Initialize dashboard
        this.init();
    }

    /**
     * Initialize dashboard
     */
    init() {
        this.hideLoadingScreen();
        this.setupEventListeners();
        this.chartManager.init();
        this.dataHandler.startSSE();
    }

    /**
     * Setup data handler callbacks
     */
    setupDataHandlerCallbacks() {
        this.dataHandler.setErrorCallback((message) => {
            this.showStatusBadge('error', message);
        });
        
        this.dataHandler.setGapCallback((gap) => {
            this.showStatusBadge('error', `No data for ${(gap / 1000).toFixed(1)}s`);
        });
        
        this.dataHandler.setNoGapCallback(() => {
            this.hideStatusBadge();
        });
    }

    /**
     * Hide loading screen
     */
    hideLoadingScreen() {
        setTimeout(() => {
            const loadingScreen = document.getElementById('loadingScreen');
            if (loadingScreen) {
                loadingScreen.classList.add('hidden');
                setTimeout(() => {
                    loadingScreen.style.display = 'none';
                }, 800);
            }
        }, 2000);
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Data source selector
        document.getElementById('dataSource').addEventListener('change', (e) => {
            if (e.target.value === 'sse') {
                this.dataHandler.clearData();
                this.dataHandler.startSSE();
            } else {
                this.dataHandler.stop();
                this.dataHandler.clearData();
                document.getElementById('replayBtn').style.display = 'inline-block';
            }
        });

        // Replay file button
        document.getElementById('replayBtn').addEventListener('click', () => {
            document.getElementById('fileInput').click();
        });

        // File input
        document.getElementById('fileInput').addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (file) {
                const text = await file.text();
                const jsonlData = text.trim().split('\n').map(line => JSON.parse(line));
                this.dataHandler.startReplay(jsonlData);
            }
        });

        // Window size selector
        document.getElementById('windowSize').addEventListener('change', (e) => {
            this.windowSize = parseInt(e.target.value);
            this.lastUpdate = 0; // Force immediate update
            this.updateDashboard();
        });

        // Export CSV button
        document.getElementById('exportBtn').addEventListener('click', () => {
            this.exportCSV();
        });
    }

    /**
     * Handle new data point
     */
    onDataPoint(record) {
        // Keep only data within window
        const windowMs = this.windowSize * 60 * 1000;
        const data = this.dataHandler.getData();
        const cutoff = record.timestamp - windowMs;
        
        // Filter data in handler
        this.dataHandler.data = data.filter(d => d.timestamp >= cutoff);
        
        // Schedule dashboard update
        this.scheduleUpdate();
    }

    /**
     * Schedule dashboard update with throttling
     */
    scheduleUpdate() {
        const now = Date.now();
        const timeSinceLastUpdate = now - this.lastUpdate;
        
        if (timeSinceLastUpdate >= CONFIG.UPDATE_THROTTLE) {
            this.updateDashboard();
            this.lastUpdate = now;
            this.pendingUpdate = false;
        } else {
            if (!this.pendingUpdate) {
                this.pendingUpdate = true;
                const delay = CONFIG.UPDATE_THROTTLE - timeSinceLastUpdate;
                setTimeout(() => {
                    if (this.pendingUpdate) {
                        this.updateDashboard();
                        this.lastUpdate = Date.now();
                        this.pendingUpdate = false;
                    }
                }, delay);
            }
        }
    }

    /**
     * Update entire dashboard
     */
    updateDashboard() {
        const data = this.dataHandler.getData();
        const currentKPIs = KPICalculator.calculate(data, this.windowSize);
        const hasChange = hasSignificantChange(currentKPIs, this.lastKPIValues, CONFIG.THRESHOLDS);
        
        // Update KPIs and insights if significant change
        if (hasChange || Object.keys(this.lastKPIValues).length === 0) {
            this.updateKPIs(currentKPIs);
            this.updateInsights(data);
            this.lastKPIValues = currentKPIs;
        }
        
        // Update charts less frequently
        const now = Date.now();
        if (!this.lastChartUpdate || (now - this.lastChartUpdate) >= CONFIG.CHART_UPDATE_INTERVAL) {
            this.chartManager.update(data, this.windowSize);
            this.lastChartUpdate = now;
        }
    }

    /**
     * Update KPI displays
     */
    updateKPIs(kpis) {
        const prevValues = {
            uptimePct: parseFloat(document.getElementById('uptimePct').textContent) || 0,
            idlePct: parseFloat(document.getElementById('idlePct').textContent) || 0,
            offPct: parseFloat(document.getElementById('offPct').textContent) || 0,
            avgKw: parseFloat(document.getElementById('avgKw').textContent) || 0,
            energy: parseFloat(document.getElementById('energy').textContent) || 0,
            avgPf: parseFloat(document.getElementById('avgPf').textContent) || 0,
            throughput: parseFloat(document.getElementById('throughput').textContent) || 0,
            phaseImbalance: parseFloat(document.getElementById('phaseImbalance').textContent) || 0
        };
        
        animateValue(document.getElementById('uptimePct'), prevValues.uptimePct, kpis.uptimePct, 1200, '%');
        animateValue(document.getElementById('idlePct'), prevValues.idlePct, kpis.idlePct, 1200, '%');
        animateValue(document.getElementById('offPct'), prevValues.offPct, kpis.offPct, 1200, '%');
        animateValue(document.getElementById('avgKw'), prevValues.avgKw, kpis.avgKw, 1200);
        animateValue(document.getElementById('energy'), prevValues.energy, kpis.energy, 1200);
        animateValue(document.getElementById('avgPf'), prevValues.avgPf, kpis.avgPf, 1200);
        animateValue(document.getElementById('throughput'), prevValues.throughput, kpis.throughput, 1200);
        animateValue(document.getElementById('phaseImbalance'), prevValues.phaseImbalance, kpis.phaseImbalance, 1200, '%');
    }

    /**
     * Update insights display
     */
    updateInsights(data) {
        const insights = InsightsGenerator.generate(data, this.windowSize);
        const container = document.getElementById('insightsContainer');
        
        const currentTypes = insights.map(i => i.title);
        const structureChanged = 
            currentTypes.length !== this.lastInsightTypes.length ||
            !currentTypes.every((type, idx) => type === this.lastInsightTypes[idx]);
        
        if (insights.length === 0) {
            if (container.children.length === 0 || container.children[0].textContent !== 'No significant insights detected in current window.') {
                container.innerHTML = '<div class="insight-card">No significant insights detected in current window.</div>';
            }
            this.lastInsightTypes = [];
            this.insightElements = [];
            return;
        }

        // If structure changed, recreate cards
        if (structureChanged) {
            container.innerHTML = insights.map((insight, idx) => `
                <div class="insight-card ${insight.type}" data-insight-id="${idx}">
                    <h3>${insight.title}</h3>
                    <p class="insight-message">${insight.message}</p>
                </div>
            `).join('');
            
            this.insightElements = Array.from(container.querySelectorAll('.insight-message'));
            this.lastInsightTypes = currentTypes;
        } else {
            // Structure unchanged, only update message text
            insights.forEach((insight, idx) => {
                if (this.insightElements[idx]) {
                    this.insightElements[idx].textContent = insight.message;
                }
            });
        }
    }

    /**
     * Show status badge
     */
    showStatusBadge(type, message) {
        const badge = document.getElementById('statusBadge');
        badge.className = `status-badge ${type}`;
        badge.textContent = message;
        badge.setAttribute('aria-label', message);
    }

    /**
     * Hide status badge
     */
    hideStatusBadge() {
        const badge = document.getElementById('statusBadge');
        badge.className = 'status-badge';
        badge.style.display = 'none';
    }

    /**
     * Export CSV
     */
    exportCSV() {
        const data = this.dataHandler.getData();
        CSVExporter.export(
            data,
            this.windowSize,
            (message) => {
                this.showStatusBadge('success', message);
                setTimeout(() => this.hideStatusBadge(), 3000);
            },
            (error) => {
                alert(error);
            }
        );
    }
}

// Initialize dashboard when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new DeviceDashboard();
    });
} else {
    new DeviceDashboard();
}

