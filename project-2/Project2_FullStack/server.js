const express=require('express');
const path=require('path');
const api=require('./routes/api');
const app=express();
app.use(express.json());
app.use(express.static(path.join(__dirname,'public')));
app.use('/api',api);
app.listen(3000,()=>console.log('http://localhost:3000'));
