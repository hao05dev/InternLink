package com.internlink.core.application.company;

import com.internlink.core.presentation.company.dto.response.CompanyPublicResponse;
import java.util.List;
import java.util.UUID;

public interface PublicCompanyService {
    List<CompanyPublicResponse> list();
    CompanyPublicResponse get(UUID id);
}
