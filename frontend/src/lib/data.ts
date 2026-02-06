
export interface Provider {
    id: string;
    name: string;
    images: string[];
    verified: boolean;
    location: string;
    rating: number;
    reviews: number;
    description: string;
    categories: string[];
    contact: {
        phone: string;
        email: string;
        website: string;
    };
    social: {
        instagram: string;
        facebook: string;
    };
}

export const services: any[] = [];
export const providers: Provider[] = [];
