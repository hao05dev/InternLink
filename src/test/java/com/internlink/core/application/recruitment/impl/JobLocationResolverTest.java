package com.internlink.core.application.recruitment.impl;

import static org.assertj.core.api.Assertions.*;
import com.internlink.core.domain.company.Company;
import com.internlink.core.domain.recruitment.JobPosition;
import com.internlink.core.presentation.recruitment.dto.request.JobPositionRequest;
import com.internlink.core.shared.enums.WorkFormat;
import org.junit.jupiter.api.Test;

class JobLocationResolverTest {
    private final JobLocationResolver resolver = new JobLocationResolver();

    @Test void inheritedLocationFollowsCompanyButSeparateLocationDoesNot() {
        var company = Company.builder().officeAddress("Office A").build();
        var inherited = JobPosition.builder().company(company).workFormat(WorkFormat.ONSITE).build();
        resolver.apply(inherited, JobPositionRequest.builder().useCompanyLocation(true).workFormat(WorkFormat.ONSITE).build());
        var separate = JobPosition.builder().company(company).workFormat(WorkFormat.HYBRID).location("Branch B").build();
        company.setOfficeAddress("Office C");
        assertThat(resolver.resolve(inherited).address()).isEqualTo("Office C");
        assertThat(resolver.resolve(separate).address()).isEqualTo("Branch B");
    }

    @Test void remoteDoesNotRequireAnOfficeAndMissingInheritedAddressIsRejected() {
        var job = JobPosition.builder().company(new Company()).workFormat(WorkFormat.REMOTE).build();
        resolver.apply(job, JobPositionRequest.builder().workFormat(WorkFormat.REMOTE).useCompanyLocation(true).build());
        assertThat(job.isUseCompanyLocation()).isFalse();
        assertThat(resolver.resolve(job).mapEmbedUrl()).isNull();
        assertThat(job.getLocation()).isEqualTo("Làm việc từ xa");
        assertThatThrownBy(() -> resolver.apply(job, JobPositionRequest.builder()
                .workFormat(WorkFormat.ONSITE).useCompanyLocation(true).build())).hasMessageContaining("địa chỉ");
    }
}
