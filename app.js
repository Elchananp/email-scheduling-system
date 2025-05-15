const express = require("express");
const mongoose = require("mongoose");
const morgan = require("morgan");
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

app.use(morgan("dev"));
app.use(express.json());
app.use("/users", userRouter);
app.use("/jobs", jobRouter);





const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
