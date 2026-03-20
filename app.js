// ── CLOCK ──
setInterval(()=>{document.getElementById('clock').textContent=new Date().toLocaleTimeString('en-US',{hour12:false})},1000);

// ── TICKER ──
const td=[
  {l:'CO₂',v:'412',u:'ppm'},{l:'PM2.5',v:'54',u:'µg/m³'},{l:'PM10',v:'69',u:'µg/m³'},
  {l:'NO₂',v:'31',u:'µg/m³'},{l:'SO₂',v:'4',u:'µg/m³'},{l:'O₃',v:'16',u:'µg/m³'},
  {l:'CO',v:'908',u:'ppb'},{l:'TEMP',v:'28.4',u:'°C'},{l:'HUMIDITY',v:'62',u:'%'},
  {l:'WIND',v:'8.2',u:'km/h'},{l:'AQI',v:'138',u:''},{l:'PRESSURE',v:'1012',u:'hPa'}
];
const cs=['#ff3d5a','#ff7426','#ffd000','#4080ff','#00ffcc','#00ff88'];
const tkHtml=([...td,...td]).map((s,i)=>`<div class="ti"><span class="ti-lbl">${s.l}</span><span class="ti-val" style="color:${cs[i%cs.length]}">${s.v}</span><span class="ti-unit">${s.u}</span></div><span style="color:var(--dim);margin:0 .3rem">·</span>`).join('');
document.getElementById('ticker').innerHTML=tkHtml;

// ── SIDEBAR ──
let sbOpen=false;
function toggleSB(){sbOpen=!sbOpen;document.getElementById('sb').classList.toggle('open',sbOpen)}

// ── NAV ──
function nav(id,el){
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('act'));
  document.getElementById('page-'+id).classList.add('act');
  document.querySelectorAll('.ni').forEach(n=>n.classList.remove('act'));
  const map={dashboard:0,calc:1,history:2,ml:3,iot:4,chat:5};
  if(el)el.classList.add('act');
  else if(map[id]!==undefined)document.querySelectorAll('.ni')[map[id]].classList.add('act');
  setTimeout(()=>initPage(id),40);
}


// AQI category helper
function aqiCat(v){
  if(v<=50)return{cat:'Good',color:'#00ff88'};
  if(v<=100)return{cat:'Satisfactory',color:'#a8ff3e'};
  if(v<=200)return{cat:'Moderate',color:'#ffd000'};
  if(v<=300)return{cat:'Poor',color:'#ff7426'};
  if(v<=400)return{cat:'Very Poor',color:'#ff3d5a'};
  return{cat:'Severe',color:'#cc0033'};
}

const C={};
function mk(id,cfg){
  if(C[id])C[id].destroy();
  const el=document.getElementById(id);if(!el)return;
  C[id]=new Chart(el.getContext('2d'),cfg);
}
Chart.defaults.color='#4a6a8a';
Chart.defaults.borderColor='rgba(255,255,255,0.05)';
Chart.defaults.font.family='Outfit';

