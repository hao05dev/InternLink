package com.internlink.core.presentation.auth.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegisterCompanyRequest {

    @NotBlank(message = "Tên doanh nghiệp không được để trống")
    @Size(max = 255, message = "Tên doanh nghiệp không quá 255 ký tự")
    private String companyName;

    @NotBlank(message = "Mã số thuế không được để trống")
    @Size(max = 50, message = "Mã số thuế không quá 50 ký tự")
    private String taxCode;

    private String industry;
    private String website;

    @NotNull(message = "Địa chỉ doanh nghiệp không được để trống")
    private Map<String, Object> address;

    @NotBlank(message = "Họ tên người đại diện không được để trống")
    private String fullName;

    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không đúng định dạng")
    private String email;

    @NotBlank(message = "Số điện thoại không được để trống")
    private String phoneNumber;

    @NotBlank(message = "Mật khẩu không được để trống")
    @Size(min = 6, message = "Mật khẩu phải từ 6 ký tự trở lên")
    private String password;
}
