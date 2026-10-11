**Rà soát tiến độ InternLink — 06/10/2026**

Phạm vi: mã nguồn hiện tại của backend-core, frontend-web, ai-service, migration V1–V21 và các thay đổi chưa commit; đối chiếu mô tả luận văn; chạy kiểm thử và build; kiểm tra chỉ đọc bucket R2 cấu hình trong backend-core/.env.

**Kết luận:** hệ thống đã có phần lớn nền tảng và nhiều màn hình nghiệp vụ, nhưng một số bước thiết yếu chưa nối thành luồng hoàn chỉnh. Có thể tiếp tục phát triển và demo theo từng phân hệ; chưa đủ bằng chứng nghiệm thu toàn trình. Không gán tỷ lệ hoàn thành phần trăm vì chưa có danh sách tiêu chí nghiệm thu có trọng số.

Đây là rà soát cấu trúc/chức năng và kiểm thử tự động. Chưa thực hiện đăng nhập, thao tác giao diện bằng trình duyệt cho cả 6 vai trò, kiểm thử responsive trực quan, gửi Gmail thật hoặc upload/download qua ứng dụng lên R2. Không sửa mã nghiệp vụ, không thay đổi DB vận hành, không ghi/xóa object R2.

**1. Mẫu báo cáo và R2 — phát hiện trọng tâm**

| Đối tượng | Trạng thái xác minh |
|---|---|
| Kết nối bucket đang cấu hình | ListObjectsV2 trả HTTP 200. Kiểm tra prefix ứng dụng: 0 object. Kiểm tra toàn bucket: 0 object, IsTruncated=false. |
| Cấu hình trên đĩa | STORAGE_PROVIDER=R2; các trường cấu hình R2 có giá trị. Không công bố thông tin định danh hoặc khóa. |
| Upload tài liệu | Có API multipart qua backend và presigned PUT + finalize, có kiểm tra định dạng, checksum, quyền và xử lý rollback. |
| Upload trực tiếp từ browser | R2_DIRECT_UPLOAD_ENABLED=false trong file .env đã kiểm tra. Điều này chỉ tắt direct PUT; proxy upload lên R2 vẫn là một luồng riêng. |
| M01–M05 trên web | Có biểu mẫu, lưu nội dung, phiên bản nội dung, xuất Word, bản ký, gửi/duyệt/công bố theo quyền. |
| File mẫu gốc do khoa upload | Chưa có module riêng để upload, quản lý, gán mẫu theo kỳ/ngành/học phần và công bố cho sinh viên. |
| Template của trình xuất Word | Tạo mới DOCX bằng code, không đọc file template DOCX đã upload lên R2. |
| Phiên bản mẫu | Có chuỗi mặc định CTU-2026-v1; chưa có thực thể template/file/version và quan hệ ràng buộc tới bản mẫu cụ thể. |
| Lưu M05 đã nộp | Code tạo DOCX, gọi DocumentService và nộp REPORT/FINAL; provider phụ thuộc cấu hình runtime thực tế. |
| Lưu lịch sử DOCX | PortfolioRevision.docx vẫn là bytea trong PostgreSQL. Vì vậy không phải mọi bản báo cáo đều chỉ nằm trên R2. |
| Bản scan đã ký | PNG/JPEG dùng R2; PDF dùng provider đang kích hoạt. Dữ liệu bytea cũ vẫn có đường đọc. |

Bucket rỗng là trạng thái của **bucket trong cấu hình được kiểm tra tại thời điểm rà soát**, không chứng minh các bucket khác cũng rỗng. HTTP 200 cho việc liệt kê xác nhận quyền đọc metadata; chưa chứng minh quyền ghi, CORS, luồng tải lên hoặc phân quyền tải xuống từ ứng dụng.

Spring hiện nhận cấu hình qua biến môi trường trong application.yml; chưa thấy cơ chế tự nạp file .env trong mã khởi động/POM. Cần xác minh cách khởi chạy thực tế có nạp biến này. Mặc định trong application.yml là LOCAL. Chỉ có file .env chứa STORAGE_PROVIDER=R2 chưa bảo đảm tiến trình Java đang dùng R2.

