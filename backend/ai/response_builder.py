def build_success(data):
    return {
        "success": True,
        "data": data
    }


def build_error(message):
    return {
        "success": False,
        "message": message
    }