# CTU InternLink - Luồng tổng quan của 6 tác nhân

> Mục tiêu: giúp đọc nhanh toàn bộ quy trình thực tập doanh nghiệp và biết rõ mỗi tác nhân làm gì, chuyển việc cho ai, tại đâu có rẽ nhánh.

## 1. Sáu tác nhân

| Tác nhân | Trách nhiệm chính |
|---|---|
| Sinh viên | Chuẩn bị hồ sơ, ứng tuyển và hoàn thành quá trình thực tập |
| Đại diện doanh nghiệp | Quản lý doanh nghiệp, vị trí tuyển dụng, ứng viên, offer và Mentor |
| Mentor doanh nghiệp | Giao việc, xác nhận hoạt động và đánh giá thực tế |
| Giảng viên hướng dẫn | Giám sát mục tiêu học tập và đánh giá học thuật |
| Cán bộ quản lý thực tập Khoa | Điều phối, phê duyệt, xử lý ngoại lệ và chốt kết quả |
| Quản trị viên hệ thống | Quản lý tài khoản, quyền, danh mục, bảo mật và vận hành |

## 2. Luồng toàn trình

```text
Khoa mở kỳ thực tập và import danh sách
  -> Sinh viên/GVHD kích hoạt tài khoản
  -> Khoa xác nhận sinh viên đủ điều kiện
  -> Doanh nghiệp được thẩm định
  -> Doanh nghiệp đăng vị trí
  -> Khoa phê duyệt vị trí
  -> Sinh viên cập nhật hồ sơ và CV
  -> AI trích xuất kỹ năng, xếp hạng vị trí phù hợp
  -> Sinh viên ứng tuyển
  -> Doanh nghiệp sàng lọc/phỏng vấn
  -> Doanh nghiệp phát hành offer
  -> Sinh viên chấp nhận offer
  -> Hệ thống chuẩn bị placement
  -> Khoa phân công GVHD; doanh nghiệp phân công Mentor
  -> Ba bên xác nhận Learning Agreement
  -> Khoa kích hoạt placement
  -> Mentor giao task
  -> Sinh viên thực hiện, chấm công, ghi nhật ký và nộp minh chứng
  -> Mentor xác nhận; GVHD giám sát; Khoa theo dõi
  -> Mentor và GVHD đánh giá
  -> Khoa chốt và công bố kết quả
  -> Sinh viên phúc khảo nếu cần
```

## 3. Các giai đoạn và rẽ nhánh chính

### Giai đoạn 1 - Tài khoản và điều kiện tham gia

```text
Khoa import danh sách sinh viên/GVHD
  -> Dữ liệu hợp lệ?
     ├─ Không: trả báo cáo lỗi để Khoa sửa
     └─ Có: tạo tài khoản và gửi lời mời kích hoạt
  -> Người dùng đổi mật khẩu lần đầu
  -> Khoa kiểm tra sinh viên đủ điều kiện?
     ├─ Không: thông báo lý do hoặc yêu cầu bổ sung
     └─ Có: ghi danh vào kỳ thực tập
```

### Giai đoạn 2 - Doanh nghiệp và vị trí

```text
Đại diện doanh nghiệp nộp hồ sơ
  -> Khoa thẩm định
  -> Kết quả?
     ├─ Cần bổ sung: doanh nghiệp sửa hồ sơ
     ├─ Từ chối: kết thúc quy trình đăng ký
     └─ Chấp thuận: được tạo vị trí thực tập

Doanh nghiệp gửi vị trí để duyệt
  -> Khoa kiểm tra nội dung, ngành và mục tiêu học tập
  -> Kết quả?
     ├─ Yêu cầu sửa: trả về doanh nghiệp
     ├─ Từ chối: vị trí không được hiển thị
     └─ Phê duyệt: hiển thị cho sinh viên đúng Khoa/ngành
```

### Giai đoạn 3 - Ứng tuyển và offer

