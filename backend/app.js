require('dotenv').config();
const express=require('express');
const cors=require('cors');
const rateLimit=require('express-rate-limit');
require('./services/alert-monitor/alertCron');

const app=express();
app.use(cors({origin:process.env.FRONTEND_URL||'*'}));
app.use(express.json());
app.use(rateLimit({windowMs:15*60*1000,max:500}));

app.use('/api/workers',  require('./routes/workers'));
app.use('/api/policies', require('./routes/policies'));
app.use('/api/claims',   require('./routes/claims'));
app.use('/api/payouts',  require('./routes/payouts'));
app.use('/api/alerts',   require('./routes/alerts'));
app.use('/api/fraud',    require('./routes/fraud'));
app.use('/api/analytics',require('./routes/analytics'));
app.use('/api/weather',  require('./routes/weather'));
app.use(require('./middleware/errorHandler'));

app.get('/health',(_, res)=>res.json({status:'ok',version:'3.0',ml_api:process.env.ML_API_URL||'http://localhost:5001',weather_api:process.env.OPENWEATHER_API_KEY?'configured':'mock_mode',ts:new Date()}));

const PORT=process.env.PORT||5000;
app.listen(PORT,()=>console.log(`🚀 GigShield Phase 3 on port ${PORT}`));
module.exports=app;
