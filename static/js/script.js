// Define the number of tasks
const numberOfTasks = document.querySelectorAll('input[type="checkbox"]').length;

// Iterate over each taskId
for (let i = 1; i <= numberOfTasks; i++) {
    // Construct the ID
    const taskId = `taskId${i}`;
    // Get the element by ID
    const taskElement = document.getElementById(taskId);

    // Check if the element exists (it might not if the IDs are not continuous)
    if (taskElement) {
        // Add event listener to the element
        taskElement.addEventListener('change', function() {
            var formData = new FormData();
            formData.append('id', i)
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
}