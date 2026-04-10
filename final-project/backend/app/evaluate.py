"""
phase 1: safely loading and parsing a dataset into memory
main -> loads a varaible of the file path -> calls load_evaluation_dataset(file_path)

load_evaluation_dataset(file_path): 
    - checks if file exists (use os module)
    - inits a dataset
    - opens the file with read permissions
    - checks if the columns "text" and "lable" exist
    - for each row:
        - extract text
        - convert the string of boolean from the file to a real boolean
        - append to dataset
    - returns dataset

phase 2: Batch Inferencer - model execution wrapper
add imports of time and the predict toxicity
raw_data (from load_evaluation_dataset) -> pass to run_batch_inference

run_batch_inference(raw_data):
    - initialize recording methods
    - go over the dataset:
        - call predict_toxicy(text) - first call will start the model, the rest will lazy - load
        - store the results
        - 
"""
import os
import csv
import time
from model import predict_toxicity
from typing import Dict, List


def validation_helper(reader: csv.DictReader[str]) -> ValueError:
    """
    Receives reader and validates file isn't empty and has correct rows
    """
    # Validate that the file isn't empty and the necessary columns exist
    if reader.fieldnames is None:
        raise ValueError("The CSV file is completely empty.")

    # Validate that the necessary columns exist
    if not {'text', 'expected_is_toxic'}.issubset(reader.fieldnames):
        raise ValueError("CSV must contain 'text' and 'expected_is_toxic' columns.")

def load_evaluation_dataset(file_path: str) -> List[Dict]:
    """
    Reads the dataset from a CSV file.
    Expects columns: 'text' and 'expected_is_toxic' (True/False).
    """
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"Dataset not found in {file_path}")
    
    dataset = []
    with open(file=file_path, mode="r", encoding="utf-8") as file:
        reader = csv.DictReader(file)

        # Validate the file
        validation_helper(reader)
        
        # read the rows
        for row_num, row in enumerate(reader, start=1):
            text = row.get("text", "").strip()
            # Convert string representation of boolean to actual boolean
            expected_is_toxic_str = row.get("expected_is_toxic", "").strip().lower()
            expected_is_toxic = expected_is_toxic_str in ['true', '1', 't', 'yes'] # mulitple options for datasets

            if not text:
                print(f"Warning: Skipping row {row_num} due to missing text.")
                continue

            dataset.append({
                "text": text,
                "expected_is_toxic": expected_is_toxic
            })
        
    return dataset

def run_batch_inference(dataset: List[Dict]) -> List[Dict]:
    """
    Runs the classifier over the loaded dataset.
    Appends the model's prediction and confidence score to each record.
    """
    total_records = len(dataset)
    print(f"\nStarting inference on {total_records} records. Waking up the model...")
    
    start_time = time.time()
    evaluated_data = []

    for index, record in enumerate(dataset):
        text = record["text"]
        
        # 1. Run the actual model logic
        # The first call will trigger get_classifier() lazy-loading
        prediction = predict_toxicity(text)
        
        # 2. Store the results alongside the ground truth
        record["predicted_is_toxic"] = prediction["is_toxic"]
        record["confidence_score"] = prediction["score"]
        
        evaluated_data.append(record)
        
        # 3. Simple progress logging (prints every 10 records)
        if (index + 1) % 10 == 0 or (index + 1) == total_records:
            print(f"Processed {index + 1}/{total_records} records...")

    elapsed_time = time.time() - start_time
    print(f"Inference complete! Took {elapsed_time:.2f} seconds.")
    
    return evaluated_data

if __name__ == "__main__":
    # add a file path to the csv containing the dataset
    test_file = "eval_english.csv"
    
    try:
        # step 1: load data
        raw_data = load_evaluation_dataset(test_file)
        print(f"Successfully loaded {len(raw_data)} comments.")
        print("Sample data:", raw_data[0])

        # step 2: infer
        if raw_data:
            results = run_batch_inference(raw_data)
            print("\nSample Output Record:")
            print(results[0])

    except Exception as e:
        print(f"Error loading dataset: {e}")
