from .. import db


class StoreSettings(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    data = db.Column(db.JSON, nullable=False)
    updated_at = db.Column(db.DateTime, default=db.func.now(), onupdate=db.func.now())
