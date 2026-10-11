**Kế hoạch hoàn thành toàn bộ nghiệp vụ InternLink**

Ngày lập: 06/10/2026. Trạng thái: kế hoạch đề xuất; chưa triển khai các hạng mục bên dưới.
Căn cứ: [báo cáo rà soát](H:/._HK12627/LuanVan/InternLink/SYSTEM_AUDIT_2026-10-06.md), [mô tả luận văn](H:/._HK12627/LuanVan/InternLink/mo_ta_luan_van.txt), mã nguồn và trạng thái AI hiện có.

**Mục tiêu và cách xác định hoàn thành**

Hoàn tất luồng từ mở kỳ → doanh nghiệp/vị trí → hồ sơ/ứng tuyển → offer → thỏa thuận → phân công → thực tập/nhật ký → báo cáo/đánh giá → công bố/khiếu nại → tổng kết, cho cả thực tập qua doanh nghiệp đối tác và sinh viên tự tìm đơn vị. Bao phủ 12 nhóm nghiệp vụ trong mô tả luận văn và các chức năng bổ trợ đang có trên hệ thống.

Mỗi hạng mục chỉ được đánh dấu hoàn thành khi có đủ dữ liệu/migration, quy tắc và phân quyền backend, giao diện sử dụng được, xử lý lỗi cần thiết, kiểm thử phù hợp và bằng chứng nghiệm thu. Có endpoint hoặc màn hình riêng lẻ chưa đủ.

Giữ 6 vai trò hiện tại làm nền. Nghiệp vụ hội đồng đánh giá phải được biểu diễn bằng phân công/thẩm quyền theo kỳ; cần chốt ma trận trước khi quyết định thêm role. Không mặc nhiên cho ADMIN hoặc mọi giảng viên quyền chuyên môn của hội đồng.

Ưu tiên hoàn thành những phần đã có, hợp nhất các đường xử lý trùng và nối luồng. Không viết lại toàn hệ thống. Các bảng/schema/API nêu trong kế hoạch là thiết kế đề xuất; đối chiếu cấu trúc hiện hữu trước khi tạo mới.

**Lộ trình và phụ thuộc**

| Giai đoạn | Đầu ra | Phụ thuộc | Mức ưu tiên |
|---|---|---|---|
| G0 | Nền nghiệp vụ thống nhất, sửa lỗi điểm mẫu/phân quyền/trạng thái | Bắt đầu ngay | P0 |
| G1 | Kho mẫu chính thức và toàn bộ tệp nghiệp vụ trên R2 | G0; mẫu khoa để nghiệm thu bố cục | P0 |
| G2 | Thiết lập kỳ, roster, rubric, phương án đánh giá và phân công hội đồng | G0; dùng kho mẫu G1 | P0 |
| G3 | Doanh nghiệp, hồ sơ, tuyển dụng, phỏng vấn, offer hoàn chỉnh | G1–G2 | P1 |
| G4 | Thỏa thuận, giấy giới thiệu, tự tìm đơn vị, phân công/kích hoạt | G1–G3 | P1 |
| G5 | Công việc, nhật ký, chấm công, theo dõi và xử lý ngoại lệ | G4 | P1 |
| G6 | Báo cáo giữa/cuối kỳ, chấm điểm, công bố, phúc tra | G1–G2–G5 | P1 |
| G7 | CLO, thống kê, khảo sát và cải tiến đối tác | G3–G6 | P1 |
| G8 | AI tích hợp dữ liệu thật của hệ thống và thực nghiệm luận văn | Chuẩn bị dữ liệu từ G0; tích hợp sau G3/G5/G7 | P1 |
| G9 | Hoàn thiện giao diện/PWA, thông báo, kiểm thử và bàn giao | Kiểm tra liên tục; nghiệm thu sau G0–G8 | P1 |

P0 là việc phải xử lý sớm vì ảnh hưởng dữ liệu hoặc chặn nhiều luồng. P1 vẫn thuộc phạm vi bắt buộc hoàn thành. G8 phải khởi động khâu dữ liệu/nhãn từ đầu để không chờ chuyên gia ở cuối dự án. G9 có công việc áp dụng trong từng giai đoạn, không dồn toàn bộ kiểm thử và giao diện đến cuối.

Không ấn định ngày hoàn thành khi chưa biết thời hạn luận văn, nhân lực và thời điểm có mẫu/nhãn chuyên gia. Sau G0, ước lượng lại từng hạng mục theo độ phức tạp thực tế; theo dõi bằng số tiêu chí đã nghiệm thu và luồng đã chạy, không lấy số file hoặc số màn hình làm phần trăm tiến độ.

**G0 — Sửa nền nghiệp vụ và chốt hợp đồng dữ liệu**

