from typing import List
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from app.DB.database import engine, Base, get_db
from app.DB.db_models import Toxic_Comment, System_Stat, ToxicityCategory
from app.logger import log_prediction
from app.schemas import PredictRequest, PredictResponse, PredictBatchRequest
from app.model import predict_toxicity, predict_toxicity_batch
from app.category_classifier import classify_toxicity_category

# Create the database tables if they don't exist yet
Base.metadata.create_all(bind=engine)

# Create the FastAPI application instance
app = FastAPI(title="Toxicity Detection API")

# Allow requests from the frontend / Chrome extension.
# This is needed because the frontend runs on a different origin than the backend.
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

# maayan
@app.get("/stats")
def get_all_stats(db: Session = Depends(get_db)):
    stats = db.query(System_Stat).filter(System_Stat.id == 1).first()

    if not stats:
        return {
            "total_comments": 0,
            "total_toxic_comments": 0,
            "community_members": 0,
            "total_reports": 0,
            "report_rate": 0
        }

    report_rate = 0
    if stats.total_comments > 0:
        report_rate = round((stats.total_reports / stats.total_comments) * 100, 2)

    return {
        "total_comments": stats.total_comments,
        "total_toxic_comments": stats.total_toxic_comments,
        "community_members": stats.community_members,
        "total_reports": stats.total_reports,
        "report_rate": report_rate
    }
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
            category=classify_toxicity_category(request.text),
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

@app.post("/predict-batch", response_model=List[PredictResponse])
def predict_batch(request: PredictBatchRequest, db: Session = Depends(get_db)):
    # Run the optimized ML batch pipeline
    batch_results = predict_toxicity_batch(request.texts)

    toxic_count = 0
    
    # Process results and stage toxic comments for DB insertion
    for res in batch_results:
        if res.get("is_toxic", False):
            toxic_count += 1
            db_comment = Toxic_Comment(
                content=res.get("text"),
                category=classify_toxicity_category(res.get("text", "")),
                score=res.get("score", 0.0)
            )
            db.add(db_comment)

    # Retrieve or initialize global system metrics
    stats = db.query(System_Stat).filter(System_Stat.id == 1).first()
    if not stats:
        stats = System_Stat(id=1, total_comments=0, total_toxic_comments=0, community_members=0, total_reports=0)
        db.add(stats)
    
    # Apply batch increments in a single operation
    stats.total_comments += len(batch_results)
    stats.total_toxic_comments += toxic_count

    # Commit all records and metric tracking at once
    db.commit()

    return batch_results

@app.post("/stats/total_reports")
def add_report(db: Session = Depends(get_db)):
    # Try to fetch the single stats row (id=1)
    stats = db.query(System_Stat).filter(System_Stat.id == 1).first()
    
    # If it doesn't exist yet, create it to prevent errors
    if not stats:
        stats = System_Stat(
            id=1, 
            total_comments=0, 
            total_toxic_comments=0, 
            community_members=0, 
            total_reports=0
        )
        db.add(stats)
        
    # Increment the report counter
    stats.total_reports += 1
    
    # Commit the changes to the database
    db.commit()
    
    # Refresh stats to ensure we return the latest DB state (optional but good practice)
    db.refresh(stats)

    return {
        "message": "Report successfully recorded", 
        "total_reports": stats.total_reports
    }

@app.get("/stats/categories")
def get_category_stats(db: Session = Depends(get_db)):
    total_toxic = db.query(Toxic_Comment).count()

    result = []

    for category in ToxicityCategory:
        count = db.query(Toxic_Comment).filter(
            Toxic_Comment.category == category
        ).count()

        percentage = 0
        if total_toxic > 0:
            percentage = round((count / total_toxic) * 100, 2)

        result.append({
            "category": category.value,
            "count": count,
            "percentage": percentage
        })

    return result