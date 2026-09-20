import sys
import json
from pathlib import Path
import joblib
import pandas as pd
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel, Field

# Ensure project root is in python path
PROJECT_ROOT = Path(__file__).resolve().parents[1]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.append(str(PROJECT_ROOT))

from src.train_and_save import train_and_save_artifacts

MODEL_PIPELINE_PATH = PROJECT_ROOT / "results" / "model_artifacts" / "linear_regression_pipeline.joblib"
METRICS_PATH = PROJECT_ROOT / "results" / "metrics" / "linear_regression_metrics.json"
METADATA_PATH = PROJECT_ROOT / "results" / "model_artifacts" / "model_metadata.json"
FIGURES_DIR = PROJECT_ROOT / "results" / "figures"
TEMPLATES_DIR = PROJECT_ROOT / "deployment" / "templates"

app = FastAPI(
    title="Manufacturing Equipment Output Prediction API",
    description="End-to-End API for predicting manufacturing output (Parts_Per_Hour)",
    version="1.0.0"
)

# Mount static figures
if FIGURES_DIR.exists():
    app.mount("/static/figures", StaticFiles(directory=str(FIGURES_DIR)), name="figures")

templates = Jinja2Templates(directory=str(TEMPLATES_DIR))

# Global model container
model_pipeline = None


def get_model():
    global model_pipeline
    if model_pipeline is None:
        if not MODEL_PIPELINE_PATH.exists():
            print("Model artifact not found. Generating artifacts...")
            model_pipeline = train_and_save_artifacts()
        else:
            print(f"Loading trained model from {MODEL_PIPELINE_PATH}")
            model_pipeline = joblib.load(MODEL_PIPELINE_PATH)
    return model_pipeline


class PredictionRequest(BaseModel):
    Injection_Temperature: float = Field(..., example=221.0)
    Injection_Pressure: float = Field(..., example=136.0)
    Cycle_Time: float = Field(..., example=28.7)
    Cooling_Time: float = Field(..., example=13.6)
    Material_Viscosity: float = Field(..., example=375.5)
    Ambient_Temperature: float = Field(..., example=28.0)
    Machine_Age: float = Field(..., example=3.8)
    Operator_Experience: float = Field(..., example=11.2)
    Maintenance_Hours: float = Field(..., example=64.0)
    Temperature_Pressure_Ratio: float = Field(..., example=1.625)
    Total_Cycle_Time: float = Field(..., example=42.3)
    Efficiency_Score: float = Field(..., example=0.063)
    Machine_Utilization: float = Field(..., example=0.510)
    
    Shift: str = Field(..., example="Evening")
    Machine_Type: str = Field(..., example="Type_B")
    Material_Grade: str = Field(..., example="Economy")
    Day_of_Week: str = Field(..., example="Thursday")


@app.on_event("startup")
def startup_event():
    get_model()


@app.get("/", response_class=HTMLResponse)
def read_root(request: Request):
    return templates.TemplateResponse(request=request, name="index.html")


@app.get("/health")
def health_check():
    pipeline = get_model()
    return {
        "status": "healthy",
        "model_loaded": pipeline is not None
    }


@app.get("/metrics")
def get_metrics():
    metrics = {}
    metadata = {}
    
    if METRICS_PATH.exists():
        with open(METRICS_PATH, "r") as f:
            metrics = json.load(f)
            
    if METADATA_PATH.exists():
        with open(METADATA_PATH, "r") as f:
            metadata = json.load(f)
            
    return {
        "metrics": metrics,
        "metadata": metadata
    }


@app.post("/predict")
def predict_output(data: PredictionRequest):
    try:
        pipeline = get_model()
        if pipeline is None:
            raise HTTPException(status_code=500, detail="Model pipeline could not be initialized.")
        
        input_dict = data.model_dump()
        input_df = pd.DataFrame([input_dict])
        
        prediction = pipeline.predict(input_df)[0]
        
        return {
            "status": "success",
            "prediction": float(prediction),
            "input_summary": input_dict
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Prediction failed: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("deployment.app:app", host="127.0.0.1", port=8000, reload=True)
