from pathlib import Path
from typing import List
from transformers import (
    pipeline,
    AutoTokenizer,
    AutoModelForSequenceClassification,
)
import torch

classifier = None

# SWITCH MODEL HERE
MODEL_DIR = "maayan3330/hebrew-toxicity-detector"
# MODEL_DIR = "textdetox/bert-multilingual-toxicity-classifier"

THRESHOLD = 0.65
DEVICE = 0 if torch.cuda.is_available() else -1 # Using -1 for CPU, and 0 for the first GPU (if available)
BATCH_SIZE = 8 # currently fits for CPU optimization (4-8) - increase when using GPU?

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

def predict_toxicity_batch(texts: List[str]):
    # load model
    model = get_classifier()

    # The pipeline handles chunking the data into batches under the hood.
    raw_results = model(texts, batch_size=BATCH_SIZE)

    final_results = []

    # zip() pairs each input text with its corresponding model prediction
    for text, result in zip(texts, raw_results):
        label = str(result["label"]).lower()
        score = float(result["score"])

        is_toxic = ((label == "toxic") or (label == "label_1")) and score >= THRESHOLD

        final_results.append({
            "text": text,  # Added so the caller knows which result belongs to which string
            "label": label,
            "score": score,
            "threshold": THRESHOLD,
            "is_toxic": is_toxic
        })

    return final_results

# Example usage for testing:
if __name__ == "__main__":
    sample_messages = [
        "Hello, how are you?",
        "This is a test message.",
        "You are an idiot.", # Should trigger toxicity
        "I love this project!"
    ]
    
    results = predict_toxicity_batch(sample_messages)
    for res in results:
        print(f"[{'TOXIC' if res['is_toxic'] else 'CLEAN'}] Score: {res['score']:.2f} | Text: {res['text']}")