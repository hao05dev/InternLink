package com.internlink.core.application.recruitment;

import com.internlink.core.presentation.recruitment.dto.request.PlacementOfferRequest;
import com.internlink.core.presentation.recruitment.dto.response.PlacementOfferResponse;
import com.internlink.core.shared.enums.OfferStatus;

import java.util.UUID;

public interface PlacementOfferService {
    PlacementOfferResponse getOfferByApplicationId(UUID applicationId);
    PlacementOfferResponse getOfferById(UUID id);
    PlacementOfferResponse createOffer(PlacementOfferRequest request);
    PlacementOfferResponse respondToOffer(UUID id, OfferStatus status);
}
