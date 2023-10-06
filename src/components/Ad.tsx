import { useSession } from 'next-auth/react';
import { useQuery } from '@tanstack/react-query';
import { Adsense } from '@ctrl/react-adsense';

const Ad: React.FC = () => {
    const { data: session } = useSession();

    const fetchAdsVisibility = async () => {
        const response = await fetch(`/api/user/ads/?username=${encodeURIComponent(session?.user?.email as string)}`);
        if (!response.ok) throw new Error("Failed to fetch ads visibility status");
        return response.json();
    };

    const { data: adsVisibilityData, isLoading } = useQuery(['adsVisibility'], fetchAdsVisibility);

    const showAds = adsVisibilityData ? !adsVisibilityData.disableAds : true;

    if (isLoading) return <p></p>;

    return (
        <>
            {showAds ?
                <div className="mx-2 h-[200px] ">
                    <>
                        <Adsense
                            client="ca-pub-2371684572387469"
                            slot="3404345466"
                            style={{ display: 'block' }}
                            layout="in-article"
                            format="fluid"
                        />
                    </></div> : ""}
        </>

    );
}

export default Ad;
