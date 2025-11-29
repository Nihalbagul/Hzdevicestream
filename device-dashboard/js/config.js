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
    
    // SSE Server - Auto-detect based on environment
    // To set a custom backend URL, add this before loading dashboard.js:
    // <script>window.SSE_BACKEND_URL = 'https://your-backend-url.com/stream';</script>
    SSE_URL: (() => {
        // Check if custom URL is set via window variable
        if (typeof window !== 'undefined' && window.SSE_BACKEND_URL) {
            return window.SSE_BACKEND_URL;
        }
        
        // In production, detect environment
        if (typeof window !== 'undefined') {
            const isProduction = window.location.hostname !== 'localhost' && 
                                window.location.hostname !== '127.0.0.1' &&
                                window.location.hostname !== '';
            
            if (isProduction) {
                // Try to get from window.ENV (set via script tag)
                if (window.ENV?.SSE_URL) {
                    return window.ENV.SSE_URL;
                }
                
                // Default: You need to set this to your backend URL
                // Update this line with your deployed backend URL:
                // return 'https://your-backend.onrender.com/stream';
                
                // For now, return a placeholder that will show an error
                console.warn('SSE_URL not configured. Please set window.SSE_BACKEND_URL or update config.js');
                return 'https://your-backend-url-here.com/stream';
            }
        }
        // Development: localhost
        return 'http://localhost:8080/stream';
    })()
};

