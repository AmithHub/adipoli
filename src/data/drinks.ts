import type { Drink, DrinkCategory, DrinkTag, Review } from "../types";

const reviewNames = [
  "Arjun",
  "Nithin",
  "Akhil",
  "Jerin",
  "Midhun",
  "Fayas",
  "Rahul",
  "Anoop",
  "Sanjay",
  "Vishnu",
];

const tagSets: DrinkTag[][] = [
  ["smooth", "crowd favorite"],
  ["value pick", "party pick"],
  ["strong", "crowd favorite"],
  ["beginner-friendly", "smooth"],
  ["low hangover", "value pick"],
];

const comments = [
  "Easy to recommend in a crowded shop. Balanced and dependable.",
  "Better than expected for the price. Works well for casual weekends.",
  "Smooth enough for most people and does not feel rough on the finish.",
  "Good crowd pleaser when nobody wants to overthink the purchase.",
  "Solid pick if you want something familiar and worth the money.",
];

function buildReviews(seed: number): Review[] {
  return Array.from({ length: 3 }, (_, index) => {
    const valueSeed = seed + index;
    return {
      id: `review-${seed}-${index}`,
      author: reviewNames[(seed + index) % reviewNames.length],
      overall: Number((4 + ((valueSeed % 8) * 0.1)).toFixed(1)),
      taste: Number((3.8 + ((valueSeed + 1) % 6) * 0.2).toFixed(1)),
      smoothness: Number((3.7 + ((valueSeed + 2) % 6) * 0.2).toFixed(1)),
      value: Number((3.9 + ((valueSeed + 3) % 6) * 0.2).toFixed(1)),
      hangover: 3 + ((valueSeed + 4) % 6),
      wouldBuyAgain: valueSeed % 3 !== 0,
      comment: comments[valueSeed % comments.length],
    };
  });
}

function createDrink(
  id: string,
  name: string,
  category: DrinkCategory,
  price: number,
  rating: number,
  hangoverScore: number,
  description: string,
  index: number,
  trending = false,
): Drink {
  return {
    id,
    name,
    category,
    price,
    rating,
    hangoverScore,
    taste: Number((rating - 0.1 + (index % 3) * 0.1).toFixed(1)),
    smoothness: Number((rating - 0.2 + ((index + 1) % 3) * 0.2).toFixed(1)),
    valueForMoney: Number((rating - 0.3 + ((index + 2) % 3) * 0.2).toFixed(1)),
    description,
    tags: tagSets[index % tagSets.length],
    trending,
    imageAccent: [
      "linear-gradient(135deg, #f6c453 0%, #7c3f00 100%)",
      "linear-gradient(135deg, #ffca7a 0%, #5e3100 100%)",
      "linear-gradient(135deg, #ffd86b 0%, #93520e 100%)",
      "linear-gradient(135deg, #efb84a 0%, #442100 100%)",
    ][index % 4],
    reviews: buildReviews(index),
  };
}