Bằng chứng:
- [PortfolioDocxExporter.java](H:/._HK12627/LuanVan/InternLink/backend-core/src/main/java/com/internlink/core/application/portfolio/PortfolioDocxExporter.java:25): tạo WordprocessingMLPackage mới; phần M05 được dựng từ mã tại dòng 121.
- [PortfolioForm.java](H:/._HK12627/LuanVan/InternLink/backend-core/src/main/java/com/internlink/core/domain/placement/PortfolioForm.java:16): templateVersion cố định mặc định.
- [PortfolioService.java](H:/._HK12627/LuanVan/InternLink/backend-core/src/main/java/com/internlink/core/application/portfolio/PortfolioService.java:262): tạo Document khi gửi M05.
- [PortfolioRevision.java](H:/._HK12627/LuanVan/InternLink/backend-core/src/main/java/com/internlink/core/domain/placement/PortfolioRevision.java:16): snapshot DOCX trong DB.
- [PortfolioFileStorage.java](H:/._HK12627/LuanVan/InternLink/backend-core/src/main/java/com/internlink/core/application/portfolio/PortfolioFileStorage.java:24): định tuyến bản ký.
- [DocumentType.java](H:/._HK12627/LuanVan/InternLink/backend-core/src/main/java/com/internlink/core/shared/enums/DocumentType.java), [ContextType.java](H:/._HK12627/LuanVan/InternLink/backend-core/src/main/java/com/internlink/core/shared/enums/ContextType.java): chưa có phạm vi template/kỳ/ngành cho kho mẫu riêng.
- [application.yml](H:/._HK12627/LuanVan/InternLink/backend-core/src/main/resources/application.yml): provider và các cờ chức năng.

**2. Tiến độ theo phân hệ**

“Đã có” trong bảng là đã thấy mã xử lý và giao diện/API tương ứng; không đồng nghĩa mọi tình huống đã được nghiệm thu E2E.

