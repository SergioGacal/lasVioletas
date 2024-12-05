const app = Vue.createApp({
    data() {
        return {
            // URL's
            url:'https://gacalsergio.pythonanywhere.com',
            //url: 'http://127.0.0.1:5000',

            // Cargar datos al inicio
            ultimaCompra: [],
            balanza: [],
            relacionProductos: [],

            // variables
            comboSeleccion: false,
            balanzaSeleccionada: null,

            // datos
            margenBalanzaSeleccionada: null,
        };
    },
    methods: {
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
        cargarRelacionProductos() {
            fetch(this.url + '/relacion')
                .then(response => response.json() )
                .then(data => {
                    this.relacionProductos = data;
                    //console.log(this.relacionProductos)
                })
                .catch(error => {
                    console.error('Error al recuperar la relacion de productos.',error);
                });
        },
        eleccionBalanza() {
            const productoSeleccionado = this.relacionProductos.find(
                producto => producto.idBalanza === this.balanzaSeleccionada
            );
            this.margenBalanzaSeleccionada = productoSeleccionado ? productoSeleccionado.margen : null;
            const comprasFiltradas = this.ultimaCompra.filter(compra => compra.idBalanza === this.balanzaSeleccionada);
        },
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
        actualizar() {
            fetch(this.url + '/actualizar_precio')
              .then(response => response.json())
              .then(data => {
                alert("Respuesta OK: " + JSON.stringify(data));
                this.cargarDatosUltimasCompras();
              })
              .catch(error => {
                console.error('Ocurrió un error al actualizar', error);
                alert("Ocurrió un error al actualizar.");
              });
          },
        salir(){
            window.close();
        },
    },
    mounted() {
        this.cargarDatosUltimasCompras();
        this.cargarBalanza();
        this.cargarRelacionProductos();
    }
});

app.mount('#app');
