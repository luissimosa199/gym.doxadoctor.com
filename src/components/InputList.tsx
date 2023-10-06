import { InputItem } from "@/types";
import { fetchCategories } from "@/utils/getCategories";
import { isYtUrl } from "@/utils/isYtUrl";
import { faYoutube } from "@fortawesome/free-brands-svg-icons";
import { faGreaterThan, faLink, faX } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Dispatch, FunctionComponent, SetStateAction, useEffect, useRef, useState } from "react";

interface BaseInputListProps {
    placeholder?: string;
    type: 'tag' | 'link';
}

interface TagProps extends BaseInputListProps {
    type: 'tag';
    inputList: string[];
    setInputList: Dispatch<SetStateAction<string[]>>;
}

interface LinkProps extends BaseInputListProps {
    type: 'link';
    inputList: InputItem[];
    setInputList: Dispatch<SetStateAction<InputItem[]>>;
}

type InputListProps = TagProps | LinkProps;

const InputList: FunctionComponent<InputListProps> = ({ inputList, setInputList, placeholder, type }) => {
    const [inputText, setInputText] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);

    useEffect(() => {
        if (type === 'tag') {
            (async () => {
                const response = await fetchCategories();
                setSuggestions(response);
            })();
        }
    }, [type]);

    const handleCaptionChange = (idx: number, caption: string) => {
        if (type === 'link') {
            const newList = [...inputList] as InputItem[];
            newList[idx] = { ...newList[idx], caption: caption };
            setInputList(newList as any);
        }
    };

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setInputText(event.target.value);
        setHighlightedIndex(null);
    };

    const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {

        const filteredSuggestions = suggestions.filter(e => e.startsWith(inputText));

        if (event.key === "Enter") {
            if (highlightedIndex !== null && highlightedIndex < filteredSuggestions.length) {
                event.preventDefault(); // Prevent any default form action
                addInput(filteredSuggestions[highlightedIndex]);
            } else {
                addInput();
            }
        } else if (event.key === "ArrowDown") {
            event.preventDefault(); // Prevent default scroll behavior
            setHighlightedIndex(prevIndex =>
                prevIndex === null || prevIndex >= filteredSuggestions.length - 1
                    ? 0
                    : prevIndex + 1
            );
        } else if (event.key === "ArrowUp") {
            event.preventDefault();
            setHighlightedIndex(prevIndex =>
                prevIndex === null || prevIndex <= 0
                    ? filteredSuggestions.length - 1
                    : prevIndex - 1
            );
        }
    };

    const addInput = (valueToAdd?: string) => {

        const trimmedValue = (valueToAdd || inputText).trim();
        const inputValue = type === 'tag' ? trimmedValue.toLocaleLowerCase() : trimmedValue;

        if (type === 'tag') {
            if ((inputList as string[]).includes(inputValue)) {
                setInputText("");
                return;
            }
            if (inputValue !== "") {
                setInputList(prevInputs => [...(prevInputs as string[]), inputValue]);
                setInputText("");
            }
        } else if (type === 'link') {
            if ((inputList as InputItem[]).some(item => item.value === inputValue)) {
                setInputText("");
                return;
            }
            if (inputValue !== "") {
                setInputList(prevInputs => [...(prevInputs as InputItem[]), { value: inputValue }]);
                setInputText("");
            }

            if (inputRef.current) {
                inputRef.current.focus();
            }
        }
    };

    const renderTagItems = () => (
        (inputList as string[]).map((item, idx) => (
            <li key={idx} className="bg-white border rounded-md p-2 mb-2 w-full md:w-[30%] relative">
                <div className="flex justify-between items-start">
                    <span className="text-blue-600 font-medium">{item}</span>
                    <button
                        className="text-xs bg-red-500 font-bold w-5 h-5 rounded-full text-white absolute top-2 right-2"
                        onClick={(event) => {
                            event.preventDefault();
                            if (type === 'tag') {
                                setInputList((prevList: string[]) => prevList.filter(input => input !== item));
                            } else {
                                setInputList((prevList: InputItem[]) => prevList.filter(input => input.value !== (item as unknown as InputItem).value));
                            }

                        }}
                    >
                        <FontAwesomeIcon icon={faX} />
                    </button>
                </div>
            </li>
        ))
    );

    const renderLinkItems = () => (
        (inputList as InputItem[]).map((item, idx) => {
            const { value, caption } = item

            return (
                <li key={idx} className="bg-white border rounded-md p-2 mb-2 w-full relative">
                    <div className="flex justify-between items-start">
                        <div>
                            {isYtUrl(value) ? <FontAwesomeIcon icon={faYoutube} color="red" /> : <FontAwesomeIcon icon={faLink} />}
                            <span className={`text-${isYtUrl(value) ? "red" : "blue"}-600 font-medium ml-2`}>{value}</span>
                        </div>
                        <button
                            className="text-xs bg-red-500 font-bold w-5 h-5 rounded-full text-white absolute top-2 right-2"
                            onClick={(event) => {
                                event.preventDefault();
                                if (type === 'link') {
                                    setInputList((prevList: InputItem[]) => prevList.filter(input => input.value !== (item as unknown as InputItem).value));
                                }
                            }}
                        >
                            <FontAwesomeIcon icon={faX} />
                        </button>
                    </div>
                    <input
                        type="text"
                        value={item.caption || ''}
                        onChange={(e) => handleCaptionChange(idx, e.target.value)}
                        placeholder="Agrega un comentario"
                        className="mt-2 border rounded px-2 py-1 w-full placeholder:text-sm"
                    />
                </li>
            )
        })
    );

    return (
        <div className="flex flex-col gap-2 relative">
            <div className="relative">
                <div className="relative z-10">
                    <input
                        ref={inputRef}
                        type="text"
                        value={inputText}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyPress}
                        placeholder={placeholder}
                        className="border rounded px-3 py-2 w-full mb-2"
                        autoCapitalize="none"
                        autoCorrect="off"
                        autoComplete="off"
                    />
                    <button onClick={(event) => {
                        event.preventDefault();
                        addInput();
                        if (inputRef.current) inputRef.current.focus();
                    }} className="absolute right-2 top-2 text-lg font-bold rounded-full shadow w-6 h-6 leading-4 text-blue-500 border border-blue-500 bg-white hover:bg-blue-200 hover:text-blue-700">
                        <FontAwesomeIcon icon={faGreaterThan} />
                    </button>
                </div>
                {type === 'tag' && suggestions.length > 0 && inputText.length > 0 && (
                    <ul className="absolute bg-white border rounded-md w-full max-h-[200px] overflow-y-auto mt-2 z-50">
                        {suggestions.filter(e => e.startsWith(inputText)).map((suggestion, idx) => (
                            <li
                                key={idx}
                                className={`cursor-pointer px-3 py-2 ${highlightedIndex === idx ? 'bg-gray-200' : ''} hover:bg-gray-200`}
                                onClick={() => {
                                    addInput(suggestion);
                                }}
                            >
                                {suggestion}
                            </li>
                        ))}
                    </ul>
                )}

            </div>
            <ul className="flex flex-wrap gap-2 md:justify-between">
                {type === 'tag' ? renderTagItems() : renderLinkItems()}
            </ul>
        </div>
    );
};

export default InputList;
