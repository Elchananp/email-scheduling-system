const { DateTime } = require("luxon");

/**
   * @param {string} time - שעה בפורמט "HH:mm"
   * @param {string} timezone - מחרוזת אזור זמן (למשל "Europe/Berlin")
   * @returns {string} - תאריך־שעה בפורמט ISO (UTC)
   */

const getUTCFromLocal = (time, timezone) => {
  const now = DateTime.now().setZone(timezone);
  const [hour, minute] = time.split(":").map(Number);

  const localDateTime = DateTime.fromObject(
    {
      year: now.year,
      month: now.month,
      day: now.day,
      hour,
      minute,
    },
    { zone: timezone }
  );

  return localDateTime.toUTC().toISO();
}

// בודק האם תיתכן משימה מזמן הקריאה לפונקציה עד חצות הלילה הקרוב
const isTaskScheduledToday = (utcISOString) => {
  // זמן המשימה ב־UTC
  const taskTimeUTC = DateTime.fromISO(utcISOString, { zone: "utc" });
  // הזמן הנוכחי ב־UTC
  const nowUTC = DateTime.utc();

  // חישוב חצות הלילה הקרוב
  const midnightUTC = nowUTC.endOf("day");

  // בודק אם הזמן של המשימה הוא בין הזמן הנוכחי לבין חצות הלילה הקרוב
  return taskTimeUTC >= nowUTC && taskTimeUTC < midnightUTC;
}

const shouldCreateTaskForUser = (user) => {
  const nowInZone = DateTime.now().setZone(user.timezone);
  const [hour, minute] = user.time.split(":").map(Number);

  // יצירת אובייקט זמן לפי איזור המשתמש עם הכנסת תאריך נוכחי
  // ושעת היעד שהוזנה על ידי המשתמש

  const localScheduledTime = DateTime.fromObject(
    {
      year: nowInZone.year,
      month: nowInZone.month,
      day: nowInZone.day,
      hour,
      minute,
    },
    { zone: user.timezone }
  );

  const utcISO = localScheduledTime.toUTC().toISO();
  const isInRange = isTaskScheduledToday(utcISO);

  // המרה לשם של יום
  const localDayName = localScheduledTime.toFormat("cccc");

  const isCorrectDay =
    !user.preferredDay ||
    user.preferredDay.toLowerCase() === localDayName.toLowerCase();
  return   isInRange && isCorrectDay ;
}

////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////
// const user = {
//   time: "13:41",
//   // timezone: "Asia/Jerusalem",
//   timezone: "America/New_York",
//   // timezone: "Europe/Berlin",
//   // timezone: "Asia/Tokyo",
//   // ***במידה ויש Null מדובר בלקוח יומי
//   preferredDay: null, 
// };

// const result = shouldCreateTaskForUser(user);

//   console.log(`🌍 אזור זמן: ${user.timezone}`);
//   console.log(`🕒 שעת יעד: ${user.time}`);
//   console.log(`📅 יום מועדף: ${user.preferredDay || "כל יום"}`);
//   console.log(`📆 יום מקומי בפועל: ${result.scheduledDayLocal}`);
//   console.log(`⏱ שעה מתוזמנת בפועל: ${result.scheduledTimeLocal}`);
//   console.log(`📌 תאריך ושעה מקומיים בפועל: ${result.fullLocalTime}`);
//   console.log(`📌 תאריך ושעה מקומיים בפועל: ${DateTime.now().setZone(user.timezone)}`);
//   console.log(`🌐 זמן UTC: ${result.scheduledTimeUTC}`);

// if (result) {
//   console.log("✅ יש ליצור משימה");
// } else {
//   console.log("⏳ לא כעת");
// }

module.exports = {
  getUTCFromLocal,
  isTaskScheduledToday,
};
