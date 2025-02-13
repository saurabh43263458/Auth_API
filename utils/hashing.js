const {hash,compare} = require('bcryptjs');

exports.dohash = (value,saltValue)=>{
    const result = hash(value,saltValue);
    return result;
}

exports.dohashValidator =(value,hashedValue)=>{
    const result  = compare(value,hashedValue);
    return result;
}