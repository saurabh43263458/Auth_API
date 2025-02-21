const {signupSchema,loginSchema,acceptCodeSchema, changePasswordSchema, acceptFpCodeSchema} =require("../middlewares/validator");
const user =  require("../models/userModel");
const {dohash,dohashValidator,hmacProcess} = require("../utils/hashing")
const jwt  = require("jsonwebtoken");
const crypto = require("crypto");
const transport = require("../middlewares/sendMail");
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
        res.cookie('Authorization','Bearer '+token,{expires:new Date(Date.now()+8*3600000),httpOnly:process.env.NODE_ENV === 'production',secure:process.env.NODE_ENV === 'production'})
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

exports.sendVerification =async(req,res)=>{
    const {email} =req.body;
    try{
        const existingUser =await user.findOne({email});
        if(!existingUser){
               return res.status(404).json({success:false,message:"user does not exist"});
        }
        if(existingUser.verified){
            return res.status(401).json({
                success:false,
                message:"user is already verified"
            })
        }
        const generateOTP = (length = 6) => {
            return crypto.randomInt(10 ** (length - 1), 10 ** length).toString();
        };

        const OTP =generateOTP();
        let info = await transport.sendMail({
            from:process.env.EMAIL,
            to:existingUser.email,
            subject:"Email Verification",
            html:`<h2>OTP for email verification is ${OTP} </h2>`
        })

        if(info.accepted[0]==existingUser.email){
            const hashedCodeValue = hmacProcess(OTP,process.env.OTP_SECERT);
            existingUser.verificationCode =hashedCodeValue;
            existingUser.verificationCodeValidation = Date.now();
            existingUser.save();
            return res.status(200).json({
                success:true,
                message:"OTP has been sent to your email",
                existingUser
            })
        }
        res.status(400).json({ success: false, message: 'Code sent failed!' });
    }catch(err){
        console.log(err);
    }
}
exports.verifyVerificationCode = async(req,res)=>{
    const {email,providedCode} = req.body;
    try{
         const {error,value} = acceptCodeSchema.validate({email,providedCode});
         if(error){
            return res.status(401).json({success:false,message:error.details[0].message});
         }
         const codeValue = providedCode.toString();
         const existingUser = await user.findOne({email}).select('+verificationCode +verificationCodeValidation');
         if(!existingUser){
            return res.status(401).json(
                {success:false,meassge:"user does not exist"}
            )
         }
         if(existingUser.verified){
            return res.status(400).json({success:true,message:"your are already verified"});
         }
         if(!existingUser.verificationCode || !existingUser.verificationCodeValidation){
            return res.status(400).json({success:false,message:"No code found"});
         }
         if(Date.now()-existingUser.verificationCodeValidation>5*60*1000){
            return res.status(400).json({success:false,message:"Code expired"});
         }
         const hashedCodeValue = hmacProcess(codeValue,process.env.OTP_SECERT);
         if(hashedCodeValue === existingUser.verificationCode){
            existingUser.verified =true;
            existingUser.verificationCode =undefined;
            existingUser.verificationCodeValidation =undefined;
            existingUser.save();
            return res.status(200).json({success:true ,message:"User verification successful"});
         }
         return res.status(400).json(
            {success:false,meassge:"something unaccepted happened",hashedCodeValue,existingUser}
        )
     }catch(error){
        console.log(error);
    }
}

exports.changePassword =async(req,res)=>{
    const {userId,verified} =req.user;
    const {oldPassword,newPassword} =req.body;
    try {
        const {error,value} = changePasswordSchema.validate({oldPassword,newPassword});
        if(error){
            return res.status(401).json({success:false,message:error.details[0].message})
        }
        if(!verified){
            return res.status(401).json({success:false,message:"user is not veriified"});
        }
        const existingUser = await user.findOne({_id:userId}).select('+password');
        if(!existingUser){
            return res.status(401).json({success:false,message:"user does not exist "});

        }
        const result = await dohashValidator(oldPassword,existingUser.password);
        if(!result){
            return res.status(401).json({success:false,message:"Invalid credentials!"})
        }
        const hashedpp = await dohash(newPassword,12);
        existingUser.password=hashedpp;
        await existingUser.save();
        return res.status(200).json({success:true,message:"password changed"})
    } catch (error) {
        console.log(error)
    }
}
exports.sendforgotedPasswordCode =async(req,res)=>{
    const {email} =req.body;
    try{
        const existingUser =await user.findOne({email});
        if(!existingUser){
               return res.status(404).json({success:false,message:"user does not exist",existingUser});
        }
        
        const generateOTP = (length = 6) => {
            return crypto.randomInt(10 ** (length - 1), 10 ** length).toString();
        };

        const OTP =generateOTP();
        let info = await transport.sendMail({
            from:process.env.EMAIL,
            to:existingUser.email,
            subject:"forget code Verification",
            html:`<h2>OTP for email verification is ${OTP} </h2>`
        })

        if(info.accepted[0]==existingUser.email){
            const hashedCodeValue = hmacProcess(OTP,process.env.OTP_SECERT);
            existingUser.forgetPasswordcode =hashedCodeValue;
            existingUser.forgetPasswordCodeValidation = Date.now();
            await existingUser.save();
            return res.status(200).json({
                success:true,
                message:"OTP has been sent to your email",
                existingUser
            })
        }
        res.status(400).json({ success: false, message: 'Code sent failed!' });
    }catch(err){
        console.log(err);
    }
}
exports.verifyforgotPasswordCode = async(req,res)=>{
    const {email,providedCode,newPassword} = req.body;
    try{
         const {error,value} = acceptFpCodeSchema.validate({email,providedCode,newPassword});
         if(error){
            return res.status(401).json({success:false,message:error.details[0].message});
         }
         const codeValue = providedCode.toString();
         const existingUser = await user.findOne({email}).select('+forgetPasswordcode +forgetPasswordCodeValidation');
         if(!existingUser){
            return res.status(401).json(
                {success:false,meassge:"user does not exist"}
            )
         }
        
         if(!existingUser.forgetPasswordcode || !existingUser.forgetPasswordCodeValidation){
            return res.status(400).json({success:false,message:"No code found"});
         }
         if(Date.now()-existingUser.forgetPasswordCodeValidation>5*60*1000){
            return res.status(400).json({success:false,message:"Code expired"});
         }
         const hashedCodeValue = hmacProcess(codeValue,process.env.OTP_SECERT);
         if(hashedCodeValue === existingUser.forgetPasswordcode){
            const hashedpassword =await dohash(newPassword,12);
            existingUser.password =hashedpassword
            existingUser.verified =true;
            existingUser.forgetPasswordcode =undefined;
            existingUser.forgetPasswordCodeValidation =undefined;
            existingUser.save();
            return res.status(200).json({success:true ,message:"verification of password change is successful"});
         }
         return res.status(400).json(
            {success:false,meassge:"something unaccepted happened",hashedCodeValue,existingUser}
        )
     }catch(error){
        console.log(error);
    }
}