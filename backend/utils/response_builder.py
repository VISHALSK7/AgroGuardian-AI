def build_success(data, message="Success"):
    return {
        "success": True,
        "message": message,
        "data": data
    }

def build_error(message):
    return {
        "success": False,
        "message": message
    }

def build_invalid(message, predictions=None):
    if predictions is None:
        predictions = []
    return {
        "status": "invalid",
        "message": message,
        "predictions": predictions
    }

def build_uncertain(predictions):
    return {
        "status": "uncertain",
        "predictions": predictions
    }
