import pandas as pd

from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import OneHotEncoder, StandardScaler


DATA_PATH = "data/manufacturing_dataset_1000_samples.csv"


def load_data():
    """Load the manufacturing dataset."""
    return pd.read_csv(DATA_PATH)


def preprocess_data(df):
    """
    Preprocess the manufacturing dataset.

    Steps:
    1. Remove Timestamp.
    2. Separate target variable.
    3. Handle missing numerical values using median.
    4. Handle categorical values using most frequent value.
    5. One-hot encode categorical variables.
    6. Standardize numerical variables.
    """

    # Remove Timestamp
    df = df.drop(columns=["Timestamp"])

    # Separate target variable
    X = df.drop(columns=["Parts_Per_Hour"])
    y = df["Parts_Per_Hour"]

    # Numerical columns
    numerical_columns = [
        "Injection_Temperature",
        "Injection_Pressure",
        "Cycle_Time",
        "Cooling_Time",
        "Material_Viscosity",
        "Ambient_Temperature",
        "Machine_Age",
        "Operator_Experience",
        "Maintenance_Hours",
        "Temperature_Pressure_Ratio",
        "Total_Cycle_Time",
        "Efficiency_Score",
        "Machine_Utilization"
    ]

    # Categorical columns
    categorical_columns = [
        "Shift",
        "Machine_Type",
        "Material_Grade",
        "Day_of_Week"
    ]

    # Numerical preprocessing
    numerical_pipeline = Pipeline([
        ("imputer", SimpleImputer(strategy="median")),
        ("scaler", StandardScaler())
    ])

    # Categorical preprocessing
    categorical_pipeline = Pipeline([
        ("imputer", SimpleImputer(strategy="most_frequent")),
        ("encoder", OneHotEncoder(handle_unknown="ignore"))
    ])

    # Combine numerical and categorical preprocessing
    preprocessor = ColumnTransformer([
        ("numerical", numerical_pipeline, numerical_columns),
        ("categorical", categorical_pipeline, categorical_columns)
    ])

    return X, y, preprocessor


def prepare_data():
    """Load, preprocess and split the dataset."""

    df = load_data()

    X, y, preprocessor = preprocess_data(df)

    # 80% training and 20% testing
    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.20,
        random_state=42
    )

    # Fit preprocessing only on training data
    X_train_processed = preprocessor.fit_transform(X_train)

    # Transform test data using the fitted preprocessing pipeline
    X_test_processed = preprocessor.transform(X_test)

    return (
        X_train_processed,
        X_test_processed,
        y_train,
        y_test,
        preprocessor
    )


if __name__ == "__main__":
    X_train, X_test, y_train, y_test, preprocessor = prepare_data()

    print("Preprocessing completed successfully.")
    print("Training samples:", X_train.shape[0])
    print("Testing samples:", X_test.shape[0])
    print("Processed training features:", X_train.shape[1])
    print("Processed testing features:", X_test.shape[1])