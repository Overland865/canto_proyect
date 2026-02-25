// BanqueteroForm Component

import React from 'react';

const BanqueteroForm = () => {
    return (
        <form>
            <h2>Banquetero Service Form</h2>
            <label>
                Menu Options:
                <input type="text" name="menuOptions" />
            </label>
            <label>
                Capacity:
                <input type="number" name="capacity" />
            </label>
            <button type="submit">Submit</button>
        </form>
    );
};

export default BanqueteroForm;