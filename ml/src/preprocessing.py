"""
ml/src/preprocessing.py

Scikit-learn preprocessing pipeline for ReadmitFlow.
Ensures identical transformations during offline training and real-time FastAPI inference.
Handles missing values, categorical encoding, and numerical standardization via ColumnTransformer.
"""

from typing import List, Tuple
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler


NUMERICAL_FEATURES: List[str] = [
    "age",
    "admission_count",
    "days_since_last_admission",
]

CATEGORICAL_FEATURES: List[str] = [
    "gender",
    "primary_diagnosis",
    "insurance",
    "has_pcp",
]

ALL_FEATURE_COLUMNS: List[str] = NUMERICAL_FEATURES + CATEGORICAL_FEATURES


def create_preprocessor() -> ColumnTransformer:
    """
    Build a reusable ColumnTransformer.
    - Numerical: median imputation + standard scaling.
    - Categorical: constant imputation + robust one-hot encoding (handle_unknown='ignore').
    """
    numerical_transformer = Pipeline(
        steps=[
            ("imputer", SimpleImputer(strategy="median")),
            ("scaler", StandardScaler()),
        ]
    )

    categorical_transformer = Pipeline(
        steps=[
            ("imputer", SimpleImputer(strategy="constant", fill_value="Unknown")),
            ("onehot", OneHotEncoder(handle_unknown="ignore", sparse_output=False)),
        ]
    )

    preprocessor = ColumnTransformer(
        transformers=[
            ("num", numerical_transformer, NUMERICAL_FEATURES),
            ("cat", categorical_transformer, CATEGORICAL_FEATURES),
        ],
        remainder="drop",
    )

    return preprocessor


def extract_feature_names(fitted_preprocessor: ColumnTransformer) -> List[str]:
    """
    Retrieve feature names from the fitted preprocessor for interpretability.
    """
    feature_names = []
    
    # Numerical features retain their names
    feature_names.extend(NUMERICAL_FEATURES)
    
    # Categorical features expanded by OneHotEncoder
    cat_encoder = fitted_preprocessor.named_transformers_["cat"].named_steps["onehot"]
    cat_feature_names = cat_encoder.get_feature_names_out(CATEGORICAL_FEATURES).tolist()
    feature_names.extend(cat_feature_names)
    
    return feature_names
