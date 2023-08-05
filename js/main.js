const app = Vue.createApp({
    data() {
        return {
            url: 'https://gacalsergio.pythonanywhere.com/',
            stocks: [],
            productos: [],
            motivos: [],
            motivo: '', 
            efectivo: [],
            proveedores: [],
            tipoProveedor: [],
            productoProveedor: [],
            motivoSeleccionado: '',
            fitroMotivo: '',
            fechaImporte: this.obtenerFechaActual(),
            fechaNuevoStock: this.obtenerFechaActual(),
            idProducto: '', 
            idProveedor: '', 
            montoImporte: '',
            observacion: '',
            nuevoProducto: {
                descripcion: '',
                observacion: '',
                imagen: '',
                reposicion: '',
                activo: true,
            },
            nuevoProveedor: {
                nombreProveedor: '',
                razonSocial: '',
                cuit: '',
                direccion: '',
                telefono: '',
                contacto: '',
                mail: '',
                web: '',
                tipoProveedor: '',
                observacion: '',
            },
            filtroFechaStock: '',
            filtroProveedor: "",
            nuevaFechaStock: '',
            fechaBorrarStock: '',
            productoModificable: {},
            proveedorModificable: {},
            nuevoMotivo: '',
            nuevoTipoProveedor: '',
            //REPORTE DE EFECTIVO CON FILTROS
            reporteEfectivoRegistros: [],
            reporteEfectivoRegistrosFiltrados: [],
            reporteEfectivoTotalRegistros: 0,
            reporteEfectivoSumaImporte: 0,
            reporteEfectivoFechasFilter: [],
            reporteEfectivoMotivosFilter: [],
            reporteEfectivoFechasDisponibles: [],
            reporteEfectivoMotivosDisponibles: [],
            //MOSTRAR/OCULTAR MENUES//
            verProveedores: false,
            listaProveedores: false,
            altaProveedores: false,
            listaTipoProveedor: false,
            altaTipoProveedor: false,
            verProductos: false,
            relacionProductoProveedor: false,
            altaProducto: false,
            listaProducto: false,
            verStock: false,
            verFiltroStock: false,
            verNuevoStock: false,
            verBorrarStock: false,
            verImportes: false,
            verCargaImportes: false,
            verListadoImportes: false,
            verMotivos: false,
            verNuevoMotivo: false,
        };
    },
    methods: {
        cargarStock() {
            fetch(this.url + 'stock')
                .then(response => response.json())
                .then(data => {
                    this.stocks = data;
                    //console.log('Stock cargado:', data);
                })
                .catch(error => {
                    console.error('Error al cargar el stock:', error);
                });
        },
        cargarProductos() {
            fetch(this.url + 'productos')
                .then(response => response.json())
                .then(data => {
                    this.productos = data;
                    //console.log('Productos cargados:', data);
                })
                .catch(error => {
                    console.error('Error al cargar los productos:', error);
                });
        },
        cargarProveedores() {
            fetch(this.url + 'proveedores')
                .then(response => response.json())
                .then(data => {
                    this.proveedores = data;
                    //console.log('Proveedores cargados: ', data)
                })
                .catch(error => {
                    console.error('Error al cargar los proveedores', error);
                });
        },
        cargarTiposProveedores() {
            fetch(this.url + 'tipoproveedor')
                .then(response => response.json())
                .then(data => {
                    this.tipoProveedor = data;
                    //console.log('Tipos de proveedores cargados: ', data)
                })
                .catch(error => {
                    console.error('Error al cargar los tipos de proveedor', error);
                });
        },
        cargarMotivos() {
            fetch(this.url + 'motivos')
                .then(response => response.json())
                .then(data => {
                    this.motivos = data;
                    //console.log('Motivos cargados: ', data)
                })
                .catch((error => {
                    console.error('Error al cargar los motivos', error);
                }));
        },
        cargarEfectivo() {
            fetch(this.url + 'efectivo')
                .then(response => response.json())
                .then(data => {
                    this.efectivo = data;
                    //console.log('Efectivos cargados: ', data)
                })
                .catch((error => {
                    console.error('Error al cargar los efectivos', error);
                }));
        },
        cargarProductoProveedor() {
            fetch(this.url + 'productoproveedor')
                .then(response => response.json())
                .then(data => {
                    this.productoProveedor = data;
                    //console.log('Relacion producto proveedor cargada: ', data)
                })
                .catch((error => {
                    console.error('Error al cargar la relación producto proveedor', error);
                }));
        },
        obtenerProveedores(idProducto) {
            return this.productoProveedor.filter(
                (producto) => producto.idProducto === idProducto
            );
        },
        obtenerIdProveedores(idProducto) {
            return this.productoProveedor
                .filter((item) => item.idProducto === idProducto)
                .map((item) => item.idProveedor);
        },
        obtenerNombreProveedor(idProveedor) {
            const proveedor = this.proveedores.find((prov) => prov.idProveedor === idProveedor);
            return proveedor ? proveedor.nombreProveedor : 'Proveedor no encontrado';
        },
        obtenerDescripcionProducto(idProducto) {
            const producto = this.productos.find(p => p.idProducto === idProducto);
            return producto ? producto.descripcion : '';
        },
        obtenerObservacionProducto(idProducto) {
            const producto = this.productos.find(p => p.idProducto === idProducto);
            return producto ? producto.observacion : '';
        },
        borrarRelacionProductoProveedor(idProducto, idProveedor) {
            fetch(this.url + `/productoproveedor/${idProducto}/${idProveedor}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            })
                .then(response => {
                    if (response.ok) {
                        console.log('Relación Producto-Proveedor borrada correctamente.');
                        this.cargarProductoProveedor()
                    } else {
                        console.error('Error al borrar la relación Producto-Proveedor:', response.status);
                    }
                })
                .catch(error => {
                    console.error('Error al borrar la relación Producto-Proveedor:', error);
                });
        },
        crearRelacionProductoProveedor(idProducto, idProveedor) {
            fetch(this.url + `/productoproveedor`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    idProducto: idProducto,
                    idProveedor: idProveedor,
                }),
            })
                .then(response => {
                    if (response.ok) {
                        return response.json();
                    } else {
                        throw new Error('Error al crear la relación Producto-Proveedor.');
                    }
                })
                .then(data => {
                    console.log('Relación Producto-Proveedor creada correctamente:', data);
                    this.cargarProductoProveedor()
                })
                .catch(error => {
                    console.error('Error al crear la relación Producto-Proveedor:', error);
                });
        },
        restarStock(stock) {
            const { idProducto, fecha } = stock;
            fetch(this.url + `stock/restar/${idProducto}/${fecha}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
            })
                .then(response => response.json())
                .then(data => {
                    console.log('Stock restado:', data);
                    const updatedStock = this.stocksFiltrados.find(
                        s => s.idProducto === data.idProducto && s.fecha === data.fecha
                    );
                    if (updatedStock) {
                        Object.assign(updatedStock, data);
                    }
                    Object.assign(stock, data);
                })
                .catch(error => {
                    console.error('Error al restar el stock:', error);
                });
        },
        sumarStock(stock) {
            const { idProducto, fecha } = stock;
            fetch(this.url + `stock/sumar/${idProducto}/${fecha}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
            })
                .then(response => response.json())
                .then(data => {
                    console.log('Stock sumado:', data);
                    const updatedStock = this.stocksFiltrados.find(
                        s => s.idProducto === data.idProducto && s.fecha === data.fecha
                    );
                    if (updatedStock) {
                        Object.assign(updatedStock, data);
                    }
                    Object.assign(stock, data);
                })
                .catch(error => {
                    console.error('Error al sumar el stock:', error);
                });
        },
        crearProducto() {
            fetch(this.url + 'productos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    descripcion: this.nuevoProducto.descripcion,
                    observacion: this.nuevoProducto.observacion,
                    imagen: this.nuevoProducto.imagen,
                    activo: this.nuevoProducto.activo,
                    reposicion: this.nuevoProducto.reposicion,
                }),
            })
                .then(response => response.json())
                .then(data => {
                    console.log('Producto creado:', data);
                    this.productos.push(data);
                    this.nuevoProducto = {
                        descripcion: '',
                        observacion: '',
                        imagen: '',
                        activo: '',
                        reposicion: '',
                    };
                })
                .catch(error => {
                    console.error('Error al crear el producto:', error);
                });
        },
        agregarProveedor() {
            fetch(this.url + 'proveedores', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    nombreProveedor: this.nuevoProveedor.nombreProveedor,
                    razonSocial: this.nuevoProveedor.razonSocial,
                    cuit: this.nuevoProveedor.cuit,
                    direccion: this.nuevoProveedor.direccion,
                    telefono: this.nuevoProveedor.telefono,
                    contacto: this.nuevoProveedor.contacto,
                    mail: this.nuevoProveedor.mail,
                    web: this.nuevoProveedor.web,
                    tipoProveedor: this.nuevoProveedor.tipoProveedor,
                    observacion: this.nuevoProveedor.observacion,
                }),
            })
                .then(response => response.json())
                .then(data => {
                    console.log('Proveedor agregado: ', data);
                    this.proveedores.push(data);
                    this.nuevoProveedor = {
                        nombreProveedor: '',
                        razonSocial: '',
                        cuit: '',
                        direccion: '',
                        telefono: '',
                        contacto: '',
                        mail: '',
                        web: '',
                        tipoProveedor: '',
                        observacion: '',
                    };
                })
                .catch(error => {
                    console.error('Error al crear al proveedor:', error);
                });
        },
        agregarTipoProveedor() {
            if (!this.nuevoTipoProveedor.trim()) {
                alert('Ingrese un nuevo motivo antes de confirmar.');
                return;
            }
            const nuevoTipoProveedordata = { tipoProv: this.nuevoTipoProveedor };
            fetch(this.url + 'tipoproveedor', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(nuevoTipoProveedordata),
            })
                .then(response => response.json())
                .then(data => {
                    console.log('Nuevo tipo agregado:', data);
                    this.tipoProveedor.push(data.tipoProv);
                    this.nuevoTipoProveedor = '';
                    this.listaTipoProveedor = true;
                    this.altaTipoProveedor = false;
                })
                .catch(error => {
                    console.error('Error al dar de alta el nuevo tipo:', error);
                });
        },
        borrarTipoProveedor(tipo) {
            fetch(this.url + `/tipoproveedor/${tipo}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Error al eliminar el tipo de proveedor');
                    }
                    console.log('Tipo proveedor eliminado:', tipo);
                    this.tipoProveedor = this.tipoProveedor.filter(tipoProveedor => tipoProveedor !== tipo);
                })
                .catch(error => {
                    console.error('Error al eliminar el tipo de proveedor:', error);
                });
        },
        nuevoMotivoEfectivo() {
            if (!this.nuevoMotivo.trim()) {
                alert('Ingrese un nuevo motivo antes de confirmar.');
                return;
            }
            const nuevoMotivoData = { motivo: this.nuevoMotivo };
            fetch(this.url + 'motivos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(nuevoMotivoData),
            })
                .then(response => response.json())
                .then(data => {
                    console.log('Nuevo motivo agregado:', data);
                    this.motivos.push(data.motivo)
                    this.nuevoMotivo = '';
                })
                .catch(error => {
                    console.error('Error al dar de alta el nuevo motivo:', error);
                });
        },
        borrarMotivo(motivo) {
            fetch(this.url + `/motivos/${motivo}`, {
              method: 'DELETE',
              headers: {
                'Content-Type': 'application/json',
              },
            })
            .then(response => {
              if (!response.ok) {
                throw new Error('Error al eliminar el motivo de importe');
              }
              console.log('Motivo de importe eliminado:', motivo);
              this.motivos = this.motivos.filter(m => m !== motivo);
            })
            .catch(error => {
              console.error('Error al eliminar el motivo de importe:', error);
            });
        },
        sumarStock2(stock, cantidad) {
            const { idProducto, fecha } = stock;
            fetch(this.url + `stock/sumar/${idProducto}/${fecha}/${cantidad}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
            })
                .then(response => response.json())
                .then(data => {
                    console.log('Stock sumado:', data);
                    const updatedStock = this.stocksFiltrados.find(
                        s => s.idProducto === data.idProducto && s.fecha === data.fecha
                    );
                    if (updatedStock) {
                        Object.assign(updatedStock, data);
                    }
                    Object.assign(stock, data);
                })
                .catch(error => {
                    console.error('Error al sumar el stock:', error);
                });
        },
        mostrarOcultarProveedores() {
            this.verProveedores = !this.verProveedores
        },
        mostrarOcultarListaProveedores() {
            this.listaProveedores = !this.listaProveedores
        },
        mostrarOcultarAltaProveedores() {
            this.altaProveedores = !this.altaProveedores
        },
        mostrarOcultarlistaTipoProveedor() {
            this.listaTipoProveedor = !this.listaTipoProveedor
        },
        mostrarOcultarAltaTipoProveedor() {
            this.altaTipoProveedor = !this.altaTipoProveedor
        },
        mostrarOcultarAltaProducto() {
            this.altaProducto = !this.altaProducto
        },
        mostrarOcultarRelacionProductoProveedor(){
            this.relacionProductoProveedor = ! this.relacionProductoProveedor
        },
        mostrarOcultarProductos() {
            this.verProductos = !this.verProductos
        },
        mostrarOcultarListaProductos() {
            this.listaProducto = !this.listaProducto
        },
        mostrarOcultarStock() {
            this.verStock = !this.verStock
        },
        mostrarOcultarFiltroStock() {
            this.verFiltroStock = !this.verFiltroStock
        },
        mostrarOcultarNuevoStock() {
            this.verNuevoStock = !this.verNuevoStock
        },
        mostrarOcultarBorrarStock() {
            this.verBorrarStock = !this.verBorrarStock
            fechaUnicas = this.fechasStock
        },
        mostrarOcularCargaImportes() {
            this.verCargaImportes = !this.verCargaImportes
        },
        mostrarOcultarListadoImportes() {
            this.verListadoImportes = !this.verListadoImportes
        },
        mostrarOcultarImportes() {
            this.verImportes = !this.verImportes
        },
        mostrarOcultarMotivos() {
            this.verMotivos = !this.verMotivos
        },
        mostrarOcultarNuevoMotivo() {
            this.verNuevoMotivo = !this.verNuevoMotivo
        },
        borrarProveedor(id) {
            fetch(this.url + `proveedores/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            })
            .then(response => response.json())
            .then(data => {
                console.log('Proveedor eliminado: ',data);
                this.proveedores = this.proveedores.filter(proveedor => proveedor.idProveedor != id)
            })
            .catch(error => {
                console.error('Error al eliminar proveedor:', error);
            });
        },
        borrarProducto(id) {
            fetch(this.url + `/productos/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            })
                .then(response => response.json())
                .then(data => {
                    console.log('Producto eliminado:', data);
                    this.productos = this.productos.filter(producto => producto.idProducto !== id); // no probamos esta linea
                })
                .catch(error => {
                    console.error('Error al eliminar el producto:', error);
                });
        },
        noBorrarTipoProveedorRelacionado(tipo) {
            return this.proveedores.some(proveedor => proveedor.tipoProveedor === tipo);
        },
        noBorrarMotivoEfectivoRelacionado(motivo) {
            return this.efectivo.some(efectivo => efectivo.motivo === motivo);
        },
        noPuedoBorrarProductoConStock(idProducto) {
            return this.stocks.some((stock) => stock.idProducto === idProducto);
        },
        noPuedoBorrarProveedoresConProductos(idProveedor) {
            const tieneProductosAsociados = this.productoProveedor.some((registro) => registro.idProveedor === idProveedor);
            return tieneProductosAsociados;
        },
        obtenerFechaActual() {
            const today = new Date();
            const year = today.getFullYear();
            let month = today.getMonth() + 1;
            let day = today.getDate();
            month = month < 10 ? '0' + month : month;
            day = day < 10 ? '0' + day : day;
            return `${year}-${month}-${day}`;
        },
        editarProveedor(proveedorId){
            this.proveedorModificable[proveedorId] = true;
            console.log(this.proveedorModificable)
        },
        cancelarEdicionProveedor(proveedorId){
            this.proveedorModificable[proveedorId] = false;
            console.log(this.proveedorModificable)
        },
        confirmarEdicionProveedor(proveedor) {
            const ruta = this.url + 'proveedores/' + proveedor.idProveedor;
            const data = {
                nombreProveedor: proveedor.nombreProveedor,
                razonSocial: proveedor.razonSocial,
                cuit: proveedor.cuit,
                direccion: proveedor.direccion,
                telefono: proveedor.telefono,
                contacto: proveedor.contacto,
                mail: proveedor.mail,
                web: proveedor.web,
                tipoProveedor: proveedor.tipoProveedor,
                observacion: proveedor.observacion,
            };
            fetch( ruta, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })
            .then((response)=> response.json())
            .then((proveedorActualizado) => {
                console.log('Proveedor actualizado', proveedorActualizado);
                this.proveedorModificable[proveedor.idProveedor] = false;
            })
            .catch((error) => {
                console.error('Error al actualizar al proveedor:', error);
            });
        },
        iniciarEdicion(productoId) {
            this.productoModificable[productoId] = true;
            console.log(this.productoModificable)
        },
        confirmarEdicion(producto) {
            const data = {
                descripcion: producto.descripcion,
                observacion: producto.observacion,
                imagen: producto.imagen,
                activo: producto.activo,
                reposicion: producto.reposicion,
            };
            fetch(this.url + `/productos/${producto.idProducto}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })
                .then((response) => response.json())
                .then((productoActualizado) => {
                    console.log('Producto actualizado:', productoActualizado);
                    this.productoModificable = {};
                })
                .catch((error) => {
                    console.error('Error al actualizar el producto:', error);
                });
        },
        cancelarEdicion(productoId) {
            this.productoModificable[productoId] = false;
        },
        crearNuevoStock() {
            fetch(this.url + 'stock/nuevoStock/' + this.fechaNuevoStock)
                .then(response => response.json())
                .then(data => {
                    console.log('Stock creado: ', data)
                    this.cargarStock();
                })
                .catch(error => {
                    console.error('Error al crear nuevo stock:', error);
                });
        },
        borrarStock() {
            if (!this.fechaBorrarStock) {
                alert('Seleccione una fecha antes de borrar el stock.');
                return;
            }
            fetch(this.url + 'stock/borrarStock/' + this.fechaBorrarStock)
                .then(response => response.json())
                .then(data => {
                    this.cargarStock();
                    fechaBorrarStock = '';
                })
                .catch(error => {
                    console.error('Error al borrar stock:', error);
                });
        },
        generaReporteEfectivo() {
            fetch(this.url +  'efectivo')
                .then(response => response.json())
                .then(data => {
                    this.reporteEfectivoRegistros = data;
                    this.reporteEfectivoTotalRegistros = data.length;
                    this.reporteEfectivoSumaImporte = data.reduce((acc, registro) => acc + parseFloat(registro.importe), 0);
                    this.reporteEfectivoFechasDisponibles = Array.from(new Set(data.map(registro => registro.fecha)));
                    this.reporteEfectivoMotivosDisponibles = Array.from(new Set(data.map(registro => registro.motivo)));
                    this.reporteEfectivoAplicarFiltro();
                })
                .catch(error => console.error('Error fetching data:', error));
        },
        guardarImportes() {
            const motivo = this.motivoSeleccionado;
            const fecha = this.fechaImporte;
            const importe = this.montoImporte;
            const observacion = this.observacion
            const data = {
                fecha,
                motivo,
                importe,
                observacion,
            };
            console.log(data)
            fetch(this.url + 'efectivo', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            })
                .then((response) => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then((nuevoEfectivo) => {
                    this.efectivo.push(nuevoEfectivo);
                    this.montoImporte = '';
                    this.cargarEfectivo();
                    this.generaReporteEfectivo();
                })
                .catch((error) => {
                    console.error('Error al guardar el importe:', error);
                });
        },
        reporteEfectivoAplicarFiltro() {
            const fechasFilter = this.reporteEfectivoFechasFilter;
            const motivosFilter = this.reporteEfectivoMotivosFilter.map(motivo => motivo.toLowerCase());
            this.reporteEfectivoRegistrosFiltrados = this.reporteEfectivoRegistros.filter(registro => {
                return (
                    (!fechasFilter.length || fechasFilter.includes(registro.fecha)) &&
                    (!motivosFilter.length || motivosFilter.includes(registro.motivo.toLowerCase()))
                );
            });
            this.reporteEfectivoTotalRegistros = this.reporteEfectivoRegistrosFiltrados.length;
            this.reporteEfectivoSumaImporte = this.reporteEfectivoRegistrosFiltrados.reduce((acc, registro) => acc + parseFloat(registro.importe), 0);
        },
        formatoMoneda(value) {
            return value.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
                useGrouping: true,
                grouping: ".",
                decimal: ",",
            });
        },


    },
    created() {
        this.cargarProveedores();
        this.cargarStock();
        this.cargarProductos();
        this.cargarMotivos();
        this.cargarEfectivo();
        this.cargarTiposProveedores();
        this.cargarProductoProveedor();
    },
    computed: {
        fechasStock() {
            const fechasUnicas = [...new Set(this.stocks.map(stock => stock.fecha))];
            if (this.nuevaFechaStock) {
                fechasUnicas.push(this.nuevaFechaStock);
            }
            console.log("fechas unicas " + fechasUnicas.sort());
            return fechasUnicas.sort();
        },
        stocksFiltrados() {
            if (this.filtroFechaStock === 'todos') {
                return this.stocks;
            } else {
                return this.stocks.filter(stock => stock.fecha === this.filtroFechaStock);
            }
        },
        fechasOrdenadasRporteEfectivo() {
            return this.reporteEfectivoFechasDisponibles.sort();
        },
        stocksFiltradosPorProveedor() {
            if (this.filtroProveedor) {
              return this.stocks.filter((stock) => {
                return this.productoProveedor.some(
                  (producto) =>
                    producto.idProducto === stock.idProducto &&
                    producto.idProveedor === Number(this.filtroProveedor)
                );
              });
            } else {
              return this.stocks;
            }
        },
    },
    mounted() {
        this.generaReporteEfectivo();
    }
});


app.mount('#app');
