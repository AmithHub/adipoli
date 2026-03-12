package com.adipoli.api.drinks;

import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class DrinkRepository {

    private final List<Drink> drinks = MockDrinkData.create();

    public List<Drink> findAll() {
        return drinks;
    }
}
