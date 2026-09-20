# ReadmitFlow Machine Learning Module

This module implements the offline data loading, validation, preprocessing, baseline modeling, evaluation, and artifact export for ReadmitFlow.

> **DEMO ONLY SAFETY NOTICE:**  
> ReadmitFlow is a decision-support prototype built for software and clinical workflow demonstration. It is **not** a diagnostic tool and does **not** make autonomous clinical decisions. The source dataset does not contain an organizer-approved clinical readmission outcome; therefore, all model outputs are generated from a documented **Demonstration Proxy** and are strictly flagged `demo_only: true`.

---

## 1. Dataset & Source Fields

The pipeline consumes the synthetic healthcare dataset at `dataset/healthcare_dataset.csv` (55,500 records).

Raw fields include:
- Demographics: `Name`, `Age`, `Gender`, `Blood Type`
- Admission details: `Date of Admission`, `Discharge Date`, `Admission Type`, `Room Number`, `Hospital`, `Doctor`
- Financial & Clinical: `Insurance Provider`, `Billing Amount`, `Medical Condition`, `Medication`, `Test Results`

### Target Label Governance
As governed by `ARCHITECTURE.md` and `docs/data-dictionary.md`:
- `Test Results` (`Abnormal`, `Normal`, `Inconclusive`) is a clinical observation, **never** a readmission outcome.
- The raw dataset does not contain a verified 30-day readmission column.
- Under **Option C**, we construct an explicit **Demo Proxy Target** purely for software, interface, and workflow evaluation.

---

## 2. Demo Proxy Target Definition

The target variable `target` is a demonstration proxy defined as:
```text
z = 0.035 * (age - 50) 
  + 0.55 * admission_count 
  - 0.03 * (days_since_last_admission - 30) 
  + diagnosis_weight 
  - 0.45 * has_pcp 
  + LogisticNoise(scale=0.8)

target = 1 if sigmoid(z) > 0.50 else 0
```

Where:
- `admission_count`: Derived cumulative prior hospital encounters for the patient.
- `days_since_last_admission`: Recency in days between prior discharge and current admission (capped at 180).
- `has_pcp`: Whether the patient has a recorded primary care provider.
- `diagnosis_weight`: Relative clinical acuity weights (Cancer: 0.6, Diabetes: 0.5, Hypertension: 0.3, Asthma: 0.2, Obesity: 0.2, Arthritis: 0.1).

**Clinical Disclaimer**: This formulation is solely a demonstration proxy to provide realistic classification behavior and allow coordinators to evaluate the Command Center and Patient Review workflows. It does not represent clinical reality.

---

## 3. Preprocessing & Feature Pipeline

Features are transformed using a scikit-learn `ColumnTransformer` ensuring identical transformations during training and inference:

1. **Numerical Features** (`age`, `admission_count`, `days_since_last_admission`):
   - `SimpleImputer(strategy="median")`
   - `StandardScaler()`
2. **Categorical Features** (`gender`, `primary_diagnosis`, `insurance`, `has_pcp`):
   - `SimpleImputer(strategy="constant", fill_value="Unknown")`
   - `OneHotEncoder(handle_unknown="ignore", sparse_output=False)`

---

## 4. Model Architecture

- **Primary Baseline**: Logistic Regression with `class_weight="balanced"` and `max_iter=1000`.
- **Justification**:
  - Fully explainable coefficients.
  - Calibrated probability estimates for risk tier assignment.
  - Transparent linear contributions for patient-level risk drivers.
- **Comparison Model**: Depth-4 `DecisionTreeClassifier` trained during development to verify linearity assumptions. As required by `ARCHITECTURE.md`, the simpler logistic model is retained.

---

## 5. Explainability (Model Drivers)

Risk drivers are calculated on individual patient feature vectors using standardized feature contributions:
$$\text{contribution}_i = x_i \cdot \beta_i$$

### Non-Causal Communication Rule
Drivers are communicated strictly using descriptive language:
- *"This feature contributes to the model's predicted risk."*
- We **never** claim: *"This factor causes readmission."* or *"Changing this medication prevents readmission."*

---

## 6. Exported Artifacts

Running `python ml/train.py` produces:
1. `backend/models/readmission_model.joblib`: Serialized scikit-learn pipeline (preprocessor + classifier).
2. `backend/data/metrics.json`: Precomputed evaluation metrics, confusion matrix, limitations, and notes.
3. `backend/data/demo_patients.json`: Scored synthetic patient cohort sorted by risk score descending.

---

## 7. Commands & Reproducibility

### Setup
```bash
pip install -r ml/requirements.txt
```

### Train & Export Artifacts
```bash
python ml/train.py
```

### Run Standalone Evaluation
```bash
python ml/evaluate.py
```

### Run Tests
```bash
python -m pytest tests/ -v
```
