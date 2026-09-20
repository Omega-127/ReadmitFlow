# Synthea dataset for ReadmitFlow

## Source

- **Dataset:** Synthea COVID-19 10K CSV sample  
- **Download:** https://synthetichealth.github.io/synthea-sample-data/downloads/10k_synthea_covid19_csv.zip  
- **License / use:** Synthetic, free of PHI; usable for research and prototypes (cite Synthea / COVID-19 papers as appropriate)

## Layout

```text
dataset/synthea/
  raw/10k_synthea_covid19_csv/   # unzipped official sample (gitignored)
  encounter_features.csv         # derived flat training table (regenerable)
  10k_synthea_covid19_csv.zip    # optional local zip (gitignored)
```

## Setup

```bash
# From repo root
mkdir -p dataset/synthea
# Download + unzip the COVID-19 10K CSV into dataset/synthea/raw/10k_synthea_covid19_csv/
```

Windows PowerShell:

```powershell
New-Item -ItemType Directory -Force -Path dataset\synthea | Out-Null
Invoke-WebRequest `
  -Uri "https://synthetichealth.github.io/synthea-sample-data/downloads/10k_synthea_covid19_csv.zip" `
  -OutFile dataset\synthea\10k_synthea_covid19_csv.zip
Expand-Archive dataset\synthea\10k_synthea_covid19_csv.zip -DestinationPath dataset\synthea\raw -Force
```

## Label definition

`readmitted_30d = 1` when the same patient has a later **inpatient** encounter starting within **30 days** of the index inpatient discharge (`STOP` → next inpatient `START`).

Deaths during the index stay are excluded.

## Train

```bash
pip install -r ml/requirements.txt
python ml/train.py --rebuild-features
# later runs can reuse the cached feature CSV:
python ml/train.py
```

## Feature mapping

| Model feature | Synthea origin |
| --- | --- |
| `age` | `patients.BIRTHDATE` vs encounter `START` |
| `gender` | `patients.GENDER` |
| `admission_count` | prior inpatient count for patient |
| `days_since_last_admission` | days since previous inpatient `STOP` |
| `primary_diagnosis` | encounter reason / condition text → category map |
| `insurance` | `payers.NAME` via encounter `PAYER` |
| `has_pcp` | any prior `wellness` encounter |
| `readmitted_30d` / `target` | derived as above |
