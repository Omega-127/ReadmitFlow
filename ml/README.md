# ReadmitFlow Machine Learning Module

This module implements the offline data loading, validation, preprocessing, baseline modeling, evaluation, and artifact export for ReadmitFlow.

> **DEMO ONLY SAFETY NOTICE:**  
> ReadmitFlow is a decision-support prototype. It is **not** a diagnostic tool. Training uses **Synthea** synthetic EHR data with a **derived** 30-day inpatient readmission label. All model outputs remain flagged `demo_only: true`.

## Dataset

Primary source: **Synthea COVID-19 10K CSV** under `dataset/synthea/`.

See `dataset/synthea/README.md` for download steps.

Tables used: `patients.csv`, `encounters.csv`, `conditions.csv`, `payers.csv`.

### Target label

`readmitted_30d = 1` when the next **inpatient** encounter for the same patient starts within **30 days** of index inpatient discharge. Deaths during the index stay are excluded.

## Model features

- Numerical: `age`, `admission_count`, `days_since_last_admission`
- Categorical: `gender`, `primary_diagnosis`, `insurance`, `has_pcp`

Preprocessor: median impute + StandardScaler for numerics; constant impute + OneHotEncoder for categoricals.

## Baseline model

Logistic Regression (`class_weight="balanced"`, `max_iter=1000`) with an optional depth-4 decision tree comparison. The logistic model is retained for explainability.

## Commands

```bash
pip install -r ml/requirements.txt
# Place Synthea CSVs under dataset/synthea/raw/10k_synthea_covid19_csv/
python ml/train.py --rebuild-features
python ml/train.py
python ml/evaluate.py
python -m pytest tests/ -v
```

## Artifacts

1. `backend/models/readmission_model.joblib`
2. `backend/data/metrics.json`
3. `backend/data/demo_patients.json`
4. `dataset/synthea/encounter_features.csv` (cached, regenerable)
