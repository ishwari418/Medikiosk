import re


class DocumentClassifier:
    def classify(self, text: str) -> str:
        cleaned = (text or "").lower()
        if not cleaned:
            return "unknown"

        rules = {
            "prescription": [
                r"prescription",
                r"medicine",
                r"medication",
                r"tablet",
                r"capsule",
                r"dose",
                r"dosage",
                r"paracetamol",
                r"amoxicillin",
            ],
            "laboratory report": [
                r"lab report",
                r"blood test",
                r"haemoglobin",
                r"hemoglobin",
                r"cbc",
                r"platelets",
                r"wbc",
                r"glucose",
                r"cholesterol",
            ],
            "discharge summary": [
                r"discharge summary",
                r"discharged on",
                r"admission",
                r"condition on discharge",
                r"follow up",
            ],
            "consultation note": [
                r"consultation note",
                r"history of present illness",
                r"chief complaint",
                r"review of systems",
                r"clinical note",
            ],
            "diagnostic report": [
                r"diagnostic report",
                r"radiology",
                r"ultrasound",
                r"x-ray",
                r"mri",
                r"ct scan",
            ],
            "medical certificate": [
                r"medical certificate",
                r"fitness certificate",
                r"doctor certificate",
                r"medical leave",
                r"sick leave",
            ],
        }

        scores = {name: 0 for name in rules}
        for name, patterns in rules.items():
            for pattern in patterns:
                if re.search(pattern, cleaned):
                    scores[name] += 1

        best_label = max(scores, key=scores.get)
        if scores[best_label] == 0:
            return "unknown"
        return best_label
