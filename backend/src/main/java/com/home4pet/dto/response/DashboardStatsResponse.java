package com.home4pet.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsResponse {

    private long totalUsers;
    private long totalPets;
    private long availablePets;
    private long pendingAdoptions;
    private long completedPayments;
    private long unreadNotifications;
}
