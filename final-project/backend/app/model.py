from transformers import pipeline

classifier = None
THRESHOLD = 0.7


def get_classifier():
    global classifier

    if classifier is None:
        classifier = pipeline(
            "text-classification",
            model="textdetox/bert-multilingual-toxicity-classifier"
        )

    return classifier


def predict_toxicity(text: str):
    model = get_classifier()
    result = model(text)

    top = result[0]
    label = str(top["label"]).lower()
    score = float(top["score"])

    is_toxic = score >= THRESHOLD

    return {
        "label": label,
        "score": score,
        "is_toxic": is_toxic
    }