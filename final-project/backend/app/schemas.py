from pydantic import BaseModel

# How a request need to be
class PredictRequest(BaseModel):
    text: str
    platform: str | None = None

# How a response need to be
class PredictResponse(BaseModel):
    label: str
    score: float
    is_toxic: bool