const router=require('express').Router(); const pool=require('../config/db');
const SEASONAL_RISK={0:0.7,1:0.7,2:0.8,3:0.9,4:0.9,5:1.3,6:1.5,7:1.5,8:1.3,9:1.0,10:0.8,11:0.7};
const CITY_DAYS={mumbai:35,delhi:25,bangalore:20,chennai:30,pune:15,default:20};

router.get('/dashboard',async(req,res,next)=>{try{
  const[workers,claims,payouts,alerts,fraudStats]=await Promise.all([
    pool.query('SELECT COUNT(*) AS total,COUNT(CASE WHEN created_at>NOW()-INTERVAL\'7 days\' THEN 1 END) AS new_this_week FROM workers'),
    pool.query('SELECT COUNT(*) AS total,COUNT(CASE WHEN status=\'paid\' THEN 1 END) AS paid,COUNT(CASE WHEN flag=\'YELLOW\' THEN 1 END) AS yellow,COUNT(CASE WHEN flag=\'RED\' THEN 1 END) AS red FROM claims'),
    pool.query('SELECT COALESCE(SUM(amount),0) AS total,COALESCE(AVG(amount),0) AS avg,COALESCE(AVG(processing_ms),0) AS avg_ms FROM payouts WHERE status=\'paid\''),
    pool.query('SELECT COUNT(*) AS total,COUNT(CASE WHEN is_active THEN 1 END) AS active FROM alerts'),
    pool.query('SELECT COUNT(*) AS flagged_claims FROM claims WHERE flag!=\'GREEN\'')
  ]);
  res.json({workers:workers.rows[0],claims:claims.rows[0],payouts:payouts.rows[0],alerts:alerts.rows[0],fraud:fraudStats.rows[0]});
}catch(e){next(e);}});

router.get('/predictive',async(req,res,next)=>{try{
  const nextMonth=new Date().getMonth()+1;
  const nextMonthRisk=SEASONAL_RISK[nextMonth%12];
  const cities=await pool.query('SELECT city,COUNT(*) AS workers FROM workers GROUP BY city');
  const predictions=cities.rows.map(c=>{
    const days=CITY_DAYS[c.city]||20;
    const expectedClaims=Math.round(parseInt(c.workers)*0.7*nextMonthRisk);
    const expectedPayout=Math.round(expectedClaims*2.5*0.6*60);
    const riskLevel=nextMonthRisk>=1.3?'HIGH':nextMonthRisk>=0.9?'MEDIUM':'LOW';
    return{city:c.city,enrolled_workers:parseInt(c.workers),expected_disruption_days:Math.round(days*nextMonthRisk),expected_claims:expectedClaims,expected_payout:`₹${expectedPayout}`,risk_level:riskLevel,seasonal_factor:nextMonthRisk};
  });
  res.json({next_month:new Date(new Date().setMonth(nextMonth)).toLocaleString('en',{month:'long'}),seasonal_factor:nextMonthRisk,predictions,recommendation:nextMonthRisk>=1.3?'High disruption season — ensure reinsurance pool is funded':'Normal season — standard operations'});
}catch(e){next(e);}});

router.get('/loss-ratio',async(req,res,next)=>{try{
  const{rows}=await pool.query(`SELECT DATE_TRUNC('week',c.created_at) AS week,COALESCE(SUM(py.amount),0) AS paid,COALESCE(SUM(pol.weekly_premium),0) AS premium FROM claims c LEFT JOIN payouts py ON py.claim_id=c.id LEFT JOIN policies pol ON pol.id=c.policy_id WHERE c.created_at>NOW()-INTERVAL'8 weeks' GROUP BY week ORDER BY week`);
  res.json(rows.map(r=>({week:r.week,paid:parseFloat(r.paid),premium:parseFloat(r.premium),loss_ratio:r.premium>0?parseFloat(((r.paid/r.premium)*100).toFixed(1)):0})));
}catch(e){next(e);}});

module.exports=router;
