package com.adipoli.api.drinks;

import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.Locale;

@Service
public class DrinkService {

    private final DrinkRepository drinkRepository;

    public DrinkService(DrinkRepository drinkRepository) {
        this.drinkRepository = drinkRepository;
    }

    public List<DrinkSummary> findAll(String query, DrinkCategory category, Integer maxPrice, Double minRating) {
        String normalizedQuery = query == null ? "" : query.trim().toLowerCase(Locale.ROOT);

        return drinkRepository.findAll().stream()
                .filter(drink -> matchesQuery(drink, normalizedQuery))
                .filter(drink -> category == null || drink.category() == category)
                .filter(drink -> maxPrice == null || drink.price() <= maxPrice)
                .filter(drink -> minRating == null || drink.rating() >= minRating)
                .sorted(Comparator.comparingDouble(Drink::rating).reversed())
                .map(this::toSummary)
                .toList();
    }

    public Drink findById(String id) {
        return drinkRepository.findAll().stream()
                .filter(drink -> drink.id().equals(id))
                .findFirst()
                .orElseThrow(() -> new DrinkNotFoundException(id));
    }

    public List<DrinkSummary> findTrending() {
        return drinkRepository.findAll().stream()
                .filter(Drink::trending)
                .limit(6)
                .map(this::toSummary)
                .toList();
    }

    public List<DrinkSummary> findTopRated() {
        return drinkRepository.findAll().stream()
                .sorted(Comparator.comparingDouble(Drink::rating).reversed())
                .limit(6)
                .map(this::toSummary)
                .toList();
    }

    private boolean matchesQuery(Drink drink, String query) {
        if (query.isBlank()) {
            return true;
        }

        return drink.name().toLowerCase(Locale.ROOT).contains(query)
                || drink.description().toLowerCase(Locale.ROOT).contains(query)
                || drink.category().name().toLowerCase(Locale.ROOT).contains(query)
                || drink.tags().stream().anyMatch(tag -> tag.toLowerCase(Locale.ROOT).contains(query));
    }

    private DrinkSummary toSummary(Drink drink) {
        return new DrinkSummary(
                drink.id(),
                drink.name(),
                drink.category(),
                drink.price(),
                drink.rating(),
                drink.hangoverScore(),
                drink.trending()
        );
    }
}
