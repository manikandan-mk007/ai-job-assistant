from sklearn.metrics.pairwise import cosine_similarity

from app.services.model_loader import get_model


def compute_similarity(text_a: str, text_b: str) -> float:
    text_a = str(text_a or "").strip()
    text_b = str(text_b or "").strip()

    if not text_a or not text_b:
        return 0.0

    model = get_model()

    embeddings = model.encode(
        [text_a, text_b],
        convert_to_numpy=True,
        normalize_embeddings=True,
        show_progress_bar=False,
    )

    score = cosine_similarity(
        [embeddings[0]],
        [embeddings[1]],
    )[0][0]

    return round(float(score) * 100, 2)


def compute_batch_similarity(text: str, items: list[str]) -> list[float]:
    text = str(text or "").strip()
    items = [str(item or "").strip() for item in items if str(item or "").strip()]

    if not text or not items:
        return []

    model = get_model()

    embeddings = model.encode(
        [text] + items,
        convert_to_numpy=True,
        normalize_embeddings=True,
        show_progress_bar=False,
    )

    base = embeddings[0]
    others = embeddings[1:]

    scores = cosine_similarity([base], others)[0]

    return [round(float(score) * 100, 2) for score in scores]