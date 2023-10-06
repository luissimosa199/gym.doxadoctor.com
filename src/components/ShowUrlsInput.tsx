import { faLink } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Dispatch, FunctionComponent, SetStateAction } from 'react'

interface ShowUrlsInputProps {
    setState: Dispatch<SetStateAction<boolean>>,
    state: boolean
}

const ShowUrlsInput:FunctionComponent<ShowUrlsInputProps> = ({ setState, state }) => {

    const handleShowUrlsInput = () => {
        setState(!state)
    }

    return (
        <button
            type="button"
            className={`relative w-1/3 flex flex-col items-center justify-center p-4 border rounded hover:bg-gray-200 cursor-pointer ${state && "bg-blue-200" }`}
            onClick={handleShowUrlsInput}
        >
            <i className="mb-2 text-lg text-gray-500">
                <FontAwesomeIcon icon={faLink} />
            </i>
            <span className="mb-2 text-lg font-semibold">URL</span>
            <span className="text-gray-500">Agrega un Link</span>
        </button>
    )
}

export default ShowUrlsInput