/* ============================================
   Chart Manager Module
   Handles Chart.js initialization and updates
   ============================================ */

import { getWindowData } from '../utils.js';

export class ChartManager {
    constructor() {
        this.charts = {};
        this.chartBaseTime = null;
    }

    /**
     * Initialize all charts
     */
    init() {
        const chartOptions = this.getBaseChartOptions();
        
        this.charts.power = this.initPowerChart(chartOptions);
        this.charts.current = this.initCurrentChart(chartOptions);
        this.charts.voltage = this.initVoltageChart(chartOptions);
        this.charts.throughput = this.initThroughputChart(chartOptions);
    }

    /**
     * Get base chart options
     */
    getBaseChartOptions() {
        return {
            responsive: true,
            maintainAspectRatio: true,
            animation: {
                duration: 2000,
                easing: 'easeOutQuart'
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        color: '#ffffff',
                        font: { family: 'Inter', size: 12, weight: '600' },
                        padding: 15,
                        usePointStyle: true
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#ffffff',
                    bodyColor: '#ffffff',
                    borderColor: 'rgba(99, 102, 241, 0.5)',
                    borderWidth: 1,
                    padding: 12,
                    cornerRadius: 8,
                    displayColors: true,
                    callbacks: {
                        title: (items) => {
                            if (items.length > 0 && items[0].raw && items[0].raw.x !== undefined && this.chartBaseTime !== null) {
                                return new Date(this.chartBaseTime + items[0].raw.x).toLocaleTimeString();
                            }
                            return '';
                        },
                        labelColor: (context) => ({
                            borderColor: context.dataset.borderColor,
                            backgroundColor: context.dataset.borderColor
                        })
                    }
                }
            },
            scales: {
                x: {
                    type: 'linear',
                    title: { display: true, text: 'Time' },
                    ticks: {
                        color: '#a0aec0',
                        font: { family: 'Inter', size: 11 },
                        callback: (value) => {
                            if (this.chartBaseTime !== null) {
                                const timestamp = new Date(this.chartBaseTime + value);
                                return timestamp.toLocaleTimeString();
                            }
                            return '';
                        }
                    },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                }
            }
        };
    }

    /**
     * Initialize Power & State Chart
     */
    initPowerChart(chartOptions) {
        return new Chart(document.getElementById('powerChart'), {
            type: 'line',
            data: {
                datasets: [
                    {
                        label: 'Power (kW)',
                        data: [],
                        borderColor: '#6366f1',
                        backgroundColor: 'rgba(99, 102, 241, 0.2)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4,
                        pointRadius: 0,
                        pointHoverRadius: 6,
                        yAxisID: 'y'
                    },
                    {
                        label: 'State',
                        data: [],
                        type: 'bar',
                        backgroundColor: (ctx) => {
                            const state = ctx.raw?.state;
                            if (state === 'RUN') return 'rgba(16, 185, 129, 0.8)';
                            if (state === 'IDLE') return 'rgba(245, 158, 11, 0.8)';
                            return 'rgba(100, 116, 139, 0.8)';
                        },
                        borderColor: (ctx) => {
                            const state = ctx.raw?.state;
                            if (state === 'RUN') return '#10b981';
                            if (state === 'IDLE') return '#f59e0b';
                            return '#64748b';
                        },
                        borderWidth: 1,
                        borderRadius: 4,
                        yAxisID: 'y1'
                    }
                ]
            },
            options: {
                ...chartOptions,
                scales: {
                    ...chartOptions.scales,
                    y: {
                        title: { display: true, text: 'Power (kW)', color: '#a0aec0', font: { family: 'Inter', size: 12, weight: '600' } },
                        position: 'left',
                        ticks: { color: '#a0aec0', font: { family: 'Inter' } },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: { display: true, text: 'State', color: '#a0aec0', font: { family: 'Inter', size: 12, weight: '600' } },
                        min: 0,
                        max: 3,
                        ticks: {
                            stepSize: 1,
                            color: '#a0aec0',
                            font: { family: 'Inter' },
                            callback: (value) => {
                                if (value === 1) return 'OFF';
                                if (value === 2) return 'IDLE';
                                if (value === 3) return 'RUN';
                                return '';
                            }
                        },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    }
                }
            }
        });
    }

    /**
     * Initialize Current Chart
     */
    initCurrentChart(chartOptions) {
        return new Chart(document.getElementById('currentChart'), {
            type: 'line',
            data: {
                datasets: [
                    { label: 'IR (A)', data: [], borderColor: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.2)', borderWidth: 2, tension: 0.4, fill: true, pointRadius: 0, pointHoverRadius: 5 },
                    { label: 'IY (A)', data: [], borderColor: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.2)', borderWidth: 2, tension: 0.4, fill: true, pointRadius: 0, pointHoverRadius: 5 },
                    { label: 'IB (A)', data: [], borderColor: '#3b82f6', backgroundColor: 'rgba(59, 130, 246, 0.2)', borderWidth: 2, tension: 0.4, fill: true, pointRadius: 0, pointHoverRadius: 5 }
                ]
            },
            options: {
                ...chartOptions,
                scales: {
                    ...chartOptions.scales,
                    y: { 
                        title: { display: true, text: 'Current (A)', color: '#a0aec0', font: { family: 'Inter', size: 12, weight: '600' } },
                        ticks: { color: '#a0aec0', font: { family: 'Inter' } },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    }
                }
            }
        });
    }

    /**
     * Initialize Voltage Chart
     */
    initVoltageChart(chartOptions) {
        return new Chart(document.getElementById('voltageChart'), {
            type: 'line',
            data: {
                datasets: [
                    { label: 'VR (V)', data: [], borderColor: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.2)', borderWidth: 2, tension: 0.4, fill: true, pointRadius: 0, pointHoverRadius: 5 },
                    { label: 'VY (V)', data: [], borderColor: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.2)', borderWidth: 2, tension: 0.4, fill: true, pointRadius: 0, pointHoverRadius: 5 },
                    { label: 'VB (V)', data: [], borderColor: '#3b82f6', backgroundColor: 'rgba(59, 130, 246, 0.2)', borderWidth: 2, tension: 0.4, fill: true, pointRadius: 0, pointHoverRadius: 5 }
                ]
            },
            options: {
                ...chartOptions,
                scales: {
                    ...chartOptions.scales,
                    y: { 
                        title: { display: true, text: 'Voltage (V)', color: '#a0aec0', font: { family: 'Inter', size: 12, weight: '600' } },
                        ticks: { color: '#a0aec0', font: { family: 'Inter' } },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    }
                }
            }
        });
    }

    /**
     * Initialize Throughput Chart
     */
    initThroughputChart(chartOptions) {
        const throughputCtx = document.getElementById('throughputChart').getContext('2d');
        const throughputGradient = throughputCtx.createLinearGradient(0, 0, 0, 400);
        throughputGradient.addColorStop(0, 'rgba(16, 185, 129, 0.8)');
        throughputGradient.addColorStop(1, 'rgba(16, 185, 129, 0.2)');
        
        return new Chart(document.getElementById('throughputChart'), {
            type: 'bar',
            data: {
                datasets: [{
                    label: 'Throughput (units/min)',
                    data: [],
                    backgroundColor: throughputGradient,
                    borderColor: '#10b981',
                    borderWidth: 2,
                    borderRadius: 6,
                    borderSkipped: false
                }]
            },
            options: {
                ...chartOptions,
                scales: {
                    ...chartOptions.scales,
                    y: { 
                        title: { display: true, text: 'Units/min', color: '#a0aec0', font: { family: 'Inter', size: 12, weight: '600' } },
                        ticks: { color: '#a0aec0', font: { family: 'Inter' } },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    }
                }
            }
        });
    }

    /**
     * Update all charts with new data
     */
    update(data, windowSize) {
        if (data.length === 0) return;

        const windowData = getWindowData(data, windowSize);
        this.chartBaseTime = windowData.length > 0 ? windowData[0].timestamp.getTime() : Date.now();
        
        this.updatePowerChart(windowData);
        this.updateCurrentChart(windowData);
        this.updateVoltageChart(windowData);
        this.updateThroughputChart(windowData);
    }

    /**
     * Update Power & State Chart
     */
    updatePowerChart(windowData) {
        const powerData = windowData.map(d => ({ 
            x: d.timestamp.getTime() - this.chartBaseTime, 
            y: d.kw 
        }));
        const stateData = windowData.map(d => ({
            x: d.timestamp.getTime() - this.chartBaseTime,
            y: d.state === 'RUN' ? 3 : d.state === 'IDLE' ? 2 : 1,
            state: d.state
        }));

        this.charts.power.data.datasets[0].data = powerData;
        this.charts.power.data.datasets[1].data = stateData;
        this.charts.power.update('none');
    }

    /**
     * Update Current Chart
     */
    updateCurrentChart(windowData) {
        this.charts.current.data.datasets[0].data = windowData.map(d => ({ x: d.timestamp.getTime() - this.chartBaseTime, y: d.ir }));
        this.charts.current.data.datasets[1].data = windowData.map(d => ({ x: d.timestamp.getTime() - this.chartBaseTime, y: d.iy }));
        this.charts.current.data.datasets[2].data = windowData.map(d => ({ x: d.timestamp.getTime() - this.chartBaseTime, y: d.ib }));
        this.charts.current.update('none');
    }

    /**
     * Update Voltage Chart
     */
    updateVoltageChart(windowData) {
        this.charts.voltage.data.datasets[0].data = windowData.map(d => ({ x: d.timestamp.getTime() - this.chartBaseTime, y: d.vr }));
        this.charts.voltage.data.datasets[1].data = windowData.map(d => ({ x: d.timestamp.getTime() - this.chartBaseTime, y: d.vy }));
        this.charts.voltage.data.datasets[2].data = windowData.map(d => ({ x: d.timestamp.getTime() - this.chartBaseTime, y: d.vb }));
        this.charts.voltage.update('none');
    }

    /**
     * Update Throughput Chart
     */
    updateThroughputChart(windowData) {
        const throughputData = [];
        for (let i = 0; i < windowData.length; i++) {
            const windowEnd = windowData[i].timestamp;
            const windowStart = new Date(windowEnd - 60000);
            const segment = windowData.filter(d => d.timestamp >= windowStart && d.timestamp <= windowEnd);
            
            if (segment.length > 1) {
                const countDelta = Math.max(...segment.map(d => d.count_total)) - Math.min(...segment.map(d => d.count_total));
                const minutes = (segment[segment.length - 1].timestamp - segment[0].timestamp) / (60 * 1000);
                const rate = minutes > 0 ? (countDelta / minutes) : 0;
                throughputData.push({ x: windowEnd.getTime() - this.chartBaseTime, y: rate });
            }
        }

        this.charts.throughput.data.datasets[0].data = throughputData;
        this.charts.throughput.update('none');
    }
}

