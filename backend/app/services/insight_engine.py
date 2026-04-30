def generate_insights(
    matched: list[str],
    missing: list[str],
    score: float
):
    strengths = []
    weaknesses = []

    if matched:
        strengths.append(f"Strong in {', '.join(matched[:3])}")

    if missing:
        weaknesses.append(f"Missing {', '.join(missing[:3])}")

    if score > 75:
        summary = "Excellent match for this role"
    elif score > 55:
        summary = "Moderate match with improvement areas"
    else:
        summary = "Low match, needs skill improvement"

    return strengths, weaknesses, summary