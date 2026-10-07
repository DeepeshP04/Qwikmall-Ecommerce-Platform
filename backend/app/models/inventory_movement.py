from .. import db


class InventoryMovement(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(db.Integer, db.ForeignKey('product.id'), nullable=False)
    quantity_change = db.Column(db.Integer, nullable=False)
    reason = db.Column(db.String(50), nullable=False)
    reference = db.Column(db.String(100), nullable=True)
    changed_by_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    created_at = db.Column(db.DateTime, nullable=False, default=db.func.now())

    changed_by = db.relationship('User')

    __table_args__ = (
        db.Index('ix_inventory_movement_product_created', 'product_id', 'created_at'),
    )
