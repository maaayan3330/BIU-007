"""
The model we use here "textdetox/bert-multilingual-toxicity-classifier"
it return 2 things : { "lable":   , "socre":  } 
lable can be - LABLE_1 = toxic or LABLE_2 = not toxic 
score - how mach the modle sure in is answer

improvment of the model: create a multi layer pipeline for the model
phase 1: The Preprocessing & Normalization Layer - done
in the predict toxicy function, call the clean_text() on the text

clean_text():
    - remove from text any obfuscation characters
    - collapse repeating characters (check for optimizations)
    - remove weird spacing
    - return the result

phase 2: The Chunking Engine - done, not very effective yet, not used in the pipeline yet
- call get_chunks(processed_text, chunk_size=15, overlap=5)
get_chunks(processed_text, chunk_size=15, overlap=5):
    - checks if text is shorter then the chunck size - if so, just return it
    - init a list of strings
    - slide the window across the text and add chunks
- analyze each chunk using the model
    - if one was found toxic, lable all of it as toxic
    - return more metrics - check how main works with it
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
    cleaned = re.sub(r'[\-\.\*\_\|\@]', '', text)
    
    # 2. Collapse repeating characters
    # If a character repeats 3 or more times, collapse it down to 1.
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

def get_chunks(text: str, chunk_size: int = 15, overlap: int = 5) -> list[str]:
    """
    takes a text and splits it into overlapping chunks
    """
    words = text.split()
    
    # If the text is empty or very short, return it as a single chunk
    if not words:
        return []
    if len(words) <= chunk_size:
        return [text]
        
    chunks = []
    # Slide the window across the text
    for i in range(0, len(words), chunk_size - overlap):
        chunk = " ".join(words[i:i + chunk_size])
        chunks.append(chunk)
        # Stop if the end of the window reaches the end of the text
        if i + chunk_size >= len(words):
            break

    return chunks

# The function the server uses to get prediction for toxicy on input text
def predict_toxicity(text: str):
    # 1: clean the text before the model processes it
    processed_text = clean_text(text)
    
    # 2: load the model
    model = get_classifier() # lazy loading the model each time
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

