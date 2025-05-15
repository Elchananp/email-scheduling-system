const User = require("../db/models/userModel");
const getTimezone = require("../utils/convertToTimeZone");
const { insertNewJob, removeAllUserJobs, agenda, updateDetailsOfJobs } = require("../jobs/jobManager");

const getAllUsers = async (req, res) => {
  console.log("Fetching all users..."); // Debugging line

  try {
    const users = await User.find();
    res.status(200).json({
      status: "success",
      results: users.length,
      data: {
        users: users,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getUser = async (req, res) => {
  const { email } = req.params;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({
      status: "success",
      data: {
        user: user,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



const createUser = async (req, res) => {
  console.log("Creating user..."); // Debugging line
  
  try {
    // const { firstName, lastName, country, city, email, sendTimes, isWeekly } =
    const {
      firstName,
      lastName,
      country,
      city,
      email,
      sendTimes,
      preferredDay,
    } = req.body;
    console.log("Received data:", req.body); // Debugging line

    const checkExistingUser = await User.findOne({ email });
    if (checkExistingUser) {
      return res.status(400).json({ error: "Email already exists" });
    }

    // בניית איזור זמן
    const timezone = await getTimezone(city, country);

    if (!timezone) {
      return res.status(400).json({ error: "Could not determine timezone" });
    }

    // const newUser = new User({
    //   firstName,
    //   lastName,
    //   country,
    //   city,
    //   timezone,
    //   email,
    //   sendTimes,
    //   isWeekly,
    // });

    const newUser = new User({
      firstName,
      lastName,
      country,
      city,
      timezone,
      email,
      sendTimes,
      preferredDay,
    });

    // Insert the new user into the agenda
    await insertNewJob(newUser);
    await newUser.save();
    res.status(201).json({
      status: "success",
      data: {
        user: newUser,
      },
    });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// const updateUser = async (req, res) => {
//   const { email } = req.params;
//   const updates = req.body;

//   try {
//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     // אי אפשר לעדכן את המייל
//     if (updates.email && updates.email !== email) {
//       return res.status(400).json({ error: "Email cannot be changed" });
//     }

//     // חלוקה לשדות שחשובים לג'וב
//     const nameFields = ["firstName", "lastName"];
//     const jobRelatedFields = [
//       "timezone",
//       "sendTimes",
//       "preferredDay",
//       "city",
//       "country",
//     ];

//     for (const field of jobRelatedFields) {
//       if (updates[field] && updates[field] !== user[field]) {
//         // isJobChange = true;
//         await removeAllUserJobs(user.email);
//         await insertNewJob(user);
//         break;
//       }
//     }

//     await user.save();

//     // אם צריך – מוחק ויוצר מחדש את הג'וב
//     // if (isJobChange) {
//     //   const { removeAllUserJobs } = require("../jobs/jobManager"); // הנחה: קיימת פונקציה למחיקה
//     //   await removeAllUserJobs(user.email);
//     //   await insertNewJob(user);
//     // }

//     res.status(200).json({
//       status: "success",
//       data: {
//         user : user
//       },
//     });
//   } catch (error) {
//     console.error("Error updating user:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// };

const updateUser = async (req, res) => {
  const { email } = req.params;
  const updates = req.body;
  const changedFields = [];
  let isTimezoneChanged;
  // const { firstName, lastName, city, country } = updates;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    // await User.updateOne(
    //   { email },
    //   { $set: updates }
    // );

    if ('city' in updates && 'country' in updates) {
      const timezone = await getTimezone(updates.city, updates.country);
      if (!timezone) {
        return res.status(400).json({ error: "Could not determine timezone" });
      }
      if (user.timezone !== timezone) {
        updates.timezone = timezone;
        changedFields.push("timezone");
      }
    } else if ('city' in updates || 'country' in updates) {
      return res.status(400).json({
        error: "Please provide both city and country to update timezone",
      });
    }
    
    for (const field in updates) {
      if (updates[field] !== user[field]) {
        changedFields.push(field);
      }
    }
    


    if (changedFields.length === 0) {
      console.log("Changed fields:", changedFields);
      return res.status(400).json({ message: "No changes made" });
    }

    const updatedUser = await User.findOneAndUpdate(
      { email },
      { $set: updates },
      { new: true, runValidators: true }
    );
    
    isTimezoneChanged = changedFields.includes("timezone");
    // פונקציה לעידכון הגובים אם יש שינוי של איזור זמן אני צריך לחשב את איזור הזמן ואם לא אני רק צריך להוסיף שם

    await updateDetailsOfJobs(email, updatedUser, isTimezoneChanged);
    res
      .status(201)
      .json({ message: "User updated successfully", user: updatedUser });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const deleteUser = async (req, res) => {
  const { email } = req.params;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    console.log("from deleteUser", user);

    await user.deleteOne({ email });
    await removeAllUserJobs(email);

    res.status(200).json({
      status: "success",
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { createUser, getAllUsers, getUser, deleteUser, updateUser };
