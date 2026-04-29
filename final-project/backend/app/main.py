from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from app.DB.database import engine, Base, get_db
from app.DB.db_models import Toxic_Comment, System_Stat, ToxicityCategory

from app.logger import log_prediction
from app.schemas import PredictRequest, PredictResponse
from app.model import predict_toxicity

# Create the database tables if they don't exist yet
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Toxicity Detection API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# === GET requests ===
@app.get("/")
def root():
    return {"message": "API is running"}

@app.get("/stats/total_comments")
def get_total_comments(db: Session = Depends(get_db)):
    stats = db.query(System_Stat).filter(System_Stat.id == 1).first()
    # If stats is None (no predictions made yet), default to 0
    return {"total_comments": stats.total_comments if stats else 0}

@app.get("/stats/total_toxic_comments")
def get_total_toxic_comments(db: Session = Depends(get_db)):
    stats = db.query(System_Stat).filter(System_Stat.id == 1).first()
    return {"total_toxic_comments": stats.total_toxic_comments if stats else 0}

@app.get("/stats/community_members")
def get_community_members(db: Session = Depends(get_db)):
    stats = db.query(System_Stat).filter(System_Stat.id == 1).first()
    return {"community_members": stats.community_members if stats else 0}

@app.get("/stats/total_reports")
def get_total_reports(db: Session = Depends(get_db)):
    stats = db.query(System_Stat).filter(System_Stat.id == 1).first()
    return {"total_reports": stats.total_reports if stats else 0}

# === POST requests ===

@app.post("/predict", response_model=PredictResponse)
def predict(request: PredictRequest, db: Session = Depends(get_db)):
    # Run the ML model
    result = predict_toxicity(request.text)

    # Extract results
    label = result.get("label", "general")
    score = result.get("score", 0.0)
    is_toxic = result.get("is_toxic", False)
    
    # add toxic comment to db
    if is_toxic:
        db_comment = Toxic_Comment(
            content=request.text,  # Taking the text from the request
            category=ToxicityCategory.GENERAL,
            score=score
        )
        db.add(db_comment)

    # update to global system stats 
    # Try to fetch the single stats row (id=1)
    stats = db.query(System_Stat).filter(System_Stat.id == 1).first()
    
    # If it doesn't exist yet, create it
    if not stats:
        stats = System_Stat(id=1, total_comments=0, total_toxic_comments=0, community_members=0, total_reports=0)
        db.add(stats)
    
    # Increment counters
    stats.total_comments += 1
    if is_toxic:
        stats.total_toxic_comments += 1

    # Commit all changes (saves both the comment and the stats at once)
    db.commit()

    return PredictResponse(**result)