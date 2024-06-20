const app = Vue.createApp({
    data() {
        return {
            url: 'https://gacalsergio.pythonanywhere.com/',
            gastos: [], // traigo todos los gastos
            motivosGasto: [], // traigo motivos de los gastos
            pagos: [], // traigo los pagos
            filtroPagos: 0, // 0 para ocultar pagos, 1 para mostrar pagos
            filtroPagado: 0, // 2 para todos, 1 para pagados, 0 para no pagados
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
}
});

app.mount('#app');
