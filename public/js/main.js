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

  const add_response = await fetch( '/add', {
    method:'POST',
    headers: { 'Content-Type': 'application/json' },
    body 
  })

  playersRequest()

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
  form.onsubmit = submit
  wrapper = document.getElementsByClassName("wrapper")[0]
  playersRequest()
}

const deleteRequest = async function(event, body) {
  const response = await fetch(`/delete/${body.player_id}`, {
    method: "DELETE",
  })
  playersRequest()
}

const updateRequest = async function(event, body) {
  const response = await fetch('/update', {
    method: "PUT",
    headers: {"Content-Type" : "application/json"},
    body: JSON.stringify(body)
  })
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
      deleteRequest(event, {"player_id" : item._id})
    })
    panel.appendChild(delete_button)
    
    update_button = document.createElement("button")
    update_button.innerText = "Update Player"
    update_button.addEventListener("click", function(event) {
      const form = document.querySelector("form")
      Object.keys(item).forEach(key => {
        const field = form.elements[key];      
        if (field) {
          field.value = item[key]
        }
      })

      const submit_button = document.querySelector("#submit")
      submit_button.innerText = "Update"

      find_cancel_button = document.querySelector("#cancel")
      if (!find_cancel_button) {
          cancel_button = document.createElement("button")
          cancel_button.id = "cancel"
          cancel_button.innerText = "Cancel"
          cancel_button.addEventListener("click", function(event) {
            form.reset()
            cancel_button.remove()
            submit_button.innerText = "Submit"

          })
          form.appendChild(cancel_button)
      }

      form.onsubmit = function (event) {
        event.preventDefault()
        const form_data = new FormData(form)
        const form_JSON = Object.fromEntries(form_data.entries())
        form_JSON._id = item._id
        updateRequest(event, form_JSON)
        form.reset()
        cancel_button.remove()
        submit_button.innerText = "Submit"
        form.onsubmit = submit
      }

    })
    panel.appendChild(update_button)
    
  }
}
