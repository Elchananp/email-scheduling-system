const express = require("express");
const router = express.Router();
const {updateAndAddedJobs} = require("../controllers/jobsController");



// updateAndAddedJobs
router.patch("/update-jobs/:email", updateAndAddedJobs);

module.exports = router;
