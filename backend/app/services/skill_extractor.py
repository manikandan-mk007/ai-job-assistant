KNOWN_SKILLS = [
    "python", "django", "fastapi", "react", "javascript",
    "typescript", "html", "css", "mysql", "sql",
    "postgresql", "mongodb", "git", "docker",
    "aws", "linux", "rest api", "machine learning",
    "nlp", "pandas", "numpy", "data science"
]


def extract_skills_from_text(text: str) -> list[str]:
    text_lower = text.lower()
    found = []

    for skill in KNOWN_SKILLS:
        if skill in text_lower:
            found.append(skill)

    return list(set(found))