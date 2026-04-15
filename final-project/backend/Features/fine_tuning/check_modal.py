import os
import sys
import pandas as pd

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from app.model import predict_toxicity

# =====================
# 1. Load dataset
# =====================
df = pd.read_csv("dataset.csv")

blocked_results = []
not_blocked_results = []

print("===== RUNNING BASELINE BERT =====")

# =====================
# 2. Run predictions
# =====================
for _, row in df.iterrows():
    text = row["text"]
    true_label = row["label"]

    pred = predict_toxicity(text)

    is_toxic = pred["is_toxic"]          # True = blocked, False = not blocked
    confidence = pred["score"]
    is_correct = ((true_label == 1) and is_toxic) or ((true_label == 0) and not is_toxic)

    result_row = {
        "text": text,
        "correct": is_correct,
        "confidence": round(confidence, 4)
    }

    if is_toxic:
        blocked_results.append(result_row)
    else:
        not_blocked_results.append(result_row)

# =====================
# 3. Save results
# =====================
df_blocked = pd.DataFrame(blocked_results)
df_not_blocked = pd.DataFrame(not_blocked_results)

df_blocked.to_csv("blocked.csv", index=False, encoding="utf-8-sig")
df_not_blocked.to_csv("not_blocked.csv", index=False, encoding="utf-8-sig")

print("✅ Saved blocked.csv")
print("✅ Saved not_blocked.csv")