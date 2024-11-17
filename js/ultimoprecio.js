const app = Vue.createApp({
    data() {
        return {
            // URL's
            url:'https://gacalsergio.pythonanywhere.com',
            //url: 'http://127.0.0.1:5000',

            // Cargar datos al inicio
            ultimaCompra: [],
            balanza: [],

            // variables
            progresoCarga: 0,
            comboSeleccion: false,
            balanzaSeleccionada: null,

        };
    },
    methods: {
        cargando() {
            const intervalo = setInterval(() => {
              if (this.progresoCarga < 100) {
                this.progresoCarga += 1;
              } else {
                clearInterval(intervalo);
              }
            }, 150);
          },
        cargarDatosUltimasCompras(){
            fetch(this.url + '/ultimo_precio')
                .then(response => response.json())
                .then(data => {
                    this.ultimaCompra = data;
                    //console.log(this.ultimaCompra)
                })
                .catch(error => {
                    console.error('Error al cargar datos de ultima compra', error);
                });
        },
        cargarBalanza(){
            fetch(this.url + '/balanza')
                .then(response => response.json())
                .then(data => {
                    this.balanza = data;
                    //console.log(this.balanza) // idBalanza / nombre1.
                })
                .catch(error => {
                    console.error('Ocurrio un error al cargar la balanza', error);
                });
        },
        salir(){
            window.close();
        },
    },
    mounted() {
        this.cargarDatosUltimasCompras();
        this.cargarBalanza();
        this.cargando();
    }
});

app.mount('#app');
