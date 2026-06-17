import express from "express";
import {
  registerUser,
  loginUser,
  logout,
  refreshToken,
  logoutAll,
  logoutDevice,
} from "../controllers/userAuthController.js";
import auth from "../middleware/userAuth.js";
import { getActiveSessions } from "../controllers/userAuthController.js";
const router = express.Router();
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/verify", auth, (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user,
  });
});
router.post("/refresh", refreshToken);
router.delete("/logoutDevice/:id", auth, logoutDevice);
router.post(`/logout`, logout);

router.delete("/logout-all", auth, logoutAll);
router.get("/get-sessions", auth, getActiveSessions);

export default router;
