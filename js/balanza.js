document.getElementById('agregar-btn').addEventListener('click', function() {
    document.getElementById('form-container').style.display = 'block';
    document.getElementById('delete-form-container').style.display = 'none';
});

document.getElementById('cancel-btn').addEventListener('click', function() {
    document.getElementById('form-container').style.display = 'none';
});

document.getElementById('eliminar-btn').addEventListener('click', function() {
    document.getElementById('form-container').style.display = 'none';
    document.getElementById('delete-form-container').style.display = 'block';
    loadOptions();
});

document.getElementById('cancel-delete-btn').addEventListener('click', function() {
    document.getElementById('delete-form-container').style.display = 'none';
});

document.getElementById('balanza-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());
    data.concertado = formData.get('concertado') === 'on';
    data.nombre2 = formData.get('nombre2') || "";
    const url = 'https://gacalsergio.pythonanywhere.com/'

    fetch(url + 'balanza/', {
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
            alert('Balanza agregada exitosamente');
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

document.getElementById('delete-btn').addEventListener('click', function() {
    const selectedId = document.getElementById('delete-select').value;
    if (selectedId) {
        const url = `https://gacalsergio.pythonanywhere.com/balanza/${selectedId}`;
        
        fetch(url, {
            method: 'DELETE',
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                alert(`Error: ${data.error}`);
            } else {
                alert('Balanza eliminada exitosamente');
                document.getElementById('delete-form-container').style.display = 'none';
                updateTable();
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Hubo un problema con la solicitud.');
        });
    } else {
        alert('Por favor, selecciona un registro para eliminar.');
    }
});

function updateTable() {
    const url = 'https://gacalsergio.pythonanywhere.com/balanza';
    fetch(url)
        .then(response => response.json())
        .then(data => {
            const tableBody = document.getElementById('balanza-table-body');
            tableBody.innerHTML = data.map(balanza => `
                <tr>
                    <td>${balanza.idBalanza}</td>
                    <td>${balanza.nombre1}</td>
                    <td>${balanza.precio}</td>
                </tr>
            `).join('');
        })
        .catch(error => console.error('Error:', error));
}

function loadOptions() {
    const url = 'https://gacalsergio.pythonanywhere.com/balanza';
    fetch(url)
        .then(response => response.json())
        .then(data => {
            const select = document.getElementById('delete-select');
            select.innerHTML = data.map(balanza => `
                <option value="${balanza.idBalanza}">${balanza.idBalanza} - ${balanza.nombre1}</option>
            `).join('');
        })
        .catch(error => console.error('Error:', error));
}

document.addEventListener('DOMContentLoaded', updateTable);
