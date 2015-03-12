var crypto = require('crypto');

exports.decrypt = function (texto) {
    var alg = 'des-ede3-cbc';
    var key = new Buffer('4sFhYZrZTnPovvuBTFlTC2i0G1Y68ITf', 'base64');
    var iv = new Buffer('D28TLjXCzfk=', 'base64');
    var encrypted = new Buffer(texto, 'base64');
    var decipher = crypto.createDecipheriv(alg, key, iv);
    var decoded = decipher.update(encrypted, 'binary', 'ascii');
    decoded += decipher.final('ascii');
    return decoded;
}

exports.encrypt = function (texto) {
    var alg = 'des-ede3-cbc';
    var key = new Buffer('4sFhYZrZTnPovvuBTFlTC2i0G1Y68ITf', 'base64');
    var iv = new Buffer('D28TLjXCzfk=', 'base64');
    var cipher = crypto.createCipheriv(alg, key, iv);
    var encoded = cipher.update(texto, 'ascii', 'base64');
    encoded += cipher.final('base64');
    return encoded;
}
