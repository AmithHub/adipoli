package com.adipoli.api.drinks;

public class DrinkNotFoundException extends RuntimeException {

    public DrinkNotFoundException(String drinkId) {
        super("Drink not found: " + drinkId);
    }
}
