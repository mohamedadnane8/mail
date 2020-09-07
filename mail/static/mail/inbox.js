document.addEventListener('DOMContentLoaded', function() {
  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  // Send an email!
  document.querySelector('#send-email').addEventListener('click',() => send_email());

  load_mailbox('inbox')
  // By default, load the inbox
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}


function load_mailbox(mailbox) {
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-open').style.display = 'none';

  // Show the mailbox name
   document.querySelector('#heading').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

   //Have to clean the inside first, otherwise the html will stay
   document.getElementById("emails-preview").innerHTML = '';

  fetch(`/emails/${mailbox}`)
    .then(response => response.json())
    .then(data => {
      data.forEach(element => {

        // Creating the data cell
        const inbox_item = document.createElement("tr");
        // Filling it
        inbox_item.innerHTML = `<td class="name"><a href="#">${element["sender"]}</a></td>` +
                  `            <td class="subject"><a href="#">${element["subject"]}</a></td>` +
                  `            <td class="time"><a href="#">${element["timestamp"]}</a></td>`;

        // coloring read emails
        if(element.read){
          inbox_item.style.backgroundColor = "gray";
        }
        inbox_item.querySelector("a").addEventListener('click', () => load_email(element.id));


        // appending it in the table in HTML
        document.querySelector("#emails-preview").appendChild(inbox_item) ;

      })



    });

}
function load_email(id){
  document.getElementById("emails-preview").style.display = 'none';
  document.getElementById("compose-view").style.display = 'none';
  document.querySelector('#email-open').style.display = 'block';

  div_info = document.createElement("div");
  div_info = document.createElement("div");
  div_body = document.createElement("div");
  div_info.className = "email-info";
  button = document.createElement("button");
  button.value = "reply";

  fetch(`/emails/${id}`)
    .then(response => response.json())
    .then(email => {
        // Print email


      div_info.innerHTML =  `<p><b>From:</b> ${email.sender}</p>`+
                            `<p><b>To:</b> ${email.recipients}</p>`+
                            `<p><b>Subject:</b> ${email.subject}</p>`+
                            `<p><b>Timestamp:</b> ${email.timestamp}</p>`+
                            `<hr>`;
      div_body.innerHTML = `<p>${email.body}</p>`;
      document.getElementById("email-open").innerHTML += div_info.innerHTML;
      document.getElementById("email-open").innerHTML += div_body.innerHTML;
      document.getElementById("email-open").innerHTML += button;


        // ... do something else with email ...
    });

    fetch(`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
        read: true
    })
  })
}
function send_email() {
  // Collect data
  let recipient = document.querySelector('#compose-recipients').value;
  let subject = document.querySelector('#compose-subject').value;
  let body = document.querySelector('#compose-body').value;

  // Sending the email!
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
      recipients: recipient,
      subject: subject,
      body: body
    })
  })
      .then(response => response.json())
      .then(result => {
        // Print result
        console.log(result);
      });
  load_mailbox('sent');

}