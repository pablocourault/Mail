document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');

  document.querySelector('#compose-form').addEventListener('submit', enviarcorreo);

});


function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-list').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

}


function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-list').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-list').innerHTML = `<h3 id="mailbox-name">${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3><hr>`;

  route = '/emails/'+mailbox;
  
  fetch(route)
 .then(response => response.json())
 .then(emails => {
    // Print emails
    console.log(emails);

    headers(route);

    emails.forEach(add_correo);})
    
    }


function headers(route) //construye el encabezado sobre la lista de correos

       {

        const contenedor = document.createElement('div');
        contenedor.className = 'container';
        contenedor.id = 'contenedor';
        document.querySelector('#emails-list').append(contenedor);

        var encabezado = document.createElement('div');
        encabezado.className = 'row encabezado';
        // encabezado.id = 'encabezado';

        // arma las cuatro columnas de cada correo (una fila por correo)

        var remitente = document.createElement('div');
        remitente.className = 'col-3';
        // arma un campo del emcabezado dependiento de la ruta seleccionada
        if (route == '/emails/inbox' || route == '/emails/archive')
           {remitente.innerHTML = 'From';}
        else 
           {remitente.innerHTML = 'To';}

        var asunto = document.createElement('div');
        asunto.className = 'col-5';
        asunto.innerHTML = 'Subject';

        var fecha = document.createElement('div');
        fecha.className = 'col-3';
        fecha.innerHTML = 'Date';

        var iconos = document.createElement('div');
        iconos.className = 'col-1';
        iconos.innerHTML = 'Action';

        encabezado.appendChild(remitente);
        encabezado.appendChild(asunto);
        encabezado.appendChild(fecha);
        encabezado.appendChild(iconos);

        contenedor.appendChild(encabezado);

       }

   
function add_correo(contents) 

       {

        var fila = document.createElement('div');
        fila.className = 'row filacorreo';
        fila.id = contents.id;
    
        var remitente = document.createElement('div');
        remitente.className = 'col-3';

        // arma el contenido dependiento de la ruta seleccionada
        if (route == '/emails/inbox' || route == '/emails/archive')
           {remitente.innerHTML = contents.sender;}
        else 
           {remitente.innerHTML = contents.recipients;}
 
        var asunto = document.createElement('div');
        asunto.className = 'col-5';
        asunto.innerHTML = contents.subject;

        var fecha = document.createElement('div');
        fecha.className = 'col-3';
        fecha.innerHTML = contents.timestamp;
  
        // data-id will be used when archive, unarchive or open the mail 
        if (route == '/emails/inbox')
           {
            var icono = document.createElement('div');
            icono.className = 'col-1';
            icono.innerHTML = `<i class="material-icons" style="font-size:24px; color: indianred" title="archive" data-action=${'archive'} data-archived=${contents.archived} data-id=${contents.id}>folder</i>`;
           }

        if (route == '/emails/sent')
           {
            var icono = document.createElement('div');
            icono.className = 'col-1';
            icono.innerHTML = `<i class="material-icons" style="font-size:24px; color: green" title="view"  data-action=${'view'} data-id=${contents.id}>visibility</i>`;
           }

        if (route == '/emails/archive')
           {
            var icono = document.createElement('div');
            icono.className = 'col-1';
            icono.innerHTML = `<i class="material-icons" style="font-size:24px; color: LimeGreen" title="unarchive"  data-action=${'unarchive'} data-archived=${contents.archived} data-id=${contents.id}>markunread_mailbox</i>`;
           }

        fila.appendChild(remitente);
        fila.appendChild(asunto);
        fila.appendChild(fecha);
        fila.appendChild(icono);

        document.querySelector('#contenedor').appendChild(fila);
    
        // set color if email was read
        if (contents.read) {fila.style = 'background: #E3E3E3'} 

        // add a listener in ever icon
        document.querySelectorAll('i').forEach(function(i) {
               i.onclick = function() 
                                  {
                                    icono = true;
                                   if (i.dataset.dataaction !== 'view')
                                      {
                                       archivar(route, i.dataset.archived, i.dataset.id);
                                      }
                                    else {vercorreo(i.dataset.id)
                                       }
                                  }});
                                  
         // add a listener in ever icon
        document.querySelectorAll('.filacorreo').forEach(function(f) {
         f.onclick = function() 
                            {
                            if (icono !== true) {
                            vercorreo(f.id)}
                            }});  
                                  
                                                                                                          
       }

function archivar(route, archived, id) // archive or unarchive mail

       {
         if (route == '/emails/sent')
            { vercorreo(id) }
         else
            { if (archived === 'true')
                 {fetch('/emails/'+id, {
                        method: 'PUT',
                        body: JSON.stringify({
                        archived: false})})
                        .then(() => {
                           load_mailbox('inbox')})

                 }
              else {fetch('/emails/'+id, {
                          method: 'PUT',
                          body: JSON.stringify({
                          archived: true })})
                          .then( () => {
                           load_mailbox('inbox')})
              
                   }

            }

       }


var destinatario;
var motivo;
var fecha;
var cuerpo;

function vercorreo(id) // obtener un correo en particular

       {
        
        // Show email view and hide other views
        document.querySelector('#email-view').style.display = 'block';
        document.querySelector('#emails-list').style.display = 'none';
        document.querySelector('#compose-view').style.display = 'none';

        // obtener el mail al que corresponde el id y cargar en el html
        fetch('/emails/'+id)
        .then(response => response.json())
        .then(email => {

               // global variables used to reply_mail()

               // configure recipient according to origin 

               if (user_email == email.sender)
                  {destinatario = email.recipients} 
               else {destinatario = email.sender} 

               if (user_email == email.sender)
                  {action = 'forward'} 
               else {action = 'reply'} 

               motivo = email.subject;
               fecha = email.timestamp;
               cuerpo = email.body;

               document.querySelector('#view-from').innerHTML = email.sender;
               document.querySelector('#view-subject').innerHTML = email.subject;
               document.querySelector('#view-date').innerHTML = email.timestamp;
               user_email = JSON.parse(document.getElementById('user_email').textContent);

               //let output = myTag`That ${ person } is a ${ age }.`;

               document.querySelector('#view-action').innerHTML =
                 `<i class="material-icons" style="font-size:32px; color: Coral" title=${action} id="responder" onclick="reply_email()">forward</i>`;
               document.querySelector('#view-body').innerHTML = email.body;

               })

         // mark as readed
         .then(fetch('/emails/'+id, {method: 'PUT',
                                     body: JSON.stringify({read: true})}))
      
       }

function reply_email()
       {

         compose_email();

            if ( motivo.startsWith("Re:"))
               {
               asunto = motivo;
               }
            else
               {
               asunto = 'Re:' + motivo;  
               
            }
            // los campos globales son destinatario, motivo, fecha, cuerpo
            document.querySelector('#compose-recipients').value = destinatario;
            document.querySelector('#compose-subject').value = asunto;
            document.querySelector('#compose-body').value = "On " + fecha + " " + destinatario + " wrote:\n" + cuerpo;

         // return false
      
         }
   

function enviarcorreo() // send mail

       {

        para = document.querySelector('#compose-recipients').value;
        asunto = document.querySelector('#compose-subject').value;
        contenido = document.querySelector('#compose-body').value;

        fetch('/emails', {
        method: 'POST',
        body: JSON.stringify({recipients: para,
                              subject: asunto,
                              body: contenido}) })
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
                              diverror.remove();});
                             }

                          console.log(result) });

                          // si no pongo preventDefault me parece el mensaje de network unreachable
                          event.preventDefault();
                           
                          return false
       }