```text
Sinh viên xem vị trí phù hợp
  -> Nộp đơn
  -> Doanh nghiệp sàng lọc
  -> Kết quả?
     ├─ Từ chối: sinh viên nhận kết quả
     ├─ Cần bổ sung: sinh viên cập nhật hồ sơ
     └─ Mời phỏng vấn
        -> Đạt?
           ├─ Không: đóng hồ sơ ứng tuyển
           └─ Có: doanh nghiệp phát hành offer
              -> Sinh viên phản hồi
                 ├─ Từ chối: doanh nghiệp tuyển người khác
                 ├─ Không phản hồi: offer hết hạn
                 └─ Chấp nhận: tạo placement chuẩn bị
```

### Giai đoạn 4 - Chuẩn bị placement

```text
Offer được chấp nhận
  -> Khoa phân công GVHD
  -> Doanh nghiệp phân công Mentor
  -> Hệ thống tạo draft Learning Agreement
  -> Sinh viên + Mentor + GVHD xác nhận
  -> Khoa kiểm tra điều kiện
  -> Đủ điều kiện?
     ├─ Không: bổ sung phần còn thiếu
     └─ Có: kích hoạt placement và bắt đầu thực tập
```

Điều kiện chính để kích hoạt:

1. Offer đã được chấp nhận.
2. Sinh viên thuộc kỳ thực tập và đủ điều kiện.
3. Doanh nghiệp và vị trí đã được phê duyệt.
4. Có Mentor và GVHD.
5. Learning Agreement đã được xác nhận.

### Giai đoạn 5 - Thực hiện thực tập

```text
Mentor lập kế hoạch và giao task
  -> Sinh viên nhận và thực hiện
  -> Sinh viên nộp kết quả/minh chứng
  -> Mentor kiểm tra
  -> Kết quả?
     ├─ Cần sửa: trả lại sinh viên
     ├─ Không phù hợp: Mentor và GVHD điều chỉnh
     └─ Đạt: xác nhận hoàn thành

Mỗi ngày/ca:
Sinh viên check-in -> làm việc -> check-out
  -> Mentor xác nhận
  -> Sai lệch?
     ├─ Không: ghi nhận chấm công
     └─ Có: sinh viên yêu cầu sửa; nếu không thống nhất thì mở tranh chấp

Mỗi ngày/tuần:
Sinh viên ghi nhật ký và nộp minh chứng
  -> Mentor nhận xét công việc
  -> GVHD theo dõi mục tiêu học tập
  -> Hệ thống tổng hợp tiến độ
```

### Giai đoạn 6 - Theo dõi và ngoại lệ

```text
Hệ thống phát hiện thiếu giờ, trễ task hoặc thiếu nhật ký
  -> Mentor/GVHD nhắc và hỗ trợ
  -> Khắc phục được?
     ├─ Có: tiếp tục thực tập
     └─ Không: Khoa mở case can thiệp

Có sự cố/tranh chấp/nghỉ ngang
  -> Khoa thu thập ý kiến các bên
  -> Quyết định?
     ├─ Tiếp tục với phương án khắc phục
     ├─ Chuyển sang placement khác
     └─ Kết thúc placement trước hạn
```

Dữ liệu cũ không bị xóa khi chuyển hoặc kết thúc; hệ thống phải giữ lịch sử và lý do.

### Giai đoạn 7 - Đánh giá và kết quả

```text
Đến cuối kỳ
  -> Mentor đánh giá năng lực thực tế
  -> GVHD đánh giá kết quả học tập
  -> Hệ thống tổng hợp chấm công, task, nhật ký và ngoại lệ
  -> Khoa kiểm tra
  -> Đủ dữ liệu?
     ├─ Không: yêu cầu bổ sung/giải trình
     └─ Có: Khoa chốt và công bố kết quả
  -> Sinh viên có phúc khảo?
     ├─ Không: kết quả trở thành chính thức
     └─ Có: Khoa xem xét và công bố quyết định cuối
```

