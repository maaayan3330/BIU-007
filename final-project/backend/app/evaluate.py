"""
this file focuses entirely on safely loading and parsing a dataset into memory
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
"""
import os
import csv
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

if __name__ == "__main__":
    # add a file path to the csv containing the dataset
    test_file = "mock_data.csv"
    
    try:
        data = load_evaluation_dataset(test_file)
        print(f"Successfully loaded {len(data)} comments.")
        print("Sample data:", data[0])
    except Exception as e:
        print(f"Error loading dataset: {e}")
