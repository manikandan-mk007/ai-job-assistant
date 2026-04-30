# 🚀 AI Job Assistant (Full Stack + AI + Browser Extension)

An **AI-powered Job Assistant** that analyzes job descriptions from platforms like LinkedIn, Indeed, Naukri, and Glassdoor — and gives **real-time match scores, skill gaps, resume insights, and cover letters** using advanced NLP models.



## 🔥 Key Features

### 🤖 AI Job Analysis

* Semantic job matching using **Sentence Transformers (MPNet)**
* Match score (0–100%) based on:

  * Semantic similarity
  * Skills match
  * Resume relevance
  * Project alignment
  * Role similarity

### 🧠 Smart Insights

* Extracts job-required skills automatically
* Shows:

  * ✅ Matched Skills
  * ❌ Missing Skills
  * 🎯 Priority Skills
* Generates:

  * Resume improvement suggestions
  * Learning plan
  * Personalized recommendations

### 📄 Resume Processing

* Upload **PDF / DOCX resume**
* Auto extract text
* Sync with profile for better scoring

### ✉️ AI Cover Letter Generator

* Generates job-specific cover letters
* Uses:

  * Your skills
  * Your projects
  * Job requirements

### 💼 Job Tracker Dashboard

* Save jobs with full analysis
* Track status:

  * Saved
  * Applied
  * Interview
  * Rejected
* Analytics:

  * Average score
  * Strong matches
  * Top missing skills

### 🌐 Browser Extension

Works on:

* LinkedIn
* Indeed
* Naukri
* Glassdoor

Features:

* One-click job analysis
* Popup UI with results
* Save jobs directly



## 🧠 AI / NLP Stack

```txt
Model Used:
- all-mpnet-base-v2 (Sentence Transformers)

Techniques:
- Semantic Embeddings
- Cosine Similarity
- Skill Extraction
- Keyword Suggestion
```



## 🛠️ Tech Stack

### Backend

* FastAPI
* Python
* SQLAlchemy
* SQLite (dev) / PostgreSQL (prod)

### AI / ML

* sentence-transformers
* scikit-learn
* NumPy

### Extension

* JavaScript
* Chrome / Edge / Firefox APIs
* Content Scripts + Background Scripts

### Tools

* VS Code
* Postman
* GitHub



## 📂 Project Structure

```txt
AI_JOB_ASSIST_NEW/
│
├── backend/
│   ├── app/
│   ├── run.py
│   ├── requirements.txt
│
├── extension-edge-chrome/
├── extension-firefox/
│
└── README.md
```



## ⚙️ Installation

### 1. Clone Repository

```bash
git clone https://github.com/your-username/ai-job-assistant.git
cd ai-job-assistant/backend
```



### 2. Setup Backend

```bash
python -m venv venv
venv\Scripts\activate   # Windows

pip install -r requirements.txt
```



### 3. Run Backend

```bash
python run.py
```

OR

```bash
uvicorn app.main:app --reload
```

Open:

```
http://127.0.0.1:8000/docs
```



### ⚠️ First Run Note

Model will download:

```txt
all-mpnet-base-v2 (~400MB)
```

Only happens once.



## 🔌 Extension Setup

### Chrome / Edge

1. Go to:

```
chrome://extensions/
```

2. Enable **Developer Mode**

3. Click **Load Unpacked**

4. Select:

```
extension-edge-chrome/
```



### Firefox

1. Open:

```
about:debugging
```

2. Click **This Firefox → Load Temporary Add-on**

3. Select:

```
manifest.json
```



## 🧪 How to Use

1. Open any job page (LinkedIn / Indeed / etc.)
2. Click extension
3. Click **Analyze Job**
4. View:

   * Match Score
   * Skills gap
   * Insights
5. Save job
6. Generate cover letter



## 📊 Example Output

```json
{
  "final_score": 72,
  "matched_skills": ["python", "django"],
  "missing_skills": ["docker", "aws"],
  "recommendation": "Moderate match with improvement areas"
}
```



## 🔐 Security

* JWT authentication
* Protected APIs
* User-based job tracking



## 🚀 Future Improvements

* Multi-language support
* AI interview preparation
* Resume auto-enhancement
* Company insights
* Cloud deployment (Render / AWS)



## 👨‍💻 Author

**Thangamanikandan I**
Python Full Stack Developer

* GitHub: https://github.com/manikandan-mk007
* Portfolio: https://portfolio-o5cw.onrender.com



## ⭐ Why This Project?

This project demonstrates:

✔ Full-stack development
✔ Real-world problem solving
✔ AI/NLP integration
✔ Browser extension development
✔ Production-ready architecture



## 💡 Inspiration

Built to solve a real problem:

> “Applying blindly to jobs without knowing match score or skill gaps.”



## 📜 License

MIT License
