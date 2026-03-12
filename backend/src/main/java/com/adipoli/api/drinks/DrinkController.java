package com.adipoli.api.drinks;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/drinks")
public class DrinkController {

    private final DrinkService drinkService;

    public DrinkController(DrinkService drinkService) {
        this.drinkService = drinkService;
    }

    @GetMapping
    public List<DrinkSummary> listDrinks(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) DrinkCategory category,
            @RequestParam(required = false) Integer maxPrice,
            @RequestParam(required = false) Double minRating
    ) {
        return drinkService.findAll(query, category, maxPrice, minRating);
    }

    @GetMapping("/trending")
    public List<DrinkSummary> trending() {
        return drinkService.findTrending();
    }

    @GetMapping("/top-rated")
    public List<DrinkSummary> topRated() {
        return drinkService.findTopRated();
    }

    @GetMapping("/{id}")
    public Drink getDrink(@PathVariable String id) {
        return drinkService.findById(id);
    }
}
