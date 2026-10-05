import re


class TextCleaner:
    @staticmethod
    def normalize_whitespace(value: str) -> str:
        if not value:
            return ""
        value = value.replace("\r\n", "\n").replace("\r", "\n")
        value = re.sub(r"\u00a0", " ", value)
        value = re.sub(r"\n{3,}", "\n\n", value)
        value = re.sub(r"[ \t]+", " ", value)
        value = re.sub(r" \n", "\n", value)
        value = re.sub(r"\n ", "\n", value)
        return value.strip()

    @staticmethod
    def extract_lines(value: str) -> list[str]:
        return [line.strip() for line in TextCleaner.normalize_whitespace(value).split("\n") if line.strip()]

    @staticmethod
    def clean_for_analysis(value: str) -> str:
        text = TextCleaner.normalize_whitespace(value)
        text = re.sub(r"(?<!\w)\.(?=\S)", ". ", text)
        text = re.sub(r"[ \t]+", " ", text)
        return text.strip()
