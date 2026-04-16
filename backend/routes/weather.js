const router=require('express').Router();
const{getWeatherForZone}=require('../services/weather/weatherService');
const pool=require('../config/db');
const{processAlert}=require('../services/claim-engine/claimOrchestrator');

// GET /api/weather/zone?city=mumbai&ward_id=MUM-W14
router.get('/zone',async(req,res,next)=>{try{
  const{city='mumbai',ward_id='MUM-W14'}=req.query;
  const weather=await getWeatherForZone(city,ward_id);
  res.json(weather);
}catch(e){next(e);}});

// POST /api/weather/auto-check — auto-trigger if real weather warrants it
router.post('/auto-check',async(req,res,next)=>{try{
  const{city,ward_id}=req.body;
  const weather=await getWeatherForZone(city,ward_id);
  if(!weather.disruption_active||!weather.alert_level){
    return res.json({triggered:false,message:'No disruption detected',weather});
  }
  // Check not already active alert for this zone
  const existing=await pool.query("SELECT id FROM alerts WHERE ward_id=$1 AND is_active=true AND created_at>NOW()-INTERVAL'1 hour'",[ward_id]);
  if(existing.rows.length>0){
    return res.json({triggered:false,message:'Alert already active for zone',weather});
  }
  const started_at=new Date();
  const ended_at=new Date(started_at.getTime()+3*3600000);
  const{rows:[alert]}=await pool.query(`INSERT INTO alerts (source,ward_id,city,alert_level,severity_multiplier,confidence_score,started_at,ended_at,is_active) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,true) RETURNING *`,['openweathermap',ward_id,city.toLowerCase(),weather.alert_level,weather.severity_multiplier,weather.confidence_score,started_at,ended_at]);
  const ct=await processAlert(alert);
  res.json({triggered:true,alert,claims_triggered:ct,weather,message:`Auto-triggered from live weather data`});
}catch(e){next(e);}});

// GET /api/weather/all-zones — check all active zones
router.get('/all-zones',async(req,res,next)=>{try{
  const zones=[
    {city:'mumbai',ward_id:'MUM-W14'},{city:'mumbai',ward_id:'MUM-W07'},
    {city:'delhi',ward_id:'DEL-W22'},{city:'bangalore',ward_id:'BLR-W09'},
  ];
  const results=await Promise.all(zones.map(z=>getWeatherForZone(z.city,z.ward_id)));
  res.json(results);
}catch(e){next(e);}});

module.exports=router;
