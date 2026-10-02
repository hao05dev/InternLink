# Kế hoạch cải tổ UX/UI InternLink

**Ngày lập:** 30/09/2026  
**Phạm vi:** trang công khai và sáu không gian theo vai trò trong `frontend-web`; đối chiếu API, cơ sở dữ liệu và lưu trữ tệp.  
**Trạng thái:** kế hoạch và kiểm kê mã nguồn; chưa thay giao diện hoặc schema.

## 1. Mục tiêu sản phẩm

InternLink cần cho người dùng nhận ra ngay **việc cần làm tiếp theo**: sinh viên tìm vị trí và theo dõi thực tập; doanh nghiệp đăng vị trí và xử lý ứng viên; người hướng dẫn xác nhận công việc/nhật ký; giảng viên phản hồi và chấm; khoa phê duyệt, phân công và công bố; quản trị viên duy trì danh mục và quyền. Giao diện công khai giúp tìm vị trí, hiểu quy trình và tin tưởng nguồn thông tin, nhưng không tự nhận là website chính thức của trường nếu chưa có quyền dùng nhận diện thương hiệu.

Các nguyên tắc bắt buộc:

- Dữ liệu thật từ API hoặc trạng thái **chưa có dữ liệu/lỗi tải**. Không tự hiển thị tin mẫu, logo của công ty khác, hạn nộp tự đặt, số liệu không đo được hoặc tuyên bố hợp tác chưa xác minh.
- Câu chữ hướng về người dùng và nghiệp vụ. Không đưa ghi chú triển khai, prompt, tài khoản demo, thuật ngữ nội bộ, lời hướng dẫn bất thường hay lỗi API thô lên trang. Trạng thái lỗi vẫn rõ và có hành động tiếp theo.
- Dùng lại `Button`, `Card`, `DataTable`, `Modal`, `EmptyState`, `StatusBadge`, layout và icon `lucide-react`; mở rộng thành phần khi nhiều luồng thực sự dùng chung. Không tạo thư viện icon hoặc CSS riêng cho từng màn hình.
- Ưu tiên luồng hoàn tất công việc, bàn phím và di động. Hiệu ứng chuyển động chỉ giúp nhận biết trạng thái; tôn trọng `prefers-reduced-motion`.
- Mỗi hình ảnh có chủ sở hữu/nội dung/nguồn và quyền công bố. Tệp cá nhân luôn riêng tư; hình ảnh công khai đi qua kho media, không gắn URL mẫu trong frontend.

## 2. Nghiên cứu tham chiếu và điều áp dụng

Đây là đối chiếu **chức năng và cấu trúc thông tin** từ trang/tài liệu chính thức, không sao chép giao diện hoặc lời quảng cáo của họ.