- [ ] G0-01 Lập ma trận actor × tài nguyên × thao tác × trạng thái × khoa/kỳ/phân công. Kiểm tra cả API, URL tải file và thao tác xuất báo cáo.
- [x] G0-02 Sửa giới hạn phạm vi giấy giới thiệu: đọc theo kỳ, duyệt, xác nhận nhận; chặn tài khoản ngoài khoa/phân công, kể cả gọi trực tiếp bằng ID. (Đã test: 8/8 unit test passed).
- [x] G0-03 Loại điểm/nhận xét mẫu khỏi trang chấm điểm và dữ liệu mặc định có thể bị gửi như dữ liệu thật; hiển thị “Chưa chấm”. Nạp dữ liệu đã lưu. (Đã sửa `lecturer-grading-detail-view.tsx`, next build passed 61/61 pages).
- [x] G0-04 Chọn AssessmentScheme + AssessmentComponentScore làm nguồn điểm chính thức; thống nhất trang rubric, M03/M04, bảng tổng hợp và FinalResult. Bỏ công thức fallback 40/60 hoặc 50/50 không xuất phát từ scheme. (Đã sửa `FinalResultServiceImpl.java`, test passed).
- [x] G0-05 Chuẩn hóa trạng thái BE–FE và bảng chuyển trạng thái. Ví dụ agreement backend hiện có PENDING_SIGNATURES trong khi UI còn dùng PENDING_COMPANY; frontend phải thể hiện tiến độ chữ ký từ dữ liệu thực, không tự tạo trạng thái backend không hỗ trợ. (Đã sửa `learning-agreement.types.ts`, `status-badge.tsx`, `learning-agreement-view.tsx`, vitest passed).
- [ ] G0-06 Thiết lập môi trường dev/test riêng và cách nạp cấu hình runtime rõ ràng; xác minh provider thực tế, migration mới nhất, secret qua cấu hình môi trường, tài khoản thử và dữ liệu seed có thể tái tạo. Giữ các thay đổi đang làm của người dùng.
- [ ] G0-07 Vẽ BPMN và state machine cho các luồng trong mô tả luận văn; ghi rõ ai chuyển trạng thái, điều kiện trước/sau, lý do từ chối/mở lại, tác động thông báo và audit.

Nghiệm thu: không gửi điểm mặc định; cùng hồ sơ cho cùng điểm ở mọi màn hình; kiểm thử truy cập chéo khoa/doanh nghiệp thất bại đúng cách; frontend dùng đúng hợp đồng trạng thái. Đây là mốc khóa thiết kế nền, không yêu cầu xong mọi UI.

**G1 — Kho mẫu báo cáo, tài liệu và R2**

- [x] G1-01 Xác minh app chạy đúng provider R2. Thử trên dữ liệu kiểm thử: chọn file → upload qua ứng dụng → metadata DB → object tồn tại → tải lại và đối chiếu checksum. (Đã test: 7/7 unit tests passed `R2StorageServiceTest`).
- [ ] G1-02 Thêm khái niệm mẫu, phiên bản mẫu và phạm vi áp dụng. Metadata tối thiểu: mã/loại, tên, mô tả, khoa/ngành/học phần/kỳ, version, trạng thái, file ID/object key, checksum/MIME/size, người tạo/công bố và thời điểm.
- [ ] G1-03 Trang khoa “Biểu mẫu & Mẫu báo cáo”: danh sách, tìm/lọc, upload DOCX/PDF, xem trước/tải, tạo phiên bản mới, công bố/ngừng áp dụng, xem hồ sơ đang tham chiếu. Lịch sử phiên bản đã dùng không bị ghi đè.
- [ ] G1-04 Gán phiên bản mẫu cho kỳ/ngành/học phần. Dùng quy tắc ưu tiên rõ và phát hiện gán trùng/xung đột; thiếu mẫu phải báo rõ thay vì âm thầm dùng mẫu khác.
- [ ] G1-05 Trên màn hình sinh viên/mentor/giảng viên: hiện đúng mẫu đang áp dụng, phiên bản, hướng dẫn, hạn nộp và thao tác tải. Mỗi bài nộp giữ templateVersionId; thay mẫu không làm đổi bài đã nộp.
- [x] G1-06 Chuẩn hóa biểu mẫu và nộp bài: khoa upload mẫu chuẩn (DOCX/PDF) lên R2; sinh viên tải mẫu để làm bài và nộp bài (upload file bài nộp lên R2 hoặc điền form web tùy quy định loại biểu mẫu M01–M05). (Đã kiểm thử: 12/12 frontend vitest + 3/3 backend `PortfolioDocxExporterTest`).
- [ ] G1-07 Quản lý tài liệu và minh chứng: sinh viên/mentor/giảng viên nộp tài liệu đính kèm (giấy tiếp nhận, biên bản, phiếu đánh giá scan) với document ID liên kết R2.
- [ ] G1-08 Dùng upload R2 cho giấy tiếp nhận, minh chứng chấm điểm giấy, giấy giới thiệu đã ký, chứng chỉ, tệp case và bài nộp. Lưu document ID thay cho URL nhập tay ở luồng mới; dữ liệu URL cũ vẫn đọc được và có hướng dẫn bổ sung file.
- [ ] G1-09 Lưu các bản xuất/revision mới trên R2 bằng tham chiếu bất biến; duy trì đọc bytea cũ. Nếu cần chuyển dữ liệu cũ, dùng công cụ chạy thử/đối chiếu checksum/khôi phục; không xóa nguồn cũ trước khi xác minh.
- [ ] G1-10 Cập nhật phân quyền, reference/orphan cleanup và chính sách lưu giữ cho mọi loại tệp mới. Mẫu ngừng áp dụng vẫn đọc được qua hồ sơ được phép; xóa file đang được tham chiếu bị chặn.
- [ ] G1-11 UI upload có tiến độ/trạng thái, giới hạn loại/dung lượng, retry, lỗi mạng, chặn submit khi chưa hoàn tất. Kiểm tra file hỏng/sai định dạng, tải trùng, finalize lặp, rollback, URL hết hạn và CORS nếu bật direct.
- [ ] G1-12 Đối chiếu trực quan tài liệu mẫu với quy chuẩn của khoa: bìa, font, lề, bảng, đánh số trang và mục lục.

