// ServiceFormLoader Component

import React from 'react';
import { BanqueteroForm } from './BanqueteroForm';
import RentadorLocalForm from './RentadorLocalForm';

const ServiceFormLoader = ({ category }: { category: string }) => {
    switch (category) {
        case 'Banquetero':
            return <BanqueteroForm />;
        case 'Rentador de Local':
            return <RentadorLocalForm />;
        default:
            return <div>No form available for this category.</div>;
    }
};

export default ServiceFormLoader;