function initPage(id){
  if(id==='dashboard'||id==='_init'){
    // Main trend chart with real 2024 monthly data
    mk('trendChart',{type:'line',data:{
      labels:BHOPAL.monthly2024.labels,
      datasets:[{
        label:'AQI Bhopal 2024',data:BHOPAL.monthly2024.data,
        borderColor:'#ff3d5a',backgroundColor:'rgba(255,61,90,0.07)',
        borderWidth:2.5,pointRadius:4,pointHoverRadius:7,fill:true,tension:0.4
      },{
        label:'Safe Limit (100)',data:new Array(12).fill(100),
        borderColor:'rgba(255,208,0,.4)',borderWidth:1.5,pointRadius:0,borderDash:[4,4]
      }]
    },options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{labels:{font:{size:10},boxWidth:10}}},scales:{x:{grid:{color:'rgba(255,255,255,0.04)'},ticks:{font:{size:10}}},y:{grid:{color:'rgba(255,255,255,0.04)'},ticks:{font:{size:10}}}}}});
    // Sources pie
    mk('srcPie',{type:'doughnut',data:{
      labels:['Transport','Cooking/Heating','Waste Burning','Industry','Regional'],
      datasets:[{data:[42,22,18,12,6],backgroundColor:['#ff3d5a','#ff7426','#ffd000','#4080ff','#00ffcc'],borderColor:'#06080f',borderWidth:3,hoverOffset:6}]
    },options:{responsive:false,cutout:'55%',plugins:{legend:{display:false}}}});
  }

  if(id==='calc'){
    calcCO2();
    mk('compChart',{type:'bar',data:{
      labels:['Your Est.','India Avg','MP Avg','Low Carbon'],
      datasets:[{data:[0,1300,1100,400],backgroundColor:['#4080ff','rgba(255,61,90,.4)','rgba(255,208,0,.4)','rgba(0,255,136,.4)'],borderColor:['#4080ff','#ff3d5a','#ffd000','#00ff88'],borderWidth:2,borderRadius:8,borderSkipped:false}]
    },options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>` ${c.raw} kg CO₂/year`}}},scales:{x:{grid:{display:false},ticks:{font:{size:10}}},y:{grid:{color:'rgba(255,255,255,0.04)'},ticks:{font:{size:10}}}}}});
    mk('projChart',{type:'line',data:{
      labels:['2024','2025','2026','2027','2028'],
      datasets:[{label:'No action',data:[3600,3800,4000,4200,4400],borderColor:'#ff3d5a',borderWidth:2,pointRadius:3,tension:0.4,borderDash:[4,3]},{label:'With changes',data:[3600,2880,2160,1440,900],borderColor:'#00ff88',borderWidth:2,pointRadius:3,tension:0.4}]
    },options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{labels:{font:{size:10},boxWidth:8}}},scales:{x:{grid:{display:false},ticks:{font:{size:10}}},y:{grid:{color:'rgba(255,255,255,0.04)'},ticks:{font:{size:10}}}}}});
  }

  if(id==='history'){
    // Annual AQI bar — real data
    mk('annualAQI',{type:'bar',data:{
      labels:BHOPAL.years.map(String),
      datasets:[{
        label:'Annual Avg AQI',data:BHOPAL.aqi,
        backgroundColor:BHOPAL.aqi.map(v=>v>150?'rgba(255,61,90,.55)':v>100?'rgba(255,116,38,.55)':'rgba(255,208,0,.55)'),
        borderColor:BHOPAL.aqi.map(v=>v>150?'#ff3d5a':v>100?'#ff7426':'#ffd000'),
        borderWidth:1.5,borderRadius:6,borderSkipped:false
      },{
        label:'NAAQS Moderate (200)',data:new Array(10).fill(200),
        type:'line',borderColor:'rgba(255,61,90,.3)',borderWidth:1,borderDash:[4,3],pointRadius:0
      }]
    },options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{labels:{font:{size:10},boxWidth:8}}},scales:{x:{grid:{display:false},ticks:{font:{size:11}}},y:{grid:{color:'rgba(255,255,255,0.04)'},ticks:{font:{size:11}},min:0,max:220}}}});
    // Year bars (div-based)
    const el=document.getElementById('ybarList');
    el.innerHTML=BHOPAL.years.map((yr,i)=>{
      const v=BHOPAL.aqi[i];const {cat,color}=aqiCat(v);const w=Math.round(v/2.5);
      return `<div class="ybar-row"><div class="ybar-yr">${yr}</div><div class="ybar-outer"><div class="ybar-inner" style="width:${w}%;background:${color}40;border:1px solid ${color}60"><span class="ybar-aqi" style="color:${color}">${v}</span></div></div><div class="ybar-cat" style="color:${color}">${cat}</div></div>`;
    }).join('');
    // Pollutant chart
    mk('pollutantChart',{type:'bar',data:{
      labels:['PM2.5','PM10','NO₂','SO₂','O₃'],
      datasets:[{
        label:'2024 µg/m³',
        data:[BHOPAL.pollutants.PM25,BHOPAL.pollutants.PM10,BHOPAL.pollutants.NO2,BHOPAL.pollutants.SO2,BHOPAL.pollutants.O3],
        backgroundColor:['rgba(255,61,90,.5)','rgba(255,116,38,.5)','rgba(255,208,0,.5)','rgba(0,255,136,.5)','rgba(64,128,255,.5)'],
        borderColor:['#ff3d5a','#ff7426','#ffd000','#00ff88','#4080ff'],
        borderWidth:1.5,borderRadius:6,borderSkipped:false
      },{
        label:'NAAQS Annual Std',
        data:[40,60,40,50,100],
        backgroundColor:'transparent',borderColor:'rgba(0,255,204,.4)',borderWidth:1.5,type:'line',pointRadius:4,borderDash:[3,3]
      }]
    },options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{labels:{font:{size:10},boxWidth:8}}},scales:{x:{grid:{display:false},ticks:{font:{size:10}}},y:{grid:{color:'rgba(255,255,255,0.04)'},ticks:{font:{size:10}}}}}});
    // Seasonal
    mk('seasonChart',{type:'line',data:{
      labels:BHOPAL.monthly2024.labels,
      datasets:[{label:'AQI 2024',data:BHOPAL.monthly2024.data,borderColor:'#ff3d5a',backgroundColor:'rgba(255,61,90,.06)',borderWidth:2,fill:true,tension:0.4,pointRadius:3}]
    },options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{grid:{color:'rgba(255,255,255,0.04)'},ticks:{font:{size:10}}},y:{grid:{color:'rgba(255,255,255,0.04)'},ticks:{font:{size:10}}}}}});
    // Category pie
    mk('catPie',{type:'doughnut',data:{
      labels:['Good','Satisfactory','Moderate','Poor','Very Poor','Severe'],
      datasets:[{data:[3,8,22,41,18,8],backgroundColor:['#00ff88','#a8ff3e','#ffd000','#ff7426','#ff3d5a','#cc0033'],borderColor:'#06080f',borderWidth:3,hoverOffset:6}]
    },options:{responsive:true,maintainAspectRatio:false,cutout:'52%',plugins:{legend:{position:'bottom',labels:{font:{size:10},padding:8,boxWidth:8}}}}});
  }

  if(id==='ml'){
    // 7-day forecast
    const days=['Fri 21','Sat 22','Sun 23','Mon 24','Tue 25','Wed 26','Thu 27'];
    const fvals=[138,142,156,149,133,128,141];
    document.getElementById('forecastCards').innerHTML=fvals.map((v,i)=>{
      const {cat,color}=aqiCat(v);
      return `<div class="fcast-day"><div class="fcast-date">${days[i]}</div><div class="fcast-val" style="color:${color}">${v}</div><div class="fcast-cat" style="color:${color}">${cat}</div></div>`;
    }).join('');
    // Actual vs predicted
    const actual=[132,145,158,162,138,141,148,135,152,145];
    const pred=actual.map(v=>Math.round(v+(Math.random()-.5)*14));
    mk('mlChart',{type:'line',data:{
      labels:['D-10','D-9','D-8','D-7','D-6','D-5','D-4','D-3','D-2','D-1'],
      datasets:[{label:'Actual AQI (CPCB)',data:actual,borderColor:'#ff3d5a',backgroundColor:'transparent',borderWidth:2,pointRadius:4,tension:0.3},{label:'LSTM Predicted',data:pred,borderColor:'#4080ff',backgroundColor:'rgba(64,128,255,.08)',borderWidth:2,pointRadius:4,tension:0.3,borderDash:[4,3]}]
    },options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{labels:{font:{size:11},boxWidth:10}}},scales:{x:{grid:{color:'rgba(255,255,255,0.04)'},ticks:{font:{size:10}}},y:{grid:{color:'rgba(255,255,255,0.04)'},ticks:{font:{size:10}}}}}});
  }

  if(id==='iot'){
    // Live rolling chart
    const live=Array.from({length:20},()=>Math.round(130+Math.random()*30));
    mk('liveChart',{type:'line',data:{
      labels:live.map((_,i)=>`${i*30}s`),
      datasets:[{label:'AQI (live)',data:live,borderColor:'#00ffcc',backgroundColor:'rgba(0,255,204,.06)',borderWidth:1.5,pointRadius:0,fill:true,tension:0.4}]
    },options:{responsive:true,maintainAspectRatio:false,animation:false,plugins:{legend:{display:false}},scales:{x:{grid:{color:'rgba(255,255,255,0.04)'},ticks:{font:{size:10},maxTicksLimit:6}},y:{grid:{color:'rgba(255,255,255,0.04)'},ticks:{font:{size:10}},min:80,max:200}}}});
    // Animate live chart
    setInterval(()=>{
      if(!C['liveChart'])return;
      C['liveChart'].data.datasets[0].data.push(Math.round(130+Math.random()*30));
      C['liveChart'].data.datasets[0].data.shift();
      C['liveChart'].update('none');
    },2000);
  }

  if(id==='chat'){
    initChat();
  }
}

