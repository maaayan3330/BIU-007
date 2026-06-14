from pathlib import Path
from typing import List
from transformers import (
    pipeline,
    AutoTokenizer,
    AutoModelForSequenceClassification,
)
import torch
import re

classifier = None

# SWITCH MODEL HERE
MODEL_DIR = "maayan3330/hebrew-toxicity-detector"
# MODEL_DIR = "textdetox/bert-multilingual-toxicity-classifier"

# Language-specific toxicity thresholds
THRESHOLDS = {
    "en": 0.85,         # Higher threshold for English to reduce false positives
    "he_mixed": 0.65    # Lower, more sensitive threshold for Hebrew and mixed text
}
DEVICE = 0 if torch.cuda.is_available() else -1 # Using -1 for CPU, and 0 for the first GPU (if available)
BATCH_SIZE = 8 # currently fits for CPU optimization (4-8) - increase when using GPU?
HEBREW_BLOCKLIST = {
    "שרמוטה",
    "בן זונה",
    "בת זונה",
    "קוקסינל",
    "הומו",
    "זונה",
    "כוסאמק",
    "סעמק",
    "זין",
    "מזדיין",
    "מפגר",
    "פיגור",
    "מניאק",
    "חרא",
    "כלבה",
    "אפס",
    "שרלילה",
    "נאצי",
    "מחבל",
    "שמאלני בוגד",
    "ימני קיצוני",
    "נוחבה",
    "אהבל",
    "מתלקקת",
    "אנסים",
    "אנס",
}
FAST_BLOCKLIST = {"badword1", "שנאה", "קללה"} | HEBREW_BLOCKLIST

def is_toxic_fast(text: str) -> bool:
    """
    Checks if the text contains any exact word matches from the blocklist.
    Uses regex to isolate words, supporting both English and Hebrew.
    """
    if not text:
        return False
        
    # \w matches English alphanumeric, \u0590-\u05FF matches Hebrew characters
    words = set(re.findall(r'\b[\w\u0590-\u05FF]+\b', text.lower()))
    
    # Return True if there is any overlap between the text's words and the blocklist
    return bool(words.intersection(FAST_BLOCKLIST))

def is_hebrew_or_mixed(text: str) -> bool:
    """
    Checks if the text contains any Hebrew characters.
    Uses the Unicode range for Hebrew: \u0590-\u05FF.
    """
    if not text:
        return False
    
    # Search for at least one Hebrew character
    hebrew_regex = re.compile(r'[\u0590-\u05FF]')
    return bool(hebrew_regex.search(text))

def get_classifier():
    global classifier

    if classifier is None:
        if isinstance(MODEL_DIR, Path):
            if not MODEL_DIR.exists():
                raise FileNotFoundError(f"Model folder not found: {MODEL_DIR}")

            tokenizer = AutoTokenizer.from_pretrained(
                str(MODEL_DIR),
                local_files_only=True
            )
            model = AutoModelForSequenceClassification.from_pretrained(
                str(MODEL_DIR),
                local_files_only=True
            )

            classifier = pipeline(
                "text-classification",
                model=model,
                tokenizer=tokenizer,
                device=DEVICE # use the host machine device (enables GPU if present)
            )
        else:
            tokenizer = AutoTokenizer.from_pretrained(MODEL_DIR)
            model = AutoModelForSequenceClassification.from_pretrained(MODEL_DIR)

            classifier = pipeline(
                "text-classification",
                model=model,
                tokenizer=tokenizer
            )

    return classifier

def predict_toxicity(text: str):
    model = get_classifier()
    
    # Detect language category
    lang_category = "he_mixed" if is_hebrew_or_mixed(text) else "en"
    
    # Fetch the dynamic threshold
    applied_threshold = THRESHOLDS[lang_category]

    # Run forward pass
    result = model(text)[0]

    label = str(result["label"]).lower()
    score = float(result["score"])

    # Evaluate using the dynamic threshold
    is_toxic = ((label == "toxic") or (label == "label_1")) and score >= applied_threshold

    return {
        "label": label,
        "score": score,
        "threshold": applied_threshold,
        "language_category": lang_category,
        "is_toxic": is_toxic
    }

def predict_toxicity_batch(texts: List[str]):
    model = get_classifier()
    
    # Pre-allocate a list to hold the results in their exact original order
    final_results = [None] * len(texts)
    
    # Lists to hold the sub-batch for the heavy model
    texts_for_model = []
    indices_for_model = []

    # --- L1: Cascading Filter Routing ---
    for i, text in enumerate(texts):
        
        # Check the fast filter first
        if is_toxic_fast(text):
            # If caught, generate the response instantly
            lang_category = "he_mixed" if is_hebrew_or_mixed(text) else "en"
            
            final_results[i] = {
                "text": text,
                "label": "toxic",
                "score": 1.0, # Absolute certainty for blocklist words
                "threshold": THRESHOLDS[lang_category],
                "language_category": lang_category,
                "is_toxic": True,
                "source": "fast_filter" # Added telemetry
            }
        else:
            # If it passes, queue it up for the BERT model
            texts_for_model.append(text)
            indices_for_model.append(i)

    # --- L2: Heavy Model Execution ---
    # Only run the model if there are texts left to process
    if texts_for_model:
        raw_results = model(texts_for_model, batch_size=BATCH_SIZE)
        
        # zip() pairs the sub-batch texts, predictions, and their original indices
        for text, result, original_index in zip(texts_for_model, raw_results, indices_for_model):
            lang_category = "he_mixed" if is_hebrew_or_mixed(text) else "en"
            applied_threshold = THRESHOLDS[lang_category]
            
            label = str(result["label"]).lower()
            score = float(result["score"])
            is_toxic = ((label == "toxic") or (label == "label_1")) and score >= applied_threshold

            final_results[original_index] = {
                "text": text,
                "label": label,
                "score": score,
                "threshold": applied_threshold,
                "language_category": lang_category,
                "is_toxic": is_toxic,
                "source": "bert" # Added telemetry
            }

    return final_results
