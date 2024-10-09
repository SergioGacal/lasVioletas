const app = Vue.createApp({
    data() {
        return {
            // URL's
            url:'https://gacalsergio.pythonanywhere.com',
            url: 'http://127.0.0.1:5000',

            // Mostrar ocultar botones y secciones
            nuevaCompra : false,
            nuevaFacturaCompra: true,
            nuevoDetalleCompra : false, // muestro la factura cargada


            elegirCompra : true, // probando
            borrarCompra : false,
            edicionCompra: false,
            agregarDetalleCompra: false,
            borrarDetalleCompra : false,
            edicionDetalleCompra: false,

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
            detalleCompra: [], // Acá acumulo el detalle_compra a medida que los voy agregando.

            // Alta de detalle de compra posterior desde el boton agregar
            nuevoDetallePosterior: {
                idCompra: null,
                idProducto: null,
                unidades: null,
                cantidad: null,
                precioUnitario: null
            },


            // Detalle de Compras:
            compras : [],

            // Compra Seleccionada y demás:
            compraSeleccionada: null, // este es el id de la compra seleccionada.
            sumaFactura: 0,
            detalleFactura: [],
            detallecompraSeleccionada: [],


            // Edición de compra:
            edicionFactura: {
                idCompra: this.idCompra,
                idProveedor: null,
                nombreProveedor: null,
                fechaCompra : null,
                numFactura : null,
                iva : null,
                descuento : null
            },


            

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
            this.compras = []
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
                        //console.log(data.resultado);
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
        funcionEditarCompra() { // Falta optimizar
            // Creamos el objeto 'modificacion' solo con los valores no nulos
            const modificacion = {
                idProveedor: this.edicionFactura.idProveedor !== null ? this.edicionFactura.idProveedor : this.detalleFactura.idProveedor,
                numFactura: this.edicionFactura.numFactura !== null ? this.edicionFactura.numFactura : this.detalleFactura.numFactura,
                fechaCompra: this.edicionFactura.fechaCompra !== null ? this.edicionFactura.fechaCompra : this.detalleFactura.fechaCompra,
                iva: this.edicionFactura.iva !== null ? this.edicionFactura.iva : this.detalleFactura.iva,
                descuento: this.edicionFactura.descuento !== null ? this.edicionFactura.descuento : this.detalleFactura.descuento
            };
        
            // Actualizamos los valores de detalleFactura si es necesario
            if (this.edicionFactura.idProveedor !== null) {this.detalleFactura.proveedorNombre = this.proveedores.find(proveedor => proveedor.idProveedor === this.edicionFactura.idProveedor)?.nombreProveedor || 'No disponible';}       
            if (this.edicionFactura.numFactura !== null) {this.detalleFactura.numFactura = this.edicionFactura.numFactura;}
            if (this.edicionFactura.fechaCompra !== null) {this.detalleFactura.fechaCompra = this.edicionFactura.fechaCompra;}
            if (this.edicionFactura.idProveedor !== null) {this.detalleFactura.idProveedor = this.edicionFactura.idProveedor;}
            if (this.edicionFactura.iva !== null) {this.detalleFactura.iva = this.edicionFactura.iva;}
            if (this.edicionFactura.descuento !== null) {this.detalleFactura.descuento = this.edicionFactura.descuento;}

            fetch(this.url + '/compra/' + this.compraSeleccionada, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(modificacion)
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error al actualizar la compra');
                }
                return response.json();
            })
            .then(data => {
                //console.log('Compra actualizada:', data);
            })
            .catch(error => {
                console.error('Hubo un error en la actualización:', error);
            });
        
            // Reseteo del formulario de edición
            this.edicionFactura.numFactura = null;
            this.edicionFactura.fechaCompra = null;
            this.edicionFactura.idProveedor = null;
            this.edicionFactura.nombreProveedor = null;
            this.edicionFactura.iva = null;
            this.edicionFactura.descuento = null;

            this.edicionCompra = false;
 
            this.cargarCompras(); // para actualizar los cambios en el combo
            this.compras = [...this.compras]; // Esto forzaría la actualización del array en Vue

        },
        funcionborrarDetalleCompra(idBorrar){
            let numerito = idBorrar;
            fetch(this.url + '/compra/detalle/' + numerito, {
                method: 'DELETE'
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error al borrar el detalle de compra ' + numerito);
                }
                return response.json();
            })
            .then(data => {
                //console.log('Borrada',numerito);
                this.detallecompraSeleccionada = this.detallecompraSeleccionada.filter(detalle => detalle.idDetalle !== numerito);
                //console.log('detalle compra',this.detallecompraSeleccionada)
                this.sumaFactura = this.detallecompraSeleccionada.reduce((acc, item) => {
                    return acc + parseFloat(item.importeFinal || 0);
                }, 0);    
           })
            .catch(error => {
                console.error('Error al borrar el detalle:', error);
            });
        },
        resetearCompra() {
            console.clear()
            this.compraSeleccionada=null, 
            this.edicionCompra=false,
            this.borrarCompra=false,
            this.sumaFactura = 0,
            this.detalleFactura = []
            this.detallecompraSeleccionada = []
            this.borrarDetalleCompra = false,
            this.edicionDetalleCompra = false
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
                //console.log('Detalle de compra agregado exitosamente:', data);
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
                        
                        //console.log('Detalles acumulados:', this.detalleCompra);
                    });
            })
            .catch(error => {
                console.error('Error al agregar detalle:', error);
            });
        },
        agregarArticuloDespues(idCompraElegida, idProveedorElegido) {
            const nuevoDetallePosteriorJson = {
                idCompra: idCompraElegida,
                idProveedor: idProveedorElegido,
                idProducto: this.nuevoDetallePosterior.idProducto,
                unidades: this.nuevoDetallePosterior.unidades,
                cantidad: this.nuevoDetallePosterior.cantidad,
                precioUnitario: this.nuevoDetallePosterior.precioUnitario
            };
            fetch(this.url + '/compra/agrega_detalle', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(nuevoDetallePosteriorJson)
            })
            .then(response => {
                if (!response.ok) {
                    return response.text().then(text => { throw new Error(text) });
                }
                return response.json();
            })
            .then(data => {
                this.detallecompraSeleccionada = []; // borro detalles acumulados de la pantalla
                this.cargarDetalleCompraSeleccionada();

                // Blanqueo de form.
                this.nuevoDetallePosterior = {
                    idCompra: null,
                    idProducto: null,
                    unidades: null,
                    cantidad: null,
                    precioUnitario: null
                };
               //console.log('Detalles acumulados después de cargar:', this.detallecompraSeleccionada);
            })
            .catch(error => {
                console.error('Error al agregar detalle:', error);
            });
        },
        finalizarCompra(){
            this.nuevaCompra = false,
            this.nuevaFacturaCompra = true,
            this.nuevoDetalleCompra = false,
            this.detalleCompra = [],
            this.ultimaCompra.idCompra = null,
            this.ultimaCompra.idProveedor = null,
            this.ultimaCompra.nombreProveedor = null,
            this.ultimaCompra.fechaCompra = null,
            this.ultimaCompra.numFactura = null,
            this.ultimaCompra.iva = null,
            this.ultimaCompra.descuento = null
        },
        salir(){
            window.close();
        },
    },
    mounted() {
        this.cargarCompras();
        this.cargarProveedores();
    },
});

app.mount('#app');