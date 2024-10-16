const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Register a new user
exports.register = async (req, res) => {
    const { username, password } = req.body;
    // console.log(username);

  try {
    // Check if the user already exists
    let user = await User.findOne({ username });
    if (user) {
      return res.status(400).json({ msg: "User already exists" });
    }

    // Create a new user instance
    user = new User({ username });

    // Hash the password before saving the user
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // Save the new user to the database
    await user.save();

    // Create JWT payload
    const payload = { userId: user.id };

    // Sign the token with the payload and secret
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    // Return the token
    res.status(201).json({ token });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// Login an existing user
exports.login = async (req, res) => {
  const { username, password } = req.body;

  try {
    // Check if the user exists
    let user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ msg: "Invalid username or password" });
    }

    // Compare the input password with the stored hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid username or password" });
    }

    // Create JWT payload
    const payload = { userId: user.id };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({ token });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};
exports.logout = (req, res) => {
  res.json({ msg: "Logged out successfully" });
};
