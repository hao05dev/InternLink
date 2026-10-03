"""Conservative lexical cues. These describe statements, never proficiency."""
import re


def classify_assertion(text: str, start: int, end: int) -> str:
    left = max(text.rfind(mark, 0, start) for mark in (".", "\n", ";", ","))
    prefix = text[max(left + 1, start - 100):start].casefold()
    if re.search(r"(chưa|không|never|no experience|not familiar|without)\b", prefix):
        return "negated"
    if re.search(r"(muốn học|sẽ học|dự định|đang học|learning|plan to learn|want to learn)\b", prefix):
        return "learning"
    return "mentioned"


def classify_requirement(text: str, start: int) -> str:
    left = max(text.rfind(mark, 0, start) for mark in (".", "\n", ";"))
    prefix = text[max(left + 1, start - 160):start].casefold()
    if re.search(r"(ưu tiên|lợi thế|không bắt buộc|nice.to.have|preferred|optional)", prefix):
        return "optional"
    if re.search(r"(bắt buộc|yêu cầu|cần có|required|must.have|must know)", prefix):
        return "mandatory"
    return "unspecified"
