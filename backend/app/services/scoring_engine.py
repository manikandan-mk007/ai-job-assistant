def compute_final_score(
    semantic: float,
    skill: float,
    resume: float,
    project: float,
    role: float
) -> float:

    score = (
        semantic * 0.40 +
        skill * 0.25 +
        resume * 0.15 +
        project * 0.10 +
        role * 0.10
    )

    return round(score, 2)