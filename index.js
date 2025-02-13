const express =require('express');
const helmet = require('helmet');
const cors = require('cors');
const mongoose = require('mongoose');
const cookies =require('cookie-parser');
const app = express();
const authRouter = require("./routers/authRouter");
app.use(express.json());
app.use(cookies());
app.use(express.urlencoded({extended:true}));
app.use(cors());
app.use(helmet());

mongoose.connect(process.env.MONGO_URL).then(()=>{
    console.log('connected to mongo');
}).catch((err)=>{
    console.log(err);
})
app.use('/api/auth',authRouter);
app.get('/',(req,res)=>{
    res.json({message:"hello world"});
})

app.listen(3000,()=>{
    console.log('listening');
})