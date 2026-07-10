const express=require('express');
const router=express.Router();
let users=[{id:1,name:'Vivek'}];
router.get('/users',(req,res)=>res.json(users));
router.post('/users',(req,res)=>{
 const {name}=req.body;
 if(!name||!name.trim()) return res.status(400).json({error:'Name is required'});
 const user={id:users.length+1,name:name.trim()};
 users.push(user);
 res.json({message:'User added',user});
});
module.exports=router;
