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

## Julio 2024
Se finaliza la implementación de Administrador Financiero. El misom permite el registro (CRUD) de gastos, a estos se les pueden aplicar pagos parciales/totales. Permite clasificación por tipo y cuenta con filtros por fecha/tipo. Asimismo cada gasto puede desplegar los pagos asociados.

## Agosto 2024
Se comienza a desarrollar una nueva versión que permitirá contar con un módulo de compras que actualizará stock, gastos, calculará precios de venta y permitirá contar con una valuación de stock.
El enfoque que permitirá agregar soluciones parciales será por pequeños módulos desde back a front para probar funcionalidades en paralelo y realizar los ajustes necesarios para una mejor usabilidad.
- 19/8 se implementa con funcionalidad completa la consulta de balanza. La misma tiene un CRUD y cuenta con filtro de novedades y productos concertados. 
- 22/8 se implementa la entidad productos_x_proveedor que tiene los productos comercializados por cada proveedor así como sus principales características. Esta tabla se usa en conjunto con los formularios de compras/stock.
- 14/9 se implementa la versión preliminar del formulario de compras, sus tablas relacionadas y métodos.
- 19/9 se agrega tabla de relación para vincular balanza, productos, proveedores que permite calcular los márgenes, movimientos de stock y mejorar la valuación.

## Tecnologías Utilizadas
- **Vue.js**: Framework de JavaScript utilizado para construir la interfaz de usuario dinámica.
- **HTML/CSS**: Lenguajes de marcado y estilos utilizados para estructurar y diseñar la interfaz de usuario.
- **JavaScript**: Lenguaje de programación utilizado para la lógica del cliente.
- **MySQL**: Sistema de gestión de bases de datos relacional utilizado para almacenar los datos del proyecto.
- **PythonAnywhere**: Plataforma de alojamiento web utilizada para ejecutar el backend del proyecto.
- **Flask**: Framework de Python utilizado para crear el backend del proyecto y proporcionar una API RESTful.
- **Git**: Sistema de control de versiones utilizado para gestionar el código del proyecto.
- **GitHub**: Plataforma de alojamiento de código utilizada para almacenar y compartir el repositorio del proyecto.

