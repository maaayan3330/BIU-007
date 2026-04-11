"""
The model we use here "textdetox/bert-multilingual-toxicity-classifier"
it return 2 things : { "lable":   , "socre":  } 
lable can be - LABLE_1 = toxic or LABLE_2 = not toxic 
score - how mach the modle sure in is answer

improvment of the model: create a multi layer pipeline for the model
phase 1: The Preprocessing & Normalization Layer
in the predict toxicy function, call the clean_text() on the text

clean_text():
    - remove from text any obfuscation characters
    - collapse repeating characters (check for optimizations)
    - remove weird spacing
    - return the result
"""
import re
from transformers import pipeline

# A variable to store the model once
classifier = None
THRESHOLD = 0.7

def clean_text(text: str) -> str:
    """
    incharge of preprocessing & normalization of the input text 
    """
    # 1. Remove common obfuscation characters
    # Targets: dashes, asterisks, periods, underscores, pipes, and @ symbols
    cleaned = re.sub(r'[\-\.\*\_\|\@]', '', text)
    
    # 2. Collapse repeating characters
    # If a character repeats 3 or more times, collapse it down to 1.
    # We use 3+ instead of 2+ to avoid breaking valid Hebrew words with double Waw (וו) or Yod (יי).
    cleaned = re.sub(r'(.)\1{2,}', r'\1', cleaned)
    
    # 3. Clean up any weird spacing created by the removals
    cleaned = re.sub(r'\s+', ' ', cleaned).strip()
    
    return cleaned

def get_classifier():
    """
    returns the model and uses lazy loading to make sure it loads only once    
    """
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
    # phase 1: clean the text before the model processes it
    processed_text = clean_text(text)
    
    # Get the model
    model = get_classifier()
    result = model(processed_text)

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

if __name__ == "__main__": # only for testing - remove this later
    text = "ש-ר-מ-ו-ט-ה"
    print(clean_text(text))