# InternLink — Kế hoạch thông báo, Gmail và Cloudflare R2
Ngày khảo sát: 03/10/2026. Phạm vi: backend-core và frontend-web của hệ thống quản lý thực tập; 6 vai trò STUDENT, COMPANY_REP, COMPANY_MENTOR, LECTURER, FACULTY_ADMIN, ADMIN.

## 1. Kết quả khảo sát và lựa chọn
Dự án đã có notifications, chuông thông báo, kiểm tra quyền hồ sơ, một số sự kiện thực tập, StorageService/StorageServiceRouter và GoogleWorkspaceClient. Cần mở rộng các thành phần này để giữ thống nhất dữ liệu, phân quyền và luồng nghiệp vụ.

| Nhu cầu | Lựa chọn triển khai | Cơ sở |
|---|---|---|
| Thông báo trên web | Inbox có phân trang, bộ lọc chưa đọc, số chưa đọc, đánh dấu đọc; dùng chung 6 portal | Backend xác định người nhận từ phiên đăng nhập; chuông tải 50 bản ghi gần nhất và đếm chưa đọc độc lập |
| Email giao dịch | Outbox PostgreSQL, ghi cùng giao dịch nghiệp vụ; worker gửi sau commit | Không giữ giao dịch DB trong lúc chờ Gmail; có trạng thái để đối soát lỗi và tránh gửi trùng |
| Gmail cá nhân | GMAIL_SMTP qua smtp.gmail.com:587, STARTTLS bắt buộc và App Password | Google công bố thông số SMTP [1]; App Password cần xác minh hai bước và có thể không được phép ở một số tài khoản [2] |
| Google Workspace | GOOGLE_WORKSPACE: Gmail API messages.send, MIME UTF-8/base64url, scope gmail.send | API gửi thư [3]; service account cần domain-wide delegation được quản trị viên miền cấp [4] |
| Tệp CV/hồ sơ | Bucket R2 private; backend upload/download qua S3 SDK và quyền tài liệu hiện có | R2 tương thích một phần S3 [5]; cấu hình Java theo hướng dẫn Cloudflare [6] |
| Upload trực tiếp | Để giai đoạn sau, có presigned PUT + xác nhận phía server | URL là quyền truy cập tạm thời; upload từ trình duyệt cần CORS [7] |

Đây là lựa chọn kỹ thuật cho InternLink dựa trên mã hiện có và tài liệu chính thức. Chưa có khảo sát người dùng hoặc số liệu lưu lượng thực tế để kết luận ưu tiên từ thị trường.

Gmail cá nhân và Workspace là hai phương án độc lập; không dùng service account để gửi từ Gmail cá nhân. Mã hiện tại dùng App Password cho Gmail cá nhân; OAuth với quyền người dùng là phương án mở rộng nếu tài khoản không hỗ trợ App Password.

Gmail có giới hạn gửi và giới hạn API. Google mô tả ngưỡng gửi theo tài khoản; Gmail cá nhân có thể bị hạn chế khi vượt 500 email/ngày [8]. Không coi đây là năng lực bảo đảm của hệ thống. Gmail API cũng có quota và giới hạn đồng thời; phản hồi chấp nhận không bảo đảm người nhận nhận được thư trong inbox [9][10]. Cần đo lượng email theo kỳ thực tập trước khi bật cho toàn trường.

## 2. Ma trận vai trò và sự kiện
Thông báo chỉ đến người liên quan đến hồ sơ, khoa hoặc doanh nghiệp. “Tất cả role” nghĩa là mỗi role có inbox và các sự kiện phù hợp, không phát mọi nội dung cho toàn bộ tài khoản.

