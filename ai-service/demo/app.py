"""Run with: streamlit run demo/app.py"""
from pathlib import Path
import sys

import streamlit as st

SERVICE_ROOT = Path(__file__).resolve().parents[1]
if str(SERVICE_ROOT) not in sys.path:
    sys.path.insert(0, str(SERVICE_ROOT))

from demo.client import AiServiceClient, AiServiceError
from demo.job_source import load_quality_jobs
from demo.views import download_report, render_extraction, render_jobs_preview, render_rankings
from demo.workflow import extract_file, extract_text, rank_jobs


@st.cache_data(ttl=60)
def cached_jobs():
    return load_quality_jobs()


st.set_page_config(page_title="InternLink AI Workbench", page_icon=":material/workspace_premium:", layout="wide")
job_result = cached_jobs()
jobs = job_result.jobs
st.title("InternLink AI Workbench")
st.caption(f"Tải CV · kiểm tra kỹ năng · xếp hạng {len(jobs)} vị trí đủ điều kiện")

with st.sidebar:
    st.header("Kết nối AI service")
    base_url = st.text_input("Base URL", "http://127.0.0.1:8001")
    api_key = st.text_input(
        "Service key", type="password",
        help="Mật khẩu nội bộ của AI service. Để trống khi SERVICE_API_KEY chưa bật.",
    )
    client = AiServiceClient(base_url, api_key)
    if st.button(":material/monitor_heart: Kiểm tra kết nối", width="stretch"):
        try:
            health = client.get("/health/live")
            st.success(f"AI service đang hoạt động · {health.elapsed_ms} ms")
        except AiServiceError as error:
            st.error(str(error))
    st.divider()
    st.info("CV chỉ tồn tại trong session demo và không được lưu vào database.")
    st.markdown("**Nguồn tuyển dụng**")
    st.caption(f"{job_result.source} · {len(jobs)} tin đang dùng")
    if job_result.expired_excluded:
        st.caption(f"Đã loại {job_result.expired_excluded} tin hết hạn.")
    if job_result.warning:
        st.warning(job_result.warning)
    if st.button(":material/refresh: Tải lại tin từ database", width="stretch"):
        cached_jobs.clear()
        st.rerun()

pipeline, jobs_tab, raw_tab = st.tabs(["Đối sánh CV", "Tin tuyển dụng", "Dữ liệu kỹ thuật"])

with jobs_tab:
    render_jobs_preview(jobs, job_result.source)

with pipeline:
    has_extraction = bool(st.session_state.get("extraction"))
    with st.expander("1 · Cung cấp CV", expanded=not has_extraction):
        source_mode = st.segmented_control(
            "Nguồn CV", ["Tải tệp", "Dán văn bản"], default="Tải tệp", required=True,
            width="stretch",
        )
        source_col, action_col = st.columns([2.1, 1], gap="large")
        with source_col:
            upload = st.file_uploader(
                "PDF, DOCX hoặc TXT (tối đa 10 MB)", type=["pdf", "docx", "txt"],
                max_upload_size=10, disabled=source_mode != "Tải tệp",
            )
            text = st.text_area(
                "Nội dung CV", height=145, disabled=source_mode != "Dán văn bản",
                placeholder="Ví dụ: Đã xây dựng API bằng Java, Spring Boot và SQL. Sử dụng Git cho dự án.",
            )
        with action_col:
            st.markdown("**Quyền riêng tư**")
            allow_cloud = st.toggle(
                "Cho phép dùng model cloud", value=False,
                help="Bật lựa chọn này mới cho phép AI service gửi nội dung CV đến provider đã cấu hình.",
            )
            st.caption("Tắt để chạy rule-based tại local. PDF scan chưa có text cần OCR ở giai đoạn sau.")
            run = st.button(":material/auto_awesome: Phân tích CV", type="primary", width="stretch")

    if run:
        try:
            if source_mode == "Tải tệp":
                if upload is None:
                    st.warning("Hãy chọn một tệp CV.")
                    st.stop()
                result = extract_file(client, upload.name, upload.getvalue(), allow_cloud)
            else:
                if not text.strip():
                    st.warning("Hãy nhập nội dung CV.")
                    st.stop()
                result = extract_text(client, text, allow_cloud)
            st.session_state.pop("skill_review", None)
            st.session_state.extraction = result.data
            st.session_state.extraction_meta = {"http_status": result.status_code, "elapsed_ms": result.elapsed_ms}
            st.session_state.pop("rankings", None)
            st.session_state.pop("ranked_skill_ids", None)
            st.rerun()
        except AiServiceError as error:
            status = f" HTTP {error.status_code}" if error.status_code else ""
            st.error(f"AI service lỗi{status}: {error.detail}")

    extraction = st.session_state.get("extraction")
    if extraction:
        accepted = render_extraction(extraction)
        previous = st.session_state.get("ranked_skill_ids", [])
        rankings = st.session_state.get("rankings")
        stale = rankings is not None and set(previous) != set(accepted)
        button_label = "Cập nhật xếp hạng" if rankings else f"Xếp hạng {len(jobs)} vị trí"
        if st.button(
            f":material/leaderboard: {button_label}", type="primary", width="stretch",
            disabled=not accepted or not jobs,
        ):
            try:
                ranking = rank_jobs(client, accepted, jobs)
                st.session_state.rankings = ranking.data
                st.session_state.ranked_skill_ids = accepted
                st.session_state.ranking_meta = {"http_status": ranking.status_code, "elapsed_ms": ranking.elapsed_ms}
                rankings, stale = ranking.data, False
            except AiServiceError as error:
                st.error(f"Không xếp hạng được: {error.detail}")
        if not accepted:
            st.warning("Hãy chọn ít nhất một kỹ năng để xếp hạng.")
        elif not jobs:
            st.warning("Database chưa có tin còn hạn đạt đủ điều kiện để xếp hạng.")
        elif stale:
            st.warning("Danh sách kỹ năng vừa thay đổi. Bấm “Cập nhật xếp hạng” để tính lại kết quả.")
        elif rankings:
            render_rankings(rankings, jobs)
            download_report(extraction, rankings, accepted)
    else:
        st.info("Chọn nguồn CV và bấm “Phân tích CV” để bắt đầu.")

with raw_tab:
    st.subheader("Dữ liệu kỹ thuật")
    st.caption("Dùng khi kiểm tra API; người dùng demo thông thường không cần mở phần này.")
    with st.expander("Extraction metadata và JSON"):
        st.write(st.session_state.get("extraction_meta", "Chưa chạy"))
        if st.session_state.get("extraction"):
            st.json(st.session_state.extraction)
    with st.expander("Ranking metadata và JSON"):
        st.write(st.session_state.get("ranking_meta", "Chưa chạy"))
        if st.session_state.get("rankings"):
            st.json(st.session_state.rankings)
