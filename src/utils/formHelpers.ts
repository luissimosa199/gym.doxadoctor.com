import { InputItem, TimelineFormInputs } from "@/types";
import { ChangeEvent, Dispatch, SetStateAction } from "react";
import Swal from "sweetalert2";
import { convertToJpeg } from "./convertToJpeg";
import { Session } from "next-auth";
import { v4 as uuidv4 } from "uuid";

const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET =
  process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

export const uploadImages = async (event: ChangeEvent<HTMLInputElement>) => {
  let urls = [];

  if (event.target.files) {
    const files = Array.from(event.target.files);

    urls = await Promise.all(
      files.map(async (e) => {
        let file = e;

        const pngRgx = /\/png$/;
        const isPng = pngRgx.test(file.type);

        if (isPng) {
          const convertedFile = await convertToJpeg(file);
          file = convertedFile as File;
        }

        // Upload to Cloudinary https://api.cloudinary.com/v1_1/demo/image/upload
        const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`;
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", "qxkzlm62");

        const response = await fetch(url, {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          const jsonResponse = await response.json();
          return jsonResponse.secure_url;
        } else {
          throw new Error("Upload failed");
        }
      })
    );

    return urls;
  }
};

export const handleFileChange = (
  event: ChangeEvent<HTMLInputElement>,
  setImages: Dispatch<SetStateAction<string[]>>,
  setPreviews: Dispatch<SetStateAction<string[]>>
) => {
  return new Promise<void>((resolve, reject) => {
    const files = event.target.files;

    if (files && files.length > 0) {
      const newPreviews: string[] = [];

      let processedFiles = 0;

      for (let i = 0; i < files.length; i++) {
        const reader = new FileReader();

        reader.onloadend = () => {
          const dataURL = reader.result as string;
          newPreviews.push(dataURL);
          processedFiles++;

          if (processedFiles === files.length) {
            setImages(newPreviews);
            setPreviews(newPreviews);
            resolve();
          }
        };

        reader.onerror = () => {
          reject(new Error("Failed to read file"));
        };

        reader.readAsDataURL(files[i]);
      }
    } else {
      setImages([]);
      resolve();
    }
  });
};

export const handleNewFileChange = (event: ChangeEvent<HTMLInputElement>) => {
  return new Promise<string[]>((resolve, reject) => {
    const files = event.target.files;
    const newPreviews: string[] = [];

    if (files && files.length > 0) {
      let processedFiles = 0;

      for (let i = 0; i < files.length; i++) {
        const reader = new FileReader();

        reader.onloadend = () => {
          const dataURL = reader.result as string;
          newPreviews.push(dataURL);
          processedFiles++;

          if (processedFiles === files.length) {
            resolve(newPreviews);
          }
        };

        reader.onerror = () => {
          reject(new Error("Failed to read file"));
        };

        reader.readAsDataURL(files[i]);
      }
    } else {
      resolve([]);
    }
  });
};

export const handleFileAdding = (
  event: ChangeEvent<HTMLInputElement>,
  setImages: Dispatch<SetStateAction<string[]>>
) => {
  return new Promise<void>((resolve, reject) => {
    const files = event.target.files;

    if (files && files.length > 0) {
      let newPreviews: string[] = [];

      let processedFiles = 0;

      for (let i = 0; i < files.length; i++) {
        const reader = new FileReader();

        reader.onloadend = () => {
          const dataURL = reader.result as string;
          newPreviews.push(dataURL);
          processedFiles++;

          if (processedFiles === files.length) {
            // Add the new previews to the existing images
            setImages((prevImages) => [...prevImages, ...newPreviews]);
            resolve();
          }
        };

        reader.onerror = () => {
          reject(new Error("Failed to read file"));
        };

        reader.readAsDataURL(files[i]);
      }
    } else {
      setImages([]);
      resolve();
    }
  });
};

export const handleCaptionChange = (
  event: ChangeEvent<HTMLInputElement>,
  idx: number,
  imagesCaption: { idx: number; value: string }[],
  setImagesCaptions: Dispatch<SetStateAction<{ idx: number; value: string }[]>>
) => {
  const updatedImages = imagesCaption.map((item, i) => {
    if (i === idx) {
      item.value = event.target.value;
    }
    return item;
  });

  const indexExists = imagesCaption.some((item) => item.idx === idx);
  if (!indexExists) {
    updatedImages.push({ idx, value: event.target.value });
  }
  setImagesCaptions(updatedImages);
};

export const handleDeleteImage = (
  event: React.MouseEvent<HTMLButtonElement>,
  currentIdx: number,
  setImages: Dispatch<SetStateAction<string[]>>,
  setPreviews: Dispatch<SetStateAction<string[]>>
) => {
  event.preventDefault();
  setImages((prevImages) => prevImages.filter((e, idx) => idx !== currentIdx));
  setPreviews((prevImages) =>
    prevImages.filter((e, idx) => idx !== currentIdx)
  );
};

export const sendData = async (
  data: Omit<TimelineFormInputs, "_id" | "createdAt">
) => {
  try {
    const response = await fetch("/api/timeline", {
      method: "POST",
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      Swal.fire({
        title: "Error",
        text: `Error ${response.statusText}`,
        icon: "error",
      });
    }

    return response;
  } catch (error) {
    Swal.fire({
      title: "Error",
      text: `Error ${error}`,
      icon: "error",
    });
    throw error;
  }
};

export const editData = async (
  data: Omit<TimelineFormInputs, "createdAt">,
  username?: string
) => {
  try {
    const response = await fetch(
      `/api/timeline/${data._id}${
        username ? "?username=" + encodeURIComponent(username as string) : ""
      }`,
      {
        method: "PUT",
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      Swal.fire({
        title: "Error",
        text: `Error ${response.statusText}`,
        icon: "error",
      });
    }

    return response;
  } catch (error) {
    Swal.fire({
      title: "Error",
      text: `Error ${error}`,
      icon: "error",
    });
    throw error;
  }
};

export const getCurrentDateTimeString = () => {
  const currentDate = new Date();

  const year = currentDate.getFullYear().toString().padStart(4, "0");
  const month = (currentDate.getMonth() + 1).toString().padStart(2, "0");
  const day = currentDate.getDate().toString().padStart(2, "0");
  const hours = currentDate.getHours().toString().padStart(2, "0");
  const minutes = currentDate.getMinutes().toString().padStart(2, "0");
  const seconds = currentDate.getSeconds().toString().padStart(2, "0");
  const milliseconds = currentDate
    .getMilliseconds()
    .toString()
    .padStart(3, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}Z`;
};

export const createPhotoData = (
  paths: string[],
  imagesCaption: { idx: number; value: string }[]
) => {
  return paths.map((path: string, photoIdx: number) => {
    const caption = imagesCaption.find((e) => e.idx === photoIdx)?.value;
    return {
      url: path,
      idx: photoIdx,
      caption: caption,
    };
  });
};

export const createDataObject = (
  data: { mainText?: string },
  photos: any[],
  tagsList: string[],
  linksList: InputItem[],
  session?: Session | null,
  studentData?: { studentName: string; studentId: string }
) => {
  return {
    mainText: data.mainText || "",
    photo: photos,
    length: photos.length,
    tags: tagsList,
    authorId: studentData
      ? studentData.studentId
      : session?.user?.email ?? "defaultId",
    authorName: studentData
      ? studentData.studentName
      : session?.user?.name ?? "defaultName",
    links: linksList,
  };
};

export function generateSlug(
  post: TimelineFormInputs,
  minLength: number = 10,
  maxLength: number = 50
): string {
  const components: string[] = [];

  const cleanWord = (word: string) => {
    return word.toLowerCase().replace(/[^\w]/g, "");
  };

  // If there's a mainText, add it.
  if (post.mainText) {
    components.push(...post.mainText.split(/\s+/).map(cleanWord));
  }

  // If the length after adding mainText is less than minimum OR there's no mainText, then consider tags.
  if (!post.mainText || components.join("-").length < minLength) {
    if (post.tags) {
      components.push(...post.tags.map(cleanWord));
    }
  }

  // If the length is still less than minimum after adding mainText and tags, add the author's name.
  if (components.join("-").length < minLength && post.authorName) {
    components.push(cleanWord(post.authorName));
  }

  // If the length is still under the minimum, add the date.
  if (components.join("-").length < minLength) {
    const today = new Date();
    const dateString = today.toISOString().split("T")[0]; // format: "yyyy-mm-dd"
    components.push(dateString);
  }

  // If after all these steps, the length is still under the minimum, append a partial UUID.
  if (components.join("-").length < minLength) {
    components.push(uuidv4().slice(0, 5));
  }

  // Construct the slug and limit length if necessary
  let slug = components.join("-");
  if (slug.length > maxLength) {
    slug = slug.slice(0, maxLength);
  }

  return slug;
}
