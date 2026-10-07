import uuid

from .. import db

class Order(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    order_number = db.Column(
        db.String(32),
        unique=True,
        nullable=True,
        default=lambda: uuid.uuid4().hex.upper(),
    )
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    subtotal = db.Column(db.DECIMAL(10, 2), nullable=False, default=0, server_default="0")
    tax_amount = db.Column(db.DECIMAL(10, 2), nullable=False, default=0, server_default="0")
    shipping_amount = db.Column(db.DECIMAL(10, 2), nullable=False, default=0, server_default="0")
    discount_amount = db.Column(db.DECIMAL(10, 2), nullable=False, default=0, server_default="0")
    total_price = db.Column(db.DECIMAL(10, 2), nullable=False)
    address_id = db.Column(db.Integer, db.ForeignKey('address.id'), nullable=False)
    currency = db.Column(db.String(3), nullable=False, default="INR", server_default="INR")
    status = db.Column(db.String(20), default='Pending')
    payment_method = db.Column(db.String(20), nullable=False)
    shipping_recipient = db.Column(db.String(100), nullable=True)
    shipping_phone = db.Column(db.String(20), nullable=True)
    shipping_address_line1 = db.Column(db.String(100), nullable=True)
    shipping_address_line2 = db.Column(db.String(100), nullable=True)
    shipping_city = db.Column(db.String(50), nullable=True)
    shipping_state = db.Column(db.String(50), nullable=True)
    shipping_postal_code = db.Column(db.String(10), nullable=True)
    shipping_country = db.Column(db.String(50), nullable=True)
    shipping_landmark = db.Column(db.String(100), nullable=True)
    created_at = db.Column(db.DateTime, default=db.func.now())
    updated_at = db.Column(db.DateTime, default=db.func.now(), onupdate=db.func.now())

    address = db.relationship('Address')
    order_items = db.relationship('OrderItem', backref='order', lazy=True)
    status_history = db.relationship(
        'OrderStatusHistory',
        backref='order',
        lazy=True,
        order_by='OrderStatusHistory.created_at',
    )

    __table_args__ = (
        db.UniqueConstraint("order_number", name="uq_order_number"),
    )

    def snapshot_shipping_address(self, address):
        self.shipping_recipient = address.recipient_name or address.user.username
        self.shipping_phone = address.recipient_phone or address.user.phone
        self.shipping_address_line1 = address.address_line1
        self.shipping_address_line2 = address.address_line2
        self.shipping_city = address.city
        self.shipping_state = address.state
        self.shipping_postal_code = address.postal_code
        self.shipping_country = address.country
        self.shipping_landmark = address.landmark

    def to_dict(self):
        address = self.address
        return {
            "id": self.id,
            "order_number": self.order_number,
            "user_id": self.user_id,
            "order_date": self.created_at.isoformat() if self.created_at else None,
            "total_price": float(self.total_price),
            "subtotal": float(self.subtotal),
            "tax_amount": float(self.tax_amount),
            "shipping_amount": float(self.shipping_amount),
            "discount_amount": float(self.discount_amount),
            "currency": self.currency,
            "address_id": self.address_id,
            "status": self.status,
            "payment_method": self.payment_method,
            "address": {
                "recipient_name": self.shipping_recipient or (address.recipient_name if address else None),
                "phone": self.shipping_phone or (address.recipient_phone if address else None),
                "address_line1": self.shipping_address_line1 or (address.address_line1 if address else None),
                "address_line2": self.shipping_address_line2 if self.shipping_address_line1 else (address.address_line2 if address else None),
                "city": self.shipping_city or (address.city if address else None),
                "state": self.shipping_state or (address.state if address else None),
                "postal_code": self.shipping_postal_code or (address.postal_code if address else None),
                "country": self.shipping_country or (address.country if address else None),
                "landmark": self.shipping_landmark if self.shipping_address_line1 else (address.landmark if address else None),
            } if self.address_id else None,
            "order_items": [item.to_dict() for item in self.order_items],
            "status_history": [
                {
                    "previous_status": entry.previous_status,
                    "status": entry.status,
                    "note": entry.note,
                    "changed_at": entry.created_at.isoformat() if entry.created_at else None,
                }
                for entry in self.status_history
            ],
        }
        
class OrderItem(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    order_id  =db.Column(db.Integer, db.ForeignKey('order.id'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('product.id'), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    price = db.Column(db.DECIMAL(10, 2))
    product_name = db.Column(db.String(100), nullable=True)
    product_sku = db.Column(db.String(64), nullable=True)
    line_total = db.Column(db.DECIMAL(10, 2), nullable=True)
    product = db.relationship('Product')

    def to_dict(self):
        primary_image = next(
            (image for image in self.product.images if image.is_primary),
            self.product.images[0] if self.product and self.product.images else None
        ) if self.product else None
        return {
            "id": self.id,
            "product_id": self.product_id,
            "product_name": self.product_name or (self.product.name if self.product else None),
            "product_sku": self.product_sku or (self.product.sku if self.product else None),
            "quantity": self.quantity,
            "price": float(self.price) if self.price is not None else 0,
            "line_total": float(self.line_total) if self.line_total is not None else (
                float(self.price or 0) * self.quantity
            ),
            "product": {
                "id": self.product.id,
                "name": self.product_name or self.product.name,
                "image_url": primary_image.image_url if primary_image else None,
                "image_alt_text": primary_image.alt_text if primary_image else None
            } if self.product else None
        }


class OrderStatusHistory(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('order.id'), nullable=False)
    previous_status = db.Column(db.String(20), nullable=True)
    status = db.Column(db.String(20), nullable=False)
    changed_by_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    note = db.Column(db.String(500), nullable=True)
    created_at = db.Column(db.DateTime, nullable=False, default=db.func.now())

    changed_by = db.relationship('User')

    __table_args__ = (
        db.Index('ix_order_status_history_order_created', 'order_id', 'created_at'),
    )