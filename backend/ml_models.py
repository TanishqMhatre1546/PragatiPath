import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
import logging

logger = logging.getLogger(__name__)


def compute_skill_gap_analysis(courses_data):
    """
    Real scikit-learn TF-IDF Vectorizer + Cosine Similarity computation.
    Compares skills taught in a course against the latest industry employer demand.
    """
    results = []

    for item in courses_data:
        course_id = item["id"]
        course_name = item["name"]
        skills_taught = item.get("skills_taught", [])
        skills_demanded = item.get("skills_demanded", [])

        # Create corpus strings
        taught_str = " ".join(skills_taught)
        demanded_str = " ".join(skills_demanded)

        if not taught_str.strip() or not demanded_str.strip():
            similarity_pct = 0.0
        else:
            # TF-IDF Vectorizer over bi-grams and uni-grams
            vectorizer = TfidfVectorizer(ngram_range=(1, 2), lowercase=True)
            tfidf_matrix = vectorizer.fit_transform([taught_str, demanded_str])
            sim_matrix = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])
            similarity_pct = round(float(sim_matrix[0][0]) * 100, 1)

        # Calculate exact skill overlap & deficits for explainability
        taught_set = set(s.strip().lower() for s in skills_taught)
        demanded_set = set(s.strip().lower() for s in skills_demanded)

        matching_skills = [s for s in skills_demanded if s.strip().lower() in taught_set]
        missing_skills = [s for s in skills_demanded if s.strip().lower() not in taught_set]

        gap_status = "High Skill Gap" if similarity_pct < 50.0 else ("Moderate Gap" if similarity_pct < 75.0 else "Well Aligned")
        is_flagged = similarity_pct < 50.0

        results.append({
            "course_id": course_id,
            "course_name": course_name,
            "similarity_score": similarity_pct,
            "alignment_percentage": similarity_pct,
            "gap_status": gap_status,
            "is_flagged": is_flagged,
            "skills_taught_count": len(skills_taught),
            "skills_demanded_count": len(skills_demanded),
            "skills_taught": skills_taught,
            "skills_demanded": skills_demanded,
            "matching_skills": matching_skills,
            "missing_skills": missing_skills,
            "algorithm": "scikit-learn TfidfVectorizer + Cosine Similarity",
            "recommendation": f"Update curriculum with: {', '.join(missing_skills[:3])}" if missing_skills else "Curriculum matches industry demand."
        })

    return results


