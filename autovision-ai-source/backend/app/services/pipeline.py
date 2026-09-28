"""Model-backed vehicle analysis with explicit unavailable states.

The service intentionally does not substitute a generic image classifier for a
make/model classifier. Detector and classifier weights are supplied separately
through environment variables and are never downloaded at application startup.
"""

import base64
import io
import time
from dataclasses import dataclass

from PIL import Image, ImageDraw, ImageOps

from app.core.config import CLASSIFIER_MODEL_PATH, DETECTOR_MODEL_PATH, MAX_IMAGE_DIMENSION

try:
    import numpy as np
except ImportError:  # pragma: no cover - reported by model_status
    np = None

try:
    from ultralytics import YOLO
except ImportError:  # pragma: no cover - optional until weights are supplied
    YOLO = None


COLOUR_BANDS = (
    ("Black", "#111827"),
    ("White", "#F8FAFC"),
    ("Silver", "#94A3B8"),
    ("Red", "#DC2626"),
    ("Blue", "#2563EB"),
    ("Green", "#16A34A"),
    ("Yellow", "#EAB308"),
    ("Brown", "#92400E"),
)


@dataclass
class Detection:
    x: float
    y: float
    width: float
    height: float
    confidence: float


def estimate_colour(image: Image.Image, box: tuple[int, int, int, int]) -> tuple[str, str]:
    crop = image.crop(box).resize((32, 32)).convert("RGB")
    pixels = list(crop.getdata())
    red = sum(pixel[0] for pixel in pixels) / len(pixels)
    green = sum(pixel[1] for pixel in pixels) / len(pixels)
    blue = sum(pixel[2] for pixel in pixels) / len(pixels)
    spread = max(red, green, blue) - min(red, green, blue)

    if max(red, green, blue) < 55:
        return COLOUR_BANDS[0]
    if min(red, green, blue) > 205 and spread < 28:
        return COLOUR_BANDS[1]
    if min(red, green, blue) > 105 and spread < 35:
        return COLOUR_BANDS[2]
    if red > green * 1.35 and red > blue * 1.35:
        return COLOUR_BANDS[3]
    if blue > red * 1.28 and blue > green * 1.08:
        return COLOUR_BANDS[4]
    if green > red * 1.2 and green > blue * 1.08:
        return COLOUR_BANDS[5]
    if red > 150 and green > 125 and blue < 100:
        return COLOUR_BANDS[6]
    if red > blue * 1.4 and green < red * 0.82 and red > 70:
        return COLOUR_BANDS[7]
    return ("Grey", "#64748B")


class VehiclePipeline:
    def __init__(self) -> None:
        self.detector = None
        if YOLO is not None and DETECTOR_MODEL_PATH.exists():
            self.detector = YOLO(str(DETECTOR_MODEL_PATH))

    @property
    def status(self) -> dict[str, str | bool]:
        detector_ready = self.detector is not None
        classifier_ready = CLASSIFIER_MODEL_PATH.exists()
        return {
            "detector": "ready" if detector_ready else "unavailable",
            "classifier": "ready" if classifier_ready else "unavailable",
            "colour_estimator": "ready",
            "ready": detector_ready and classifier_ready,
            "message": (
                "Detector and classifier weights are ready."
                if detector_ready and classifier_ready
                else "Add detector and make/model classifier weights to enable recognition."
            ),
        }

    def _detect(self, image: Image.Image) -> list[Detection]:
        if self.detector is None or np is None:
            return []
        results = self.detector.predict(np.array(image), verbose=False)
        detections: list[Detection] = []
        width, height = image.size
        for result in results:
            for box in result.boxes:
                class_id = int(box.cls[0])
                if class_id not in {2, 3, 5, 7}:  # COCO: car, motorcycle, bus, truck
                    continue
                left, top, right, bottom = [float(value) for value in box.xyxy[0]]
                detections.append(
                    Detection(
                        x=max(0, left / width),
                        y=max(0, top / height),
                        width=max(0, (right - left) / width),
                        height=max(0, (bottom - top) / height),
                        confidence=float(box.conf[0]),
                    )
                )
        return detections

    def analyze(self, payload: bytes) -> dict:
        started = time.perf_counter()
        image = ImageOps.exif_transpose(Image.open(io.BytesIO(payload))).convert("RGB")
        image.thumbnail((MAX_IMAGE_DIMENSION, MAX_IMAGE_DIMENSION))
        detections = self._detect(image)

        annotated = image.copy()
        draw = ImageDraw.Draw(annotated)
        vehicles: list[dict] = []
        image_width, image_height = image.size

        for index, detection in enumerate(detections, start=1):
            left = int(detection.x * image_width)
            top = int(detection.y * image_height)
            right = int((detection.x + detection.width) * image_width)
            bottom = int((detection.y + detection.height) * image_height)
            draw.rectangle((left, top, right, bottom), outline="#3B82F6", width=4)
            colour, colour_hex = estimate_colour(image, (left, top, right, bottom))
            vehicles.append(
                {
                    "vehicle_id": f"vehicle-{index}",
                    "bounding_box": detection.__dict__,
                    "detection_confidence": detection.confidence,
                    "make": "Unknown",
                    "model": "Unable to identify confidently",
                    "classification_confidence": 0,
                    "colour": colour,
                    "colour_hex": colour_hex,
                    "status": "unable_to_identify",
                }
            )

        output = io.BytesIO()
        annotated.save(output, format="JPEG", quality=88)
        encoded = base64.b64encode(output.getvalue()).decode("ascii")
        return {
            "success": True,
            "vehicles": vehicles,
            "annotated_image": f"data:image/jpeg;base64,{encoded}" if vehicles else None,
            "processing_time_ms": round((time.perf_counter() - started) * 1000),
            "error": None
            if self.detector is not None
            else "Vehicle detector weights are not installed. Add DETECTOR_MODEL_PATH before identifying vehicles.",
        }