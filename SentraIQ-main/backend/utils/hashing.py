"""
SHA-256 hashing utilities for immutable storage and chain-of-custody
"""
import hashlib
from pathlib import Path
from typing import Union


def calculate_file_hash(file_path: Union[str, Path]) -> str:
    """
    Calculate SHA-256 hash of a file

    Args:
        file_path: Path to the file

    Returns:
        Hexadecimal SHA-256 hash string
    """
    sha256_hash = hashlib.sha256()

    with open(file_path, "rb") as f:
        # Read file in chunks to handle large files
        for byte_block in iter(lambda: f.read(4096), b""):
            sha256_hash.update(byte_block)

    return sha256_hash.hexdigest()


def calculate_content_hash(content: Union[str, bytes]) -> str:
    """
    Calculate SHA-256 hash of content

    Args:
        content: String or bytes content

    Returns:
        Hexadecimal SHA-256 hash string
    """
    if isinstance(content, str):
        content = content.encode('utf-8')

    return hashlib.sha256(content).hexdigest()


def verify_file_integrity(file_path: Union[str, Path], expected_hash: str) -> bool:
    """
    Verify file integrity by comparing hash

    Args:
        file_path: Path to the file
        expected_hash: Expected SHA-256 hash

    Returns:
        True if hashes match, False otherwise
    """
    actual_hash = calculate_file_hash(file_path)
    return actual_hash == expected_hash
