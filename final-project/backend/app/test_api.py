import unittest
from fastapi.testclient import TestClient

# Import your FastAPI app instance from your main file
from app.main import app 

class TestBatchEndpoint(unittest.TestCase):
    
    def setUp(self):
        # Create a test client that wraps your FastAPI app
        self.client = TestClient(app)

    def test_predict_batch_endpoint(self):
        # 1. Setup the JSON payload matching your PredictBatchRequest schema
        payload = {
            "texts": [
                "Hello, how are you?",
                "This is a test message.",
                "You are an idiot.", # Expected to trigger toxicity
                "I love this project!"
            ]
        }
        
        # 2. Fire a mock POST request to the endpoint
        response = self.client.post("/predict-batch", json=payload)
        
        # 3. Verify the HTTP status code
        self.assertEqual(response.status_code, 200, f"Expected 200 OK, got {response.status_code}. Response: {response.text}")
        
        # 4. Parse the JSON response body
        results = response.json()
        
        # 5. Verify the structure of the returned data
        self.assertIsInstance(results, list, "The endpoint should return a JSON array (list).")
        self.assertEqual(
            len(results), 
            len(payload["texts"]), 
            "The API should return exactly one result object per input string."
        )
        
        # 6. Verify the model's logical output via the API
        # First string is clean
        self.assertFalse(results[0]["is_toxic"], "A clean greeting should not be flagged.")
        self.assertEqual(results[0]["text"], payload["texts"][0], "The returned text should match the input.")
        
        # Third string is toxic
        self.assertTrue(results[2]["is_toxic"], "An explicit insult should be flagged as toxic.")
        self.assertEqual(results[2]["text"], payload["texts"][2], "The returned text should match the input.")

if __name__ == '__main__':
    unittest.main()