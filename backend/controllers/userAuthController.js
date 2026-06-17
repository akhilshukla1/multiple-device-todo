import User from "../model/auth-model.js";
import bcrypt from "bcrypt";
import validator from "validator";
import jwt from "jsonwebtoken";
import RefreshToken from "../model/refreshTokens-model.js";

const registerUser = async (req, res) => {
  try {
    let { name, email, password } = req.body;
    email = email.toLowerCase();
    email = email.trim();
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Please provide all the fields" });
    }
    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: "Please provide a valid email" });
    }
    if (!validator.isLength(password, { min: 6 })) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters long" });
    }
    const userExists = await User.findOne({ email });
    console.log(userExists);
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }
    const salt = await bcrypt.genSalt(10);
    password = await bcrypt.hash(password, salt);
    const user = await User.create({
      name,
      email,
      password,
    });

    res.status(200).json({ message: "User created successfully", user });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error creating user" });
  }
};

const loginUser = async (req, res) => {
  try {
    let { email } = req.body;

    email = email.toLowerCase();
    email = email.trim();
    if (!email || !req.body.password) {
      return res.status(400).json({ message: "Please provide all the fields" });
    }
    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: "Please provide a valid email" });
    }
    if (!validator.isLength(req.body.password, { min: 6 })) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters long" });
    }
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    const passMatch = await bcrypt.compare(req.body.password, user.password);
    if (!passMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const refreshToken = jwt.sign(
      { id: user.id },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "30d" },
    );
    const session = await RefreshToken.create({
      userId: user._id,
      token: refreshToken,
      device: req.headers["user-agent"],
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    const accessToken = jwt.sign(
      {
        id: user._id,
        email: user.email,
        tokenVersion: user.tokenVersion,
        sessionId: session._id,
      },
      process.env.JWT_SECRET,
      { expiresIn: "15m" },
    );

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    console.log(refreshToken);

    return res
      .status(200)
      .json({ message: "User logged in successfully", user, accessToken });
  } catch (err) {
    res.status(500).json({ message: "Error logging in user" });
  }
};

const logout = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    if (token) {
      await RefreshToken.deleteOne({ token });
    }
    res.clearCookie("refreshToken", {
      httpOnly: true,
    });

    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (err) {
    console.log("Logout Error:", err);

    return res.status(500).json({
      success: false,
      message: "Logout failed",
    });
  }
};
const logoutDevice = async (req, res) => {
  try {
    const sessionId = req.params.id;

    const session = await RefreshToken.findOneAndDelete({
      _id: sessionId,
      userId: req.user.id,
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Device logged out successfully",
    });
  } catch (err) {
    console.log(err);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
const logoutAll = async (req, res) => {
  try {
    await RefreshToken.deleteMany({ userId: req.user.id });
    await User.findByIdAndUpdate(req.user._id, {
      $inc: {
        tokenVersion: 1,
      },
    });

    res.clearCookie("refreshToken", { httpOnly: true });
    return res.status(200).json({
      success: true,
      message: "Logged out from all devices",
    });
  } catch (err) {
    console.log(err);

    return res.status(500).json({
      success: false,
      message: "Logout failed",
    });
  }
};

const refreshToken = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Refresh Token Missing!",
      });
    }
    const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);

    const storedToken = await RefreshToken.findOne({ token });
    if (!storedToken) {
      return res.status(401).json({
        success: false,
        message: "Session expired. Please login again.",
      });
    }

    if (storedToken.userId.toString() !== decoded.id) {
      return res.status(401).json({
        success: false,
        message: "Invalid session",
      });
    }

    const accessToken = jwt.sign(
      { id: storedToken.userId },
      process.env.JWT_SECRET,
      {
        expiresIn: "15m",
      },
    );
    // console.log("Cookies:", req.cookies);
    console.log("Decoded:", decoded);

    res.status(200).json({
      success: true,
      accessToken,
    });
  } catch (err) {
    console.log("Refresh Error:", err);
    console.log("Cookies:", req.cookies);
    res.status(401).json({
      success: false,
      message: "Invalid refresh token",
    });
  }
};

const getActiveSessions = async (req, res) => {
  try {
    const sessions = await RefreshToken.find({
      userId: req.user.id,
    });
    const formattedSessions = sessions.map((session) => ({
      ...session.toObject(),
      current: session.token === req.cookies.refreshToken,
    }));

    return res.status(200).json({
      success: true,
      totalDevices: sessions.length,
      sessions: formattedSessions,
    });
  } catch (err) {
    console.error("Get Sessions Error:", err);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch active sessions",
    });
  }
};

export {
  registerUser,
  loginUser,
  logout,
  refreshToken,
  getActiveSessions,
  logoutAll,
  logoutDevice,
};
