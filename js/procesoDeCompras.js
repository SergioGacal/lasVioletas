const app = Vue.createApp({
    data() {
        return {
            // URL's
            url:'https://gacalsergio.pythonanywhere.com',
            //url: 'http://127.0.0.1:5000',

            // Mostrar ocultar botones y secciones
            nuevaCompra : false,
            nuevaFacturaCompra: true,
            nuevoDetalleCompra : false, // muestro la factura cargada


            elegirCompra : false,
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
            balanza : [], // guardamos info de balanza: concertado,idBalanza,nombre1,nombre2, precio
            relacionProductos : [],


        };
        
    },
    methods: {
        logsDeVariables(){
            console.log("---- ESTADO DE VARIABLES PRINCIPALES ----");

            // Estado de los flags para mostrar/ocultar secciones
            console.log("nuevaCompra:", this.nuevaCompra);
            console.log("nuevaFacturaCompra:", this.nuevaFacturaCompra);
            console.log("nuevoDetalleCompra:", this.nuevoDetalleCompra);
            console.log("elegirCompra:", this.elegirCompra);
            console.log("borrarCompra:", this.borrarCompra);
            console.log("edicionCompra:", this.edicionCompra);
            console.log("agregarDetalleCompra:", this.agregarDetalleCompra);
            console.log("borrarDetalleCompra:", this.borrarDetalleCompra);
            console.log("edicionDetalleCompra:", this.edicionDetalleCompra);

            // Estado de la compra actual
            console.log("Compra actual (compra):", this.compra);
            console.log("idCompra:", this.compra.idCompra);
            console.log("idProveedor (compra):", this.compra.idProveedor);
            console.log("nombreProveedor (compra):", this.compra.nombreProveedor);
            console.log("fechaCompra:", this.compra.fechaCompra);
            console.log("numFactura (compra):", this.compra.numFactura);
            console.log("iva (compra):", this.compra.iva);
            console.log("descuento (compra):", this.compra.descuento);

            // Última compra guardada
            console.log("Última compra (ultimaCompra):", this.ultimaCompra);
            console.log("idCompra (ultimaCompra):", this.ultimaCompra.idCompra);
            console.log("idProveedor (ultimaCompra):", this.ultimaCompra.idProveedor);
            console.log("nombreProveedor (ultimaCompra):", this.ultimaCompra.nombreProveedor);
            console.log("fechaCompra (ultimaCompra):", this.ultimaCompra.fechaCompra);
            console.log("numFactura (ultimaCompra):", this.ultimaCompra.numFactura);
            console.log("iva (ultimaCompra):", this.ultimaCompra.iva);
            console.log("descuento (ultimaCompra):", this.ultimaCompra.descuento);

            // Estado del nuevo detalle de compra
            console.log("Nuevo detalle de compra (nuevoDetalle):", this.nuevoDetalle);
            console.log("idCompra (nuevoDetalle):", this.nuevoDetalle.idCompra);
            console.log("idProducto (nuevoDetalle):", this.nuevoDetalle.idProducto);
            console.log("unidades (nuevoDetalle):", this.nuevoDetalle.unidades);
            console.log("cantidad (nuevoDetalle):", this.nuevoDetalle.cantidad);
            console.log("precioUnitario (nuevoDetalle):", this.nuevoDetalle.precioUnitario);

            // Detalle de compra posterior desde botón agregar
            console.log("Nuevo detalle posterior (nuevoDetallePosterior):", this.nuevoDetallePosterior);
            console.log("idCompra (nuevoDetallePosterior):", this.nuevoDetallePosterior.idCompra);
            console.log("idProducto (nuevoDetallePosterior):", this.nuevoDetallePosterior.idProducto);
            console.log("unidades (nuevoDetallePosterior):", this.nuevoDetallePosterior.unidades);
            console.log("cantidad (nuevoDetallePosterior):", this.nuevoDetallePosterior.cantidad);
            console.log("precioUnitario (nuevoDetallePosterior):", this.nuevoDetallePosterior.precioUnitario);

            // Detalle de compras acumuladas
            console.log("Detalle de compra (detalleCompra):", this.detalleCompra);

            // Detalle de compra seleccionada
            console.log("Compra seleccionada (compraSeleccionada):", this.compraSeleccionada);
            console.log("Suma factura (sumaFactura):", this.sumaFactura);
            console.log("Detalle factura (detalleFactura):", this.detalleFactura);
            console.log("Detalle compra seleccionada (detallecompraSeleccionada):", this.detallecompraSeleccionada);

            // Edición de factura
            console.log("Edición de factura (edicionFactura):", this.edicionFactura);

            // Estado de otras variables
            //console.log("Proveedores (proveedores):", this.proveedores);
            //console.log("Productos del proveedor (productosDelProveedor):", this.productosDelProveedor);
            //console.log("Balanza (balanza):", this.balanza);
            //console.log("Relación productos (relacionProductos):", this.relacionProductos);

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
        cargarBalanza(){
            fetch(this.url + '/balanza')
                .then(response => response.json())
                .then(data =>{
                    this.balanza = data;
                    //console.log(this.balanza)
                })
                .catch(error => {
                    console.error('Error al cargar la balanza:',error);
                });
        },
        cargarRelacionProductos(){
            fetch(this.url + '/relacion')
                .then(response => response.json())
                .then(data =>{
                    this.relacionProductos = data;
                    //console.log(this.relacionProductos)
                })
                .catch(error => {
                    console.error('Error al cargar la relacion_productos:',error);
                });
        },
        buscarRelacionProductoIdBalanza(idProveedor, idProdXProv) {
            const relacion = this.relacionProductos.find(item => item.idProveedor === idProveedor && item.idProdXProv === idProdXProv);
            return relacion ? relacion.idBalanza : null;
        },
        buscarRelacionProductoProductoDeProductos(idProveedor,idProdXProv){
            const relacion = this.relacionProductos.find(item => item.idProveedor === idProveedor && item.idProdXProv === idProdXProv);
            //console.log('relacion traida producto:',relacion.idProducto)
            return relacion ? relacion.idProducto : null;
        },
        buscarRelacionProductoMargen(idProveedor, idProdXProv) {
            const relacion = this.relacionProductos.find(item => item.idProveedor === idProveedor && item.idProdXProv === idProdXProv);
            return relacion ? relacion.margen : null;
        },
        buscarPesoPromedio(idBalanza) {
            const relacion = this.relacionProductos.find(item => item.idBalanza === idBalanza);
            return relacion ? relacion.pesoPromedio : null; 
        },
        buscarPrecio(idBalanza) {
            const relacion = this.balanza.find(item => item.idBalanza === idBalanza);
            return relacion ? relacion.precio : null; 
        },
        buscarUnidadesKilos(idProveedor, idProducto, unidades, cantidad) {
            return fetch(this.url + '/compras/detalle')
                .then(response => response.json())
                .then(data => {
                    const registrosFiltrados = data.filter(item => 
                        item.idProveedor === idProveedor && item.idProducto === idProducto
                    );
                    const totalUnidades = registrosFiltrados.reduce((acc, item) => acc + Number(item.unidades), 0) || 0;
                    const totalCantidad = registrosFiltrados.reduce((acc, item) => acc + Number(item.cantidad), 0) || 0; 
                    const pesoPromedioNuevo = totalUnidades > 0 
                        ? ((totalCantidad + cantidad) / (totalUnidades + unidades)).toFixed(2) 
                        : 0;
                    return parseFloat(pesoPromedioNuevo); 
                })
                .catch(error => {
                    console.error('Error al cargar datos:', error);
                    return 0;
                });
        },
        buscarDivideX(idProveedor, idProducto) {
            return fetch(this.url + '/compras/productoxproveedor/' + idProveedor + '/' + idProducto)
                .then(response => response.json())
                .then(data => {
                    if (data.idProveedor === idProveedor && data.idProdXProv === idProducto) {
                        if (data.medicion === 'unidad') {
                            return parseFloat(data.divideX) || 1;
                        }
                    }
                    return 1;
                });
        },
        actualizarPesoPromedio(idBalanza, idProducto, idProveedor, idProdXProv, pesoPromedio) {
            const data = {
                idBalanza: idBalanza,
                idProdXProv: idProdXProv,
                idProducto: idProducto,
                idProveedor: idProveedor,
                pesoPromedio: pesoPromedio
            };
           fetch(this.url + '/relacion/peso', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(errorData => {
                        throw new Error(errorData.error || 'Error al actualizar el peso promedio');
                    });
                }
                return response.json();
            })
            .then(data => {
                //console.log('Respuesta del servidor:', data);
            })
            .catch(error => {
                console.error('Error al actualizar el peso promedio:', error);
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
            //console.log('Datos de la compra antes de enviar (JSON):', JSON.stringify(this.compra));
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
        async agregarArticulo() {
            try {
                const idProductoDeProductos = this.buscarRelacionProductoProductoDeProductos(this.ultimaCompra.idProveedor,this.nuevoDetalle.idProducto);
                const idBalanza = this.buscarRelacionProductoIdBalanza(this.ultimaCompra.idProveedor, this.nuevoDetalle.idProducto);
                const precioFinal = this.nuevoDetalle.precioUnitario * (this.ultimaCompra.iva === 0 ? 1.21 : 1) * (1 - this.ultimaCompra.descuento);
                const margen = await this.buscarRelacionProductoMargen(this.ultimaCompra.idProveedor, this.nuevoDetalle.idProducto);
                const divideX = await this.buscarDivideX(this.ultimaCompra.idProveedor, this.nuevoDetalle.idProducto);
                const pesoPromedioNuevo = await this.buscarUnidadesKilos(this.ultimaCompra.idProveedor, this.nuevoDetalle.idProducto, this.nuevoDetalle.unidades, this.nuevoDetalle.cantidad);
                const detalleCompraAgregada = {
                    idCompra: this.ultimaCompra.idCompra,
                    idProveedor: this.ultimaCompra.idProveedor,
                    idProducto: this.nuevoDetalle.idProducto,
                    unidades: this.nuevoDetalle.unidades,
                    cantidad: this.nuevoDetalle.cantidad,
                    precioUnitario: this.nuevoDetalle.precioUnitario,
                    precioFinal: precioFinal,
                    importe: this.nuevoDetalle.cantidad * this.nuevoDetalle.precioUnitario,
                    importeFinal: this.nuevoDetalle.cantidad * precioFinal,
                    precioBalanzaActual: this.buscarPrecio(idBalanza),
                    precioBalanzaSugerido: (margen * precioFinal) / divideX,
                    pesoPromedioActual: this.buscarPesoPromedio(idBalanza),
                    pesoPromedioNuevo: pesoPromedioNuevo,
                };
                //console.log(detalleCompraAgregada.pesoPromedioNuevo,'nuevo peso')
                //console.log(detalleCompraAgregada.pesoPromedioActual,'peso anterior')
                
                const response = await fetch(this.url + '/compra/agrega_detalle', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(detalleCompraAgregada)
                });
        
                if (!response.ok) {
                    const text = await response.text();
                    throw new Error(text);
                }
        
                const nuevaData = await response.json();

                this.detalleCompra.push({
                    idDetalle: nuevaData.data.idDetalle,
                    idCompra: nuevaData.data.idCompra,
                    idProveedor: nuevaData.data.idProveedor,
                    idProducto: nuevaData.data.idProducto,
                    nombreProducto: nuevaData.data.producto.descripcion,
                    unidades: nuevaData.data.unidades,
                    cantidad: nuevaData.data.cantidad,
                    precioUnitario: nuevaData.data.precioUnitario,
                    precioFinal: nuevaData.data.precioFinal,
                    importe: nuevaData.data.importe,
                    importeFinal: nuevaData.data.importeFinal
                });
                //console.log(idBalanza, idProductoDeProductos, this.ultimaCompra.idProveedor, detalleCompraAgregada.idProducto, pesoPromedioNuevo)
                this.actualizarPesoPromedio(idBalanza, idProductoDeProductos, this.ultimaCompra.idProveedor, detalleCompraAgregada.idProducto, pesoPromedioNuevo)
        
                // Blanqueo de los campos del formulario para agregar detalle de compra:
                this.nuevoDetalle.idProducto = null;
                this.nuevoDetalle.unidades = null;
                this.nuevoDetalle.cantidad = null;
                this.nuevoDetalle.precioUnitario = null;
        
            } catch (error) {
                console.error('Error al agregar artículo:', error);
            }
        },
        async agregarArticuloDespues(idCompraElegida, idProveedorElegido, ivaElegido, descuentoElegido) {
            try {
                const idProductoDeProductos = this.buscarRelacionProductoProductoDeProductos(idProveedorElegido,this.nuevoDetallePosterior.idProducto);
                const idBalanza = this.buscarRelacionProductoIdBalanza(idProveedorElegido, this.nuevoDetallePosterior.idProducto);
                const margen = await this.buscarRelacionProductoMargen(idProveedorElegido, this.nuevoDetallePosterior.idProducto);
                const divideX = await this.buscarDivideX(idProveedorElegido, this.nuevoDetallePosterior.idProducto);
                const precioUnitario = this.nuevoDetallePosterior.precioUnitario;
                const cantidad = this.nuevoDetallePosterior.cantidad;
                const precioFinal = precioUnitario * (ivaElegido === false ? 1.21 : 1) * (1 - descuentoElegido);
                const pesoPromedioNuevo = await this.buscarUnidadesKilos(idProveedorElegido, this.nuevoDetallePosterior.idProducto, this.nuevoDetallePosterior.unidades, this.nuevoDetallePosterior.cantidad);
                const nuevoDetallePosteriorJson = {
                    idCompra: idCompraElegida,
                    idProveedor: idProveedorElegido,
                    idProducto: this.nuevoDetallePosterior.idProducto,
                    unidades: this.nuevoDetallePosterior.unidades,
                    cantidad: cantidad,
                    precioUnitario: precioUnitario,
                    precioFinal: precioFinal,
                    importe: cantidad * precioUnitario,
                    importeFinal: cantidad * precioFinal,
                    precioBalanzaActual: this.buscarPrecio(idBalanza),
                    precioBalanzaSugerido: (margen * precioFinal) / divideX,
                    pesoPromedioActual: this.buscarPesoPromedio(idBalanza),
                    pesoPromedioNuevo: pesoPromedioNuevo
                };
                this.actualizarPesoPromedio(idBalanza, idProductoDeProductos, idProveedorElegido, this.nuevoDetallePosterior.idProducto, pesoPromedioNuevo)
        
                const response = await fetch(this.url + '/compra/agrega_detalle', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(nuevoDetallePosteriorJson)
                });
        
                if (!response.ok) {
                    const text = await response.text();
                    throw new Error(text);
                }
        
                const data = await response.json();
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
            } catch (error) {
                console.error('Error al agregar detalle:', error);
            }
        },
        finalizarCompra(){
            this.nuevaCompra = false,
            this.nuevaFacturaCompra = true,
            this.nuevoDetalleCompra = false,
            this.detalleCompra = [],
            this.compra = {
                idCompra: null,
                idProveedor: '',
                nombreProveedor: '',
                fechaCompra: new Date().toISOString().split('T')[0],  // Fecha actual
                numFactura: 0,
                iva: false,
                descuento: 0,
            },
            this.ultimaCompra = {
                idCompra: null,
                idProveedor: null,
                nombreProveedor: null,
                fechaCompra: null,
                numFactura: null,
                iva: null,
                descuento: null,
            },
            this.ultimaCompra.idCompra = null,
            this.ultimaCompra.idProveedor = null,
            this.ultimaCompra.nombreProveedor = null,
            this.ultimaCompra.fechaCompra = null,
            this.ultimaCompra.numFactura = null,
            this.ultimaCompra.iva = null,
            this.ultimaCompra.descuento = null
            //console.clear(),
            //this.logsDeVariables()
        },
        salir(){
            window.close();
        },
    },
    mounted() {
        this.cargarCompras();
        this.cargarProveedores();
        this.cargarBalanza();
        this.cargarRelacionProductos();
    },
});

app.mount('#app');