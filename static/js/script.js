// Define the number of tasks
const numberOfTasks = document.querySelectorAll('input[type="checkbox"]');

numberOfTasks.forEach(taskElement => {
    console.log(taskElement)

    // Check if the element exists (it might not if the IDs are not continuous)
    if (taskElement) {
        console.log('Aqui esta entrando')
        // Add event listener to the element
        taskElement.addEventListener('change', function() {
            var formData = new FormData();
            formData.append('id', taskElement.id)
            formData.append('checked', taskElement.checked ? 'True' : 'False')
            fetch('/change_state_task/', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                console.log('Success:', data);
            })
            .catch((error) => {
                console.error('Error:', error);
            });
        });
    }
});