document.addEventListener('DOMContentLoaded', function() {
    var dateInputs = document.querySelectorAll('input[type="date"]');

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
                responses.forEach(response => {
                    document.getElementById(`noteTask${taskId}`).value = response.response_text
                    document.getElementById(`checkTask${taskId}`).checked = response.completed
                    document.getElementById(`score${taskId}`).value = response.score
                });
            } else {
                // Lógica cuando no hay tarea con taskId en data
                    document.getElementById(`noteTask${taskId}`).value = ''
                    document.getElementById(`checkTask${taskId}`).checked = false
                    document.getElementById(`score${taskId}`).value = ''
            }
        }
    }
    
   
});
function score_response(period) {
    table = document.getElementById(`table_body_${period}`)
    
    // Obtiene todas las filas <tr> de la tabla
    const rows = table.getElementsByTagName('tr');
    
    for (let i = 0; i < rows.length; i++) {
        
        
    }
}
console.log("When you start learning JS")
console.log(1+"1")
console.log(1-"1")

// Obtener la fecha de hoy
let today = new Date();

// Formatear la fecha como YYYY-MM-DD
let dd = String(today.getDate()).padStart(2, '0');
let mm = String(today.getMonth() + 1).padStart(2, '0'); //Enero es 0!
let yyyy = today.getFullYear();

today = yyyy + '-' + mm + '-' + dd;

// Establecer el valor del input
document.getElementById('inputDateDailyHidden').value = today;
document.getElementById('inputDateWeeklyHidden').value = today;