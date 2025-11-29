/* ============================================
   Configuration Constants
   ============================================ */

export const CONFIG = {
    // Update Settings
    UPDATE_THROTTLE: 2000,        // Update every 2 seconds
    CHART_UPDATE_INTERVAL: 3000,  // Charts update every 3 seconds
    GAP_THRESHOLD: 10000,         // 10 seconds in ms
    
    // Default Window Size
    DEFAULT_WINDOW_SIZE: 15,      // minutes
    
    // KPI Change Thresholds
    THRESHOLDS: {
        uptimePct: 1,
        idlePct: 1,
        offPct: 1,
        avgKw: 0.1,
        energy: 0.01,
        avgPf: 0.01,
        throughput: 0.1,
        phaseImbalance: 0.5
    },
    
    // Insight Settings
    INSIGHTS: {
        idleThreshold: 30,        // minutes (or 50% of window)
        demandWindow: 15,         // minutes
        pfThreshold: 0.8,
        pfMinDuration: 5,         // minutes
        phaseImbalanceThreshold: 15, // percentage
        phaseImbalanceMinDuration: 2 // minutes
    },
    
    // SSE Server
    SSE_URL: 'http://localhost:8080/stream'
};

