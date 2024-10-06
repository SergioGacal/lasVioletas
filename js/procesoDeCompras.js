const app = Vue.createApp({
    data() {
        return {
            // URL's
            url:'https://gacalsergio.pythonanywhere.com',
            url: 'http://127.0.0.1:5000',

            // Mostrar ocultar botones y secciones
            nuevaCompra : true, // después cambiar
            nuevoDetalleCompra : false,


            elegirCompra : false,
            borrarCompra : false,
            edicionCompra: false,

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