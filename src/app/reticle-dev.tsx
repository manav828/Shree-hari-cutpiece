'use client';

import { useEffect } from 'react';

/**
 * Dev-only hook to initialize Reticle runtime perception.
 */
export function ReticleDev() {
    useEffect(() => {
        if (process.env.NODE_ENV !== 'development') return;

        // Dynamically load Reticle SDK in development only
        void import('@reticlehq/react').then(({ reticle, install, registerCapabilities }) => {
            install(); // Installs console interception and error tracking
            reticle.connect(); // Connects to the local daemon bridge

            // Register application capabilities for the AI agent to drive
            registerCapabilities({
                testids: [
                    'cart-button', 
                    'place-order-btn', 
                    'shipping-form', 
                    'use-last-address-btn'
                ],
                signals: ['auth:login', 'order:success', 'cart:clear'],
                stores: []
            });
        });
    }, []);

    return null;
}
