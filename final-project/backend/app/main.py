# Import the libary FastAPI to create the web API server
from fastapi import FastAPI
# Import CORS middleware to allow requests from the browser extension
from fastapi.middleware.cors import CORSMiddleware

from app.schemas import PredictRequest, PredictResponse
from app.model import predict_toxicity

# Create the instance
app = FastAPI(title="Toxicity Detection API")

# middlware allow the browser extention to communicate 
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "API is running"}

# endpoint /predict recceives text from the client and respone
@app.post("/predict", response_model=PredictResponse)
def predict(request: PredictRequest):
    result = predict_toxicity(request.text)
    return PredictResponse(**result)