| Phân hệ | Đã có | Phần còn thiếu/cần hoàn thiện |
|---|---|---|
| Tài khoản và phân quyền | Đăng nhập, role guard, 6 cổng vai trò, quản trị người dùng | Chưa thấy màn hình đăng ký doanh nghiệp tự phục vụ, quên/đổi mật khẩu; kiểm tra phân quyền liên khoa ở chức năng mới. |
| Khoa/ngành/kỳ thực tập | CRUD, trạng thái kỳ, đóng kỳ, chuyển tiếp, lọc theo kỳ | Giao diện quản lý mẫu báo cáo và phương án đánh giá theo kỳ/ngành. |
| Danh sách sinh viên | Danh sách, điều kiện, import Excel/Google Sheets, quản lý tiến trình | Nghiệm thu với dữ liệu thật và ca ngoại lệ import. |
| Doanh nghiệp/tin tuyển dụng | Danh bạ, quản trị/duyệt doanh nghiệp, tạo/sửa/duyệt tin, ảnh và đính kèm | Luồng doanh nghiệp tự đăng ký/xác minh chưa đầy đủ trên giao diện. |
| Hồ sơ sinh viên | Thông tin cá nhân, CV, kỹ năng, AI xác nhận kỹ năng | Cần hoàn thiện chứng chỉ/học phần, sở thích địa điểm/thời gian và quyền chia sẻ theo phạm vi luận văn. |
| Ứng tuyển/phỏng vấn/offer | Ứng tuyển/rút đơn, pipeline ứng viên, tạo offer | Lưu lịch phỏng vấn; sinh viên xem và chấp nhận/từ chối offer; nối sang khởi tạo thỏa thuận. |
| Thỏa thuận ba bên | Backend tạo/ký/duyệt, màn hình sinh viên ký thỏa thuận đã tồn tại | Giao diện khởi tạo, doanh nghiệp ký, khoa ký/duyệt và chỉnh sửa kế hoạch. |
| Tự tìm nơi thực tập | Đăng ký, duyệt, phân công/chuyển nơi thực tập | Giấy tiếp nhận/minh chứng vẫn nhập URL ở một số màn hình, chưa thống nhất upload R2. |
| Giấy giới thiệu | Code yêu cầu/duyệt/cấp/xác nhận nhận, migration V21 và màn hình mới | Chưa sinh/lưu file giấy giới thiệu; thiếu kiểm tra phạm vi khoa/phân công ở service. |
| Nhật ký/hồ sơ thực tập | Nhật ký ngày, tổng hợp tuần, xác nhận/nhận xét, M01–M05, bản ký, lịch sử | Luồng chấm công check-in/out riêng có API nhưng chưa có UI; đồng bộ nguồn dữ liệu AI với nhật ký ngày. |
| Đánh giá/chốt điểm | M03/M04, điểm thành phần, chốt/công bố, bảng điểm/xuất Excel | Trang chấm điểm riêng còn dữ liệu mẫu và công thức cố định; thiếu UI phương án đánh giá, giữa kỳ/tự đánh giá. |
| Sự cố/ngoại lệ | API báo cáo và xử lý case; một phần chuyển đơn vị đã có UI | Chưa có màn hình case để báo cáo, xem minh chứng và xử lý/đóng sự cố. |
| Báo cáo/CLO | Backend báo cáo CLO, bảng điểm theo kỳ | Chưa thấy UI gọi API CLO; số đo hiện là proxy theo kết quả học phần, chưa đo từng CLO bằng minh chứng. |
| Thông báo/email | Inbox, chuông, SSE, tùy chọn, outbox, campaign, retry/đối soát | Reminder/campaign đang tắt trong .env; email thật và các luồng liên kết cần E2E. |
| Tệp/media/R2 | Storage router, upload proxy/direct, kiểm tra tệp, media theo quyền, vận hành orphan | Kho mẫu chính thức; thống nhất các trường URL; kiểm thử upload/download và quyền thực tế. |
| AI | CV→kỹ năng, gợi ý, giải thích, thống kê nhu cầu kỹ năng, hỗ trợ JD/nhật ký/kế hoạch | Ranking web hiện skill-only; thiếu embedding thực, bộ nhãn chuyên gia, đánh giá nghiên cứu; nhật ký AI chưa dùng daily/portfolio. |
| Mobile/PWA và báo cáo cải tiến | Web có bố cục responsive trong mã | Chưa thấy manifest/service worker/PWA; chưa có luồng khảo sát hài lòng, thời gian ghép, đánh giá chất lượng đối tác đầy đủ. |

**3. Các vấn đề ưu tiên cao có bằng chứng trực tiếp**

**P1 — Điểm mẫu và các đường chấm điểm chưa thống nhất.** Trang /lecturer/grading/[id] khởi tạo điểm mentor 8.0, ba điểm 8.5/8.8/8.5 và lời nhận xét mẫu. loadData chỉ lấy portfolio overview; không nạp điểm đã lưu vào các state đó. Trang tự tính 40% mentor + 60% giảng viên và gửi /api/v1/evaluations. Trong khi đó, luồng chốt điểm chính thức lấy AssessmentComponentScore theo AssessmentScheme đã duyệt. Backend tổng hợp danh sách còn có fallback 50/50 khi chưa có FinalResult. Hệ quả: cùng hồ sơ có thể hiện điểm khác nhau giữa các màn hình; người dùng có thể nộp điểm mặc định như điểm thật.

Cần thống nhất trang chấm điểm với M03/M04 và điểm thành phần, để trống khi chưa chấm, tải lại dữ liệu thực, lấy trọng số từ scheme, không coi điểm tạm là kết quả đã chốt.
Bằng chứng: [lecturer-grading-detail-view.tsx](H:/._HK12627/LuanVan/InternLink/frontend-web/src/features/evaluations/views/lecturer-grading-detail-view.tsx:24), [FinalResultServiceImpl.java](H:/._HK12627/LuanVan/InternLink/backend-core/src/main/java/com/internlink/core/application/evaluation/impl/FinalResultServiceImpl.java:112), [fallback danh sách](H:/._HK12627/LuanVan/InternLink/backend-core/src/main/java/com/internlink/core/application/evaluation/impl/FinalResultServiceImpl.java:392), [RubricEvaluationServiceImpl.java](H:/._HK12627/LuanVan/InternLink/backend-core/src/main/java/com/internlink/core/application/evaluation/impl/RubricEvaluationServiceImpl.java:94).