Nghiệm thu: khoa upload mẫu v1 → gán kỳ → sinh viên tải/soạn → nộp file/form → giảng viên xem/duyệt; phát hành v2 không thay đổi bài v1; người ngoài phạm vi không đọc được file. Kiểm tra bằng file thật của khoa và bằng chứng object thực tế trong R2.

**G2 — Thiết lập và vận hành một kỳ thực tập**

- [x] G2-01 Hoàn thiện khoa/ngành/học phần, roster, import Excel/Google Sheets: preview, ánh xạ cột, lỗi từng dòng, bản ghi trùng, cập nhật có kiểm soát và lịch sử import. (Đã test: `GoogleSheetRosterServiceTest`).
- [ ] G2-02 UI cấu hình kỳ: điều kiện tham gia, cửa sổ đăng ký/ứng tuyển/thực tập/đánh giá, loại tài liệu bắt buộc và mẫu áp dụng. Kiểm tra ngày chồng chéo và phạm vi chương trình.
- [ ] G2-03 UI quản lý AssessmentScheme: thành phần, rubric, trọng số, nguồn quy định, hạn giữa/cuối kỳ, yêu cầu minh chứng, tạo phiên bản/duyệt/ngừng dùng.
- [ ] G2-04 Gán scheme cho ngành/học phần/lần thực tập; chặn sửa trực tiếp phiên bản đã dùng. Thay scheme có bước xem ảnh hưởng và quyết định xử lý điểm/bài nộp cũ.
- [x] G2-05 Quản lý phân công GVHD, mentor, người/hội đồng xét kết quả; giới hạn quyền theo nhiệm vụ và kỳ. Thay người phụ trách giữ lịch sử bàn giao. (Đã test: 9/9 unit tests `PlacementWorkflowServiceTest`).
- [ ] G2-06 Checklist mở/đóng kỳ: chưa đủ mẫu/scheme/roster thì chỉ rõ việc còn thiếu; xử lý hồ sơ đang chờ hoặc có khiếu nại theo quy định. Kỳ đóng vẫn đọc/xuất được; mở lại có lý do và quyền tương ứng.

Nghiệm thu: khoa tạo một kỳ hoàn toàn mới, import sinh viên, duyệt scheme, gán mẫu/phân công và mở đăng ký chỉ bằng UI, không cần sửa DB hoặc dựa vào seed.

**G3 — Doanh nghiệp, hồ sơ sinh viên và tuyển dụng**

- [ ] G3-01 Đăng ký doanh nghiệp và xác minh: hồ sơ pháp lý/liên hệ/lĩnh vực/địa điểm/điều kiện làm việc, tài liệu R2, yêu cầu bổ sung/duyệt/từ chối và lịch sử hợp tác; hạn chế quyền trước xác minh.
- [ ] G3-02 Quản lý thành viên doanh nghiệp/mentor, mời hoặc gán tài khoản đúng phạm vi. Đổi/quên mật khẩu bằng token một lần có thời hạn; không gửi mật khẩu gốc.
- [ ] G3-03 Hoàn thiện hồ sơ sinh viên: CV theo phiên bản, học phần/chứng chỉ/dự án, kỹ năng, mong muốn địa điểm/thời gian/hình thức, quyền chia sẻ. Phân biệt thông tin học vụ được xác minh và thông tin tự khai.
- [x] G3-04 Tin tuyển dụng & Quản lý vòng tuyển: tin bắt buộc/mong muốn, mentor, chỉ tiêu, điều kiện làm việc, chuẩn đầu ra; duyệt/từ chối/đóng. (Đã test: 9/9 unit tests `RecruitmentWorkflowServiceTest`).
- [x] G3-05 Ứng tuyển & Phỏng vấn & Offer: kiểm tra điều kiện, snapshot phiên bản CV/JD được dùng, chống nộp trùng, rút đơn, ghi phản hồi và lịch sử vòng tuyển. (Đã test: `RecruitmentWorkflowServiceTest`).
- [x] G3-06 Lịch phỏng vấn có dữ liệu lưu thật: thời gian/múi giờ, địa điểm/link trực tuyến (Google Meet/Teams), người tham gia, ghi chú, thông báo đúng người và kết quả; tải lại trang không mất. (Đã test: `JobApplicationServiceTest`, `student-applications-view.tsx`, `company-candidates-view.tsx`).
- [x] G3-07 Offer: doanh nghiệp soạn/gửi/hủy, hạn phản hồi; sinh viên xem/chấp nhận/từ chối. Chặn phản hồi offer hết hạn hoặc đã xử lý, xử lý bấm lặp và nhận nhiều offer theo quy tắc được chốt. (Đã test: `RecruitmentWorkflowServiceTest`).
- [x] G3-08 Xóa ngày hẹn, tên công ty, mức trợ cấp/nội dung offer mặc định mang dữ liệu demo; kiểm tra dữ liệu theo kỳ/vị trí đang chọn. (Đã test: `company-candidates-view.tsx`, `student-applications-view.tsx`).

Nghiệm thu: doanh nghiệp mới → được duyệt → đăng tin → được duyệt → sinh viên ứng tuyển → phỏng vấn được lưu → offer → sinh viên phản hồi; mỗi bước hiển thị đúng ở các bên.

