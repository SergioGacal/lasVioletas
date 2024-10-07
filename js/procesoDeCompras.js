const app = Vue.createApp({
    data() {
        return {
            // URL's
            url:'https://gacalsergio.pythonanywhere.com',
            url: 'http://127.0.0.1:5000',

            // Mostrar ocultar botones y secciones
            nuevaCompra : true, // después cambiar
            nuevaFacturaCompra: true,


            nuevoDetalleCompra : false,


            elegirCompra : false,
            borrarCompra : false,
            edicionCompra: false,

            // Alta de factura
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
            // Alta de detalle de compra:
            nuevoDetalle: {
                idCompra: null,
                idProducto: null,
                unidades: null,
                cantidad: null,
                precioUnitario: null
            },


            // Detalle de Compras:
            compras : [],

            // Compra Seleccionada y demás:
            compraSeleccionada: null,
            sumaFactura: 0,
            detalleFactura: [],
            detallecompraSeleccionada: [],

            

            // Otras variables:
            proveedores : [],
            productosDelProveedor: [], // para la nueva compra

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
        cargarProveedores(){
            fetch(this.url + '/proveedores')
                .then(response => response.json())
                .then(data => {
                    this.proveedores = data;
                    //console.log(this.proveedores)
                })
                .catch(error => {
                    console.error('Error al cargar los proveedores:',error);
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
                    //console.log(this.detallecompraSeleccionada);
                    this.sumaFactura = this.detallecompraSeleccionada.reduce((acc, item) => {
                        return acc + parseFloat(item.importeFinal || 0);
                    }, 0);    
                    //console.log(this.sumaFactura);
                })
                .catch(error => {console.error(error.message);}
            );
        },
        funcionborrarCompra() {
            let numerito = this.compraSeleccionada; // Guardar el id a borrar y después usarlo
            if (this.detallecompraSeleccionada.length > 0) {
                const promesasBorrado = this.detallecompraSeleccionada.map(detalle => {
                    return fetch(this.url + '/compra/detalle/' + detalle.idDetalle, {
                        method: 'DELETE'
                    })
                    .then(response => {
                        if (!response.ok) {
                            throw new Error('Error al borrar el detalle de compra ' + detalle.idDetalle);
                        }
                        return response.json();
                    })
                    .then(data => {
                        console.log(data.resultado);
                    })
                    .catch(error => {
                        console.error('Error al borrar el detalle:', error);
                    });
                });
                Promise.all(promesasBorrado)
                    .then(() => {
                        return fetch(this.url + '/compra/' + numerito, {
                            method: 'DELETE'
                        });
                    })
                    .then(response => {
                        if (!response.ok) {
                            throw new Error('Error al borrar la compra');
                        }
                        return response.json();
                    })
                    .then(data => {
                        this.resetearCompra();
                        this.cargarCompras();
                    })
                    .catch(error => {
                        console.error('Error al borrar la compra:', error);
                    });
        
            } else {
                // Si no hay registros, proceder directamente a borrar la compra
                fetch(this.url + '/compra/' + numerito, {
                    method: 'DELETE'
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Error al borrar la compra');
                    }
                    return response.json();
                })
                .then(data => {
                    this.resetearCompra();
                    this.cargarCompras();
                    //console.log(data.resultado);
                })
                .catch(error => {
                    console.error('Error al borrar la compra:', error);
                });
            }
        },
        funcionEditarCompra(){
            console.log('compra editada', this.compraSeleccionada),
            this.edicionCompra = false
        },
        resetearCompra() {
            console.clear()
            this.compraSeleccionada=null, 
            this.edicionCompra=false,
            this.borrarCompra=false,
            this.sumaFactura = 0,
            this.detalleFactura = []
            this.detallecompraSeleccionada = []
        },
        cancelarAltaCompra(){
            this.nuevaCompra = false,
            this.compra.idCompra = null,
            this.compra.idProveedor = '',
            this.compra.nombreProveedor = '',
            this.compra.fechaCompra = new Date().toISOString().split('T')[0],
            this.compra.numFactura = 0,
            this.compra.iva = false,
            this.compra.descuento = 0
        },
        confirmarAltaCompra(){
            fetch(this.url + '/compra', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(this.compra)
            })
            .then(response => response.json())
            .then(data => {
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
                this.cargarCompras();
                this.ultimaCompra.idCompra = data.idCompra;
                this.nuevaFacturaCompra = false;
                this.nuevoDetalleCompra = true;
                this.traerProductosDelProveedor(this.ultimaCompra.idProveedor);
            })
            .catch(error => {
                console.error('Error al guardar la compra:', error);
            });
        },
        traerProductosDelProveedor(idProveedor) {
            fetch(`${this.url}/compras/xproveedor/${idProveedor}`)
                .then(response => response.json())
                .then(data => {
                    this.productosDelProveedor = data;
                })
                .catch(error => {
                    console.error('Error al obtener productos del proveedor:', error);
                });
        },







        salir(){
            console.clear()
            console.log('Chau a todos')
        },
    },
    mounted() {
        this.cargarCompras();
        this.cargarProveedores();
    },
});

app.mount('#app');