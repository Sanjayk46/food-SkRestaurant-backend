// const { verify } = require('jsonwebtoken');
// const UNAUTHORIZED = 401;
// const authMiddleware = (req, res, next) => {
// const authHeader = req.headers['authorization'];
// const token = authHeader.split('')[1];
//   console.log(token);
//   if (!token) return res.status(UNAUTHORIZED).send();
//    try {
//     const decoded = verify(token, process.env.JWT_SECRET); // Assuming jwt is imported
//     req.user = decoded;

//   } catch (error) {
//     console.log(error);
//     return res.status(500).send({
//       message:error.message
//   });
//   }
  
// };
// module.exports = authMiddleware;
const { verify } = require('jsonwebtoken');
const UNAUTHORIZED = 401;

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(UNAUTHORIZED).send({
            message: "Invalid authorization header format"
        });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = verify(token, process.env.JWT_SECRET); // Assuming jwt is imported
        req.user = decoded;
        next(); // Call next middleware
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            message: error.message
        });
    }
};

module.exports = authMiddleware;
