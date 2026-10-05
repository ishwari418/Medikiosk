import re


class StructuredExtractor:
    def build(self, text: str, entities: list[dict], relations: list[dict], document_type: str = "unknown") -> dict:
        patient_name = self._extract_labeled_value(text, r"Patient\s+Name")
        age, gender = self._extract_age_gender(text)
        patient_id = self._extract_labeled_value(text, r"Patient\s+ID")
        document_date = self._extract_labeled_value(text, r"Date")
        doctor_name = self._extract_doctor(text)
        hospital_name = self._first_value(entities, "HOSPITAL")

        diagnosis = self._extract_labeled_value(text, r"Diagnosis")
        diagnoses = [diagnosis] if diagnosis else []
        symptoms = self._collect_values(entities, "SYMPTOM")
        allergies = self._collect_values(entities, "ALLERGY")
        follow_up = self._extract_follow_up(text)
        doctor_notes = self._extract_doctor_notes(text)

        result = {
            "patient": {
                "name": patient_name,
                "age": age,
                "gender": gender,
                "patient_id": patient_id,
            },
            "document": {
                "type": document_type,
                "date": document_date,
                "hospital": hospital_name,
                "doctor": doctor_name,
            },
            "diagnoses": diagnoses,
            "symptoms": symptoms,
            "medications": relations,
            "lab_results": [],
            "procedures": [],
            "allergies": allergies,
            "follow_up": follow_up,
            "doctor_notes": doctor_notes,
            "needs_review": False,
            "status": "needs_review",
            "warnings": [],
            "overall_confidence": 0.0,
            "diagnosis": diagnoses,
            "doctor": {"name": doctor_name} if doctor_name else {"name": None},
            "advice": doctor_notes,
        }

        if not result["diagnoses"]:
            result["diagnoses"] = []
        if not result["symptoms"]:
            result["symptoms"] = []
        if not result["medications"]:
            result["medications"] = []
        if not result["allergies"]:
            result["allergies"] = []
        if not result["doctor_notes"]:
            result["doctor_notes"] = []
        if not result["warnings"]:
            result["warnings"] = []

        return result

    def _first_value(self, entities: list[dict], entity_type: str) -> str | None:
        entity = next((item for item in entities if item.get("type") == entity_type), None)
        return entity.get("value") if entity else None

    def _collect_values(self, entities: list[dict], entity_type: str) -> list[str]:
        values = [item.get("value") for item in entities if item.get("type") == entity_type]
        return [value for value in values if value]

    def _extract_labeled_value(self, text: str, label: str) -> str | None:
        pattern = re.compile(rf"^\s*{label}\s*:\s*(.*?)\s*$", re.IGNORECASE)
        for line in text.splitlines():
            match = pattern.match(line)
            if match and match.group(1).strip():
                return match.group(1).strip()
        return None

    def _extract_age_gender(self, text: str) -> tuple[int | None, str | None]:
        pattern = re.compile(
            r"^\s*Age\s*/\s*Gender\s*:\s*(\d{1,3})\s*/\s*(Female|Male|Other)\b",
            re.IGNORECASE,
        )
        for line in text.splitlines():
            match = pattern.match(line)
            if match:
                return int(match.group(1)), match.group(2).capitalize()
        return None, None

    def _extract_doctor(self, text: str) -> str | None:
        qualifications = {"mbbs", "md", "ms", "bams", "bhms", "dnb", "consultant", "physician"}
        lines = text.splitlines()
        for index, line in enumerate(lines):
            doctor_match = re.search(r"\bDr\.?\s+(.+)", line, re.IGNORECASE)
            if doctor_match:
                name_parts = []
                for part in doctor_match.group(1).strip().split():
                    cleaned = part.strip(" ,;:-.")
                    if not cleaned or cleaned.casefold() in qualifications:
                        break
                    if not re.fullmatch(r"[A-Za-z][A-Za-z'-]*", cleaned):
                        break
                    name_parts.append(cleaned)
                    if len(name_parts) == 3:
                        break
                if name_parts:
                    return f"Dr. {' '.join(name_parts)}"

            section_match = re.match(r"^\s*Doctor\s*:\s*(.*?)\s*$", line, re.IGNORECASE)
            if section_match:
                name = section_match.group(1).strip()
                if not name and index + 1 < len(lines):
                    name = lines[index + 1].strip()
                if name:
                    name = re.sub(r"\s+(?:MBBS|MD|MS|BAMS|BHMS|DNB|Consultant Physician)\b.*$", "", name, flags=re.IGNORECASE)
                    return name.strip() or None
        return None

    def _extract_follow_up(self, text: str) -> str | None:
        match = re.search(r"follow[- ]?up\s*[:\-]?\s*([^\n]+)", text, flags=re.IGNORECASE)
        if match:
            value = match.group(1).strip()
            value = re.sub(r"\s+(?:doctor|nurse|clinic|hospital|review)\b.*$", "", value, flags=re.IGNORECASE)
            return value or "Follow-up noted in document"
        if re.search(r"\bfollow up\b|\bफॉलो अप\b|\bफॉलोअप\b", text, flags=re.IGNORECASE):
            return "Follow-up noted in document"
        return None

    def _extract_doctor_notes(self, text: str) -> list[str]:
        notes = []
        for line in text.splitlines():
            if re.search(r"note|remarks|comment|advice|instruction|recommendation", line, flags=re.IGNORECASE):
                notes.append(line.strip())
        return notes
