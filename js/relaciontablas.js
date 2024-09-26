const app = Vue.createApp({

    data() {
        return {
            url: 'https://gacalsergio.pythonanywhere.com',
            mostrarCrear: false,
            mostrarListado: false,

            // Elementos a cargar:
            relacionProductos: [],
            balanza: [],
            productos: [],
            proveedores: [],
            pxp: [],

            // Para formulario de alta/relación:
            seleccionBalanza: '',
            seleccionProducto: '',
            seleccionProveedor: '',
            seleccionPxP: '',
            seleccionMargen: '',
            seleccionObservacion: '',

        }

    },

    methods: {
        prueba(){
            console.clear()
            console.log('Balanza',this.seleccionBalanza);
            console.log('Producto',this.seleccionProducto);
            console.log('Proveedor', this.seleccionProveedor);
            console.log('PxP', this.seleccionPxP);
            console.log('Margen:', this.seleccionMargen);
            console.log('Comentario:', this.seleccionObservacion);
        },
        traerRelacionProductos() {
            fetch(this.url + '/relacion')
                .then(response => response.json())
                .then(data => {
                    this.relacionProductos = data;
                })
                .catch(error => {
                    console.error('Error al obtener proveedores:', error);
                });
        },
        traerBalanza() {
            fetch(this.url + '/balanza')
                .then(response => response.json())
                .then(data => {
                    this.balanza = data;
                })
                .catch(error => {
                    console.error('Error al obtener balanza:', error);
                });
        },
        traerProducto(){
            fetch(this.url + '/productos')
                .then(response => response.json())
                .then(data =>{
                    this.productos = data;
                })
                .catch(error => {
                    console.error('Error al obtener productos:', error);
                });
        },
        traerProveedores(){
            fetch(this.url + '/proveedores')
                .then(response => response.json())
                .then(data => {
                    this.proveedores = data;
                })
                .catch(error => {
                    console.error('Error al obtener proveedores:', error);
                });
        },
        traerProductoXProveedor(){
            fetch(this.url + '/compras/xproveedor/'+ this.seleccionProveedor)
            .then(response => response.json())
            .then(data => {
                this.pxp = data;
            })
            .catch(error => {
                console.error('Error al obtener pxp:', error);
            });
        },
        crearNuevaRelacion(){
            fetch(this.url + '/relacion', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    idBalanza: this.seleccionBalanza,
                    idProducto: this.seleccionProducto,
                    idProveedor: this.seleccionProveedor,
                    idProdXProv: this.seleccionPxP,
                    margen: this.seleccionMargen,
                    pesoPromedio: 0,
                    observacion: this.seleccionObservacion,
                })
            })
            .then(response => response.json())
            .then(data => {
                this.mostrarCrear = false;
                this.seleccionBalanza = '';
                this.seleccionProducto = '';
                this.seleccionProveedor = '';
                this.seleccionPxP = '';
                this.seleccionMargen = '';
                this.seleccionObservacion = '';
                this.traerRelacionProductos();
            })
            .catch(error => {
                console.error('Error al crear la relación:', error);
            });
        },
        cancelarAltaRelacion(){
            this.mostrarCrear = false;
            this.seleccionBalanza = '';
            this.seleccionProducto = '';
            this.seleccionProveedor = '';
            this.seleccionPxP = '';
            this.seleccionMargen = '';
            this.seleccionObservacion = '';
        },
    },

    watch: {
        seleccionProveedor(newValue) {
            if (this.seleccionProveedor !== '') {
                this.traerProductoXProveedor();
            }
        },
    },

    mounted() {
        this.traerRelacionProductos();
        this.traerBalanza();
        this.traerProducto();
        this.traerProveedores();
    },
});

app.mount('#app');
