const express = require('express');
const mongoose = require('mongoose');
const {createUser, getAllUsers, getUser, deleteUser, updateUser} = require('../controllers/userController');
const {getJob} = require('../jobs/jobManager'); 
const router = express.Router();    

const User = require('../db/models/userModel');
const test = (req, res) => {
    console.log("test");
    res.send("test");
}
// שולף את כל המשתמשים
router.get("/", getAllUsers); 
router.post("/create-user", createUser);
// לצורך בדיקה בלבד 
router.get("/getJob/:email", getJob);

router.patch('/:email', updateUser)
router.get('/:email', getUser)
router.delete('/:email', deleteUser)

module.exports = router;