| Vai trò | Các luồng đã nối thông báo | Các luồng cần bổ sung ở giai đoạn tiếp |
|---|---|---|
| Sinh viên | Kết quả ứng tuyển, offer, hồ sơ tự tìm, thỏa thuận, phân công, nhật ký, kết quả thực tập; nhận giấy giới thiệu và thiếu điều kiện qua lệnh khoa | Nhắc đăng ký, nộp nhật ký/báo cáo, ký thỏa thuận; kết quả xử lý CV AI |
| Đại diện doanh nghiệp | Đơn ứng tuyển mới/rút, kết quả duyệt tin, kết quả thẩm định doanh nghiệp, phản hồi offer/thỏa thuận theo luồng hiện có | Nhắc xử lý ứng viên, bố trí mentor, đánh giá cuối kỳ |
| Mentor | Phân công thực tập và các cập nhật nhật ký liên quan theo luồng hiện có | Nhắc phản hồi nhật ký/đánh giá, thay đổi nhiệm vụ được phân công |
| Giảng viên | Phân công hướng dẫn và các cập nhật nhật ký liên quan theo luồng hiện có | Nhắc nhận xét, chấm báo cáo, duyệt minh chứng; cảnh báo hồ sơ còn thiếu |
| Quản trị khoa | Tin thực tập gửi duyệt đúng khoa, hồ sơ sinh viên tự tìm, doanh nghiệp đăng ký cần thẩm định | Nhắc hồ sơ quá hạn, tổng hợp theo kỳ, thông báo thay đổi cấu hình đánh giá |
| Quản trị hệ thống | Doanh nghiệp đăng ký; inbox, tùy chọn email; API tổng hợp hàng đợi | Cảnh báo vận hành email/R2/AI, giao diện đối soát và thao tác gửi lại có audit |

Doanh nghiệp hiện được thẩm định qua danh mục chung, chưa gắn một khoa phụ trách. Vì vậy sự kiện COMPANY_REGISTERED gửi cho ADMIN và FACULTY_ADMIN như quyền danh mục hiện tại. Nếu chuyển sang quy trình thẩm định theo khoa, cần thêm khoa phụ trách rồi lọc người nhận tương ứng.

Các sự kiện tuyển dụng bổ sung trong đợt này: COMPANY_REGISTERED, COMPANY_REVIEWED, JOB_SUBMITTED, APPLICATION_SUBMITTED, APPLICATION_STATUS_CHANGED, APPLICATION_WITHDRAWN. Các hook thỏa thuận, offer, mentor/giảng viên, nhật ký, kết quả và hồ sơ tự tìm được giữ nguyên và dùng cơ chế email chung.

Kênh in-app luôn được lưu. Email có công tắc chung và bốn nhóm WORKFLOW, REMINDER, ANNOUNCEMENT, SYSTEM. Mặc định workflow/reminder/system bật, announcement tắt; người dùng có thể tắt email toàn bộ. Chính sách này không dùng thay thế email xác thực hoặc đặt lại mật khẩu.

## 3. Kiến trúc và các trạng thái đã triển khai
Luồng tự động:
1. Service nghiệp vụ xác định người nhận trong phạm vi quyền.
2. NotificationService lưu và flush notification để native SQL có thể kiểm tra khóa ngoại.
3. EmailOutboxService kiểm tra tài khoản hoạt động và tùy chọn; tạo email_outbox với khóa notification:<notificationId>.
4. Thông báo và email cùng commit hoặc cùng rollback.
5. Worker claim bản ghi bằng FOR UPDATE SKIP LOCKED trong giao dịch ngắn, tăng attempts và cấp lease.
6. Worker kiểm tra lại tùy chọn, trạng thái tài khoản và địa chỉ trước khi gửi, sau đó gọi Gmail ngoài giao dịch DB.
7. Kết quả cập nhật theo id + lease để worker cũ không ghi đè lượt hiện tại.

| Trạng thái outbox | Ý nghĩa |
|---|---|
| PENDING | Chờ được claim |
| SENDING | Worker đang xử lý, lease 10 phút |
| SENT | Nhà cung cấp chấp nhận; không khẳng định thư đã vào inbox |
| RETRY | Lỗi tạm thời xác định; backoff tăng dần, tối đa 5 lần thử theo cấu hình hiện tại |
| FAILED | Lỗi cấu hình/xác thực/địa chỉ, hoặc hết số lần thử |
| UNKNOWN | Không xác định thư đã được chấp nhận hay chưa; không tự gửi lại |
| SKIPPED | Tài khoản không còn hợp lệ, đổi địa chỉ, hoặc tùy chọn không cho phép |

Mất worker trong trạng thái SENDING sẽ chuyển UNKNOWN khi lease hết hạn. Message-ID ổn định giúp đối soát nhưng không tạo bảo đảm “exactly once” từ Gmail. UNKNOWN cần người vận hành kiểm tra hộp thư đã gửi và log trước khi quyết định gửi lại. Chưa có màn hình/endpoint gửi lại trong đợt này.

