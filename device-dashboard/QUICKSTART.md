# Quick Start Guide

## Step 1: Start the SSE Server

Open a terminal in the `device-dashboard` folder and run:

```bash
node live_sse_server.js
```

You should see:
```
SSE at http://localhost:8080/stream
```

## Step 2: Open the Dashboard

1. Open `index.html` in your web browser (double-click or right-click → Open with)
2. The dashboard will automatically connect to the SSE stream
3. You should see data flowing in real-time

## Alternative: Use Replay Mode

1. Open `index.html` in your browser
2. Select "Replay JSONL" from the dropdown
3. Click "Load File"
4. Select `device_stream_20min.jsonl`
5. Data will replay at 1 record per second

## Features to Try

- **Change Time Window**: Use the dropdown to switch between 5, 15, and 30-minute windows
- **Export Data**: Click "Export CSV" to download the current window data
- **View Insights**: Scroll down to see auto-generated insights
- **Monitor KPIs**: Watch the KPI cards update in real-time

## Troubleshooting

- **No data showing**: Make sure the SSE server is running on port 8080
- **Charts not updating**: Check browser console for errors (F12)
- **CORS errors**: The SSE server includes CORS headers, but if issues persist, try using a local web server

## Using a Local Web Server (Optional)

For better performance and to avoid CORS issues, you can use a simple HTTP server:

```bash
# Python 3
python -m http.server 8000

# Node.js (if you have http-server installed)
npx http-server -p 8000
```

Then open `http://localhost:8000` in your browser.

