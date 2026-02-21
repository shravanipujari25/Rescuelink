import React from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import toast from 'react-hot-toast';

function ReloadPrompt() {
    const {
        offlineReady: [offlineReady, setOfflineReady],
        needRefresh: [needRefresh, setNeedRefresh],
        updateServiceWorker,
    } = useRegisterSW({
        onRegistered(r) {
            console.log('SW Registered: ' + r);
        },
        onRegisterError(error) {
            console.error('SW registration error', error);
        },
    });

    const close = () => {
        setOfflineReady(false);
        setNeedRefresh(false);
    };

    React.useEffect(() => {
        if (offlineReady) {
            toast.success('App ready to work offline', {
                position: 'bottom-right',
            });
        }
    }, [offlineReady]);

    React.useEffect(() => {
        if (needRefresh) {
            toast.custom((t) => (
                <div
                    className={`${t.visible ? 'animate-enter' : 'animate-leave'
                        } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
                >
                    <div className="flex-1 w-0 p-4">
                        <div className="flex items-start">
                            <div className="ml-3 flex-1">
                                <p className="text-sm font-medium text-gray-900">
                                    New version available!
                                </p>
                                <p className="mt-1 text-sm text-gray-500">
                                    Click reload to update the app.
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="flex border-l border-gray-200">
                        <button
                            onClick={() => updateServiceWorker(true)}
                            className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-red-600 hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                        >
                            Reload
                        </button>
                        <button
                            onClick={() => close()}
                            className="w-full border border-transparent rounded-none p-4 flex items-center justify-center text-sm font-medium text-gray-600 hover:text-gray-500 focus:outline-none"
                        >
                            Close
                        </button>
                    </div>
                </div>
            ), {
                duration: Infinity,
                position: 'bottom-right',
            });
        }
    }, [needRefresh, updateServiceWorker]);

    return null;
}

export default ReloadPrompt;
