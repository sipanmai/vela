var jwt = require('jsonwebtoken');
signToken = (payload,) =>{
    const key = jwt.sign(payload, process.env.JWT_KEY)
    return key
}

verifyToken = (req, res, next) =>{

    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer")) {
            return res.status(400).json({ message: "Invalid or missing Authorization header" });
        }
        
        const token = authHeader.split("Bearer ")[1].trim();
        if (!token) {
            return res.status(400).json({ message: "No token provided" });
        }

        const decoded = jwt.verify(token, process.env.JWT_KEY);
        req.user = decoded; // Attach the decoded token payload to the request object
        
        console.log(req.user);
     
        next();
    } catch (error) {
        console.error("JWT verification error:", error);
        return res.status(401).json({ message: "Invalid token" });
    }
}

module.exports = {signToken, verifyToken}