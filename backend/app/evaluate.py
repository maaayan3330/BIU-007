"""
evaluation feature - done
"""
import os
import csv
import time
import json
from datetime import datetime
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

def helper_print_metrics(evaluation_metrics: Dict):
    print("\n--- Final Evaluation Results ---")
    print(f"Total Evaluated: {evaluation_metrics['total_records']}")
    print(f"Accuracy:  {evaluation_metrics['metrics']['accuracy'] * 100:.2f}%")
    print(f"Precision: {evaluation_metrics['metrics']['precision'] * 100:.2f}%")
    print(f"Recall:    {evaluation_metrics['metrics']['recall'] * 100:.2f}%")
    print(f"F1-Score:  {evaluation_metrics['metrics']['f1_score'] * 100:.2f}%")
    print("\nConfusion Matrix:")
    print(f"  TP: {evaluation_metrics['confusion_matrix']['true_positives']} | FP: {evaluation_metrics['confusion_matrix']['false_positives']}")
    print(f"  FN: {evaluation_metrics['confusion_matrix']['false_negatives']} | TN: {evaluation_metrics['confusion_matrix']['true_negatives']}")

def calculate_metrics(evaluated_data: List[Dict]) -> Dict:
    """
    Compares predictions against ground truth to calculate key classification metrics.
    """
    print("\nCalculating metrics...")
    
    tp = 0  # True Positive: Model said toxic, and it IS toxic.
    tn = 0  # True Negative: Model said non-toxic, and it IS non-toxic.
    fp = 0  # False Positive: Model said toxic, but it is NOT toxic (False Alarm).
    fn = 0  # False Negative: Model said non-toxic, but it IS toxic (Missed it).

    for record in evaluated_data:
        expected = record["expected_is_toxic"]
        predicted = record["predicted_is_toxic"]

        if expected and predicted:
            tp += 1
        elif not expected and not predicted:
            tn += 1
        elif not expected and predicted:
            fp += 1
        elif expected and not predicted:
            fn += 1

    total = tp + tn + fp + fn

    # Calculate derived metrics (with safe division to prevent ZeroDivisionError)
    accuracy = (tp + tn) / total if total > 0 else 0.0
    precision = tp / (tp + fp) if (tp + fp) > 0 else 0.0
    recall = tp / (tp + fn) if (tp + fn) > 0 else 0.0

    # F1-Score is the harmonic mean of Precision and Recall
    f1_score = 2 * (precision * recall) / (precision + recall) if (precision + recall) > 0 else 0.0

    return {
        "total_records": total,
        "confusion_matrix": {
            "true_positives": tp,
            "true_negatives": tn,
            "false_positives": fp,
            "false_negatives": fn
        },
        "metrics": {
            "accuracy": round(accuracy, 4),
            "precision": round(precision, 4),
            "recall": round(recall, 4),
            "f1_score": round(f1_score, 4)
        }
    }

def save_evaluation_report(evaluation_metrics: Dict, dataset_name: str, output_dir: str = "eval_reports"):
    """
    Saves the evaluation metrics to a timestamped JSON file.
    """
    # Create the directory if it doesn't exist
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    # Generate a timestamp (e.g., 20260410_144408)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

    # Clean up the dataset name for the file (e.g., 'eval_english.csv' -> 'eval_english')
    clean_name = os.path.splitext(os.path.basename(dataset_name))[0]

    filename = f"report_{clean_name}_{timestamp}.json"
    filepath = os.path.join(output_dir, filename)

    # Add metadata to the report
    report_data = {
        "metadata": {
            "dataset": dataset_name,
            "timestamp": timestamp,
            "threshold_used": 0.7 # Hardcoded to match your model.py for now
        },
        "results": evaluation_metrics
    }

    # Write to file
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(report_data, f, indent=4)

    print(f"\nReport successfully saved to: {filepath}")
    return filepath

def save_evaluation_csv(evaluated_data: List[Dict], dataset_name: str, output_dir: str = "eval_reports"):
    """
    Saves the line-by-line evaluation results to a CSV file for manual inspection.
    """
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    # Generate a timestamp (matches the JSON report format)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    clean_name = os.path.splitext(os.path.basename(dataset_name))[0]
    
    filename = f"results_{clean_name}_{timestamp}.csv"
    filepath = os.path.join(output_dir, filename)

    # Write the detailed records to CSV
    with open(filepath, mode='w', encoding='utf-8', newline='') as file:
        writer = csv.writer(file)
        
        # Write the exact headers you requested
        writer.writerow(["text", "expected_is_toxic", "predicted_is_toxic", "confidence_score"])
        
        for record in evaluated_data:
            writer.writerow([
                record.get("text", ""),
                record.get("expected_is_toxic", ""),
                record.get("predicted_is_toxic", ""),
                record.get("confidence_score", "")
            ])

    print(f"Detailed results CSV successfully saved to: {filepath}")
    return filepath

if __name__ == "__main__":
    # add a file path to the csv containing the dataset
    target_dataset = "eval_hebrew.csv"
    
    # pipeline
    try: 
        # step 1: load data
        raw_data = load_evaluation_dataset(target_dataset)
        print(f"Successfully loaded {len(raw_data)} comments.")
        print("Sample data:", raw_data[0])

        # step 2: infer
        if raw_data:
            results = run_batch_inference(raw_data)
            print("\nSample Output Record:")
            print(results[0])
        
        # step 3: score
        evaluation_metrics = calculate_metrics(results) 
        helper_print_metrics(evaluation_metrics)

        # step 4: json and csv reports
        save_evaluation_report(evaluation_metrics, target_dataset)
        save_evaluation_csv(results, target_dataset)    

        print("\n=== Pipeline Complete ===")
                
    except Exception as e:
        print(f"pipeline error: {e}")
