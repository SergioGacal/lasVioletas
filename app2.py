from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_marshmallow import Marshmallow
from marshmallow import Schema, fields
from datetime import datetime
from sqlalchemy.exc import IntegrityError

app = Flask(__name__)
CORS(app)

app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:root@localhost/lasVioletas'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)
ma = Marshmallow(app)

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

class MedioPagoSchema(ma.Schema):
    class Meta:
        fields=('idMedioPago', 'descripcion')

medio_pago_schema = MedioPagoSchema()
medios_pago_schema = MedioPagoSchema(many=True)

class MotivoGastoSchema(ma.Schema):
    class Meta:
        fields=('idMotivo', 'descripcion')

motivo_gasto_schema = MotivoGastoSchema()
motivos_gasto_schema = MotivoGastoSchema(many=True)

class GastoSchema(ma.Schema):
    motivo = fields.Nested(MotivoGastoSchema)

    class Meta:
        fields=('idGasto', 'idMotivo', 'importe', 'fecha_gasto', 'fecha_pago', 'pagado', 'saldo', 'observaciones')

gasto_schema = GastoSchema()
gastos_schema = GastoSchema(many=True)

class PagoSchema(ma.Schema):
    gasto = fields.Nested(GastoSchema)
    medio_pago = fields.Nested(MedioPagoSchema)

    class Meta:
        fields=('idPago', 'idGasto', 'monto_pago', 'fecha_pago', 'idMedioPago', 'observaciones')

pago_schema = PagoSchema()
pagos_schema = PagoSchema(many=True)

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
    monto_pago = request.json['monto_pago']
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
        if gasto.saldo == 0:
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




if __name__ == '__main__':
    app.run(debug=True, port=5000)
