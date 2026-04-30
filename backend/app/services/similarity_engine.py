from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

from app.services.model_loader import get_model


def compute_similarity(text_a: str, text_b: str) -> float:
    if not text_a.strip() or not text_b.strip():
        return 0.0

    model = get_model()

    embeddings = model.encode([text_a, text_b])

    score = cosine_similarity(
        [embeddings[0]],
        [embeddings[1]]
    )[0][0]

    return round(float(score) * 100, 2)


def compute_batch_similarity(text: str, items: list[str]) -> list[float]:
    model = get_model()

    embeddings = model.encode([text] + items)

    base = embeddings[0]
    others = embeddings[1:]

    scores = cosine_similarity([base], others)[0]

    return [round(float(s) * 100, 2) for s in scores]