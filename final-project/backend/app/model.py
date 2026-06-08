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

THRESHOLD = 0.65
# Language-specific toxicity thresholds
THRESHOLDS = {
    "en": 0.9,         # Higher threshold for English to reduce false positives
    "he_mixed": 0.65    # Lower, more sensitive threshold for Hebrew and mixed text
}
DEVICE = 0 if torch.cuda.is_available() else -1 # Using -1 for CPU, and 0 for the first GPU (if available)
BATCH_SIZE = 8 # currently fits for CPU optimization (4-8) - increase when using GPU?

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

    raw_results = model(texts, batch_size=BATCH_SIZE)

    final_results = []

    # zip() pairs each input text with its corresponding model prediction
    for text, result in zip(texts, raw_results):
        # Detect language category for THIS specific string
        lang_category = "he_mixed" if is_hebrew_or_mixed(text) else "en"
        
        # Fetch the dynamic threshold
        applied_threshold = THRESHOLDS[lang_category]

        label = str(result["label"]).lower()
        score = float(result["score"])

        # Evaluate using the dynamic threshold
        is_toxic = ((label == "toxic") or (label == "label_1")) and score >= applied_threshold

        final_results.append({
            "text": text,  
            "label": label,
            "score": score,
            "threshold": applied_threshold,
            "language_category": lang_category,
            "is_toxic": is_toxic
        })

    return final_results
