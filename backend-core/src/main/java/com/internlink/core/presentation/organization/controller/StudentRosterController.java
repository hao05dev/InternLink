package com.internlink.core.presentation.organization.controller;

import com.internlink.core.application.organization.StudentRosterService;
import com.internlink.core.application.organization.GoogleSheetRosterService;
import com.internlink.core.shared.api.ApiResponse;
import com.internlink.core.presentation.organization.dto.request.IneligibleNoticeRequest;
import com.internlink.core.presentation.organization.dto.request.StudentRosterImportItem;
import com.internlink.core.presentation.organization.dto.response.BatchProvisionResponse;
import com.internlink.core.presentation.organization.dto.response.IneligibleNoticeResponse;
import com.internlink.core.presentation.organization.dto.response.StudentRosterResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/rosters")
@RequiredArgsConstructor
public class StudentRosterController {

    private final StudentRosterService rosterService;
    private final GoogleSheetRosterService googleSheetRosterService;

    public record GoogleSheetImportRequest(String spreadsheetId, String range) {}

    @PostMapping("/import-sheet/{termId}")
    @PreAuthorize("hasRole('FACULTY_ADMIN')")
    public ResponseEntity<ApiResponse<List<StudentRosterResponse>>> importGoogleSheet(
        @PathVariable UUID termId, @RequestBody GoogleSheetImportRequest request
    ) {
        var responses = googleSheetRosterService.importSheet(termId, request.spreadsheetId(), request.range());
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success("Đã import " + responses.size() + " sinh viên từ Google Sheets", responses));
    }

    @GetMapping("/by-term/{termId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY_ADMIN', 'LECTURER')")
    public ResponseEntity<ApiResponse<List<StudentRosterResponse>>> getRostersByTerm(
            @PathVariable UUID termId
    ) {
        List<StudentRosterResponse> rosters = rosterService.getRostersByTerm(termId);
        return ResponseEntity.ok(ApiResponse.success(rosters));
    }

    @PostMapping("/import/{termId}")
    @PreAuthorize("hasRole('FACULTY_ADMIN')")
    public ResponseEntity<ApiResponse<List<StudentRosterResponse>>> importRosterList(
            @PathVariable UUID termId,
            @Valid @RequestBody List<StudentRosterImportItem> items
    ) {
        List<StudentRosterResponse> responses = rosterService.importRosterList(termId, items);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Import danh sách sinh viên thành công (" + responses.size() + " sinh viên)", responses));
    }

    @PostMapping("/{rosterId}/provision-account")
    @PreAuthorize("hasRole('FACULTY_ADMIN')")
    public ResponseEntity<ApiResponse<StudentRosterResponse>> provisionAccount(
            @PathVariable UUID rosterId
    ) {
        StudentRosterResponse response = rosterService.provisionAccount(rosterId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Tạo tài khoản sinh viên thành công", response));
    }

    @PostMapping("/by-term/{termId}/batch-provision")
    @PreAuthorize("hasRole('FACULTY_ADMIN')")
    public ResponseEntity<ApiResponse<BatchProvisionResponse>> batchProvisionEligibleAccounts(
            @PathVariable UUID termId
    ) {
        BatchProvisionResponse response = rosterService.batchProvisionEligibleAccounts(termId);
        String msg = String.format("Đã xử lý tạo tài khoản cho %d sinh viên đủ điều kiện (Mới: %d, Đã liên kết: %d)",
                response.getTotalEligibleWithoutAccount(), response.getNewlyCreatedCount(), response.getLinkedExistingCount());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(msg, response));
    }

    @PostMapping("/by-term/{termId}/ineligible-notice")
    @PreAuthorize("hasRole('FACULTY_ADMIN')")
    public ResponseEntity<ApiResponse<IneligibleNoticeResponse>> notifyIneligibleStudents(
            @PathVariable UUID termId,
            @RequestBody IneligibleNoticeRequest request
    ) {
        IneligibleNoticeResponse response = rosterService.notifyIneligibleStudents(termId, request);
        String msg = String.format("Đã gửi thông báo cho %d sinh viên chưa đủ điều kiện (%d emails, %d thông báo hệ thống)",
                response.getTotalIneligible(), response.getEmailsSent(), response.getNotificationsCreated());
        return ResponseEntity.ok(ApiResponse.success(msg, response));
    }
}
