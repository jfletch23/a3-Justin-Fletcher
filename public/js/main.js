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

const logout = async function(event) {
  const response = await fetch('/logout', {
    method: "GET"
  })
  console.log(response)
  if (response.status === 302) {
    console.log("Redirecting because user logged out")
    window.location.href = "/"
  }
}

const playersRequest = async function() {
  const response = await fetch("/players", {
    method: "GET"
  })
  if (response.status === 302) {
    window.location.href = "/"
  }
  else {
    const player_data = await response.json()
    display_data(player_data)
  }

}

window.onload = async function() {
  const form = document.querySelector("form")
  form.onsubmit = submit
  const logout_button = document.querySelector("#logout")
  logout_button.onclick = logout
  wrapper = document.getElementsByClassName("wrapper")[0]
  display_username = document.createElement("p")
  const username = await fetch('/username', {
    method: "GET"
  })
  //If response is status code 302 that means authentication middleware has triggered and user is not logged in so redirect to log in page
  if (username.status === 302) {
    window.location.href = "/"
  }
  const username_json = await username.json()
  console.log(username_json)
  display_username.innerText = username_json.username
  display_username.id = "username_text"
  const username_parent = document.querySelector("#user_parent")
  username_parent.insertBefore(display_username, username_parent.children[0])
  const dropdown_menu = document.querySelector(".dropdown-trigger")
  const instances = M.Dropdown.init(dropdown_menu, {
    coverTrigger: false,
    alignment: 'right'
  })
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
