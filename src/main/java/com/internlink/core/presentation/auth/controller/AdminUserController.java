package com.internlink.core.presentation.auth.controller;

import com.internlink.core.application.auth.AdminUserManagementService;
import com.internlink.core.presentation.auth.dto.request.AdminUserRequests.*;
import com.internlink.core.presentation.auth.dto.response.*;
import com.internlink.core.shared.api.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/v1/admin/users")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminUserController {
    private final AdminUserManagementService service;
    @GetMapping
    public ResponseEntity<ApiResponse<List<UserSummaryDto>>> list() {
        return ResponseEntity.ok(ApiResponse.success(service.list()));
    }
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserDetailDto>> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(service.get(id)));
    }
    @PostMapping
    public ResponseEntity<ApiResponse<UserSummaryDto>> create(@Valid @RequestBody CreateUserRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(service.create(request)));
    }
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<UserDetailDto>> update(@PathVariable UUID id, @Valid @RequestBody UpdateUserRequest request) {
        return ResponseEntity.ok(ApiResponse.success(service.update(id, request)));
    }
    @PostMapping("/{id}/change-email")
    public ResponseEntity<ApiResponse<UserDetailDto>> changeEmail(@PathVariable UUID id, @Valid @RequestBody ChangeEmailRequest request) {
        return ResponseEntity.ok(ApiResponse.success(service.changeEmail(id, request)));
    }
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Đã xóa người dùng thành công", null));
    }
}
