/* Completa */

SELECT 
    s.fecha AS Fecha,
    s.idProducto AS id,
    p.descripcion AS Descripcion,
    up.fechaCompra AS 'Fecha Cotizacion',
    up.precioFinal AS 'Precio Final',
    up.pesoPromedioNuevo AS 'Peso Promedio',
    s.cantidad AS Cantidad,
    ROUND(CASE 
        WHEN up.pesoPromedioNuevo = 0 THEN (up.precioFinal * s.cantidad)
        ELSE (up.precioFinal * up.pesoPromedioNuevo * s.cantidad)
    END, 2) AS Valuacion,
    pxp.medicion AS Medicion,
    pxp.divideX AS 'Divide X',
    ROUND(CASE 
        WHEN pxp.medicion = 'unidad' THEN up.precioFinal * s.cantidad
        WHEN pxp.medicion = 'kilo' THEN up.precioFinal * up.pesoPromedioNuevo * s.cantidad
        ELSE 0
    END, 2) AS Valuacion2
FROM 
    stock s
JOIN 
    producto p ON s.idProducto = p.idProducto
JOIN 
    ultimoPrecio up ON s.idProducto = up.idProducto
JOIN 
    (SELECT 
         idProducto, 
         MAX(fechaCompra) AS fechaCotizacion
     FROM 
         ultimoPrecio
     GROUP BY 
         idProducto) sub ON up.idProducto = sub.idProducto 
                         AND up.fechaCompra = sub.fechaCotizacion
LEFT JOIN 
    productos_x_proveedor pxp ON pxp.idProdXProv = up.idProdXProv
                               AND pxp.idProveedor = up.idProveedor
WHERE 
    s.fecha = '2024-11-24'
ORDER BY 
    s.idProducto;


/* Compacta  */

SELECT 
    s.fecha AS Fecha,
    s.idProducto AS id,
    p.descripcion AS Descripcion,
    up.fechaCompra AS 'Fecha Cotizacion',
    up.precioFinal AS 'Precio Final',
    up.pesoPromedioNuevo AS 'Peso Promedio',
    s.cantidad AS Cantidad,
    ROUND(CASE 
        WHEN pxp.medicion = 'unidad' THEN up.precioFinal * s.cantidad
        WHEN pxp.medicion = 'kilo' THEN up.precioFinal * up.pesoPromedioNuevo * s.cantidad
        ELSE 0
    END, 2) AS Valuacion
FROM 
    stock s
JOIN 
    producto p ON s.idProducto = p.idProducto
JOIN 
    ultimoPrecio up ON s.idProducto = up.idProducto
JOIN 
    (SELECT 
         idProducto, 
         MAX(fechaCompra) AS fechaCotizacion
     FROM 
         ultimoPrecio
     GROUP BY 
         idProducto) sub ON up.idProducto = sub.idProducto 
                         AND up.fechaCompra = sub.fechaCotizacion
LEFT JOIN 
    productos_x_proveedor pxp ON pxp.idProdXProv = up.idProdXProv
                               AND pxp.idProveedor = up.idProveedor
WHERE 
    s.fecha = (SELECT MAX(fecha) FROM stock)
ORDER BY 
    s.idProducto;
