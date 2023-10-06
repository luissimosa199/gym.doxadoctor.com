import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWhatsapp, faFacebook, faTwitter, faLinkedin, faPinterest, faReddit, faTelegram } from '@fortawesome/free-brands-svg-icons';

import { FunctionComponent, useState } from "react";
import { faCopy } from '@fortawesome/free-solid-svg-icons';

interface ShareButtonsProps {
    url: string
    title: string
}


const ShareButtons: FunctionComponent<ShareButtonsProps> = ({ url, title }) => {

    const [copySuccess, setCopySuccess] = useState<boolean>(false)

    const encodedUrl = encodeURIComponent(url);
    const encodedTitle = encodeURIComponent(title);

    const shareLinks = [
        { platform: 'WhatsApp', url: `https://wa.me/?text=${encodedUrl}%20${encodedTitle}`, icon: faWhatsapp, color: '#25D366' },
        { platform: 'Facebook', url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, icon: faFacebook, color: '#3b5998' },
        { platform: 'Twitter', url: `https://twitter.com/share?url=${encodedUrl}&text=${encodedTitle}`, icon: faTwitter, color: '#1DA1F2' },
        { platform: 'LinkedIn', url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`, icon: faLinkedin, color: '#0077b5' },
        { platform: 'Pinterest', url: `https://pinterest.com/pin/create/button/?url=${encodedUrl}&media=&description=${encodedTitle}`, icon: faPinterest, color: '#BD081C' },
        { platform: 'Reddit', url: `https://reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`, icon: faReddit, color: '#FF5700' },
        { platform: 'Telegram', url: `https://telegram.me/share/url?url=${encodedUrl}&text=${encodedTitle}`, icon: faTelegram, color: '#0088cc' },
        { platform: 'Email', url: `mailto:?subject=${encodedTitle}&body=${encodedUrl}`, icon: faTelegram, color: '#D44638' },

        // Add other share platforms here
    ];


    return (
        <ul className="flex gap-2 px-2 justify-center">
            {shareLinks.map((shareLink, index) => (
                <li key={index} className="w-5 h-5">
                    <a href={shareLink.url} target="_blank" rel="noopener noreferrer" >
                        <FontAwesomeIcon icon={shareLink.icon} style={{ color: shareLink.color }} />
                    </a>
                </li>
            ))}
            <div>

                <button
                    type="button"
                    className="w-5"
                    onClick={() => {
                        navigator.clipboard.writeText(url);
                        setCopySuccess(true)
                        setTimeout(() => {
                            setCopySuccess(false)
                        }, 1000);
                    }}
                >
                    <FontAwesomeIcon icon={faCopy} className='text-slate-500' />
                </button>
                {copySuccess && <span className={`ml-2 text-xs`}>Copiado!</span>}
            </div>
        </ul>
    )
}

export default ShareButtons;