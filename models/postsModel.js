const mongoose = require('mongoose');
const postSchema = mongoose.Schema({
    title:{
        tpye:String,
        required:[true,'title is required'],
        trim:true,
    },
    description:{
       type:String,
       required:[true,'description is required'],
       trim:true,
    },
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true,
    }
},{timestamps:true})

model.export = mongoose.model('Post',postSchema);