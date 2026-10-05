from __future__ import annotations

from pathlib import Path

from .document_classifier import DocumentClassifier
from .medical_ner import MedicalNER
from .ocr_service import OCRService
from .relation_extractor import RelationExtractor
from .structured_extractor import StructuredExtractor
from .text_cleaner import TextCleaner


class MedicalDocumentPipeline:
    def __init__(self) -> None:
        self.ocr_service = OCRService()
        self.classifier = DocumentClassifier()
        self.ner = MedicalNER()
        self.relation_extractor = RelationExtractor()
        self.structured = StructuredExtractor()

    def process_text(self, raw_text: str) -> dict:
        clean_text = TextCleaner.clean_for_analysis(raw_text or "")
        if not clean_text:
            return {
                "patient": {"name": None, "age": None, "gender": None, "patient_id": None},
                "document": {"type": "unknown", "date": None, "hospital": None, "doctor": None},
                "diagnoses": [],
                "symptoms": [],
                "medications": [],
                "lab_results": [],
                "procedures": [],
                "allergies": [],
                "follow_up": None,
                "doctor_notes": [],
                "needs_review": True,
                "raw_text": "",
                "raw_ocr_text": "",
                "entities": [],
                "relations": [],
                "warnings": ["No readable text was extracted from the document."],
                "status": "error",
                "error": "No readable text was extracted from the document.",
            }

        document_type = self.classifier.classify(clean_text)
        entities = self.ner.extract(clean_text, page=1)
        relations = self.relation_extractor.extract_relations(clean_text, entities)
        result = self.structured.build(clean_text, entities, relations, document_type)
        result["raw_text"] = clean_text
        result["raw_ocr_text"] = clean_text
        result["entities"] = entities
        result["relations"] = relations

        patient_name = result.get("patient", {}).get("name")
        result["needs_review"] = patient_name is None
        result["errors"] = []

        if not entities:
            result["warnings"] = ["OCR text was read, but no medical entities were confidently detected."]
            result["status"] = "needs_review"
        elif not relations:
            result["warnings"] = ["Medical entities were detected, but medication relations were not confidently extracted."]
            result["status"] = "needs_review"
        else:
            result["warnings"] = []
            result["status"] = "processed"

        if patient_name:
            result["needs_review"] = False

        if result["status"] == "processed":
            result["overall_confidence"] = round(sum(item.get("confidence", 0.0) for item in entities) / max(len(entities), 1), 3)
        else:
            result["overall_confidence"] = 0.0
        return result

    def process_file(self, file_path: str) -> dict:
        file_name = Path(file_path).name
        print(f"[DOCUMENT] filename={file_name}")
        pages = []
        try:
            pages = self.ocr_service.extract_document(file_path)
        except RuntimeError as exc:
            return {
                "status": "error",
                "warnings": [str(exc)],
                "raw_ocr_text": "",
                "error": str(exc),
                "patient": {"name": None, "age": None, "gender": None, "patient_id": None},
                "document": {"type": "unknown", "date": None, "hospital": None, "doctor": None},
                "diagnoses": [],
                "symptoms": [],
                "medications": [],
                "lab_results": [],
                "procedures": [],
                "allergies": [],
                "follow_up": None,
                "doctor_notes": [],
                "needs_review": True,
                "extracted_information": {},
            }

        combined_text = "\n\n".join(page.get("text", "") for page in pages if page.get("text"))
        print(f"[OCR] completed for {file_name}; extracted character count={len(combined_text)}")
        result = self.process_text(combined_text)
        result["pages"] = pages
        result["raw_ocr_text"] = combined_text
        result["document"]["type"] = result["document"].get("type") or "unknown"

        if not combined_text:
            result["status"] = "error"
            result["error"] = "Unable to reliably extract information from this document."
            result["warnings"] = [result["error"]]
        elif result.get("status") == "needs_review":
            result["warnings"] = result.get("warnings", []) or ["Some fields could not be confidently extracted and require doctor review."]
        else:
            result["warnings"] = result.get("warnings", [])

        result["extracted_information"] = {
            "patient": result.get("patient", {}),
            "document": result.get("document", {}),
            "diagnosis": result.get("diagnoses", []),
            "medications": result.get("medications", []),
            "doctor": result.get("doctor", {"name": None}),
            "advice": result.get("doctor_notes", []),
            "follow_up": result.get("follow_up"),
            "raw_text": combined_text,
        }
        result["overall_confidence"] = result.get("overall_confidence", 0.0)
        if result["status"] == "error":
            result["needs_review"] = True
        return result
