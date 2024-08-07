const { DataFactory } = require("../factories/datafactory.js")
const { InfluxDBHandler} = require("../handlers/h_influx.js")
const { CassandraDBHandler } = require("../handlers/h_cassandra.js")
const { DBHandler } = require("../handlers/h_dbhandler.js")
const { getHandler } = require("./controller_utils.js")
const { generateandInsertOneDay } = require("./utils/insertionUtils.js")

const initializeDB = ( async (req, res) => {
  let dbHandler = getHandler(req.body.db)
  await dbHandler.initialize()
  res.json({text: "OK"})

})

const insertOneDay = ( async (req, res) => {

  const date = new Date(
    req.body.year,
    req.body.month,
    req.body.day,
    req.body.hour,
    0
  )
  let dbHandler = getHandler(req.body.db)

  // DATA GENERATION
  let daycount = await generateandInsertOneDay(date, dbHandler)

  res.json({text: daycount})
})

const insertOneMonth = ( async (req, res) => {

  const days = new Date(req.body.year, req.body.month, 0).getDate()
  let dbHandler = getHandler(req.body.db)
  let counter = 0

  for (let i = 0; i < days; i++) {
    let date = new Date(
      req.body.year,
      req.body.month,
      i, 0, 0
    )
    let dayCount = await generateandInsertOneDay(date, dbHandler)
    console.log("DAY ", date, " INSERTED")
    counter += dayCount
  }
  res.json({counter: counter})
})

const insertLogs = ( async (req, res) => {

  const date = new Date(
    req.body.year,
    req.body.month,
    req.body.day,
    req.body.hour,
    0
  )
  let dbHandler = getHandler(req.body.db)

  // DATA GENERATION
  const dataFactory = new DataFactory()
  dataFactory.generateOneHour(date)

  // DB INSERTION 
  await dbHandler.insertMultipleItems("LOGS", dataFactory.logSet)
  await dbHandler.insertMultipleItems("REQUESTS", dataFactory.requestSet)
   
  console.log("LOGSET LENGTH: ", dataFactory.logSet.length)
  res.json({text: dataFactory.logSet})
})
  
module.exports = {
  insertLogs,
  initializeDB,
  insertOneDay,
  insertOneMonth
}
  