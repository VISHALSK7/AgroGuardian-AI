"""
AgroGuardian AI — Input Validators
Marshmallow schemas + helper validation functions for API inputs.
"""
from marshmallow import Schema, fields, validate, ValidationError


# ── Disease Detection ──────────────────────────────────────────────────

class DiseaseInputSchema(Schema):
    """Validates that an image file is present in the request."""
    pass  # File validation is handled in the controller


# ── Pest Prediction ────────────────────────────────────────────────────

class PestInputSchema(Schema):
    crop_type = fields.String(required=True, validate=validate.Length(min=1, max=50))
    city = fields.String(load_default="Bengaluru")
    location = fields.String(load_default=None)  # "lat,lon"
    temperature = fields.Float(load_default=None)
    humidity = fields.Float(load_default=None)
    rainfall = fields.Float(load_default=None)
    wind = fields.Float(load_default=None)
    soil_moisture = fields.Float(load_default=None)
    date = fields.String(load_default=None)
    time = fields.String(load_default=None)
    forecast_days = fields.Int(load_default=7)
    month = fields.Int(load_default=6)


# ── Yield Prediction ──────────────────────────────────────────────────

class YieldInputSchema(Schema):
    crop = fields.String(required=True, validate=validate.Length(min=1, max=50))
    area = fields.Float(required=True, validate=validate.Range(min=0.1, max=10000))
    soil_type = fields.String(required=True)
    irrigation_type = fields.String(required=True)
    season = fields.String(required=True)
    city = fields.String(load_default="Bengaluru")
    location = fields.String(load_default=None)  # "lat,lon"
    fertilizer_usage = fields.Float(load_default=100.0)
    pesticide_usage = fields.Float(load_default=100.0)
    soil_quality = fields.Float(load_default=80.0)
    whatif_rainfall = fields.Float(load_default=0.0)
    whatif_fertilizer = fields.Float(load_default=0.0)
    whatif_irrigation = fields.Float(load_default=0.0)



# ── Chatbot ────────────────────────────────────────────────────────────

class ChatbotInputSchema(Schema):
    query = fields.String(required=True, validate=validate.Length(min=1, max=2000))
    language = fields.String(
        load_default=None,
        allow_none=True,
        validate=validate.OneOf(["en", "hi", "kn"]),
    )
    session_id = fields.String(load_default=None)


# ── Auth ───────────────────────────────────────────────────────────────

class LoginSchema(Schema):
    email = fields.Email(required=True)
    password = fields.String(required=True, validate=validate.Length(min=6))


class SignupSchema(Schema):
    name = fields.String(required=True, validate=validate.Length(min=2, max=100))
    email = fields.Email(required=True)
    password = fields.String(required=True, validate=validate.Length(min=6, max=128))
    phone = fields.String(load_default=None)


# ── Helper ─────────────────────────────────────────────────────────────

def validate_request(schema_class, data):
    """Validate data against a Marshmallow schema.

    Returns:
        tuple: (validated_data, errors) — errors is None on success.
    """
    schema = schema_class()
    try:
        result = schema.load(data)
        return result, None
    except ValidationError as e:
        return None, e.messages


ALLOWED_IMAGE_EXTENSIONS = {"png", "jpg", "jpeg", "webp"}


def allowed_file(filename: str) -> bool:
    return "." in filename and \
           filename.rsplit(".", 1)[1].lower() in ALLOWED_IMAGE_EXTENSIONS
