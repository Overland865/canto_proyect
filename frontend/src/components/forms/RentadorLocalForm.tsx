// RentadorLocalForm Component

import React from 'react';

const RentadorLocalForm = () => {
    return (
        <form>
            <h2>Rentador de Local Service Form</h2>
            <label>
                Location:
                <input type="text" name="location" />
            </label>
            <label>
                Rental Price:
                <input type="number" name="rentalPrice" />
            </label>
            <button type="submit">Submit</button>
        </form>
    );
};

export default RentadorLocalForm;