"""
    The model we use here "textdetox/bert-multilingual-toxicity-classifier"
    it returns 2 things : { "lable":   , "socre":  } 
    lable can be - LABLE_1 = toxic or LABLE_2 = not toxic 
    score - the confidence of the model with his answer
    the main function imported from here is predict_toxicity. it activates a pipeline
    for predicting it the input text is toxic, that eventually ends with what the model predicts on processed data.
"""

import re
import os
from transformers import pipeline

classifier = None
HEBREW_THRESHOLD = 0.65
DEFAULT_THRESHOLD = 0.7
BLOCKLIST_FILE = "blocklist.txt"
ZERO_TOLERANCE_LIST = []

# --- hyperparameters for semantic chunking ---
MAX_CHUNK_LENGTH = 12
HEBREW_CONJUNCTIONS = {"אבל", "כי", "לכן", "אלא", "ואילו", "בגלל", "מכיוון"}
STRONG_PUNCT = {".", "!", "?", "\n"}
SOFT_PUNCT = {",", ";", ":"}

def clean_text(text: str) -> str:
    """
    incharge of preprocessing & normalization of the input text 
    """
    # 1. Remove common obfuscation characters with a space
    cleaned = re.sub(r'[\*\_\|\@\!\#\$\%\^]', ' ', text) # make this more efficient using negation!        
    # 2. Collapse repeating characters
    # If a character repeats 3 or more times, collapse it down to 1.
    cleaned = re.sub(r'(.)\1{2,}', r'\1', cleaned)
    
    # 3. Clean up any weird spacing created by the removals
    cleaned = re.sub(r'\s+', ' ', cleaned).strip()
    
    return cleaned

def is_hebrew(text: str) -> bool:
    """
    Checks if the text contains any Hebrew characters.
    Hebrew Unicode range is \u0590 to \u05FF.
    """
    return bool(re.search(r'[\u0590-\u05FF]', text))

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

def get_sliding_window_chunks(text: str, chunk_size: int = 8, overlap: int = 3) -> list[str]:
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

def check_heuristics(text: str) -> bool:
    text_lower = text.lower()
    for phrase in ZERO_TOLERANCE_LIST:
        if phrase in text_lower:
            return True
    return False

def load_file(file_path: str):
    """
    Loads file contents to the zero tolerance list
    """
    global ZERO_TOLERANCE_LIST

    if not os.path.exists(BLOCKLIST_FILE):
        print(f"warning: {BLOCKLIST_FILE} not found. runs without heuristics")
        return
    
    # use utf-8 encoding
    with open(BLOCKLIST_FILE, "r", encoding="utf-8") as file:
        loaded_list = []
        for line in file:
            # Strip whitespace and convert to lowercase
            cleaned_line = line.strip().lower()
            
            # Ignore empty lines and comments
            if cleaned_line and not cleaned_line.startswith("#"):
                loaded_list.append(cleaned_line)

        ZERO_TOLERANCE_LIST = loaded_list
        print(f"Successfully loaded {len(ZERO_TOLERANCE_LIST)} terms into the blocklist.")

load_file(BLOCKLIST_FILE) # Load the file immediately when the script runs - eager loading to memory

def get_semantic_chunks(text, max_length):
    """
    Splits Hebrew text logically based on punctuation and conjunctions.
    Merges segments back together up to max_length.
    """
    # 1: split to words and check length
    words = text.split()
    if len(words) < max_length:
        return [text]
    
    micro_segments = []
    current_segment = []

    # 2: split to micro chuncks
    for word in words:
        # Strip punctuation just to check if the core word is a conjunction
        clean_word = re.sub(r'[^a-zA-Z0-9\s]', '', word) # remove every non alphanumeric character

        # split before conjunctions (segment... clean_word = "או")
        if clean_word in HEBREW_CONJUNCTIONS and current_segment:
            micro_segments.append(" ".join(current_segment))
            current_segment = [word]
            continue # move on to the next word

        current_segment.append(word) # add word to current segment

        # split after punctuation
        if any(word.endswith(p) for p in STRONG_PUNCT | SOFT_PUNCT):
            micro_segments.append(" ".join(current_segment))
            current_segment = []
    
    if current_segment: # if finished segment early, add to the list 
        micro_segments.append(" ".join(current_segment))
    
    # 3: reasseble the chunks to size max_length - the greedy approach
    final_chunks = []
    current_chunk_words = []

    for segment in micro_segments:
        segment_words = segment.split()
        if not segment_words:
            continue

        # If adding this segment keeps us under the limit, glue them together
        if len(current_chunk_words) + len(segment_words) <= max_length:
            current_chunk_words.extend(segment_words)
        else:
            # Over the limit: save current chunk and start a new one
            if current_chunk_words:
                final_chunks.append(" ".join(current_chunk_words))
            current_chunk_words = segment_words

    if current_chunk_words:
        final_chunks.append(" ".join(current_chunk_words))
    
    # 4: catch any chunk that is still too long (edge case for no puncuations or conjunctions)
    safe_chunks = []
    for chunk in final_chunks:
        if len(chunk.split()) > max_length:
            safe_chunks.extend(get_sliding_window_chunks(chunk, chunk_size=max_length, overlap=3))
        else:
            safe_chunks.append(chunk)

    return final_chunks
    
# The function the server uses to get prediction for toxicy on input text
def predict_toxicity(text: str):
    # 1: clean the text before the model processes it
    processed_text = clean_text(text)

    # 2: check for hebrew and update treshold if needed
    is_heb = is_hebrew(processed_text)
    threshold = HEBREW_THRESHOLD if is_heb else DEFAULT_THRESHOLD
    
    # 3: check the cache for zero tolerence words
    if check_heuristics(processed_text):
        return {
            "label": "label_1",
            "score": 1.0, # 100% certain because it hit a hardcoded rule
            "is_toxic": True,
            "blocked_by": "heuristics"
        }
    
    # 4: routing according to language
    if is_heb:
        # Hebrew gets semantic chunking to protect morphology
        chunks = get_semantic_chunks(processed_text, max_length=MAX_CHUNK_LENGTH)
    else:
        # other languages are passed entirely to the model without chunking
        chunks = [processed_text]

    # 5: load the model and define variables
    model = get_classifier()
    highest_score = 0.0 # keeps track of the highest score of confidence
    is_toxic = False # initialized return value
    flagged_chunk = None
    label = None
    score = 0.0 

    # 6: Evaluate each chunk
    for chunk in chunks:
        if not chunk.strip():
            continue
            
        result = model(chunk)
        top = result[0]
        label = str(top["label"]).lower()
        score = float(top["score"])
        
        # Track the highest toxic score for debugging
        if label == "label_1" and score > highest_score:
            highest_score = score
            
        # If any single chunk crosses the threshold, flag the whole text
        if label == "label_1" and score >= threshold:
            is_toxic = True
            flagged_chunk = chunk
            # We break early to save server resources — no need to check the rest
            break
        
    final_label = "label_1" if is_toxic else "label_2"
    
    return {
        "label": final_label,
        "score": highest_score, # Return the peak toxicity found
        "is_toxic": is_toxic,
        "flagged_chunk": flagged_chunk # Highly recommend returning this for your dataset review!
    }


