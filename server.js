require("dotenv").config()

const express = require('express')
const cookie = require('cookie-session')
const app = express()

const {MongoClient, ObjectId} = require("mongodb")

let players_collection
let users_collection

app.use(express.static('public'))
app.use(express.json())
app.use(express.urlencoded({extended: true}))

const check_connection_middleware = (req, res, next) => {
  if (players_collection !== undefined && users_collection !== undefined) {
    next()
  }
  else {
    res.status(503).send()
  }
}

app.use(check_connection_middleware)

app.use(cookie({
  name: 'session',
  keys: [process.env.COOKIE_KEY_ONE, process.env.COOKIE_KEY_TWO]
}))

const default_value_cookie_middleware = (req, res, next) => {
  if (req.session.login === undefined) {
    req.session.login = false
  }
  next()
}

app.use(default_value_cookie_middleware)

const authentication_middleware = (req, res, next) => {
  if (req.session.login === true) {
    next()
  }
  else {
    //Redirecting on the server did not work so just going to redirect on the client and I'm letting the client know to redirect to index.html by sending a 302 status code
    res.status(302).send()
  }
}

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
  received_data.uuid = req.session.uuid
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
  const players = await players_collection.find({"uuid" : req.session.uuid}).toArray()
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

const get_username_middleware = async (req, res) => {
  const user = await users_collection.findOne({"_id" : new ObjectId(req.session.uuid)})
  res.writeHead(200, {"Content-Type" : "application/json"})
  res.end(JSON.stringify(user))
}

const create_user_middleware = async (req, res) => {
  const received_data = req.body
  const result = await users_collection.insertOne(received_data)
  if (result.acknowledged !== true) {
    res.status(504).send()
  }
  else {
    req.session.login = true
    req.session.uuid = result.insertedId
    res.redirect("/main.html")
  }  
}

const login_middleware = async (req, res) => {
  const received_data = req.body
  username = received_data.username
  password = received_data.password
  const users = await users_collection.find({}).toArray()
  let foundUser = false
  for (const user of users) {
    if (user.username === username) {
      //Need to use foundUser boolean since I have multiple users I am iterating through, can't just make it an else block since it would trigger incorrectly
      foundUser = true
      if (user.password === password) {
        //Access granted
        req.session.login = true
        req.session.uuid = user._id
        return res.redirect("/main.html")
      }
      else {
        //Incorect password, but account exists
        return res.redirect("/incorrect.html")
      }
      break
    }
  }
  if (!foundUser) {
    //Account does not exist
    return res.redirect("/noaccount.html")
  }
}

const logout_middleware = async (req, res) => {
  if (req.session.login === true) {
    req.session.login = false
    //Send 302 status to let client know to redirect user
    res.status(302).send()
  }
}

app.post('/createuser', create_user_middleware)
app.post('/login', login_middleware)

//I think it is important to have my authentication middleware after the log in related POST requests so it is possible to login
app.use(authentication_middleware)

app.get('/players', players_middleware)
app.get('/username', get_username_middleware)
app.get('/logout', logout_middleware)

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