def is_valid_leaf(predictions):
    if not predictions:
        return False

    return predictions[0]["confidence"] >= 0.70