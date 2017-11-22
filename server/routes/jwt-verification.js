const express = require('express');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');

dotenv.config();

function verifyLogin(req, res, next)
{
		jwt.verify(res.cookies.dev_token, process.env.NODE_JWT_SECRET, function(err, decoded)
		{
			if(err)
			{
				next(err);
			}
			else
			{
				next();
			}
		});
}

module.exports = verifyLogin;