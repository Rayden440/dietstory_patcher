const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

function generate(payload, options, callback){
	jwt.sign(payload, process.env.NODE_JWT_SECRET, options, function(err, token){
		if(err){
			callback(err, null);
		}
		else{
			callback(null, token);
		}
	});
}

module.exports.generate = generate;