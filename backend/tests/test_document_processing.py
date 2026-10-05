from backend.services.document_processor.pipeline import MedicalDocumentPipeline


def test_document_pipeline_extracts_medication_information():
    pipeline = MedicalDocumentPipeline()
    sample_text = (
        "Patient Name: Ishwari Belhekar\n"
        "Doctor: Dr. Nikita Chaudhari\n"
        "Prescription\n"
        "Paracetamol 650 mg\n"
        "1 tablet three times daily for 3 days\n"
    )

    result = pipeline.process_text(sample_text)

    assert result["document"]["type"] in {"prescription", "unknown"}
    assert result["patient"]["name"] == "Ishwari Belhekar"
    assert any(item.get("medication") == "Paracetamol" for item in result["medications"])
    assert any(item.get("frequency") == "three times daily" for item in result["medications"])
    assert result["needs_review"] is False


def test_document_pipeline_handles_missing_information_without_guessing():
    pipeline = MedicalDocumentPipeline()
    sample_text = "Patient Name: Ishwari Belhekar\nFollow-up after review."

    result = pipeline.process_text(sample_text)

    assert result["patient"]["name"] == "Ishwari Belhekar"
    assert result["diagnoses"] == []
    assert result["medications"] == []
    assert result["needs_review"] is False


def test_ishwari_prescription_extracts_only_labeled_fields_and_medication_lines():
    pipeline = MedicalDocumentPipeline()
    sample_text = (
        "Health Today\n"
        "Better Tomorrow MBBS\n"
        "General Medicine\n"
        "Ahmednagar\n"
        "Patient Name: Ishwari Belhekar\n"
        "Age / Gender: 21 / Female\n"
        "Patient ID: SC20250928021\n"
        "Date: 28 September 2025\n"
        "Dr. Nikita Chaudhari\n"
        "Diagnosis: Viral Fever with Throat Infection\n"
        "1. Paracetamol 650 mg - 3 times a day - 3 days - after food\n"
        "2. Azithromycin 500 mg - once daily - after food\n"
        "3. Montelukast 10 mg - once daily at night - after food\n"
        "Paracetamol 650 mg - 3 times a day - 3 days - after food\n"
        "Advice:\n"
        "Take plenty of fluids\n"
        "Get adequate rest\n"
        "Avoid cold drinks\n"
        "Gargle with warm saline water\n"
        "Consultant Physician"
    )

    result = pipeline.process_text(sample_text)

    assert result["patient"] == {
        "name": "Ishwari Belhekar",
        "age": 21,
        "gender": "Female",
        "patient_id": "SC20250928021",
    }
    assert result["document"]["date"] == "28 September 2025"
    assert result["document"]["doctor"] == "Dr. Nikita Chaudhari"
    assert result["diagnoses"] == ["Viral Fever with Throat Infection"]
    assert result["medications"] == [
        {
            "medication": "Paracetamol",
            "strength": "650 mg",
            "frequency": "3 times a day",
            "duration": "3 days",
        },
        {
            "medication": "Azithromycin",
            "strength": "500 mg",
            "frequency": "once daily",
            "duration": None,
        },
        {
            "medication": "Montelukast",
            "strength": "10 mg",
            "frequency": "once daily at night",
            "duration": None,
        },
    ]
    assert result["needs_review"] is False
    assert result["raw_ocr_text"]
