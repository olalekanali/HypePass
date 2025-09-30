const jwt = require("jsonwebtoken");
const User = require("../models/User.model");
const bcrypt = require("bcrypt");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIN: "1d" });
};

// Register a New User
exports.register = async (req, res) => {
  const { email, password, username, firstName, lastName } = req.body;

  try {
    //Check if user exist already
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res
        .status(400)
        .json({ message: "User already exists!, Kindly Login " });
    }
    // Create a new user
    const newUser = await User.create({
      email,
      password,
      username,
      firstName,
      lastName,
    });
    res.status(200).json({
      _id: newUser.id,
      email: newUser.email,
      username: newUser.username,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      token: generateToken(newUser),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Login User
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    //Check if user account already exist
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ message: "User Account with this email does not exist!" });
    }

    // Compare and Validate Password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ message: "Wrong Password. Kindly try again" });
    }

    res.status(200).json({
      _id: newUser.id,
      email: newUser.email,
      username: newUser.username,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      token: generateToken(newUser),
    });
  } catch (err) {
    res.status(500).json({ message: err.meassage });
  }
};
