# InternLink — nghiên cứu thị trường và kế hoạch nghiệp vụ toàn trình thực tập

> Cập nhật: 26/09/2026. Phạm vi: Trường Công nghệ Thông tin và Truyền thông, Đại học Cần Thơ (CTU). Tài liệu này đối chiếu `mo_ta_luan_van.txt`, `PROJECT_BASELINE_ONE_MONTH.md`, mô hình 26 bảng, luồng use case và mã nguồn hiện có. Các quy tắc riêng của CTU cần được xác nhận bằng quy chế, biểu mẫu và người có thẩm quyền trước khi dùng cho vận hành thật.

## 1. Kết luận định hướng

**Đơn vị triển khai trước mắt là khoa/trường thuộc CTU; người dùng là sinh viên, đại diện doanh nghiệp, mentor, giảng viên hướng dẫn, cán bộ quản lý thực tập và quản trị viên.** InternLink nên được đánh giá như một hệ thống quản lý học phần thực tập có đối sánh năng lực, không chỉ như nơi đăng tin tuyển dụng. Một lần thực tập phải truy vết được từ vị trí được duyệt, hồ sơ ứng tuyển, offer, thỏa thuận, nhiệm vụ và nhật ký đến minh chứng, đánh giá và kết quả cuối.

**Ranh giới “toàn trình” của MVP:** luồng tuyển chọn và theo dõi đầy đủ chỉ áp dụng cho doanh nghiệp tham gia cổng InternLink. Nếu CTU cho phép sinh viên tự tìm nơi thực tập, hệ thống cần một luồng quản lý học thuật giữa sinh viên và GVHD: đăng ký nơi thực tập, xác minh hồ sơ, nộp tiến độ định kỳ và báo cáo, phản hồi, đánh giá. Doanh nghiệp ngoài cổng không phải tạo tài khoản, đăng vị trí, phát offer, giao task hay xác nhận nhật ký trực tuyến.

Mô tả luận văn còn nêu **hội đồng đánh giá**, trong khi baseline một tháng chỉ có sáu vai trò. Với MVP, hội đồng có thể là nhóm người được khoa phân công xử lý một hồ sơ đánh giá/phúc khảo, có dấu vết người tham gia và quyết định; không tự cấp cho quản trị viên kỹ thuật quyền chấm điểm. Nếu quy chế CTU yêu cầu hội đồng hoạt động thường xuyên với quyền riêng, cần bổ sung vai trò/ủy quyền trước khi dùng thật.

Giá trị có thể kiểm chứng trong luận văn:

1. **Giảm đứt gãy quy trình:** các bên nhìn cùng một trạng thái và biết việc tiếp theo thuộc về ai.
2. **Bảo đảm chất lượng cơ hội:** doanh nghiệp và vị trí được khoa rà soát trước khi sinh viên ứng tuyển.
3. **Đối sánh có giải thích:** sinh viên thấy kỹ năng khớp, kỹ năng thiếu và ràng buộc chưa đáp ứng; sinh viên tự quyết định nộp hồ sơ.
4. **Đánh giá dựa trên minh chứng:** mục tiêu học tập, công việc thực tế, phản hồi và rubric dùng cùng bộ năng lực/chuẩn đầu ra.
5. **Dữ liệu để cải tiến:** đo mức có chỗ, thời gian ghép, hồ sơ thiếu, chậm nhật ký, chênh lệch đánh giá và kỹ năng thiếu theo ngành/kỳ.

Không có căn cứ công khai để ước lượng TAM/SAM, thị phần hoặc mức sẵn sàng trả tiền của CTU. Phần “nghiên cứu thị trường” dưới đây là **benchmark sản phẩm và nhu cầu nghiệp vụ**, không phải dự báo doanh thu. Trước khi mở rộng ngoài luận văn, cần phỏng vấn người quản lý thực tập, doanh nghiệp và sinh viên, đồng thời khảo sát quy mô kỳ thực tập và hệ thống đang dùng.

## 2. Bằng chứng thị trường và khoảng trống cho InternLink

