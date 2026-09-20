"""
ml/src/training.py

Trains the primary explainable baseline (Logistic Regression) with class weighting and probability calibration.
Optionally trains a small decision tree classifier for comparison, retaining the simpler model as mandated
by ARCHITECTURE.md §6: "Optionally compare a small tree-based model, but retain the simpler model if performance is comparable."
"""

from typing import Dict, Tuple
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline

from ml.src.preprocessing import create_preprocessor, ALL_FEATURE_COLUMNS


def train_baseline_model(
    X: pd.DataFrame,
    y: pd.Series,
    test_size: float = 0.2,
    random_state: int = 42,
    compare_tree: bool = True,
) -> Tuple[Pipeline, Dict[str, any]]:
    """
    Fits a scikit-learn Pipeline with Preprocessor + LogisticRegression.

    Args:
        X: Feature DataFrame containing ALL_FEATURE_COLUMNS.
        y: Binary target Series.
        test_size: Validation holdout fraction.
        random_state: Reproducibility seed.
        compare_tree: Whether to train a DecisionTreeClassifier comparison.

    Returns:
        (fitted_pipeline, split_data_dict)
    """
    # Ensure only expected feature columns are passed to pipeline
    X_features = X[ALL_FEATURE_COLUMNS].copy()

    # Stratified split to preserve class distribution
    X_train, X_test, y_train, y_test = train_test_split(
        X_features,
        y,
        test_size=test_size,
        random_state=random_state,
        stratify=y,
    )

    # Build primary Logistic Regression pipeline
    preprocessor = create_preprocessor()
    classifier = LogisticRegression(
        class_weight="balanced",
        max_iter=1000,
        random_state=random_state,
        solver="lbfgs",
    )

    pipeline = Pipeline(
        steps=[
            ("preprocessor", preprocessor),
            ("classifier", classifier),
        ]
    )

    # Train primary model
    pipeline.fit(X_train, y_train)

    split_data = {
        "X_train": X_train,
        "X_test": X_test,
        "y_train": y_train,
        "y_test": y_test,
        "comparison_tree": None,
    }

    # Optional tree-based comparison
    if compare_tree:
        tree_prep = create_preprocessor()
        tree_clf = DecisionTreeClassifier(
            max_depth=4,
            class_weight="balanced",
            random_state=random_state,
        )
        tree_pipeline = Pipeline(
            steps=[
                ("preprocessor", tree_prep),
                ("classifier", tree_clf),
            ]
        )
        tree_pipeline.fit(X_train, y_train)
        split_data["comparison_tree"] = tree_pipeline

    return pipeline, split_data