**P1 — Offer → thỏa thuận chưa đi hết bằng giao diện.** Khi đơn có trạng thái OFFERED, sinh viên chỉ thấy liên kết “Xem thỏa thuận”. Không tìm thấy frontend gọi /offers/{id}/respond hay POST /agreements. Trang thỏa thuận nói tự khởi tạo sau khi nhận offer, nhưng handler respondToOffer hiện chỉ đổi trạng thái và phát thông báo, không tạo agreement. Backend có API để làm các bước này nhưng UI chưa nối. Khoa chỉ lấy agreement APPROVED để phân công; chưa có màn hình doanh nghiệp ký/khoa duyệt.

Bằng chứng: [student-applications-view.tsx](H:/._HK12627/LuanVan/InternLink/frontend-web/src/features/jobs/components/student-applications-view.tsx:220), [learning-agreement-view.tsx](H:/._HK12627/LuanVan/InternLink/frontend-web/src/features/learning-agreement/components/learning-agreement-view.tsx:38), [PlacementOfferServiceImpl.java](H:/._HK12627/LuanVan/InternLink/backend-core/src/main/java/com/internlink/core/application/recruitment/impl/PlacementOfferServiceImpl.java:155), [LearningAgreementController.java](H:/._HK12627/LuanVan/InternLink/backend-core/src/main/java/com/internlink/core/presentation/placement/controller/LearningAgreementController.java).

**P1 — Giấy giới thiệu thiếu phân quyền theo tài nguyên.** review và confirmReceived chỉ kiểm tra role, rồi lấy yêu cầu theo ID; byTerm cho phép lecturer/faculty đọc theo termId nhưng không kiểm tra khoa/phân công. Cần kiểm tra actor có quản lý đúng khoa/kỳ hoặc sinh viên được phân công trước khi đọc/duyệt. Không nên xem chức năng mới đã hoàn tất chỉ vì build qua. Hiện chức năng cấp mã và hướng dẫn nhận giấy; chưa có file PDF/DOCX gắn với yêu cầu.

Bằng chứng: [IntroductionLetterService.java](H:/._HK12627/LuanVan/InternLink/backend-core/src/main/java/com/internlink/core/application/placement/IntroductionLetterService.java:83), [confirmReceived](H:/._HK12627/LuanVan/InternLink/backend-core/src/main/java/com/internlink/core/application/placement/IntroductionLetterService.java:135), [byTerm](H:/._HK12627/LuanVan/InternLink/backend-core/src/main/java/com/internlink/core/application/placement/IntroductionLetterService.java:190).

**P1 — Thiếu quản trị phương án đánh giá.** Backend có tạo/duyệt/ngừng áp dụng/bind scheme, nhưng chưa thấy frontend gọi /api/v1/assessment-schemes. Khoa chưa có UI để cấu hình rubric, trọng số, hạn nộp và yêu cầu báo cáo cho kỳ mới. Dữ liệu seed không thay thế được luồng vận hành này.
Bằng chứng: [AssessmentSchemeController.java](H:/._HK12627/LuanVan/InternLink/backend-core/src/main/java/com/internlink/core/presentation/evaluation/controller/AssessmentSchemeController.java).

**P2 — Đặt lịch phỏng vấn mới lưu trong state trình duyệt.** Handler chỉ PATCH status=INTERVIEWING; ngày/địa điểm nằm trong state, tải lại sẽ mất. Code đã thông báo “API chưa lưu ngày giờ hẹn”. Còn ngày hẹn và nội dung doanh nghiệp mặc định cố định trong form.
Bằng chứng: [company-candidates-view.tsx](H:/._HK12627/LuanVan/InternLink/frontend-web/src/features/jobs/components/company-candidates-view.tsx:134).

