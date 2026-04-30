from app.services.similarity_engine import compute_similarity
from app.services.skill_extractor import extract_skills_from_text
from app.services.keyword_suggester import suggest_keywords
from app.services.scoring_engine import compute_final_score
from app.services.insight_engine import generate_insights


def analyze_job_against_profile(
    *,
    target_role,
    skills_text,
    projects,
    resume_text,
    job_title,
    job_description,
):
    user_text = f"{target_role} {skills_text} {projects} {resume_text}"
    job_text = f"{job_title} {job_description}"

    # 🔥 Semantic
    semantic_score = compute_similarity(user_text, job_text)

    # 🧩 Skills
    job_skills = extract_skills_from_text(job_description)
    user_skills = skills_text.lower().split(",") if skills_text else []

    matched = list(set(user_skills).intersection(set(job_skills)))
    missing = list(set(job_skills).difference(set(user_skills)))

    skill_score = (len(matched) / len(job_skills)) * 100 if job_skills else 0

    # 📄 Resume
    resume_score = compute_similarity(resume_text or "", job_description)

    # 📁 Projects
    project_score = compute_similarity(projects or "", job_description)

    # 🎯 Role
    role_score = compute_similarity(target_role or "", job_title)

    # 🎯 Final
    final_score = compute_final_score(
        semantic_score,
        skill_score,
        resume_score,
        project_score,
        role_score
    )

    # 🔑 Keywords
    keywords = suggest_keywords(missing, job_skills)

    # 🧠 Insights
    strengths, weaknesses, summary = generate_insights(
        matched, missing, final_score
    )

    return {
        "extracted_skills": job_skills,
        "matched_skills": matched,
        "missing_skills": missing,
        "priority_skills": missing[:5],
        "suggested_keywords": keywords,

        "semantic_score": semantic_score,
        "skill_score": round(skill_score, 2),
        "role_score": role_score,
        "project_score": project_score,
        "resume_score": resume_score,
        "final_score": final_score,

        "recommendation": summary,
        "match_summary": summary,
        "strengths": strengths,
        "weaknesses": weaknesses,
        "resume_improvements": missing[:3],
        "learning_plan": missing[:5],
        "cover_letter_points": matched[:3],
    }