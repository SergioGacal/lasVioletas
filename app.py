from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import text, func
from flask_marshmallow import Marshmallow
from marshmallow import Schema, fields
from datetime import datetime
import logging
from logging.handlers import RotatingFileHandler
from sqlalchemy.exc import IntegrityError
from decimal import Decimal
import requests

app=Flask(__name__)
CORS(app)

handler = RotatingFileHandler('error.log', maxBytes=10000, backupCount=1)
handler.setLevel(logging.ERROR)
app.logger.addHandler(handler)

app.config['SQLALCHEMY_DATABASE_URI']='mysql+pymysql://root:root@localhost/lasVioletas' # acá ruta de pythonanywhere con usuario y clave. Cambiar nombre bd al finalizar pruebas.
app.config['SQLALCHEMY_TRACK_MODIFICATIONS']=False
db=SQLAlchemy(app)
ma=Marshmallow(app)

class Producto(db.Model):
    idProducto=db.Column(db.Integer, primary_key=True)
    descripcion=db.Column(db.String(100))
    observacion=db.Column(db.String(100))
    imagen=db.Column(db.String(500))
    activo = db.Column(db.Boolean)
    reposicion = db.Column(db.Integer)
    stocks = db.relationship('Stock', backref='producto')  # Relación con la tabla Stock
    def __init__(self, idProducto,descripcion,observacion,imagen,activo,reposicion):
        self.idProducto=idProducto
        self.descripcion=descripcion
        self.observacion=observacion
        self.imagen=imagen
        self.activo=activo
        self.reposicion=reposicion

class Stock(db.Model):
    fecha = db.Column(db.Date, primary_key=True)
    idProducto = db.Column(db.Integer,  db.ForeignKey('producto.idProducto'),primary_key=True)  # Clave externa (FK)
    cantidad=db.Column(db.Float)
    cantidad2=db.Column(db.Integer)
    def __init__(self,fecha,idProducto,cantidad,cantidad2):
        self.fecha=fecha
        self.idProducto=idProducto
        self.cantidad=cantidad
        self.cantidad2=cantidad2

