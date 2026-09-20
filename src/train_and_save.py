import sys
import json
from pathlib import Path
import joblib
import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.pipeline import Pipeline

# Set project root path
PROJECT_ROOT = Path(__file__).resolve().parents[1]
sys.path.append(str(PROJECT_ROOT))

from src.preprocessing import prepare_data, load_data, preprocess_data, train_test_split


def train_and_save_artifacts():
    print(f"Project root: {PROJECT_ROOT}")
    
    # Load dataset
    df = load_data()
    print(f"Loaded dataset: {df.shape[0]} rows, {df.shape[1]} columns")
    
    # Preprocess definition
    X, y, preprocessor = preprocess_data(df)
    
    # Train / Test split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42
    )
    
    # Fit preprocessor on training set
    X_train_processed = preprocessor.fit_transform(X_train)
    X_test_processed = preprocessor.transform(X_test)
    
    # Fit Linear Regression model
    linear_model = LinearRegression()
    linear_model.fit(X_train_processed, y_train)
    
    # Evaluate
    y_pred = linear_model.predict(X_test_processed)
    mae = float(mean_absolute_error(y_test, y_pred))
    mse = float(mean_squared_error(y_test, y_pred))
    rmse = float(np.sqrt(mse))
    r2 = float(r2_score(y_test, y_pred))
    
    print(f"Evaluation results:")
    print(f"  MAE:  {mae:.6f}")
    print(f"  MSE:  {mse:.6f}")
    print(f"  RMSE: {rmse:.6f}")
    print(f"  R2:   {r2:.6f}")
    
    # Save artifacts into results/model_artifacts
    model_dir = PROJECT_ROOT / "results" / "model_artifacts"
    model_dir.mkdir(parents=True, exist_ok=True)
    
    # 1. Preprocessor artifact
    preprocessor_path = model_dir / "preprocessor.joblib"
    joblib.dump(preprocessor, preprocessor_path)
    
    # 2. Model artifact
    model_path = model_dir / "linear_regression_model.joblib"
    joblib.dump(linear_model, model_path)
    
    # 3. Combined Pipeline artifact for seamless inference
    full_pipeline = Pipeline([
        ("preprocessor", preprocessor),
        ("model", linear_model)
    ])
    pipeline_path = model_dir / "linear_regression_pipeline.joblib"
    joblib.dump(full_pipeline, pipeline_path)
    
    print(f"Saved artifacts to {model_dir}:")
    print(f"  - {preprocessor_path.name}")
    print(f"  - {model_path.name}")
    print(f"  - {pipeline_path.name}")
    
    return full_pipeline


if __name__ == "__main__":
    train_and_save_artifacts()
