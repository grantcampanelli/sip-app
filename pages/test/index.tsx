import React, { useState, useEffect } from 'react';
import { SplitFactoryProvider, useSplitClient } from '@splitsoftware/splitio-react';
import splitConfig, { ff_back_button } from '../../splitio-config';

const Page = () => {
    const { client: splitClient, isReady } = useSplitClient();
    const [isFeatureActive, setIsFeatureActive] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (isReady && splitClient) {
            const treatment = splitClient.getTreatment(ff_back_button);
            setIsFeatureActive(treatment === 'on');
            setIsLoading(false); // Set loading to false once the flag is loaded
        }
    }, [splitClient, isReady]);

    if (isLoading) {
        return <div>Loading...</div>; // Loading message
    }

    return (
        <main>
            {isFeatureActive ? (
                <div>Feature flag {ff_back_button} is on</div>
            ) : (
                <div>Feature flag {ff_back_button} is off</div>
            )}
            {/* Rest of your content */}
        </main>
    );
};

export default function Home() {
    return (
        <SplitFactoryProvider config={splitConfig}>
            <Page />
        </SplitFactoryProvider>
    );
}