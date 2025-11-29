# Device Stream Dashboard

A real-time dashboard for monitoring device stream data with KPIs, insights, and visualizations.

## Features

### KPIs (Key Performance Indicators)
All KPIs are computed over the currently visible time window (5/15/30 minutes):

- **Uptime %**: Percentage of time machine is in RUN state
- **Idle %**: Percentage of time machine is in IDLE state
- **Off %**: Percentage of time machine is in OFF state
- **Average kW**: Mean power consumption over the window
- **Energy (kWh)**: Difference in `kwh_total` register (max - min) in window
- **PF Average**: Arithmetic mean of power factor over RUN + IDLE samples (OFF samples ignored)
- **Throughput (units/min)**: Change in `count_total` divided by window duration in minutes
- **Phase Imbalance %**: (max(ir,iy,ib) - min(ir,iy,ib)) / avg(ir,iy,ib) × 100

### Auto-Insights
The dashboard automatically generates 3 insights:

1. **Extended Idle Period**: Detects contiguous IDLE stretches ≥ 30 minutes (or 50% of window for shorter datasets)
2. **Peak 15-Minute Demand**: Rolling 15-minute average of kW; reports maximum value and timestamp
3. **Low Power Factor Window**: Continuous spans with PF < 0.8 for ≥ 5 minutes

### Visualizations

- **Power Trend & State Band**: Line chart showing kW over time with color-coded state bars (RUN=green, IDLE=orange, OFF=gray)
- **Current Chart**: Mini-chart showing phase currents (IR, IY, IB)
- **Voltage Chart**: Mini-chart showing phase voltages (VR, VY, VB)
- **Throughput Chart**: Bar chart showing units per minute (rolling 60-second rate)

### Additional Features

- **Gap Detector**: Shows red badge if no data received for > 10 seconds
- **CSV Export**: Export all data in the visible window with all raw fields
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Accessibility**: Semantic HTML, ARIA labels, keyboard navigation, high contrast

## Setup

### Prerequisites
- Node.js (v14 or higher)
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Installation

1. Navigate to the project directory:
```bash
cd device-dashboard
```

2. Start the SSE server:
```bash
npm start
# or
node live_sse_server.js
```

The server will start on `http://localhost:8080`

### Usage

#### Option 1: Live SSE Stream
1. Ensure the SSE server is running (`npm start`)
2. Open `index.html` in a web browser
3. Select "Live SSE Stream" from the data source dropdown
4. The dashboard will automatically connect and start receiving data

#### Option 2: Replay JSONL File
1. Open `index.html` in a web browser
2. Select "Replay JSONL" from the data source dropdown
3. Click "Load File" and select `device_stream_20min.jsonl`
4. Data will replay at 1 record per second

### Controls

- **Data Source**: Switch between live SSE stream and JSONL replay
- **Time Window**: Select 5, 15, or 30 minutes window for KPI calculations
- **Export CSV**: Download current window data as CSV file

## Technical Details

### KPI Calculation Methods

- **State Percentages**: Calculated as (count of state samples / total samples) × 100
- **Energy**: Uses the difference in `kwh_total` register (not sum of kW values)
- **Power Factor**: Only includes RUN and IDLE states (OFF samples excluded)
- **Throughput**: Calculated as Δcount_total / window_duration_minutes
- **Phase Imbalance**: Computed per sample, then averaged over window

### Performance

- Optimized for real-time updates (1 Hz data stream)
- Efficient data windowing (only keeps data within selected time window)
- Chart.js for performant canvas-based visualizations
- Responsive layout with CSS Grid and Flexbox

### Accessibility

- Semantic HTML5 elements (`<header>`, `<main>`, `<section>`, `<nav>`)
- ARIA labels and roles for screen readers
- Keyboard navigation support
- High contrast color scheme (WCAG AA compliant)
- Responsive design for all screen sizes

## Browser Compatibility

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## File Structure

```
device-dashboard/
├── index.html                      # Main dashboard HTML
├── css/
│   ├── main.css                    # Main stylesheet (imports all)
│   ├── variables.css                # CSS variables & design tokens
│   ├── base.css                     # Reset, typography, base styles
│   ├── animations.css               # All keyframe animations
│   └── components/                  # Component-specific styles
│       ├── background.css
│       ├── glass.css
│       ├── header.css
│       ├── controls.css
│       ├── status-badge.css
│       ├── kpi-cards.css
│       ├── insights.css
│       ├── charts.css
│       ├── loading.css
│       ├── footer.css
│       └── responsive.css
├── js/
│   ├── dashboard.js                # Main dashboard class
│   ├── config.js                    # Configuration constants
│   ├── utils.js                     # Utility functions
│   └── modules/                     # Feature modules
│       ├── dataHandler.js          # SSE & replay handling
│       ├── kpiCalculator.js        # KPI calculations
│       ├── insightsGenerator.js    # Insights generation
│       ├── chartManager.js         # Chart.js management
│       └── csvExporter.js         # CSV export
├── live_sse_server.js              # SSE server for live streaming
├── device_stream_20min.jsonl      # Sample data file
├── package.json                    # Node.js dependencies
├── CODE_STRUCTURE.md              # Detailed code structure docs
└── README.md                       # This file
```

### Code Organization

The codebase is organized into **modular, readable components**:

- **CSS**: Split into 15 focused files (~50-150 lines each)
- **JavaScript**: Split into 8 modules (~50-300 lines each)
- **Easy Navigation**: Find code quickly by component/feature
- **Maintainable**: Each file has a single, clear purpose

## Notes

- The dashboard automatically handles data gaps and shows warnings
- All calculations are performed in real-time as data arrives
- Charts update smoothly without flickering using Chart.js animation
- CSV export includes all raw fields from the data stream

## License

MIT

