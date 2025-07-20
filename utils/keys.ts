export function getKeyName (...args: string[]) {
    return `bites:${args.join(':')}`
}

export const resturantKeyById = (id: string) => getKeyName('resturants', id);
export const reviewKeyById = (id: string) => getKeyName('reviews', id);
export const reviewDetailsKeyById = (id: string) => getKeyName('review_details', id);
export const cuisinesKey = getKeyName('cuisines');
export const cuisineKey = (name: string) => getKeyName('cuisine', name);
export const resturantCuisineKeyById = (id: string) => getKeyName('resturant_cuisines', id);
export const resturantsByRatingKey = getKeyName("resturants_by_rating");
export const weatherKeyById = (id: string) => getKeyName('weather', id);
export const resturantDetailsKeyById = (id: string) => getKeyName('resturant_details', id);
export const indexKey = getKeyName("idx", "resturants");
export const bloomKey = getKeyName("bloom_resturants")