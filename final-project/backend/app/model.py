from pathlib import Path
from transformers import (
    pipeline,
    AutoTokenizer,
    AutoModelForSequenceClassification,
)

classifier = None

# SWITCH MODEL HERE

#  NEW fine-tuned model
MODEL_DIR = "maayan3330/hebrew-toxicity-detector"

# OLD model (uncomment to use instead)
# MODEL_DIR = "textdetox/bert-multilingual-toxicity-classifier"

THRESHOLD = 0.65


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
                tokenizer=tokenizer
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
    result = model(text)[0]

    label = str(result["label"]).lower()
    score = float(result["score"])

    is_toxic = ((label == "toxic") or (label == "label_1")) and score >= THRESHOLD

    return {
        "label": label,
        "score": score,
        "threshold": THRESHOLD,
        "is_toxic": is_toxic
    }