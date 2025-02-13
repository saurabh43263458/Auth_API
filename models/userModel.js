const mongoose = require('mongoose');
const userSchema =  mongoose.Schema(
    {
        email:{
            type:String,
            required:[true,'Email is required'],
            unique:[true,'Email already exists'],
            trim:true,
            minLength:[5,"Email must have 5 character"]
        },

        password:{
              type:String,
              required:[true,'password is required'],
              trim:true,
              select:false,
        },
        verified:{
            type:Boolean,
            default:false,
        },
        verificationCode:{
            type:String,
             select:false
        },
        verificationCodeValidation:{
            type:Number,
            select:false,
        },
        forgetPasswordcode:{
            type:String,
            select:false,
        },
        forgetPasswordCodeValidation:{
            type:Number,
            select:false,
        }
    }
,{timestamp:true
});

module.exports =mongoose.model('User',userSchema);