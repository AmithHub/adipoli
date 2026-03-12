package com.adipoli.api.drinks;

import java.util.List;

final class MockDrinkData {

    private MockDrinkData() {
    }

    static List<Drink> create() {
        return List.of(
                new Drink(
                        "paul-john-brilliance",
                        "Paul John Brilliance",
                        DrinkCategory.WHISKY,
                        1850,
                        4.7,
                        3,
                        4.7,
                        4.8,
                        4.5,
                        "Rich Indian single malt with honeyed notes and a smooth finish.",
                        List.of("smooth", "crowd favorite"),
                        true,
                        List.of(
                                new Review("review-1", "Arjun", 4.8, 4.7, 4.8, 4.5, 3, "Excellent smooth single malt for special occasions.", true),
                                new Review("review-2", "Rahul", 4.6, 4.6, 4.7, 4.2, 4, "Premium pick that still feels approachable.", true)
                        )
                ),
                new Drink(
                        "old-monk",
                        "Old Monk Supreme Rum",
                        DrinkCategory.RUM,
                        540,
                        4.6,
                        4,
                        4.5,
                        4.4,
                        4.8,
                        "Iconic dark rum with vanilla sweetness and loyal community support.",
                        List.of("value pick", "crowd favorite"),
                        true,
                        List.of(
                                new Review("review-3", "Akhil", 4.6, 4.4, 4.2, 4.9, 4, "Still one of the easiest rums to recommend.", true),
                                new Review("review-4", "Nithin", 4.5, 4.3, 4.1, 4.8, 5, "Great value and familiar taste.", true)
                        )
                ),
                new Drink(
                        "morpheus-blue",
                        "Morpheus Blue XO",
                        DrinkCategory.BRANDY,
                        980,
                        4.3,
                        4,
                        4.2,
                        4.4,
                        4.3,
                        "Smooth, slightly richer brandy that feels premium for the price.",
                        List.of("smooth", "value pick"),
                        true,
                        List.of(
                                new Review("review-5", "Jerin", 4.3, 4.1, 4.4, 4.4, 4, "Good step-up brandy without overpaying.", true)
                        )
                ),
                new Drink(
                        "smirnoff-red",
                        "Smirnoff Red",
                        DrinkCategory.VODKA,
                        1280,
                        4.3,
                        4,
                        4.2,
                        4.4,
                        4.1,
                        "Trusted international vodka with clean finish and high mix value.",
                        List.of("smooth", "party pick"),
                        true,
                        List.of(
                                new Review("review-6", "Midhun", 4.2, 4.0, 4.4, 4.0, 4, "Works well when you want a safe vodka buy.", true)
                        )
                ),
                new Drink(
                        "kingfisher-ultra",
                        "Kingfisher Ultra",
                        DrinkCategory.BEER,
                        220,
                        4.3,
                        3,
                        4.2,
                        4.3,
                        4.5,
                        "Cleaner, crisper beer that feels lighter without losing flavor.",
                        List.of("low hangover", "crowd favorite"),
                        true,
                        List.of(
                                new Review("review-7", "Vishnu", 4.2, 4.1, 4.3, 4.6, 3, "Easy beer to recommend for broad groups.", true)
                        )
                )
        );
    }
}
