// FRONT-END (CLIENT) JAVASCRIPT HERE
let wrapper;

const submit = async function( event ) {
  // stop form submission from trying to load
  // a new .html page for displaying results...
  // this was the original browser behavior and still
  // remains to this day
  event.preventDefault()

  const form = document.querySelector("form")
  const form_data = new FormData(form)
  const form_JSON = Object.fromEntries(form_data.entries())
  
  const body = JSON.stringify(form_JSON)

  const response = await fetch( '/submit', {
    method:'POST',
    body 
  })

  const data_array = await response.json()
  display_data(data_array)

  form.reset()
}

const playersRequest = async function() {
  const response = await fetch("/players", {
    method: "GET"
  })
  const player_data = await response.json()
  display_data(player_data)
}

window.onload = async function() {
  const form = document.querySelector("form")
  //Doing add event listener so required attribute functions and my form cannot be submitted with null or undefined values
  form.addEventListener('submit', submit)
  wrapper = document.getElementsByClassName("wrapper")[0]
  playersRequest()
}

const deleteRequest = async function( event, body ) {
  stringy = JSON.stringify(body)
  const response = await fetch('/delete', {
    method: "POST",
    body: stringy
  })
  const data_array = await response.json()
  playersRequest()
}

const display_data = function(data) {
  wrapper.innerHTML = ""
  for (let item of data) {
    panel = document.createElement("div")
    panel.classList.add("panel")
    wrapper.appendChild(panel)
    header = document.createElement("h3")
    header.innerText = item.player_name
    panel.appendChild(header)
    ul = document.createElement("ul")
    panel.appendChild(ul)
    li_age = document.createElement("li")
    li_age.innerText = "Age: " + item.player_age
    ul.appendChild(li_age)
    li_position = document.createElement("li")
    li_position.innerText = item.player_position
    ul.appendChild(li_position)
    li_bats = document.createElement("li")
    li_bats.innerText = "Bats: " + item.batting
    ul.appendChild(li_bats)
    li_throws = document.createElement("li")
    li_throws.innerText = "Throws: " + item.throwing
    ul.appendChild(li_throws)
    li_overall = document.createElement("li")
    li_overall.innerText = "Overall: " + item.overall
    ul.appendChild(li_overall)
    delete_button = document.createElement("button")
    delete_button.innerText = "Delete Player"
    delete_button.addEventListener('click', function(event) {
      deleteRequest(event, {"player_name" : item.player_name})
    })
    panel.appendChild(delete_button) 
  }
}
