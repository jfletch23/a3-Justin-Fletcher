const http = require( 'http' ),
      fs   = require( 'fs' ),
      // IMPORTANT: you must run `npm install` in the directory for this assignment
      // to install the mime library if you're testing this on your local machine.
      // On Render, make sure `npm install` is your build command.
      mime = require( 'mime' ),
      dir  = 'public/',
      port = 3000

const players = [
  { 'player_name': 'Jesus Made', 'player_birthday': "2007-05-08", 'player_age': 19, "player_position" : "Shortstop", "batting" : "S", "throwing": "R", "hit_tool" : 60, "power_tool" : 60, "run_tool" : 60, "arm_tool" : 60, "field_tool" : 55, "overall" : 59},
  { 'player_name': 'Leo De Vries', 'player_birthday': "2006-10-11", 'player_age': 19, "player_position" : "Third Base", "batting" : "S", "throwing" : "R", "hit_tool" : 60, "power_tool" : 55, "run_tool" : 55, "arm_tool" : 55, "field_tool" : 50, "overall" : 55 },
  { 'player_name': 'Franklin Arias', 'player_birthday': "2005-11-19", 'player_age': 20, "player_position" : "Shortstop", "batting" : "R", "throwing" : "R", "hit_tool" : 60, "power_tool" : 55, "run_tool" : 45, "arm_tool" : 55, "field_tool" : 60, "overall" : 55 } 
]

const server = http.createServer( function( request,response ) {
  if( request.method === 'GET' ) {
    handleGet( request, response )    
  }else if( request.method === 'POST' ){
    handlePost( request, response ) 
  }
})

const handleGet = function( request, response ) {
  const filename = dir + request.url.slice( 1 ) 

  if( request.url === '/' ) {
    sendFile( response, 'public/index.html' )
  } else if (request.url === '/players') {
    response.writeHead(200, {"Content-Type" : "application/json"})
    response.end(JSON.stringify(players))
  }
  else{
    sendFile( response, filename )
  }
}

const handlePost = function( request, response ) {
  let dataString = ''

  request.on( 'data', function( data ) {
      dataString += data 
  })

  request.on( 'end', function() {
    if (request.url === "/submit") {
      received_data = JSON.parse(dataString)
      age = getAge(received_data.player_birthday.split("T")[0])
      received_data.player_age = age
      overall = (Number(received_data.hit_tool) + Number(received_data.power_tool) + Number(received_data.run_tool) + +Number(received_data.arm_tool) + Number(received_data.field_tool)) / 5.0
      received_data.overall = Math.round(overall)
      players.push(received_data)

      response.writeHead( 200, "OK", {'Content-Type': 'application/json' })
      response.end(JSON.stringify(players))
    } else if (request.url === "/delete") {
      received_data = JSON.parse(dataString)
      const player_index = players.findIndex(item => item.player_name === received_data.player_name)
      if (player_index !== -1) {
        players.splice(player_index, 1)
      }
      response.writeHead(200, "OK", {'Content-Type' : 'application/json'})
      response.end(JSON.stringify(players))
    }

  })
}

const sendFile = function( response, filename ) {
   const type = mime.getType( filename ) 

   fs.readFile( filename, function( err, content ) {

     // if the error = null, then we've loaded the file successfully
     if( err === null ) {

       // status code: https://httpstatuses.com
       response.writeHeader( 200, { 'Content-Type': type })
       response.end( content )

     }else{

       // file not found, error code 404
       response.writeHeader( 404 )
       response.end( '404 Error: File Not Found' )

     }
   })
}

server.listen( process.env.PORT || port )

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

