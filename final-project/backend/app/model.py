# The model we use here "textdetox/bert-multilingual-toxicity-classifier"
# it return 2 things : { "lable":   , "socre":  } 
# lable can be - LABLE_1 = toxic or LABLE_2 = not toxic 
# score - how mach the modle sure in is answer

from transformers import pipeline

# A variable to store the model once
classifier = None
THRESHOLD = 0.7

# A function that return the model and also take care the modle will be uploud once - lazyy loading
def get_classifier():
    global classifier
    # If we stil did not uploud the model
    if classifier is None:
        # this is our model - NLP model : bert
        classifier = pipeline(
            "text-classification",
            model="textdetox/bert-multilingual-toxicity-classifier"
        )

    return classifier

# The function the server use get text
def predict_toxicity(text: str):
    # Get the model
    model = get_classifier()
    result = model(text)

    top = result[0]
    label = str(top["label"]).lower()
    score = float(top["score"])
    # Make a decision if it toxic
    is_toxic = (label == "label_1") and (score >= THRESHOLD)

    return {
        "label": label,
        "score": score,
        "is_toxic": is_toxic
    }