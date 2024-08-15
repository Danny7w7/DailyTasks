const ruta = window.location.pathname.split('/');

formTasks = document.getElementById('formTasks')

var dateInputs = document.querySelectorAll('input[type="date"]');
document.addEventListener('DOMContentLoaded', function() {

    dateInputs.forEach(dateInput => {
        dateInput.addEventListener('change', function() {
            if (this.value && esDateValida(this.value)) {
                if (dateInput.id == 'inputDateDaily'){
                    dateInputs[1].value = dateInput.value
                }else if (dateInput.id == 'inputDateWeekly'){
                    dateInputs[3].value = dateInput.value
                }
                var formData = new FormData();
                formData.append('date', dateInput.value)
                formData.append('period', dateInput.name)
                formData.append('username', ruta[ruta.length - 2])
                fetch('/filter_task/', {
                    method: 'POST',
                    body: formData
                })
                .then(response => response.json())
                .then(data => {
                    updateTable(data)
                })
                .catch((error) => {
                    console.error('Error:', error);
                });
            } else {
                console.log('Fecha inválida')
            }
        });
    });


    function esDateValida(dateString) {
        const date = new Date(dateString);
        return !isNaN(date.getTime());
    }
    function updateTable(data){
        // Obtiene la tabla por su ID
        if (data.period == 'daily'){
            table = document.getElementById('table_body_daily');
        }else{
            table = document.getElementById('table_body_weekly');
        }
        
        // Obtiene todas las filas <tr> de la tabla
        const rows = table.getElementsByTagName('tr');

        // Itera sobre cada fila <tr>
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            // Supongamos que el ID de cada <tr> sigue el formato 'taskRowID${taskId}'
            const rowId = row.id;
            const taskId = rowId.replace('taskRowID', ''); // Extrae el taskId del ID del <tr>

            if (data.data.hasOwnProperty(taskId)) {
                const task = data.data[taskId];
                
                // Acceder al array de responses dentro de response
                const responses = task.response;
                console.log(responses)
                responses.forEach(response => {
                    document.getElementById(`noteTask${taskId}`).textContent  = response.response_text
                    document.getElementById(`checkTask${taskId}`).checked = response.completed
                    document.getElementById(`score${taskId}`).value = response.score
                    document.getElementById(`noteAdmin${taskId}`).value = response.admin_Note
                });
            } else {
                // Lógica cuando no hay tarea con taskId en data
                    document.getElementById(`noteTask${taskId}`).textContent  = ''
                    document.getElementById(`checkTask${taskId}`).checked = false
                    document.getElementById(`score${taskId}`).value = ''
                    document.getElementById(`noteAdmin${taskId}`).value = ''
            }
        }
    }
    
   
    formTasks.addEventListener('submit', function(event) {
        event.preventDefault();
    
        if (validateForm()) {
            Swal.fire({
                title: 'Success!',
                text: 'The score was saved correctly.',
                icon: 'success',
                confirmButtonText: 'Accept'
              }).then(() => {
                event.target.submit();
            });
        } else {
            Swal.fire({
                title: 'Oops...',
                text: 'To create a score you have to rate the task!',
                icon: "error",
                confirmButtonText: 'Accept'
            })
        }
    });
});


function validateForm() {
    const table = document.getElementById(`table_body`)
    const rows = table.getElementsByTagName('tr');
    
    for (let i = 1; i < rows.length; i++) {
        const note = rows[i].cells[4]
        input = note.querySelector("input")
        if (input.value == ''){
            continue;
        }
        inputScore = document.getElementById(`score${extractNumbers(input.id)}`)
        if(inputScore.value == ''){
            return false;
        }
    }
    return true;
}

function extractNumbers(string) {
    return string.replace(/\D/g, '');
  }

// Obtener la fecha de hoy
let today = new Date();

// Formatear la fecha como YYYY-MM-DD
let dd = String(today.getDate()).padStart(2, '0');
let mm = String(today.getMonth() + 1).padStart(2, '0'); //Enero es 0!
let yyyy = today.getFullYear();

today = yyyy + '-' + mm + '-' + dd;

dateInputs.forEach(dateInput => {
    dateInput.value = today
});