| Nguồn tham chiếu | Khả năng/nhu cầu đã được công bố | Hàm ý cho InternLink |
|---|---|---|
| [WEF, Future of Jobs 2025](https://www.weforum.org/publications/the-future-of-jobs-report-2025/digest/) | 63% doanh nghiệp khảo sát xem khoảng cách kỹ năng là rào cản lớn cho chuyển đổi giai đoạn 2025–2030. Đây là bối cảnh toàn cầu, không phải số liệu của CTU. | Đo kỹ năng cụ thể và khoảng thiếu, không chỉ lưu CV và điểm phù hợp tổng. |
| [Handshake: tìm việc và thực tập](https://support.joinhandshake.com/hc/en-us/articles/218693408-Searching-for-Jobs-and-Internships), [phê duyệt nhà tuyển dụng](https://support.joinhandshake.com/hc/en-us/articles/1500006016422-How-do-employers-get-approved-at-my-school) | Tìm việc/thực tập theo hồ sơ và trường; đơn vị đào tạo kiểm soát phê duyệt nhà tuyển dụng theo chính sách của mình. | Tìm kiếm, hồ sơ, ứng tuyển và kiểm duyệt là năng lực nền; không phải lợi thế khác biệt riêng. |
| [12twenty Experiential Learning](https://12twenty.com/experiential-learning) | Cấu hình phê duyệt, biểu mẫu theo đơn vị và lưu lịch sử quyết định. | Luồng duyệt phải có người chịu trách nhiệm, hạn, lý do và lịch sử; thông tin bắt buộc có thể khác giữa chương trình. |
| [Symplicity CSM/SIM](https://www.symplicity.com/uk/csm), [ví dụ Central New Mexico Community College](https://www.symplicity.com/success-stories/central-new-mexico-community-college-csm-el) | Quản lý thỏa thuận, theo dõi thực tập, đánh giá giữa/cuối kỳ và báo cáo trong cùng nền tảng. | “Toàn trình” đòi hỏi dữ liệu liên tục qua các giai đoạn, không thể dừng ở offer accepted. |
| [Đại học Sài Gòn: cổng thực tập](https://hoptacdoanhnghiep.sgu.edu.vn/tin-tuc/97), [IUH: thông báo thực tập trên E-work](https://fba.iuh.edu.vn/thong-bao/thong-bao-to-chuc-va-thuc-hien-thuc-tap-doanh-nghiep-dot-hoc-ky-2-nam-hoc-2025-2026/) | Có ví dụ tại Việt Nam về đăng ký/nguyện vọng trực tuyến và quản lý theo quy trình của trường. Các trang công khai không đủ để kết luận toàn bộ tính năng nội bộ. | Cần khảo sát hiện trạng CTU và tích hợp theo quy chế địa phương; không tuyên bố thị trường Việt Nam chưa có sản phẩm tương tự. |

**Định vị đề xuất:** hệ thống dành cho một chương trình thực tập đại học, gắn **matching kỹ năng → kế hoạch học tập → minh chứng → đánh giá chuẩn đầu ra**. Sự khác biệt này là **giả thuyết sản phẩm cần chứng minh** bằng demo xuyên suốt và đánh giá người dùng; không khẳng định độc quyền tính năng so với các nền tảng trên.

## 3. Cơ sở nghiệp vụ và giới hạn áp dụng

- [Erasmus+ Learning Agreement for Traineeships](https://erasmus-plus.ec.europa.eu/resources-and-tools/mobility-and-learning-agreements/learning-agreements/traineeships-agreement-guidelines-ka171) gợi ý cấu trúc **trước kỳ, thay đổi trong kỳ, xác nhận sau kỳ**, cùng việc giữ bản thỏa thuận gốc khi sửa đổi. Dùng như mẫu thiết kế phiên bản và phê duyệt nhiều bên.
- [ILO Recommendation No. 208](https://www.ilo.org/resource/other/r208-quality-apprenticeships-recommendation-2023) nhấn mạnh văn bản thỏa thuận, điều kiện làm việc, an toàn, giám sát, khiếu nại và bảo vệ dữ liệu. Đây là khuyến nghị về apprenticeship, **không tự động là quy định pháp lý cho thực tập đại học Việt Nam**.
- [QAA Work-based Learning](https://www.qaa.ac.uk/the-quality-code/2018/advice-and-guidance-18/work-based-learning) nhấn mạnh trách nhiệm rõ ràng giữa trường, nơi làm việc và sinh viên; [hướng dẫn đối tác 2024](https://www.qaa.ac.uk/the-quality-code/2024/advice-and-guidance-2024/quality-code-advice-and-guidance-principle-8) bổ sung rà soát đối tác và quản lý rủi ro.
- [NACE Career Readiness](https://www.naceweb.org/career-readiness/competencies/career-readiness-defined) cung cấp tám nhóm năng lực nghề nghiệp có thể tham khảo cho rubric. Cần ánh xạ sang **chuẩn đầu ra học phần của CTU**, không chép nguyên thang điểm hoặc đặt trọng số tùy ý.
- [ESCO](https://esco.ec.europa.eu/en/use-esco) cung cấp phân loại kỹ năng và API/dữ liệu tải về. Danh sách ngôn ngữ công bố không có tiếng Việt; InternLink cần từ điển bí danh tiếng Việt và chuẩn hóa thuật ngữ ngành CNTT tại CTU.

**Cần chốt với CTU:** điều kiện sinh viên được thực tập; số giờ/tín chỉ; hạn nộp; mẫu thỏa thuận, nhật ký, phiếu đánh giá; thẩm quyền duyệt; cách tính và làm tròn điểm; điều kiện đạt; thời hạn, cấp xử lý phúc khảo; lưu trữ hồ sơ. Lưu các quy tắc thay đổi theo kỳ/chương trình trong cấu hình có phiên bản, không nhúng cứng trong mã.

## 4. Hợp đồng nghiệp vụ chung

Mỗi lệnh đổi trạng thái phải kiểm tra đồng thời: **vai trò và quan hệ sở hữu**, **kỳ và thời hạn**, **trạng thái nguồn**, **dữ liệu bắt buộc**, **ràng buộc liên bản ghi**, **chống thao tác lặp/cạnh tranh**. Sau khi giao dịch thành công, ghi `state_history`/`audit_logs`; thông báo gửi sau khi trạng thái đã được lưu. Hành động bị từ chối phải trả lý do rõ ràng và không làm thay đổi một phần dữ liệu.

Một **placement đang hiệu lực trên mỗi sinh viên trong một kỳ** là quy tắc MVP nên áp dụng; nếu CTU cho phép nhiều lần thực tập song song thì phải điều chỉnh trước khi khóa mô hình. Khi chuyển nơi, giữ lần cũ và kết quả/giờ đã được xác nhận, tạo lần mới có liên kết với hồ sơ chuyển và quy tắc công nhận giờ rõ ràng. Không xóa lịch sử để “làm sạch” luồng.

### Hai nguồn nơi thực tập: quyết định phạm vi

| Nguồn | Đường đi đúng nghiệp vụ | Mức số hóa có thể cam kết |
|---|---|---|
| **Đối tác tham gia InternLink** | Doanh nghiệp đăng ký → vị trí được duyệt → sinh viên ứng tuyển → doanh nghiệp phát offer → thỏa thuận → mentor/GVHD theo dõi → đánh giá. | Toàn trình trên hệ thống; hai bên trực tiếp thao tác và xác nhận. Đây là đường demo chính của MVP. |
| **Sinh viên tự tìm nơi ngoài cổng** | Sinh viên khai nơi tiếp nhận, người liên hệ, nội dung công việc và tải thư tiếp nhận → GVHD được phân công xác minh hồ sơ và kế hoạch → sinh viên nộp tiến độ/nhật ký từng kỳ cùng minh chứng, báo cáo giữa kỳ và cuối kỳ → GVHD phản hồi hoặc yêu cầu sửa → nộp phiếu đánh giá của người hướng dẫn tại nơi thực tập dưới dạng chứng từ để GVHD kiểm tra → chấm và công bố theo cùng đề cương học phần. | Sinh viên và GVHD thao tác trong hệ thống xuyên suốt mốc học thuật. Nơi tiếp nhận ngoài cổng không phải có tài khoản; ý kiến/điểm của họ được ghi nhận từ phiếu có nguồn và người kiểm tra, không giả làm đánh giá trực tuyến. Trạng thái phân biệt tự khai, chờ xác minh và đã xác minh; nhật ký và báo cáo quá hạn hoặc chưa nộp phải hiển thị là thiếu, không được tự đánh dấu hoàn tất. |

**Công bằng điểm:** cách tìm nơi thực tập không tự tạo một thang điểm khác. Hai sinh viên cùng học phần/kỳ dùng cùng chuẩn đầu ra, thành phần và trọng số theo đề cương có hiệu lực. Khác nhau là cách thu phiếu từ người hướng dẫn tại nơi thực tập: nhập trực tuyến với đối tác có tài khoản, nộp phiếu giấy/scan hoặc thư công vụ đã kiểm tra với nơi ngoài cổng. Thiếu phiếu bắt buộc thì chờ bổ sung hoặc xử lý theo quy chế, không tự điền điểm 0 hay chuyển trọng số sang GVHD. Ví dụ, [đề cương CT452 của CTU](https://www.cit.ctu.edu.vn/decuong/CT452.pdf) công bố hai thành phần đánh giá từ người hướng dẫn tại nơi thực tập và quyển báo cáo, mỗi thành phần 50%; đây là ví dụ cho học phần đó, không phải công thức áp dụng cho mọi ngành.

**Đề xuất phạm vi một tháng:** chỉ cài đặt luồng đối tác tham gia InternLink. Luồng sinh viên tự tìm nơi được đặc tả như phần mở rộng có điều kiện theo quy chế CTU; nếu CTU bắt buộc quản lý loại này ngay, nên thêm một đường “đăng ký nơi tự tìm” tối giản và cắt bớt tính năng phụ, thay vì tạo dữ liệu tuyển dụng/offer giả. Không ép doanh nghiệp ngoài cổng đăng nhập. Có thể mời họ dùng một biểu mẫu xác nhận một lần, nhưng phải có cách ghi nhận xác minh ngoại tuyến khi họ không dùng.

**Tác động mô hình dữ liệu:** schema 26 bảng hiện tại gắn `internship_placements` bắt buộc với `learning_agreements → placement_offers → job_applications → job_positions` và `mentor_id` phải trỏ tới `users`. Vì thế không thể hỗ trợ nơi tự tìm một cách trung thực chỉ bằng giao diện. Khi triển khai luồng này, cần tách nguồn placement (`PARTNER_PORTAL`/`STUDENT_FOUND`), lưu thông tin đơn vị ngoài cổng và thư tiếp nhận, cho phép khởi tạo placement sau xác minh mà không cần offer/mentor account giả. Giữ cùng kỳ, sinh viên, GVHD, nhật ký, minh chứng, case và kết quả học tập; bổ sung báo cáo giữa/cuối kỳ có trạng thái nộp, nhận xét, yêu cầu sửa và hạn nộp. Phiếu đánh giá từ nơi ngoài cổng cần lưu điểm, bản gốc, người nhập, người kiểm tra và trạng thái xác minh; chỉ phiếu hợp lệ mới được đưa vào công thức chung của học phần. Điều kiện chốt kết quả phải kiểm tra tiến độ, báo cáo và các phiếu bắt buộc. Việc điều chỉnh FK/ràng buộc phải có migration riêng, không làm lỏng luồng đối tác hiện có.

| Thực thể | Trạng thái tối thiểu và chuyển hợp lệ | Điều kiện/đầu ra cần giữ |
|---|---|---|
| Kỳ thực tập | `DRAFT → REGISTRATION_OPEN → APPLICATION_OPEN → ACTIVE → EVALUATING → CLOSED` | Hạn phải tăng theo thứ tự; khi đóng chỉ đọc, mở lại cần quyền và lý do. |
| Doanh nghiệp | Chờ xác minh → đã xác minh / yêu cầu bổ sung / từ chối / tạm ngưng | Duyệt theo hồ sơ pháp lý và liên hệ; tạm ngưng phải dừng đăng vị trí mới và xử lý vị trí đang mở. |
| Vị trí | `DRAFT → PENDING_APPROVAL → APPROVED/REJECTED → CLOSED` | Sửa nội dung đã duyệt cần gửi duyệt lại; ứng viên xem snapshot nội dung lúc nộp. |
| Ứng tuyển | `SUBMITTED → REVIEWING → INTERVIEWING → OFFERED` hoặc `REJECTED/WITHDRAWN` | Một sinh viên không nộp trùng một vị trí; phỏng vấn có lịch/kết quả tối thiểu. |
| Offer | `SENT → ACCEPTED/DECLINED/EXPIRED/WITHDRAWN` | Hạn phản hồi, chỉ tiêu còn lại, xung đột placement và người quyết định phải được kiểm tra khi chấp nhận. |
| Thỏa thuận | `DRAFT → PENDING_SIGNATURES → APPROVED`; yêu cầu sửa/hủy theo quyền | Nội dung được duyệt phải có phiên bản và dấu thời gian phê duyệt; phụ lục không ghi đè bản cũ. |
| Placement | `PREPARING → ACTIVE → PAUSED/COMPLETED/TERMINATED/TRANSFERRED` | Kích hoạt cần offer, mentor, GVHD, thỏa thuận và kỳ hợp lệ; mọi đổi trạng thái cần lý do. |
| Nhật ký | `DRAFT → SUBMITTED → APPROVED_BY_MENTOR` hoặc `REVISION_REQUESTED → DRAFT` | Bản đã nộp giữ dấu thời gian; phản hồi GVHD và minh chứng gắn đúng tuần. |
| Đánh giá/kết quả | `DRAFT → SUBMITTED → REVIEWED → PUBLISHED`; phúc khảo → giữ/sửa kết quả | Chỉ công bố khi đủ phiếu theo quy chế, tính đúng phiên bản công thức, có lịch sử điều chỉnh. |

Các tên trạng thái “chờ bổ sung”, “đã rà soát”, “phúc khảo” ở bảng là **nghiệp vụ cần mô hình hóa**, chưa khẳng định đã có trong enum/database hiện tại. Nếu cần giữ 26 bảng, có thể dùng trạng thái hiện hữu cùng `internship_cases` và metadata có cấu trúc, nhưng không được làm mất lịch sử quyết định.

## 5. Quy trình 12 bước và tình huống phát sinh

| Bước theo luận văn | Xử lý tối thiểu; người quyết định | Tình huống cần xử lý |
|---|---|---|
| 1. Đăng ký/xác minh doanh nghiệp | Đại diện gửi tên pháp lý, mã số thuế, liên hệ, địa điểm; cán bộ khoa xác minh và lưu lý do. | Trùng mã số thuế, người đăng không thuộc doanh nghiệp, thiếu hồ sơ, doanh nghiệp bị tạm ngưng giữa kỳ. |
| 2. Đề xuất vị trí | Doanh nghiệp khai công việc, yêu cầu bắt buộc/mong muốn, chỉ tiêu, mentor, nơi/hình thức làm việc, thời gian và mục tiêu học tập. | Thiếu mentor, yêu cầu vượt khả năng sinh viên, thay đổi lương/địa điểm, chỉ tiêu bằng 0. |
| 3. Phê duyệt vị trí | Khoa kiểm tra phù hợp ngành/chuẩn đầu ra, điều kiện làm việc và thời hạn; yêu cầu sửa hoặc duyệt. | Sửa vị trí sau duyệt; hồ sơ đang ứng tuyển phải biết phiên bản nào áp dụng. |
| 4. Hồ sơ sinh viên | Roster xác định tư cách; sinh viên bổ sung CV, kỹ năng, minh chứng, nguyện vọng và phạm vi chia sẻ. | Sinh viên thiếu roster, mã số trùng, CV bị thay sau nộp đơn, thu hồi quyền chia sẻ dữ liệu. |
| 5. Gợi ý và ứng tuyển | Lọc vị trí hợp lệ trước; AI xếp hạng kèm matched/missing skills; sinh viên tự nộp. | AI lỗi hoặc không có CV: cho tìm/lọc thủ công; kỹ năng trích xuất sai: sinh viên sửa/xác nhận trước khi dùng. |
| 6. Sơ tuyển/phỏng vấn/offer | Doanh nghiệp đổi trạng thái theo vòng tuyển và gửi offer có hạn; sinh viên quyết định. | Phỏng vấn dời/hủy, hai offer đồng thời, offer hết hạn lúc sinh viên bấm nhận, hết chỉ tiêu, doanh nghiệp rút offer. |
| 7. Thỏa thuận/kế hoạch học tập | Ba bên thống nhất mục tiêu, nhiệm vụ, mốc, giờ, giám sát, bảo mật; khoa duyệt trước khi kích hoạt. | Một bên yêu cầu sửa, mentor đổi, kéo dài thời gian, thay đổi nhiệm vụ cần phụ lục có phiên bản. |
| 8. Nhật ký/chấm công/minh chứng | Sinh viên nộp theo tuần; mentor xác nhận việc và giờ; GVHD phản hồi học thuật. | Nộp muộn, nộp trùng, công lệch nhật ký, file lỗi/bị chứa dữ liệu mật, mentor vắng mặt. |
| 9. Theo dõi vấn đề | Tạo `internship_case` có mức độ, người nhận, thời hạn, bằng chứng và quyết định. | Vắng mặt, môi trường không phù hợp, sự cố an toàn, thay nhiệm vụ, chuyển nơi, chấm dứt sớm; ca nghiêm trọng phải báo người phụ trách ngay. |
| 10. Đánh giá giữa/cuối kỳ | Mentor và GVHD chấm từng tiêu chí, dẫn chứng; khoa rà soát chênh lệch và thiếu phiếu. | Điểm lệch lớn, người đánh giá thay thế, mất minh chứng, báo cáo chưa đạt, nộp quá hạn. |
| 11. Đối chiếu chuẩn đầu ra | Ghép tiêu chí đã đánh giá với chuẩn đầu ra học phần; chỉ kết luận kỹ năng có minh chứng hợp lệ. | Một kỹ năng có nhiều minh chứng, minh chứng bị rút, chưa đủ căn cứ thì ghi “chưa xác nhận”. |
| 12. Báo cáo/cải tiến | Tổng hợp theo kỳ/ngành/đối tác; khoa xem xu hướng và phản hồi chất lượng. | Dữ liệu nhỏ gây lộ cá nhân, một sinh viên chuyển nhiều nơi, dữ liệu trễ sau ngày khóa sổ. |

### Quy tắc xử lý ngoại lệ ưu tiên

1. **Công và nhật ký tranh chấp:** giữ cả bản ghi gốc và ý kiến hai bên; cán bộ khoa ra quyết định điều chỉnh, lưu lý do và người quyết định. Không để mentor tự sửa số giờ đã được sinh viên nộp.
2. **Đổi mentor/GVHD:** người cũ giữ trách nhiệm xác nhận giai đoạn trước; người mới chỉ được xử lý từ ngày hiệu lực phân công. Cập nhật thỏa thuận nếu biểu mẫu CTU yêu cầu.
3. **Chuyển đơn vị:** đóng/đánh dấu placement cũ theo quyết định, xác định giờ được công nhận, tạo offer/thỏa thuận/placement mới. Không dùng lại offer cũ cho đơn vị mới.
4. **Chấm dứt sớm:** ngừng cho nộp giờ mới, chốt minh chứng và đánh giá phần đã thực hiện, khoa quyết định `NOT_COMPLETED` hoặc phương án khác theo quy chế. Không tự động gán `FAILED`.
5. **Phúc khảo:** chỉ nhận trong cửa sổ thời gian được cấu hình, khóa phiên bản điểm đang khiếu nại, phân công người xử lý không phải người tự chấm lại quyết định của mình nếu quy chế đòi hỏi, công bố bản kết quả mới kèm lịch sử.
6. **Sự cố an toàn/bảo mật:** ưu tiên con người tiếp nhận và xử lý ngoài hệ thống ngay; hệ thống lưu trạng thái, phân quyền chặt và mốc phản hồi. `internship_case` không thay thế quy trình khẩn cấp của CTU.

## 6. Đối sánh AI: thiết kế nghiên cứu có thể bảo vệ

**Nguồn đầu vào:** kỹ năng sinh viên đã xác nhận, học phần/chứng chỉ có nguồn, ràng buộc địa điểm/thời gian; vị trí được duyệt với kỹ năng bắt buộc/mong muốn. Lưu phiên bản taxonomy, mô hình, cấu hình trọng số và snapshot đầu vào cho mỗi lần xếp hạng để tái lập kết quả.

**Thứ tự xử lý:** (1) loại khỏi danh sách gợi ý các vị trí không hợp lệ về kỳ, trạng thái, hạn/chỉ tiêu hoặc điều kiện thực sự bắt buộc; (2) chuẩn hóa kỹ năng; (3) tính điểm baseline keyword/Jaccard hoặc BM25 và mô hình embedding/hybrid; (4) trả kỹ năng khớp/thiếu, lý do và tín hiệu thiếu dữ liệu; (5) sinh viên quyết định ứng tuyển. Điều kiện địa điểm/thời gian có thể là bộ lọc hoặc cảnh báo theo chính sách, không âm thầm loại ứng viên khi chưa được xác nhận là điều kiện bắt buộc.

**Kiểm thử luận văn:** tạo tập cặp sinh viên–vị trí giả lập/khử định danh, có ít nhất hai người chấm mức liên quan; đối chiếu bất đồng trước khi chốt nhãn. So sánh keyword/Jaccard, BM25, embedding và hybrid + ràng buộc bằng nDCG@K, MRR, Precision@K; đo độ chính xác trích xuất kỹ năng riêng. Báo cáo số mẫu, số vị trí, cách chia tập và khoảng tin cậy/độ bất định; không tuyên bố mô hình tốt hơn nếu chênh lệch nằm trong nhiễu mẫu. Kiểm tra độ xuất hiện trong top K theo nhóm phù hợp mà không đưa thuộc tính nhạy cảm vào điểm. AI không tự động từ chối ứng viên hoặc quyết định kết quả.

**Fallback:** khi AI timeout, lỗi quota hoặc thiếu embedding, hiển thị danh sách vị trí hợp lệ theo bộ lọc thường; đánh dấu không có điểm gợi ý. Không dùng điểm giả định như một dự đoán đáng tin cậy.

## 7. Đối chiếu hiện trạng repository và khoảng cần hoàn thiện

| Quan sát từ repository ngày 26/09/2026 | Hệ quả | Việc cần làm |
|---|---|---|
| `mo_ta_luan_van.txt` yêu cầu 12 bước; `PROJECT_BASELINE_ONE_MONTH.md` chốt MVP bốn tuần, 26 bảng. `ARCHITECTURE_DESIGN.md` vẫn ghi 14 bảng, GPS/QR, chữ ký số và trọng số 40/40/20. | Người đọc có thể hiểu nhầm phạm vi và quy tắc điểm. | Đồng bộ tài liệu kiến trúc theo baseline 26 bảng; đánh dấu ý tưởng mở rộng; lấy điểm/biểu mẫu từ CTU. |
| `frontend-web/src/app/page.tsx` là trang giới thiệu và mô phỏng matching với kết quả đặt sẵn. | Chưa chứng minh được người dùng đi hết 15 bước demo bằng giao diện. | Xây các màn hình tối thiểu theo vai trò và một luồng đầu-cuối nối API thật. |
| Backend đã có entity/API/dịch vụ cho phần lớn đối tượng, nhưng `InternshipPlacementServiceImpl.updatePlacementStatus` đặt trạng thái trực tiếp. | Có thể nhảy qua điều kiện của state machine. | Gom chuyển trạng thái thành command có ma trận chuyển, quyền, lý do và lịch sử. |
| `AiMatchingServiceImpl.syncCvSkills` đánh dấu kỹ năng trích xuất là `isConfirmed=true` ngay khi lưu. | Không đáp ứng yêu cầu sinh viên xác nhận kỹ năng AI trước khi dùng. | Lưu `false`, cho sinh viên duyệt/sửa, chỉ dùng kỹ năng xác nhận khi xếp hạng. |
| `FinalResultServiceImpl` đang nhận điểm thành phần/trạng thái từ request, cộng cố định 40/40/20 và đặt thời gian công bố ngay. | Có thể công bố dù thiếu phiếu hoặc lệch quy chế kỳ. | Lấy điểm từ phiếu đã nộp, dùng công thức phiên bản theo kỳ, tách “chốt” với “công bố”. |
| `PlacementOfferServiceImpl` có kiểm tra trạng thái và hạn, nhưng chưa thấy kiểm tra chỉ tiêu/xung đột placement khi nhận offer trong dịch vụ này. | Nhận đồng thời có thể vượt chỉ tiêu hoặc tạo nhiều placement. | Kiểm tra giao dịch/khóa khi accept; ràng buộc một placement hiệu lực/sinh viên/kỳ. |
| `internship_placements` bắt buộc có agreement và mentor là tài khoản; agreement lại bắt buộc có offer. | Chưa thể biểu diễn đúng một nơi sinh viên tự tìm mà doanh nghiệp không tham gia cổng. | Giữ ngoài MVP hoặc thiết kế nhánh `STUDENT_FOUND` với chứng từ xác minh và quy tắc dữ liệu riêng; không tạo job/offer/mentor giả. |

Đây là **rà soát tĩnh**, không phải kết luận đã chạy kiểm thử đầu-cuối. Repository hiện có thay đổi chưa commit; tài liệu này không sửa mã hoặc ghi đè các thay đổi đó.

**Ba điểm cần hòa giải giữa mô tả luận văn và baseline một tháng:** (1) mô tả yêu cầu mobile/PWA cho sinh viên, trong khi baseline bỏ mobile app: tối thiểu làm giao diện web đáp ứng màn hình điện thoại cho nộp nhật ký; khả năng cài đặt/offline của PWA có thể để sau nếu chưa đủ thời gian. (2) mô tả yêu cầu đánh giá giữa kỳ và cuối kỳ, baseline demo chỉ có cuối kỳ: tối thiểu tái sử dụng cùng mẫu rubric với `MIDTERM` và `FINAL`, cho phép xem phản hồi giữa kỳ, còn việc tính điểm kết thúc chỉ lấy các giai đoạn theo quy chế CTU. (3) mô tả yêu cầu dashboard kỹ năng thiếu theo khóa/ngành, baseline bỏ dashboard nâng cao: cần ít nhất một báo cáo tổng hợp theo kỳ/ngành từ dữ liệu kỹ năng và vị trí, có lọc nhóm nhỏ; biểu đồ tương tác sâu để sau. Không nên ghi ba mục này là “đã hoàn thành” nếu demo chưa có.

## 8. Kế hoạch triển khai theo cổng nghiệm thu

| Cổng | Ưu tiên và kết quả bàn giao | Tiêu chí hoàn tất |
|---|---|---|
| 0. Chốt quy chế và dữ liệu mẫu | Thu quy định CTU, chuẩn đầu ra, mẫu phiếu, công thức điểm; chốt actor/quyền, một placement hiệu lực/kỳ và các deadline. | Có bảng quyết định nghiệp vụ được GVHD/cán bộ phụ trách xác nhận; dữ liệu demo không dùng hồ sơ thật chưa được phép. |
| 0a. Chốt nguồn nơi thực tập | Hỏi CTU có cho sinh viên tự tìm nơi và có bắt buộc quản lý loại đó trong học phần không; xác định hồ sơ xác minh thay thế thao tác doanh nghiệp. | Văn bản phạm vi nêu rõ luồng đối tác đầy đủ và luồng tự tìm (nếu có) cùng mức xác minh; không ép doanh nghiệp ngoài cổng tạo tài khoản. |
| 1. Luồng nền | Kỳ, roster, tài khoản, doanh nghiệp, vị trí, duyệt, CV/tài liệu và quyền xem. | Sinh viên chỉ thấy vị trí đúng kỳ/ngành; mọi phê duyệt có lý do/lịch sử; file không công khai. |
| 2. Matching và tuyển chọn | Trích xuất kỹ năng có bước xác nhận, gợi ý giải thích được, ứng tuyển, phỏng vấn tối thiểu, offer/hạn/chỉ tiêu. | Có fallback khi AI lỗi; không nộp trùng; hai lần bấm accept không tạo hai placement. |
| 3. Thiết lập và theo dõi | Thỏa thuận có phiên bản, phân công mentor/GVHD, kích hoạt, task, công, nhật ký và minh chứng. | Thiếu chữ ký/duyệt không kích hoạt; mentor chỉ xem sinh viên được phân công; nộp muộn/tranh chấp có đường xử lý. |
| 4. Đánh giá và ngoại lệ | Rubric, kiểm tra thiếu/chênh lệch, kết quả nháp/chốt/công bố, generic case và phúc khảo tối thiểu. | Điểm tái tính được từ phiếu và công thức kỳ; kết quả sửa sau công bố có phiên bản/lý do. |
| 5. Chứng minh luận văn | BPMN năm luồng, state machine, CDM, ca kiểm thử, đánh giá AI, thử nghiệm người dùng và báo cáo KPI cơ bản. | Demo 15 bước trong baseline chạy với dữ liệu giả; báo cáo kết quả đo, lỗi và giới hạn rõ ràng. |

Nếu vẫn giữ lịch **bốn tuần** trong baseline: tuần 1 ưu tiên cổng 0–1, tuần 2 cổng 2, tuần 3 cổng 3–4, tuần 4 cổng 5 và sửa lỗi. Mốc này là **điều kiện để quản lý phạm vi**, không phải cam kết thời gian khi quy chế, dữ liệu và tích hợp ngoài chưa có. Ưu tiên đầu tiên là luồng đầu-cuối; dashboard nâng cao, dự báo bỏ thực tập, ứng dụng mobile riêng, GPS và chữ ký số pháp lý để sau MVP.

## 9. Bộ ca kiểm thử nghiệp vụ tối thiểu

1. Sinh viên không thuộc roster kỳ hiện tại bị chặn ứng tuyển; cán bộ khoa thấy lý do.
2. Vị trí chưa duyệt, đóng tuyển, hết hạn hoặc hết chỉ tiêu không nhận hồ sơ mới.
3. Doanh nghiệp sửa điều kiện quan trọng sau duyệt: vị trí quay lại chờ duyệt; hồ sơ cũ giữ snapshot.
4. Sinh viên thay CV sau khi nộp: ứng tuyển cũ vẫn chỉ tới CV đã gửi; lần nộp mới dùng bản mới.
5. AI timeout/không nhận diện được kỹ năng: tìm kiếm thủ công vẫn hoạt động, không hiển thị điểm giả.
6. Hai offer nhận gần đồng thời: chỉ một placement hiệu lực/kỳ; thao tác còn lại báo xung đột và hướng xử lý.
7. Offer hết hạn đúng lúc accept: thời điểm máy chủ quyết định; không tạo thỏa thuận.
8. Thỏa thuận thiếu một bên xác nhận hoặc nội dung đổi sau xác nhận: không kích hoạt; bên liên quan phải duyệt phiên bản mới.
9. Mentor/GVHD không được xem hồ sơ hoặc tài liệu ngoài placement được phân công.
10. Công và nhật ký lệch nhau: không tự cộng giờ; mở case, lưu kết luận và lịch sử điều chỉnh.
11. Chuyển nơi/chấm dứt sớm: giữ lịch sử placement cũ và giờ được công nhận; không tự gán đậu/rớt.
12. Thiếu phiếu đánh giá, điểm vượt thang, chênh lệch lớn: chặn công bố hoặc yêu cầu rà soát theo quy chế.
13. Phúc khảo trong hạn làm thay đổi kết quả: bản cũ còn truy vết, người học thấy bản mới và lý do.
14. Kỳ đã đóng: người thường chỉ đọc; mở lại hoặc chỉnh dữ liệu phải có quyền, lý do và audit.
15. Nếu bật luồng sinh viên tự tìm: hồ sơ thiếu thư tiếp nhận hoặc chưa được khoa xác minh không được kích hoạt placement; bản tự khai và bản đã xác minh hiển thị khác nhau; thiếu phiếu đánh giá doanh nghiệp được đánh dấu thiếu chứng từ, không sinh điểm mặc định.

## 10. Số đo nghiệm thu

- **Quy trình:** tỷ lệ hoàn tất 15 bước demo; thời gian từ tạo vị trí đến được duyệt, từ ứng tuyển đến offer, từ kết thúc thực tập đến công bố; tỷ lệ hồ sơ bị trả do thiếu dữ liệu; tỷ lệ nhật ký và phiếu đánh giá nộp đúng hạn.
- **Chất lượng:** số case theo loại/mức độ và thời gian xử lý; tỷ lệ placement phải chuyển/chấm dứt; mức hài lòng của sinh viên, mentor và GVHD trong thử nghiệm nhỏ.
- **AI:** Precision@K, MRR, nDCG@K, độ chính xác trích xuất kỹ năng, tỷ lệ sửa kỹ năng AI, tỷ lệ fallback, thời gian phản hồi và phân bố vị trí hiển thị trong top K.
- **Dữ liệu chuẩn đầu ra:** tỷ lệ tiêu chí rubric có minh chứng, tỷ lệ năng lực “đã thể hiện/chưa đủ căn cứ”, kỹ năng thiếu phổ biến theo ngành. Khi nhóm quá nhỏ, chỉ công bố dữ liệu tổng hợp đủ an toàn.

## 11. Quyết định còn mở cần lấy từ CTU

| Câu hỏi | Đề xuất mặc định để phát triển | Ai xác nhận |
|---|---|---|
| Sinh viên có được tự tìm nơi thực tập ngoài danh sách đối tác không? | Chưa kết luận thay CTU. MVP mặc định chỉ hỗ trợ toàn trình với đối tác tham gia cổng. Nếu CTU cho phép và yêu cầu quản lý nơi tự tìm, thêm luồng do sinh viên/khoa nhập và xác minh bằng chứng từ, không bắt doanh nghiệp ngoài cổng đăng nhập; không tạo offer/mentor giả. | Cán bộ quản lý thực tập |
| Một sinh viên có thể nhận nhiều offer hoặc thực tập song song? | Có thể có nhiều offer đang chờ; chỉ một placement hiệu lực trong một kỳ. | Cán bộ quản lý thực tập |
| Mẫu thỏa thuận và việc ký/xác nhận thế nào? | MVP ghi nhận xác nhận nội bộ và tệp giấy/scan có kiểm soát; không tuyên bố chữ ký số pháp lý. | Khoa/phòng pháp chế nếu liên quan |
| Quy định giờ, nhật ký, vắng mặt, nộp muộn? | Cấu hình theo kỳ/chương trình; không hard-code. | GVHD/cán bộ khoa |
| Rubric, trọng số, ngưỡng đạt và thẩm quyền công bố? | Phiên bản hóa cấu hình; chỉ khoa được chốt/công bố sau kiểm tra. | Cán bộ khoa/GVHD |
| Cấp xử lý và hạn phúc khảo? | Dùng `internship_cases`, khóa kết quả khi đang xử lý; hạn theo quy chế. | Khoa/hội đồng |
| Thời hạn lưu CV, minh chứng và ai được tải xuống? | Quyền theo vai trò và placement; thời hạn lưu theo quy định CTU. | Khoa/quản trị dữ liệu |

## 12. Tài liệu nội bộ dùng để đối chiếu

- `mo_ta_luan_van.txt`: mô tả gốc, 12 bước, phạm vi MVP, khung tham chiếu và tiêu chí nghiên cứu.
- `docs/PROJECT_BASELINE_ONE_MONTH.md`: phạm vi một tháng, sáu actor, 26 bảng, kịch bản demo 15 bước.
- `docs/use-cases/USE_CASE_CATALOG.md` và `docs/processes/ACTOR_BPMN_FLOWS.md`: phân vai, luồng và quyết định còn mở.
- `docs/data-model/LEAN_26_TABLE_CDM_DICTIONARY.md` và migration `V1__create_lean_26_tables.sql`: trạng thái/cấu trúc hiện hành.
- `docs/ARCHITECTURE_DESIGN.md`: bản kiến trúc cũ; cần cập nhật các điểm lệch với baseline trước khi đưa vào luận văn.
