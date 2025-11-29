/* ============================================
   Utility Functions
   ============================================ */

/**
 * Animate a numeric value from start to end
 */
export function animateValue(element, start, end, duration, suffix = '') {
    // Add updating class for visual feedback
    element.classList.add('updating');
    
    // If change is very small, update immediately without animation
    if (Math.abs(end - start) < 0.01) {
        updateElementValue(element, end, suffix);
        setTimeout(() => element.classList.remove('updating'), 600);
        return;
    }
    
    const startTime = performance.now();
    const animate = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const current = start + (end - start) * easeOutQuart;
        
        updateElementValue(element, current, suffix);
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            element.classList.remove('updating');
        }
    };
    requestAnimationFrame(animate);
}

/**
 * Update element value with proper formatting
 */
function updateElementValue(element, value, suffix) {
    if (suffix === '%') {
        element.textContent = value.toFixed(1) + suffix;
    } else if (suffix === '') {
        element.textContent = value.toFixed(2);
    } else {
        element.textContent = value.toFixed(3) + suffix;
    }
}

/**
 * Check if two KPI objects have significant differences
 */
export function hasSignificantChange(currentKPIs, lastKPIs, thresholds) {
    if (Object.keys(lastKPIs).length === 0) return true;
    
    for (const key in currentKPIs) {
        const oldValue = lastKPIs[key] || 0;
        const newValue = currentKPIs[key] || 0;
        const threshold = thresholds[key] || 0.1;
        
        if (Math.abs(newValue - oldValue) > threshold) {
            return true;
        }
    }
    
    return false;
}

/**
 * Format timestamp for display
 */
export function formatTimestamp(timestamp) {
    if (!timestamp) return '';
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
    return date.toLocaleTimeString();
}

/**
 * Get window data filtered by time range
 */
export function getWindowData(data, windowSize, now = null) {
    if (data.length === 0) return [];
    
    const windowMs = windowSize * 60 * 1000;
    const endTime = now || (data.length > 0 ? data[data.length - 1].timestamp : new Date());
    const windowStart = new Date(endTime - windowMs);
    
    return data.filter(d => d.timestamp >= windowStart);
}

