import re


class RelationExtractor:
    _STRENGTH = re.compile(r"\b(\d+(?:\.\d+)?)\s*(mg|mcg|μg|µg|g|ml|iu|units?)\b", re.IGNORECASE)
    _KNOWN_MEDICATIONS = {
        "amlodipine": "Amlodipine",
        "azithromycin": "Azithromycin",
        "cetirizine": "Cetirizine",
        "cetrizine": "Cetirizine",
        "diclofenac": "Diclofenac",
        "ibuprofen": "Ibuprofen",
        "metformin": "Metformin",
        "montelukast": "Montelukast",
        "paracetamol": "Paracetamol",
        "vitamin d": "Vitamin D",
    }
    _MEDICATION_PREFIX = re.compile(r"^(?:(?:tab(?:let)?|cap(?:sule)?|syp|syrup|inj(?:ection)?|take|start|give)\.?\s+)+", re.IGNORECASE)
    _LIST_PREFIX = re.compile(r"^\s*(?:\d+\s*[.)]\s*|[-*]\s*)")
    _SECTION = re.compile(
        r"^\s*(?:advice|instructions?|diagnosis|patient(?:\s+name)?|age\s*/\s*gender|"
        r"patient\s+id|date|doctor|dr\.?|follow[- ]?up|review|remarks?|notes?)\s*:\s*",
        re.IGNORECASE,
    )
    _BLOCKED_NAME_WORDS = {
        "address", "advice", "avoid", "better", "cold", "consultant", "date", "department",
        "diagnosis", "doctor", "dr", "female", "fluids", "general", "gargle", "get", "health",
        "hospital", "male", "mbbs", "medicine", "patient", "physician", "rest", "today", "tomorrow",
        "type", "visit", "warm", "water",
    }
    _FREQUENCY_PATTERNS = (
        re.compile(r"\b(?:once|twice|thrice)\s+daily\s+at\s+night\b", re.IGNORECASE),
        re.compile(r"\b(?:once|twice|thrice)\s+a\s+day\s+at\s+night\b", re.IGNORECASE),
        re.compile(r"\b\d+\s+times?\s+(?:a\s+day|daily)\b", re.IGNORECASE),
        re.compile(r"\b(?:one|two|three|four)\s+times?\s+(?:a\s+day|daily)\b", re.IGNORECASE),
        re.compile(r"\b(?:once|twice|thrice)\s+(?:daily|a\s+day)\b", re.IGNORECASE),
        re.compile(r"\b(?:once|twice|thrice|daily|weekly|od|bd|tid|qid)\b", re.IGNORECASE),
    )

    def extract_relations(self, text: str, entities: list[dict] | None = None) -> list[dict]:
        lines = text.splitlines()
        medication_lines = []
        for index, line in enumerate(lines):
            candidate = self._medication_from_line(line)
            if candidate:
                medication_lines.append((index, candidate))

        relations = []
        seen = set()
        for candidate_index, (line_index, candidate) in enumerate(medication_lines):
            medication, strength = candidate
            identity = (medication.casefold(), (strength or "").casefold())
            if identity in seen:
                continue
            seen.add(identity)

            block = [lines[line_index]]
            next_medication_index = (
                medication_lines[candidate_index + 1][0]
                if candidate_index + 1 < len(medication_lines)
                else len(lines)
            )
            for continuation in lines[line_index + 1:next_medication_index]:
                if self._SECTION.match(continuation):
                    break
                block.append(continuation)

            local_text = " ".join(block)
            relations.append({
                "medication": medication,
                "strength": strength,
                "frequency": self._extract_frequency(local_text),
                "duration": self._extract_duration(local_text),
            })

        return relations

    def _medication_from_line(self, line: str) -> tuple[str, str | None] | None:
        candidate_line = self._LIST_PREFIX.sub("", line).strip()
        if not candidate_line or self._SECTION.match(candidate_line):
            return None

        candidate_line = self._MEDICATION_PREFIX.sub("", candidate_line).strip()
        strength_match = self._STRENGTH.search(candidate_line)
        strength = None
        if strength_match:
            strength = f"{strength_match.group(1)} {strength_match.group(2).lower()}"

        for known_name, display_name in sorted(self._KNOWN_MEDICATIONS.items(), key=lambda item: -len(item[0])):
            if re.match(rf"{re.escape(known_name)}(?=\b|\s|$)", candidate_line, re.IGNORECASE):
                return display_name, strength

        if not strength_match:
            return None

        name = candidate_line[:strength_match.start()].strip(" \t-:;,.")
        name = re.sub(r"\s+", " ", name)
        words = name.split()
        if not words or len(words) > 4 or any(word.casefold() in self._BLOCKED_NAME_WORDS for word in words):
            return None
        if not all(re.fullmatch(r"[A-Za-z][A-Za-z'-]*", word) for word in words):
            return None
        return name, strength

    def _extract_frequency(self, text: str) -> str | None:
        for pattern in self._FREQUENCY_PATTERNS:
            match = pattern.search(text)
            if match:
                return re.sub(r"\s+", " ", match.group(0)).lower()
        return None

    def _extract_duration(self, text: str) -> str | None:
        match = re.search(r"\bfor\s+(\d+\s*(?:days?|weeks?|months?))\b", text, re.IGNORECASE)
        if not match:
            match = re.search(r"\b(\d+\s*(?:days?|weeks?|months?))\b", text, re.IGNORECASE)
        return re.sub(r"\s+", " ", match.group(1)).lower() if match else None
