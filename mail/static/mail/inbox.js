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
  document.querySelector('#emails-preview').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#email-open').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}


function load_mailbox(mailbox) {
  // Show the mailbox and hide other views
  document.querySelector('#emails-preview').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-open').style.display = 'none';

  // Show the mailbox name
   document.querySelector('#heading').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

   //Have to clean the inside first, otherwise the html will stay
   document.querySelector("#emails-preview").innerHTML = '';

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
          inbox_item.style.backgroundColor = "#D3D3D3";
        }
        inbox_item.querySelector("a").addEventListener('click', () => load_email(element.id));


        // appending it in the table in HTML
        document.querySelector("#emails-preview").appendChild(inbox_item) ;

      })



    });

}
function load_email(id){
  // Show only the email
  document.querySelector("#emails-preview").style.display = 'none';
  document.querySelector("#compose-view").style.display = 'none';
  document.querySelector('#email-open').style.display = 'block';

  // elements needed for the html code
  const div_info = document.createElement("div");
  const div_body = document.createElement("div");
  const div_buttons = document.createElement("div");
  div_info.className = "email-info";

  // emptying the email page first
  document.querySelector("#email-open").innerHTML = '';

  fetch(`/emails/${id}`)
    .then(response => response.json())
    .then(email => {

      // .....Creating the html needed

      // Archive and reply button
      const archive = document.createElement("button");
      archive.innerText = email.archived ? "Unarchive" : "Archive";
      archive.className = "btn btn-sm btn-outline-primary archive";
      const reply = document.createElement("button");
      reply.innerText = "Reply";
      reply.className = "btn btn-sm btn-outline-success reply";

      // event listener for the buttons
      archive.addEventListener('click',() => archive_email(email.id,email.archived));
      reply.addEventListener('click',() => reply_email(email.id));

      // body and details html
      div_info.innerHTML =  `<p><b>From:</b> ${email.sender}</p>`+
                            `<p><b>To:</b> ${email.recipients}</p>`+
                            `<p><b>Subject:</b> ${email.subject}</p>`+
                            `<p><b>Timestamp:</b> ${email.timestamp}</p>`;
      div_body.innerHTML = `<hr><p>${email.body}</p>`;

      // adding it the content
      div_buttons.appendChild(archive);
      div_buttons.appendChild(reply);
      document.querySelector("#email-open").appendChild(div_info);
      document.querySelector("#email-open").appendChild(div_buttons);
      document.querySelector("#email-open").appendChild(div_body);

    });

    fetch(`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
        read: true
    })
  });
}
function archive_email(id,archive_status){

    fetch(`/emails/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        archived: ! (archive_status)
      })
    });
    load_mailbox('inbox');
}
function reply_email(id){
    compose_email();
    fetch(`/emails/${id}`)
    .then(response => response.json())
    .then(email => {
        document.querySelector('#compose-recipients').value = email.sender;
        document.querySelector('#compose-subject').value = "Re: "+ email.subject;
        document.querySelector('#compose-body').value = 'On '+email.timestamp +email.sender+" wrote:\n"+email.body;

    });
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