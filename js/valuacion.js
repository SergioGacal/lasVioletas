const app = Vue.createApp({
    data() {
        return {
            // URL's
            url: 'https://gacalsergio.pythonanywhere.com',
            //url: 'http://127.0.0.1:5000',

            // Datos
            ultimaValuacion: [],

            // Variables
            verDatos: true,
            todosLosDatos: false,
            producto: '',

        };
    },
    methods: {
        formatearNumero(valor) {
            const numero = parseFloat(valor);
            if (isNaN(numero)) {
                return '';
            }
            return numero.toLocaleString('es-LA', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
                useGrouping: true,
            });
        },
        verUltimaValuacion() {
            fetch(this.url + '/valuacion')
                .then(response => response.json())
                .then(data => {
                    this.ultimaValuacion = data;
                    //console.log(this.ultimaValuacion[0])
                })
                .catch(error => {
                    console.error('Ocurrio un error al cargar los datos', error);
                });
        },
        salir() {
            window.close();
        },
    },
    mounted() {
        this.verUltimaValuacion();
    },
});

app.mount('#app');
