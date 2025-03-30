const Role = require("./role.modal");
const User = require("../user/user.model");

// ✅ Add Role to a User
exports.AddRole = async (req, res) => {
  console.log("add role");
  try {
    console.log(req.body);

    let position, superAdmin, admin, user, client, general;

    if (Object.keys(req.body).length > 0) {
      // If request body is present, use it
      ({ position, superAdmin, admin, user, client, general } = req.body);
    } else {
      // If request body is empty, fallback to query parameters
      ({ position, superAdmin, admin, user, client, general } = req.query);
    }

    const userId = req.UserSecure_id;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required", isSuccess: false });
    }

    // 🔍 Check if user exists
    const existingUser = await User.findById(userId);
    if (!existingUser) {
      return res.status(404).json({ message: "User not found", isSuccess: false });
    }

    // 🔥 Check if the user already has a role
    let existingRole = await Role.findOne({ userId });

    if (existingRole) {
      // **Update existing role**
      existingRole.position = position ? position.toLowerCase() : existingRole.position;
      existingRole.superAdmin = superAdmin || existingRole.superAdmin;
      existingRole.admin = admin || existingRole.admin;
      existingRole.user = user || existingRole.user;
      existingRole.client = client || existingRole.client;
      existingRole.general = general || existingRole.general;

      await existingRole.save();
    } else {
      // **Create new role if not found**
      existingRole = new Role({
        position: position ? position.toLowerCase() : "general", // Default to general
        superAdmin: superAdmin || null,
        admin: admin || null,
        user: user || null,
        client: client || null,
        general: general || null,
        userId,
      });

      await existingRole.save();
    }

    // **Update the user document with the roleId**
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { roleId: existingRole._id },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      message: existingRole ? "Role updated successfully" : "Role added successfully",
      role: existingRole,
      user: updatedUser,
      isSuccess: true,
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
      isSuccess: false,
    });
  }
};

// ✅ Get Roles Based on Filters
exports.GetRole = async (req, res) => {
  console.log("get role");
  try {
    console.log(req.body);

    let position, superAdmin, admin, user, client, general;

    if (Object.keys(req.body).length > 0) {
      // If request body is present, use it
      ({ position, superAdmin, admin, user, client, general } = req.body);
    } else {
      // If request body is empty, fallback to query parameters
      ({ position, superAdmin, admin, user, client, general } = req.query);
    }

    console.log("----------------------------------");
    console.log("Position:", position);
    console.log("SuperAdmin:", superAdmin);
    console.log("Admin:", admin);
    console.log("User:", user);
    console.log("Client:", client);
    console.log("General:", general);
    console.log("----------------------------------");

    // ✅ Helper function to check if a value is empty
    const isValueEmpty = (value) => {
      const emptyValues = new Set(["empty", "Empty", "EMPTY", "null", "NULL", "Null", ""]);
      return emptyValues.has(value) || value === undefined;
    };

    // ✅ Construct query dynamically
    let query = {};

    if (!isValueEmpty(position)) query.position = position.toLowerCase();
    if (!isValueEmpty(superAdmin)) query.superAdmin = superAdmin;
    if (!isValueEmpty(admin)) query.admin = admin;
    if (!isValueEmpty(user)) query.user = user;
    if (!isValueEmpty(client)) query.client = client;
    if (!isValueEmpty(general)) query.general = general;

    console.log("Querying with:", query);

    // ✅ Fetch roles from the database
    const roles = await Role.find(query).populate("userId", "name email");

    if (roles.length === 0) {
      return res.status(404).json({ message: "No roles found", isSuccess: false });
    }

    res.json({
      message: "Roles retrieved successfully",
      roles,
      isSuccess: true,
      count: roles.length,
    });
  } catch (error) {
    console.error("Error fetching roles:", error.message);
    res.status(500).json({ message: "Internal server error", isSuccess: false });
  }
};
