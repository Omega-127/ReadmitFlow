"""HTTP error helpers and custom exceptions for ReadmitFlow API.

Ensures proper 404 and 422 HTTP responses as specified in Section 5.
"""

from fastapi import HTTPException, status


def raise_patient_not_found(patient_id: str) -> None:
    """Raises HTTP 404 when a requested patient ID does not exist.

    Args:
        patient_id: The identifier that was queried.
    """
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=f"Patient with ID '{patient_id}' not found.",
    )


def raise_invalid_prediction(detail: str) -> None:
    """Raises HTTP 422 when manual prediction inputs fail validation.

    Args:
        detail: Explanation of the validation failure.
    """
    raise HTTPException(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        detail=detail,
    )
