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
  document.querySelector('#emails-list').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

  document.querySelector('#compose-form').addEventListener('submit', enviarcorreo);
  
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
            icono.innerHTML = `<i class="material-icons" style="font-size:24px; color: indianred" title="archive" data-archived=${contents.archived} data-id=${contents.id}>folder</i>`;
           }

        if (route == '/emails/sent')
           {
            var icono = document.createElement('div');
            icono.className = 'col-1';
            icono.innerHTML = `<i class="material-icons" style="font-size:24px; color: green" title="view" data-id=${contents.id}>visibility</i>`;
           }

        if (route == '/emails/archive')
           {
            var icono = document.createElement('div');
            icono.className = 'col-1';
            icono.innerHTML = `<i class="material-icons" style="font-size:24px; color: LimeGreen" title="unarchive" data-archived=${contents.archived} data-id=${contents.id}>markunread_mailbox</i>`;
           }

        fila.appendChild(remitente);
        fila.appendChild(asunto);
        fila.appendChild(fecha);
        fila.appendChild(icono);

        document.querySelector('#contenedor').appendChild(fila);
    
        // set color if email was read
        if (contents.read) {fila.style = 'background: #F0F0F0'} 

        clickonicon = 0;

        // add a listener in ever icon
        document.querySelectorAll('i').forEach(function(i) {
               i.onclick = function() 
                                  {
                                   archivar(route, i.dataset.archived, i.dataset.id);
                                   clickonicon = 1;
                                  }});

        fila.addEventListener('click', filaesc );

          // para el siguiente evento hay que agregar una función ver correo
          function filaesc() 
                 {
                  if (clickonicon == 1)
                     // {alert("nothing to do here");
                     { clickonicon = 0; }
                  else
                     { vercorreo(fila.id); }
                 }

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
                        .then(result => {
                           load_mailbox('inbox')})

                 }
              else {fetch('/emails/'+id, {
                          method: 'PUT',
                          body: JSON.stringify({
                          archived: true })})
                          .then(result => {
                           load_mailbox('inbox')})
              
                   }

             // load_mailbox('inbox');
            }

       }


function vercorreo(id)

       {
         // Show compose view and hide other views
         document.querySelector('#email-view').style.display = 'block';
         document.querySelector('#emails-list').style.display = 'none';
         document.querySelector('#compose-view').style.display = 'none';

         fetch('/emails/'+id)
         .then(response => response.json())
         .then(email => {
               // Print email
               console.log(email);
               document.querySelector('#view-from').innerHTML = email.sender;
               document.querySelector('#view-subject').innerHTML = email.subject;
               document.querySelector('#view-date').innerHTML = email.timestamp;
               document.querySelector('#view-action').innerHTML =
                 `<i class="material-icons" style="font-size:32px; color: Coral" title="reply" data-id=${id}>forward</i>`;
               document.querySelector('#view-body').innerHTML = email.body;
               });

               // hacer un catch error por si no encuentra el correo
               // marcar el correo como leído
               // si la bandeja es de enviados, ver qué hacer con la opción reply
               // corregir cuando estoy viendo un correo en Send, debe decir To en lugar de From
         
       }


function enviarcorreo() 

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
                          event.preventDefault()
  
                          return false
       }