## 4. Luồng riêng của từng tác nhân

### Sinh viên

```text
Kích hoạt tài khoản
-> Hoàn thiện hồ sơ/CV
-> Xem vị trí phù hợp
-> Ứng tuyển và phỏng vấn
-> Chấp nhận hoặc từ chối offer
-> Xác nhận Learning Agreement
-> Thực hiện task
-> Chấm công
-> Ghi nhật ký/nộp minh chứng
-> Báo cáo ngoại lệ nếu có
-> Xem kết quả và phúc khảo
```

### Đại diện doanh nghiệp

```text
Đăng ký doanh nghiệp
-> Hoàn thiện thẩm định
-> Đăng vị trí
-> Sàng lọc/phỏng vấn
-> Phát hành offer
-> Quản lý và phân công Mentor
-> Theo dõi placement phía doanh nghiệp
-> Phối hợp xử lý ngoại lệ
```

### Mentor doanh nghiệp

```text
Nhận phân công
-> Xác nhận Learning Agreement
-> Lập kế hoạch
-> Giao task
-> Kiểm tra kết quả/minh chứng
-> Xác nhận chấm công
-> Nhận xét nhật ký
-> Báo cáo rủi ro
-> Đánh giá năng lực thực tế
```

### Giảng viên hướng dẫn

```text
Nhận phân công
-> Kiểm tra Learning Agreement và mục tiêu học tập
-> Theo dõi task, nhật ký, minh chứng
-> Phản hồi học thuật
-> Can thiệp khi công việc không phù hợp
-> Phối hợp xử lý ngoại lệ
-> Đánh giá kết quả học thuật
```

### Cán bộ quản lý thực tập Khoa

```text
Mở kỳ và import danh sách
-> Xác nhận điều kiện sinh viên
-> Thẩm định doanh nghiệp/vị trí
-> Phân công GVHD
-> Kiểm tra và kích hoạt placement
-> Theo dõi cảnh báo
-> Xử lý chuyển/nghỉ/tranh chấp
-> Tổng hợp đánh giá
-> Công bố kết quả và xử lý phúc khảo
```

### Quản trị viên hệ thống

```text
Quản lý tài khoản và quyền
-> Quản lý cơ cấu CTU/danh mục
-> Quản lý cấu hình và tích hợp
-> Theo dõi lỗi/audit/bảo mật
-> Hỗ trợ kỹ thuật
```

Admin không thay Khoa ra quyết định nghiệp vụ.

## 5. Ai chịu trách nhiệm việc gì?

| Nghiệp vụ | Người thực hiện chính | Người kiểm tra/quyết định |
|---|---|---|
| Import tài khoản CTU | Khoa | Admin hỗ trợ kỹ thuật |
| Phê duyệt doanh nghiệp/vị trí | Khoa | Khoa |
| Ứng tuyển | Sinh viên | Doanh nghiệp xử lý |
| Phát hành offer | Đại diện doanh nghiệp | Sinh viên chấp nhận/từ chối |
| Phân công Mentor | Đại diện doanh nghiệp | Khoa kiểm tra khi kích hoạt |
| Phân công GVHD | Khoa | Khoa |
| Giao và nghiệm thu task | Mentor | GVHD giám sát tính phù hợp học thuật |
| Chấm công | Sinh viên ghi nhận | Mentor xác nhận |
| Nhật ký/minh chứng | Sinh viên nộp | Mentor nhận xét; GVHD giám sát |
| Xử lý ngoại lệ | Các bên báo cáo | Khoa điều phối và quyết định |
| Đánh giá thực tế | Mentor | Khoa dùng làm đầu vào |
| Đánh giá học thuật | GVHD | Khoa dùng làm đầu vào |
| Kết quả cuối | Khoa | Khoa công bố |

