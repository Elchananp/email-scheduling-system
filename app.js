const express = require("express");
const mongoose = require("mongoose");
const morgan = require("morgan");
const cors = require("cors");
const path = require("path");
const startAgenda = require("./jobs/startAgenda");
// const Agenda = require("agenda");
const User = require("./db/models/userModel");
// const cityTimezones = require("city-timezones");

const userRouter = require("./routes/userRouter");
const jobRouter = require("./routes/jobsRouter");
require("dotenv").config();
const app = express();

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    startAgenda();
  })
  .catch((err) => console.error("MongoDB connection error:", err));

app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

// Serve static files from the React frontend
app.use(express.static(path.join(__dirname, "frontend", "build")));

app.use("/users", userRouter);
app.use("/jobs", jobRouter);

// Serve React app for any non-API routes (only for GET requests to handle client-side routing)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "build", "index.html"));
});





const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
