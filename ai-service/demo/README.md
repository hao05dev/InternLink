# InternLink AI Workbench

Giao diện Streamlit này chạy độc lập với frontend và backend chính. Nó gọi trực tiếp
FastAPI AI service để kiểm thử trọn luồng:

1. đọc tin tuyển dụng còn hạn và đủ chất lượng từ PostgreSQL InternLink;
2. tải CV PDF, DOCX, TXT hoặc dán nội dung;
3. trích xuất kỹ năng và xem câu nguồn;
4. xác nhận hoặc bỏ từng kỹ năng;
5. xếp hạng toàn bộ tin mẫu và tải báo cáo JSON.

## Chạy local

Mở hai terminal tại thư mục `ai-service`:

```powershell
.venv/Scripts/python.exe -m pip install -r requirements-demo.txt
.venv/Scripts/python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8001
```

```powershell
.venv/Scripts/python.exe -m streamlit run demo/app.py
```

Mở `http://127.0.0.1:8501`. Chế độ mặc định dùng rule-based extraction và
skill-only ranking nên không cần API key. Nếu bật model cloud, người thử phải tích
ô đồng ý gửi nội dung CV; cấu hình provider vẫn lấy từ `.env` của AI service.

Workbench đọc database ở transaction chỉ đọc, không gọi backend Spring Boot và không lưu CV.
Tin phải được duyệt, thuộc công ty đã xác minh, còn hạn, có mô tả từ 120 ký tự và ít
nhất hai kỹ năng. Khi PostgreSQL không kết nối được, giao diện ghi rõ và dùng fixture
dự phòng. Tệp CV chỉ tồn tại trong session Streamlit. PDF scan chưa có text trả
`ocr_required`.
