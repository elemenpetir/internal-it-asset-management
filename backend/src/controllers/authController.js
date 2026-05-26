const userModel = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        status: "failed",
        message: "email and password are required",
      });
    }

    const user = await userModel.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({
        status: "failed",
        message: "invalid email or password",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        status: "failed",
        message: "invalid email or password",
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );
    return res.status(200).json({
      status: "success",
      message: "login success",
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

const activateEmployee = async (req, res, next) => {
  try {
    const { email, employee_number, password } = req.body;

    if (!email || !employee_number || !password) {
      return res.status(400).json({
        status: "failed",
        message: "email, employee number, and password are required",
      });
    }

    const employee = await userModel.findEmployeeForActivation(
      email,
      employee_number,
    );
    if (!employee) {
      return res.status(400).json({
        status: "failed",
        message: "invalid employee data",
      });
    }
    if (employee.user_id) {
      return res.status(400).json({
        status: "failed",
        message: "account already activated",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const role = "employee";
    const newUser = {
      name: employee.name,
      email: employee.email,
      password: hashedPassword,
      role,
    };
    const createdUser = await userModel.activateEmployeeWithTransaction(
      employee.id,
      newUser,
    );

    return res.status(201).json({
      status: "success",
      message: "employee account activated successfully",
      data: {
        user: {
          id: createdUser.insertId,
          name: employee.name,
          email: employee.email,
          role,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login,
  activateEmployee,
};
