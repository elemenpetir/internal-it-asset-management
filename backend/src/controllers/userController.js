const userModel = require("../models/userModel");

const getUsers = async (req, res, next) => {
  try {
    const rows = await userModel.getAllUsersMinimal();
    return res.status(200).json({
      status: "success",
      message: "get all users successfully",
      data: rows,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
};
