const app = Vue.createApp({
    data() {
        return {
            url: 'https://gacalsergio.pythonanywhere.com/',
            //url: 'http://127.0.0.1:5000/',
            gastos: [], // traigo todos los gastos
            motivosGasto: [], // traigo motivos de los gastos
            pagos: [], // traigo los pagos
            filtroPagos: 0, // 0 para ocultar pagos, 1 para mostrar pagos
            filtroPagado: 0, // 2 para todos, 1 para pagados, 0 para no pagados
            filtroMotivo: '', // filtro por motivo
            filtroFechaDesde: '', // filtro por fecha desde
            filtroFechaHasta: '', // filtro por fecha hasta
            mostrarFormulario: false, // mostrar/ocultar formulario
            nuevoGasto: { // datos del nuevo gasto
                motivo: '',
                importe: '',
                fecha_gasto: '',
                observaciones: ''
            },
            showPagoModal: false, // controlar el modal de pago
            pagoData: { // datos del nuevo pago
                idGasto: '',
                monto_pago: '',
                fecha_pago: '',
                idMedioPago: '',
                observaciones: ''
            },
            showPagoTotalModal: false, // controlar el modal de pago total
            pagoTotalData: { // datos del pago total
                idGasto: '',
                fecha_pago: '',
                idMedioPago: '',
                observaciones: ''
            }
        };
    },
    created() {
        this.cargarGastos();
        this.cargarPagos();
    },
    methods: {
        cargarGastos() {
            fetch(this.url + 'gasto/motivo_gasto')
                .then(response => response.json())
                .then(data => {
                    this.motivosGasto = data;
                    fetch(this.url + 'gasto')
                        .then(response => response.json())
                        .then(gastos => {
                            if (gastos.length > 0) {
                                let fechas = gastos.map(gasto => new Date(gasto.fecha_gasto));
                                this.filtroFechaDesde = this.formatearFecha(new Date(Math.min(...fechas)));
                            }
                            this.gastos = gastos.map(gasto => {
                                const motivo = this.motivosGasto.find(m => m.idMotivo === gasto.idMotivo);
                                return {
                                    ...gasto,
                                    motivoDescripcion: motivo ? motivo.descripcion : 'Sin descripción'
                                };
                            });
                        })
                        .catch(error => {
                            console.error('Error al cargar los gastos:', error);
                        });
                })
                .catch(error => {
                    console.error('Error al cargar los motivos de gastos:', error);
                });
        },
        cargarPagos() {
            fetch(this.url + 'gasto/pago')
                .then(response => response.json())
                .then(data => {
                    this.pagos = data;
                })
                .catch(error => {
                    console.error('Error al cargar los pagos', error);
                });
        },
        resetFiltros() {
            this.filtroPagos = 0;
            this.filtroPagado = 0;
            this.filtroMotivo = '';
            this.filtroFechaDesde = ''; // Limpiar filtroFechaDesde
            this.filtroFechaHasta = ''; // Limpiar filtroFechaHasta
        },
        formatearFecha(fecha) {
            let d = new Date(fecha),
                month = '' + (d.getMonth() + 1),
                day = '' + d.getDate(),
                year = d.getFullYear();

            if (month.length < 2) 
                month = '0' + month;
            if (day.length < 2) 
                day = '0' + day;

            return [year, month, day].join('-');
        },
        crearGasto() {
            fetch(this.url + 'gasto/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    idMotivo: this.nuevoGasto.motivo,
                    importe: this.nuevoGasto.importe,
                    fecha_gasto: this.nuevoGasto.fecha_gasto,
                    observaciones: this.nuevoGasto.observaciones || ''
                })
            })
            .then(response => response.json())
            .then(data => {
                this.cargarGastos(); // Recargar la lista de gastos
                this.mostrarFormulario = false; // Ocultar el formulario
                this.nuevoGasto = { motivo: '', importe: '', fecha_gasto: '', observaciones: '' }; // Limpiar el formulario
            })
            .catch(error => {
                console.error('Error al crear el gasto:', error);
            });
        },
        openPagoModal(idGasto) {
            this.pagoData.idGasto = idGasto;
            this.pagoData.monto_pago = '';
            this.pagoData.fecha_pago = '';
            this.pagoData.idMedioPago = '';
            this.pagoData.observaciones = '';
            this.showPagoModal = true;
        },
        closePagoModal() {
            this.showPagoModal = false;
        },
        crearPago() {
            fetch(`${this.url}gasto/pago/pagar/${this.pagoData.idGasto}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(this.pagoData)
            })
            .then(response => response.json())
            .then(data => {
                if (data.message) {
                    this.cargarGastos();
                    this.cargarPagos();
                    alert(data.message);
                    this.closePagoModal();
                } else if (data.error) {
                    alert(data.error);
                }
            })
            .catch(error => {
                console.error('Error al ingresar el pago:', error);
            });
        },
        openPagoTotalModal(idGasto) {
            this.pagoTotalData.idGasto = idGasto;
            this.pagoTotalData.fecha_pago = '';
            this.pagoTotalData.idMedioPago = '';
            this.pagoTotalData.observaciones = '';
            this.showPagoTotalModal = true;
        },
        closePagoTotalModal() {
            this.showPagoTotalModal = false;
        },
        realizarPagoTotal() {
            fetch(`${this.url}gasto/pago/pago_total/${this.pagoTotalData.idGasto}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(this.pagoTotalData)
            })
            .then(response => response.json())
            .then(data => {
                if (data.message) {
                    this.cargarGastos();
                    this.cargarPagos();
                    alert(data.message);
                    this.closePagoTotalModal();
                } else if (data.error) {
                    alert(data.error);
                }
            })
            .catch(error => {
                console.error('Error al realizar el pago total:', error);
            });
        }
    },
    computed: {
        filtrarGastos() {
            return this.gastos.filter(gasto => {
                const motivo = !this.filtroMotivo || gasto.motivoDescripcion === this.filtroMotivo;
                const fechaDesde = !this.filtroFechaDesde || new Date(gasto.fecha_gasto) >= new Date(this.filtroFechaDesde);
                const fechaHasta = !this.filtroFechaHasta || new Date(gasto.fecha_gasto) <= new Date(this.filtroFechaHasta);
                return motivo && fechaDesde && fechaHasta;
            });
        }
    }
});

app.mount('#app');
