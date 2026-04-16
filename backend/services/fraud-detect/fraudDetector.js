const deviceRegistry = new Map();
const claimHistory = new Map();
const wardClaimWindow = new Map();

function detectFraud({ worker_id, ward_id, gps_accuracy, device_id, city, alert_level }) {
  const signals = []; let score = 0; const now = Date.now();
  if (gps_accuracy !== undefined) {
    if (gps_accuracy < 4) { signals.push({ type:'GPS_SPOOFED', detail:`${gps_accuracy}m — too perfect`, weight:4 }); score+=4; }
    else if (gps_accuracy < 8) { signals.push({ type:'GPS_SUSPICIOUS', detail:`${gps_accuracy}m`, weight:2 }); score+=2; }
  }
  if (device_id) {
    if (!deviceRegistry.has(device_id)) { deviceRegistry.set(device_id, new Set([worker_id])); }
    else { const w=deviceRegistry.get(device_id); w.add(worker_id); if(w.size>1){signals.push({type:'DEVICE_SHARED',detail:`${w.size} accounts`,weight:4});score+=4;} }
  }
  if (!claimHistory.has(worker_id)) claimHistory.set(worker_id,[]);
  const hist = claimHistory.get(worker_id).filter(t=>t>now-7*24*3600000);
  claimHistory.set(worker_id,[...hist,now]);
  if (hist.length>=6){signals.push({type:'HIGH_VELOCITY',detail:`${hist.length} claims/7days`,weight:3});score+=3;}
  else if(hist.length>=4){signals.push({type:'ELEVATED_FREQ',detail:`${hist.length} claims/7days`,weight:1});score+=1;}
  const wk=`${ward_id}_${Math.floor(now/(5*60*1000))}`; const wc=(wardClaimWindow.get(wk)||0)+1; wardClaimWindow.set(wk,wc);
  if(wc>50){signals.push({type:'COORDINATED_RING',detail:`${wc} claims in 5min`,weight:5});score+=5;}
  else if(wc>30){signals.push({type:'WARD_SPIKE',detail:`${wc} claims in 5min`,weight:2});score+=2;}
  if(alert_level==='heatwave'&&['mumbai','bangalore'].includes(city?.toLowerCase())){signals.push({type:'WEATHER_MISMATCH',detail:'Heatwave in coastal city',weight:1});score+=1;}
  const isolation_score=Math.min(Math.round((score/15)*100),100);
  const flag=score>=5?'RED':score>=2?'YELLOW':'GREEN';
  return { flag, score, isolation_score, signals, explanation:flag==='GREEN'?'Clean — auto-approved':flag==='YELLOW'?'Minor anomaly — review':'Multiple signals — blocked' };
}

function checkWardDensity(claimCount, totalEnrolled, alertLevel) {
  if(totalEnrolled<3) return 'GREEN';
  if(['red','orange','bandh'].includes(alertLevel?.toLowerCase())&&(claimCount/totalEnrolled)<0.05&&claimCount<=3) return 'YELLOW';
  return 'GREEN';
}
module.exports = { detectFraud, checkWardDensity };
