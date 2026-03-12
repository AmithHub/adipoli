package com.adipoli.api.drinks;

public record Review(
        String id,
        String author,
        double overall,
        double taste,
        double smoothness,
        double value,
        int hangover,
        String comment,
        boolean wouldBuyAgain
) {
}
