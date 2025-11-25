const { DateTime } = require("luxon");

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

const isTaskScheduledToday = (utcISOString) => {
  const taskTimeUTC = DateTime.fromISO(utcISOString, { zone: "utc" });
  const nowUTC = DateTime.utc();

  const midnightUTC = nowUTC.endOf("day");

  return taskTimeUTC >= nowUTC && taskTimeUTC < midnightUTC;
}

const shouldCreateTaskForUser = (user) => {
  const nowInZone = DateTime.now().setZone(user.timezone);
  const [hour, minute] = user.time.split(":").map(Number);

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

  const localDayName = localScheduledTime.toFormat("cccc");

  const isCorrectDay =
    !user.preferredDay ||
    user.preferredDay.toLowerCase() === localDayName.toLowerCase();
  return   isInRange && isCorrectDay ;
}

module.exports = {
  getUTCFromLocal,
  isTaskScheduledToday,
};
