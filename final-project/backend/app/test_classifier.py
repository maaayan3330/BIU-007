import unittest
from model import predict_toxicity_batch

class TestToxicityClassifier(unittest.TestCase):

    def test_batch_prediction(self):
        # 1. Setup your test data
        sample_messages = [
            "Hello, how are you?",
            "This is a test message.",
            "You are an idiot.", # Expected: Toxic
            "I love this project!"
        ]
        
        # 2. Execute the function
        results = predict_toxicity_batch(sample_messages)
        
        # 3. Assert structural integrity
        self.assertEqual(
            len(results), 
            len(sample_messages), 
            "The model should return exactly one result dictionary per input string."
        )
        
        # 4. Assert logical correctness based on expected behavior
        # results[0] is "Hello, how are you?" -> Should be CLEAN (False)
        self.assertFalse(results[0]["is_toxic"], "A standard greeting should not be flagged as toxic.")
        
        # results[2] is "You are an idiot." -> Should be TOXIC (True)
        self.assertTrue(results[2]["is_toxic"], "An explicit insult should be flagged as toxic.")

if __name__ == '__main__':
    unittest.main()