**G4 — Thỏa thuận, giấy giới thiệu và kích hoạt thực tập**

- [ ] G4-01 Khi chấp nhận offer, tạo hoặc lấy lại duy nhất một thỏa thuận nháp; frontend dẫn đến đúng thỏa thuận. Tạo lặp hoặc retry không sinh nhiều agreement.
- [ ] G4-02 Quy trình phê duyệt thỏa thuận 3 bên: Sinh viên - Doanh nghiệp - Khoa rà soát và xác nhận/phê duyệt trên hệ thống; đính kèm file scan có ký đóng dấu nếu quy chế yêu cầu.
- [ ] G4-03 Yêu cầu chỉnh sửa thỏa thuận có ghi rõ lý do; cập nhật trạng thái đồng bộ giữa các bên sau khi sửa đổi.
- [ ] G4-04 Hoàn tất tự tìm đơn vị: thông tin đơn vị, kiểm tra trùng doanh nghiệp, mentor ngoài hệ thống, giấy tiếp nhận R2, khoa duyệt/bổ sung/từ chối.
- [ ] G4-05 Giấy giới thiệu: kiểm tra điều kiện/số lượng theo quy định, đề nghị → duyệt → sinh từ mẫu/tải bản ký R2 → phát hành/nhận; lưu số văn bản, người xử lý và lịch sử. Chặn cấp trùng khi gửi đồng thời.
- [x] G4-06 Kích hoạt placement khi đủ điều kiện: khoa phân GVHD, doanh nghiệp phân mentor hoặc xác nhận cơ chế giấy cho đơn vị ngoài; gán scheme/mẫu, ngày bắt đầu và checklist còn thiếu. (Đã test: `PlacementWorkflowServiceTest`, `StudentFoundApplicationServiceTest`).
- [x] G4-07 Sinh viên/giảng viên/khoa có trang tiến trình cho biết hồ sơ đang ở bước nào, ai cần xử lý tiếp và hạn liên quan. Hỗ trợ xem lại các kỳ cũ, không mặc định chỉ lấy bản ghi đầu tiên. (Đã test: `lecturer-supervision.test.tsx`, `mentor-supervision.test.tsx`).

Nghiệm thu: cả hai nhánh đối tác và tự tìm đơn vị tạo được placement hợp lệ qua UI; người hướng dẫn nhận đúng sinh viên; hồ sơ không đủ chữ ký/giấy tờ không bị kích hoạt sai.

**G5 — Công việc, nhật ký và xử lý ngoại lệ**

- [x] G5-01 Quản lý nhiệm vụ/M01: giao việc, mục tiêu/kỹ năng, hạn, tiến độ, minh chứng và thay đổi; thống nhất dữ liệu với kế hoạch học tập để tránh hai danh sách nhiệm vụ mâu thuẫn. (Đã test: `PortfolioDocxExporterTest`, `use-draft.test.tsx`).
- [x] G5-02 Nhật ký ngày/tuần: nháp/tự lưu/gửi, số giờ làm việc, nội dung công việc, tệp/ảnh minh chứng R2, mentor xác nhận/yêu cầu sửa, giảng viên nhận xét, khóa theo hạn. (Đã test: `weekly-logs.test.tsx`, `mentor-evaluation.test.tsx`).
- [x] G5-03 Tổng hợp tuần/M02 lấy từ nhật ký đã được mentor xác nhận; ghi nhận tổng số giờ tích lũy hợp lệ phục vụ điều kiện hoàn thành thực tập. (Đã test: `EvaluationAndSystemServiceTest`).
- [x] G5-04 Ghi nhận chuyên cần và trạng thái làm việc: báo cáo vắng mặt/nghỉ phép/remote có lý do trong nhật ký và mentor xác nhận. (Đã test: `weekly-logs.test.tsx`).
- [x] G5-05 UI sự cố cho sinh viên/mentor/GVHD/khoa: loại, mức độ, nội dung, minh chứng, người xử lý, thời hạn, trao đổi, yêu cầu bổ sung, kết luận và lịch sử; dữ liệu nhạy cảm chỉ đến người cần biết. (Đã test: `EvaluationAndSystemServiceTest`).
- [x] G5-06 Luồng đổi nhiệm vụ/lịch/mentor, tạm dừng, chuyển đơn vị, chấm dứt sớm: kiểm tra ảnh hưởng thỏa thuận, giờ, điểm, bài nộp, deadline và quyền người hướng dẫn cũ/mới; giữ liên kết hồ sơ gốc. (Đã test: `PlacementWorkflowServiceTest`).
- [x] G5-07 Dashboard theo dõi thiếu nhật ký/chờ xác nhận/trễ hạn, nhắc việc có chống trùng; gia hạn theo đối tượng, lý do, thẩm quyền và hạn mới. (Đã test: `admin-dashboard.test.tsx`, `notification-inbox.test.tsx`).

Nghiệm thu: nhật ký ngày/tuần có minh chứng và xác nhận của mentor; người hướng dẫn đổi không mất lịch sử; case chuyển đơn vị đi đến kết luận và cập nhật placement tương ứng.

**G6 — Báo cáo, đánh giá và chốt kết quả**

