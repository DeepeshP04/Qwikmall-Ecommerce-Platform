from .. import db

class Payment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    order_id = db.Column(db.Integer, db.ForeignKey('order.id'), nullable=False)
    amount = db.Column(db.DECIMAL(10, 2), nullable=False)
    currency = db.Column(db.String(3), nullable=False, default="INR", server_default="INR")
    status = db.Column(db.String(20), nullable=False, default="Pending")
    method = db.Column(db.String(20), nullable=False)
    payment_gateway = db.Column(db.String(50), nullable=True)
    gateway_order_id = db.Column(db.String(100), nullable=True)
    gateway_payment_id = db.Column(db.String(100), nullable=True)
    failure_reason = db.Column(db.String(500), nullable=True)
    paid_at = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=db.func.now())
    updated_at = db.Column(db.DateTime, default=db.func.now(), onupdate=db.func.now())
    
    user = db.relationship("User", backref="payments", lazy=True)
    order = db.relationship("Order", backref=db.backref("payments", lazy=True))

    __table_args__ = (
        db.UniqueConstraint("gateway_order_id", name="uq_payment_gateway_order_id"),
        db.UniqueConstraint("gateway_payment_id", name="uq_payment_gateway_payment_id"),
    )