from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_marshmallow import Marshmallow
from marshmallow import Schema, fields
from datetime import datetime

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



# Gasto
# Pago



if __name__ == '__main__':
    app.run(debug=True, port=5001)
