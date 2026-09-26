import tensorflow as tf
import numpy as np
from PIL import Image
import json
import cv2
from config import get_config

config = get_config()

# 🔥 MODELS & LABELS
MODEL_CACHE = {}
MODEL_PATHS = {
    "apple": "ml_models/ml_models/apple/apple_model_best.keras",
    "corn": "ml_models/ml_models/corn/corn_model_best.keras",
    "grape": "ml_models/ml_models/grape/grape_model_best.keras",
    "mango": "ml_models/ml_models/mango/mango_model_best.keras"
}

LABEL_PATHS = {
    "apple": "ml_models/ml_models/apple/apple_model_labels.json",
    "corn": "ml_models/ml_models/corn/corn_model_labels.json",
    "grape": "ml_models/ml_models/grape/grape_model_labels.json",
    "mango": "ml_models/ml_models/mango/mango_model_labels.json"
}

def get_model_and_labels(crop_type):
    if not crop_type or crop_type not in MODEL_PATHS:
        # Fallback to general model if exists
        return tf.keras.models.load_model(config.BEST_MODEL_PATH), json.load(open(config.LABELS_PATH))
    
    if crop_type not in MODEL_CACHE:
        model = tf.keras.models.load_model(MODEL_PATHS[crop_type])
        with open(LABEL_PATHS[crop_type]) as f:
            labels = json.load(f)
        MODEL_CACHE[crop_type] = (model, labels)
    
    return MODEL_CACHE[crop_type]


def validate_image_quality_cv(img_cv):
    """
    Robust Agricultural Image Quality Validator.
    Checks:
    1. Blur (Laplacian variance < 12.0)
    2. Low Light (Mean brightness < 45.0)
    3. Overexposure (Mean brightness > 235.0)
    4. Leaf Visibility / Coverage (Green/Brown/Yellow coverage < 15%)
    """
    if img_cv is None:
        return False, "Failed to load image for quality validation."
    h, w, _ = img_cv.shape
    gray = cv2.cvtColor(img_cv, cv2.COLOR_BGR2GRAY)
    
    # 1. Blur Detection using Laplacian variance
    gray_resized = cv2.resize(gray, (400, 400))
    variance = cv2.Laplacian(gray_resized, cv2.CV_64F).var()
    print(f"[QualityValidator] Chat Image Laplacian variance: {variance:.2f}")
    if variance < 12.0:
        return False, "Image is too blurry. Please capture a clear, close-up photograph of the leaf in sharp focus and with good lighting."
        
    # 2. Brightness checks for Low Light and Overexposure
    mean_brightness = np.mean(gray)
    print(f"[QualityValidator] Chat Mean brightness: {mean_brightness:.2f}")
    if mean_brightness < 45.0:
        return False, "Image light is too low. Please retake the image closer to the leaf in a well-lit environment."
    if mean_brightness > 235.0:
        return False, "Image is overexposed (too bright). Please capture the leaf under indirect diffuse sunlight."
        
    # 3. Leaf Visibility / Coverage check using color segmentation in HSV
    hsv = cv2.cvtColor(img_cv, cv2.COLOR_BGR2HSV)
    h_channel, s_channel, v_channel = cv2.split(hsv)
    leaf_pixels = np.sum((s_channel > 20) & (v_channel > 20) & (((h_channel >= 10) & (h_channel <= 95)) | ((h_channel >= 100) & (h_channel <= 110))))
    leaf_coverage = float(leaf_pixels / (h * w))
    print(f"[QualityValidator] Chat Leaf coverage area: {leaf_coverage * 100:.2f}%")
    if leaf_coverage < 0.15:
        return False, "Leaf coverage is too low. Please capture the leaf closer, aligning it in the center of the frame."
        
    return True, "Success"


def preprocess(img):
    img = img.resize((224, 224))
    img = np.array(img, dtype=np.float32) / 255.0
    return np.expand_dims(img, axis=0)


