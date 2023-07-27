const jwt = require('jsonwebtoken');
const User = require('../model/users');

const authenticate = async (req, res, next) => {
  try {
    const token = req.cookies.jwtoken;
    // console.log('Token from cookies:', token); // Log the token value

    if (!token) {
      throw new Error('Token not found in cookies');
    }

    // Verify the token
    const verifyToken = jwt.verify(token, process.env.SECRET_KEY);

    // Fetch the user from the database based on the token data
    const rootUser = await User.findOne({ _id: verifyToken._id, 'tokens.token': token });
    if (!rootUser) {
      throw new Error('User Not Found');
    }

    req.token = token;
    req.rootUser = rootUser;
    req.userID = rootUser._id;
    next();
  } catch (err) {
    res.status(401).send('Unauthorized: No token Provided');
    console.log(err);
  }
};

module.exports = authenticate;
