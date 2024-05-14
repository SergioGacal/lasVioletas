# Las Violetas

## Descripción
Aplicación desarrollada para almacenar las cantidades de los productos en stock del negocio 'Las Violetas'.
Cuenta con módulos de productos, proveedores, stock y permite registrar los ingresos/gastos.

## Agosto 2023.
En una primer versión se disponibiliza una interfase que permite almacenar el stock de productos por fecha. 
Para facilitar el ingreso cuenta con un filtro por proveedor. 
Para ingresar las cantidades cuenta con botones '+' y '-' para digitar en el celular hasta completar la cantidad deseada.
Asimismo se implementó una consulta que nos permite conocer las cantidades a reponer calculando por diferencia hasta completar el stock.

## Mayo 2024
Se está desarrollando administrador financiero para contar con un calendario de pagos en cuenta corriente. Con esto estaremos agregando una herramienta que permita visiulizar los pagos pendientes dentro de la aplicación integrando en una próxima versión el módulo de compras y proveedores.<br>
Se genera la primer implementación en el backend del administrador financiero. Esta contempla gastos y pagos con sus endpoints de consulta, alta, baja y eliminación como también tablas relacionadas de tipos de gasto y medios de pago.
<br>
El usuario identificó que los proveedores sin productos asociados aparecian en la pantalla de carga de stock (en el combo de selección de proveedor). Se corrigió generando una nueva varieble para para mostrar en el filtro de esta pantalla solo los proveedores que tienen productos en stock.

## Tecnologías Utilizadas
- **Vue.js**: Framework de JavaScript utilizado para construir la interfaz de usuario dinámica.
- **HTML/CSS**: Lenguajes de marcado y estilos utilizados para estructurar y diseñar la interfaz de usuario.
- **JavaScript**: Lenguaje de programación utilizado para la lógica del cliente.
- **MySQL**: Sistema de gestión de bases de datos relacional utilizado para almacenar los datos del proyecto.
- **PythonAnywhere**: Plataforma de alojamiento web utilizada para ejecutar el backend del proyecto.
- **Flask**: Framework de Python utilizado para crear el backend del proyecto y proporcionar una API RESTful.
- **Git**: Sistema de control de versiones utilizado para gestionar el código del proyecto.
- **GitHub**: Plataforma de alojamiento de código utilizada para almacenar y compartir el repositorio del proyecto.

