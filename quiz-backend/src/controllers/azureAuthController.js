import { initializeModels } from "../models/index.js";

export async function azureLogin(req, res, next) {
  try {
    const { User } = await initializeModels();
    const azureUser = req.azureUser;

    // console.log("Azure user object from middleware:", azureUser);

    const email = azureUser?.preferred_username || azureUser?.email;
    const name = azureUser?.name;

    if (!email) {
      console.error("Azure login error: Missing email in Azure user data");
      return res.status(400).json({
        success: false,
        message: "Invalid Azure user data - missing email",
      });
    }

    // Try to find the user in DB
    let user = await User.findOne({ where: { MAIL: email } });

    // Log before accessing user.ID
    console.log("User lookup result:", user ? user.ID : null);

    if (!user) {
      console.log("No existing user found, creating a new one...");

      user = await User.create({
        USERNAME: name,
        MAIL: email,
        PASSWORD: null, // MSAL users don’t need local passwords
      });

      // console.log("New user created with ID:", user.ID);
    } else {
      // console.log("Existing user found with ID:", user.ID);
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
