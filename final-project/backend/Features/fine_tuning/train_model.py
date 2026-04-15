import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_recall_fscore_support
from datasets import Dataset
from transformers import AutoTokenizer, AutoModelForSequenceClassification
from transformers import TrainingArguments, Trainer

# =====================
# 1. Load dataset
# =====================
df = pd.read_csv("dataset.csv")
df = df.drop_duplicates().reset_index(drop=True)

# =====================
# 2. Split dataset
# =====================
train_df, test_df = train_test_split(
    df,
    test_size=0.1,
    random_state=42,
    shuffle=True,
    stratify=df["label"]
)

train_df = train_df.copy()
test_df = test_df.copy()

train_df["split"] = "train"
test_df["split"] = "test"

# initialize prediction columns
train_df["predicted_label"] = ""
train_df["confidence"] = ""
train_df["is_correct"] = ""

# =====================
# 3. Convert to HF datasets
# =====================
train_dataset = Dataset.from_pandas(train_df[["text", "label"]], preserve_index=False)
test_dataset = Dataset.from_pandas(test_df[["text", "label"]], preserve_index=False)

# =====================
# 4. Load model
# =====================
model_name = "textdetox/bert-multilingual-toxicity-classifier"

tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForSequenceClassification.from_pretrained(model_name, num_labels=2)

# =====================
# 5. Tokenize
# =====================
def tokenize(example):
    return tokenizer(example["text"], truncation=True, padding="max_length")

tokenized_train = train_dataset.map(tokenize, batched=True)
tokenized_test = test_dataset.map(tokenize, batched=True)

# =====================
# 6. Metrics
# =====================
def compute_metrics(eval_pred):
    logits, labels = eval_pred
    preds = np.argmax(logits, axis=1)

    precision, recall, f1, _ = precision_recall_fscore_support(
        labels, preds, average="binary", zero_division=0
    )
    acc = accuracy_score(labels, preds)

    return {
        "accuracy": acc,
        "precision": precision,
        "recall": recall,
        "f1": f1,
    }

# =====================
# 7. Training settings
# =====================
training_args = TrainingArguments(
    output_dir="./results",
    learning_rate=2e-5,
    per_device_train_batch_size=8,
    per_device_eval_batch_size=8,
    num_train_epochs=3,
    save_strategy="no"
)

# =====================
# 8. Trainer
# =====================
trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=tokenized_train,
    eval_dataset=tokenized_test,
    compute_metrics=compute_metrics,
)

# =====================
# 9. Train
# =====================
trainer.train()

# =====================
# 10. Save model
# =====================
trainer.save_model("my_toxicity_model")
tokenizer.save_pretrained("my_toxicity_model")

# =====================
# 11. Predict on test set
# =====================
predictions = trainer.predict(tokenized_test)

logits = predictions.predictions
exp_logits = np.exp(logits - np.max(logits, axis=1, keepdims=True))
probs = exp_logits / np.sum(exp_logits, axis=1, keepdims=True)

pred_labels = np.argmax(probs, axis=1)
true_labels = predictions.label_ids
confidences = probs[np.arange(len(pred_labels)), pred_labels]

# fill test results
test_df = test_df.reset_index(drop=True)
test_df["predicted_label"] = pred_labels
test_df["confidence"] = np.round(confidences, 4)
test_df["is_correct"] = (test_df["label"] == test_df["predicted_label"])

# =====================
# 12. Merge into one final file
# =====================
full_results = pd.concat([train_df, test_df], ignore_index=True)
full_results.to_csv("full_results.csv", index=False, encoding="utf-8-sig")

# =====================
# 13. Final metrics
# =====================
acc = accuracy_score(true_labels, pred_labels)
precision, recall, f1, _ = precision_recall_fscore_support(
    true_labels, pred_labels, average="binary", zero_division=0
)

print("\n===== FINAL METRICS =====")
print(f"Accuracy:  {acc:.4f}")
print(f"Precision: {precision:.4f}")
print(f"Recall:    {recall:.4f}")
print(f"F1 score:  {f1:.4f}")

print("\nSaved:")
print("- full_results.csv")
print("- my_toxicity_model/")