const {agenda} = require("./jobManager"); 
const mongoose = require("mongoose");

const  createAgendaIndexes = async () =>  {
  const agendaJobsCollection = mongoose.connection.collection("agendaJobs");

  try {
    await agendaJobsCollection.createIndex(
      { name: 1 },
      {
        unique: true,
        partialFilterExpression: { name: "build tasks" }
      }
    );

    // אינדקס ייחודי למניעת שליחת מייל כפול
    // await agendaJobsCollection.createIndex(
    //   {
    //     name: 1,
    //     "data.email": 1,
    //     "data.emailType": 1,
    //     // nextRunAt: 1
    //   },
    //   {
    //     unique: true,
    //     partialFilterExpression: { name: "send email" }
    //   }
    // );

    // אינדקס נוסף לפי entryJobId כדי למנוע כפילות לפי מזהה
    await agendaJobsCollection.createIndex(
      {
        name: 1,
        "data.entryJobId": 1
      },
      {
        unique: true,
        partialFilterExpression: { name: "send email" }
      }
    );

    console.log("✅ Agenda indexes created successfully.");
  } catch (err) {
    console.error("❌ Failed to create agenda indexes:", err);
  }
}



async function startAgenda() {
  try {
    await createAgendaIndexes();
    await agenda.start();
    console.log("✅ Agenda started");

    await agenda.create("build tasks", {})
      .unique({ name: "build tasks" }) 

      // .schedule("* * * * *", { timezone: "Asia/Jerusalem" })
      .repeatEvery("* * * * *", { timezone: "Asia/Jerusalem" })
      .save();




  } catch (error) {
    console.error("❌ Agenda failed to start:", error);
  }
}


module.exports = startAgenda;