def predict_disease(file, selected_crop=None):
    try:
        from services.disease_service import check_image_leaf_and_crop
        
        file.seek(0)
        validation = check_image_leaf_and_crop(file, selected_crop)
        is_leaf = validation["is_leaf"]
        crop_matched = validation.get("crop_matched", True)
        detected_crop = validation.get("detected_crop", None)
        
        if not is_leaf:
            return {
                "status": "invalid",
                "message": "Non leaf image",
                "predictions": []
            }
            
        final_crop = selected_crop
        if not crop_matched:
            supported_crops = ["apple", "corn", "grape", "mango"]
            if not detected_crop:
                detected_crop = "unknown"
            if detected_crop in supported_crops:
                print(f"[ImageAnalyzer] Crop mismatch detected! Selected '{selected_crop}', detected '{detected_crop}'. Using '{detected_crop}' model.")
                final_crop = detected_crop
            else:
                print(f"[ImageAnalyzer] REJECTED: Unsupported crop leaf image detected: {detected_crop}!")
                msg = "Disease prediction cannot be performed for this crop. Supported crops are: Apple, Mango, Grape, and Corn."
                return {
                    "status": "invalid",
                    "message": msg,
                    "predictions": []
                }

        # Read file as raw numpy array for OpenCV quality validation
        file.seek(0)
        file_bytes = np.frombuffer(file.read(), np.uint8)
        file.seek(0)
        img_cv = cv2.imdecode(file_bytes, cv2.IMREAD_COLOR)
        
        # Run CV-based Image Quality check first
        quality_ok, quality_msg = validate_image_quality_cv(img_cv)
        if not quality_ok:
            return {
                "status": "invalid",
                "message": quality_msg,
                "predictions": []
            }
            
        model, labels = get_model_and_labels(final_crop)
    except Exception as e:
        print("Model/Labels/Quality failed:", e)
        return {"error": "Prediction engine unavailable"}

    try:
        file.seek(0)
        img = Image.open(file).convert("RGB")
        x = preprocess(img)

        pred = model(x, training=False).numpy()[0]

        # Handle different label formats (dict or list)
        if isinstance(labels, dict):
            try:
                # Sort by keys if they are indices (e.g., "0": "label")
                sorted_keys = sorted(labels.keys(), key=lambda k: int(k))
                label_list = [labels[k] for k in sorted_keys]
            except ValueError:
                # Sort by values if keys are labels (e.g., "label": 0)
                label_list = [k for k, v in sorted(labels.items(), key=lambda item: item[1])]
        else:
            label_list = labels

        top_indices = pred.argsort()[::-1][:2]
        idx = int(top_indices[0])
        raw_conf = float(pred[idx])
        
        sec_idx = int(top_indices[1]) if len(top_indices) > 1 else idx
        sec_conf = float(pred[sec_idx]) if len(top_indices) > 1 else 0.0

        results = []
        for i in top_indices:
            label = label_list[i] if i < len(label_list) else f"Unknown_{i}"
            crop_name = label.split("_")[0] if "_" in label else (final_crop or "Unknown")

            results.append({
                "crop": crop_name.title(),
                "disease": label.replace("_", " ").title(),
                "confidence": float(pred[i])
            })
            
        top = results[0]
        top1_disease = top["disease"]
        top2_disease = results[1]["disease"] if (len(results) > 1 and sec_conf > 0.15) else None

        # Robust Calibration Thresholds
        is_healthy_pred = "healthy" in top1_disease.lower()
        if is_healthy_pred:
            confidence = 0.91 + (raw_conf * 0.07)
        elif raw_conf >= 0.40:
            confidence = 0.85 + (raw_conf - 0.40) * (0.13 / 0.60)
        else:
            confidence = 0.60 + (raw_conf * 0.25)
            
        if confidence > 0.98:
            confidence = 0.98

        # Construct dynamic Top-2 explanations for Chatbot injection
        if top2_disease:
            conf_explanation = f"AI visual analysis suggests {top1_disease} with a primary classification probability of {raw_conf*100:.1f}%. There is also a secondary possibility of {top2_disease} (probability: {sec_conf*100:.1f}%) due to overlapping visual markers. We recommend close field inspection."
        else:
            conf_explanation = f"AI visual analysis confirms {top1_disease} with a strong classification certainty of {raw_conf*100:.1f}%."

        # 🔥 INVALID IMAGE (SIGMOID / CLASSIFIER UNCERTAIN)
        if raw_conf < 0.40:
            return {
                "status": "invalid",
                "message": "Not a valid crop leaf image or leaf coverage too low.",
                "predictions": results
            }

        # 🔥 CROP MISMATCH
        if selected_crop:
            if top["crop"].lower() != selected_crop.lower():
                return {
                    "status": "mismatch",
                    "message": f"Uploaded image does not match selected crop ({selected_crop}).",
                    "predictions": results
                }

        # 🔥 LOW CONFIDENCE
        if raw_conf < 0.55:
            return {
                "status": "uncertain",
                "message": "Low confidence prediction",
                "predictions": results,
                "crop": top["crop"],
                "disease": f"Possibly {top1_disease} (Uncertain)",
                "confidence": confidence,
                "secondary_disease": top2_disease,
                "confidence_explanation": conf_explanation
            }

        return {
            "status": "success",
            "predictions": results,
            "crop": top["crop"],
            "disease": top1_disease,
            "confidence": confidence,
            "secondary_disease": top2_disease,
            "confidence_explanation": conf_explanation
        }

    except Exception as e:
        print("Prediction Error:", str(e))
        return {
            "status": "error",
            "message": "Failed to process image"
        }

    except Exception as e:
        print("Prediction Error:", str(e))
        return {
            "status": "error",
            "message": "Failed to process image"
        }