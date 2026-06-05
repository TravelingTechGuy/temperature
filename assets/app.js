const FETCH_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes

let historyChart;
const chartData = {
  labels: [],
  datasets: [
    {
      label: 'Temperature (°C)',
      borderColor: '#FF512F',
      backgroundColor: 'rgba(255, 81, 47, 0.2)',
      data: [],
      yAxisID: 'y',
      tension: 0.3
    },
    {
      label: 'Humidity (%)',
      borderColor: '#00c6ff',
      backgroundColor: 'rgba(0, 198, 255, 0.2)',
      data: [],
      yAxisID: 'y1',
      tension: 0.3
    }
  ]
};

function initChart() {
  const ctx = document.getElementById('historyChart').getContext('2d');
  historyChart = new Chart(ctx, {
    type: 'line',
    data: chartData,
    options: {
      responsive: true,
      interaction: { mode: 'index', intersect: false },
      scales: {
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          title: { display: true, text: 'Temp (°C)' }
        },
        y1: {
          type: 'linear',
          display: true,
          position: 'right',
          title: { display: true, text: 'Humidity (%)' },
          grid: { drawOnChartArea: false }
        }
      }
    }
  });
}

// Determines color based on temperature (hotter color = hotter temperature)
function getTemperatureColor(celsius) {
  if (celsius < 10) return '#00d2ff'; // Cold (Cyan/Blue)
  if (celsius < 20) return '#4caf50'; // Mild (Green)
  if (celsius < 28) return '#ffb75e'; // Warm (Orange)
  return '#ff512f'; // Hot (Red)
}

async function fetchData() {
  try {
    const response = await fetch('/temp');
    const data = await response.json();

    // Check if we are still waiting for the first reading from the Arduino
    if (data.celsius === 0 && data.fahrenheit === 0 && data.humidity === 0) {
      document.getElementById('timestamp').textContent = "Waiting for sensor data...";
      setTimeout(fetchData, 2000); // Retry in 2 seconds
      return;
    }

    // Update DOM values
    const tempDisplay = document.getElementById('temperature-display');
    tempDisplay.textContent = `${data.celsius.toFixed(1)}°C / ${data.fahrenheit.toFixed(1)}°F`;
    tempDisplay.style.color = getTemperatureColor(data.celsius);

    document.getElementById('humidity-display').textContent = `${data.humidity.toFixed(1)}%`;

    // Format Time to PST/PDT
    const date = new Date(data.timestamp_utc);
    const timeString = date.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' });
    document.getElementById('timestamp').textContent = `Last measurement: ${timeString} (PT)`;

    // Update Chart
    const chartTimeLabel = date.toLocaleTimeString('en-US', { timeZone: 'America/Los_Angeles', hour: '2-digit', minute: '2-digit' });
    chartData.labels.push(chartTimeLabel);
    chartData.datasets[0].data.push(data.celsius);
    chartData.datasets[1].data.push(data.humidity);

    // Keep at most 24 slices (4 hours of history)
    if (chartData.labels.length > 24) {
      chartData.labels.shift();
      chartData.datasets[0].data.shift();
      chartData.datasets[1].data.shift();
    }

    historyChart.update();

  } catch (error) {
    console.error('Error fetching sensor data:', error);
  }
}

async function fetchUnits() {
  try {
    const response = await fetch('/units');
    const data = await response.json();
    document.getElementById('unit-toggle').textContent = `°${data.units}`;
  } catch (error) {
    console.error('Error fetching units:', error);
  }
}

async function toggleUnits() {
  try {
    const response = await fetch('/setUnits');
    const data = await response.json();
    document.getElementById('unit-toggle').textContent = `°${data.units}`;
  } catch (error) {
    console.error('Error toggling units:', error);
  }
}

window.onload = () => {
  initChart();
  fetchData(); // Initial immediate fetch
  fetchUnits(); // Fetch current units for the button
  setInterval(fetchData, FETCH_INTERVAL_MS); // Then run every 10 minutes
};