Phân loại lỗi hiện tại cố ý thận trọng: Workspace HTTP 429/5xx và lỗi kết nối SMTP trước khi mở phiên có thể retry; lỗi SMTP chưa phân loại chắc chắn chuyển UNKNOWN. Gmail API HTTP 403 hiện chuyển FAILED; bước vận hành tiếp theo cần đọc reason an toàn để phân biệt quota với thiếu quyền và tôn trọng Retry-After khi có.

Các lệnh khoa gửi giấy giới thiệu và thông báo sinh viên thiếu điều kiện chuyển từ gửi trực tiếp sang enqueue; phản hồi emailsQueued thể hiện số xếp hàng, emailsSent giữ 0 để tương thích cấu trúc cũ. Khóa notice:<SHA-256(recipient+subject+body)> ngăn gửi lại cùng nội dung cho cùng địa chỉ. Những email cho roster chưa nhận tài khoản chỉ được tạo từ lệnh khoa có kiểm tra quyền hiện có; không mở endpoint gửi tùy ý.

Lệnh giấy giới thiệu hiện xử lý từng người, email và in-app có thể nằm trong các giao dịch riêng. Đợt mở rộng campaign cần gom hai phần theo từng người vào một giao dịch, có campaignId và trạng thái từng người để xử lý lỗi một phần rõ ràng.

API:
- GET /api/v1/notifications?page=0&size=20&unread=false: inbox của người đăng nhập; size tối đa 100.
- GET /api/v1/notifications/my-notifications: giữ API chuông, trả 50 thông báo gần nhất.
- GET /api/v1/notifications/unread-count; PATCH /{id}/read; PATCH /read-all.
- GET/PUT /api/v1/notifications/preferences: chỉ tùy chọn của người đăng nhập.
- GET /api/v1/notifications/delivery-summary: chỉ ADMIN; thống kê trạng thái không chứa nội dung hay địa chỉ người nhận.

Frontend có /student/notifications, /company/notifications, /mentor/notifications, /lecturer/notifications, /faculty/notifications, /admin/notifications. Link thông báo cũ được chuẩn hóa sang portal tương ứng; không chấp nhận link ngoài, protocol-relative hoặc link sang role khác. Chuông hiện poll 45 giây khi tab hiển thị; cập nhật khi có thao tác inbox.

## 4. R2 và tương thích với tài liệu hiện có
Upload tiếp tục dùng POST /api/v1/documents/upload. Owner lấy từ phiên đăng nhập; quyền context được kiểm tra trước khi gọi storage.

R2StorageService dùng endpoint Cloudflare HTTPS, region auto, path-style và tắt chunked encoding theo hướng dẫn Java SDK [6]. Key theo prefix/context/UUID.ext, tách khỏi tên tệp do người dùng cung cấp. Metadata giữ SHA-256, kích thước thực tế, MIME, tên hiển thị đã làm sạch và bucket.

Giới hạn hiện tại: 20 MiB/tệp, multipart request 25 MB. Đọc stream có giới hạn cả upload/download. Bucket không bật public access; download qua GET /api/v1/documents/{id}/download và kiểm tra quyền tài liệu hiện có. R2 URL trong metadata là locator nội bộ, không phải đường dẫn public dùng trên trình duyệt.

Storage provider ghi trên từng document quyết định nơi đọc tệp. Đổi STORAGE_PROVIDER sang R2 chỉ tác động upload mới; LOCAL và GOOGLE_DRIVE cũ vẫn đọc bằng provider đã ghi. Không tự di chuyển tệp cũ.

Nếu DB rollback sau khi upload, callback thử xóa object. Đây là bù trừ best-effort; lỗi xóa có thể để lại object mồ côi. Giai đoạn vận hành cần công việc đối soát object/DB, retention và backup. Giữ ổn định bucket/prefix khi còn tài liệu; việc đổi bucket hoặc prefix cần kế hoạch migration riêng.

Chưa triển khai presigned browser upload, quét virus, kiểm tra định dạng theo nội dung, multipart cho file lớn, migrate tệp cũ hoặc lifecycle tự xóa. Không dùng endpoint đăng ký URL ngoài để nhận một object R2 mà chưa kiểm chứng quyền, kích thước và nội dung.

## 5. Các bước đưa lên môi trường thật
File cấu hình mẫu: backend-core/.env.example. Spring không tự đọc .env; nạp biến môi trường bằng IDE, launcher hoặc hệ thống triển khai.

