import sys
import json
from pathlib import Path
import unittest
import pandas as pd
from fastapi.testclient import TestClient

PROJECT_ROOT = Path(__file__).resolve().parents[1]
sys.path.append(str(PROJECT_ROOT))

from src.preprocessing import load_data, preprocess_data, prepare_data
from src.train_and_save import train_and_save_artifacts
from deployment.app import app, get_model


class TestManufacturingPredictionIntegration(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)

    def test_01_app_startup_and_health(self):
        """TEST 1: Application starts successfully."""
        response = self.client.get("/health")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["status"], "healthy")

    def test_02_all_imports_work(self):
        """TEST 2: All imports work."""
        import joblib
        import sklearn
        import fastapi
        import uvicorn
        self.assertIsNotNone(joblib)
        self.assertIsNotNone(sklearn)
        self.assertIsNotNone(fastapi)

    def test_03_model_loads_successfully(self):
        """TEST 3: Model loads successfully."""
        pipeline = get_model()
        self.assertIsNotNone(pipeline)
        self.assertTrue(hasattr(pipeline, "predict"))

    def test_04_valid_input_reaches_model(self):
        """TEST 4: Valid input reaches the model."""
        valid_payload = {
            "Injection_Temperature": 221.0,
            "Injection_Pressure": 136.0,
            "Cycle_Time": 28.7,
            "Cooling_Time": 13.6,
            "Material_Viscosity": 375.5,
            "Ambient_Temperature": 28.0,
            "Machine_Age": 3.8,
            "Operator_Experience": 11.2,
            "Maintenance_Hours": 64.0,
            "Temperature_Pressure_Ratio": 1.625,
            "Total_Cycle_Time": 42.3,
            "Efficiency_Score": 0.063,
            "Machine_Utilization": 0.510,
            "Shift": "Evening",
            "Machine_Type": "Type_B",
            "Material_Grade": "Economy",
            "Day_of_Week": "Thursday"
        }
        response = self.client.post("/predict", json=valid_payload)
        self.assertEqual(response.status_code, 200)

    def test_05_model_returns_prediction(self):
        """TEST 5: Model returns a prediction."""
        valid_payload = {
            "Injection_Temperature": 221.0,
            "Injection_Pressure": 136.0,
            "Cycle_Time": 28.7,
            "Cooling_Time": 13.6,
            "Material_Viscosity": 375.5,
            "Ambient_Temperature": 28.0,
            "Machine_Age": 3.8,
            "Operator_Experience": 11.2,
            "Maintenance_Hours": 64.0,
            "Temperature_Pressure_Ratio": 1.625,
            "Total_Cycle_Time": 42.3,
            "Efficiency_Score": 0.063,
            "Machine_Utilization": 0.510,
            "Shift": "Evening",
            "Machine_Type": "Type_B",
            "Material_Grade": "Economy",
            "Day_of_Week": "Thursday"
        }
        response = self.client.post("/predict", json=valid_payload)
        data = response.json()
        self.assertIn("prediction", data)
        self.assertIsInstance(data["prediction"], float)
        print(f"Sample Row 1 Prediction: {data['prediction']:.2f} Parts_Per_Hour")

    def test_06_prediction_reaches_ui_layer(self):
        """TEST 6: Prediction reaches the result/UI layer."""
        response = self.client.get("/")
        self.assertEqual(response.status_code, 200)
        self.assertIn("Manufacturing Equipment Output Prediction", response.text)

    def test_07_invalid_input_is_handled(self):
        """TEST 7: Invalid input is handled."""
        invalid_payload = {
            "Injection_Temperature": "not_a_number",
            "Injection_Pressure": 136.0,
            "Cycle_Time": 28.7,
            "Cooling_Time": 13.6,
            "Material_Viscosity": 375.5,
            "Ambient_Temperature": 28.0,
            "Machine_Age": 3.8,
            "Operator_Experience": 11.2,
            "Maintenance_Hours": 64.0,
            "Temperature_Pressure_Ratio": 1.625,
            "Total_Cycle_Time": 42.3,
            "Efficiency_Score": 0.063,
            "Machine_Utilization": 0.510,
            "Shift": "Evening",
            "Machine_Type": "Type_B",
            "Material_Grade": "Economy",
            "Day_of_Week": "Thursday"
        }
        response = self.client.post("/predict", json=invalid_payload)
        self.assertEqual(response.status_code, 422)

    def test_08_missing_input_is_handled(self):
        """TEST 8: Missing input is handled."""
        response = self.client.post("/predict", json={"Shift": "Day"})
        self.assertEqual(response.status_code, 422)

    def test_09_frontend_backend_communication(self):
        """TEST 9: Frontend/backend communication works."""
        response = self.client.get("/metrics")
        self.assertEqual(response.status_code, 200)
        self.assertIn("metrics", response.json())

    def test_10_existing_components_still_work(self):
        """TEST 10: Existing components still work after integration."""
        X_train, X_test, y_train, y_test, preprocessor = prepare_data()
        self.assertEqual(X_train.shape[0], 800)
        self.assertEqual(X_test.shape[0], 200)
        self.assertEqual(X_train.shape[1], 29)


if __name__ == "__main__":
    unittest.main()
