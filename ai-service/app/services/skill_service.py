import json
import os
import re
from typing import List, Dict, Any, Optional
from rapidfuzz import fuzz, process
import google.generativeai as genai
from app.config import settings

class SkillService:
    def __init__(self):
        self.taxonomy_path = os.path.join(os.path.dirname(__file__), "..", "data", "esco_it_skills.json")
        self.skills_taxonomy = self._load_taxonomy()
        self.alias_lookup = self._build_alias_lookup()

        if settings.GEMINI_API_KEY:
            genai.configure(api_key=settings.GEMINI_API_KEY)
            self.model = genai.GenerativeModel(settings.LLM_MODEL)
        else:
            self.model = None

    def _load_taxonomy(self) -> List[Dict[str, Any]]:
        if os.path.exists(self.taxonomy_path):
            with open(self.taxonomy_path, "r", encoding="utf-8") as f:
                return json.load(f)
        return []

    def _build_alias_lookup(self) -> Dict[str, Dict[str, Any]]:
        lookup = {}
        for skill in self.skills_taxonomy:
            name_lower = skill["name"].lower()
            lookup[name_lower] = skill
            for syn in skill.get("synonyms", []):
                lookup[syn.lower()] = skill
        return lookup

    def normalize_skill(self, raw_name: str, threshold: float = 75.0) -> Optional[Dict[str, Any]]:
        query = raw_name.strip().lower()
        if not query:
            return None

        # 1. Exact match in alias lookup
        if query in self.alias_lookup:
            return self.alias_lookup[query]

        # 2. Fuzzy match against all aliases
        choices = list(self.alias_lookup.keys())
        match = process.extractOne(query, choices, scorer=fuzz.token_sort_ratio)
        if match and match[1] >= threshold:
            best_alias = match[0]
            return self.alias_lookup[best_alias]

        return None

    def extract_skills_from_text(self, text: str) -> Dict[str, Any]:
        """
        Trích xuất kỹ năng sử dụng Gemini LLM Few-shot, sau đó chuẩn hóa về ESCO Taxonomy
        """
        extracted_raw_skills = []
        experience_level = "Intern"

        if self.model and settings.GEMINI_API_KEY:
            prompt = f"""
Bạn là chuyên gia phân tích hồ sơ và mô tả tuyển dụng ngành Công nghệ Thông tin.
Hãy đọc văn bản dưới đây và trích xuất:
1. Danh sách các kỹ năng kỹ thuật, công nghệ, ngôn ngữ lập trình, framework, cơ sở dữ liệu (hard_skills).
2. Danh sách các kỹ năng mềm, phương pháp làm việc (soft_skills).
3. Mức độ kinh nghiệm yêu cầu/thể hiện (Intern, Fresher, Junior).

Định dạng đầu ra BẮT BUỘC là JSON hợp lệ như sau:
{{
  "hard_skills": ["Java", "Spring Boot", "Docker", "PostgreSQL"],
  "soft_skills": ["Teamwork", "Giao tiếp"],
  "experience_level": "Intern"
}}

Văn bản:
---
{text}
---
Chỉ trả về JSON, không kèm giải thích hoặc markdown ngoài JSON.
"""
            try:
                response = self.model.generate_content(prompt)
                resp_text = response.text.strip()
                # Clean code blocks if present
                if resp_text.startswith("```"):
                    resp_text = re.sub(r"^```json\s*", "", resp_text)
                    resp_text = re.sub(r"\s*```$", "", resp_text)
                parsed = json.loads(resp_text)
                extracted_raw_skills = parsed.get("hard_skills", []) + parsed.get("soft_skills", [])
                experience_level = parsed.get("experience_level", "Intern")
            except Exception as e:
                print(f"[WARN] Error calling Gemini for skill extraction: {e}")
                extracted_raw_skills = self._rule_based_fallback_extract(text)
        else:
            extracted_raw_skills = self._rule_based_fallback_extract(text)

        # Chuẩn hóa về ESCO Taxonomy
        normalized_skills = []
        unmatched_skills = []
        seen_ids = set()

        for raw_s in extracted_raw_skills:
            matched = self.normalize_skill(raw_s)
            if matched:
                if matched["id"] not in seen_ids:
                    seen_ids.add(matched["id"])
                    normalized_skills.append({
                        "id": matched["id"],
                        "name": matched["name"],
                        "category": matched["category"],
                        "raw_mention": raw_s
                    })
            else:
                unmatched_skills.append(raw_s)

        return {
            "total_extracted": len(normalized_skills) + len(unmatched_skills),
            "normalized_skills": normalized_skills,
            "unmatched_skills": unmatched_skills,
            "experience_level": experience_level
        }

    def _rule_based_fallback_extract(self, text: str) -> List[str]:
        found = []
        text_lower = text.lower()
        for alias in self.alias_lookup.keys():
            # Boundary search
            pattern = r"(?:\b|_)" + re.escape(alias) + r"(?:\b|_)"
            if re.search(pattern, text_lower):
                found.append(alias)
        return list(set(found))

skill_service = SkillService()
