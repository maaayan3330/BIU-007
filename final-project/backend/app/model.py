# """
#     The model we use here "textdetox/bert-multilingual-toxicity-classifier"
#     it returns 2 things : { "lable":   , "socre":  } 
#     lable can be - LABLE_1 = toxic or LABLE_2 = not toxic 
#     score - the confidence of the model with his answer
#     the main function imported from here is predict_toxicity. it activates a pipeline
#     for predicting it the input text is toxic, that eventually ends with what the model predicts on processed data.
# """

import re
import os
from transformers import pipeline

classifier = None
HEBREW_THRESHOLD = 0.65
DEFAULT_THRESHOLD = 0.7
# BLOCKLIST_FILE = "blocklist.txt"
ZERO_TOLERANCE_LIST = []

# # def clean_text(text: str) -> str:
# #     """
# #     incharge of preprocessing & normalization of the input text 
# #     """
# #     # 1. Remove common obfuscation characters with a space
# #     cleaned = re.sub(r'[\-\.\*\_\|\@]', ' ', text)
    
# #     # 2. Collapse repeating characters
# #     # If a character repeats 3 or more times, collapse it down to 1.
# #     cleaned = re.sub(r'(.)\1{2,}', r'\1', cleaned)
    
# #     # 3. Clean up any weird spacing created by the removals
# #     cleaned = re.sub(r'\s+', ' ', cleaned).strip()
    
# #     return cleaned

# # def is_hebrew(text: str) -> bool:
# #     """
# #     Checks if the text contains any Hebrew characters.
# #     Hebrew Unicode range is \u0590 to \u05FF.
# #     """
# #     return bool(re.search(r'[\u0590-\u05FF]', text))

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

# # def get_chunks(text: str, chunk_size: int = 8, overlap: int = 3) -> list[str]:
# #     """
# #     takes a text and splits it into overlapping chunks
# #     """
# #     words = text.split()
    
# #     # If the text is empty or very short, return it as a single chunk
# #     if not words:
# #         return []
# #     if len(words) <= chunk_size:
# #         return [text]
        
# #     chunks = []
# #     # Slide the window across the text
# #     for i in range(0, len(words), chunk_size - overlap):
# #         chunk = " ".join(words[i:i + chunk_size])
# #         chunks.append(chunk)
# #         # Stop if the end of the window reaches the end of the text
# #         if i + chunk_size >= len(words):
# #             break

# #     return chunks

# # def check_heuristics(text: str) -> bool:
# #     text_lower = text.lower()
# #     for phrase in ZERO_TOLERANCE_LIST:
# #         if phrase in text_lower:
# #             return True
# #     return False

# def load_file(file_path: str):
#     """
#     Loads file contents to the zero tolerance list
#     """
#     global ZERO_TOLERANCE_LIST

#     if not os.path.exists(BLOCKLIST_FILE):
#         print(f"warning: {BLOCKLIST_FILE} not found. runs without heuristics")
#         return
    
#     # use utf-8 encoding
#     with open(BLOCKLIST_FILE, "r", encoding="utf-8") as file:
#         loaded_list = []
#         for line in file:
#             # Strip whitespace and convert to lowercase
#             cleaned_line = line.strip().lower()
            
#             # Ignore empty lines and comments
#             if cleaned_line and not cleaned_line.startswith("#"):
#                 loaded_list.append(cleaned_line)

#         ZERO_TOLERANCE_LIST = loaded_list
#         print(f"Successfully loaded {len(ZERO_TOLERANCE_LIST)} terms into the blocklist.")

# load_file(BLOCKLIST_FILE) # Load the file immediately when the script runs - eager loading to memory

# # The function the server uses to get prediction for toxicy on input text
# def predict_toxicity(text: str):
#     # # 1: clean the text before the model processes it
#     # processed_text = clean_text(text)

#     # # 2: check for hebrew and update treshold if needed
#     # threshold = HEBREW_THRESHOLD if is_hebrew(processed_text) else DEFAULT_THRESHOLD
    
#     # # 3: check the cache for zero tolerence words
#     # if check_heuristics(processed_text):
#     #     return {
#     #         "label": "label_1",
#     #         "score": 1.0, # 100% certain because it hit a hardcoded rule
#     #         "is_toxic": True,
#     #         "blocked_by": "heuristics"
#     #     }
    
#     # # 4: split data into chunks
#     # chunks = get_chunks(processed_text)

#     # 5: load the model and define variables
#     model = get_classifier()
#     highest_score = 0.0 # keeps track of the highest score of confidence
#     is_toxic = False # initialized return value
#     flagged_chunk = None
#     label = None
#     score = 0.0 

#     # # 6: Evaluate each chunk
#     # for chunk in chunks:
#     #     if not chunk.strip():
#     #         continue
            
#     #     result = model(chunk)
#     #     top = result[0]
#     #     label = str(top["label"]).lower()
#     #     score = float(top["score"])
        
#     #     # Track the highest toxic score for debugging
#     #     if label == "label_1" and score > highest_score:
#     #         highest_score = score
            
#     #     # If any single chunk crosses the threshold, flag the whole text
#     #     if label == "label_1" and score >= threshold:
#     #         is_toxic = True
#     #         flagged_chunk = chunk
#     #         # We break early to save server resources — no need to check the rest
#     #         break
        
#     # final_label = "label_1" if is_toxic else "label_2"
    
#     return {
#         # "label": final_label,
#         "score": highest_score, # Return the peak toxicity found
#         "is_toxic": is_toxic,
#         "flagged_chunk": flagged_chunk # Highly recommend returning this for your dataset review!
#     }

#     # =======================================
#     # # 4: load the model and check the result
#     model = get_classifier() # lazy loading the model each time
#     result = model(processed_text)

#     # 5: extract results
#     top = result[0]
#     label = str(top["label"]).lower()
#     score = float(top["score"])
#     # Make a decision if its toxic
#     is_toxic = (label == "label_1") and (score >= threshold)
        
#     return {
#         "label": label,
#         "score": score,
#         "is_toxic": is_toxic
#     }

# The function the server uses to get prediction for toxicity on input text
def predict_toxicity(text: str):
    """
    Baseline prediction:
    - no preprocessing
    - no Hebrew threshold
    - no chunking
    - no heuristics
    just run the model directly on the full text
    """
    model = get_classifier()

    # Run prediction on the full input text
    result = model(text)
    top = result[0]

    label = str(top["label"]).lower()
    score = float(top["score"])

    # In this model:
    # label_1 = toxic
    # label_0 = not toxic
    is_toxic = (label == "label_1")

    return {
        "label": label,
        "score": score,
        "is_toxic": is_toxic
    }