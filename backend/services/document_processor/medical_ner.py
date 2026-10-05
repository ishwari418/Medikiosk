import re


class MedicalNER:
    def __init__(self) -> None:
        self.entity_patterns = {
            "PATIENT": [
                r"(?:patient\s*(?:name)?\s*[:\-]\s*)([A-Z][A-Za-z]+(?: [A-Z][A-Za-z]+)+)",
                r"(?:patient\s*(?:name)?\s*[:\-]\s*)([A-Z][A-Za-z]+(?: [A-Z][A-Za-z]+){0,2})",
                r"(?:मरीज\s*का\s*नाम\s*[:\-]?\s*)([\u0900-\u097F\s]+)",
                r"(?:रुग्णाचे\s*नाव\s*[:\-]?\s*)([\u0900-\u097F\s]+)",
                r"(?:દર્દીનું\s*નામ\s*[:\-]?\s*)([\u0A80-\u0AFF\s]+)",
            ],
            "DOCTOR": [
                r"(?:doctor\s*[:\-]\s*)([A-Za-z][A-Za-z .'-]+)",
                r"(?:dr\.?\s*[A-Za-z][A-Za-z .'-]+)",
                r"(?:डॉक्टर\s*[:\-]?\s*)([\u0900-\u097F\s]+)",
            ],
            "HOSPITAL": [
                r"(?:hospital\s*[:\-]\s*)([A-Za-z][A-Za-z0-9 .'-]+)",
                r"(?:clinic\s*[:\-]\s*)([A-Za-z][A-Za-z0-9 .'-]+)",
            ],
            "STRENGTH": [r"\b\d+(?:\.\d+)?\s*(?:mg|g|mcg|ml)\b"],
            "DOSAGE": [r"\b\d+\s*(?:tablet|tablets|capsule|capsules|ml|drops)\b", r"\b(?:one|two|three|four)\s*(?:tablet|tablets|capsule|capsules)\b"],
            "FREQUENCY": [r"(?:once|twice|thrice|once daily|twice daily|three times daily|daily|weekly|bd|od|tid|qid|SOS)", r"\b(?:one|two|three|four)\s+times\s+(?:daily|weekly)\b"],
            "DURATION": [r"\b\d+\s*(?:days?|weeks?|months?)\b", r"\bfor\s+\d+\s*(?:days?|weeks?|months?)\b"],
            "DIAGNOSIS": [r"(?:diagnosis\s*[:\-]\s*)([A-Za-z][A-Za-z /-]+)", r"(?:diagnosed\s+with\s+)([A-Za-z][A-Za-z /-]+)", r"(?:निदान\s*[:\-]?\s*)([\u0900-\u097F\s]+)"] ,
            "SYMPTOM": [r"(?:symptom\s*[:\-]\s*)([A-Za-z][A-Za-z /-]+)", r"(?:complaint\s*[:\-]\s*)([A-Za-z][A-Za-z /-]+)", r"(?:pain|fever|cough|cold|fatigue|nausea|dizziness)\b"],
            "LAB_TEST": [r"\b(?:hemoglobin|haemoglobin|cbc|blood sugar|glucose|cholesterol|tsh|ldl|hdl|platelets|wbc|rbc|hb)\b"],
            "LAB_VALUE": [r"\b\d+(?:\.\d+)?\s*(?:mg/dl|mg/dL|g/dl|g/dL|mmhg|mmHg|iu/l|IU/L|%)\b"],
            "UNIT": [r"\b(?:mg|g|mcg|ml|mmHg|mg/dL|g/dL|%)\b"],
            "ALLERGY": [r"(?:allergy\s*[:\-]\s*)([A-Za-z][A-Za-z /-]+)", r"\b(?:penicillin|latex|sulfa|egg|peanut|milk|dust)\b"],
            "FOLLOW_UP": [r"(?:follow[- ]up\s*[:\-]?\s*)([A-Za-z][A-Za-z /-]+)", r"(?:follow up|फॉलो अप|फॉलोअप)\b"],
        }

    def _record(self, entity_type: str, value: str, page: int, confidence: float) -> dict:
        cleaned = re.sub(r"\s+", " ", value or "").strip()
        if not cleaned:
            return None
        return {
            "type": entity_type,
            "value": cleaned,
            "page": page,
            "confidence": max(0.0, min(1.0, confidence)),
            "source": cleaned,
        }

    def extract(self, text: str, page: int = 1) -> list[dict]:
        if not text or not text.strip():
            return []

        extracted: list[dict] = []
        seen: set[tuple[str, str]] = set()

        for entity_type, patterns in self.entity_patterns.items():
            for pattern in patterns:
                matches = re.finditer(pattern, text, flags=re.IGNORECASE)
                for match in matches:
                    value = match.group(0).strip()
                    if entity_type in {"PATIENT", "DOCTOR", "HOSPITAL", "DIAGNOSIS", "ALLERGY"} and len(match.groups()) > 0:
                        value = match.group(1).strip()
                    if value:
                        value = self._clean_entity_value(value, entity_type)
                        key = (entity_type, value.lower())
                        if value and key not in seen:
                            seen.add(key)
                            entity = self._record(entity_type, value, page, 0.85 if entity_type in {"PATIENT", "DOCTOR", "MEDICATION"} else 0.75)
                            if entity:
                                extracted.append(entity)

        if not extracted:
            return []
        return extracted

    def _clean_entity_value(self, value: str, entity_type: str) -> str:
        cleaned = re.sub(r"\s+", " ", value).strip()
        if entity_type == "PATIENT":
            cleaned = re.sub(r"\s+(?:doctor|follow[- ]?up|followup).*?$", "", cleaned, flags=re.IGNORECASE)
            cleaned = cleaned.strip(" -:")
        if entity_type == "DOCTOR":
            cleaned = re.sub(r"\s*[:\-]\s*", " ", cleaned).strip()
        if entity_type == "DIAGNOSIS":
            cleaned = cleaned.split("\n", 1)[0].strip()
        return cleaned
