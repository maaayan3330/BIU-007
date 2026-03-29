from pydantic import BaseModel


class PredictRequest(BaseModel):
    text: str
    platform: str | None = None


class PredictResponse(BaseModel):
    label: str
    score: float
    is_toxic: bool