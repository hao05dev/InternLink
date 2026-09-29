package com.internlink.core.application.portfolio;
import com.internlink.core.shared.enums.UserRole;
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.*;
import static com.internlink.core.application.portfolio.PortfolioTestData.*;

class PortfolioAccessTest {
    @Test void privateFormsRequirePublicationAndStillRequirePlacementMembership(){
        var p=placement();for(String kind:new String[]{"M02","M03","M04"}){
            var f=form(p,kind);assertThat(PortfolioAccess.content(p.getStudent(),f)).isFalse();
            assertThat(PortfolioAccess.content(p.getLecturer(),f)).isTrue();f.setPublished(true);
            assertThat(PortfolioAccess.content(p.getStudent(),f)).isTrue();
            assertThat(PortfolioAccess.content(user(UserRole.STUDENT),f)).isFalse();
        }
    }
    @Test void rolesDoNotGainWriteRightsBySeeingAForm(){
        var p=placement();assertThat(PortfolioAccess.edit(p.getStudent(),form(p,"M02"))).isFalse();
        assertThat(PortfolioAccess.edit(p.getMentor(),form(p,"M02"))).isTrue();
        assertThat(PortfolioAccess.edit(p.getMentor(),form(p,"M05"))).isFalse();
        assertThat(PortfolioAccess.edit(p.getLecturer(),form(p,"M04"))).isTrue();
        assertThat(PortfolioAccess.confirmDaily(p.getLecturer(),p)).isFalse();
        p.setMentor(null);assertThat(PortfolioAccess.confirmDaily(p.getLecturer(),p)).isTrue();
        assertThat(PortfolioAccess.confirmDaily(user(UserRole.LECTURER),p)).isFalse();
    }
}
