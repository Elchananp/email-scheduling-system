const User = require("../db/models/userModel");
const Agenda = require("agenda");
require("dotenv").config();
const mongoose = require("mongoose");
const agenda = new Agenda({ db: { address: process.env.MONGO_URI } });

const {
  getUTCFromLocal,
  isTaskScheduledToday,
} = require("../utils/timeHelpers");

const insertNewJob = async (user) => {
  const { firstName, _id, sendTimes, email, timezone } = user;

  for (const entry of sendTimes) {
    const { time, emailType, _id: entryJobId } = entry;
    const entryJobIdStr = entryJobId.toString();
    const utcTimeISO = getUTCFromLocal(time, timezone);
    const shouldSchedule = isTaskScheduledToday(utcTimeISO, timezone);

    if (!shouldSchedule) {
      console.log("Skipping not scheduled:", { time, emailType });
      continue;
    }

    try {
      const job = agenda.create("send email", {
        userId: _id,
        firstName,
        emailType,
        email,
        entryJobId: entryJobIdStr,
      });

      job.unique({ "data.entryJobId": entryJobIdStr });
      job.schedule(utcTimeISO);
      await job.save();

      console.log("Job created:", job.attrs);
    } catch (err) {
      // הגנה מנפילה של השרת אם יש הכנסה כפולה
      if (err.code === 11000) {
        console.warn("Duplicate job, skipping:", { entryJobId: entryJobIdStr });
      } else {
        // כל שגיאה אחרת עולה חזרה
        throw err;
      }
    }

    console.log("from insertNewJob", { time, emailType });
  }
};


//   const utcTimeISO = getUTCFromLocal(time, timezone);
//   const shouldSchedule = isTaskScheduledToday(utcTimeISO, timezone);

//   if (shouldSchedule) {
//     await agenda.schedule(utcTimeISO, "send email", {
//       userId: _id,
//       firstName,
//       emailType,
//       email,
//     });
//   }
// };

// מגדירים את המשימה לבניית תזמונים

agenda.define("build tasks", async (job, done) => {
  console.log("Building tasks...");

  try {
    const users = await User.find({});

    for (const user of users) {
      const { firstName, _id, sendTimes, email, timezone } = user;

      for (const entry of sendTimes) {
        const { time, emailType, _id: entryJobId } = entry;
        const entryJobIdStr = entryJobId.toString();

        const utcTimeISO = getUTCFromLocal(time, timezone);
        const shouldSchedule = isTaskScheduledToday(utcTimeISO, timezone);

        if (shouldSchedule) {
          const job = agenda.create("send email", {
            userId: _id,
            firstName,
            emailType,
            email,
            entryJobId: entryJobIdStr,
          });

          job.unique({ "data.entryJobId": entryJobIdStr });
          job.schedule(utcTimeISO);

          try {
            await job.save();
            // console.log("Job saved:", entryJobIdStr);
          } catch (err) {
            // הגנה מנפילה של השרת אם יש הכנסה כפולה
            if (err.code === 11000) {
              console.log("Duplicate job, skipping:", entryJobIdStr);
            } else {
              throw err;
            }
          }
        }
      }
    }

    done();
  } catch (error) {
    console.error("Error in build tasks:", error);
    done(error);
  }
});

// הגדרת את המשימה לשליחת מייל
agenda.define("send email", async (job) => {
  const { firstName, emailType, email } = job.attrs.data;
  console.log(`Sending ${emailType} email to ${firstName} (${email})`);
  console.log(`hello ${firstName}, this is your ${emailType} email!`);
});

//  מתבצע במצב של מחיקת יוזר
const removeAllUserJobs = async (userEmail) => {
  try {
    await agenda.cancel({ "data.email": userEmail });
    console.log(`Removed jobs for user with email: ${userEmail}`);
  } catch (error) {
    console.error(`Failed to remove jobs for ${userEmail}:`, error);
  }
};

const getJob = async (req, res) => {
  const userEmail = req.params.email;
  console.log("getJOB started", userEmail);
  try {
    const jobs = await agenda.jobs({ "data.email": userEmail });
    console.log(`Jobs for userEmail`, jobs);
  } catch (error) {
    console.error(`Failed to get jobs for ${userEmail}:`, error);
  }
};


const updateTimeJobs = async (arrayOfChanged, userMail, timezone) => {
  console.log("updateTimeJobs started", arrayOfChanged);

  try {
    const jobs = await agenda.jobs({ "data.email": userMail });
    console.log("jobs", jobs);
    console.log("jobs length", jobs.length);

    for (const changedItem of arrayOfChanged) {
      const { _id, time, emailType } = changedItem;

      console.log("Processing changedItem:", changedItem);

      // שןלף את המשימה המתאימה לפי entryJobId
      const jobs = await agenda.jobs({
        "data.entryJobId": _id,
        "data.email": userMail,
      });
      // אמורה להיות לי רק תוצאה יחידה
      const job = jobs[0];
      if (job) {
        if (time) job.attrs.data.time = time;
        if (emailType) job.attrs.data.emailType = emailType;

        // עדכון זמן ריצה אם השעה השתנתה
        if (time) {
          const utcTimeISO = getUTCFromLocal(time, timezone);
          const shouldSchedule = isTaskScheduledToday(utcTimeISO, timezone);
          console.log("utcTimeISO", utcTimeISO);
          console.log("shouldSchedule", shouldSchedule);

          if (shouldSchedule) {
            job.attrs.nextRunAt = new Date(utcTimeISO);
            await job.save();
            console.log("AFTER UPDATE job:", job.attrs);
          }
        }

      } else {
        console.log("No job found with entryJobId:", _id);
      }
    }

    console.log(`✅ Updated tasks for user: ${userMail}`);
  } catch (error) {
    console.error("❌ Error updating tasks:", error);
    throw new Error("Error updating tasks");
  }
};

const updateDetailsOfJobs = async (userMail, user, isTimezoneChanged) => {
  try {
    const jobs = await agenda.jobs({ "data.email": userMail });
    const { firstName: newFirstName, sendTimes, timezone } = user;

    for (let i = 0; i < jobs.length; i++) {
      const job = jobs[i];
      const jobData = job.attrs.data;
      const jobTime = job.attrs.nextRunAt;
      // בדיקה על גובים שעבר זמנם עקב באג שקרה לי
      if (!jobTime || jobTime <= new Date()) continue;

      let hasChanges = false;

      // עדכון שם אם צריך
      if (newFirstName && jobData.firstName !== newFirstName) {
        job.attrs.data.firstName = newFirstName;
        hasChanges = true;
      }

      // עדכון אזור זמן אם צריך
      if (isTimezoneChanged && sendTimes[i]) {
        const { time, emailType } = sendTimes[i];
        const utcTimeISO = getUTCFromLocal(time, timezone);
        const shouldSchedule = isTaskScheduledToday(utcTimeISO, timezone);

        if (shouldSchedule) {
          job.attrs.nextRunAt = new Date(utcTimeISO);
          hasChanges = true;
        }
      }

      if (hasChanges) {
        await job.save();
      }
    }

    console.log(`✅ Updated jobs for user: ${userMail}`);
  } catch (error) {
    console.error("❌ Error updating jobs:", error);
    throw new Error("Error updating jobs");
  }
};

module.exports = {
  agenda,
  insertNewJob,
  removeAllUserJobs,
  getJob,
  updateDetailsOfJobs,
  updateTimeJobs,
};
