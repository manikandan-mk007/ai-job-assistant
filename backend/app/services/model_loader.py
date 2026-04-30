from sentence_transformers import SentenceTransformer
from app.core.config import settings

_model = None


def get_model():
    global _model
    if _model is None:
        print(f"Loading model: {settings.EMBEDDING_MODEL}")
        _model = SentenceTransformer(settings.EMBEDDING_MODEL)
    return _model