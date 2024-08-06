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
                if (dayIndex < days.length) {
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
                text: 'Daily Compliance Rate',
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
                if (dayIndex < days.length) {
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
                text: 'Daily Compliance Rate',
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
        userId = data.users[key_user].id
        const userResponses = Object.values(data.responses).filter(response => response.user_id === userId);

        console.log(userResponses)

        for (const key in userResponses) {
            if (userResponses.hasOwnProperty(key)) {
                const response = userResponses[key];
                const dayIndex = response.day;
                
                // Asegurarse de que el índice 'dayIndex' esté dentro del rango del array
                if (dayIndex < days.length) {
                    contForDay[dayIndex] += 1;
                    average = (days[dayIndex] + response.score) / contForDay[dayIndex];
                    days[dayIndex] = parseFloat(average.toFixed(1));
                }
            }
        }

        var options = {
            series: [
                {
                    name: "Score daily",
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
                text: 'Score Compliance Rate',
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
            fill: {
                type: "gradient",
                gradient: {
                  type: 'vertical',
                  shadeIntensity: 1,
                  opacityFrom: 1,
                  opacityTo: 1,
                  colorStops: [
                    {
                      offset: 20,
                      color: "#00ff00",
                      opacity: 1
                    },
                    {
                      offset: 30,
                      color: "#ff0000",
                      opacity: 1
                    }
                  ]
                }
              },
            xaxis: {
                categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
                title: {
                    text: 'Days'
                }
            },
            yaxis: {
                title: {
                    text: 'Score'
                },
                min: 1,
                max: 10
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

});