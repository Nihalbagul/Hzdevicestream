/* ============================================
   KPI Calculator Module
   Calculates all Key Performance Indicators
   ============================================ */

import { getWindowData } from '../utils.js';

export class KPICalculator {
    /**
     * Calculate all KPIs for the given data window
     */
    static calculate(data, windowSize) {
        if (data.length === 0) {
            return this.getEmptyKPIs();
        }

        const windowData = getWindowData(data, windowSize);
        
        if (windowData.length === 0) {
            return this.getEmptyKPIs();
        }

        return {
            uptimePct: this.calculateUptime(windowData),
            idlePct: this.calculateIdle(windowData),
            offPct: this.calculateOff(windowData),
            avgKw: this.calculateAvgKw(windowData),
            energy: this.calculateEnergy(windowData),
            avgPf: this.calculateAvgPf(windowData),
            throughput: this.calculateThroughput(windowData, windowSize),
            phaseImbalance: this.calculatePhaseImbalance(windowData)
        };
    }

    /**
     * Calculate uptime percentage
     */
    static calculateUptime(windowData) {
        const runCount = windowData.filter(d => d.state === 'RUN').length;
        return (runCount / windowData.length) * 100;
    }

    /**
     * Calculate idle percentage
     */
    static calculateIdle(windowData) {
        const idleCount = windowData.filter(d => d.state === 'IDLE').length;
        return (idleCount / windowData.length) * 100;
    }

    /**
     * Calculate off percentage
     */
    static calculateOff(windowData) {
        const offCount = windowData.filter(d => d.state === 'OFF').length;
        return (offCount / windowData.length) * 100;
    }

    /**
     * Calculate average power (kW)
     */
    static calculateAvgKw(windowData) {
        return windowData.reduce((sum, d) => sum + d.kw, 0) / windowData.length;
    }

    /**
     * Calculate energy (kWh) - difference in kwh_total register
     */
    static calculateEnergy(windowData) {
        if (windowData.length === 0) return 0;
        const max = Math.max(...windowData.map(d => d.kwh_total));
        const min = Math.min(...windowData.map(d => d.kwh_total));
        return max - min;
    }

    /**
     * Calculate average power factor (only RUN + IDLE)
     */
    static calculateAvgPf(windowData) {
        const runIdleData = windowData.filter(d => d.state === 'RUN' || d.state === 'IDLE');
        if (runIdleData.length === 0) return 0;
        return runIdleData.reduce((sum, d) => sum + d.pf, 0) / runIdleData.length;
    }

    /**
     * Calculate throughput (units/min)
     */
    static calculateThroughput(windowData, windowSize) {
        if (windowData.length === 0) return 0;
        const countDelta = Math.max(...windowData.map(d => d.count_total)) - 
                          Math.min(...windowData.map(d => d.count_total));
        return countDelta / windowSize;
    }

    /**
     * Calculate phase imbalance percentage
     */
    static calculatePhaseImbalance(windowData) {
        const imbalances = windowData.map(d => {
            const currents = [d.ir, d.iy, d.ib];
            const max = Math.max(...currents);
            const min = Math.min(...currents);
            const avg = currents.reduce((s, c) => s + c, 0) / 3;
            return avg > 0 ? ((max - min) / avg) * 100 : 0;
        });
        
        if (imbalances.length === 0) return 0;
        return imbalances.reduce((sum, v) => sum + v, 0) / imbalances.length;
    }

    /**
     * Return empty KPI object
     */
    static getEmptyKPIs() {
        return {
            uptimePct: 0,
            idlePct: 0,
            offPct: 0,
            avgKw: 0,
            energy: 0,
            avgPf: 0,
            throughput: 0,
            phaseImbalance: 0
        };
    }
}

