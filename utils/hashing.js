const { hash, compare } = require('bcryptjs');
const { createHmac } = require('crypto');

exports.dohash = async (value, saltValue) => {
    return await hash(value, saltValue);
};

exports.dohashValidator = async (value, hashedValue) => {
    return await compare(value, hashedValue);
};

exports.hmacProcess = (value, key) => {
    return createHmac('sha256', key).update(value).digest('hex');
};
