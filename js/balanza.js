document.getElementById('agregar-btn').addEventListener('click', function() {
    document.getElementById('form-container').style.display = 'block';
});

document.getElementById('cancel-btn').addEventListener('click', function() {
    document.getElementById('form-container').style.display = 'none';
});

const url = 'https://gacalsergio.pythonanywhere.com/balanza';

document.addEventListener('DOMContentLoaded', function() {
    fetch(url)
        .then(response => response.json())
        .then(data => {
            const tableBody = document.getElementById('balanza-table-body');
            tableBody.innerHTML = data.map(balanza => `
                <tr>
                    <td>${balanza.idBalanza}</td>
                    <td>${balanza.nombre1}</td>
                    <td>${balanza.precio}</td>
                    <!-- <td class="checkbox">${balanza.concertado ? '<span class="checkmark">&#10004;</span>' : '<span class="cross">&#10060;</span>'}</td> -->
                </tr>
            `).join('');
        })
        .catch(error => console.error('Error:', error));
});
