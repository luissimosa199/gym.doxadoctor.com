import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import PhotoInput from "./PhotoInput"
import UserPhotos from "./UserPhotos"
import { faX } from "@fortawesome/free-solid-svg-icons"
import Image from 'next/image'
import { useSession } from "next-auth/react"
import { ChangeEvent, FunctionComponent, useState } from "react"
import { handleFileAdding, uploadImages } from "@/utils/formHelpers"
import { useMutation, useQueryClient } from "@tanstack/react-query"

const UserPhotoGallery: FunctionComponent = () => {

    const [newImages, setNewImages] = useState<string[]>([])
    const [imageUploadPromise, setImageUploadPromise] = useState<Promise<any> | null>(null);
    const [uploadedImages, setUploadedImages] = useState<string[]>([]);
    const [isUploading, setIsUploading] = useState<boolean>(false);

    const { data: session } = useSession()
    const queryClient = useQueryClient();

    const uploadPhotosMutation = useMutation((photos: string[]) => uploadUserPhotos(photos, session?.user?.email as string), {
        onMutate: (newPhotos: string[]) => {
            const previousData = queryClient.getQueryData<string[]>([session?.user?.email, 'userPhotos']);
            queryClient.setQueryData<string[]>([session?.user?.email, 'userPhotos',], (oldData = []) => {
                return [...oldData, ...newPhotos];
            });
            return { previousData };
        },
        onSuccess: () => {
            setNewImages([]);
            setUploadedImages([]);
            setImageUploadPromise(null)
        },
        onError: (_, __, context: any) => {
            queryClient.setQueryData(['userPhotos', session?.user?.email], context.previousData);
        }
    });

    const uploadUserPhotos = async (photos: string[], userEmail: string) => {
        const response = await fetch(`/api/user/photos/?username=${encodeURIComponent(userEmail)}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ photos })
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || 'Something went wrong');
        }

        return response.json();
    };

    const handleUploadImages = async (event: ChangeEvent<HTMLInputElement>) => {
        event.stopPropagation();
        await handleFileAdding(event, setNewImages);
        
        setIsUploading(true);
        
        try {
            const urls = await uploadImages(event) as string[];
            setImageUploadPromise(Promise.resolve(urls)); 
            setUploadedImages(prevUrls => [...prevUrls, ...urls]);
        } catch (error) {
            console.error("Error uploading images:", error);
        } finally {
            setIsUploading(false);
        }
    };
    
    const handleDeleteImage = (index: number) => (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        event.preventDefault();
        const newUploadedImages = uploadedImages.filter((_, photoIndex) => photoIndex !== index);
        setUploadedImages(newUploadedImages);
        const updatedNewImages = newImages.filter((_, imgIndex) => imgIndex !== index);
        setNewImages(updatedNewImages);
    };

    const handleSubmit = async () => {
        queryClient.cancelQueries([session?.user?.email, 'userPhotos'])

        const uploadedUrls = await imageUploadPromise;
        if (uploadedUrls && uploadedUrls.length) {
            uploadPhotosMutation.mutate(uploadedUrls);
        }
    };

    return (
        <div>
            <h2 className="text-2xl font-semibold mb-4 text-gray-700">Fotos</h2>
            <UserPhotos username={session!.user!.email as string} />
            <PhotoInput handleUploadImages={handleUploadImages} id="userphotos" variant="small" />

            <div className="mt-4 space-y-4">
                {newImages && newImages.map((e: string, index: number) => {
                    const isVideo = e.includes("data:video/mp4");
                    return (
                        <div key={index} className="flex items-center gap-4 bg-gray-100 p-4 rounded-md">
                            <button
                                onClick={handleDeleteImage(index)}
                                className="bg-red-500 text-white p-2 w-8 h-8 rounded-full hover:bg-red-600 flex justify-center items-center transition duration-300"
                            >
                                <FontAwesomeIcon icon={faX} />
                            </button>
                            {isVideo ? <video
                                controls
                                width="300"
                                height="300"
                                className="rounded mx-auto"
                            >
                                <source src={e} type="video/mp4" />
                                Your browser does not support the video tag.
                            </video> : <Image src={e} alt="" width={300} height={300} />}
                        </div>
                    )
                })}
            </div>
            <button
                type="button"
                onClick={handleSubmit}
                disabled={isUploading}
                className="mt-4 py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-300"
            >
                {isUploading ? 'Subiendo...' : 'Subir'}
            </button>
        </div>
    )
}

export default UserPhotoGallery