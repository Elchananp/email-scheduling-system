// const mongoose = require("mongoose");

// const userSchema = new mongoose.Schema({
//   firstName: {
//     type: String,
//     required: true,
//   },
//   lastName: {
//     type: String,
//     required: true,
//   },
//   country: {
//     type: String,
//     required: true,
//   },
//   city: {
//     type: String,
//     required: true,
//   },
//   email: {
//     type: String,
//     required: true,
//     unique: true,
//   },
//   timezone: {
//     type: String,
//     required: true,
//   },
//   sendTimes: [
//     {
//       time: {
//         type: String, // "HH:mm"
//         required: true,
//       },
//       emailType: {
//         // אני רושם כאן את הסוג לפי מספר לדוגמא בין 1-5
//         type: Number,
//         required: true,
//       },
//     },
//   ],
//   isWeekly: {
//     type: Boolean,
//     required: true,
//   },
// });

// module.exports = mongoose.model("User", userSchema);


const mongoose = require("mongoose");

const validDays = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  timezone: {
    type: String,
    required: true,
  },
  sendTimes: [
    {
      time: {
        type: String, // "HH:mm"
        required: true,
      },
      emailType: {
        // אני רושם כאן את הסוג לפי מספר לדוגמא בין 1-5
        type: Number,
        required: true,
      },
    },
  ],
  preferredDay: {
    type: String,
    default: null,
    set: function (val) {
      if (!val) return null;
      const formatDay = val.charAt(0).toUpperCase() + val.slice(1).toLowerCase();
      if (!validDays.includes(formatDay)) {
        throw new Error("Invalid day provided. Must be one of: " + validDays.join(", "));
      }
      return formatDay;
    },
  },
});

module.exports = mongoose.model("User", userSchema);
