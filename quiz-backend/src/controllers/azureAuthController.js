import { initializeModels } from "../models/index.js";

export async function azureLogin(req, res, next) {
  try {
    const { User } = await initializeModels();
    const azureUser = req.azureUser;

    const email = azureUser.preferred_username || azureUser.email;
    const name = azureUser.name;

    if (!email) {
      return res.status(400).json({ success: false, message: "Invalid Azure user data" });
    }

    // Check if user exists, else create
    let user = await User.findOne({ where: { MAIL: email } });
    console.log("Azure login successful for user:", user.ID);

    if (!user) {
      user = await User.create({
        USERNAME: name,
        MAIL: email,
        PASSWORD: null, // MSAL users don’t need local passwords
      });
    }

    res.json({
      success: true,
      message: "Authenticated with Microsoft successfully",
      data: {
        userId: user.ID,
        USERNAME: user.USERNAME,
        MAIL: user.MAIL,
      },
    });
  } catch (error) {
    console.error("Azure login error:", error);
    next(error);
  }
}
