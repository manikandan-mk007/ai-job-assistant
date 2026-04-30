def generate_cover_letter(
    *,
    user_name,
    target_role,
    skills,
    projects,
    job_title,
    company,
    matched_skills,
    missing_skills,
):
    return f"""
Dear Hiring Manager,

I am applying for the {job_title} role at {company}.

My experience includes {skills}, and I have worked on {projects}.

I match well with skills like {", ".join(matched_skills)}.

I am also improving in {", ".join(missing_skills[:3])}.

Looking forward to contributing.

Regards,
{user_name}
"""