import { TimeLineEntryData } from "@/types";
import { FunctionComponent } from "react";

interface HeadMetaTagsProps {
    timeline?: TimeLineEntryData[];
    timelineName: string;
    timeLineUrl: string;
    message?: string;
    siteName: string;
}

const HeadMetaTags: FunctionComponent<HeadMetaTagsProps> = ({ timeline, timelineName, timeLineUrl, message, siteName }) => {

    return (
        <>
            {timeline && timeline?.length > 0 && <meta property="og:image" itemProp="image" content={timeline[0].url} />}
            {timeline && timeline?.length > 0 && <meta name="twitter:image" content={timeline[0].url} />}

            <meta property="og:url" content={`${timeLineUrl}`} />
            <meta property="og:title" content={`${timelineName}`} />
            <meta name="twitter:title" content={`${timelineName}`} />
            <meta property="og:description" content={`${message}`} />
            <meta name="twitter:description" content={`${message}`} />
            <meta property="og:type" content="website" />
            <meta property="og:image:type" content="image/jpeg" />
            <meta property="og:site_name" content={siteName} />
        </>
    )
}

export default HeadMetaTags;