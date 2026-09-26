def validate_crop(predictions, selected_crop):
    if not selected_crop:
        return "match"

    predicted_crop = predictions[0]["crop"].lower()

    if predicted_crop != selected_crop.lower():
        return "mismatch"

    return "match"