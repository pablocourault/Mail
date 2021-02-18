document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

  document.querySelector('#compose-form').addEventListener('submit', enviarcorreo);
  

}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  var route = '/emails/'+mailbox;
  
  fetch(route)
 .then(response => response.json())
 .then(emails => {
    // Print emails
    console.log(emails);

    headers(route);
    emails.forEach(add_correo);
  
    });

    function headers(route)
             {

              const contenedor = document.createElement('div');
              contenedor.className = 'container';
              contenedor.id = 'contenedor';
              document.querySelector('#emails-view').append(contenedor);

              var encabezado = document.createElement('div');
              encabezado.className = 'row';

              var remitente = document.createElement('div');
              remitente.className = 'col';

              if (route == '/emails/inbox' || route == '/emails/archive')
                 {remitente.innerHTML = 'From';}
              else 
                 {remitente.innerHTML = 'To';}


              var asunto = document.createElement('div');
              asunto.className = 'col';
              asunto.innerHTML = 'Subject';
              var fecha = document.createElement('div');
              fecha.className = 'col';
              fecha.innerHTML = 'Date';

              encabezado.appendChild(remitente);
              encabezado.appendChild(asunto);
              encabezado.appendChild(fecha);

              contenedor.appendChild(encabezado);
             }
   
    function add_correo(contents) {

    var fila = document.createElement('div');
    fila.className = 'row filacorreo';
    // fila.id = ''; // corregir, no pueden tener el mismo id todas las filas de correos o agregar id del correo
    
    var remitente = document.createElement('div');
    remitente.className = 'col';
    remitente.innerHTML = contents.recipients;
    var asunto = document.createElement('div');
    asunto.className = 'col';
    asunto.innerHTML = contents.subject;
    var fecha = document.createElement('div');
    fecha.className = 'col';
    fecha.innerHTML = contents.timestamp;

    fila.appendChild(remitente);
    fila.appendChild(asunto);
    fila.appendChild(fecha);
    document.querySelector('#contenedor').appendChild(fila);
    fila.addEventListener('click', function() {
    console.log('This element has been clicked!')})
    };

    }

    


// My JavaScript to complet Project 3
// My JavaScript to complet Project 3

function enviarcorreo() {
  
  para = document.querySelector('#compose-recipients').value;
  asunto = document.querySelector('#compose-subject').value;
  contenido = document.querySelector('#compose-body').value;

  fetch('/emails', {
    method: 'POST',
    // credentials: 'same-origin',
    /* headers: {'Content-Type': 'application/json',
              'Accept': "application/json; charset=UTF-8",
              'X-Requested-With': 'XMLHttpRequest'}, */
    // mode: 'cors',
    body: JSON.stringify({recipients: para,
                          subject: asunto,
                          body: contenido})        
  })
  .then(response => {console.log(response.status);
                     // save status to variable "estado", to use in the next "then"
                     estado = response.status;
                     if (response.status == 201)
                         {
                          load_mailbox('sent')
                         }
                     return response.json()})
  .then(result => { if (estado !== 201)
                       {
                        document.querySelector('#compose-body').style.display = 'none';
                        document.querySelector('input[type="submit"]').style.display = 'none';
                        const diverror = document.createElement("div");
                        diverror.setAttribute('id', 'diverror');
                        diverror.setAttribute('class',`alert-danger alert-dismissible fade show role="alert"`);
                        diverror.innerHTML = `${result.error}<button type="button" id="botonerror" class="close" data-dismiss="alert" aria-label="close"><span id="cruz" aria-hidden="true">&times;</span></button>`;
                        document.querySelector('#compose-form').append(diverror);
                        const botonerror = document.querySelector('#botonerror');
                          botonerror.addEventListener('click', function()
                          {
                          document.querySelector('#compose-body').style.display = 'block';
                          document.querySelector('input[type="submit"]').style.display = 'block';
                          diverror.remove();
                          
                          });
                        }

                    console.log(result) });

                    // si no pongo preventDefault me parece el mensaje de network unreachable
                    event.preventDefault()
  
                    return false

}