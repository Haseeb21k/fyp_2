"""
CSV normalization utilities for the unified ingestion flow.

This module exposes `normalize_csv_row`, which maps heterogeneous CSV headers
into a consistent unified schema expected by the backend. It mirrors the
approach used for MT940 parsing in `mt940_parser.py`.
"""

from typing import Dict, Any

HEADER_MAP: Dict[str, list[str]] = {
    "date": ["date", "value_date", "Date", "Transaction Date"],
    "amount": ["amount", "Amount", "amt", "transaction_amount"],
    "description": ["description", "Description", "desc", "narration", "Remarks"],
    "type": [
        "type",
        "Type",
        "transaction_type",
        "Fee Type",
        "Payment Method",
        "Payment Status",
    ],
    "transaction_time": ["Transaction Time"],
    "currency": ["Currency"],
    "transaction_id": ["Transaction ID"],
    "university_bank_name": ["University Bank Name"],
    "university_account_number": ["University Account Number"],
    "payer_name": ["Payer Name"],
    "student_id": ["Student ID/Roll Number"],
    "payer_email": ["Payer Email"],
    "academic_session": ["Academic Session"],
    "invoice_number": ["Invoice/Challan Number"],
    "payment_status": ["Payment Status"],
}


def normalize_csv_row(row: Dict[str, Any]) -> Dict[str, Any]:
    """
    Normalize a single CSV row into the unified schema.

    Unknown/extra fields are not included here; callers can merge them into
    a separate `data` JSON column as needed.
    """
    normalized_row: Dict[str, Any] = {
        "date": "",
        "amount": 0.0,
        "description": "",
        "type": "",
        "transaction_time": "",
        "currency": "",
        "transaction_id": "",
        "university_bank_name": "",
        "university_account_number": "",
        "payer_name": "",
        "student_id": "",
        "payer_email": "",
        "academic_session": "",
        "invoice_number": "",
        "payment_status": "",
    }

    for key, aliases in HEADER_MAP.items():
        for alias in aliases:
            if alias in row and row[alias]:
                if key == "amount":
                    try:
                        normalized_row[key] = float(
                            str(row[alias]).replace(",", "").replace(" ", "")
                        )
                    except Exception:
                        normalized_row[key] = 0.0
                else:
                    normalized_row[key] = row[alias]
                break

# Fallback for type: use Fee Type or Payment Method if type is empty
    if not normalized_row["type"]:
        if "Fee Type" in row and row["Fee Type"]:
            normalized_row["type"] = row["Fee Type"]
        elif "Payment Method" in row and row["Payment Method"]:
            normalized_row["type"] = row["Payment Method"]

    return normalized_row

