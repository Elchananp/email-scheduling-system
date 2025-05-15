const mongoose = require("mongoose");
const User = require("../db/models/userModel");
const { updateTimeJobs, insertNewJob } = require("../jobs/jobManager");
const { agenda } = require("../jobs/jobManager");

// פונקציה לעדכון משימות קיימות
//
const updateExistingSendTimes = async (email, updated, timezone) => {
  if (!updated || updated.length === 0) return;

  const toUpdate = updated.map((item) => ({
    updateOne: {
      filter: { email: email, "sendTimes._id": item._id },
      update: {
        $set: {
          "sendTimes.$.time": item.time,
          "sendTimes.$.emailType": item.emailType,
        },
      },
    },
  }));

  await User.bulkWrite(toUpdate);
  updateTimeJobs(updated, email, timezone);
};

// פונקציה להוספת פריטים חדשים
const addNewSendTimes = async (user, added) => {
  if (!added || added.length === 0) return [];

  const timezone = user.timezone || getTimezone(user.city, user.country);

  const newItems = added.map((item) => ({
    _id: new mongoose.Types.ObjectId(),
    time: item.time,
    emailType: item.emailType,
  }));

  await User.updateOne(
    { email: user.email },
    { $push: { sendTimes: { $each: newItems } }, $set: { timezone } }
  );

  // לצורך השיחה לפונקציה עדכון המערך המקומי
  user.sendTimes = newItems;
  insertNewJob(user);
  return newItems;
};

// פונקציית עזר שבודקת האם המשימה שנשלחה קיימת או לא וממיינת בהתאם
const diffSendTimes = (oldSendTimes, newSendTimes) => {
  const oldMap = {};

  // בניית מפת oldSendTimes לפי ה-ID של כל משימה
  for (const item of oldSendTimes) {
    // console.log("OLD MAP:", { key: item._id.toString(), value: item });
    oldMap[item._id.toString()] = item;
  }

  const added = [];
  const updated = [];

  // עבור כל פריט ב-newSendTimes
  for (const newItem of newSendTimes) {
    const rawId = newItem._id;
    // המרה לסטרינג לצורך השןןאה ידנית
    const idStr = rawId?.toString();
    const oldItem = oldMap[idStr];

    if (!idStr || !oldItem) {
      // אם לא נמצא ה-ID של המשימה ב-oldSendTimes, אז זוהי משימה חדשה
      const newItemCopy = { ...newItem };
      delete newItemCopy._id; // נמחק את ה-ID כדי שזה יהיה אובייקט חדש
      added.push(newItemCopy); // נוסיף לרשימת החדשות
      console.log("ADDED:", newItemCopy);
    } else {
      // אם ה-ID קיים, בדיקה אם הערכים השתנו (time או emailType)
      if (
        oldItem.time !== newItem.time ||
        oldItem.emailType !== newItem.emailType
      ) {
        updated.push(newItem); // אם יש שינוי, נוסיף לעדכונים
        // console.log("UPDATED:", newItem);
      }
    }
  }

  return { added, updated };
};

// הפונקציה הראשית
const updateAndAddedJobs = async (req, res) => {
  console.log("test updateAndAddedJobs");

  const { email } = req.params;
  const { sendTimes: newSendTimes } = req.body;

  const user = await User.findOne({ email: email });
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const { added, updated } = diffSendTimes(user.sendTimes, newSendTimes);

  console.log("added:", added);
  console.log("updated:", updated);

  await updateExistingSendTimes(email, updated, user.timezone);
  const insertedSendTimes = await addNewSendTimes(user, added);

  res.status(200).json({
    message: "Jobs updated successfully",
    inserted: insertedSendTimes,
    updated: updated,
  });
};

module.exports = { updateAndAddedJobs };
