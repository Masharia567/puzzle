import { initializeModels } from "../models/index.js";

export async function azureLogin(req, res, next) {
  try {
    const { User } = await initializeModels();
    const azureUser = req.azureUser;

    const email = azureUser?.preferred_username || azureUser?.email;
    const name = azureUser?.name;
    const azureId = azureUser?.oid || azureUser?.sub; // Get the Azure Object ID

    console.log("Azure ID from token:", azureId); // Debug log

    if (!email || !azureId) {
      console.error("Azure login error: Missing email or Azure ID");
      return res.status(400).json({
        success: false,
        message: "Invalid Azure user data - missing email or Azure ID",
      });
    }

    // Try to find user by Azure ID first, then by email
    let user = await User.findOne({ 
      where: { MICROSOFT_ID: azureId } 
    });

    if (!user) {
      // Check if user exists with this email (legacy user)
      user = await User.findOne({ where: { MAIL: email } });
      
      if (user) {
        // Update existing user with Azure ID
        console.log("Updating existing user with Azure ID...");
        await user.update({ MICROSOFT_ID: azureId });
      } else {
        // Create new user
        console.log("Creating new user with Azure ID...");
        user = await User.create({
          USERNAME: name,
          MAIL: email,
          MICROSOFT_ID: azureId, // SAVE THE AZURE ID HERE
          PASSWORD: null,
        });
      }
    }

    console.log("User authenticated with Azure ID:", user.MICROSOFT_ID);

    res.json({
      success: true,
      message: "Authenticated with Microsoft successfully",
      data: {
        userId: user.ID,
        USERNAME: user.USERNAME,
        MAIL: user.MAIL,
        MICROSOFT_ID: user.MICROSOFT_ID, // Return it too
      },
    });
  } catch (error) {
    console.error("Azure login error:", error);
    next(error);
  }
}