package com.internlink.core.presentation.placement.controller;
import com.internlink.core.application.portfolio.DailyJournalService;
import com.internlink.core.shared.api.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.UUID;

@RestController @RequestMapping("/api/v1/portfolio/{placementId}") @RequiredArgsConstructor
@PreAuthorize("hasAnyRole('STUDENT','COMPANY_MENTOR','LECTURER','FACULTY_ADMIN')")
public class DailyJournalController {
    private final DailyJournalService service;
    @GetMapping("/days") public ApiResponse<?> list(@PathVariable UUID placementId) { return ApiResponse.success(service.list(placementId)); }
    @PutMapping("/days/{date}") public ApiResponse<?> save(@PathVariable UUID placementId,@PathVariable LocalDate date,@Valid @RequestBody DailyJournalService.Input body) { return ApiResponse.success(service.save(placementId,date,body)); }
    @PostMapping("/days/{date}/review") public ApiResponse<?> review(@PathVariable UUID placementId,@PathVariable LocalDate date,@Valid @RequestBody DailyJournalService.Review body) { return ApiResponse.success(service.review(placementId,date,body)); }
    @GetMapping("/weeks") public ApiResponse<?> weeks(@PathVariable UUID placementId) { return ApiResponse.success(service.weeks(placementId)); }
    @PostMapping("/weeks/{number}/submit") public ApiResponse<?> submit(@PathVariable UUID placementId,@PathVariable int number) { return ApiResponse.success(service.submitWeek(placementId,number)); }
}
