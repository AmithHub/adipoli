package com.adipoli.api.drinks;

public record DrinkSummary(
        String id,
        String name,
        DrinkCategory category,
        int price,
        double rating,
        int hangoverScore,
        boolean trending
) {
}