**P2 — Một số tệp vẫn là URL nhập tay.** Giấy tiếp nhận trong self-placement và scan phiếu chấm giấy trong paper override chưa dùng thao tác chọn tệp/upload R2. Luồng portfolio bản ký có upload thật, nhưng không tự thay thế hai màn hình này.
Bằng chứng: [self-placement-registration-view.tsx](H:/._HK12627/LuanVan/InternLink/frontend-web/src/features/placements/components/self-placement-registration-view.tsx:471), [paper-evaluation-override-modal.tsx](H:/._HK12627/LuanVan/InternLink/frontend-web/src/features/evaluations/components/modals/paper-evaluation-override-modal.tsx:102).

**P2 — Báo cáo giữa kỳ/CLO/sự cố chưa đủ giao diện.** M05 hiện submit FINAL; chưa có màn hình báo cáo MIDTERM tương ứng khi scheme yêu cầu. API case và CLO tồn tại nhưng không tìm thấy frontend sử dụng. CLO backend tự ghi rõ measurementMethod=PLACEMENT_RESULT_PROXY, cần bổ sung ánh xạ minh chứng/tiêu chí tới từng chuẩn trước khi tuyên bố đo năng lực thực.
Bằng chứng: [PortfolioService.java](H:/._HK12627/LuanVan/InternLink/backend-core/src/main/java/com/internlink/core/application/portfolio/PortfolioService.java:271), [InternshipCaseController.java](H:/._HK12627/LuanVan/InternLink/backend-core/src/main/java/com/internlink/core/presentation/exception_case/controller/InternshipCaseController.java), [CloReportServiceImpl.java](H:/._HK12627/LuanVan/InternLink/backend-core/src/main/java/com/internlink/core/application/evaluation/impl/CloReportServiceImpl.java:106).

**4. Phần cần xây dựng riêng cho mẫu báo cáo**

Đề xuất tối thiểu để hoàn thành đúng luồng “khoa đưa mẫu lên hệ thống, sinh viên dùng mẫu”:

1. Trang quản trị “Biểu mẫu & Mẫu báo cáo”: tải DOCX/PDF lên, tên/mã M01–M05, mô tả, phạm vi khoa/ngành/học phần/kỳ, trạng thái nháp/công bố/ngừng áp dụng.
2. Metadata template và phiên bản bất biến: liên kết object/document ID, checksum, MIME/size, người upload, thời điểm, version; tách phiên bản mẫu khỏi phiên bản bài làm sinh viên.
3. Gán mẫu cho kỳ/ngành; chốt templateVersionId trên hồ sơ/bài nộp, giữ được mẫu cũ khi khoa phát hành mẫu mới.
4. Giao diện sinh viên/mentor/giảng viên: hiển thị đúng mẫu áp dụng, xem trước/tải mẫu, phiên bản và hướng dẫn. Hiện chưa có thành phần này.
5. Phân biệt hai khả năng: (a) tải file mẫu chính thức để làm offline; (b) hệ thống điền nội dung vào DOCX template. Nếu cần (b), phải có quy ước trường dữ liệu và cơ chế ánh xạ; upload file DOCX đơn thuần không tự làm trình xuất hiện tại đổi bố cục.
6. Dùng lại kiểm tra file/quyền/storage hiện có nhưng bổ sung scope template. Khi thêm object mẫu phải cập nhật bộ đối soát reference/orphan để không xem mẫu đang dùng là rác.
7. Test với file mẫu thật: upload→metadata→gán kỳ→sinh viên tải→nộp→giảng viên xem; sai khoa bị chặn; mẫu cũ vẫn truy xuất; xóa/thay mẫu không làm hỏng hồ sơ.
8. Chốt chính sách lưu: file mẫu/bản nộp/bản ký trên R2; có tiếp tục snapshot DOCX bytea hay chuyển sang object theo revision. Đây là quyết định thiết kế, không phải bằng chứng chức năng hiện có lỗi.

Không có file mẫu gốc cụ thể được cung cấp trong yêu cầu này để đối chiếu độ giống của bản Word xuất ra; cần nghiệm thu bố cục bằng mẫu của khoa khi triển khai.

