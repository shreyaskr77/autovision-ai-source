# AutoVision AI FastAPI backend

This directory contains the canonical Python backend for vehicle analysis. The
managed preview API mirrors the same contract so the mobile client can be
previewed without requiring the full PyTorch stack.

## Run locally

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

The API exposes:

- `GET /api/v1/health`
- `GET /api/v1/models`
- `POST /api/v1/analyze` with multipart field `image`

The service never downloads model weights during startup. Set
`DETECTOR_MODEL_PATH` and `CLASSIFIER_MODEL_PATH` to local files before
expecting vehicle predictions. A generic detector is not treated as a
make/model classifier; until a classifier trained on labelled vehicle classes
is supplied, make and model remain `Unknown`.

## Training

Prepare a licensed dataset with one folder per make/model class under
`data/stanford-cars/train` and `data/stanford-cars/val`, then run:

```bash
python scripts/train_classifier.py \
  --data-dir data/stanford-cars \
  --output models/vehicle-classifier.pt
```

Keep the dataset licence, class list, training configuration, and evaluation
report alongside the generated weights. The Stanford Cars dataset and any
pretrained weights must be reviewed for their own research and redistribution
licences before deployment.

## Deployment notes

- Use HTTPS in production.
- Keep model files outside the source tree or in a protected model volume.
- Set a reverse-proxy body limit at or below the application’s 10 MB limit.
- Do not expose stack traces, model paths, or credentials to clients.