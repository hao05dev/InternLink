package com.internlink.core.application.recruitment.impl;

import com.internlink.core.domain.recruitment.JobPosition;
import com.internlink.core.presentation.recruitment.dto.request.JobPositionRequest;
import com.internlink.core.shared.enums.WorkFormat;
import com.internlink.core.shared.exception.BadRequestException;
import com.internlink.core.shared.validation.MapUrlValidator;
import org.springframework.stereotype.Component;

@Component
public class JobLocationResolver {
    public record Location(String address, String mapEmbedUrl, String mapsUrl) {}

    public void apply(JobPosition job, JobPositionRequest request) {
        boolean inherited = request.isUseCompanyLocation() && request.getWorkFormat() != WorkFormat.REMOTE;
        String address = inherited ? job.getCompany().getOfficeAddress() : request.getLocation();
        if (address == null || address.isBlank()) {
            if (request.getWorkFormat() == WorkFormat.REMOTE) address = "Làm việc từ xa";
            else throw new BadRequestException("Vui lòng khai báo địa điểm làm việc hoặc địa chỉ văn phòng công ty.");
        }
        job.setUseCompanyLocation(inherited);
        job.setLocation(address.trim());
        job.setMapEmbedUrl(inherited ? null : MapUrlValidator.embed(request.getMapEmbedUrl()));
        job.setMapsUrl(inherited ? null : MapUrlValidator.maps(request.getMapsUrl()));
    }

    public Location resolve(JobPosition job) {
        if (job.getWorkFormat() == WorkFormat.REMOTE) return new Location(job.getLocation(), null, null);
        if (job.isUseCompanyLocation()) {
            var company = job.getCompany();
            return new Location(company.getOfficeAddress(), company.getMapEmbedUrl(), company.getMapsUrl());
        }
        return new Location(job.getLocation(), job.getMapEmbedUrl(), job.getMapsUrl());
    }
}
