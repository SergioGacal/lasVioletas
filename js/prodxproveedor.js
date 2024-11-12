const app = Vue.createApp({
    data() {
        return {
            url: 'https://gacalsergio.pythonanywhere.com',
            productos: [],
            proveedores: [],
            pxpTotales: [],
            showList: false,
            showAlta: false,
            showTotal: false,
            formData: {
                idProveedor: '',
                idProdXProv: '',
                descripcion: '',
                medicion: '',
                divideX: 1
            }
        };
    },
    methods: {
        fetchProductos() {
            axios.get(`${this.url}/compras/productoxproveedor`)
                .then(response => {
                    this.productos = response.data;
                })
                .catch(error => {
                    console.error("Error fetching productos:", error);
                });
        },
        fetchProveedores() {
            axios.get(`${this.url}/proveedores`)
                .then(response => {
                    this.proveedores = response.data;
                })
                .catch(error => {
                    console.error("Error fetching proveedores:", error);
                });
        },
        fetchTotales(){
            axios.get(`${this.url}/compras/productoxproveedor/consulta`)
                .then(response => {
                    this.pxpTotales = response.data;
                })
                .catch(error => {
                    console.error("Error fetching totales:", error);
                });
        },
        crearRelacionPxP() {
            const data = {
                idProveedor: this.formData.idProveedor,
                idProdXProv: this.formData.idProdXProv,
                descripcion: this.formData.descripcion,
                medicion: this.formData.medicion,
                divideX: this.formData.divideX
            };
        
            console.log('Datos enviados:', data);  // Agrega esto para revisar los datos
        
            fetch(this.url + '/compras/productoxproveedor', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error en la solicitud al servidor');
                }
                return response.json();
            })
            .then(data => {
                console.log('Producto agregado:', data);
                this.formData = {
                    idProveedor: '',
                    idProdXProv: '',
                    descripcion: '',
                    medicion: 'kilo',
                    divideX: 1
                };
                this.fetchProductos();  // Actualiza la lista de productos
            })
            .catch(error => {
                console.error("Error al agregar producto:", error);
                if (error.response) {
                    console.error("Detalles del error:", error.response.data);
                }
            });
        },
        salir(){
            window.close();
        },
        


        toggleList() {this.showList = !this.showList;},
        toggleAlta() {this.showAlta = !this.showAlta},
        toggleTotal() {this.showTotal = !this.showTotal},
    },
    computed: {
        productosConProveedores() {
            return this.productos.map(producto => {
                const proveedor = this.proveedores.find(p => p.idProveedor === producto.idProveedor);
                return {
                    ...producto,
                    nombreProveedor: proveedor ? proveedor.nombreProveedor : 'Desconocido'
                };
            });
        }
    },
    mounted() {
        this.fetchProductos();
        this.fetchProveedores();
        this.fetchTotales();
    }
});
app.mount('#app');