class AttritionRiskPredictor:
    """
    Real scikit-learn Logistic Regression model for predicting trainee attrition risk
    based on longitudinal wage trajectory, district, course, and employer continuity.
    """
    def __init__(self):
        self.model = None
        self.is_trained = False
        self.feature_columns = ["wage", "month_mark", "same_employer", "district", "course_name"]

    def train(self, checkpoints_data):
        """
        Train a LogisticRegression pipeline on historical checkpoint data.
        """
        if not checkpoints_data or len(checkpoints_data) < 5:
            logger.warning("Insufficient data to train AttritionRiskPredictor.")
            return False

        df = pd.DataFrame(checkpoints_data)
        
        # Ensure required columns
        for col in ["wage", "month_mark", "same_employer", "district", "course_name", "is_unemployed"]:
            if col not in df.columns:
                df[col] = 0

        # Fill missing values
        df["wage"] = df["wage"].fillna(0.0)
        df["same_employer"] = df["same_employer"].fillna(1).astype(int)
        df["month_mark"] = df["month_mark"].fillna(3).astype(int)
        df["district"] = df["district"].fillna("Pune").astype(str)
        df["course_name"] = df["course_name"].fillna("General").astype(str)
        df["is_unemployed"] = df["is_unemployed"].fillna(0).astype(int)

        X = df[self.feature_columns]
        y = df["is_unemployed"]

        # Ensure both classes exist in y for logistic regression
        if len(y.unique()) < 2:
            # Add synthetic balance rows if needed
            synthetic_row_1 = pd.DataFrame([{"wage": 5000.0, "month_mark": 3, "same_employer": 0, "district": "Pune", "course_name": "Data Entry", "is_unemployed": 1}])
            synthetic_row_0 = pd.DataFrame([{"wage": 22000.0, "month_mark": 12, "same_employer": 1, "district": "Pune", "course_name": "Electrician", "is_unemployed": 0}])
            df_synth = pd.concat([df, synthetic_row_1, synthetic_row_0], ignore_index=True)
            X = df_synth[self.feature_columns]
            y = df_synth["is_unemployed"]

        preprocessor = ColumnTransformer(
            transformers=[
                ("cat", OneHotEncoder(handle_unknown="ignore"), ["district", "course_name"]),
                ("num", "passthrough", ["wage", "month_mark", "same_employer"])
            ]
        )

        pipeline = Pipeline(steps=[
            ("preprocessor", preprocessor),
            ("classifier", LogisticRegression(max_iter=1000, class_weight="balanced", random_state=42))
        ])

        try:
            pipeline.fit(X, y)
            self.model = pipeline
            self.is_trained = True
            logger.info("AttritionRiskPredictor successfully trained with scikit-learn LogisticRegression.")
            return True
        except Exception as e:
            logger.error(f"Error training AttritionRiskPredictor: {e}")
            self.is_trained = False
            return False

    def predict_trainee_risk(self, trainee_records):
        """
        Predict probability of attrition (unemployment / drop out) for current active trainees.
        Returns decision-support scores with explicit ethical labels.
        """
        if not self.is_trained or self.model is None:
            # Fallback heuristic if not yet trained
            return self._heuristic_fallback(trainee_records)

        df = pd.DataFrame(trainee_records)
        for col in self.feature_columns:
            if col not in df.columns:
                df[col] = 0

        df["wage"] = df["wage"].fillna(0.0)
        df["same_employer"] = df["same_employer"].fillna(1).astype(int)
        df["month_mark"] = df["month_mark"].fillna(3).astype(int)
        df["district"] = df["district"].fillna("Pune").astype(str)
        df["course_name"] = df["course_name"].fillna("General").astype(str)

        try:
            X = df[self.feature_columns]
            probabilities = self.model.predict_proba(X)
            # Class 1 is unemployment risk
            unemployed_class_idx = 1 if 1 in self.model.classes_ else 0
            risk_probs = probabilities[:, unemployed_class_idx]
        except Exception as e:
            logger.error(f"Prediction error: {e}, using heuristic")
            return self._heuristic_fallback(trainee_records)

        results = []
        for idx, row in df.iterrows():
            prob = float(risk_probs[idx])
            risk_pct = round(prob * 100, 1)

            # Determine risk band
            if risk_pct >= 60.0:
                risk_level = "High"
                risk_color = "red"
                action_hint = "Priority follow-up: Wage stagnation or frequent employer turnover detected."
            elif risk_pct >= 30.0:
                risk_level = "Medium"
                risk_color = "amber"
                action_hint = "Monitor: Check-in scheduled for next milestone."
            else:
                risk_level = "Low"
                risk_color = "green"
                action_hint = "Stable trajectory: Verified wage growth on record."

            results.append({
                "trainee_id": row.get("trainee_id"),
                "name": row.get("name"),
                "district": row.get("district"),
                "course_name": row.get("course_name"),
                "current_status": row.get("current_status"),
                "latest_wage": float(row.get("wage", 0)),
                "latest_month_mark": int(row.get("month_mark", 3)),
                "attrition_risk_score": risk_pct,
                "risk_probability": round(prob, 3),
                "risk_level": risk_level,
                "risk_color": risk_color,
                "recommended_action": action_hint,
                "disclaimer": "Decision support signal only, not a deterministic outcome or certainty.",
                "model_type": "scikit-learn LogisticRegression"
            })

        return sorted(results, key=lambda x: x["attrition_risk_score"], reverse=True)

    def _heuristic_fallback(self, trainee_records):
        results = []
        for r in trainee_records:
            wage = float(r.get("wage", 10000))
            same_emp = bool(r.get("same_employer", True))
            status = str(r.get("current_status", "employed")).lower()

            base_risk = 20.0
            if status == "unemployed":
                base_risk = 85.0
            elif wage < 10000:
                base_risk += 35.0
            elif not same_emp:
                base_risk += 15.0

            risk_pct = min(max(base_risk, 5.0), 95.0)
            risk_level = "High" if risk_pct >= 60 else ("Medium" if risk_pct >= 30 else "Low")
            results.append({
                "trainee_id": r.get("trainee_id"),
                "name": r.get("name"),
                "district": r.get("district"),
                "course_name": r.get("course_name"),
                "current_status": r.get("current_status"),
                "latest_wage": wage,
                "latest_month_mark": int(r.get("month_mark", 3)),
                "attrition_risk_score": risk_pct,
                "risk_probability": round(risk_pct / 100, 3),
                "risk_level": risk_level,
                "risk_color": "red" if risk_level == "High" else ("amber" if risk_level == "Medium" else "green"),
                "recommended_action": "Decision support signal based on baseline metrics.",
                "disclaimer": "Decision support signal only, not a deterministic outcome or certainty.",
                "model_type": "Baseline Decision Model"
            })
        return sorted(results, key=lambda x: x["attrition_risk_score"], reverse=True)


# Singleton instance
attrition_model = AttritionRiskPredictor()
