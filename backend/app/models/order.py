from .. import db

class Order(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    total_price = db.Column(db.DECIMAL(10, 2), nullable=False)
    address_id = db.Column(db.Integer, db.ForeignKey('address.id'), nullable=False)
    status = db.Column(db.String(20), default='Pending')
    payment_method = db.Column(db.String(20), nullable=False)
    created_at = db.Column(db.DateTime, default=db.func.now())
    updated_at = db.Column(db.DateTime, default=db.func.now(), onupdate=db.func.now())

    address = db.relationship('Address')
    order_items = db.relationship('OrderItem', backref='order', lazy=True)

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "order_date": self.created_at.isoformat() if self.created_at else None,
            "total_price": float(self.total_price),
            "address_id": self.address_id,
            "status": self.status,
            "payment_method": self.payment_method,
            "address": {
                "address_line1": self.address.address_line1,
                "address_line2": self.address.address_line2,
                "city": self.address.city,
                "state": self.address.state,
                "postal_code": self.address.postal_code,
                "country": self.address.country,
                "landmark": self.address.landmark,
            } if self.address else None,
            "order_items": [item.to_dict() for item in self.order_items]
        }
        
class OrderItem(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    order_id  =db.Column(db.Integer, db.ForeignKey('order.id'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('product.id'), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    price = db.Column(db.DECIMAL(10, 2))
    product = db.relationship('Product')

    def to_dict(self):
        primary_image = next(
            (image for image in self.product.images if image.is_primary),
            self.product.images[0] if self.product and self.product.images else None
        ) if self.product else None
        return {
            "id": self.id,
            "product_id": self.product_id,
            "quantity": self.quantity,
            "price": float(self.price) if self.price is not None else 0,
            "product": {
                "id": self.product.id,
                "name": self.product.name,
                "image_url": primary_image.image_url if primary_image else None,
                "image_alt_text": primary_image.alt_text if primary_image else None
            } if self.product else None
        }