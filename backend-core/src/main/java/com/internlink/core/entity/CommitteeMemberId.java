package com.internlink.core.entity;

import java.io.Serializable;
import java.util.Objects;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommitteeMemberId implements Serializable {
    @Column(name = "ID_COMMITTEE")
    private Integer committeeId;

    @Column(name = "ID_USER")
    private Integer userId;

    @Override
    public boolean equals(Object o) {
        if (this == o)
            return true;
        if (o == null || getClass() != o.getClass())
            return false;
        CommitteeMemberId that = (CommitteeMemberId) o;
        return Objects.equals(committeeId, that.committeeId) && Objects.equals(userId, that.userId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(committeeId, userId);
    }
}
