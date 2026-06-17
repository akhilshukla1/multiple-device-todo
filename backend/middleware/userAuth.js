import jwt from "jsonwebtoken";
import User from "../model/auth-model.js";
import RefreshToken from "../model/refreshTokens-model.js";

const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    console.log("Authorization Header:", req.headers.authorization);
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "please login!",
      });
    }
    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const session = await RefreshToken.findById(decoded.sessionId);
    if (!session && token) {
      return res.status(401).json({
        success: false,
        message: "Session terminated",
      });
    }
    const user = await User.findById(decoded.id).select("-password");
    // if (user && decoded.tokenVersion !== user.tokenVersion) {
    //   return res.status(401).json({
    //     success: false,
    //     message: "Session terminated",
    //   });
    // }
    req.user = user;
    console.log("Verified User:", decoded);

    next(); //this is done so that the next route handler can access some information like id email token expiry
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }
};

export default auth;
