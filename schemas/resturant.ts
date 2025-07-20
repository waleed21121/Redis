import { z } from 'zod';

export const ResturantSchema = z.object({
    name: z.string().min(1),
    location: z.string().min(1),
    cuisines: z.array(z.string().min(1))
});

export const ResturantDetailsSchema = z.object({
    links: z.array(z.object({
        name: z.string().min(1),
        url: z.string().min(1)
    })),
    contact: z.object({
        phone: z.string().min(1),
        email: z.string().email()
    })
});

export type Resturant = z.infer<typeof ResturantSchema>;
export type ResturantDetails = z.infer<typeof ResturantDetailsSchema>;