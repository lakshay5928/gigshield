import axios from 'axios';
const API=axios.create({baseURL:process.env.REACT_APP_API_URL||'http://localhost:5000/api',timeout:10000});
API.interceptors.request.use(cfg=>{const t=localStorage.getItem('gs_token');if(t)cfg.headers.Authorization=`Bearer ${t}`;return cfg;});
API.interceptors.response.use(r=>r,err=>{if(err.response?.status===401){localStorage.clear();window.location.href='/';}return Promise.reject(err);});
export default API;
