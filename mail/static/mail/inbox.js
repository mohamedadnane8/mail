document.addEventListener('DOMContentLoaded', function() {
  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // Send an email!
  document.querySelector('#send-email').addEventListener('click',() => send_email());

  // By default, load the inbox
  load_mailbox('inbox')
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
  let inner_html;
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
   document.querySelector('#heading').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

   //Have to clean the inside first, otherewise the html will stay
   document.getElementById("emails-preview").innerHTML = '';

  fetch(`/emails/${mailbox}`)
    .then(response => response.json())
    .then(data => {
      data.forEach(element => {

        // Creating the data cell
        let inbox_item = document.createElement("tr");

        // Filling it
        inner_html =`<td class="name"><a href="{% url 'email' email_id=${element["id"]} %}">${element["sender"]}</a></td>` +
        `            <td class="subject"><a href="{% url 'email' email_id=${element["id"]} %}">${element["subject"]}</a></td>` +
        `            <td class="time">${element["timestamp"]}</td>`;

        inbox_item.innerHTML = inner_html;

        // coloring read emails
        if(element.read){
          inbox_item.style.backgroundColor = 'gray';
        }

        // appending it in the table in HTML
        document.getElementById("emails-preview").innerHTML += inbox_item.innerHTML;
      })
    });
  console.log(document.getElementById("emails-preview").innerHTML);

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