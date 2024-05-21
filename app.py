from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import text
from flask_marshmallow import Marshmallow
from marshmallow import Schema, fields
from datetime import datetime
import logging
from logging.handlers import RotatingFileHandler
from sqlalchemy.exc import IntegrityError
from decimal import Decimal

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

    <h1>Menú</h1>
    <h2>Endpoints</h2>

    <h3>get</h3>



    <h3>delete</h3>

    <h3>post</h3>

    <h3>put</h3>



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

# endpoints

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
        observaciones = request.json['observaciones']
        nuevo_gasto = Gasto(idGasto=None,idMotivo=idMotivo,importe=importe,fecha_gasto=fecha_gasto,fecha_pago=None,pagado=False, saldo=importe,observaciones=observaciones)
        db.session.add(nuevo_gasto)
        db.session.commit()
        return gasto_schema.jsonify(nuevo_gasto),200
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




if __name__=='__main__':  
    app.run(debug=True, port=5000) 
