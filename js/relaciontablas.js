const app = Vue.createApp({

    data() {
        return {
            url: 'https://gacalsergio.pythonanywhere.com',
            mostrarCrear: false,
            mostrarListado: false,
            mostrarEdicion: false,
            mostrarTodosLosDatos: false,
            mostrarHabilitarBorrado: false,

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
            console.log(this.relacionProductos)
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
        borrarRelacion(idBalanza, idProducto, idProveedor, idProdXProv) {
            fetch(this.url + '/relacion', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    idBalanza: idBalanza,
                    idProducto: idProducto,
                    idProveedor: idProveedor,
                    idProdXProv: idProdXProv
                })
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error en la solicitud');
                }
                return response.text();
            })
            .then(data => {
                console.log('Registro borrado:', data);
                this.traerRelacionProductos();
            })
            .catch(error => {
                console.error('Error al borrar la relación:', error);
            });
        },
        actualizarMargen(idBalanza1, idProducto1, idProveedor1, idProdXProv1,margen1){
            console.log(margen1)
            fetch(this.url + '/relacion/margen', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    idBalanza: idBalanza1,
                    idProducto: idProducto1,
                    idProveedor: idProveedor1,
                    idProdXProv: idProdXProv1,
                    margen: margen1
                })
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error en la solicitud');
                }
                return response.text();
            })
            .then(data => {
                this.mostrarEdicion = false;
                this.traerRelacionProductos();
            })
            .catch(error => {
                console.error('Error al actualizar el margen:', error);
            });
        },
        salir(){
            window.close();
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
