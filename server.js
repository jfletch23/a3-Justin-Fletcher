const express = require('express')
const app = express()

app.use(express.static('public'))
app.use(express.json())

const players = [
  { 'player_name': 'Jesus Made', 'player_birthday': "2007-05-08", 'player_age': 19, "player_position" : "Shortstop", "batting" : "S", "throwing": "R", "hit_tool" : 60, "power_tool" : 60, "run_tool" : 60, "arm_tool" : 60, "field_tool" : 55, "overall" : 59},
  { 'player_name': 'Leo De Vries', 'player_birthday': "2006-10-11", 'player_age': 19, "player_position" : "Third Base", "batting" : "S", "throwing" : "R", "hit_tool" : 60, "power_tool" : 55, "run_tool" : 55, "arm_tool" : 55, "field_tool" : 50, "overall" : 55 },
  { 'player_name': 'Franklin Arias', 'player_birthday': "2005-11-19", 'player_age': 20, "player_position" : "Shortstop", "batting" : "R", "throwing" : "R", "hit_tool" : 60, "power_tool" : 55, "run_tool" : 45, "arm_tool" : 55, "field_tool" : 60, "overall" : 55 } 
]

const submit_middleware = ( req, res, next ) => {
  const received_data = req.body
  age = getAge(received_data.player_birthday.split("T")[0])
  received_data.player_age = age
  overall = (Number(received_data.hit_tool) + Number(received_data.power_tool) + Number(received_data.run_tool) + +Number(received_data.arm_tool) + Number(received_data.field_tool)) / 5.0
  received_data.overall = Math.round(overall)
  players.push(received_data)
  next()
}

const delete_middleware = ( req, res, next ) => {
  const player_index = players.findIndex(item => item.player_name === req.body.player_name)
  if (player_index !== -1) {
    players.splice(player_index, 1)
  }
  next()
}

const response_middleware = (req, res) => {
    res.writeHead(200, {"Content-Type" : "application/json"})
    res.end(JSON.stringify(players))
}

app.post('/submit', submit_middleware )
app.post('/submit', response_middleware)

app.post('/delete', delete_middleware)
app.post('/delete', response_middleware)

app.get('/players', response_middleware)

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

