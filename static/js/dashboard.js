document.addEventListener('DOMContentLoaded', function () {
    var formData = new FormData();
    formData.append('date', 'dateInput.value')
    formData.append('period', 'dateInput.name')
    fetch('/make_main_chart/', {
        method: 'GET'
    })
    .then(response => response.json())
    .then(data => {
        createMainChart(data)
        createUsersChart(data)
        createScoreChart(data)
        // console.log(data)
    })
    .catch((error) => {
        console.error('Error:', error);
    });

    function createMainChart(data) {
        let days = [0, 0, 0, 0, 0, 0];
        var assignedTasks = Array(6).fill(data.tasks_count);
        // Iterar sobre las propiedades del objeto 'responses'
        for (const key in data.responses) {
            if (data.responses.hasOwnProperty(key)) {
                const response = data.responses[key];
                const dayIndex = response.day;
                
                // Asegurarse de que el índice 'dayIndex' esté dentro del rango del array
                if (dayIndex < days.length && response.completed) {
                    days[dayIndex] += 1;
                }
            }
        }
        var options = {
            series: [
                {
                    name: "Assigned tasks",
                    data: assignedTasks
                },
                {
                    name: "Completed tasks",
                    data: days
                }
            ],
            chart: {
                height: 350,
                type: 'line',
                dropShadow: {
                    enabled: true,
                    color: '#000',
                    top: 18,
                    left: 7,
                    blur: 10,
                    opacity: 0.2
                },
                zoom: {
                    enabled: false
                },
                toolbar: {
                    show: false
                }
            },
            colors: ['#545454', '#77B6EA'],
            dataLabels: {
                enabled: true,
            },
            stroke: {
                curve: 'smooth'
            },
            title: {
                text: '‎ ', // This is an empty character
                align: 'left'
            },
            grid: {
                borderColor: '#e7e7e7',
                row: {
                    colors: ['#f3f3f3', 'transparent'], // takes an array which will be repeated on columns
                    opacity: 0
                },
            },
            markers: {
                size: 1
            },
            xaxis: {
                categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
                title: {
                    text: 'Days'
                }
            },
            yaxis: {
                title: {
                    text: 'Tasks'
                },
                min: 0,
                max: data.tasks_count + 2
            },
            legend: {
                position: 'top',
                horizontalAlign: 'right',
                floating: true,
                offsetY: -25,
                offsetX: -5
            }
        };
    
        var chart = new ApexCharts(document.querySelector("#mainChart"), options);
        chart.render();
    }
    function createUsersChart(data) {
        for (const key in data.users) {
            if (data.users.hasOwnProperty(key)) {
                const user = data.users[key];
                var chart = new ApexCharts(document.querySelector(`#userChartTasks${user.username}`), createOptionUser(data, key));
                chart.render();
            }
        }
    }
    function createScoreChart(data) {
        for (const key in data.users) {
            if (data.users.hasOwnProperty(key)) {
                const user = data.users[key];
                var chart = new ApexCharts(document.querySelector(`#userChartScore${user.username}`), CreateOptionScore(data, key));
                chart.render();
            }
        }
    }
    function createOptionUser(data, key_user) {
        userId = data.users[key_user].id
        const userTasks = data.tasks.filter(task => task.assigned_to_id === userId);
        const userResponses = Object.values(data.responses).filter(response => response.user_id === userId);
        
        var assignedTasks = Array(6).fill(userTasks.length);
        let days = [0, 0, 0, 0, 0, 0];
        for (const key in userResponses) {
            if (userResponses.hasOwnProperty(key)) {
                const response = userResponses[key];
                const dayIndex = response.day;
                
                // Asegurarse de que el índice 'dayIndex' esté dentro del rango del array
                if (dayIndex < days.length && response.completed) {
                    days[dayIndex] += 1;
                }
            }
        }
        
        var options = {
            series: [
                {
                    name: "Assigned tasks",
                    data: assignedTasks
                },
                {
                    name: "Completed tasks",
                    data: days
                }
            ],
            chart: {
                height: 350,
                type: 'line',
                dropShadow: {
                    enabled: true,
                    color: '#000',
                    top: 18,
                    left: 7,
                    blur: 10,
                    opacity: 0.2
                },
                zoom: {
                    enabled: false
                },
                toolbar: {
                    show: false
                }
            },
            colors: ['#545454', '#77B6EA'],
            dataLabels: {
                enabled: true,
            },
            stroke: {
                curve: 'smooth'
            },
            title: {
                text: '‎ ', // This is an empty character
                align: 'left'
            },
            grid: {
                borderColor: '#e7e7e7',
                row: {
                    colors: ['#f3f3f3', 'transparent'], // takes an array which will be repeated on columns
                    opacity: 0
                },
            },
            markers: {
                size: 1
            },
            xaxis: {
                categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
                title: {
                    text: 'Days'
                }
            },
            yaxis: {
                title: {
                    text: 'Tasks'
                },
                min: 0,
                max: userTasks.length + 2
            },
            legend: {
                position: 'top',
                horizontalAlign: 'right',
                floating: true,
                offsetY: -25,
                offsetX: -5
            }
        };
        return options;
    }
    function CreateOptionScore(data, key_user) {
        let days = [0, 0, 0, 0, 0, 0];
        let contForDay = [0, 0, 0, 0, 0, 0];
        let sumDays = [0, 0, 0, 0, 0, 0]
        userId = data.users[key_user].id
        const userResponses = Object.values(data.responses).filter(response => response.user_id === userId);
        for (const key in userResponses) {
            if (userResponses.hasOwnProperty(key)) {
                const response = userResponses[key];
                const dayIndex = response.day;
                
                // Asegurarse de que el índice 'dayIndex' esté dentro del rango del array
                if (dayIndex < days.length) {
                    contForDay[dayIndex] += 1;
                    sumDays[dayIndex] = sumDays[dayIndex] + response.score
                    average = sumDays[dayIndex] / contForDay[dayIndex];
                    days[dayIndex] = average;
                }
            }
        }
        for (let i = 0; i < days.length; i++) {
            if (days[i] % 1 !== 0) {
                // Si el número es decimal
                days[i] = parseFloat(days[i].toFixed(1));
            } 
            // Si es entero, lo dejamos como está
        }

        var options = {
            series: [{
                data: days
            }],
            chart: {
                height: 350,
                type: 'line',
                zoom: {
                    enabled: false
                },
            },
            colors: ['#545454'],
            annotations: {
                yaxis: [{
                    y: 8,
                    y2: 0,
                    borderColor: '#000',
                    fillColor: '#ff0000',
                    opacity: 0.2,
                },
                {
                    y: 10,
                    y2: 8,
                    borderColor: '#000',
                    fillColor: '#00ff00',
                    opacity: 0.2,
                }],
            },
            stroke: {
                curve: 'smooth'
            },
            title: {
                text: 'Score',
                align: 'left'
            },
            xaxis: {
                type: 'text',
                categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
            },
            yaxis: {
                title: {
                    text: 'Score'
                },
                min: 0,
                max: 10
            },
        };
        return options; 
    }

});