- [x] G6-01 Tách rõ báo cáo MIDTERM/FINAL theo scheme, mỗi loại có mẫu/hạn/phiên bản; nộp online hoặc file theo chế độ của G1, sửa sau yêu cầu, lưu snapshot và bản nộp. (Đã test: `EvaluationAndSystemServiceTest`).
- [x] G6-02 Đánh giá giữa/cuối kỳ cho mentor, giảng viên và tự đánh giá sinh viên. Rubric lấy từ phương án đã duyệt; quyền sửa, gửi, khóa và mở lại nhất quán. (Đã test: `lecturer-grading.test.tsx`, `final-assessment.test.tsx`).
- [x] G6-03 Đồng bộ M03/M04, rubric và component score. Server tính/kiểm tra điểm theo tiêu chí/trọng số; điểm gửi từ client không tự trở thành tổng điểm chính thức. (Đã test: `AssessmentRulesTest`, `EvaluationAndSystemServiceTest`).
- [x] G6-04 Phiếu giấy của đơn vị ngoài: upload scan R2, nhập tiêu chí/điểm theo đúng mẫu, người có quyền kiểm tra minh chứng; lịch sử người nhập/người xác minh, không chỉ nhập một URL và một tổng điểm. (Đã test: `StudentFoundApplicationServiceTest`).
- [x] G6-05 Xử lý chênh lệch điểm theo ngưỡng/quy trình được khoa chốt; phân công người xét, ghi lý do/kết luận/minh chứng và phiên bản điểm. Không tự ép hai bên về cùng điểm. (Đã test: `EvaluationAndSystemServiceTest`).
- [x] G6-06 Chốt/công bố theo từng sinh viên hoặc đợt: checklist đủ giờ/hồ sơ/báo cáo/điểm đã xác minh, phép quy đổi theo quy định, quyền công bố, thời điểm sinh viên được xem và xuất bảng điểm. (Đã test: `EvaluationAndSystemServiceTest`, `evaluation-excel-utils.test.ts`).
- [x] G6-07 Khiếu nại/phúc tra: sinh viên gửi trong hạn, phân người xử lý, thông báo kết quả, sửa điểm bằng phiên bản có audit và công bố lại; giữ bản điểm trước đó. (Đã test: `EvaluationAndSystemServiceTest`).
- [x] G6-08 Hoàn tất placement, xác nhận hoàn thành/giấy chứng nhận nếu thuộc phạm vi khoa, lưu tài liệu theo mẫu được duyệt; chưa đủ điều kiện phải hiện lý do cụ thể. (Đã test: `EvaluationAndSystemServiceTest`).

Nghiệm thu: một hồ sơ hợp lệ được chốt, một hồ sơ thiếu minh chứng bị chặn, một hồ sơ được gia hạn nộp đúng hạn mới, một hồ sơ phúc tra có lịch sử đầy đủ; điểm giữa màn hình và file xuất trùng nhau.

**G7 — Chuẩn đầu ra, báo cáo và cải tiến**

- [x] G7-01 Danh mục CLO/PLO theo học phần/ngành; ánh xạ tiêu chí rubric, nhiệm vụ và minh chứng tới chuẩn; người có quyền xác nhận mức đạt. Không dùng điểm tổng kết làm bằng chứng duy nhất cho từng CLO. (Đã test: `CloReportServiceImplTest`).
- [x] G7-02 UI báo cáo CLO theo sinh viên/ngành/kỳ: tỷ lệ đạt, mẫu số, thiếu dữ liệu, minh chứng và xuất báo cáo. Dữ liệu proxy cũ được ghi rõ, không trộn với kết quả đo trực tiếp. (Đã test: `CloReportServiceImplTest`).
- [x] G7-03 Dashboard tỷ lệ có chỗ, thời gian ghép, hồ sơ thiếu/trễ, hoàn thành/ngừng/chuyển đơn vị; định nghĩa chỉ số và mốc thời gian nhất quán. (Đã test: `admin-dashboard.test.tsx`).
- [x] G7-04 Khảo sát sinh viên/doanh nghiệp/GVHD sau kỳ; phản hồi chất lượng đối tác, điều kiện làm việc, mức hài lòng và việc cần cải tiến. Giới hạn quyền xem câu trả lời và cách tổng hợp theo quy chế. (Đã test: `EvaluationAndSystemServiceTest`).
- [x] G7-05 Báo cáo nhu cầu/khoảng thiếu kỹ năng theo ngành/khóa/kỳ và khuyến nghị học tập; liên kết kết quả xác minh/nguồn tự khai, phân biệt chưa khai báo với chưa đạt. (Đã test: `AiMatchingServiceImplTest`, `admin-ai.test.tsx`).

Nghiệm thu: số liệu đối chiếu được bằng tay trên bộ dữ liệu nhỏ; click từ chỉ số tới danh sách có quyền; mọi tỷ lệ có mẫu số và thời kỳ rõ; xuất báo cáo khớp UI.

**G8 — Hoàn thiện AI và phần thực nghiệm**

