package com.internlink.core.presentation.placement.controller;
import com.internlink.core.application.portfolio.PortfolioService;
import com.internlink.core.shared.api.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.UUID;

@RestController @RequestMapping("/api/v1/portfolio") @RequiredArgsConstructor
@PreAuthorize("hasAnyRole('STUDENT','COMPANY_MENTOR','LECTURER','FACULTY_ADMIN')")
public class PortfolioController {
    private final PortfolioService service;
    @GetMapping public ApiResponse<?> placements(){return ApiResponse.success(service.myPlacements());}
    @GetMapping("/{placementId}") public ApiResponse<?> overview(@PathVariable UUID placementId){return ApiResponse.success(service.overview(placementId));}
    @PutMapping("/{placementId}/forms/{kind}") public ApiResponse<?> save(@PathVariable UUID placementId,@PathVariable String kind,@Valid @RequestBody PortfolioService.Save body){return ApiResponse.success(service.save(placementId,kind,body));}
    @PostMapping("/{placementId}/forms/{kind}/actions") public ApiResponse<?> action(@PathVariable UUID placementId,@PathVariable String kind,@Valid @RequestBody PortfolioService.Action body){return ApiResponse.success(service.action(placementId,kind,body));}
    @GetMapping("/{placementId}/forms/{kind}/docx") public ResponseEntity<byte[]> export(@PathVariable UUID placementId,@PathVariable String kind,@RequestParam(required=false) UUID revisionId){return download(service.export(placementId,kind,revisionId));}
    @PostMapping("/{placementId}/forms/{kind}/signed") public ApiResponse<?> upload(@PathVariable UUID placementId,@PathVariable String kind,@RequestParam(required=false) UUID revisionId,@RequestParam MultipartFile file)throws IOException{return ApiResponse.success(service.uploadSigned(placementId,kind,revisionId,file));}
    @GetMapping("/{placementId}/forms/{kind}/signed/{fileId}") public ResponseEntity<byte[]> signed(@PathVariable UUID placementId,@PathVariable String kind,@PathVariable UUID fileId){return download(service.signed(placementId,kind,fileId));}
    private ResponseEntity<byte[]> download(PortfolioService.Download d){return ResponseEntity.ok().cacheControl(CacheControl.noStore()).contentType(MediaType.parseMediaType(d.mime())).header(HttpHeaders.CONTENT_DISPOSITION,ContentDisposition.attachment().filename(d.name(),StandardCharsets.UTF_8).build().toString()).body(d.bytes());}
}
