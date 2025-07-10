from marshmallow import Schema, fields

class SignupRequestOTPSchema(Schema):
    username = fields.Str(required=True)
    mobile = fields.Str(required=True)

class SignupVerifyOTPSchema(Schema):
    code = fields.Integer(required=True)

class LoginRequestOTPSchema(Schema):
    mobile = fields.Str(required=True)

class LoginVerifyOTPSchema(Schema):
    code = fields.Integer(required=True) 