**5. Kiểm tra đã chạy lại**

| Kiểm tra | Kết quả thực tế lượt này |
|---|---|
| Frontend Vitest | 39 file, 125 test qua. |
| TypeScript | tsc --noEmit --incremental false: exit 0. |
| Next.js production build | Thành công; còn cảnh báo img, hook dependencies/ref cleanup. |
| Backend Maven | mvn -q test: exit 0. Tổng XML 199 test: 174 qua, 25 bỏ qua, 0 failures/errors. |
| PostgreSQL integration | 25 test có điều kiện môi trường bị bỏ qua; chưa xác nhận bằng lượt này. |
| AI pytest | 57 qua; 2 deprecation warnings. Dùng .venv của dự án. |
| React Doctor | Scan theo diff main→origin/main, 173 file: 66/100; 76 warnings ở 35 file. Đây là gợi ý rà soát, không phải 76 lỗi hành vi đã xác nhận hoặc tỷ lệ hoàn thành sản phẩm. |
| R2 thật | Chỉ đọc metadata: HTTP 200; bucket đang cấu hình rỗng. Chưa kiểm thử ghi và tải lại. |
| E2E / responsive / Gmail / model thật | Chưa chạy trong lượt rà soát này. |

Log: [Vitest](H:/._HK12627/LuanVan/InternLink/frontend-web/audit-vitest.log), [TypeScript](H:/._HK12627/LuanVan/InternLink/frontend-web/audit-tsc.log), [Next build](H:/._HK12627/LuanVan/InternLink/frontend-web/audit-build.log), [Maven](H:/._HK12627/LuanVan/InternLink/backend-core/target/audit-maven.log), [AI](H:/._HK12627/LuanVan/InternLink/ai-service/audit-pytest.log), [React Doctor](H:/._HK12627/LuanVan/InternLink/frontend-web/audit-react-doctor.log).

Bộ test hiện tại qua không phủ được các điểm đứt luồng nêu trên: nhiều test frontend mock API; backend phần PostgreSQL chưa chạy; chưa có ca E2E xuyên offer→agreement→placement→báo cáo→điểm. Cần thêm kiểm thử ở đúng ranh giới nghiệp vụ thay vì chỉ tăng số lượng unit test.

**6. Thứ tự triển khai đề nghị**

| Thứ tự | Công việc | Tiêu chí kết thúc |
|---|---|---|
| 1 | Kho mẫu báo cáo + luồng R2 thật | Khoa upload mẫu, gán kỳ/ngành; sinh viên tải đúng phiên bản; kiểm tra quyền và file tồn tại trên R2. |
| 2 | Bỏ điểm mẫu, thống nhất rubric/scheme/M03–M04 | Mọi màn hình dùng điểm thật và cùng trọng số; chốt/công bố có minh chứng. |
| 3 | Sửa phạm vi quyền giấy giới thiệu | Người ngoài khoa/phân công không đọc/duyệt được; kiểm tra chuyển trạng thái và cấp file nếu cần. |
| 4 | Hoàn tất offer/thỏa thuận | Sinh viên nhận/từ chối offer; tạo thỏa thuận; doanh nghiệp/khoa ký duyệt; phân công thành công. |
| 5 | UI scheme, báo cáo giữa kỳ, case, CLO; lưu lịch hẹn | Vận hành được kỳ mới không cần sửa DB bằng tay. |
| 6 | Hoàn thiện AI và nghiệm thu | Dữ liệu/nhãn chuyên gia, đánh giá baseline–embedding–hybrid; E2E 6 vai trò; responsive và cấu hình vận hành. |

Mã nguồn liên quan AI hiện mô tả rõ giới hạn trong [IMPLEMENTATION_STATUS.md](H:/._HK12627/LuanVan/InternLink/ai-service/IMPLEMENTATION_STATUS.md). Tài liệu R2 cũ nói chưa xác minh credentials; lượt này đã xác minh quyền liệt kê bucket, nhưng vẫn chưa xác minh upload qua ứng dụng.