class Efectivo(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    fecha = db.Column(db.Date)
    motivo_id = db.Column(db.String(100), db.ForeignKey('motivos_efectivo.motivo'))
    observacion = db.Column(db.String(500))
    importe = db.Column(db.Numeric(10, 2))
    motivo = db.relationship('MotivosEfectivo', backref='efectivos')
    def __init__(self,fecha,motivo,observacion,importe):
        self.fecha=fecha
        self.motivo=motivo
        self.observacion=observacion
        self.importe=importe

class MotivosEfectivo(db.Model):
    motivo = db.Column(db.String(100), primary_key=True)
    def __init__(self,motivo):
        self.motivo=motivo

class TipoProveedor(db.Model):
    tipoProv = db.Column(db.String(100), primary_key=True)
    def __init__(self,tipoProv):
        self.tipoProv=tipoProv

class Proveedor(db.Model):
    idProveedor = db.Column(db.Integer, primary_key=True, autoincrement=True)
    nombreProveedor = db.Column(db.String(500), nullable=False)
    razonSocial = db.Column(db.String(500))
    cuit = db.Column(db.String(11), nullable=False)
    direccion = db.Column(db.String(500))
    telefono = db.Column(db.String(50))
    contacto = db.Column(db.String(500))
    mail = db.Column(db.String(500))
    web = db.Column(db.String(500))
    tipoProveedor = db.Column(db.String(100), db.ForeignKey('tipo_proveedor.tipoProv'), nullable=False)
    observacion = db.Column(db.String(500))
    tipo = db.relationship('TipoProveedor', backref='proveedores')
    def __init__(self,nombreProveedor,razonSocial,cuit,direccion,telefono,contacto,mail,web,tipoProveedor,observacion):
        self.nombreProveedor=nombreProveedor
        self.razonSocial=razonSocial
        self.cuit=cuit
        self.direccion=direccion
        self.telefono=telefono
        self.contacto=contacto
        self.mail=mail
        self.web=web
        self.tipoProveedor=tipoProveedor
        self.observacion=observacion

class ProductoProveedor(db.Model):
    idProducto = db.Column(db.Integer, db.ForeignKey('producto.idProducto'), primary_key=True)
    idProveedor = db.Column(db.Integer, db.ForeignKey('proveedor.idProveedor'), primary_key=True)
    producto = db.relationship('Producto', backref='productos_proveedores')
    proveedor = db.relationship('Proveedor', backref='proveedores_productos')
    def __init__(self, idProducto, idProveedor):
        self.idProducto = idProducto
        self.idProveedor = idProveedor

class MedioPago(db.Model):
    idMedioPago = db.Column(db.Integer, primary_key=True)
    descripcion = db.Column(db.String(100), nullable=True)

class MotivoGasto(db.Model):
    idMotivo = db.Column(db.Integer, primary_key=True)
    descripcion = db.Column(db.String(100), nullable=True)

class Gasto(db.Model):
    idGasto = db.Column(db.Integer, primary_key=True)
    idMotivo = db.Column(db.Integer, db.ForeignKey('motivo_gasto.idMotivo'))
    importe = db.Column(db.Numeric(10, 2), nullable=True)
    fecha_gasto = db.Column(db.Date, nullable=True)
    fecha_pago = db.Column(db.Date, nullable=True)
    pagado = db.Column(db.Boolean, nullable=True)
    saldo = db.Column(db.Numeric(10, 2), nullable=True)
    observaciones = db.Column(db.String(255), nullable=True)
    motivo = db.relationship('MotivoGasto', backref=db.backref('gastos', lazy=True))

class Pago(db.Model):
    idPago = db.Column(db.Integer, primary_key=True)
    idGasto = db.Column(db.Integer, db.ForeignKey('gasto.idGasto'))
    monto_pago = db.Column(db.Numeric(10, 2), nullable=True)
    fecha_pago = db.Column(db.Date, nullable=True)
    idMedioPago = db.Column(db.Integer, db.ForeignKey('medio_pago.idMedioPago'))
    observaciones = db.Column(db.String(255), nullable=True)

    gasto = db.relationship('Gasto', backref=db.backref('pagos', lazy=True))
    medio_pago = db.relationship('MedioPago', backref=db.backref('pagos', lazy=True))

class Balanza(db.Model):
    idBalanza = db.Column(db.Integer, primary_key=True, autoincrement=False)
    nombre1 = db.Column(db.String(50), nullable=True)
    nombre2 = db.Column(db.String(50), nullable=True)
    precio = db.Column(db.Integer, nullable=False)
    concertado = db.Column(db.Boolean, default=False)
    def __init__(self, idBalanza, precio, nombre1=None, nombre2=None, concertado=False):
        self.idBalanza = idBalanza
        self.nombre1 = nombre1
        self.nombre2 = nombre2
        self.precio = precio
        self.concertado = concertado

class NovedadBalanza(db.Model):
    idNovedadBalanza = db.Column(db.Integer, primary_key=True, autoincrement=False)
    def __init__(self,idNovedadBalanza):
        self.idNovedadBalanza = idNovedadBalanza

class Productos_x_proveedor(db.Model):
    idProveedor = db.Column(db.Integer, db.ForeignKey('proveedor.idProveedor'), primary_key=True)
    idProdXProv = db.Column(db.Integer, primary_key=True)
    descripcion = db.Column(db.String(100))
    medicion = db.Column(db.String(100),nullable=False)
    divideX = db.Column(db.Numeric(10, 2),nullable=False)
    OPCIONES_MEDICION = {'kilo', 'unidad'}
    def __init__(self,idProveedor,idProdXProv,descripcion,medicion, divideX):
        if medicion not in self.OPCIONES_MEDICION:
            raise ValueError(f"Medición inválida: {medicion}. Opciones válidas son: {self.OPCIONES_MEDICION}")
        self.idProveedor = idProveedor
        self.idProdXProv = idProdXProv
        self.descripcion = descripcion
        self.medicion = medicion
        self.divideX = divideX
 
class Compra(db.Model):
    idCompra = db.Column(db.Integer, primary_key=True, autoincrement=True)
    idProveedor = db.Column(db.Integer, db.ForeignKey('proveedor.idProveedor'), nullable=False)
    fechaCompra = db.Column(db.Date, nullable=False)
    numFactura = db.Column(db.Integer)
    iva = db.Column(db.Boolean, default=False)
    descuento = db.Column(db.Numeric(5, 2), default=0)
    proveedor = db.relationship('Proveedor', backref=db.backref('compras', lazy=True))
    def __init__(self,idCompra, idProveedor,fechaCompra,numFactura,iva,descuento):
        self.idCompra = idCompra
        self.idProveedor = idProveedor
        self.fechaCompra = fechaCompra
        self.numFactura = numFactura
        self.iva = iva
        self.descuento = descuento
        
class DetalleCompra(db.Model):
    idDetalle = db.Column(db.Integer, primary_key=True, autoincrement=True)
    idCompra = db.Column(db.Integer, db.ForeignKey('compra.idCompra'), nullable=False)
    idProveedor = db.Column(db.Integer, db.ForeignKey('productos_x_proveedor.idProveedor'), nullable=False)
    idProducto = db.Column(db.Integer, db.ForeignKey('productos_x_proveedor.idProdXProv'), nullable=False)
    unidades = db.Column(db.Integer)
    cantidad = db.Column(db.Numeric(10, 2), nullable=False)
    precioUnitario = db.Column(db.Numeric(10, 2), nullable=False)
    precioFinal = db.Column(db.Numeric(10, 2))
    importe = db.Column(db.Numeric(10, 2))
    importeFinal = db.Column(db.Numeric(10, 2))
    precioBalanzaActual = db.Column(db.Integer)
    precioBalanzaSugerido = db.Column(db.Integer)
    pesoPromedioActual = db.Column(db.Float)
    pesoPromedioNuevo = db.Column(db.Float)
    
    compra = db.relationship('Compra', backref=db.backref('detalles', lazy=True))
    producto = db.relationship('Productos_x_proveedor', primaryjoin=(
        (idProveedor == Productos_x_proveedor.idProveedor) &
        (idProducto == Productos_x_proveedor.idProdXProv)
    ), backref=db.backref('detalles', lazy=True))

    def __init__(self, idCompra, idProveedor, idProducto, unidades, cantidad, precioUnitario, precioFinal, importe, importeFinal, precioBalanzaActual, precioBalanzaSugerido, pesoPromedioActual,pesoPromedioNuevo):
        self.idCompra = idCompra
        self.idProveedor = idProveedor
        self.idProducto = idProducto
        self.unidades = unidades
        self.cantidad = cantidad
        self.precioUnitario = precioUnitario
        self.precioFinal = precioFinal
        self.importe = importe
        self.importeFinal = importeFinal
        self.precioBalanzaActual = precioBalanzaActual
        self.precioBalanzaSugerido = precioBalanzaSugerido
        self.pesoPromedioActual = pesoPromedioActual
        self.pesoPromedioNuevo = pesoPromedioNuevo

class RelacionProductos(db.Model):
    idBalanza = db.Column(db.Integer, db.ForeignKey('balanza.idBalanza'), primary_key=True)
    idProducto=db.Column(db.Integer, db.ForeignKey('producto.idProducto'), primary_key=True)
    idProveedor = db.Column(db.Integer, db.ForeignKey('productos_x_proveedor.idProveedor'), primary_key=True)
    idProdXProv = db.Column(db.Integer, db.ForeignKey('productos_x_proveedor.idProdXProv'), primary_key=True)
    margen = db.Column(db.Float)
    pesoPromedio = db.Column(db.Float)
    observacion = db.Column(db.String(50), nullable=True)
    balanza = db.relationship('Balanza', backref='relacion_productos')
    producto = db.relationship('Producto',backref='relacion_productos')
    def __init__(self,idBalanza,idProducto,idProveedor,idProdXProv,margen, pesoPromedio,observacion):
        self.idBalanza = idBalanza
        self.idProducto =idProducto
        self.idProveedor = idProveedor
        self.idProdXProv = idProdXProv
        self.margen = margen
        self.pesoPromedio = pesoPromedio
        self.observacion = observacion

class UltimoPrecio(db.Model):
    __tablename__ = 'ultimoPrecio'
    idDetalle = db.Column(db.Integer, primary_key=True)
    precioFinal = db.Column(db.Numeric)
    pesoPromedioNuevo = db.Column(db.Float)
    idProducto = db.Column(db.Integer)
    idProveedor = db.Column(db.Integer)
    idProdXProv = db.Column(db.Integer)
    fechaCompra = db.Column(db.Date)
    idBalanza = db.Column(db.Integer)
    def __init__(self, idDetalle, precioFinal, pesoPromedioNuevo, idProducto, idProveedor, idProdXProv, fechaCompra, idBalanza, nombre1):
        self.idDetalle = idDetalle
        self.precioFinal = precioFinal
        self.pesoPromedioNuevo = pesoPromedioNuevo
        self.idProducto = idProducto
        self.idProveedor = idProveedor
        self.idProdXProv = idProdXProv
        self.fechaCompra = fechaCompra
        self.idBalanza = idBalanza

with app.app_context():
    db.create_all()

class ProductoSchema(ma.Schema):
    class Meta:
        fields=('idProducto','descripcion','observacion','imagen', 'activo', 'reposicion')

class StockSchema(ma.Schema):
    class Meta:
        fields=('fecha','idProducto','cantidad','cantidad2')

class EfectivoSchema(ma.Schema):
    class Meta:
        fields=('id','fecha','motivo', 'observacion' ,'importe')
    def get_motivo(self, efectivo):
        return efectivo.motivo.motivo
    motivo = fields.Method(serialize='get_motivo')

class MotivoSchema(Schema):
    class Meta:
        fields=('motivo',)
    motivo = fields.String()

class TipoProveedorSchema(ma.Schema):
    class Meta:
        fields = ('tipoProv',)

class ProveedorSchema(ma.Schema):
    class Meta:
        fields = ('idProveedor', 'nombreProveedor', 'razonSocial' ,'cuit', 'direccion', 'telefono', 'contacto', 'mail', 'web', 'tipoProveedor', 'observacion')

class ProductoProveedorSchema(ma.Schema):
    class Meta:
        fields = ('idProducto', 'idProveedor')

class MedioPagoSchema(ma.Schema):
    class Meta:
        fields=('idMedioPago', 'descripcion')

class MotivoGastoSchema(ma.Schema):
    class Meta:
        fields=('idMotivo', 'descripcion')

class GastoSchema(ma.Schema):
    motivo = fields.Nested(MotivoGastoSchema)

    class Meta:
        fields=('idGasto', 'idMotivo', 'importe', 'fecha_gasto', 'fecha_pago', 'pagado', 'saldo', 'observaciones')

class PagoSchema(ma.Schema):
    gasto = fields.Nested(GastoSchema)
    medio_pago = fields.Nested(MedioPagoSchema)

    class Meta:
        fields=('idPago', 'idGasto', 'monto_pago', 'fecha_pago', 'idMedioPago', 'observaciones')

class BalanzaSchema(ma.Schema):
    class Meta:
        fields = ('idBalanza', 'nombre1', 'nombre2', 'precio', 'concertado')

class NovedadBalanzaSchema(ma.Schema):
    class Meta:
        model = NovedadBalanza
        fields = ("idNovedadBalanza",) 

class Productos_x_proveedorSchema(ma.Schema):
    proveedor = fields.Method('recuperarNombre')
    def recuperarNombre(self, obj):
        proveedor = Proveedor.query.get(obj.idProveedor)
        return proveedor.nombreProveedor if proveedor else None
    class Meta:
        fields = ('idProveedor', 'proveedor',  'idProdXProv','descripcion','medicion', 'divideX')

class CompraSchema(ma.Schema):
    proveedorNombre = ma.Function(lambda obj: obj.proveedor.nombreProveedor if obj.proveedor else None)
    class Meta:
        fields = ('idCompra', 'idProveedor', 'fechaCompra', 'numFactura', 'iva', 'proveedorNombre', 'descuento')

class DetalleCompraSchema(ma.Schema):
    compra = ma.Nested(CompraSchema, only=['idCompra'])
    producto = ma.Nested(Productos_x_proveedorSchema, only=['idProdXProv', 'descripcion'])
    balanza = fields.Method("datosBalanza")
    class Meta:
        fields = ('idDetalle', 'idCompra', 'idProveedor', 'idProducto', 'unidades', 'cantidad', 'precioUnitario', 'precioFinal', 'importe', 'importeFinal', 'compra', 'producto', 'balanza', 'precioBalanzaActual', 'precioBalanzaSugerido', 'pesoPromedioActual', 'pesoPromedioNuevo')
    def datosBalanza(self, obj):
        relacion_producto = RelacionProductos.query.filter_by(idProveedor=obj.idProveedor,idProdXProv=obj.idProducto).first()
        if relacion_producto:
            if relacion_producto.balanza:
                return {'idBalanza': relacion_producto.balanza.idBalanza,'nombre1': relacion_producto.balanza.nombre1}
        return None

class RelacionProductosSchema(ma.Schema):
    balanza = ma.Nested(BalanzaSchema, only=['nombre1', 'idBalanza'])
    producto = ma.Nested(ProductoSchema, only=['descripcion'])
    proveedor = fields.Method('recuperarNombre')
    datosPxP = fields.Method('agregarDatosPxP')
    def recuperarNombre(self, obj):
        proveedor = Proveedor.query.get(obj.idProveedor)
        return proveedor.nombreProveedor if proveedor else None
    def agregarDatosPxP(self, obj):
        datos = Productos_x_proveedor.query.filter_by(idProveedor=obj.idProveedor, idProdXProv=obj.idProdXProv).first()
        if datos:
            return {
                'descripcion': datos.descripcion,
                'medicion': datos.medicion,
                'divideX': datos.divideX
            }
        return None
    class Meta:
        fields = ('idBalanza','balanza', 'idProducto', 'producto', 'idProveedor', 'proveedor', 'idProdXProv','margen', 'pesoPromedio', 'observacion', 'datosPxP',)

class UltimoPrecioSchema(Schema):
    idDetalle = fields.Int()
    precioFinal = fields.Decimal()
    pesoPromedioNuevo = fields.Float()
    idProducto = fields.Int()
    producto = fields.Method('recuperarProducto')
    idProveedor = fields.Int()
    proveedor = fields.Method('recuperarProveedor')
    idProdXProv = fields.Int()
    datosPxP = fields.Method('agregarDatosPxP')
    fechaCompra = fields.Date()
    idBalanza = fields.Int()
    balanza = fields.Method('recuperaBalanza')
    def recuperarProducto(self,obj):
        producto = Producto.query.get(obj.idProducto)
        return producto.descripcion if producto else None
    def recuperarProveedor(self,obj):
        proveedor = Proveedor.query.get(obj.idProveedor)
        return proveedor.nombreProveedor if proveedor else None
    def recuperaBalanza(self, obj):
        nombre = Balanza.query.get(obj.idBalanza)
        return nombre.nombre1 if nombre else None
    def agregarDatosPxP(self, obj):
        datos = Productos_x_proveedor.query.filter_by(idProveedor=obj.idProveedor, idProdXProv=obj.idProdXProv).first()
        if datos:
            return {
                'descripcion': datos.descripcion,
                'medicion': datos.medicion,
                'divideX': datos.divideX
            }
        return None
    class Meta:
        fields = ('idDetalle','precioFinal','pesoPromedioNuevo','idProducto','producto','idProveedor', 'proveedor', 'idProdXProv','fechaCompra','idBalanza','balanza', 'datosPxP')

producto_schema=ProductoSchema()
productos_schema=ProductoSchema(many=True)
stock_schema=StockSchema()
stocks_schema=StockSchema(many=True)
efectivo_schema=EfectivoSchema()
efectivos_schema=EfectivoSchema(many=True)
motivo_schema = MotivoSchema()
motivos_schema = MotivoSchema(many=True)
tipo_proveedor_schema = TipoProveedorSchema()
tipos_proveedor_schema = TipoProveedorSchema(many=True)
proveedor_schema = ProveedorSchema()
proveedores_schema = ProveedorSchema(many=True)
# ProductoProveedor no tiene
medio_pago_schema = MedioPagoSchema()
medios_pago_schema = MedioPagoSchema(many=True)
motivo_gasto_schema = MotivoGastoSchema()
motivos_gasto_schema = MotivoGastoSchema(many=True)
gasto_schema = GastoSchema()
gastos_schema = GastoSchema(many=True)
pago_schema = PagoSchema()
pagos_schema = PagoSchema(many=True)
balanza_schema = BalanzaSchema()
balanzas_schema = BalanzaSchema(many=True)
novedadBalanza_schema = NovedadBalanzaSchema()
novedadBalanzas_schema = NovedadBalanzaSchema(many=True)
producto_x_proveedor_schema = Productos_x_proveedorSchema()
productos_x_proveedor_schemas = Productos_x_proveedorSchema(many=True)
compra_schema = CompraSchema()
compras_schemas = CompraSchema(many=True)
detalleCompra_schema = DetalleCompraSchema()
detalleCompras_schema = DetalleCompraSchema(many=True)
relacionProducto_schema = RelacionProductosSchema()
relacionProductos_schema = RelacionProductosSchema(many=True)
ultimoPrecio_schema=UltimoPrecioSchema()
ultimosPrecios_schema=UltimoPrecioSchema(many=True)

@app.route('/',methods=['GET'])
def home():
    return '''
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
    <h1>LasVioletas 2.0</h1>
    <h2>Servidor ok</h2>
</body>
</html>
'''

#PRODUCTOS
@app.route('/productos', methods=['GET'])
def get_productos():
    productos=Producto.query.all()
    resultado=productos_schema.dump(productos)
    return jsonify(resultado)
@app.route('/productos/<int:id>', methods=['DELETE'])
def delete_producto(id):
    producto=Producto.query.get(id)
    db.session.delete(producto)
    db.session.commit()
    return producto_schema.jsonify(producto)
@app.route('/productos', methods=['POST'])
def crear_producto():
    descripcion = request.json['descripcion']
    observacion = request.json['observacion']
    imagen = request.json['imagen']
    activo = request.json['activo']
    reposicion = request.json.get('reposicion')
    nuevo_producto = Producto(idProducto=None, descripcion=descripcion, observacion=observacion, imagen=imagen,activo=activo,reposicion=reposicion)
    db.session.add(nuevo_producto)
    db.session.commit()
    return producto_schema.jsonify(nuevo_producto)
@app.route('/productos/<int:id>', methods=['PUT'])
def actualizar_producto(id):
    producto = Producto.query.get(id)
    if not producto:
        return jsonify({'message': 'Producto no encontrado'}), 404
    data = request.json
    producto.activo = data.get('activo', producto.activo)
    producto.descripcion = data.get('descripcion', producto.descripcion)
    producto.imagen = data.get('imagen', producto.imagen)
    producto.observacion = data.get('observacion', producto.observacion)
    producto.reposicion = data.get('reposicion', producto.reposicion)
    db.session.commit()
    return producto_schema.jsonify(producto)

#STOCK
@app.route('/stock', methods=['GET'])
def get_stock():
    stocks=Stock.query.all()
    resultado=stocks_schema.dump(stocks)
    return jsonify(resultado)
@app.route('/stock/nuevoStock/<fechaN>', methods=['GET'])
def crear_nuevo_stock(fechaN):
    try:
        sql = text("INSERT INTO stock (fecha, idProducto, cantidad, cantidad2) SELECT '" + fechaN + "', idProducto, 0, reposicion FROM producto WHERE producto.activo = true AND idProducto = idProducto;")
        db.session.execute(sql)
        db.session.commit()
        return jsonify({"message": "Registros insertados en la tabla Stock."})
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Se ha producido un error: " + str(e)}), 500
@app.route('/stock/borrarStock/<fechaN>', methods=['GET'])
def borrar_stock(fechaN):
    try:
        sql = text("DELETE FROM stock WHERE fecha ='" + fechaN + "';")
        db.session.execute(sql)
        db.session.commit()
        return jsonify({"message": "Registros borrados de la tabla Stock."})
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Se ha producido un error: " + str(e)}), 500
@app.route('/stock/<int:id>/<fecha>', methods=['DELETE'])
def delete_stock(id, fecha):
    try:
        fecha_dt = datetime.strptime(fecha, '%Y-%m-%d').date()
    except ValueError:
        return jsonify({'message': 'Formato de fecha incorrecto. Utiliza el formato YYYY-MM-DD.'}), 400
    stock = Stock.query.filter_by(idProducto=id, fecha=fecha_dt).first()
    if stock:
        db.session.delete(stock)
        db.session.commit()
        return stock_schema.jsonify(stock)
    else:
        return jsonify({'message': 'No se encontró el stock con el ID y fecha especificados.'}), 404
@app.route('/stock', methods=['POST'])
def crear_stock():
    idProducto = request.json['idProducto']
    fecha = request.json['fecha']
    cantidad = 0
    cantidad2 = 0
    nuevo_stock = Stock(fecha=fecha, idProducto=idProducto, cantidad=cantidad, cantidad2=cantidad2)
    db.session.add(nuevo_stock)
    db.session.commit()
    return stock_schema.jsonify(nuevo_stock)
@app.route('/stock/sumar/<int:id>/<fecha>', methods=['PUT'])
def sumar_stock(id, fecha):
    try:
        fecha_dt = datetime.strptime(fecha, '%Y-%m-%d').date()
    except ValueError:
        return jsonify({'message': 'Formato de fecha incorrecto. Utiliza el formato YYYY-MM-DD.'}), 400
    stock = Stock.query.filter_by(idProducto=id, fecha=fecha_dt).first()
    if stock:
        stock.cantidad += 1
        db.session.commit()
        return stock_schema.jsonify(stock)
    else:
        return jsonify({'message': 'No se encontró el stock con el ID y fecha especificados.'}), 404
@app.route('/stock/sumar/<int:id>/<fecha>/<float:cant>', methods=['PUT'])
def sumar_stock2(id, fecha,cant):
    try:
        fecha_dt = datetime.strptime(fecha, '%Y-%m-%d').date()
    except ValueError:
        return jsonify({'message': 'Formato de fecha incorrecto. Utiliza el formato YYYY-MM-DD.'}), 400
    stock = Stock.query.filter_by(idProducto=id, fecha=fecha_dt).first()
    if stock:
        stock.cantidad += cant
        db.session.commit()
        return stock_schema.jsonify(stock)
    else:
        return jsonify({'message': 'No se encontró el stock con el ID y fecha especificados.'}), 404
@app.route('/stock/restar/<int:id>/<fecha>', methods=['PUT'])
def restar_stock(id, fecha):
    try:
        fecha_dt = datetime.strptime(fecha, '%Y-%m-%d').date()
    except ValueError:
        return jsonify({'message': 'Formato de fecha incorrecto. Utiliza el formato YYYY-MM-DD.'}), 400
    stock = Stock.query.filter_by(idProducto=id, fecha=fecha_dt).first()
    if stock:
        stock.cantidad -= 1
        db.session.commit()
        return stock_schema.jsonify(stock)
    else:
        return jsonify({'message': 'No se encontró el stock con el ID y fecha especificados.'}), 404

#EFECTIVO
@app.route('/efectivo', methods= ['GET'])
def get_todos_importe():
    efectivos=Efectivo.query.all()
    resultado=efectivos_schema.dump(efectivos)
    return jsonify(resultado)
@app.route('/efectivo/motivo/<fecha>', methods=['GET'])
def get_importes(fecha):
    try:
        fecha_obj = datetime.strptime(fecha, '%Y-%m-%d').date()
    except ValueError:
        return jsonify({'message': 'Fecha inválida'}), 400

    motivo = request.args.get('motivo')

    if not motivo:
        return jsonify({'message': 'Motivo no especificado'}), 400

    importes = Efectivo.query.filter_by(fecha=fecha_obj, motivo=motivo).all()

    if not importes:
        return jsonify({'message': 'No se encontraron importes para el motivo y fecha especificados'}), 404

    resultado = []
    for imp in importes:
        resultado.append({
            'id': imp.id,
            'fecha': imp.fecha.strftime('%Y-%m-%d'),
            'motivo': imp.motivo,
            'importe': str(imp.importe)
        })
    return jsonify(resultado), 200
@app.route('/efectivo', methods=['POST'])
def crear_efectivo():
    fecha = request.json['fecha']
    motivo_nombre = request.json['motivo']
    observacion = request.json['observacion']
    importe = request.json['importe']
    motivo_obj = MotivosEfectivo.query.filter_by(motivo=motivo_nombre).first()
    if not motivo_obj:
        return jsonify({'error': f'El motivo "{motivo_nombre}" no existe'}), 400
    nuevo_efectivo = Efectivo(fecha=fecha, motivo=motivo_obj, observacion=observacion, importe=importe)
    try:
        db.session.add(nuevo_efectivo)
        db.session.commit()
        return efectivo_schema.jsonify(nuevo_efectivo)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

#MOTIVOSEFECTIVO
@app.route('/motivos', methods=['GET'])
def ver_motivos():
    motivos = MotivosEfectivo.query.all()
    resultado = [motivo_schema.dump(motivo)['motivo'] for motivo in motivos]
    return jsonify(resultado)
@app.route('/motivos', methods= ['POST'])
def crear_motivos():
    motivo = request.json['motivo']
    nuevoMotivo = MotivosEfectivo(motivo=motivo)
    db.session.add(nuevoMotivo)
    db.session.commit()
    return jsonify(motivo_schema.dump(nuevoMotivo))
@app.route('/motivos/<motivo>', methods=['DELETE'])
def delete_motivo(motivo):
    motivo_borrar=MotivosEfectivo.query.get(motivo)
    if motivo_borrar is not None:
        db.session.delete(motivo_borrar)
        db.session.commit()
        return jsonify({"message": f"Motivo borrado: {motivo_borrar}"}), 200
    else:
        return jsonify({"message": "No se encontró el motivo para borrar."}), 404

#TIPOPROVEEDOR
@app.route('/tipoproveedor',methods=['GET'])
def ver_tipoproveedor():
    tipos = TipoProveedor.query.all()
    resultado = [tipo.tipoProv for tipo in tipos]
    return jsonify(resultado)
@app.route('/tipoproveedor',methods=['POST'])
def crear_tipoproveedor():
    tipo = request.json['tipoProv']
    nuevoTipo = TipoProveedor(tipoProv=tipo)
    db.session.add(nuevoTipo)
    db.session.commit()
    return jsonify(tipo_proveedor_schema.dump(nuevoTipo))
@app.route('/tipoproveedor/<tipo>',methods=['DELETE'])
def borrar_tipoproveedor(tipo):
    tipo_borrar=TipoProveedor.query.get(tipo)
    db.session.delete(tipo_borrar)
    db.session.commit()
    return f'Tipo proveedor borrado {tipo_borrar} '

#PROVEEDOR
@app.route('/proveedores',methods=['GET'])
def ver_proveedores():
    proveedores=Proveedor.query.all()
    resultado=proveedores_schema.dump(proveedores)
    return jsonify(resultado)
@app.route('/proveedores2',methods=['GET'])
def ver_proveedores2():
    ids_proveedores_con_productos = [relacion.idProveedor for relacion in ProductoProveedor.query.all()]
    proveedores_con_productos = Proveedor.query.filter(Proveedor.idProveedor.in_(ids_proveedores_con_productos)).all()
    resultado = proveedores_schema.dump(proveedores_con_productos)
    return jsonify(resultado)
@app.route('/proveedores',methods=['POST'])
def crear_proveedor():
    nombreProveedor=request.json['nombreProveedor']
    razonSocial=request.json['razonSocial']
    cuit=request.json['cuit']
    direccion=request.json['direccion']
    telefono=request.json['telefono']
    contacto=request.json['contacto']
    mail=request.json['mail']
    web=request.json['web']
    tipoProveedor=request.json['tipoProveedor']
    observacion=request.json['observacion']
    nuevoProveedor=Proveedor(nombreProveedor=nombreProveedor,razonSocial=razonSocial,cuit=cuit,direccion=direccion,telefono=telefono,contacto=contacto,mail=mail,web=web,tipoProveedor=tipoProveedor,observacion=observacion)
    db.session.add(nuevoProveedor)
    db.session.commit()
    return jsonify(proveedor_schema.dump(nuevoProveedor))
@app.route('/proveedores/<int:idProveedor>', methods=['DELETE'])
def borrar_proveedor(idProveedor):
    proveedor_borrar=Proveedor.query.get(idProveedor)
    db.session.delete(proveedor_borrar)
    db.session.commit()
    return proveedor_schema.jsonify(proveedor_borrar)
@app.route('/proveedores/<int:idProveedor>',methods=['PUT'])
def modificar_proveedor(idProveedor):
    proveedor = Proveedor.query.get(idProveedor)
    if not proveedor:
        return jsonify({'message': 'Proveedor no encontrado'}),404
    data = request.json
    proveedor.contacto = data.get('contacto', proveedor.contacto)
    proveedor.cuit = data.get('cuit', proveedor.cuit)
    proveedor.direccion = data.get('direccion', proveedor.direccion)
    proveedor.mail = data.get('mail', proveedor.mail)
    proveedor.nombreProveedor = data.get('nombreProveedor', proveedor.nombreProveedor)
    proveedor.observacion = data.get('observacion', proveedor.observacion)
    proveedor.razonSocial = data.get('razonSocial', proveedor.razonSocial)
    proveedor.telefono = data.get('telefono', proveedor.telefono)
    proveedor.web = data.get('web',proveedor.web)
    proveedor.tipoProveedor = data.get('tipoProveedor', proveedor.tipoProveedor)
    db.session.commit()
    return proveedor_schema.jsonify(proveedor)

#PRODUCTO_PROVEEDOR
@app.route('/productoproveedor', methods=['GET'])
def ver_productoproveedor():
    productos_proveedores = ProductoProveedor.query.all()
    productoProveedorSchema = ProductoProveedorSchema(many=True)
    resultado = productoProveedorSchema.dump(productos_proveedores)
    return jsonify(resultado)
@app.route('/productoproveedor',methods=['POST'])
def crear_productoproveedor():
    idProducto=request.json['idProducto']
    idProveedor=request.json['idProveedor']
    nuevaRelacion=ProductoProveedor(idProducto=idProducto,idProveedor=idProveedor)
    db.session.add(nuevaRelacion)
    db.session.commit()
    return jsonify({'idProducto': nuevaRelacion.idProducto,'idProveedor': nuevaRelacion.idProveedor})
@app.route('/productoproveedor/<int:idProducto>/<int:idProveedor>', methods=['DELETE'])
def borrar_productoproveedor(idProducto, idProveedor):
    relacion_borrar = ProductoProveedor.query.filter_by(idProducto=idProducto, idProveedor=idProveedor).first()
    if relacion_borrar is not None:
        db.session.delete(relacion_borrar)
        db.session.commit()
        return jsonify({"message": "Relación ProductoProveedor borrada correctamente."}),200
    else:
        return jsonify({"message": "No se encontró la relación ProductoProveedor para borrar."}), 404

# MedioPago

@app.route('/gasto/medio_pago/' , methods=['GET'])
def get_medio_pago():
    medios_pago=MedioPago.query.all()
    resultado= medios_pago_schema.dump(medios_pago)
    return resultado
@app.route('/gasto/medio_pago/<int:idMedioPago>', methods=['DELETE'])
def delete_medio_pago(idMedioPago):
    medio_pago = MedioPago.query.get(idMedioPago)
    if medio_pago:
        descripcion = medio_pago.descripcion
        db.session.delete(medio_pago)
        db.session.commit()
        return jsonify({'message': f'Medio de pago {descripcion} eliminado correctamente'}), 200
    else:
        return jsonify({'error': 'Medio de pago no encontrado'}), 404
@app.route('/gasto/medio_pago/', methods=['POST'])
def crear_medio_pago():
    descripcion = request.json['descripcion']
    nuevo_medio_pago = MedioPago(idMedioPago=None, descripcion=descripcion)
    db.session.add(nuevo_medio_pago)
    db.session.commit()
    return medio_pago_schema.jsonify(nuevo_medio_pago), 200
@app.route('/gasto/medio_pago/<int:idMedioPago>', methods=['PUT'])
def actualizar_medio_pago(idMedioPago):
    medio_pago = MedioPago.query.get(idMedioPago)
    data = request.json
    if not medio_pago:
        return jsonify({'message': 'Medio de pago no encontrado'}), 404
    medio_pago.descripcion = data.get('descripcion', medio_pago.descripcion)
    db.session.commit()
    return jsonify({'message': 'Medio de pago actualizado correctamente'}), 200

# MotivoGasto
@app.route('/gasto/motivo_gasto/',methods=['GET'])
def get_motivo_gasto():
    motivos_gasto=MotivoGasto.query.all()
    resultado = motivos_gasto_schema.dump(motivos_gasto)
    return resultado
@app.route('/gasto/motivo_gasto/<int:idMotivo>', methods=['DELETE'])
def detete_motivo_gasto(idMotivo):
    motivo_gasto = MotivoGasto.query.get(idMotivo)
    if motivo_gasto:
        descripcion = motivo_gasto.descripcion
        db.session.delete(motivo_gasto)
        db.session.commit()
        return jsonify({'message': f'Motivo de gasto {descripcion} eliminado correctamente.'}), 200
    else:
        return jsonify({'error':'Motivo de gasto no encontrado'}),404
@app.route('/gasto/motivo_gasto', methods=['POST'])
def crear_motivo_gasto():
    descripcion = request.json['descripcion']
    nuevo_motivo_gasto = MotivoGasto(idMotivo=None, descripcion=descripcion)
    db.session.add(nuevo_motivo_gasto)
    db.session.commit()
    return motivo_gasto_schema.jsonify(nuevo_motivo_gasto),200
@app.route('/gasto/motivo_gasto/<int:idMotivo>', methods=['PUT'])
def actualizar_motivo_gasto(idMotivo):
    motivo_gasto = MotivoGasto.query.get(idMotivo)
    data = request.json
    if not motivo_gasto:
        return jsonify({'message': 'Motivo de gasto no encontrado'}),404
    motivo_gasto.descripcion = data.get('descripcion',motivo_gasto.descripcion)
    db.session.commit()
    return jsonify({'message': 'Motivo de gasto actualizado correctamente'}),200

# Gasto
@app.route('/gasto/', methods=['GET'])
def get_gastos():
    gastos=Gasto.query.all()
    resultado= gastos_schema.dump(gastos)
    return resultado
@app.route('/gasto/<int:idGasto>',methods=['DELETE'])
def delete_gasto(idGasto):
    try:
        pago_asociado = Pago.query.filter_by(idGasto=idGasto).first()
        if pago_asociado:
            id_pago_asociado = pago_asociado.idPago
            return jsonify({'error': f'No se puede eliminar el gasto {idGasto} porque tiene pagos asociados. Elimine primero el pago {id_pago_asociado}'}), 409
        gasto = Gasto.query.get(idGasto)
        if not gasto:
            return jsonify({'error':'Gasto no encontrado'}),404
        else:
            descripcion = f'ID: {gasto.idGasto}, Motivo: {gasto.observaciones}, Importe: {gasto.importe}, Fecha: {gasto.fecha_gasto}'
            db.session.delete(gasto)
            db.session.commit()
            return jsonify({'message': f'Gasto {descripcion} eliminado correctamente'}),200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
@app.route('/gasto/',methods=['POST'])
def crear_gasto():
    try:
        idMotivo = request.json['idMotivo']
        importe = request.json['importe']
        fecha_gasto = request.json['fecha_gasto']
        if 'observaciones' in request.json and request.json['observaciones'] is not None:
            observaciones = request.json['observaciones']
        else:
            observaciones = ''
        nuevo_gasto = Gasto(idGasto=None,idMotivo=idMotivo,importe=importe,fecha_gasto=fecha_gasto,fecha_pago=None,pagado=False, saldo=importe,observaciones=observaciones)
        db.session.add(nuevo_gasto)
        db.session.commit()
        return gasto_schema.jsonify(nuevo_gasto),201
    except IntegrityError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500
@app.route('/gasto/<int:idGasto>', methods=['PUT'])
def modificar_gasto(idGasto):
    gasto= Gasto.Session.get(idGasto)
    if not gasto:
        return jsonify({'message': 'Gasto no encontrado'}),404
    data = request.json
    gasto.idMotivo = data.get('idMotivo', gasto.idMotivo)
    gasto.importe = data.get('importe',gasto.importe)
    gasto.fecha_gasto = data.get('fecha_gasto',gasto.fecha_gasto)
    gasto.fecha_pago = data.get('fecha_pago',gasto.fecha_pago)
    gasto.pagado = data.get('pagado', gasto.pagado)
    gasto.saldo = data.get('saldo',gasto.saldo)
    gasto.observaciones = data.get('observaciones', gasto.observaciones)
    db.session.commit()
    return gasto_schema.jsonify(gasto)

# Pago
@app.route('/gasto/pago/<int:idPago>',methods=['GET'])
def get_pago(idPago):
    pago = Pago.query.get(idPago)
    resultado = pago_schema.dump(pago)
    return resultado
@app.route('/gasto/pago/',methods=['GET'])
def get_pagos():
    pagos = Pago.query.all()
    resultado = pagos_schema.dump(pagos)
    return resultado
@app.route('/gasto/pago/<int:idPago>',methods=['DELETE']) # Este no lo tendríamos que usar porque no anula el pago en la tabla Gasto. Se deja por si es necesario limpiar pagos que no impactaron en Gasto.
def delete_pago(idPago):
    pago = Pago.query.get(idPago)
    if not pago:
        return jsonify({"error":"pago no encontrado"}),404
    descripcion = f'pago {pago} eliminado correctamente'
    db.session.delete(pago)
    db.session.commit()
    return jsonify({'message': descripcion})
@app.route('/gasto/pago/pagar/<int:idGasto>', methods=['POST'])
def crear_pago(idGasto):
    gasto = Gasto.query.get(idGasto)
    monto_pago = Decimal(request.json['monto_pago'])
    fecha_pago = request.json['fecha_pago']
    idMedioPago = request.json['idMedioPago']
    observaciones = request.json['observaciones']
    if gasto:
        pagado_gasto = gasto.pagado
        saldo_gasto = gasto.saldo
    else:
        return jsonify({'error': f'Gasto {idGasto} no encontrado'}), 404
    if pagado_gasto or saldo_gasto < monto_pago:
        return jsonify({'error': 'El gasto ya fue cancelado o el importe de pago es mayor al saldo'}), 405
    try:
        nuevoPago = Pago(idPago=None, idGasto=idGasto, monto_pago=monto_pago, fecha_pago=fecha_pago, idMedioPago=idMedioPago, observaciones=observaciones)
        db.session.add(nuevoPago)
        db.session.commit()
        gasto.fecha_pago = fecha_pago
        gasto.saldo -= monto_pago
        if gasto.saldo <  0.01:
            gasto.saldo = 0
            gasto.pagado = True
        db.session.commit()
        return jsonify({'message': 'Pago creado correctamente'}), 200
    except IntegrityError as e:
        return jsonify({'error': str(e)}), 400
@app.route('/gasto/pago/pago_total/<int:idGasto>', methods=['POST'])
def pago_total(idGasto):
    gasto = Gasto.query.get(idGasto)
    if not gasto:
        return jsonify({'error': f'Gasto {idGasto} no encontrado'}), 404
    data = request.json
    idMedioPago = data['idMedioPago']
    fecha_pago = data['fecha_pago']
    observaciones = data.get('observaciones', '')
    if gasto.pagado or gasto.saldo == 0:
        return jsonify({'error': 'El gasto ya está pagado o el saldo es cero'}), 405
    monto_pago = gasto.saldo
    try:
        nuevoPago = Pago(
            idPago=None,
            idGasto=idGasto,
            monto_pago=monto_pago,
            fecha_pago=fecha_pago,
            idMedioPago=idMedioPago,
            observaciones=observaciones
        )
        db.session.add(nuevoPago)
        db.session.commit()
        gasto.fecha_pago = fecha_pago
        gasto.saldo = 0
        gasto.pagado = True
        db.session.commit()
        return jsonify({'message': 'Pago total realizado correctamente'}), 200
    except IntegrityError as e:
        return jsonify({'error': str(e)}), 400
@app.route('/gasto/pago/anular/<int:idPago>', methods=['DELETE'])
def anular_pago(idPago):
    try:
        pago = Pago.query.get(idPago)
        if not pago:
            return jsonify({'error': f'Pago {idPago} no encontrado'}), 404
        gasto = Gasto.query.get(pago.idGasto)
        if not gasto:
            return jsonify({'error': f'Gasto asociado al pago {idPago} no encontrado'}), 404
        gasto.pagado = False
        gasto.saldo += pago.monto_pago
        db.session.delete(pago)
        db.session.commit()
        if gasto.saldo == gasto.importe:
            gasto.fecha_pago = None
            db.session.commit()
        return jsonify({'message': f'Anulación de pago {idPago} realizada correctamente'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Balanza
@app.route('/balanza/<int:idBalanza>', methods=['GET'])
def get_balanza(idBalanza):
    balanza = Balanza.query.get(idBalanza)
    resultado = balanza_schema.dump(balanza)
    return resultado
@app.route('/balanza/',methods=['GET'])
def get_balanzas():
    balanza = Balanza.query.all()
    resultado = balanzas_schema.dump(balanza)
    return resultado
@app.route('/balanza/<int:idBalanza>', methods=['DELETE'])
def delete_balanza(idBalanza):
    balanza = Balanza.query.get(idBalanza)
    if balanza:
        db.session.delete(balanza)
        db.session.commit()
        return jsonify({'message': f'{balanza} eliminada correctamente'}), 200
    else:
        return jsonify({'error': 'Balanza no encontrada'}), 404
@app.route('/balanza/',methods=['POST'])
def crear_balanza():
    try:
        idBalanza = request.json['idBalanza']
        nombre1 = request.json['nombre1']
        nombre2 = request.json['nombre2']
        precio = request.json['precio']
        concertado = request.json['concertado']
        if Balanza.query.get(idBalanza):
            return jsonify({'error': f'La balanza ya tiene el código {idBalanza} eliminelo para reutilizar'}), 409
        else:
            nueva_balanza = Balanza(idBalanza=idBalanza,nombre1=nombre1,nombre2=nombre2,precio=precio,concertado=concertado)
            nueva_novedad_balanza = NovedadBalanza(idNovedadBalanza=idBalanza)
            db.session.add(nueva_balanza)
            db.session.commit()
            try:
                db.session.add(nueva_novedad_balanza)
                db.session.commit()
            except IntegrityError:
                db.session.rollback()
                db.session.commit()
            return balanza_schema.jsonify(nueva_balanza),201
    except IntegrityError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500
@app.route('/balanza/<int:idBalanza>', methods=['PUT'])
def modificar_balanza(idBalanza):
    balanza = Balanza.query.get(idBalanza)
    if not balanza:
        return jsonify({'message': 'Balanza no encontrada'}), 404
    try:
        data = request.json
        balanza.nombre1 = data.get('nombre1', balanza.nombre1)
        balanza.nombre2 = data.get('nombre2', balanza.nombre2)
        balanza.precio = data.get('precio', balanza.precio)
        balanza.concertado = data.get('concertado', balanza.concertado)
        nueva_novedad_balanza = NovedadBalanza(idNovedadBalanza=idBalanza)
        try:
            db.session.add(nueva_novedad_balanza)
            db.session.commit()
        except IntegrityError:
            db.session.rollback()
            db.session.commit()
        return balanza_schema.jsonify(balanza)
    except IntegrityError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Novedadbalanza
@app.route('/balanza/novedades/', methods=['GET'])
def get_novedadesBalanza():
    novedades = NovedadBalanza.query.all()
    resultado = novedadBalanzas_schema.dump(novedades)
    return resultado
@app.route('/balanza/novedades/', methods=['DELETE'])
def delete_novedadesBalanza():
    try:
        db.session.query(NovedadBalanza).delete()
        db.session.commit()
        return jsonify({'mensaje': 'Todos los registros borrados'}),200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500    
@app.route('/balanza/fitro/novedades', methods=['GET'])
def get_novedades_balanza(): # trae los datos de balanza
    try:
        novedades = db.session.query(Balanza).join(NovedadBalanza, Balanza.idBalanza == NovedadBalanza.idNovedadBalanza).all()
        resultado = balanzas_schema.dump(novedades)
        return jsonify(resultado), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# productos_x_proveedor
@app.route('/compras/productoxproveedor/<int:idProveedor>/<int:idProdxProv>', methods=['GET'])
def get_pxp(idProveedor, idProdxProv):
    producto_x_proveedor = Productos_x_proveedor.query.filter_by(idProveedor=idProveedor, idProdXProv=idProdxProv).first()
    resultado = producto_x_proveedor_schema.dump(producto_x_proveedor)
    if producto_x_proveedor is None:
        return {"message": "Producto por proveedor no encontrado"}, 404
    return resultado
@app.route('/compras/xproveedor/<int:idProveedor>', methods=['GET'])
def get_productos_del_proveedor(idProveedor):
    productos_del_proveedor = Productos_x_proveedor.query.filter_by(idProveedor=idProveedor)
    resultado = productos_x_proveedor_schemas.dump(productos_del_proveedor)
    return resultado
@app.route('/compras/productoxproveedor', methods=['GET'])
def get_pxproveedores():
    try:
        pxproveedores = Productos_x_proveedor.query.all()
        resultado = productos_x_proveedor_schemas.dump(pxproveedores)
        return resultado
    except Exception as e:
        return {"message": str(e)}, 500
@app.route('/compras/productoxproveedor/consulta', methods=['GET'])
def get_pxptotales():
    consulta = """
    SELECT p.nombreProveedor, COUNT(px.idProdXProv) AS total_productos FROM proveedor p JOIN productos_x_proveedor px ON p.idProveedor = px.idProveedor GROUP BY p.nombreProveedor
    """
    try:
        resultado = db.session.execute(text(consulta))
        datos = []
        for renglon in resultado:
            datos.append({
                'Nombre Proveedor': renglon[0],
                'Total': renglon[1]
            })
        return jsonify(datos)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
@app.route('/compras/productoxproveedor/<int:idProveedor>/<int:idProdxProv>', methods=['DELETE'])
def delete_pxp(idProveedor, idProdxProv):
    try:
        producto_x_proveedor = Productos_x_proveedor.query.filter_by(idProveedor=idProveedor, idProdXProv=idProdxProv).first()
        if producto_x_proveedor is None:
            return jsonify({'mensaje': 'Producto por proveedor no encontrado'}), 404
        datos_eliminado = {
            'idProveedor': producto_x_proveedor.idProveedor,
            'idProdXProv': producto_x_proveedor.idProdXProv,
            'descripcion': producto_x_proveedor.descripcion,
            'medicion': producto_x_proveedor.medicion,
            'divideX': str(producto_x_proveedor.divideX)
        }
        db.session.delete(producto_x_proveedor)
        db.session.commit()
        return jsonify({'mensaje': 'Borrado exitoso', 'datos': datos_eliminado}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
@app.route('/compras/productoxproveedor', methods=['POST'])
def crear_pxp():
    try:
        idProveedor = request.json.get('idProveedor')
        idProdXProv = request.json.get('idProdXProv')
        descripcion = request.json.get('descripcion', '')
        medicion = request.json.get('medicion')
        divideX = request.json.get('divideX')
        if idProveedor is None or idProdXProv is None or medicion is None or divideX is None:
            return jsonify({'error': 'Faltan datos obligatorios: idProveedor, idProdXProv, medicion y divideX son requeridos.'}), 400
        if Productos_x_proveedor.query.filter_by(idProveedor=idProveedor, idProdXProv=idProdXProv).first():
            return jsonify({'error': f'Ya existe el producto {idProdXProv} para el proveedor {idProveedor}'}), 409
        nuevo_pxp = Productos_x_proveedor(idProveedor=idProveedor,idProdXProv=idProdXProv,descripcion=descripcion,medicion=medicion, divideX=divideX)
        db.session.add(nuevo_pxp)
        db.session.commit()
        return jsonify({'mensaje': 'Alta exitosa'}), 201
    except IntegrityError as e:
        if 'foreign key constraint fails' in str(e):
            return jsonify({'error': 'El proveedor no existe. Por favor, asegúrate de que el idProveedor sea válido.'}), 400
        return jsonify({'error': 'Error de integridad en la base de datos. Por favor, verifica los datos proporcionados.'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500
@app.route('/compras/productoxproveedor/<int:idProveedor>/<int:idProdXProv>', methods=['PUT'])
def modificar_pxp(idProveedor, idProdXProv):
    try:
        datos = request.json
        descripcion = datos.get('descripcion', None)
        medicion = datos.get('medicion', None)
        divideX = datos.get('divideX', None)
        producto_x_proveedor = Productos_x_proveedor.query.filter_by(idProveedor=idProveedor, idProdXProv=idProdXProv).first()
        if not producto_x_proveedor:
            return jsonify({'error': 'El producto por proveedor especificado no existe.'}), 404
        if descripcion is not None:
            producto_x_proveedor.descripcion = descripcion
        if medicion is not None:
            producto_x_proveedor.medicion = medicion
        if divideX is not None:
            producto_x_proveedor.divideX = divideX
        db.session.commit()
        return jsonify({'mensaje': 'Modificación exitosa', 'producto_x_proveedor': producto_x_proveedor_schema.dump(producto_x_proveedor)}), 200
    except IntegrityError as e:
        if 'foreign key constraint fails' in str(e):
            return jsonify({'error': 'El proveedor especificado no existe. Por favor, asegúrate de que el idProveedor sea válido.'}), 400
        return jsonify({'error': 'Error de integridad en la base de datos. Por favor, verifica los datos proporcionados.'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# compra
@app.route('/compra/<int:idCompra>', methods= ['GET'])
def get_compra(idCompra):
    compra = Compra.query.filter_by(idCompra=idCompra).first()
    if compra is None:
        return {'message': 'Compra no encontrada'}, 404
    resultado = compra_schema.dump(compra)
    return resultado
@app.route('/compras', methods=['GET'])
def get_compras():
    try:
        compras = Compra.query.all()
        resultado = compras_schemas.dump(compras)
        return jsonify(resultado)
    except Exception as e:
        return jsonify({'error': str(e)}), 500
@app.route('/compra', methods=['POST'])
def crear_compra():
    try:
        data = request.get_json()
        idProveedor = data.get('idProveedor')
        fechaCompra = data.get('fechaCompra')
        numFactura = data.get('numFactura')
        iva = data.get('iva')
        descuento = data.get('descuento')
        if idProveedor is None or fechaCompra is None or numFactura is None or iva is None or descuento is None:
            return jsonify({'error': 'Faltan datos obligatorios: idProveedor, fechaCompra, numFactura, iva y descuento son requeridos.'}), 400
        nuevaCompra = Compra(idCompra=None, idProveedor=idProveedor, fechaCompra=fechaCompra, numFactura=numFactura, iva=iva, descuento=descuento)
        db.session.add(nuevaCompra)
        db.session.commit()
        return jsonify({'mensaje': 'Compra agregada', 'idCompra': nuevaCompra.idCompra}), 201
    except IntegrityError as e:
        if 'foreign key constraint fails' in str(e):
            return jsonify({'error': 'El proveedor no existe. Por favor, asegúrate de que el idProveedor sea válido.'}), 400
        return jsonify({'error': 'Error de integridad en la base de datos. Por favor, verifica los datos proporcionados.'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500
@app.route('/compra/<int:idCompra>', methods=['DELETE'])
def delete_compra(idCompra):
    try:
        compra = Compra.query.filter_by(idCompra=idCompra).first()
        if compra is None:
            return jsonify({'message': 'Compra no encontrada'}), 404
        db.session.delete(compra)
        db.session.commit()
        return jsonify({'resultado': f'Compra {idCompra} borrada exitósamente.'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
@app.route('/compra/<int:idCompra>', methods=['PUT'])
def modificar_compra(idCompra):
    try:
        compra = Compra.query.filter_by(idCompra=idCompra).first()
        if compra is None:
            return jsonify({'message': 'Compra no encontrada'}), 404
        data = request.get_json()
        idProveedor = data.get('idProveedor')
        fechaCompra = data.get('fechaCompra')
        numFactura = data.get('numFactura')
        descuento = data.get('descuento')
        iva = data.get('iva')
        if idProveedor is None or fechaCompra is None or numFactura is None or iva is None or descuento is None:
            return jsonify({'error': 'Faltan datos obligatorios: idProveedor, fechaCompra, numFactura, iva y descuento son requeridos.'}), 400
        compra.idProveedor = idProveedor
        compra.fechaCompra = fechaCompra
        compra.numFactura = numFactura
        compra.iva = iva
        compra.descuento = descuento
        db.session.commit()
        return jsonify({'mensaje': 'Compra actualizada exitosamente'}), 200
    except IntegrityError as e:
        if 'foreign key constraint fails' in str(e):
            return jsonify({'error': 'El proveedor no existe. Por favor, asegúrate de que el idProveedor sea válido.'}), 400
        return jsonify({'error': 'Error de integridad en la base de datos. Por favor, verifica los datos proporcionados.'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# detalle_compra
@app.route('/compras/detalle', methods=['GET']) # todos
def get_detalle_compras():
    try:
        detalle = DetalleCompra.query.all()
        resultado = detalleCompras_schema.dump(detalle)
        return jsonify(resultado)
    except Exception as e:
        return jsonify({'error': str(e)}), 500
@app.route('/compras/detalle/compra/<int:idCompra>', methods=['GET']) # una compra
def get_detalle_compra(idCompra):
    try:
        detalle = DetalleCompra.query.filter_by(idCompra=idCompra).all()
        if not detalle:
            return jsonify({'error': 'No se encontraron detalles para esta compra'}), 404
        resultado = detalleCompras_schema.dump(detalle)
        return jsonify(resultado), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
@app.route('/compras/detalle/<int:idDetalle>', methods=['GET']) # un registro x registro
def get_registro_compra(idDetalle):
    try:
        detalle = DetalleCompra.query.filter_by(idDetalle=idDetalle).first()
        if not detalle:
            return jsonify({'mensaje': f'con id {idDetalle} detalle de compra no hallada.'}),404
        resultado = detalleCompra_schema.dump(detalle)
        return jsonify(resultado),200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
@app.route('/compras/xbalanza/<int:idBalanza>', methods=['GET']) # x idBalanza
def get_registro_balanza(idBalanza):
    detalles = DetalleCompra.query.all()
    result = detalleCompras_schema.dump(detalles)
    compras_filtradas = [compra for compra in result if compra.get('balanza') and compra['balanza'].get('idBalanza') == idBalanza]
    if not compras_filtradas:
        return {"message": "No se encontraron compras para esa balanza"}, 404
    return {"compras": compras_filtradas}, 200
@app.route('/compra/agrega_detalle', methods=['POST'])
def agregar_detalle_compra():
    try:
        data = request.get_json()
        if not all(k in data for k in ('idCompra', 'idProveedor', 'idProducto', 'unidades', 'cantidad', 'precioUnitario', 'precioFinal', 'importe', 'importeFinal','precioBalanzaActual', 'precioBalanzaSugerido','pesoPromedioActual', 'pesoPromedioNuevo')):
            return jsonify({'error': 'Faltan datos obligatorios'}), 400
        idCompra = data['idCompra']
        idProveedor = data['idProveedor']
        idProducto = data['idProducto']
        unidades = data['unidades']
        cantidad = data['cantidad']
        precioUnitario = data['precioUnitario']
        precioFinal = data['precioFinal']
        importe = data['importe']
        importeFinal = data['importeFinal']
        precioBalanzaActual = data['precioBalanzaActual']
        precioBalanzaSugerido = data['precioBalanzaSugerido']
        pesoPromedioActual = data['pesoPromedioActual']
        pesoPromedioNuevo = data['pesoPromedioNuevo']
        nuevo_detalle = DetalleCompra(idCompra=idCompra,idProveedor=idProveedor,idProducto=idProducto,unidades=unidades,cantidad=cantidad,precioUnitario=precioUnitario,precioFinal=precioFinal,importe=importe,importeFinal=importeFinal, precioBalanzaActual=precioBalanzaActual, precioBalanzaSugerido=precioBalanzaSugerido,pesoPromedioActual=pesoPromedioActual,pesoPromedioNuevo=pesoPromedioNuevo)
        db.session.add(nuevo_detalle)
        db.session.commit()
        resultado = detalleCompra_schema.dump(nuevo_detalle)
        return jsonify({'message': 'Detalle de compra agregado exitosamente', 'data': resultado}), 201
    except IntegrityError:
        db.session.rollback()
        return jsonify({'error': 'Error de integridad en la base de datos'}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500
@app.route('/compra/detalle/<int:idDetalle>', methods=['DELETE'])
def borrar_detalle(idDetalle):
    try:
        detalle = DetalleCompra.query.filter_by(idDetalle=idDetalle).first()
        if not detalle:
            return jsonify({'mensaje': f'con id {idDetalle} detalle de compra no hallada.'}),404
        db.session.delete(detalle)
        db.session.commit()
        return jsonify({'mensaje': f'compra con id {idDetalle} fue borrada exitosamente.'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500
@app.route('/compra/detalle/<int:idDetalle>', methods=['PUT'])
def modificar_detalle(idDetalle):
    try:
        detalle = DetalleCompra.query.filter_by(idDetalle=idDetalle).first()
        if not detalle:
            return jsonify({'mensaje': f'Detalle de compra con id {idDetalle} no encontrado.'}), 404
        data = request.get_json()
        if 'idCompra' in data and isinstance(data['idCompra'], int):
            detalle.idCompra = data['idCompra']
        if 'idProveedor' in data and isinstance(data['idProveedor'], int):
            detalle.idProveedor = data['idProveedor']
        if 'idProducto' in data and isinstance(data['idProducto'], int):
            detalle.idProducto = data['idProducto']
        if 'unidades' in data:
            if isinstance(data['unidades'], int) or data['unidades'] is None:
                detalle.unidades = data['unidades']
            else:
                return jsonify({'error': 'El campo unidades debe ser un entero o nulo.'}), 400
        if 'cantidad' in data:
            try:
                detalle.cantidad = float(data['cantidad'])
            except ValueError:
                return jsonify({'error': 'El campo cantidad debe ser un número decimal.'}), 400
        if 'precioUnitario' in data:
            try:
                detalle.precioUnitario = float(data['precioUnitario'])
            except ValueError:
                return jsonify({'error': 'El campo precioUnitario debe ser un número decimal.'}), 400
        if 'precioFinal' in data:
            try:
                detalle.precioFinal = float(data['precioFinal'])
            except ValueError:
                return jsonify({'error': 'El campo precioFinal debe ser un número decimal.'}), 400
        if 'importe' in data:
            try:
                detalle.importe = float(data['importe'])
            except ValueError:
                return jsonify({'error': 'El campo importe debe ser un número decimal.'}), 400
        if 'importeFinal' in data:
            try:
                detalle.importeFinal = float(data['importeFinal'])
            except ValueError:
                return jsonify({'error': 'El campo importeFinal debe ser un número decimal.'}), 400
        db.session.commit()
        return jsonify({'mensaje': f'Detalle de compra con id {idDetalle} fue modificado exitosamente.'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500
@app.route('/compras/detalle/ivaleopardo' ,methods=['POST'])
def corregirIVALeopardo():
    try:
        sql = text("UPDATE detalle_compra SET precioFinal = precioUnitario, importeFinal = precioUnitario WHERE idProveedor = 25 AND idProducto = 9999 AND precioFinal != precioUnitario;")
        db.session.execute(sql)
        db.session.commit()
        return jsonify({"message":"Registro corregido con éxito"})
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Se ha producido un error: " + str(e)}), 500

# relacion_productos
@app.route('/relacion', methods= ['GET'])
def get_relacion():
    try:
        relacion = RelacionProductos.query.all()
        resultado = relacionProductos_schema.dump(relacion)
        return jsonify(resultado)
    except Exception as e:
        return jsonify({'error': str(e)}), 500
@app.route('/relacion', methods=['POST'])
def agregar_relacion():
    try:
        data = request.get_json()
        if not all(k in data for k in ('idBalanza','idProducto', 'idProveedor', 'idProdXProv', 'margen','pesoPromedio','observacion')):
            return jsonify({'error': 'Faltan datos obligatorios'}), 400
        idBalanza = data['idBalanza']
        idProducto = data['idProducto']
        idProveedor = data['idProveedor']
        idProdXProv = data['idProdXProv']
        margen = data['margen']
        pesoPromedio = data['pesoPromedio']
        observacion = data['observacion']
        nuevaRelacion = RelacionProductos(idBalanza=idBalanza,idProducto=idProducto,idProveedor=idProveedor,idProdXProv=idProdXProv,margen=margen,pesoPromedio=pesoPromedio,observacion=observacion)
        db.session.add(nuevaRelacion)
        db.session.commit()
        return jsonify({'message': 'Relación agregada exitosamente',
                        'datos' : data}),201
    except IntegrityError as e:
        db.session.rollback()
        if 'Duplicate entry' in str(e.orig):
            return jsonify({'error': 'Registro ya existe (clave duplicada)'}), 400
        else:
            return jsonify({'error': 'Error de integridad en la base de datos'}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500
@app.route('/relacion', methods=['DELETE'])
def borrar_relacion():
    try:
        data = request.get_json()
        if not all(k in data for k in ('idBalanza', 'idProdXProv', 'idProducto', 'idProveedor')):
            return jsonify({'error': 'Faltan datos obligatorios para borrar registro'}), 400
        idBalanza1 = data['idBalanza']
        idProducto1 = data['idProducto']
        idProveedor1 = data['idProveedor']
        idProdXProv1 = data['idProdXProv']
        relacion = RelacionProductos.query.filter_by(
            idBalanza=idBalanza1,
            idProducto=idProducto1,
            idProveedor=idProveedor1,
            idProdXProv=idProdXProv1
        ).first()
        if not relacion:
            return jsonify({'error': 'Relación no encontrada'}), 404
        db.session.delete(relacion)
        db.session.commit()
        return jsonify({'mensaje': f'Relación {relacion} borrada exitosamente'}), 204
    except Exception as e:
        return jsonify({'error': str(e)}), 500
@app.route('/relacion/peso', methods=['PUT'])
def modificar_peso():
    try:
        data = request.get_json()
        if not all(k in data for k in ('idBalanza', 'idProdXProv', 'idProducto', 'idProveedor', 'pesoPromedio')):
            return jsonify({'error': 'Faltan datos obligatorios para modificar el peso promedio del registro'}), 400
        idBalanza1 = data['idBalanza']
        idProducto1 = data['idProducto']
        idProveedor1 = data['idProveedor']
        idProdXProv1 = data['idProdXProv']
        pesoPromedio1 = data['pesoPromedio']
        relacion = RelacionProductos.query.filter_by(
            idBalanza=idBalanza1,
            idProducto=idProducto1,
            idProveedor=idProveedor1,
            idProdXProv=idProdXProv1
        ).first()
        if not relacion:
            return jsonify({'error': 'Relación no encontrada'}), 404
        relacion.pesoPromedio = pesoPromedio1
        db.session.commit()
        return jsonify({'mensaje': 'Actualizado con éxito',
                        'data': {
                            'idBalanza': idBalanza1,
                            'idProducto': idProducto1,
                            'idProveedor': idProveedor1,
                            'idProdXProv': idProdXProv1,
                            'pesoPromedio': relacion.pesoPromedio
                        }}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
@app.route('/relacion/margen', methods=['PUT'])
def modificar_margen():
    try:
        data = request.get_json()
        if not all(k in data for k in ('idBalanza', 'idProdXProv', 'idProducto', 'idProveedor', 'margen')):
            return jsonify({'error': 'Faltan datos obligatorios para modificar el margen del registro'}), 400
        idBalanza1 = data['idBalanza']
        idProducto1 = data['idProducto']
        idProveedor1 = data['idProveedor']
        idProdXProv1 = data['idProdXProv']
        margen1 = data['margen']
        relacion = RelacionProductos.query.filter_by(
            idBalanza=idBalanza1,
            idProducto=idProducto1,
            idProveedor=idProveedor1,
            idProdXProv=idProdXProv1
        ).first()
        if not relacion:
            return jsonify({'error': 'Relación no encontrada'}), 404
        relacion.margen = margen1
        db.session.commit()
        return jsonify({'mensaje': 'Actualizado con éxito',
                        'data': {
                            'idBalanza': idBalanza1,
                            'idProducto': idProducto1,
                            'idProveedor': idProveedor1,
                            'idProdXProv': idProdXProv1,
                            'margen': relacion.margen
                        }}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ultimoPrecio
@app.route('/actualizar_precio', methods=['GET'])
def actualizar_precio():
    try:
        drop_query = "DROP TABLE IF EXISTS ultimoPrecio;"
        db.session.execute(text(drop_query))
        db.session.commit()
        create_query = """
        CREATE TABLE ultimoPrecio AS
        SELECT 
            dc.idDetalle,
            dc.precioFinal,
            dc.pesoPromedioNuevo,
            rp.idBalanza,
            rp.idProducto,
            rp.idProveedor,
            rp.idProdXProv,
            c.fechaCompra
        FROM detalle_compra dc
        JOIN relacion_productos rp 
            ON dc.idProveedor = rp.idProveedor 
            AND dc.idProducto = rp.idProdXProv
        JOIN compra c
            ON dc.idCompra = c.idCompra
        WHERE c.fechaCompra = (
              SELECT MAX(c2.fechaCompra)
              FROM compra c2
              JOIN detalle_compra dc2 ON c2.idCompra = dc2.idCompra
              WHERE dc2.idProducto = dc.idProducto
                AND dc2.idProveedor = dc.idProveedor
          )
        ORDER BY rp.idBalanza, c.fechaCompra DESC;
        """
        db.session.execute(text(create_query))
        db.session.commit()  # Confirmar la creación de la nueva tabla
        return jsonify({'message': 'Tabla `ultimoPrecio` actualizada correctamente.'}), 200
    except Exception as e:
        app.logger.error(f"Error al ejecutar la consulta: {str(e)}")
        return jsonify({'message': 'Hubo un error al procesar la solicitud.'}), 500
@app.route('/ultimo_precio', methods=['GET'])
def mostrar_ultimoPrecio():
    ultimoPrecio = UltimoPrecio.query.all()
    resultado = ultimosPrecios_schema.dump(ultimoPrecio)
    return jsonify(resultado)

#valuacion
@app.route('/valuacion', methods=['GET'])
def ultimaValuacion():
    try:
        consulta = """
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
        """
        
        resultado = db.session.execute(text(consulta))
        columnas = resultado.keys()
        resultados_json = [dict(zip(columnas, row)) for row in resultado]
        return jsonify(resultados_json), 200
    
    except Exception as e:
        app.logger.error(f"Error al ejecutar la consulta: {str(e)}")
        return jsonify({'message': 'Hubo un error al procesar la solicitud.'}), 500

if __name__=='__main__':  
    app.run(debug=True, port=5000) 
