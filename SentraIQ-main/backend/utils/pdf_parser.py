"""
PDF parsing utilities for extracting text from policy documents
"""
import fitz  # PyMuPDF
from pathlib import Path
from typing import Dict, Any


def extract_text_from_pdf(pdf_path: Path) -> str:
    """
    Extract all text from a PDF file

    Args:
        pdf_path: Path to the PDF file

    Returns:
        Extracted text content
    """
    text = ""

    try:
        with fitz.open(pdf_path) as doc:
            for page_num, page in enumerate(doc, start=1):
                page_text = page.get_text()
                text += f"\n--- Page {page_num} ---\n"
                text += page_text
    except Exception as e:
        raise Exception(f"Failed to extract text from PDF: {str(e)}")

    return text


def extract_pdf_metadata(pdf_path: Path) -> Dict[str, Any]:
    """
    Extract metadata from PDF

    Args:
        pdf_path: Path to the PDF file

    Returns:
        Dictionary containing PDF metadata
    """
    metadata = {}

    try:
        with fitz.open(pdf_path) as doc:
            metadata = {
                "page_count": doc.page_count,
                "title": doc.metadata.get("title", ""),
                "author": doc.metadata.get("author", ""),
                "subject": doc.metadata.get("subject", ""),
                "creator": doc.metadata.get("creator", ""),
                "producer": doc.metadata.get("producer", ""),
                "creation_date": doc.metadata.get("creationDate", ""),
                "modification_date": doc.metadata.get("modDate", ""),
            }
    except Exception as e:
        raise Exception(f"Failed to extract PDF metadata: {str(e)}")

    return metadata


def search_text_in_pdf(pdf_path: Path, search_term: str) -> list:
    """
    Search for specific text in PDF and return matches with context

    Args:
        pdf_path: Path to the PDF file
        search_term: Text to search for

    Returns:
        List of dictionaries with page number and matching text
    """
    matches = []

    try:
        with fitz.open(pdf_path) as doc:
            for page_num, page in enumerate(doc, start=1):
                text_instances = page.search_for(search_term)
                if text_instances:
                    page_text = page.get_text()
                    matches.append({
                        "page": page_num,
                        "occurrences": len(text_instances),
                        "context": page_text[:500]  # First 500 chars as context
                    })
    except Exception as e:
        raise Exception(f"Failed to search PDF: {str(e)}")

    return matches
