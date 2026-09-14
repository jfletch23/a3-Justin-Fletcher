require("dotenv").config()

const express = require('express')
const app = express()

const {MongoClient, ObjectId} = require("mongodb")

let players_collection
let users_collection

app.use(express.static('public'))
app.use(express.json())

const check_connection_middleware = (req, res, next) => {
  if (players_collection !== undefined && users_collection !== undefined) {
    next()
  }
  else {
    res.status(503).send()
  }
}

app.use(check_connection_middleware)

const uri = `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_HOST}`

const client = new MongoClient(uri)

async function run() {
  await client.connect()
  players_collection = await client.db("BaseballProspectsDatabase").collection("Players")
  users_collection = await client.db("BaseballProspectsDatabase").collection("Users")
}

run()

const add_middleware = async (req, res) => {
  const received_data = req.body
  age = getAge(received_data.player_birthday.split("T")[0])
  received_data.player_age = age
  overall = (Number(received_data.hit_tool) + Number(received_data.power_tool) + Number(received_data.run_tool) + +Number(received_data.arm_tool) + Number(received_data.field_tool)) / 5.0
  received_data.overall = Math.round(overall)
  const result = await players_collection.insertOne(received_data)
  if (result.acknowledged !== true) {
    res.status(504).send()
  }
  else {
    res.writeHead(200, {"Content-Type" : "application/json"})
    res.end(JSON.stringify(result))
  }
}

const delete_middleware = async (req, res) => {
  const result = await players_collection.deleteOne({
    _id: new ObjectId(req.params.objectId)
  })
  if (result.acknowledged !== true) {
    res.status(504).send()
  }
  else if (result.deletedCount !== 1) {
    res.status(505).send()
  }
  else {
    res.writeHead(200, {"Content-Type" : "application/json"})
    res.end(JSON.stringify(result))
  }  
}

const players_middleware = async (req, res) => {
  const players = await players_collection.find({}).toArray()
  res.writeHead(200, {"Content-Type" : "application/json"})
  res.end(JSON.stringify(players))
}

const update_middleware = async (req, res) => {
  const received_data = req.body
  const filter = {_id : new ObjectId(received_data._id)}
  const {_id, ...data_without_id} = received_data
  const updateData = {
    $set: data_without_id
  }
  const result = await players_collection.updateOne(filter, updateData)
  if (result.acknowledged !== true) {
    res.status(504).send()
  } 
  else if (result.modifiedCount !== 1) {
    res.status(505).send()
  }
  else {
    res.writeHead(200, {"Content-Type" : "application/json"})
    res.end(JSON.stringify(result))
  }
}

app.get('/players', players_middleware)

app.post('/add', add_middleware)
app.delete('/delete/:objectId', delete_middleware)

app.put('/update', update_middleware)

const listener = app.listen( process.env.PORT || 3000 )

// Source - https://stackoverflow.com/a/7091965
// Posted by codeandcloud, modified by community. See post 'Timeline' for change history
// Retrieved 2026-09-04, License - CC BY-SA 3.0

function getAge(dateString) {
    var today = new Date();
    var birthDate = new Date(dateString);
    var age = today.getFullYear() - birthDate.getFullYear();
    var m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}

