'use client';

import { useEffect } from 'react';

/**
 * Dev-only hook to initialize Reticle runtime perception.
 */
export function ReticleDev() {
    useEffect(() => {
        if (process.env.NODE_ENV !== 'development') return;

        // Suppress scary Dev Overlays for stolen Web Locks (normal tab switching/refresh behavior)
        const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
            const reason = event.reason;
            if (reason && (reason.name === 'AbortError' || (reason.message && reason.message.includes('steal')))) {
                event.preventDefault();
                console.warn('[Reticle] Connection moved to another tab (lock stolen).');
            }
        };

        const handleError = (event: ErrorEvent) => {
            const error = event.error;
            if (error && (error.name === 'AbortError' || (error.message && error.message.includes('steal')))) {
                event.preventDefault();
                console.warn('[Reticle] Connection moved to another tab (lock stolen).');
            }
        };

        window.addEventListener('unhandledrejection', handleUnhandledRejection);
        window.addEventListener('error', handleError);

        // Dynamically load Reticle SDK in development only
        void import('@reticlehq/react').then(({ reticle, install, registerCapabilities }) => {
            install(); // Installs console interception and error tracking
            reticle.connect({ token: process.env.NEXT_PUBLIC_RETICLE_TOKEN }); // Connects to the local daemon bridge

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

        return () => {
            window.removeEventListener('unhandledrejection', handleUnhandledRejection);
            window.removeEventListener('error', handleError);
        };
    }, []);

    return null;
}

