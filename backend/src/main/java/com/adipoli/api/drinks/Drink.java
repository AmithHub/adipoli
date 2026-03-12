package com.adipoli.api.drinks;

import java.util.List;

public record Drink(
        String id,
        String name,
        DrinkCategory category,
        int price,
        double rating,
        int hangoverScore,
        double taste,
        double smoothness,
        double valueForMoney,
        String description,
        List<String> tags,
        boolean trending,
        List<Review> reviews
) {
}