1. Sao lưu DB hiện tại, triển khai backend có Flyway V17. Migration chỉ tạo notification_preferences và email_outbox; không thay đổi dữ liệu tài liệu cũ. Chạy trên staging trước.
2. Giữ EMAIL_ENABLED=false lúc đầu, kiểm tra inbox và quyền với 6 tài khoản vai trò.
3. Tạo bucket R2 private và token chỉ có quyền đọc/ghi object trên bucket cần dùng. Thiết lập STORAGE_PROVIDER=R2, R2_ENDPOINT, R2_BUCKET, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_PREFIX. Thử upload/download CV nhỏ từ tài khoản thử và xác nhận tài khoản không liên quan bị từ chối.
4. Chọn một cấu hình email:
   - Gmail cá nhân: EMAIL_PROVIDER=GMAIL_SMTP; EMAIL_FROM=GMAIL_SMTP_USERNAME; GMAIL_SMTP_APP_PASSWORD là App Password, không phải mật khẩu đăng nhập. Bật xác minh hai bước; bỏ khoảng trắng trình bày khi sao chép App Password [2].
   - Workspace: EMAIL_PROVIDER=GOOGLE_WORKSPACE, EMAIL_FROM là tài khoản gửi trong miền; bật Gmail API, cấu hình domain-wide delegation với gmail.send, đặt GOOGLE_SERVICE_ACCOUNT_KEY_PATH trỏ đến key ở ngoài repo. GOOGLE_GMAIL_SENDER giữ tương thích cấu hình cũ; cấu hình mới dùng EMAIL_FROM rõ ràng.
5. Đặt APP_PUBLIC_URL là origin HTTP/HTTPS của frontend, không có query, fragment hoặc đường dẫn. Bật EMAIL_ENABLED=true sau khi cấu hình hoàn tất; backend kiểm tra provider/from/SMTP trước khi khởi động.
6. Kiểm thử một sự kiện với địa chỉ thử thuộc người triển khai; đối soát outbox, hộp thư đã gửi và hộp thư nhận. Sau đó kiểm tra opt-out, đổi địa chỉ và lỗi xác thực. Không gửi hàng loạt trước khi biết quota và lưu lượng theo ngày.

EMAIL_ENABLED=false ngăn tạo email mới và worker không chạy; các bản ghi đã có vẫn lưu trong DB. Nếu bật lại, worker tiếp tục PENDING/RETRY và kiểm tra lại người nhận trước khi gửi. Vì vậy cần rà soát backlog trước khi bật lại sau thời gian dài.

CORS R2 không cần cho đường upload qua backend hiện tại. Chỉ cấu hình CORS cho origin frontend khi bổ sung upload trực tiếp. Không đưa secret R2/App Password/service-account key vào frontend hoặc Git.

## 6. Kế hoạch hoàn thành các phần mở rộng
Ước lượng dưới đây dành cho một người phát triển có quyền cấu hình hạ tầng, chưa bao gồm thời gian chờ cấp quyền Workspace.

| Giai đoạn | Đầu việc | Tiêu chí nghiệm thu | Trạng thái |
|---|---|---|---|
| P0 — nền tảng | Inbox 6 role, prefs, email outbox, bổ sung hook tuyển dụng, R2 private, migration, cấu hình | Quyền nhận đúng; rollback không tạo email; claim không trùng; opt-out được tôn trọng; download đúng quyền | Đã triển khai, kiểm thử cục bộ |
| P0 — staging | Điền cấu hình, chạy Flyway, thử Gmail/R2 thật, đối soát thư và tệp | Một vòng upload/download và gửi nhận thật thành công, kiểm tra 403 và opt-out | Chờ cấu hình hạ tầng |
| P1 — nhắc hạn (3–5 ngày) | Chuẩn hóa deadline của term/offer/log/report; job theo Asia/Ho_Chi_Minh; khử trùng theo event+entity+recipient+deadlineVersion; nhắc trước hạn và khi quá hạn | Không gửi khi hoàn thành, đóng kỳ hoặc deadline đổi; chạy lại job không gửi trùng | Kế hoạch |
| P1 — vận hành email (2–4 ngày) | Trang admin hàng đợi, quota theo tài khoản/ngày, tạm dừng gửi, lỗi gửi xác định, thao tác đối soát UNKNOWN có audit | Không gửi lại UNKNOWN tự động; đo backlog/độ trễ; hạn chế truy cập nội dung | Kế hoạch |
| P1 — campaign khoa (2–3 ngày) | Preview người nhận theo kỳ/khoa, campaignId, batch có giới hạn, kết quả từng người; email/in-app cùng giao dịch mỗi người | Re-run không tạo trùng; hiển thị queued/accepted/failed riêng; quyền không vượt khoa | Kế hoạch |
| P2 — R2 nâng cao (3–5 ngày) | Presigned PUT ngắn hạn, CORS, HEAD/finalize kiểm chứng, loại tệp và quét virus; đối soát object mồ côi | Không tạo document khi upload chưa hoàn tất hoặc object không đúng; không truy cập object ngoài quyền | Kế hoạch |
| P2 — thông báo realtime/AI (2–4 ngày) | SSE hoặc WebSocket theo user; sự kiện CV extraction hoàn tất/lỗi; template phiên bản | Không rò thông báo giữa phiên; trạng thái AI phản ánh đúng lượt chạy | Kế hoạch |