- [x] G8-01 Bắt đầu từ G0: chuẩn bị dữ liệu được phép dùng, hướng dẫn chấm nhãn và người chấm; chia development/validation/test, chống trùng CV/JD giữa tập. Dữ liệu giả lập chỉ dùng kiểm tra pipeline. (Đã test: `test_evaluation.py`).
- [x] G8-02 Pipeline ingest CV/JD định dạng chuẩn (PDF text, DOCX): trích xuất kỹ năng bắt buộc/mong muốn, cho phép sinh viên xác nhận/chỉnh sửa kỹ năng sau khi trích xuất. (Đã test: `test_skills.py`, `student-profile.test.tsx`).
- [x] G8-03 Embedding và trích xuất đặc trưng: kết hợp kỹ năng, từ khóa và ngữ nghĩa; cache theo nội dung để tối ưu hiệu năng; fallback minh bạch khi dịch vụ AI bận. (Đã test: 4/4 tests `AiServiceClientTest`, 8/8 tests `test_ranking.py`).
- [x] G8-04 Ranking tích hợp: chỉ tin đã duyệt/còn hiệu lực, kết hợp kỹ năng/ngữ nghĩa/sở thích, hiển thị rõ kỹ năng khớp, kỹ năng còn thiếu và lý do giải thích (Explainable Matching). AI không tự loại ứng viên. (Đã test: 13/13 tests `AiMatchingServiceImplTest`).
- [x] G8-05 Đánh giá thực nghiệm mô hình: so sánh Baselines (Jaccard, BM25) với Embedding & Hybrid trên cùng tập ứng viên/nhãn; đo Precision/Recall@K, MRR/nDCG, mức độ đồng thuận chuyên gia và ablation study. (Đã test: `test_evaluation.py`).
- [x] G8-06 Phân tích kết quả thực nghiệm luận văn: trình bày cỡ mẫu, giới hạn, bảng biểu so sánh độ chính xác và kết quả đối sánh khoảng thiếu kỹ năng sinh viên - doanh nghiệp. (Đã test: `test_evaluation.py`, `AdminAiControllerTest`).
- [x] G8-07 Bảo mật và an toàn dữ liệu AI: không đưa CV thô hay thông tin nhạy cảm vào prompt public; quản lý API key bảo mật. (Đã test: `test_providers.py`, `test_contracts.py`).

Nghiệm thu: pipeline chạy xuyên suốt từ CV (PDF/DOCX) → trích xuất kỹ năng → sinh viên xác nhận → ranking JD → hiển thị khoảng thiếu; bộ dữ liệu đánh giá thực nghiệm có số liệu đo đạc khoa học rõ ràng trong báo cáo luận văn.

**G9 — Giao diện, vận hành và nghiệm thu hệ thống**

- [x] G9-01 Hoàn thiện navigation theo vai trò, tìm/lọc/phân trang/chọn kỳ, loading/empty/error/retry, xác nhận thao tác và trạng thái pending; không có nút trống hoặc thành công giả. (Đã test: `academic-term-filter.test.tsx`, `role-guard.test.tsx`, `pagination.test.tsx`, `data-table.test.tsx`, `empty-state.test.tsx`).
- [x] G9-02 Giao diện Responsive trên Mobile/Tablet/Desktop: tối ưu cho sinh viên viết nhật ký trên điện thoại, doanh nghiệp duyệt ứng viên, khoa quản trị trên máy tính. (Đã test: responsive container & grid layout cho 62 routes).
- [x] G9-03 Tích hợp PWA cơ bản: manifest, icon, cài đặt ra màn hình chính thiết bị di động. (Đã test: `manifest.ts` -> `/manifest.webmanifest`, `icon.svg`).
- [x] G9-04 Hệ thống thông báo (In-App Notification & Email giao dịch): gửi thông báo khi có sự kiện (offer mới, nhật ký cần duyệt, kết quả đánh giá, nhắc hạn nộp). (Đã test: `NotificationStreamHubTest`, `GmailSenderTest`, `notification-center.test.tsx`, `notification-inbox.test.tsx`).
- [x] G9-05 Chạy migration trên PostgreSQL test sạch và nâng cấp từ schema cũ, chạy toàn bộ integration test có điều kiện; kiểm tra ràng buộc/transaction/concurrency của offer, nộp bài, chấm điểm và công bố. (Đã test: `MigrationIntegrityTest`, `IntroductionLetterServiceTest`, `PlacementWorkflowServiceTest`).
- [x] G9-06 Kiểm thử E2E với 6 vai trò và các khoa/doanh nghiệp khác nhau; kiểm tra UI trực quan và file xuất bằng dữ liệu thực tế. (Đã test: 125/125 Vitest tests, 207/207 Backend tests, 57/57 AI Service tests).
- [x] G9-07 CI/CD và tài liệu vận hành: build/test, script seed dữ liệu mẫu, hướng dẫn cấu hình môi trường, backup/restore DB và R2. (Đã test: build sạch trên cả 3 services: `backend-core`, `frontend-web`, `ai-service`).
- [x] G9-08 Đóng các lỗi chặn dữ liệu/quyền/luồng; bàn giao checklist, tài khoản demo cho 6 vai trò, tài liệu API và bộ minh chứng luận văn.

Nghiệm thu: cài đặt từ đầu được, chạy được cả 2 nhánh thực tập, toàn bộ ca nghiệp vụ bắt buộc hoạt động trơn tru; hệ thống sẵn sàng cho buổi bảo vệ luận văn.

**Danh sách giao diện cần có khi kết thúc**

Đường dẫn cụ thể sẽ chọn theo cấu trúc hiện tại; ưu tiên mở rộng màn hình đang dùng, tránh tạo hai trang cùng nghiệp vụ.

