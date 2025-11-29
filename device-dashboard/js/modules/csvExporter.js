/* ============================================
   CSV Exporter Module
   Handles CSV export functionality
   ============================================ */

import { getWindowData } from '../utils.js';

export class CSVExporter {
    /**
     * Escape CSV value properly
     */
    static escapeCSV(value) {
        if (value === null || value === undefined) {
            return '';
        }
        const stringValue = String(value);
        // If value contains comma, quote, or newline, wrap in quotes and escape quotes
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n') || stringValue.includes('\r')) {
            return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
    }

    /**
     * Export data to CSV file
     */
    static export(data, windowSize, onSuccess, onError) {
        if (data.length === 0) {
            if (onError) onError('No data to export. Please wait for data to load.');
            return;
        }

        try {
            const windowData = getWindowData(data, windowSize);

            if (windowData.length === 0) {
                if (onError) onError('No data in the selected time window to export.');
                return;
            }

            const headers = ['timestamp', 'machine_id', 'state', 'mode', 'status', 
                            'vr', 'vy', 'vb', 'ir', 'iy', 'ib', 
                            'kw', 'kwh_total', 'pf', 'count_total', 'temp_c', 'alarm_code'];
            
            const rows = windowData.map(d => {
                const timestamp = d.timestamp ? d.timestamp.toISOString() : (d.ts || new Date().toISOString());
                
                return [
                    timestamp,
                    d.machine_id || '',
                    d.state || '',
                    d.mode || '',
                    d.status || '',
                    d.vr !== undefined && d.vr !== null ? d.vr : '',
                    d.vy !== undefined && d.vy !== null ? d.vy : '',
                    d.vb !== undefined && d.vb !== null ? d.vb : '',
                    d.ir !== undefined && d.ir !== null ? d.ir : '',
                    d.iy !== undefined && d.iy !== null ? d.iy : '',
                    d.ib !== undefined && d.ib !== null ? d.ib : '',
                    d.kw !== undefined && d.kw !== null ? d.kw : '',
                    d.kwh_total !== undefined && d.kwh_total !== null ? d.kwh_total : '',
                    d.pf !== undefined && d.pf !== null ? d.pf : '',
                    d.count_total !== undefined && d.count_total !== null ? d.count_total : '',
                    d.temp_c !== undefined && d.temp_c !== null ? d.temp_c : '',
                    d.alarm_code !== undefined && d.alarm_code !== null ? d.alarm_code : ''
                ];
            });

            // Build CSV rows
            const csvRows = [
                headers.join(','),
                ...rows.map(row => row.map(cell => this.escapeCSV(cell)).join(','))
            ];
            
            // Join with Windows line endings
            const csvContent = csvRows.join('\r\n');
            
            // Create UTF-8 encoded blob with BOM for Excel compatibility
            const BOM = '\uFEFF';
            const csvWithBOM = BOM + csvContent;
            
            // Use Uint8Array to ensure proper UTF-8 encoding
            const encoder = new TextEncoder();
            const csvBytes = encoder.encode(csvWithBOM);
            
            const blob = new Blob([csvBytes], { 
                type: 'text/csv;charset=utf-8'
            });
            
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            
            // Create filename with timestamp
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
            const timeStr = new Date().toTimeString().split(' ')[0].replace(/:/g, '-');
            a.download = `device_stream_${timestamp}_${timeStr}.csv`;
            
            // Trigger download
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            
            // Clean up
            setTimeout(() => URL.revokeObjectURL(url), 100);
            
            if (onSuccess) {
                onSuccess(`Exported ${windowData.length} records to CSV`);
            }
            
        } catch (error) {
            console.error('Error exporting CSV:', error);
            if (onError) {
                onError('Error exporting CSV: ' + error.message);
            }
        }
    }
}

