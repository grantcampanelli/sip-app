import React, { useEffect, useState } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react'

interface Bottle {
    id:          String
    wineId :      String
    size    :     String
    price  :      String
    purchaseDate: Date
    drinkDate :   Date
    notes   :     String
    userId :      String
}

const BottlePage: React.FC = () => {
    const [bottles, setBottles] = useState<Bottle[]>([]);

    useEffect(() => {
        // Fetch the bottle data from the table using an API call or any other method
        // and update the 'bottles' state with the fetched data
        const fetchBottles = async () => {
            try {
                const response = await fetch('/api/bottles');
                const data = await response.json();
                setBottles(data);
                console.log("fetched the bottles from the bottles page");
            } catch (error) {
                console.error('Failed to fetch bottles:', error);
            }
        };

        fetchBottles();
    }, []);

    return (
        <div className="bottle-page">
            <h1>Bottle Page</h1>
            <ul className="bottle-list">
                {bottles.map((bottle) => (
                    <li key={bottle.id as Key} className="bottle-item">
                        <p>Price: {bottle.price}</p>
                        <p>Size: {bottle.size} </p>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default BottlePage;