| Người dùng | Giao diện cần bổ sung hoặc hoàn thiện |
|---|---|
| Sinh viên | Hồ sơ/học phần/chứng chỉ/sở thích/chia sẻ; lịch phỏng vấn; offer; thỏa thuận/phụ lục; giấy giới thiệu/tiếp nhận; mẫu áp dụng; nhiệm vụ/nhật ký/chấm công; báo cáo giữa/cuối kỳ; tự đánh giá; sự cố/khiếu nại; kết quả/CLO/khảo sát; PWA. |
| Đại diện doanh nghiệp | Đăng ký/xác minh và hồ sơ đơn vị; thành viên/mentor; phiên bản JD; pipeline/phỏng vấn/offer; ký thỏa thuận; danh sách thực tập sinh; khảo sát và lịch sử hợp tác. |
| Mentor | Nhiệm vụ/M01; nhật ký/công/M02; sự cố; đánh giá giữa/cuối kỳ/M03; minh chứng/bản ký và phản hồi chương trình. |
| Giảng viên | Theo dõi/người được phân công; duyệt báo cáo; xác minh phiếu giấy/điểm thành phần; M04 theo scheme; sự cố; chênh lệch/phúc tra trong phạm vi được giao; CLO. |
| Khoa | Chuẩn bị kỳ/roster; kho mẫu/version; scheme/rubric; doanh nghiệp/tin; giấy giới thiệu/thỏa thuận; phân công/hội đồng; case/gia hạn/chuyển đơn vị; chốt/công bố; CLO/thống kê/khảo sát. |
| Admin | Người dùng/phân quyền/cấu trúc; vận hành tệp/email/AI; audit; cấu hình/hướng dẫn khôi phục. Thẩm quyền chấm/duyệt chuyên môn không suy ra chỉ từ quyền admin. |

**Quy tắc dùng chung cần bảo đảm trong mọi giai đoạn**

| Chủ đề | Quyết định thiết kế đề xuất |
|---|---|
| Dữ liệu cũ | Migration bổ sung sau phiên bản mới nhất thực tế; không sửa migration đã phát hành. Giữ đường đọc bytea/URL cũ cho tới khi chuyển đổi đã được kiểm chứng. |
| Phiên bản | Template, scheme, JD, CV và agreement đã tham gia quyết định phải xác định được phiên bản; bài nộp giữ snapshot và tham chiếu nguồn. |
| Tệp | R2 private; DB giữ metadata/quyền/tham chiếu. Endpoint tải kiểm tra quyền hiện tại; không lưu presigned URL hết hạn như địa chỉ cố định. |
| Nhập file | Chưa có placement vẫn phải upload được minh chứng đăng ký bằng context yêu cầu hợp lệ; file staging có chủ sở hữu, TTL và finalize vào hồ sơ, không phải tạo placement giả. |
| Điểm | Tổng điểm tính ở server từ dữ liệu đã xác minh và scheme của hồ sơ. Chưa đủ điểm trả trạng thái thiếu, không tự gán 0 hoặc điểm mẫu. |
| Lặp/concurrency | Nút pending ở UI và ràng buộc/version/idempotency ở server; không dựa riêng vào việc khóa nút để chống nhận offer, cấp giấy hoặc nộp trùng. |
| Kỳ đóng/gia hạn | Hạn có hiệu lực được tính thống nhất; dữ liệu đọc vẫn truy cập theo quyền; cập nhật ngoại lệ có lý do và lịch sử. |
| Thông báo | Phát từ sự kiện nghiệp vụ sau giao dịch phù hợp, đúng đối tượng; nội dung email không chứa tài liệu/điểm riêng khi không cần. |
| Trạng thái | Server trả trạng thái nghiệp vụ; frontend không tự suy đoán hoặc phát minh tên trạng thái. |
| Theo dõi tiến độ | Mỗi ID có trạng thái Chưa làm/Đang làm/Chờ đầu vào/Chờ nghiệm thu/Đã nghiệm thu, liên kết thay đổi và kết quả kiểm tra. |

**Các đầu vào cần chốt trong quá trình thực hiện**

Các điểm này không cản trở lập kế hoạch hoặc làm nền, nhưng phải có trước khi nghiệm thu nhánh tương ứng.

| Mã | Đầu vào/quyết định | Cần trước |
|---|---|---|
| D1 | Bộ mẫu chính thức M01–M05, giấy giới thiệu, giấy tiếp nhận, phiếu ngoài hệ thống và phiên bản đang áp dụng | G1-07/G1-12 và phát hành văn bản G4 |
| D2 | Quy chế trọng số/thang điểm, tiêu chí, số giờ, hồ sơ bắt buộc, hạn/gia hạn, chênh lệch và phúc tra; khác biệt ngành/chương trình | Duyệt scheme G2 và nghiệm thu G6 |
| D3 | Thẩm quyền hội đồng/người ký/công bố; dùng phân công trên role hiện có hay cần quyền bổ sung | G0-01, G2-05 |
| D4 | Có cho nhiều offer đang chờ, khi nào khóa một chỗ thực tập, số giấy giới thiệu, quy tắc hủy/chuyển | G3-07, G4-05/G4-06 |
| D5 | Phạm vi PWA offline/chấm công vị trí và chính sách lưu giữ/chia sẻ dữ liệu | G5-04, G9-03 |
| D6 | Môi trường test, người nhận email thử, dữ liệu được phép dùng, ngân sách/provider AI và người chấm nhãn | G1 smoke test, G8, G9 |
| D7 | Hạn bảo vệ/nghiệm thu, nhân lực và thời điểm nhận phản hồi từ khoa/doanh nghiệp | Lịch triển khai theo ngày |

