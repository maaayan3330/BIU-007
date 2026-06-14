import pytest
from app.model import is_hebrew_or_mixed, predict_toxicity

def test_language_detection():
    # Pure English
    assert is_hebrew_or_mixed("Hello world") is False
    # Pure Hebrew
    assert is_hebrew_or_mixed("שלום עולם") is True
    # Mixed Text
    assert is_hebrew_or_mixed("Hello שופרסל") is True
    # Empty / Special characters
    assert is_hebrew_or_mixed("!!! 123456 😊") is False

def test_threshold_assignment():
    # English string should use 0.85. A score of 0.75 is below 0.85 -> Safe
    # (Note: This assumes a mock or controlled environment where you inspect the return dict)
    res_en = predict_toxicity("This is bad text")
    assert res_en["threshold"] == 0.85
    
    # Hebrew string should use 0.65.
    res_he = predict_toxicity("טקסט כלשהו")
    assert res_he["threshold"] == 0.65