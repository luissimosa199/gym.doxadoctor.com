import React from 'react';
import { useSession } from 'next-auth/react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

const AdsSwitch: React.FC = () => {

    const { data: session } = useSession();
    const queryClient = useQueryClient();

    const fetchAdsVisibility = async () => {
        const response = await fetch(`/api/user/ads/?username=${encodeURIComponent(session?.user?.email as string)}`);
        if (!response.ok) throw new Error("Failed to fetch ads visibility status");
        return response.json();
    };

    const { data: adsVisibilityData, isLoading } = useQuery(['adsVisibility'], fetchAdsVisibility);

    const showAds = adsVisibilityData ? !adsVisibilityData.disableAds : true;

    const toggleAdsVisibilityMutation = useMutation(async (shouldShowAds: boolean) => {
        const response = await fetch(`/api/user/ads/?username=${encodeURIComponent(session?.user?.email as string)}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ disableAds: !shouldShowAds })
        });

        if (!response.ok) {
            throw new Error(`Failed to update with status: ${response.status}`);
        }

        return response.json();
    }, {
        onSuccess: () => {
            queryClient.invalidateQueries(['adsVisibility']); // Refetch after successful mutation
        }
    });

    const toggleAdsVisibility = () => {
        const desiredState = !showAds;
        toggleAdsVisibilityMutation.mutate(desiredState);
    };

    if (isLoading) return <p>Loading...</p>;

    return (
        <div className="mt-3 flex items-center">
            <label htmlFor="adSwitch" className="flex flex-col items-center gap-2 mr-4 text-lg cursor-pointer">{showAds ? 'Anuncios activados' : 'Anuncios desactivados'}
                <div className="relative">
                    <input
                        type="checkbox"
                        id="adSwitch"
                        checked={showAds}
                        onChange={toggleAdsVisibility}
                        disabled={toggleAdsVisibilityMutation.isLoading}
                        className="sr-only"
                    />
                    <div className={`block ${showAds ? "bg-blue-500" : "bg-gray-600"} w-14 h-8 rounded-full transition-all`}></div>
                    <div className={`absolute top-1 left-1 bg-white w-6 h-6 rounded-full transition-transform ${showAds ? 'transform translate-x-full' : ''}`}></div>
                </div>
            </label>
        </div >
    );
}

export default AdsSwitch;