| Nguồn | Mẫu UX quan sát được | Áp dụng cho InternLink |
| --- | --- | --- |
| [TopCV](https://www.topcv.vn/) và [danh sách việc làm](https://www.topcv.vn/viec-lam/) | Điểm vào tìm việc nổi bật; danh mục việc làm, công ty, cẩm nang; tin có các thuộc tính để lướt nhanh | Trang chủ có tìm kiếm một hành động chính; thẻ vị trí hiển thị tên, doanh nghiệp, địa điểm, hình thức, kỳ/hạn và kỹ năng; lọc rõ ràng. Không bê danh mục việc làm rộng vì InternLink chỉ phục vụ thực tập của trường |
| [LinkedIn Job Search](https://www.linkedin.com/help/linkedin/answer/a507441/filter-and-sort-job-search-results?lang=en) và [Job tracker](https://www.linkedin.com/help/linkedin/answer/a8684146) | Bộ lọc theo nơi làm việc, thời gian, công ty, loại việc; theo dõi cơ hội theo giai đoạn | Bộ lọc ít nhưng đúng dữ liệu; từ danh sách đến chi tiết rồi ứng tuyển; sinh viên xem trạng thái đơn và bước kế tiếp. Chỉ thêm lưu tin/cảnh báo khi có persistence và thông báo phù hợp |
| [Handshake](https://support.joinhandshake.com/hc/en-us/articles/218693408-Searching-for-Jobs-and-Internships) | Cơ hội dành cho sinh viên, theo hồ sơ/nguyện vọng; trường có thể tuyển chọn tin và nhóm cơ hội | Chỉ hiển thị vị trí đã được khoa duyệt, đúng kỳ; gợi ý giải thích bằng kỹ năng; khu “dành cho bạn” chỉ hiện khi có dữ liệu hồ sơ |
| [Đại học Cần Thơ](https://www.ctu.edu.vn/) và [Trường CNTT-TT](https://cit.ctu.edu.vn/) | Tin, thông báo và liên kết theo nhóm người đọc; nhận diện đơn vị; thông tin liên hệ | Trang công khai có thông báo quan trọng, hướng dẫn thực tập và liên kết hữu ích. Nội dung, logo, ảnh khuôn viên và danh xưng phải được duyệt; không tự nhận quan hệ đối tác/MOU |

**Kết luận thiết kế:** phần tìm việc nên có nhịp đọc của cổng tuyển dụng; phần hướng dẫn và thông báo cần sự rõ ràng của cổng trường; phần quản lý theo vai trò ưu tiên hàng chờ công việc hơn dashboard trang trí.

### Bố cục trang chủ dự kiến

1. **Đầu trang:** tên sản phẩm và menu “Vị trí thực tập / Doanh nghiệp / Cẩm nang / Đăng nhập”. Một câu giới thiệu ngắn, ô tìm vị trí hoặc kỹ năng, nút “Tìm vị trí”. Ảnh minh họa chỉ dùng nếu có ảnh được phép công bố; typography đủ để trang vẫn đẹp khi chưa có ảnh.
2. **Kỳ đang mở:** tên kỳ, hạn ứng tuyển và thông báo quan trọng lấy từ nguồn đã duyệt. Nếu chưa mở kỳ, hiện lời hướng dẫn phù hợp và đường đến cẩm nang, không hiện đồng hồ đếm ngược giả.
3. **Vị trí mới:** 4–6 thẻ từ API public; mỗi thẻ có tên, doanh nghiệp, địa điểm, hình thức, phụ cấp nếu có, 2–3 kỹ năng, hạn kỳ. CTA “Xem vị trí”; toàn thẻ không có hai hành động tranh nhau.
4. **Cách tham gia:** ba bước dễ hiểu: chuẩn bị hồ sơ → chọn và ứng tuyển → theo dõi, ghi nhận thực tập. Liên kết đến hướng dẫn đầy đủ được khoa duyệt; không phơi bày state machine 12 bước.
5. **Doanh nghiệp và nội dung:** một hàng doanh nghiệp đã xác minh, bài hướng dẫn mới được công bố; thiếu dữ liệu thì ẩn section, không thay bằng danh sách giả.
6. **Chân trang:** tên đơn vị, liên hệ đã xác minh, quy định/quyền riêng tư và liên kết ngoài rõ nhãn. Trên điện thoại, ô tìm kiếm và vị trí mở xuất hiện trước các phần giới thiệu dài.

## 3. Kiểm kê giao diện hiện tại

Đã có khoảng 40 route trong `src/app`: trang chủ, việc làm, doanh nghiệp, cẩm nang, đăng nhập và khu vực cho STUDENT, COMPANY_REP, COMPANY_MENTOR, LECTURER, FACULTY_ADMIN, ADMIN. Phần lớn nghiệp vụ đã có điểm vào, vì vậy cách làm là **hợp nhất và sửa sâu luồng hiện có trước khi thêm route**.

| Nhóm | Hiện trạng xác nhận từ mã | Hướng xử lý |
| --- | --- | --- |
| Trang chủ | `home-view.tsx` có `FEATURED_JOBS` cố định, số “1,200+” và phần “12 bước” trình bày dài; nhiều câu nhắc kiến trúc/AI/CLO | Xây lại thành trang đích ngắn: tìm vị trí, vị trí đang mở từ API, thông báo/kỳ thực tập, 3 bước cho sinh viên, đường vào doanh nghiệp; số liệu chỉ khi truy vấn được |
| Danh sách/chi tiết việc | `job.service.ts` rơi về `MOCK_JOBS` khi API lỗi/rỗng và trộn logo, hạn nộp, quy mô, quyền lợi mẫu vào tin thật | Bỏ fallback công khai; dùng `JobPositionResponse`; hiển thị trường có thật; trang chi tiết có tiêu đề, điều kiện, kỹ năng, chuẩn đầu ra, doanh nghiệp và CTA ứng tuyển rõ |
| Doanh nghiệp công khai | `company-directory-view.tsx` dùng `PARTNER_COMPANIES` viết cứng với câu MOU và số vị trí | Lấy doanh nghiệp đã được xác minh qua API công khai riêng, tính số vị trí đang mở; nếu thiếu logo/giới thiệu thì dùng placeholder trung tính, không bịa thông tin |
| Cẩm nang | `BLOG_POSTS` cố định, ảnh Unsplash; bài “quy trình 12 bước” tự khẳng định quy định | Có thể giữ hướng dẫn do trường duyệt; bài viết/tin tức động cần nguồn lưu nội dung, người duyệt và ngày công bố. Chưa có nguồn thì chỉ hiện tài liệu chính thức được kiểm duyệt |
| Đăng nhập | Có bộ chọn tài khoản kiểm thử “Demo 1-Click”; lời giới thiệu kỹ thuật và nhiều CTA | Gỡ khỏi bản người dùng; giữ tùy chọn đăng nhập thật, quên mật khẩu/hỗ trợ nếu backend có; lỗi nhập tài khoản diễn đạt ngắn, riêng tư |
| Hồ sơ sinh viên | Chọn ngành có `DEFAULT_PROGRAMS`; kỹ năng gợi ý viết cứng; CV upload đang gọi enum không đúng backend | Dùng ngành/taxonomy từ API; sau upload hiển thị tài liệu và trạng thái xử lý thật; sửa hợp đồng `ContextType.PROFILE`, không dùng `STUDENT_PROFILE` |
| Báo cáo sinh viên | Có `internship_reports` và `documents`; FE gửi `docType=FINAL_REPORT` nhưng enum backend chỉ có `REPORT` | Sửa hợp đồng upload; làm rõ báo cáo giữa kỳ/cuối kỳ, bản nộp và phản hồi; không tạo bảng báo cáo mới |
| Hồ sơ thực tập | `portfolio-workspace.tsx` đã có tabs tổng quan, ngày, tuần, biểu mẫu; các role cùng dùng | Giữ lõi chung; giảm trùng menu “Nhật ký ngày”/“Báo cáo” nếu cùng trỏ đến một hồ sơ; điều hướng theo công việc đang chờ |
| Tương tác chưa hoàn tất | Có `alert()` ở xem CV/PDF và tải báo cáo khi chấm điểm | Thay bằng hành động thật có phân quyền, hoặc nút vô hiệu kèm lý do rõ; không hiển thị nút giả |

## 4. Sơ đồ trang và nhiệm vụ theo vai trò

| Vai trò/khu vực | Giữ và cải tổ | Trang hoặc luồng cần thêm nếu dữ liệu/API đáp ứng |
| --- | --- | --- |
| Khách | `/`, `/jobs`, `/jobs/[id]`, `/doanh-nghiep`, `/cam-nang`, `/cam-nang/[slug]`, `/login` | Chi tiết doanh nghiệp `/doanh-nghiep/[id]` khi API công khai có giới thiệu/ảnh; mục thông báo/hướng dẫn có thể ở `/cam-nang` thay vì thêm menu mới; trang 404/lỗi truy cập được viết đồng bộ |
| Sinh viên | Dashboard, hồ sơ/CV/kỹ năng, đơn ứng tuyển, thỏa thuận, hồ sơ thực tập, báo cáo | Trang gợi ý có thể là tab trong `/jobs` sau đăng nhập; khu **Tài liệu của tôi** gắn trong hồ sơ để quản CV/chứng chỉ/báo cáo; trang chi tiết đơn hoặc panel nếu danh sách không đủ diễn đạt offer/phỏng vấn |
| Doanh nghiệp | Dashboard, vị trí, ứng viên, thực tập sinh | Chỉnh hồ sơ doanh nghiệp từ API hiện có; chi tiết vị trí/ứng viên theo panel hoặc route khi cần liên kết trực tiếp; không tạo dashboard riêng cho mỗi hành động |
| Mentor | Dashboard, giao việc/hồ sơ, nhật ký, đánh giá cuối kỳ | Hàng chờ xác nhận nhật ký/tác vụ trong dashboard; chi tiết sinh viên dùng `portfolio-workspace` chung |
| Giảng viên | Dashboard, theo dõi, hồ sơ/báo cáo, chấm điểm | Hàng chờ báo cáo cần phản hồi và minh chứng mở đúng quyền; tránh nút “tải PDF” giả |
| Khoa | Dashboard theo kỳ, roster, thẩm định doanh nghiệp/vị trí, phân công, tiến trình/hồ sơ | Màn danh sách cần chốt kết quả/công bố nếu nghiệp vụ chưa có lối vào rõ; dùng lại chi tiết placement và bảng lọc theo kỳ |
| Quản trị | Người dùng, khoa/ngành, doanh nghiệp, AI, audit | Quản lý **nội dung công khai và media** nếu chọn CMS nội bộ; nếu dùng nguồn nội dung khác thì chỉ cần liên kết quản trị, không làm hai CMS |

Trước khi thêm route, kiểm tra xem panel/tab hiện tại có đủ thao tác, back/forward, deep link và quyền truy cập hay không. Một hành động quan trọng phải mở được từ thông báo và quay lại đúng danh sách đã lọc.

## 5. Thiết kế và tương tác dùng chung

1. **Information architecture:** header công khai tối đa 4 mục chính; không gian theo vai trò nhóm menu theo “Tìm cơ hội / Hồ sơ / Quá trình / Đánh giá” hoặc hàng chờ tương ứng. Breadcrumb chỉ ở trang sâu. CTA chính mỗi màn hình tối đa một; hành động nguy hiểm tách rõ.
2. **Design tokens:** chốt một bảng màu theo nhận diện được phép dùng, kiểu chữ Be Vietnam Pro hiện có, thang khoảng cách, bán kính và trạng thái. Hiện `Button` có `default` màu sky nhưng `primary` màu blue, cần thống nhất. Không viết lại bằng thư viện UI mới khi các thành phần đã dùng được.
3. **Thành phần tái dùng:** `PageHeader`, `JobCard`, `CompanyCard`, `StatusBadge`, `FilterBar`, `FileUploadField`, `DocumentList`, `TaskQueue`, `FormSection`, `FeedbackMessage`, `ConfirmDialog` chỉ tạo sau khi xác nhận ít nhất hai chỗ dùng. Form dùng validation và cách hiển thị lỗi nhất quán.
4. **Trạng thái dữ liệu:** phân biệt đang tải, không có dữ liệu, API lỗi, không có quyền, chưa đến kỳ và hành động hoàn tất. Không đổi lỗi mạng thành “chưa có vị trí”. Giữ bộ lọc trong URL; debounce tìm kiếm; phân trang/danh sách ảo khi dữ liệu đủ lớn; cập nhật lạc quan chỉ cho thao tác dễ hoàn tác.
5. **Điện thoại:** thiết kế từ 360 px trở lên; thẻ/tóm tắt thay cho bảng quá rộng; bộ lọc mở trong sheet; CTA ứng tuyển/nộp báo cáo dễ bấm; không để menu chồng vùng đọc. Bảng desktop có sticky header nếu danh sách dài.
6. **Accessibility:** nhắm WCAG 2.2 AA: nhãn trường, focus nhìn thấy, thứ tự tab hợp lý, thông báo trạng thái cho trình đọc màn hình, tương phản, kích thước vùng chạm, bàn phím đóng modal và trả focus, text thay thế cho ảnh. Icon từ `lucide-react` có nhãn khi đứng một mình; icon trang trí ẩn khỏi trình đọc.
7. **Hiệu năng:** dùng `next/image` cho media công khai từ domain được phép, kích thước ảnh rõ và lazy loading dưới màn hình đầu; đo LCP/INP/CLS ở trang chủ, danh sách việc và dashboard. Không tải toàn bộ bài viết/ảnh vào một bundle.

## 6. Quy tắc nội dung hiển thị

Quét và duyệt mọi chuỗi người dùng có thể thấy, bao gồm trang tĩnh, empty/error state, toast, alt text, metadata SEO và thông báo. **Không xuất hiện**: “Demo 1-Click”, “mock”, “fallback”, “backend”, “API”, “database”, “CLO/rubric” nếu không phải ngôn ngữ chính thức được giảng viên duyệt, “hệ thống” trong lời giới thiệu/CTA, mô tả quy trình chưa được khoa xác nhận, hoặc khẳng định MOU/đối tác/số lượng khi không có dữ liệu xác minh. Thuật ngữ kỹ thuật chỉ giữ trong trang quản trị kỹ thuật khi thực sự cần cho người vận hành, không lan sang trang công khai.

Ví dụ thay câu: “Đăng nhập hệ thống” → “Đăng nhập”; “Đối sánh kỹ năng AI Matching” → “Khám phá vị trí phù hợp”; “Nền tảng quản lý toàn trình…” → “Tìm và theo dõi kỳ thực tập của bạn”; “Chưa có dữ liệu” → “Chưa có vị trí đang tuyển trong kỳ này”. Mọi nội dung do doanh nghiệp/bài viết nhập cần xem trước, duyệt và xử lý HTML an toàn trước khi công bố.

## 7. Đối chiếu dữ liệu: có gì, thiếu gì, cần sửa gì

| Nội dung muốn hiển thị | DB/API hiện tại | Việc cần làm |
| --- | --- | --- |
| Vị trí, mô tả, hình thức, địa điểm, số lượng, phụ cấp, kỹ năng, chuẩn đầu ra | `job_positions`, `job_skills`; API `/jobs/public/*` có | Dùng ngay, không trộn mock. Hạn ứng tuyển hiện nằm ở `internship_terms.application_deadline`, chưa có hạn riêng cho từng tin |
| Tên, ngành, website, địa chỉ, trạng thái xác minh doanh nghiệp | `companies`, `/api/v1/companies` có | API công khai mới chỉ trả doanh nghiệp xác minh và thông tin được phép; không công khai `tax_code`/`verification_detail` nếu không cần |
| Logo, ảnh bìa, giới thiệu, quy mô, loại hợp tác của doanh nghiệp | Chưa có cột rõ trong `companies`; FE đang gán mẫu | **Cần migration** cho `description`, `employee_range` nếu nghiệp vụ muốn, `logo_media_id`, `cover_media_id`; loại hợp tác chỉ thêm khi khoa quản lý và duyệt, không suy từ `verification_status` |
| Poster tuyển dụng | Chưa có trong `job_positions` | **Cần migration** `poster_media_id` tùy chọn; phần lớn tin có thể hiển thị đẹp bằng typography và logo, không bắt poster là bắt buộc |
| Bài viết/cẩm nang/thông báo có ảnh | Không có bảng bài viết/CMS; `BLOG_POSTS` nằm trong FE | **Cần nguồn nội dung**: đề xuất `content_posts` gồm loại, slug, tiêu đề, tóm tắt, nội dung, cover, tác giả, trạng thái, ngày công bố; chỉ hiển thị `PUBLISHED` |
| Số lượng cơ hội, doanh nghiệp, hạn kỳ | Có thể tổng hợp từ vị trí đã duyệt, doanh nghiệp đã xác minh, kỳ thực tập | API tổng hợp công khai; không dùng con số cố định. Chỉ hiển thị khi truy vấn thành công |
| CV, chứng chỉ, minh chứng, báo cáo PDF | `documents`, `student_profiles.current_cv_document_id`, `internship_reports.document_id` đã có | Sửa hợp đồng enum FE–BE; đảm bảo upload CV cập nhật `current_cv_document_id`; làm danh sách tài liệu/phiên bản theo đúng quyền. Không cần bảng CV/báo cáo mới |
| Tệp biểu mẫu ký và bản DOCX phát sinh | `portfolio_signed_files.bytes`, `portfolio_revisions.docx` đang là `BYTEA` | Chuyển tệp ký sang object storage + metadata/reference trong DB; cân nhắc lưu DOCX xuất ra object storage hoặc tái tạo theo revision. Di chuyển dữ liệu cũ, không xóa cột ngay |
| Tệp/ảnh chung | `documents` chỉ phục vụ tài liệu có chủ/context, chưa phù hợp media công khai | **Cần `media_assets`** cho poster/logo/cover: owner/uploader, provider, object key, MIME, byte size, width/height, alt, visibility, status, created_at; FK từ bảng nghiệp vụ. Không lưu binary ảnh trong PostgreSQL |

Danh sách migration tối thiểu để người dùng quyết định với database: **(1)** `media_assets` + các FK logo/cover/poster, **(2)** `content_posts` nếu muốn blog/thông báo quản trị trong ứng dụng, **(3)** thuộc tính giới thiệu/quy mô doanh nghiệp nếu sẽ hiển thị, **(4)** tham chiếu object storage thay `BYTEA` cho biểu mẫu ký. Hạn riêng của từng tin là tùy nhu cầu; nếu không thêm thì ghi rõ “Hạn ứng tuyển của kỳ”.

## 8. Lưu trữ tệp và ảnh: phương án đề xuất

**Khuyến nghị kiến trúc đích: Cloudflare R2 hoặc kho S3 tương thích, tách bucket `private-documents` và `public-media`.** R2 hỗ trợ URL ký ngắn hạn cho browser PUT/GET; bucket công khai có custom domain để cache ảnh. Đây là đề xuất kỹ thuật, cần đối chiếu ngân sách, vị trí dữ liệu và quy định của trường trước khi chọn nhà cung cấp. Cloudinary là lựa chọn thay thế cho **ảnh công khai** khi cần nhiều biến thể/crop tự động; dùng upload có chữ ký, không để preset không ký làm quyền upload chính. Google Drive hiện đã tích hợp, phù hợp giai đoạn chuyển tiếp cho hồ sơ riêng tư, nhưng mã hiện tại tải toàn bộ file vào bộ nhớ backend khi upload và download nên chưa đạt mục tiêu giảm tải.

Luồng upload đích:

```text
FE chọn file → BE kiểm tra role/context/MIME/giới hạn và cấp upload intent + URL ký ngắn hạn
→ FE tải trực tiếp lên kho lưu trữ, hiển thị tiến độ và cho thử lại
→ FE báo hoàn tất → BE kiểm tra object tồn tại, MIME/size/checksum, quét tệp nếu là tài liệu
→ BE ghi documents hoặc media_assets với trạng thái ACTIVE
→ FE lấy danh sách từ API; tải tài liệu riêng qua URL đọc ngắn hạn sau kiểm quyền
```

- Không dùng URL công khai cho CV, báo cáo, phiếu đánh giá hoặc minh chứng. Không cho browser tự chọn object key/owner; BE tạo key ngẫu nhiên gắn context và hạn dùng ngắn.
- Media công khai chỉ phát hành sau duyệt; ảnh phải có kích thước/alt text và thumbnail phù hợp. Khóa CORS vào origin ứng dụng. Cleanup object upload dở, xử lý thay thế/xóa, audit người tải tài liệu.
- Nếu tiếp tục Drive trước khi di chuyển, dùng tài liệu hiện có và không mở public sharing; ưu tiên sửa upload/download để không giữ file lớn toàn bộ trong heap, hoặc triển khai upload resumable. Không dùng Drive làm CDN ảnh tuyển dụng.
- Không ghi `provider_file_id`, signed URL hoặc bytes vào nội dung HTML/blog; chỉ trả URL phân phối thích hợp theo quyền khi render.

## 9. Thứ tự triển khai và cổng nghiệm thu

| Giai đoạn | Việc làm | Kiểm tra hoàn tất |
| --- | --- | --- |
| 0 — kiểm toán, 2–3 ngày | Chốt site map và 6 luồng chính; rà mọi chuỗi hiển thị, mock, nút giả và hợp đồng API/DB; kiểm tra quyền dùng logo CTU/CICT | Có danh sách route giữ/sửa/gộp/thêm và bảng dữ liệu hiện có/thiếu được xác nhận |
| 1 — nền tảng, 3–5 ngày | Chuẩn hóa tokens, header/sidebar, form, bảng, modal, empty/error/loading, icon Lucide; sửa mobile/focus | Thành phần chung dùng ở trang công khai và ít nhất 3 role, không nhân đôi CSS/logic |
| 2 — dữ liệu công khai, 4–6 ngày | Bỏ mock/fallback; làm lại trang chủ, tìm việc, chi tiết tin, doanh nghiệp; triển khai API public đúng quyền | API rỗng cho empty state, lỗi cho retry; không còn tin/logo/hạn/partner giả |
| 3 — media và nội dung, 5–8 ngày | Chốt provider; migration media/CMS nếu cần; upload direct, ảnh công khai, blog/thông báo được duyệt | FE không đưa bytes tệp qua BE ở luồng mới; tài liệu riêng không public; bài viết có nguồn/tác giả/ngày |
| 4 — sáu role, 8–12 ngày | Làm từng luồng theo hàng chờ công việc; tái dùng portfolio/documents; sửa enum upload và nút giả; thêm route còn thiếu | Demo từ tìm việc đến nộp báo cáo, xác nhận, chấm và công bố chạy thông suốt trên desktop/mobile |
| 5 — kiểm thử trải nghiệm, 3–5 ngày | Test nhiệm vụ với ít nhất 1–2 người/role nếu tiếp cận được, bàn phím, mobile, tốc độ; rà copy và thông tin nhạy cảm | Không lỗi blocker; các tác vụ chính hoàn thành không cần giải thích miệng; đạt mục tiêu accessibility/performance đã chọn |

Ước lượng **25–39 ngày kỹ thuật**, phụ thuộc việc chọn nhà cung cấp media, CMS và số luồng backend phải bổ sung. Có thể triển khai song song một phần ở backend và frontend sau khi hợp đồng dữ liệu được chốt. Cổng nghiệm thu cuối là sáu kịch bản vai trò, không phải số trang được vẽ lại.

### Sáu kịch bản cần thử với người dùng

1. Sinh viên từ trang chủ tìm vị trí, xem điều kiện/kỹ năng, tải CV, xác nhận hồ sơ và ứng tuyển.
2. Sinh viên theo dõi đơn, offer, kỳ thực tập, nộp nhật ký và báo cáo PDF, xem phản hồi.
3. Doanh nghiệp cập nhật hồ sơ, đăng/sửa tin, xem trạng thái duyệt, xử lý ứng viên và chỉ định mentor.
4. Mentor mở đúng sinh viên được giao, xem việc/nhật ký, xác nhận và đánh giá.
5. Giảng viên mở báo cáo có quyền, phản hồi, chấm và xem minh chứng; khoa duyệt/phân công/công bố theo kỳ.
6. Quản trị viên xử lý tài khoản, nội dung/media công khai và kiểm tra log mà không làm lộ tệp riêng.

## 10. Nguồn kỹ thuật để kiểm chứng khi triển khai

- [W3C WCAG 2.2](https://www.w3.org/TR/WCAG22/) cho chuẩn accessibility.
- [web.dev Core Web Vitals](https://web.dev/articles/vitals) cho LCP, INP, CLS.
- [Next.js 14 Image](https://nextjs.org/docs/14/app/building-your-application/optimizing/images) cho ảnh công khai được tối ưu.
- [Cloudflare R2 presigned URLs](https://developers.cloudflare.com/r2/api/s3/presigned-urls/), [CORS](https://developers.cloudflare.com/r2/buckets/cors/) và [public buckets](https://developers.cloudflare.com/r2/buckets/public-buckets/).
- [Cloudinary direct/signed uploads](https://cloudinary.com/documentation/upload_images) nếu chọn dịch vụ ảnh riêng.
- [Google Drive resumable uploads](https://developers.google.com/workspace/drive/api/guides/manage-uploads) nếu duy trì Drive cho tài liệu riêng.