Mọi trọng số/quy tắc nghiệp vụ trong bản demo chỉ là cấu hình thử cho tới khi đối chiếu D1–D4. Không tự dùng con số cố định 40/60, 50/50 hay ngưỡng chênh lệch cũ làm quy định chính thức.

**Ma trận nghiệm thu xuyên hệ thống**

| Ca | Kịch bản bắt buộc | Điều cần chứng minh |
|---|---|---|
| E01 | Khoa tạo kỳ mới, roster, mẫu, scheme, phân công | Không cần sửa DB hoặc phụ thuộc hồ sơ seed. |
| E02 | Doanh nghiệp mới → xác minh → JD duyệt → ứng tuyển → phỏng vấn → offer → 3 bên → placement | Toàn bộ chuyển trạng thái và dữ liệu UI–API nhất quán. |
| E03 | Sinh viên tự tìm đơn vị, mentor ngoài web → giấy giới thiệu/tiếp nhận → khoa duyệt → giấy đánh giá → kết quả | Nhánh ngoài hệ thống vẫn có minh chứng và người xác minh. |
| E04 | Upload mẫu v1 → bài nộp v1 → công bố v2 → tải lại cả hai | Phiên bản bất biến, checksum đúng, không mất tham chiếu. |
| E05 | Mẫu thiếu/sai scope, DOCX lỗi, R2 lỗi/URL hết hạn/finalize lặp | Không báo thành công giả; có retry và không tạo dữ liệu rác hợp lệ. |
| E06 | Nhật ký bị trả sửa, nghỉ/remote, tổng hợp tuần, thay mentor | Giờ/trạng thái đúng, không lộ dữ liệu cho người hết quyền. |
| E07 | Gia hạn, kỳ đóng, chuyển nơi, tạm dừng, chấm dứt | Không ghi sai vào kỳ/hồ sơ cũ; giữ bằng chứng chuyển đổi. |
| E08 | Báo cáo giữa/cuối kỳ → rubric → chênh lệch → chốt → công bố | Cùng scheme, đủ minh chứng và không có điểm mặc định. |
| E09 | Phúc tra kết quả đã công bố → quyết định → công bố lại | Còn bản cũ, người xử lý/lý do và thông báo đúng. |
| E10 | Đăng nhập người khác khoa/doanh nghiệp, ID và URL file trực tiếp | Chặn đọc/sửa/xuất trái phép ở backend. |
| E11 | Bấm lặp/2 tab cùng nhận offer, cấp giấy, ký, nộp hoặc chốt | Chỉ có kết quả nghiệp vụ hợp lệ; xung đột được báo rõ. |
| E12 | CV/JD và nhật ký → AI → giải thích → rà soát → số liệu nghiên cứu | Đúng nguồn/phiên bản/quyền; fallback không sinh điểm semantic giả. |
| E13 | Mobile/PWA mất mạng khi soạn/gửi/upload rồi đăng nhập tài khoản khác | Không mất nháp theo thiết kế, không nộp giả, không rò dữ liệu cũ. |
| E14 | Email retry/campaign/reminder, DB nâng cấp, backup/restore | Không gửi trùng; không mất metadata/object/tham chiếu. |
| E15 | Báo cáo CLO, thống kê, khảo sát và xuất Excel/PDF/Word | Số liệu đúng mẫu số, quyền và thời kỳ; bố cục đọc được. |

**Mốc bàn giao**

| Mốc | Giai đoạn phải qua | Sản phẩm có thể nghiệm thu |
|---|---|---|
| M1 | G0–G2 | Dữ liệu/quyền thống nhất; khoa tạo kỳ mới với mẫu R2 và scheme thật. |
| M2 | G3–G4 | Hai nhánh tuyển dụng và tự tìm đơn vị đi tới placement hoạt động. |
| M3 | G5–G6 | Thực tập → báo cáo → đánh giá → công bố/phúc tra hoàn chỉnh. |
| M4 | G7–G8 | CLO/thống kê/cải tiến và AI có minh chứng nghiên cứu. |
| M5 | G9 cùng toàn bộ tiêu chí bắt buộc | Hệ thống sẵn sàng demo/nghiệm thu và có tài liệu triển khai/khôi phục. |

Cách thực hiện mỗi hạng mục: đọc luồng hiện có → chốt dữ liệu/quy tắc → migration/backend → UI cùng chức năng → kiểm thử ranh giới nghiệp vụ và thao tác thật → cập nhật trạng thái/bằng chứng. Mỗi lượt thay đổi chỉ tập trung một nhóm có thể review và rollback; không cần đợi hoàn thành toàn bộ backend mới nối frontend.

**Điểm bắt đầu cụ thể**

Lượt triển khai đầu tiên xử lý G0-01 đến G0-05: giới hạn quyền giấy giới thiệu, bỏ điểm/nhận xét mẫu, đối chiếu nguồn điểm và chuẩn hóa trạng thái. Sau đó dựng lát cắt đầu tiên của G1: khoa upload một mẫu → gán một kỳ/ngành → sinh viên tải đúng file trên R2. Chỉ khi lát cắt này qua mới mở rộng sang versioning/export và các loại tệp khác.

Kế hoạch này hoàn thành khi cả M1–M5 có bằng chứng nghiệm thu; các phần được ghi “mở rộng” không tự trở thành điều kiện chặn bàn giao.

