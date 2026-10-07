from .. import db

class Product(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    sku = db.Column(db.String(64), nullable=True)
    name = db.Column(db.String(50), nullable=False)
    price = db.Column(db.DECIMAL(10, 2), nullable=False)
    description = db.Column(db.String(2000), nullable=False)
    stock = db.Column(db.Integer, nullable=False, default=0, server_default="0")
    is_active = db.Column(db.Boolean, nullable=False, default=True, server_default="1")
    category_id = db.Column(db.Integer, db.ForeignKey('category.id'), nullable=False)
    manufacturer = db.Column(db.String(50), nullable=False)
    brand = db.Column(db.String(50), nullable=False, default="", server_default="")
    created_at = db.Column(db.DateTime, default=db.func.now())
    updated_at = db.Column(db.DateTime, default=db.func.now(), onupdate=db.func.now())
    images = db.relationship('ProductImage', backref='product', lazy=True)
    reviews = db.relationship('Review', backref='product', lazy=True)
    inventory_movements = db.relationship('InventoryMovement', backref='product', lazy=True)

    __table_args__ = (
        db.UniqueConstraint("sku", name="uq_product_sku"),
    )