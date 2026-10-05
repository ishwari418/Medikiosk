from __future__ import annotations

import logging
import os
import shutil
from pathlib import Path

import fitz
import pdfplumber
import pytesseract
from PIL import Image

from .text_cleaner import TextCleaner

logger = logging.getLogger(__name__)


class OCRService:
    def __init__(self) -> None:
        self.tesseract_available = self._check_tesseract()

    def _check_tesseract(self) -> bool:
        if shutil.which("tesseract"):
            return True

        configured = os.getenv("TESSERACT_CMD")
        if configured and os.path.exists(configured):
            pytesseract.pytesseract.tesseract_cmd = configured
            return True

        try:
            pytesseract.get_tesseract_version()
            return True
        except Exception:
            return False

    def extract_from_image(self, image_path: str) -> list[dict]:
        file_name = Path(image_path).name
        logger.info("[OCR] starting for image %s", file_name)
        if not self.tesseract_available:
            raise RuntimeError("Tesseract OCR is not installed or not available on PATH.")

        with Image.open(image_path) as image:
            image = image.convert("RGB")
            text = pytesseract.image_to_string(image, config="--psm 6")
        cleaned = TextCleaner.normalize_whitespace(text)
        logger.info("[OCR] completed for image %s with %s characters", file_name, len(cleaned))
        return [{"page": 1, "text": cleaned}] if cleaned else []

    def extract_from_pdf(self, pdf_path: str) -> list[dict]:
        pages: list[dict] = []
        logger.info("[OCR] starting PDF extraction for %s", Path(pdf_path).name)
        pdf = fitz.open(pdf_path)
        try:
            for index in range(pdf.page_count):
                page = pdf[index]
                text = page.get_text("text")
                if text and len(text.strip()) > 20:
                    cleaned = TextCleaner.normalize_whitespace(text)
                    pages.append({"page": index + 1, "text": cleaned})
                    continue

                pix = page.get_pixmap(dpi=300)
                image = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
                ocr_text = pytesseract.image_to_string(image, config="--psm 6") if self.tesseract_available else ""
                cleaned = TextCleaner.normalize_whitespace(ocr_text)
                pages.append({"page": index + 1, "text": cleaned})

                logger.info("[OCR] page %s extracted %s characters", index + 1, len(cleaned))
        finally:
            pdf.close()

        extracted_chars = sum(len(page.get("text", "")) for page in pages)
        logger.info("[OCR] completed PDF extraction for %s with %s total characters", Path(pdf_path).name, extracted_chars)
        return pages

    def extract_document(self, file_path: str) -> list[dict]:
        resolved = Path(file_path)
        suffix = resolved.suffix.lower()
        if suffix in {".png", ".jpg", ".jpeg"}:
            return self.extract_from_image(str(resolved))
        if suffix == ".pdf":
            return self.extract_from_pdf(str(resolved))
        raise ValueError(f"Unsupported document type: {suffix}")

    def read_text_from_pdf(self, pdf_path: str) -> str:
        with pdfplumber.open(pdf_path) as pdf:
            text_parts = []
            for page in pdf.pages:
                page_text = page.extract_text() or ""
                if page_text.strip():
                    text_parts.append(page_text)
            return "\n\n".join(text_parts)
