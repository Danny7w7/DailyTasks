// Define the number of tasks
const numberOfTasks = document.querySelectorAll('input[type="checkbox"]');

numberOfTasks.forEach(taskElement => {

    // Check if the element exists (it might not if the IDs are not continuous)
    if (taskElement) {
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

const textarea = document.getElementById('titleText');
const charCountDisplay = document.getElementById('charCount');

textarea.addEventListener('input', function() {
    const charCount = textarea.value.length;
    charCountDisplay.textContent = `Max: ${charCount}/60`;
    if (charCount > 60){
        charCountDisplay.style.color = 'red'
    }else{
        charCountDisplay.style.color = 'black'
    }
});

document.addEventListener('DOMContentLoaded', function() {
    const taskForm = document.getElementById('taskForm');

    function validateForm() {
        if (textarea.value.length > 60) {
            return false;
        } else {
            return true;
        }
    }
    
    taskForm.addEventListener('submit', function(event) {
        event.preventDefault();
    
        if (validateForm()) {
            Swal.fire({
                title: 'Success!',
                text: 'Your text has been successfully added.',
                icon: 'success',
                confirmButtonText: 'Accept'
              }).then(() => {
                event.target.submit();
            });
        } else {
            Swal.fire({
                title: 'Oops...',
                text: 'You have exceeded the character limit!',
                icon: "error",
                confirmButtonText: 'Accept'
            })
        }
    });
});