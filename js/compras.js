const app = Vue.createApp({
    data() {
        return {
            //url:'https://gacalsergio.pythonanywhere.com',
            url: 'http://127.0.0.1:5000',
            botonCancelar: false,
            mostrarBotonAgregarCompra: true,
            mostrarFormularioAgregarCompra: false,
            verUltimaCompra: false,
            agregarDetalle: false,
            listadoCompras: false,
            
            proveedores: [],

            compra: {
                idCompra: null,
                idProveedor: '',
                nombreProveedor: '',
                fechaCompra: new Date().toISOString().split('T')[0],  // Fecha actual
                numFactura: 0,
                iva: false,
                descuento: 0,
            },
            ultimaCompra: {
                idCompra: null,
                idProveedor: null,
                nombreProveedor: null,
                fechaCompra: null,
                numFactura: null,
                iva: null,
                descuento: null,
            },
            
            detalleCompra: [],
            productosDelProveedor: [],
            nuevoDetalle: {
                idCompra: null,
                idProducto: null,
                unidades: null,
                cantidad: null,
                precioUnitario: null
            },
        };
    },
    methods: {
        resetearPagina() {
            window.location.reload();
        },
        obtenerProveedores() {
            fetch(this.url + '/proveedores')
                .then(response => response.json())
                .then(data => {
                    this.proveedores = data;
                })
                .catch(error => {
                    console.error('Error al obtener proveedores:', error);
                });
        },
        obtenerProductosDelProveedor(idProveedor) {
            fetch(`${this.url}/compras/xproveedor/${idProveedor}`)
                .then(response => response.json())
                .then(data => {
                    this.productosDelProveedor = data;
                })
                .catch(error => {
                    console.error('Error al obtener productos del proveedor:', error);
                });
        },
        agregarCompra() {
            fetch(this.url + '/compra', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(this.compra)
            })
            .then(response => response.json())
            .then(data => {
                console.log('Compra guardada'); // BORRAMOS ESTA LINEA DESPUÉS
                this.ultimaCompra = {
                    idCompra : this.compra.idCompra,
                    idProveedor :this.compra.idProveedor,
                    nombreProveedor: this.proveedores.find(proveedor => proveedor.idProveedor === this.compra.idProveedor)?.nombreProveedor || 'No disponible',
                    fechaCompra : this.compra.fechaCompra,
                    iva : this.compra.iva,
                    descuento : this.compra.descuento,
                    numFactura : this.compra.numFactura,
                };
                this.compra = {
                    idCompra: null,
                    idProveedor: '',
                    fechaCompra: new Date().toISOString().split('T')[0],
                    iva: false,
                    descuento: null,
                    numFactura: 0  ,
                };
                this.ultimaCompra.idCompra = data.idCompra;
                console.log('ID de la compra guardada:', this.ultimaCompra.idCompra);
                console.log(this.ultimaCompra)
                this.mostrarFormularioAgregarCompra = false;
                this.verUltimaCompra = true;
                this.agregarDetalle = true;
                this.obtenerProductosDelProveedor(this.ultimaCompra.idProveedor);
            })
            .catch(error => {
                console.error('Error al guardar la compra:', error);
            });
        },
        agregarArticulo() {
            const detalleCompra = {
                idCompra: this.ultimaCompra.idCompra,
                idProveedor: this.ultimaCompra.idProveedor,
                idProducto: this.nuevoDetalle.idProducto,
                unidades: this.nuevoDetalle.unidades,
                cantidad: this.nuevoDetalle.cantidad,
                precioUnitario: this.nuevoDetalle.precioUnitario
            };
        
            // Primero, agrega el detalle de compra
            fetch(this.url + '/compra/agrega_detalle', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(detalleCompra)
            })
            .then(response => {
                if (!response.ok) {
                    return response.text().then(text => { throw new Error(text) });
                }
                return response.json();
            })
            .then(data => {
                console.log('Detalle de compra agregado exitosamente:', data);
        
                // Luego, obtén la descripción del producto usando idProveedor e idProducto
                return fetch(`${this.url}/compras/productoxproveedor/${data.idProveedor}/${data.idProducto}`)
                    .then(response => {
                        if (!response.ok) {
                            return response.text().then(text => { throw new Error(text) });
                        }
                        return response.json();
                    })
                    .then(productData => {
                        // Agrega el detalle con el nombre del producto al array detalleCompra
                        this.detalleCompra.push({
                            idDetalle: data.idDetalle,
                            idCompra: data.idCompra,
                            idProveedor: data.idProveedor,
                            idProducto: data.idProducto,
                            nombreProducto: productData.descripcion, // Nombre del producto
                            unidades: data.unidades,
                            cantidad: data.cantidad,
                            precioUnitario: data.precioUnitario,
                            precioFinal: data.precioFinal,
                            importe: data.importe,
                            importeFinal: data.importeFinal
                        });
                        
                        // Limpiar el formulario de nuevoDetalle
                        this.nuevoDetalle = {
                            idProducto: null,
                            unidades: null,
                            cantidad: null,
                            precioUnitario: null
                        };
                        
                        console.log('Detalles acumulados:', this.detalleCompra);
                    });
            })
            .catch(error => {
                console.error('Error al agregar detalle:', error);
            });
        },
        

    },
    mounted() {
        this.obtenerProveedores();
    },
    computed: {
        detalleConIdCompra() {
            return {
                ...this.nuevoDetalle,
                idCompra: this.idCompra
            };
        }
    },
});

app.mount('#app');
