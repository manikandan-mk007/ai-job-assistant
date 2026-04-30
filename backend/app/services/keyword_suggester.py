def suggest_keywords(missing: list[str], extracted: list[str]):
    keywords = []

    keywords.extend(missing[:5])
    keywords.extend(extracted[:5])

    return list(set(keywords))[:10]