Ưu tiên sau staging: nhắc hạn sinh viên/mentor/giảng viên, rồi vận hành email và campaign. Presigned upload chỉ cần khi đo tải backend cho thấy đường proxy hiện tại là hạn chế.

## 7. Kiểm thử và giới hạn xác nhận
Các kiểm thử mới dùng Gmail/S3 mocks để không gửi email hoặc upload tài khoản thật. Kiểm thử PostgreSQL opt-in bằng INTERNLINK_TEST_PG_URL, tài khoản internlink_test, tạo schema ngẫu nhiên. Chỉ trỏ biến này đến DB thử riêng; test migration chạy cả các seed của dự án trong schema đó.

Bộ kiểm tra bao gồm:
- Migration V1–V17 và Hibernate validate trên PostgreSQL 17 riêng.
- Giao dịch JPA/native SQL, rollback, chống trùng, claim đồng thời, cập nhật SENT, retry có trì hoãn, UNKNOWN khi mất kết quả/lease, từ chối người nhận đã đổi email hoặc opt-out.
- Quyền thông báo và tùy chọn của cả 6 role; đọc lặp không thay timestamp.
- MIME tiếng Việt, gmail.send, header injection và phân loại lỗi gửi.
- Key R2, SHA-256, giới hạn kích thước, object không tồn tại, kiểm tra prefix và bù trừ object khi DB rollback.
- Frontend inbox/bell: phân trang, lọc, lưu tùy chọn, trạng thái lỗi, số chưa đọc từ server, link theo role.
- TypeScript và React Doctor. Một số cảnh báo heuristic còn lại ở chuông hiện có và onSubmit được đánh giá theo ngữ cảnh; không đồng nghĩa lỗi runtime.

Chưa xác nhận gửi/nhận thư Gmail thật, thao tác bucket R2 thật, cấu hình tài khoản hoặc quota thực tế. DB thật chưa bị migrate bởi công việc này. Số kiểm thử và kết quả cuối được ghi trong NOTIFICATIONS_EMAIL_R2_STATUS.md.

## 8. Nguồn chính thức
[1] [Gmail: cấu hình SMTP](https://support.google.com/mail/answer/7104828)
[2] [Google: App Passwords](https://support.google.com/accounts/answer/185833)
[3] [Gmail API: gửi email](https://developers.google.com/workspace/gmail/api/guides/sending)
[4] [Google OAuth: service account và domain-wide delegation](https://developers.google.com/identity/protocols/oauth2/service-account)
[5] [Cloudflare R2: S3 API compatibility](https://developers.cloudflare.com/r2/api/s3/api/)
[6] [Cloudflare R2: AWS SDK Java](https://developers.cloudflare.com/r2/examples/aws/aws-sdk-java/)
[7] [Cloudflare R2: presigned URLs](https://developers.cloudflare.com/r2/api/s3/presigned-urls/)
[8] [Gmail: giới hạn gửi](https://support.google.com/mail/answer/22839)
[9] [Gmail API: xử lý lỗi và giới hạn](https://developers.google.com/workspace/gmail/api/guides/handle-errors)
[10] [Gmail API: quota](https://developers.google.com/workspace/gmail/api/reference/quota)
