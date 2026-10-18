"""Compact Streamlit views for review, rankings, and demo fixtures."""
import json

import pandas as pd
import streamlit as st

from demo.jobs import labels
from demo.presenters import job_rows, optional_missing, ranking_rows, skill_review_rows


def render_jobs_preview(jobs: list[dict], source: str):
    st.subheader(f"{len(jobs)} tin tuyển dụng đủ điều kiện")
    st.caption(f"Nguồn: {source} · Chỉ lấy tin đã duyệt, công ty xác minh, còn hạn và có kỹ năng rõ ràng.")
    if not jobs:
        st.info("Database chưa có tin tuyển dụng nào đạt đủ điều kiện chất lượng.")
        return
    st.dataframe(
        pd.DataFrame(job_rows(jobs)), hide_index=True, width="stretch", height="auto", row_height=52,
        column_config={
            "Vị trí": st.column_config.TextColumn(pinned=True, width="medium"),
            "Bắt buộc": st.column_config.TextColumn(width="large"),
            "Ưu tiên": st.column_config.TextColumn(width="large"),
        },
        alt=f"Danh sách {len(jobs)} tin tuyển dụng dùng cho demo đối sánh CV",
    )


def render_extraction(extraction: dict) -> list[str]:
    rows = skill_review_rows(extraction)
    st.subheader("2 · Xác nhận kỹ năng")
    st.caption("Bỏ chọn kỹ năng sai trước khi xếp hạng. Mỗi dòng đều có câu nguồn từ CV.")
    if not rows:
        st.info("Chưa tìm thấy kỹ năng trong taxonomy hiện tại.")
        return []

    frame = pd.DataFrame(rows).set_index("Skill ID")
    edited = st.data_editor(
        frame, key="skill_review", hide_index=True, width="stretch",
        height=min(56 * len(rows) + 40, 320), row_height=52,
        disabled=["Kỹ năng", "Đánh giá", "Dẫn chứng"],
        column_config={
            "Chọn": st.column_config.CheckboxColumn("Dùng", width="small"),
            "Kỹ năng": st.column_config.TextColumn(width="small"),
            "Đánh giá": st.column_config.TextColumn(width="small"),
            "Dẫn chứng": st.column_config.TextColumn(width="large"),
        },
        alt="Bảng rà soát kỹ năng được trích xuất từ CV và câu dẫn chứng",
    )
    accepted = edited.index[edited["Chọn"]].tolist()
    st.caption(f"Đã chọn **{len(accepted)}/{len(rows)}** kỹ năng để đối sánh.")
    with st.expander("Thông tin kỹ thuật của lần trích xuất"):
        st.write(f"**Phương pháp:** {extraction.get('mode', 'unknown')}")
        st.write(f"**Model:** {extraction.get('model', 'unknown')}")
        if extraction.get("warnings"):
            st.caption("Cảnh báo: " + " · ".join(extraction["warnings"]))
    return accepted


def render_rankings(payload: dict, jobs: list[dict]):
    rankings = sorted(payload.get("rankings", []), key=lambda row: row["match_percentage"], reverse=True)
    st.subheader("3 · Kết quả phù hợp")
    if not rankings:
        st.info("Chưa có kết quả xếp hạng.")
        return

    top = rankings[0]
    top_optional_missing = optional_missing(top, jobs)
    with st.container(border=True):
        title, score, matched, missing = st.columns([2.4, 1, 1, 1])
        title.markdown(f"**Đề xuất tốt nhất**  \n### {top['job_title']}")
        title.caption(top.get("company_name") or "")
        score.metric("Phù hợp", f"{top['match_percentage']:.0f}%" if top["score_available"] else "Chưa đủ dữ liệu")
        matched.metric("Đã khớp", len(top["matched_skills"]))
        missing.metric("Thiếu bắt buộc", len(top["missing_skills"]))
        st.caption(top["recommendation"])
        if top_optional_missing:
            st.caption("Kỹ năng ưu tiên chưa có: " + ", ".join(labels(top_optional_missing)))
        mode_note = "Chưa dùng so khớp ngữ nghĩa." if "semantic_unavailable" in top.get("warnings", []) else ""
        st.caption(f"Chế độ {top['mode']} · Điểm dùng để xếp hạng, không phải xác suất tuyển dụng. {mode_note}")

    st.dataframe(
        pd.DataFrame(ranking_rows(payload, jobs)), hide_index=True, width="stretch", height="auto",
        row_height=46,
        column_config={
            "#": st.column_config.NumberColumn(width="small"),
            "Vị trí": st.column_config.TextColumn(pinned=True, width="medium"),
            "Phù hợp": st.column_config.ProgressColumn(format="%.0f%%", min_value=0, max_value=100),
            "Đã khớp": st.column_config.TextColumn(width="large"),
            "Thiếu bắt buộc": st.column_config.TextColumn(width="large"),
            "Thiếu ưu tiên": st.column_config.TextColumn(width="large"),
        },
        alt=f"Bảng xếp hạng {len(rankings)} vị trí theo mức phù hợp với kỹ năng đã xác nhận",
    )

    with st.expander("Xem giải thích từng vị trí"):
        selected_title = st.selectbox("Vị trí", [row["job_title"] for row in rankings])
        selected = next(row for row in rankings if row["job_title"] == selected_title)
        st.write(selected["recommendation"])
        st.caption("Khớp: " + (", ".join(labels(selected["matched_skills"])) or "—"))
        st.caption("Thiếu bắt buộc: " + (", ".join(labels(selected["missing_skills"])) or "—"))


def download_report(extraction: dict, rankings: dict, accepted: list[str]):
    report = {"extraction": extraction, "accepted_skill_ids": accepted, "ranking": rankings}
    st.download_button(
        ":material/download: Tải báo cáo JSON", json.dumps(report, ensure_ascii=False, indent=2),
        file_name="internlink-ai-demo-report.json", mime="application/json", width="stretch",
    )
