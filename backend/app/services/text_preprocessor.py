import re


def clean_text(text: str) -> str:
    text = re.sub(r"\s+", " ", text)
    text = re.sub(r"[^\w\s\-\./+]", " ", text)
    return text.strip().lower()


def preprocess_text(text: str) -> str:
    return clean_text(text)