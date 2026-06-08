import unittest
from unittest.mock import patch, MagicMock
# Replace 'your_module_name' with the actual name of your python file
from app.model import predict_toxicity_batch, is_toxic_fast

class TestCascadingToxicityPipeline(unittest.TestCase):

    def test_fast_filter_logic(self):
        """Test Step 1: Ensure the regex catches the right things."""
        self.assertTrue(is_toxic_fast("this is a badword1"))
        self.assertTrue(is_toxic_fast("שנאה גדולה"))
        self.assertFalse(is_toxic_fast("hello world"))
        self.assertFalse(is_toxic_fast("good morning"))

    @patch('app.model.get_classifier')
    def test_batch_routing_and_short_circuiting(self, mock_get_classifier):
        """Test Step 2: Ensure the batch function routes traffic correctly."""
        
        # 1. Setup a fake BERT model that always returns "neutral"
        mock_pipeline = MagicMock()
        # It needs to return a list of results matching the size of the input it receives
        mock_pipeline.return_value = [{"label": "neutral", "score": 0.1}]
        mock_get_classifier.return_value = mock_pipeline

        # 2. Create a mixed batch of 2 texts
        # - Item 0: Clean (Should go to BERT)
        # - Item 1: Toxic (Should be caught by Fast Filter)
        batch_input = ["hello world", "זה משפט עם שנאה"]

        # 3. Run the batch function
        results = predict_toxicity_batch(batch_input)

        # 4. Verify the final output structure
        self.assertEqual(len(results), 2)
        
        # Item 0 Verification (BERT)
        self.assertEqual(results[0]["source"], "bert")
        self.assertEqual(results[0]["is_toxic"], False)
        self.assertEqual(results[0]["text"], "hello world")
        
        # Item 1 Verification (Fast Filter)
        self.assertEqual(results[1]["source"], "fast_filter")
        self.assertEqual(results[1]["is_toxic"], True)
        self.assertEqual(results[1]["text"], "זה משפט עם שנאה")

        # 5. THE CRITICAL CHECK: Verify the heavy model's workload
        # It should ONLY have been called with ["hello world"], ignoring the toxic sentence
        mock_pipeline.assert_called_once_with(["hello world"], batch_size=unittest.mock.ANY)

    @patch('app.model.get_classifier')
    def test_complete_model_bypass(self, mock_get_classifier):
        """Test Step 3: Ensure a 100% toxic batch completely bypasses BERT."""
        mock_pipeline = MagicMock()
        mock_get_classifier.return_value = mock_pipeline

        pure_blocklist_batch = ["שנאה", "קללה", "badword1"]
        results = predict_toxicity_batch(pure_blocklist_batch)

        for res in results:
            self.assertEqual(res["source"], "fast_filter")

        # Verify the heavy model was completely ignored
        mock_pipeline.assert_not_called()

if __name__ == '__main__':
    unittest.main()