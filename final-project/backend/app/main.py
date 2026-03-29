from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.schemas import PredictRequest, PredictResponse
from app.model import predict_toxicity

app = FastAPI(title="Toxicity Detection API")

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


@app.post("/predict", response_model=PredictResponse)
def predict(request: PredictRequest):
    result = predict_toxicity(request.text)
    return PredictResponse(**result)