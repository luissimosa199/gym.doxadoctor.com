import React, { Dispatch, SetStateAction } from "react";

const StudentsFilters = ({
  tags,
  setSelectedTags,
}: {
  tags: string[];
  setSelectedTags: Dispatch<SetStateAction<string[]>>;
}) => {
  return (
    <div className="my-4 xl:absolute xl:left-8 xl:shadow-md 2xl:p-8 2xl:left-16 bg-white p-4 rounded-lg ">
      <h3 className="font-semibold text-lg mb-4 text-gray-700">
        Filtrar por categoría
      </h3>
      {tags.map((tag) => (
        <div
          key={tag}
          className="flex items-center mb-2"
        >
          <input
            type="checkbox"
            id={tag}
            value={tag}
            className="form-checkbox h-5 w-5 text-blue-600 rounded"
            onChange={(e) => {
              if (e.target.checked) {
                setSelectedTags((prev: string[]) => [...prev, e.target.value]);
              } else {
                setSelectedTags((prev: string[]) =>
                  prev.filter((t) => t !== e.target.value)
                );
              }
            }}
          />
          <label
            htmlFor={tag}
            className="ml-2 text-gray-600"
          >
            {tag}
          </label>
        </div>
      ))}
    </div>
  );
};

export default StudentsFilters;