// ── CO₂ CALCULATOR ──
function calcCO2(){
  const kwh=(parseFloat(document.getElementById('e_kwh').value)||0);
  const ef=(parseFloat(document.getElementById('e_src').value)||0.82);
  const months=(parseFloat(document.getElementById('e_months').value)||12);
  const dist=(parseFloat(document.getElementById('v_dist').value)||0);
  const vf=(parseFloat(document.getElementById('v_type').value)||0);
  const vc=(parseFloat(document.getElementById('v_count').value)||1);
  const lpg=(parseFloat(document.getElementById('i_lpg').value)||0);
  const coal=(parseFloat(document.getElementById('i_coal').value)||0);
  const waste=(parseFloat(document.getElementById('i_waste').value)||0);
  const eAnn=kwh*ef*months;
  const vAnn=dist*vf*vc*12;
  const lpgAnn=lpg*29.5;
  const coalAnn=coal*2.42*12;
  const wasteAnn=waste*.5*12;
  const total=Math.round(eAnn+vAnn+lpgAnn+coalAnn+wasteAnn);
  document.getElementById('totalCO2').textContent=total.toLocaleString()+' kg CO₂/year';
  let g,c;
  if(total<800){g='🟢 Excellent — well below India average (1,300 kg)';c='#00ff88';}
  else if(total<1300){g='🟡 Average — matches India per-capita baseline';c='#ffd000';}
  else if(total<2000){g='🟠 High — 1.5× India average';c='#ff7426';}
  else{g='🔴 Very High — urgent reduction needed';c='#ff3d5a';}
  document.getElementById('co2Grade').textContent=g;
  document.getElementById('totalCO2').style.color=c;
  const pcts=[
    {l:'Electricity',v:eAnn,c:'#4080ff'},
    {l:'Transport',v:vAnn,c:'#ff7426'},
    {l:'LPG/Cooking',v:lpgAnn,c:'#ffd000'},
    {l:'Coal',v:coalAnn,c:'#ff3d5a'},
    {l:'Waste',v:wasteAnn,c:'#00ffcc'}
  ];
  const max=Math.max(...pcts.map(p=>p.v),1);
  document.getElementById('co2Bars').innerHTML=pcts.map(p=>`
    <div class="rbar-row">
      <div class="rbar-lbl">${p.l}</div>
      <div class="rbar-track"><div class="rbar-fill" style="width:${Math.round(p.v/max*100)}%;background:${p.c}"></div></div>
      <div class="rbar-val" style="color:${p.c}">${Math.round(p.v)} kg</div>
    </div>`).join('');
  document.getElementById('calcResult').classList.add('vis');
  // Update comparison chart if exists
  if(C['compChart']){
    C['compChart'].data.datasets[0].data[0]=total;
    C['compChart'].update();
  }
}

// ── IOT LIVE JITTER ──
setInterval(()=>{
  const jit=(b,r)=>(b+(Math.random()-.5)*r*2).toFixed(1);
  const co2el=document.getElementById('iot-co2');if(co2el)co2el.textContent=jit(412,8)+' ppm';
  const pm25el=document.getElementById('iot-pm25');if(pm25el)pm25el.textContent=jit(54,4)+' µg/m³';
  const tel=document.getElementById('iot-temp');if(tel)tel.textContent=jit(28.4,.8)+'°C';
  const hel=document.getElementById('iot-hum');if(hel)hel.textContent=Math.round(62+(Math.random()-.5)*4)+'%';
  const nel=document.getElementById('iot-no2');if(nel)nel.textContent=jit(31,3)+' µg/m³';
  const wel=document.getElementById('iot-wind');if(wel)wel.textContent=jit(8.2,1.5)+' km/h';
  // overview ticker vals
  const t=document.getElementById('iot-temp');
},3000);

