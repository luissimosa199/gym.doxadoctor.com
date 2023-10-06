import { FunctionComponent } from "react";
import { TimeLineEntryProps } from "@/types";
import { CldImage } from 'next-cloudinary';

const TimeLineEntry: FunctionComponent<TimeLineEntryProps> = ({ data, idx, length }) => {

    const isVideo = data.url.includes("/dahu3rii0/video/upload/") && data.url.endsWith(".mp4") || data.url.includes("data:video/mp4");

    return (
        <div className="mt-4 w-fit mx-auto bg-white">
            <div className="w-full">
                {isVideo ? (
                    <video 
                        controls 
                        width="850" 
                        height="850" 
                        className="rounded mx-auto"
                    >
                        <source src={data.url} type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>
                ) : (
                    <CldImage
                        className="rounded mx-auto"
                        src={data.url}
                        alt={data.caption || 'image'}
                        width={850}
                        height={850}
                        priority={idx === 0}
                    />
                )}
            </div>
            <p className="text-lg text-gray-500 mt-2 ml-2">{data.caption}</p>
        </div>
    )
}

export default TimeLineEntry;
