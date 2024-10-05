const app = Vue.createApp({
    data() {
        return {
            // URL's
            url:'https://gacalsergio.pythonanywhere.com',
            url: 'http://127.0.0.1:5000',

            // Mostrar ocultar botones y secciones
            nuevaCompra : false,
            elegirCompra : true,
            borrarCompra : false,

            // Detalle de Compras:
            compras : [],

            // Compra Seleccionada y demás:
            compraSeleccionada: null,
            sumaFactura: 0,
            detalleFactura: [],
            detallecompraSeleccionada: [],

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
        cargarCompras() {
            fetch(this.url + '/compras')
                .then(response => response.json())
                .then(data => {
                    this.compras = data;
                    //console.log(this.compras)
                })
                .catch(error => {
                    console.error('Error al obtener compras:', error);
                });
        },
        cargarDetalleCompraSeleccionada(){
            fetch(this.url + '/compra/' + this.compraSeleccionada )
                .then(response => response.json())
                .then(data => {
                    this.detalleFactura = data;
                    //console.log(this.detalleFactura)
                })
                .catch(error => {
                    console.error('Error al obtener Factura:', error);
                });            
            fetch(this.url + '/compras/detalle/compra/' + this.compraSeleccionada)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! Status: ${response.status}`);
                    }
                    return response.json();
                })
                .then(data => {
                    this.detallecompraSeleccionada = data;
                    console.log(this.detallecompraSeleccionada);
                    this.sumaFactura = this.detallecompraSeleccionada.reduce((acc, item) => {
                        return acc + parseFloat(item.importeFinal || 0);
                    }, 0);    
                    console.log(this.sumaFactura);
                })
                .catch(error => {console.error(error.message);}
            );
        },
        funcionborrarCompra(){
            console.log('compra borrada',this.compraSeleccionada)
        },
        resetearCompra() {
            console.clear()
            this.compraSeleccionada=null, 
            this.sumaFactura = 0,
            this.detalleFactura = []
            this.detallecompraSeleccionada = []
        },
        salir(){
            console.clear()
            console.log('Chau a todos')
        },
    },
    mounted() {
        this.cargarCompras()
    },
});

app.mount('#app');