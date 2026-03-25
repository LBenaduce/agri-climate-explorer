const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const { PORT = 3001, MONGO_URI = "mongodb://127.0.0.1:27017/agriclimate" } = process.env;

const auth = require("./middleware/auth");
const { login, register, getProfile } = require("./controllers/users");
const {
  getLocations,
  createLocation,
  deleteLocation
} = require("./controllers/locations");
const { getWeather } = require("./controllers/weather");

app.use(cors());
app.use(express.json());

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.error("MongoDB connection error:", error.message));

app.get("/health", (req, res) => {
  res.send({ status: "ok" });
});

app.post("/signup", register);
app.post("/signin", login);
app.get("/weather", getWeather);

app.use(auth);
app.get("/users/me", getProfile);
app.get("/locations", getLocations);
app.post("/locations", createLocation);
app.delete("/locations/:id", deleteLocation);

app.use((err, req, res, next) => {
  console.error(err);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).send({
    message: err.message || "Internal server error"
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});