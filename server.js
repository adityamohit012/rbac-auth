const express = require("express");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const { verifyToken, authorizeRoles } = require("./middleware/authMiddleware");

dotenv.config();
const app = express();
app.use(express.json());

// --- Sample Users ---
const users = [
  { id: 1, username: "adminUser", password: "admin123", role: "Admin" },
  { id: 2, username: "modUser", password: "mod123", role: "Moderator" },
  { id: 3, username: "normalUser", password: "user123", role: "User" },
];

// --- Login Route ---
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  const user = users.find(
    (u) => u.username === username && u.password === password
  );

  if (!user) return res.status(401).json({ message: "Invalid credentials" });

  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  res.json({ token });
});

// --- Protected Routes ---
app.get(
  "/admin-dashboard",
  verifyToken,
  authorizeRoles("Admin"),
  (req, res) => {
    res.json({
      message: "Welcome to the Admin dashboard",
      user: req.user,
    });
  }
);

app.get(
  "/moderator-panel",
  verifyToken,
  authorizeRoles("Moderator", "Admin"),
  (req, res) => {
    res.json({
      message: "Welcome to the Moderator panel",
      user: req.user,
    });
  }
);

app.get("/user-profile", verifyToken, (req, res) => {
  res.json({
    message: `Welcome to your profile, ${req.user.username}`,
    user: req.user,
  });
});

// --- Default Route ---
app.get("/", (req, res) => {
  res.send("Role-Based Access Control API is running...");
});

// --- Start Server ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
