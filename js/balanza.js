document.addEventListener('DOMContentLoaded', function() {
    // Función para cargar las opciones en el selector
    function loadOptions() {
        fetch('https://gacalsergio.pythonanywhere.com/balanza')
            .then(response => response.json())
            .then(data => {
                const deleteSelect = document.getElementById('delete-select');
                deleteSelect.innerHTML = '<option value="">Selecciona un código</option>'; // Resetear opciones
                data.forEach(balanza => {
                    const option = document.createElement('option');
                    option.value = balanza.idBalanza;
                    option.textContent = `${balanza.idBalanza} - ${balanza.nombre1}`;
                    deleteSelect.appendChild(option);
                });
            });
    }

    // Función para cargar las opciones en el selector de edición
    function loadEditOptions() {
        fetch('https://gacalsergio.pythonanywhere.com/balanza')
            .then(response => response.json())
            .then(data => {
                const editSelect = document.getElementById('edit-select');
                editSelect.innerHTML = '<option value="">Selecciona un código</option>'; // Resetear opciones
                data.forEach(balanza => {
                    const option = document.createElement('option');
                    option.value = balanza.idBalanza;
                    option.textContent = `${balanza.idBalanza} - ${balanza.nombre1}`;
                    editSelect.appendChild(option);
                });
            });
    }

    // Mostrar formulario de agregar
    document.getElementById('agregar-btn').addEventListener('click', function() {
        document.getElementById('form-container').style.display = 'block';
        document.getElementById('delete-form-container').style.display = 'none';
        document.getElementById('edit-form-container').style.display = 'none'; // Ocultar formulario de edición
    });

    // Cancelar formulario de agregar
    document.getElementById('cancel-btn').addEventListener('click', function() {
        document.getElementById('form-container').style.display = 'none';
    });

    // Mostrar formulario de eliminar
    document.getElementById('eliminar-btn').addEventListener('click', function() {
        document.getElementById('form-container').style.display = 'none';
        document.getElementById('delete-form-container').style.display = 'block';
        document.getElementById('edit-form-container').style.display = 'none'; // Ocultar formulario de edición
        loadOptions(); // Cargar las opciones para eliminar
    });

    // Cancelar formulario de eliminar
    document.getElementById('cancel-delete-btn').addEventListener('click', function() {
        document.getElementById('delete-form-container').style.display = 'none';
    });

    // Mostrar formulario de edición
    document.getElementById('editar-btn').addEventListener('click', function() {
        document.getElementById('form-container').style.display = 'none';
        document.getElementById('delete-form-container').style.display = 'none';
        document.getElementById('edit-form-container').style.display = 'block'; // Mostrar el formulario de edición
        loadEditOptions(); // Cargar las opciones para editar
    });

    // Manejar la selección del elemento para editar
    document.getElementById('edit-select').addEventListener('change', function() {
        const idBalanza = this.value;
        if (idBalanza) {
            fetch(`https://gacalsergio.pythonanywhere.com/balanza/${idBalanza}`)
                .then(response => response.json())
                .then(data => {
                    document.getElementById('edit-nombre1').value = data.nombre1;
                    document.getElementById('edit-precio').value = data.precio;
                    document.getElementById('edit-concertado').checked = data.concertado;
                    document.getElementById('edit-form').style.display = 'block'; // Mostrar formulario de edición
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert('Hubo un problema al cargar los datos.');
                });
        } else {
            document.getElementById('edit-form').style.display = 'none'; // Ocultar formulario si no se selecciona nada
        }
    });

    // Cancelar formulario de edición
    document.getElementById('cancel-edit-btn').addEventListener('click', function() {
        document.getElementById('edit-form').style.display = 'none';
        document.getElementById('edit-form-container').style.display = 'none';
    });

    // Enviar el formulario de agregar
    document.getElementById('balanza-form').addEventListener('submit', function(event) {
        event.preventDefault();

        const formData = new FormData(event.target);
        const data = Object.fromEntries(formData.entries());
        data.concertado = formData.get('concertado') === 'on';
        data.nombre2 = formData.get('nombre2') || "";
        
        fetch('https://gacalsergio.pythonanywhere.com/balanza/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                alert(`Error: ${data.error}`);
            } else {
                //alert('Balanza agregada exitosamente');
                document.getElementById('balanza-form').reset();
                document.getElementById('form-container').style.display = 'none';
                updateTable();
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Hubo un problema con la solicitud.');
        });
    });

    // Enviar el formulario de eliminación
    document.getElementById('delete-btn').addEventListener('click', function() {
        const idBalanza = document.getElementById('delete-select').value;
        if (idBalanza) {
            fetch(`https://gacalsergio.pythonanywhere.com/balanza/${idBalanza}`, {
                method: 'DELETE',
            })
            .then(response => response.json())
            .then(data => {
                //alert(`Balanza ${idBalanza} eliminada con éxito`);
                document.getElementById('delete-form-container').style.display = 'none';
                loadOptions(); // Volver a cargar opciones si es necesario
                updateTable();
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Hubo un problema con la solicitud.');
            });
        }
    });

    // Enviar el formulario de edición
    document.getElementById('edit-form').addEventListener('submit', function(event) {
        event.preventDefault();

        const idBalanza = document.getElementById('edit-select').value;
        const data = {
            nombre1: document.getElementById('edit-nombre1').value,
            precio: document.getElementById('edit-precio').value,
            concertado: document.getElementById('edit-concertado').checked,
        };

        fetch(`https://gacalsergio.pythonanywhere.com/balanza/${idBalanza}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        })
        .then(response => response.json())
        .then(data => {
            //alert(`Balanza ${data.idBalanza} modificada con éxito`);
            document.getElementById('edit-form').style.display = 'none';
            document.getElementById('edit-select').value = ''; // Resetear selección
            updateTable();
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Hubo un problema con la solicitud.');
        });
    });

    // Función para actualizar la tabla
    function updateTable() {
        fetch('https://gacalsergio.pythonanywhere.com/balanza')
            .then(response => response.json())
            .then(data => {
                const tbody = document.getElementById('balanza-table-body');
                tbody.innerHTML = ''; // Limpiar tabla
                data.forEach(balanza => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${balanza.idBalanza}</td>
                        <td>${balanza.nombre1}</td>
                        <td>${balanza.precio}</td>
                    `;
                    tbody.appendChild(row);
                });
            });
    }

    document.getElementById('filtros-novedades').addEventListener('click', function() {
        // Ocultar la tabla principal
        document.getElementById('balanza-table').style.display = 'none';
        
        // Mostrar la tabla de novedades
        document.getElementById('novedades-table').style.display = 'table';
        
        // Mostrar los botones
        document.getElementById('novedades-buttons').style.display = 'block';
    
        // Llamar a la función para cargar los datos de novedades
        loadNovedades();
    });
    
    // Manejar el clic en el botón de cancelar
    document.getElementById('cancel-novedades-btn').addEventListener('click', function() {
        // Ocultar la tabla de novedades
        document.getElementById('novedades-table').style.display = 'none';
        
        // Ocultar los botones
        document.getElementById('novedades-buttons').style.display = 'none';
        
        // Mostrar la tabla principal
        document.getElementById('balanza-table').style.display = 'table';
    });
    
    // Manejar el clic en el botón de eliminar novedades
    document.getElementById('delete-novedades-btn').addEventListener('click', function() {
        // Implementar la funcionalidad para eliminar novedades aquí
        // Ejemplo: alert('Eliminar novedades');
    });
    function loadNovedades() {
        fetch('https://gacalsergio.pythonanywhere.com/balanza/fitro/novedades')
            .then(response => response.json())
            .then(data => {
                const tbody = document.getElementById('novedades-table-body');
                tbody.innerHTML = ''; // Limpiar la tabla
                
                data.forEach(novedad => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${novedad.idBalanza}</td>
                        <td>${novedad.nombre1}</td>
                        <td>${novedad.precio}</td>
                    `;
                    tbody.appendChild(row);
                });
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Hubo un problema al cargar las novedades.');
            });
    }
    
    document.getElementById('delete-novedades-btn').addEventListener('click', function() {
        fetch('https://gacalsergio.pythonanywhere.com/balanza/novedades/', {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(data => {
            if (data.mensaje) {
                //alert(data.mensaje); // Mostrar mensaje de éxito
                console.log(data.mensaje)
            } else if (data.error) {
                alert(`Error: ${data.error}`); // Mostrar mensaje de error
            }
            // Ocultar la tabla de novedades y los botones
            document.getElementById('novedades-table').style.display = 'none';
            document.getElementById('novedades-buttons').style.display = 'none';
            // Mostrar la tabla principal
            document.getElementById('balanza-table').style.display = 'table';
            // Opcional: Volver a cargar la tabla principal si es necesario
            updateTable();
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Hubo un problema con la solicitud.');
        });
    });
    


    // Inicializar la tabla al cargar la página
    updateTable();
});
