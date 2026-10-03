"""Bounded text extraction. Never fetch URLs or execute embedded document content."""
import base64
import hashlib
import io
import zipfile
import xml.etree.ElementTree as ET

from pydantic import BaseModel, Field

MAX_BYTES = 10 * 1024 * 1024
MAX_TEXT = 100_000


class DocumentInput(BaseModel):
    filename: str = Field(min_length=1, max_length=255)
    content_base64: str = Field(min_length=1, max_length=14_000_000)
    allow_cloud: bool = False


class DocumentParseError(ValueError):
    pass


def parse_document(document: DocumentInput):
    try:
        data = base64.b64decode(document.content_base64, validate=True)
    except Exception:
        raise DocumentParseError("invalid_base64") from None
    if len(data) > MAX_BYTES:
        raise DocumentParseError("document_too_large")
    suffix = document.filename.lower().rsplit(".", 1)[-1]
    pages = []
    try:
        if suffix == "pdf":
            from pypdf import PdfReader
            reader = PdfReader(io.BytesIO(data))
            if reader.is_encrypted:
                raise DocumentParseError("encrypted_pdf")
            if len(reader.pages) > 50:
                raise DocumentParseError("too_many_pages")
            for page in reader.pages:
                text = page.extract_text() or ""
                pages.append(text)
                if sum(map(len, pages)) > MAX_TEXT:
                    raise DocumentParseError("document_text_too_large")
        elif suffix == "docx":
            with zipfile.ZipFile(io.BytesIO(data)) as archive:
                if sum(info.file_size for info in archive.infolist()) > 30 * 1024 * 1024:
                    raise DocumentParseError("expanded_document_too_large")
                xml = archive.read("word/document.xml")
                if b"<!DOCTYPE" in xml.upper() or b"<!ENTITY" in xml.upper():
                    raise DocumentParseError("unsupported_xml")
                root = ET.fromstring(xml)
                ns = {"w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main"}
                pages = ["\n".join("".join(p.itertext()) for p in root.findall(".//w:p", ns))]
        elif suffix == "txt":
            pages = [data.decode("utf-8-sig")]
        else:
            raise DocumentParseError("unsupported_document_type")
    except DocumentParseError:
        raise
    except ImportError:
        raise DocumentParseError("pdf_parser_not_installed") from None
    except Exception:
        raise DocumentParseError("unreadable_document") from None
    text = "\n\n".join(pages)
    if not text.strip():
        raise DocumentParseError("ocr_required" if suffix == "pdf" else "empty_document")
    if len(text) > MAX_TEXT:
        raise DocumentParseError("document_text_too_large")
    return text, hashlib.sha256(data).hexdigest(), pages
