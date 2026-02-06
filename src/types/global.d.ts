export { };

declare global {
    interface Window {
        google: {
            accounts: {
                id: {
                    initialize: (config: any) => void;
                    renderButton: (parent: HTMLElement | null, options: any) => void;
                };
                oauth2: {
                    initTokenClient: (config: {
                        client_id: string;
                        scope: string;
                        callback: (response: any) => void;
                    }) => {
                        requestAccessToken: () => void;
                    };
                };
            };
        };
    }
}
