/* ============================================
   Insights Generator Module
   Generates AI-powered insights from data
   ============================================ */

import { getWindowData } from '../utils.js';
import { CONFIG } from '../config.js';

export class InsightsGenerator {
    /**
     * Generate insights for the given data window
     */
    static generate(data, windowSize) {
        if (data.length === 0) return [];

        const windowData = getWindowData(data, windowSize);
        const insights = [];

        // Insight 1: Extended Idle Period
        const idleInsight = this.detectIdlePeriod(windowData, windowSize);
        if (idleInsight) insights.push(idleInsight);

        // Insight 2: Peak 15-Minute Demand
        const demandInsight = this.detectPeakDemand(windowData);
        if (demandInsight) insights.push(demandInsight);

        // Insight 3: Low Power Factor Window
        const pfInsight = this.detectLowPowerFactor(windowData);
        if (pfInsight) insights.push(pfInsight);

        return insights.slice(0, 3); // Return top 3
    }

    /**
     * Detect extended idle periods
     */
    static detectIdlePeriod(windowData, windowSize) {
        const idleThreshold = Math.min(CONFIG.INSIGHTS.idleThreshold, windowSize * 0.5);
        let idleStart = null;
        let maxIdleDuration = 0;
        let maxIdleStart = null;

        windowData.forEach((d) => {
            if (d.state === 'IDLE') {
                if (idleStart === null) {
                    idleStart = d.timestamp;
                }
            } else {
                if (idleStart !== null) {
                    const duration = (d.timestamp - idleStart) / (60 * 1000);
                    if (duration > maxIdleDuration) {
                        maxIdleDuration = duration;
                        maxIdleStart = idleStart;
                    }
                    idleStart = null;
                }
            }
        });

        // Check if still in idle at end
        if (idleStart !== null && windowData.length > 0) {
            const duration = (windowData[windowData.length - 1].timestamp - idleStart) / (60 * 1000);
            if (duration > maxIdleDuration) {
                maxIdleDuration = duration;
                maxIdleStart = idleStart;
            }
        }

        if (maxIdleDuration >= idleThreshold) {
            return {
                type: 'warning',
                title: 'Extended Idle Period Detected',
                message: `Machine was idle for ${maxIdleDuration.toFixed(1)} minutes starting at ${maxIdleStart.toLocaleTimeString()}. This may indicate production inefficiency.`
            };
        }

        return null;
    }

    /**
     * Detect peak 15-minute demand
     */
    static detectPeakDemand(windowData) {
        const demandWindow = CONFIG.INSIGHTS.demandWindow;
        const demandWindowMs = demandWindow * 60 * 1000;
        let maxDemand = 0;
        let maxDemandTime = null;

        for (let i = 0; i < windowData.length; i++) {
            const windowEnd = windowData[i].timestamp;
            const windowStart = new Date(windowEnd - demandWindowMs);
            const demandData = windowData.filter(d => 
                d.timestamp >= windowStart && d.timestamp <= windowEnd
            );
            
            if (demandData.length > 0) {
                const avgDemand = demandData.reduce((sum, d) => sum + d.kw, 0) / demandData.length;
                if (avgDemand > maxDemand) {
                    maxDemand = avgDemand;
                    maxDemandTime = windowEnd;
                }
            }
        }

        if (maxDemand > 0) {
            return {
                type: 'info',
                title: 'Peak 15-Minute Demand',
                message: `Maximum rolling 15-minute average power demand: ${maxDemand.toFixed(2)} kW at ${maxDemandTime.toLocaleTimeString()}.`
            };
        }

        return null;
    }

    /**
     * Detect low power factor windows
     */
    static detectLowPowerFactor(windowData) {
        const pfThreshold = CONFIG.INSIGHTS.pfThreshold;
        const pfMinDuration = CONFIG.INSIGHTS.pfMinDuration;
        let lowPfStart = null;
        let maxLowPfDuration = 0;
        let maxLowPfStart = null;

        windowData.forEach((d) => {
            if (d.pf < pfThreshold && (d.state === 'RUN' || d.state === 'IDLE')) {
                if (lowPfStart === null) {
                    lowPfStart = d.timestamp;
                }
            } else {
                if (lowPfStart !== null) {
                    const duration = (d.timestamp - lowPfStart) / (60 * 1000);
                    if (duration >= pfMinDuration && duration > maxLowPfDuration) {
                        maxLowPfDuration = duration;
                        maxLowPfStart = lowPfStart;
                    }
                    lowPfStart = null;
                }
            }
        });

        // Check if still in low PF at end
        if (lowPfStart !== null && windowData.length > 0) {
            const duration = (windowData[windowData.length - 1].timestamp - lowPfStart) / (60 * 1000);
            if (duration >= pfMinDuration && duration > maxLowPfDuration) {
                maxLowPfDuration = duration;
                maxLowPfStart = lowPfStart;
            }
        }

        if (maxLowPfDuration >= pfMinDuration) {
            return {
                type: 'danger',
                title: 'Low Power Factor Detected',
                message: `Power factor below 0.8 for ${maxLowPfDuration.toFixed(1)} minutes starting at ${maxLowPfStart.toLocaleTimeString()}. This may indicate reactive power issues.`
            };
        }

        return null;
    }
}