export const drinks: Drink[] = [
  createDrink("paul-john-brilliance", "Paul John Brilliance", "Whisky", 1850, 4.7, 3, "Rich Indian single malt with honeyed notes and a smooth finish.", 1, true),
  createDrink("blenders-pride", "Blenders Pride Reserve", "Whisky", 980, 4.2, 5, "Reliable premium blend that feels familiar, easy, and shareable.", 2, true),
  createDrink("royal-stag-barrel", "Royal Stag Barrel Select", "Whisky", 620, 4.0, 6, "A popular budget whisky with a sweeter profile and approachable body.", 3),
  createDrink("signature-premier", "Signature Premier Grain", "Whisky", 760, 4.1, 5, "Rounded and slightly grain-forward, good for groups and mixers.", 4),
  createDrink("officers-choice-blue", "Officer's Choice Blue", "Whisky", 450, 3.7, 7, "Budget-first whisky for shoppers who want the lowest spend.", 5),
  createDrink("antiquity-blue", "Antiquity Blue", "Whisky", 1120, 4.3, 4, "Classic premium blend with spice, oak, and easy sipping character.", 6, true),
  createDrink("imperial-blue", "Imperial Blue", "Whisky", 530, 3.8, 6, "Crowd-known bottle that works when you need a familiar pick fast.", 7),
  createDrink("100-pipers", "100 Pipers Deluxe", "Whisky", 1350, 4.4, 4, "Smooth blended scotch-style character with mellow smoke hints.", 8, true),
  createDrink("old-monk", "Old Monk Supreme Rum", "Rum", 540, 4.6, 4, "Iconic dark rum with vanilla sweetness and loyal community support.", 9, true),
  createDrink("bacardi-black", "Bacardi Black", "Rum", 980, 4.1, 5, "A lighter dark rum option with caramel notes and easy mixability.", 10),
  createDrink("captain-morgan", "Captain Morgan Original", "Rum", 1150, 4.2, 5, "Spiced rum with a friendly profile suited for casual nights.", 11),
  createDrink("mcdowells-no1-rum", "McDowell's No.1 Celebration", "Rum", 420, 3.9, 7, "Budget rum with molasses sweetness and a stronger finish.", 12),
  createDrink("malibu-coconut", "Malibu Coconut Rum", "Rum", 1600, 4.3, 4, "Lighter coconut-led rum for beginners and cocktail-first buyers.", 13),
  createDrink("contessa-rum", "Contessa Dark Rum", "Rum", 470, 3.8, 7, "Affordable dark rum that delivers strength and sweetness.", 14),
  createDrink("courrier-napoleon", "Courrier Napoleon Brandy", "Brandy", 780, 4.1, 5, "Well-known brandy with warming fruit notes and a smooth middle.", 15, true),
  createDrink("mansion-house", "Mansion House Brandy", "Brandy", 620, 4.0, 6, "Consistent value brandy often picked for family gatherings.", 16),
  createDrink("honey-bee", "Honey Bee Brandy", "Brandy", 430, 3.8, 7, "Budget-friendly brandy with a sweeter entry and punchier finish.", 17),
  createDrink("emperador", "Emperador Brandy", "Brandy", 1150, 4.2, 5, "Popular imported-style brandy with rounded fruit and oak notes.", 18),
  createDrink("morpheus-blue", "Morpheus Blue XO", "Brandy", 980, 4.3, 4, "Smooth, slightly richer brandy that feels premium for the price.", 19, true),
  createDrink("romanov", "Romanov Vodka", "Vodka", 520, 3.9, 6, "Budget vodka best used in mixers when you want to keep costs low.", 20),
  createDrink("magic-moments", "Magic Moments", "Vodka", 760, 4.0, 5, "Easy-drinking vodka with a softer feel for casual mixers.", 21, true),
  createDrink("smirnoff-red", "Smirnoff Red", "Vodka", 1280, 4.3, 4, "Trusted international vodka with clean finish and high mix value.", 22, true),
  createDrink("absolut", "Absolut Original", "Vodka", 1900, 4.5, 3, "Premium vodka with a crisp profile and low-burn finish.", 23),
  createDrink("white-mischief", "White Mischief", "Vodka", 470, 3.7, 7, "Low-cost vodka with sharper edges but popular party familiarity.", 24),
  createDrink("ketel-one", "Ketel One", "Vodka", 2450, 4.6, 3, "Refined vodka with silky texture and standout smoothness.", 25),
  createDrink("kingfisher-premium", "Kingfisher Premium", "Beer", 170, 4.1, 4, "A dependable lager when you want something easy and familiar.", 26, true),
  createDrink("kingfisher-ultra", "Kingfisher Ultra", "Beer", 220, 4.3, 3, "Cleaner, crisper beer that feels lighter without losing flavor.", 27, true),
  createDrink("heineken", "Heineken", "Beer", 260, 4.2, 3, "Balanced premium lager with crisp bitterness and steady finish.", 28),
  createDrink("budweiser-magnum", "Budweiser Magnum", "Beer", 230, 4.0, 5, "Strong beer with a fuller body for those who want more kick.", 29),
  createDrink("bira-blonde", "Bira 91 Blonde", "Beer", 210, 4.2, 3, "Smooth blonde lager with an easy entry point for newer drinkers.", 30),
  createDrink("corona", "Corona Extra", "Beer", 320, 4.1, 3, "Light, easygoing beer suited for relaxed evenings and social picks.", 31),
  createDrink("tuborg-strong", "Tuborg Strong", "Beer", 190, 3.9, 5, "A strong beer pick for users who prioritize strength over softness.", 32),
  createDrink("bro-code", "Bro Code", "Beer", 160, 3.6, 7, "Sweet strong beer-style cooler that gets chosen for quick parties.", 33),
  createDrink("royal-challenge", "Royal Challenge", "Whisky", 690, 4.0, 6, "Steady mid-range whisky that balances cost and familiarity well.", 34),
  createDrink("jawan-rum", "Jawan Dark Rum", "Rum", 390, 3.7, 7, "Budget dark rum with punchy sweetness and strong after-effect.", 35),
];

export const categories: Array<"All" | DrinkCategory> = [
  "All",
  "Whisky",
  "Rum",
  "Brandy",
  "Vodka",
  "Beer",
  "Gin",
];
