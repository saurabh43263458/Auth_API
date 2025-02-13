const {signupSchema,loginSchema} =require("../middlewares/validator");
const user =  require("../models/userModel");
const {dohash,dohashValidator} = require("../utils/hashing")
const jwt  = require("jsonwebtoken");
exports.signup = async (req,res)=>{
    const {email,password} =req.body;
    try{
        const {error,value} =signupSchema.validate({email,password});
        if(error){
           return res.status(401).json({success:false,message:error.details[0].message});

        }
        const existingUser = await user.findOne({email});
        if(existingUser){
            res.status(401).json({success:false,message:"User already exist"});
        }
        const hashedpassword = await dohash(password,12);
        const newUser =new user({
            email,
            password:hashedpassword,
        })
        const result = await newUser.save();
        result.passowrd = undefined;
        res.status(201).json({success:true,result,message:"User created successfully"});
    }catch(err){
       console.log(err);
    }
}

exports.login =async(req,res)=>{
    const {email,password} =req.body;
    try{
        const {error,value} =loginSchema.validate({email,password});
        if(error){
           return res.status(401).json({success:false,message:error.details[0].message});

        }
        const existingUser = await user.findOne({email}).select('+password');
        if(!existingUser){
             return res.status(401).json({success:false,message:"user does not exist"});
        }
        const isMatch =await dohashValidator(password,existingUser.password);
        if(!isMatch){
            return res.status(401).json({success:false,message:"Invalid password"});
        }
        const token = jwt.sign({
            userId:existingUser._id,
            email:existingUser.email,
            verified:existingUser.verified,
        },process.env.JWT_SECERT,
    {
        expiresIn:'8h',
    });
        res.cookie('Authorization','Bearer'+token,{expires:new Date(Date.now()+8*3600000),httpOnly:process.env.NODE_ENV === 'production',secure:process.env.NODE_ENV === 'production'})
        res.status(200).json({success:true,token,message:"User logged in successfully"});
    }catch(err){
        console.log(err);
    }
}

exports.logout =async(req,res)=>{
    res.clearCookie('Authorization').status(200).json({
        success:true,
        message:"user have been logged out"
    })
}