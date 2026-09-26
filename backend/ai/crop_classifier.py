def extract_crop(label):
    return label.split("_")[0]


def get_crop_from_predictions(predictions):
    if not predictions:
        return None

    return predictions[0]["crop"]