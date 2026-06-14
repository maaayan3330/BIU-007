from pydantic import BaseModel
from typing import List, Optional

# How a request need to be
class PredictRequest(BaseModel):
    text: str
    platform: str | None = None

# How a response need to be
class PredictResponse(BaseModel):
    label: str
    score: float
    is_toxic: bool
    text: Optional[str] = None
    
    # New fields for cascading architecture and dynamic thresholds
    threshold: float
    language_category: str
    source: Optional[str] = None

# How a batch request needs to be
class PredictBatchRequest(BaseModel):
    texts: List[str]