from pydantic import BaseModel
from typing import List

# How a request need to be
class PredictRequest(BaseModel):
    text: str
    platform: str | None = None

# How a response need to be
class PredictResponse(BaseModel):
    label: str
    score: float
    is_toxic: bool

# How a batch request needs to be
class PredictBatchRequest(BaseModel):
    texts: List[str]