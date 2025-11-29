# Code Structure Documentation

## 📁 Project Structure

```
device-dashboard/
├── css/
│   ├── main.css                    # Main stylesheet (imports all)
│   ├── variables.css                # CSS variables & design tokens
│   ├── base.css                     # Reset, typography, base styles
│   ├── animations.css               # All keyframe animations
│   └── components/
│       ├── background.css           # Animated background effects
│       ├── glass.css                # Glass morphism styles
│       ├── header.css                # Header component
│       ├── controls.css              # Buttons & dropdowns
│       ├── status-badge.css          # Status notifications
│       ├── kpi-cards.css            # KPI card components
│       ├── insights.css             # Insights section
│       ├── charts.css               # Chart containers
│       ├── loading.css              # Loading screen
│       ├── footer.css               # Footer component
│       └── responsive.css           # Responsive breakpoints
│
├── js/
│   ├── dashboard.js                # Main dashboard class (orchestrator)
│   ├── config.js                    # Configuration constants
│   ├── utils.js                     # Utility functions
│   └── modules/
│       ├── dataHandler.js           # SSE & replay data handling
│       ├── kpiCalculator.js        # KPI calculations
│       ├── insightsGenerator.js    # AI insights generation
│       ├── chartManager.js         # Chart.js management
│       └── csvExporter.js         # CSV export functionality
│
├── index.html                       # Main HTML file
├── live_sse_server.js              # SSE server
└── device_stream_20min.jsonl       # Sample data
```

## 🎨 CSS Architecture

### Organization
- **Modular**: Each component has its own file
- **Imported**: All files imported through `main.css`
- **Variables**: Centralized in `variables.css`
- **Animations**: All keyframes in `animations.css`

### File Sizes
- Each component file: ~50-150 lines
- Main CSS: ~20 lines (just imports)
- Total: ~1000 lines split across 15 files

## 💻 JavaScript Architecture

### Module Pattern
- **ES6 Modules**: Using import/export
- **Separation of Concerns**: Each module has single responsibility
- **Dependency Injection**: Modules receive dependencies via constructor/parameters

### Module Responsibilities

#### `config.js`
- All configuration constants
- Thresholds, intervals, URLs
- Easy to modify settings

#### `utils.js`
- Reusable utility functions
- Animation helpers
- Data formatting

#### `dataHandler.js`
- SSE stream management
- JSONL replay functionality
- Data point processing
- Gap detection

#### `kpiCalculator.js`
- All KPI calculations
- Pure functions (no side effects)
- Easy to test

#### `insightsGenerator.js`
- Insight detection algorithms
- Pattern recognition
- Returns structured insight objects

#### `chartManager.js`
- Chart.js initialization
- Chart updates
- Data transformation for charts

#### `csvExporter.js`
- CSV generation
- File download
- Encoding handling

#### `dashboard.js`
- Main orchestrator class
- Coordinates all modules
- UI updates
- Event handling

## 📊 Code Statistics

### Before Refactoring
- `dashboard.css`: ~1000 lines (single file)
- `dashboard.js`: ~1000 lines (single file)

### After Refactoring
- CSS: 15 files, ~50-150 lines each
- JS: 8 files, ~50-300 lines each
- Average file size: ~100 lines
- Much easier to navigate and maintain

## 🔍 Finding Code

### Need to change a color?
→ `css/variables.css`

### Need to modify KPI calculation?
→ `js/modules/kpiCalculator.js`

### Need to add a new chart?
→ `js/modules/chartManager.js`

### Need to change button style?
→ `css/components/controls.css`

### Need to modify insights?
→ `js/modules/insightsGenerator.js`

## 🚀 Benefits

1. **Readability**: Each file has clear purpose
2. **Maintainability**: Easy to find and modify code
3. **Scalability**: Easy to add new features
4. **Testability**: Modules can be tested independently
5. **Collaboration**: Multiple devs can work on different modules
6. **Performance**: Only load what's needed (future optimization)

## 📝 Naming Conventions

- **CSS**: kebab-case (e.g., `kpi-cards.css`)
- **JS**: camelCase (e.g., `kpiCalculator.js`)
- **Classes**: PascalCase (e.g., `KPICalculator`)
- **Functions**: camelCase (e.g., `calculateKPIs`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `UPDATE_THROTTLE`)

## 🔄 Import Order

### CSS (in main.css)
1. Variables
2. Base
3. Animations
4. Components (alphabetical)

### JS (in dashboard.js)
1. Config
2. Utils
3. Modules (alphabetical)

