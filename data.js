// ── LOAD REAL BHOPAL DATA FROM CSV ──
let BHOPAL = { years:[], aqi:[], monthly2024:{labels:[],data:[]}, pollutants:{} };

Papa.parse('city_day.csv', {
  download: true,
  header: true,
  complete: function(results) {

    // Filter only Bhopal rows with valid AQI
    const rows = results.data.filter(r =>
      r.City === 'Bhopal' && r.AQI && !isNaN(r.AQI)
    );

    // ── Annual average AQI per year ──
    const byYear = {};
    rows.forEach(r => {
      const yr = new Date(r.Date).getFullYear();
      if (!byYear[yr]) byYear[yr] = [];
      byYear[yr].push(parseFloat(r.AQI));
    });
    BHOPAL.years = Object.keys(byYear).map(Number).sort();
    BHOPAL.aqi   = BHOPAL.years.map(yr =>
      Math.round(byYear[yr].reduce((a,b)=>a+b,0) / byYear[yr].length)
    );

    // ── Monthly average AQI for most recent year ──
    const latestYear = Math.max(...BHOPAL.years);
    const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const byMonth = Array.from({length:12}, ()=>[]);
    rows.forEach(r => {
      const d = new Date(r.Date);
      if (d.getFullYear() === latestYear) byMonth[d.getMonth()].push(parseFloat(r.AQI));
    });
    BHOPAL.monthly2024.labels = monthNames;
    BHOPAL.monthly2024.data   = byMonth.map(m =>
      m.length ? Math.round(m.reduce((a,b)=>a+b,0)/m.length) : null
    );

    // ── Pollutant averages for latest year ──
    const latestRows = rows.filter(r => new Date(r.Date).getFullYear() === latestYear);
    const avg = key => {
      const vals = latestRows.map(r=>parseFloat(r[key])).filter(v=>!isNaN(v));
      return vals.length ? Math.round(vals.reduce((a,b)=>a+b,0)/vals.length) : 0;
    };
    BHOPAL.pollutants = {
      PM25: avg('PM2.5'),
      PM10: avg('PM10'),
      NO2:  avg('NO2'),
      SO2:  avg('SO2'),
      CO:   avg('CO'),
      O3:   avg('Ozone')
    };
    // ── Show dataset info in topbar ──
    document.getElementById('dsrc').textContent = 
        `CPCB Dataset · ${rows.length.toLocaleString()} Bhopal rows · ${Math.min(...BHOPAL.years)}–${Math.max(...BHOPAL.years)}`;

    // ── Update live stat cards with real values ──
    const lastRow = latestRows[latestRows.length - 1] || {};
    document.querySelector('.ph-val').textContent = Math.round(parseFloat(lastRow.AQI)||BHOPAL.aqi.at(-1));

    // ── Now init the dashboard with real data ──
    initPage('_init');
  },
  error: function() {
    console.warn('CSV not found — using fallback data');
    // Fallback so dashboard still works without CSV
    BHOPAL = {
      years:[2015,2016,2017,2018,2019,2020,2021,2022,2023,2024],
      aqi:  [148,152,159,163,155,134,141,149,145,138],
      monthly2024:{
        labels:['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
        data:  [178,165,148,132,121,95,88,82,94,138,162,185]
      },
      pollutants:{PM25:54,PM10:69,NO2:31,SO2:4,CO:908,O3:16}
    };
    initPage('_init');
  }
});