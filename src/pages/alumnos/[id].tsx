import dbConnect from "@/db/dbConnect";
import { StudentModel } from "@/db/models";
import React, { ChangeEvent, FunctionComponent, useState } from "react";
import { GetServerSidePropsContext } from "next";
import UserPhotos from "@/components/UserPhotos";
import {
  faArrowLeft,
  faEnvelope,
  faPhone,
  faPlus,
  faUser,
  faX,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import Image from "next/image";
import PhotoInput from "@/components/PhotoInput";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { handleFileAdding, uploadImages } from "@/utils/formHelpers";
import PrimaryForm from "@/components/PrimaryForm";
import StudentTimelines from "@/components/StudentTimelines";
import ProfilePicture from "@/components/ProfilePicture";
import mongoose from "mongoose";

interface StudentePageProps {
  studentData?: {
    _id: string;
    name: string;
    email: string;
    tlf: string;
    details: string;
    image: string;
  };
}

const Student: FunctionComponent<StudentePageProps> = ({ studentData }) => {
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [newImages, setNewImages] = useState<string[]>([]);
  const [imageUploadPromise, setImageUploadPromise] =
    useState<Promise<any> | null>(null);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [addNewTimeline, setAddNewTimeline] = useState<boolean>(false);

  const queryClient = useQueryClient();

  const uploadPhotosMutation = useMutation(
    (photos: string[]) => uploadUserPhotos(photos, studentData?._id as string),
    {
      onMutate: (newPhotos: string[]) => {
        const previousData = queryClient.getQueryData<string[]>([
          "studentPhotos",
          studentData?._id,
        ]);
        queryClient.setQueryData<string[]>(
          ["studentPhotos", studentData?._id],
          (oldData = []) => {
            return [...oldData, ...newPhotos];
          }
        );
        return { previousData };
      },
      onSuccess: () => {
        setNewImages([]);
        setUploadedImages([]);
        setImageUploadPromise(null);
      },
      onError: (_: any, __: any, context: any) => {
        queryClient.setQueryData(
          ["studentPhotos", studentData?._id],
          context.previousData
        );
      },
    }
  );

  const uploadUserPhotos = async (photos: string[], userId: string) => {
    const response = await fetch(`/api/alumnos/photos/?userId=${userId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ photos }),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || "Something went wrong");
    }

    return response.json();
  };

  const handleChangeAvatar = async (event: ChangeEvent<HTMLInputElement>) => {
    event.stopPropagation();

    queryClient.cancelQueries([studentData?._id, "profilePicture"]);
    try {
      const file = event.target.files?.[0];
      if (!file) return;

      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = function () {
          resolve(reader.result as string);
        };
        reader.onerror = function () {
          reject(new Error("Failed to read the file"));
        };
        reader.readAsDataURL(file);
      });
      queryClient.setQueryData([studentData?._id, "profilePicture"], {
        image: dataUrl,
      });
      const avatarArr = await uploadImages(event);
      const avatarUrl = avatarArr![0];

      const response = await fetch(
        `/api/alumnos/avatar/?userId=${encodeURIComponent(
          studentData?._id as string
        )}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ image: avatarUrl }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(
          data.error || `Server responded with ${response.status}`
        );
      }

      return;
    } catch (error) {
      console.error("Error updating avatar:", error);
    }
  };

  const handleUploadImages = async (event: ChangeEvent<HTMLInputElement>) => {
    event.stopPropagation();
    await handleFileAdding(event, setNewImages);

    setIsUploading(true);

    try {
      const urls = (await uploadImages(event)) as string[];
      setImageUploadPromise(Promise.resolve(urls));
      setUploadedImages((prevUrls) => [...prevUrls, ...urls]);
    } catch (error) {
      console.error("Error uploading images:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async () => {
    queryClient.cancelQueries(["studentPhotos", studentData?._id]);

    const uploadedUrls = await imageUploadPromise;
    if (uploadedUrls && uploadedUrls.length) {
      uploadPhotosMutation.mutate(uploadedUrls);
    }
  };

  const handleDeleteImage =
    (index: number) =>
    (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      event.preventDefault();
      const newUploadedImages = uploadedImages.filter(
        (_, photoIndex) => photoIndex !== index
      );
      setUploadedImages(newUploadedImages);
      const updatedNewImages = newImages.filter(
        (_, imgIndex) => imgIndex !== index
      );
      setNewImages(updatedNewImages);
    };

  return (
    <div className="py-8 md:p-8 bg-gray-50 space-y-12">
      <div className="flex gap-2 ml-2 items-center">
        <Link
          href="/alumnos"
          className="w-4 h-4"
        >
          <FontAwesomeIcon icon={faArrowLeft} />
        </Link>
        <h1 className="text-4xl font-bold text-gray-800 border-b-2 pb-3">
          {studentData?.name}
        </h1>
      </div>
      <div className="max-w-[850px] mx-auto">
        <div className="flex flex-col justify-around items-center border rounded-lg py-6 md:p-6 bg-white shadow-lg">
          <div className="flex flex-col items-center lg:flex-row gap-2">
            <div className="min-h-[128px] flex flex-col items-center relative">
              <ProfilePicture
                h="h-[150px]"
                w="w-[150px]"
                type="alumnos"
                userId={studentData?._id as string}
              />
              <div className="border-2 absolute bottom-0 left-0 bg-white h-12 w-12 rounded-full overflow-hidden flex justify-center">
                <PhotoInput
                  handleUploadImages={handleChangeAvatar}
                  variant="small"
                  id="profilepicture"
                />
              </div>
            </div>

            <div className="flex flex-col space-y-4 my-6">
              <div className="flex items-center space-x-4">
                <FontAwesomeIcon
                  icon={faUser}
                  className="w-6 h-6 text-gray-600"
                />
                <p className="text-lg text-gray-800">{studentData?.details}</p>
              </div>
              <div className="flex items-center space-x-4">
                <FontAwesomeIcon
                  icon={faPhone}
                  className="w-6 h-6 text-gray-600"
                />
                <p className="text-lg text-gray-800">{studentData?.tlf}</p>
              </div>
              <div className="flex items-center space-x-4">
                <FontAwesomeIcon
                  icon={faEnvelope}
                  className="w-6 h-6 text-gray-600"
                />
                <p className="text-lg text-gray-800">{studentData?.email}</p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-2xl mt-2 font-semibold text-gray-800 border-b-2 pb-3">
              Fotos:
            </h2>
            <UserPhotos
              userId={studentData?._id as string}
              queryKey={["studentPhotos", studentData?._id as string]}
            />
            <div className="w-24 mx-auto">
              <PhotoInput
                handleUploadImages={handleUploadImages}
                id="studentphotos"
                variant="small"
              />
            </div>
            <div className="mt-4 space-y-4">
              {newImages &&
                newImages.map((e: string, index: number) => {
                  const isVideo = e.includes("data:video/mp4");
                  return (
                    <div
                      key={index}
                      className="flex items-center gap-2 bg-gray-100 p-4 rounded-md"
                    >
                      <button
                        onClick={handleDeleteImage(index)}
                        className="bg-red-500 text-white p-2 w-8 h-8 rounded-full hover:bg-red-600 flex justify-center items-center transition duration-300"
                      >
                        <FontAwesomeIcon
                          className="w-8"
                          icon={faX}
                        />
                      </button>
                      {isVideo ? (
                        <video
                          controls
                          width="200"
                          height="200"
                          className="rounded mx-auto"
                        >
                          <source
                            src={e}
                            type="video/mp4"
                          />
                          Your browser does not support the video tag.
                        </video>
                      ) : (
                        <Image
                          src={e}
                          alt=""
                          width={200}
                          height={200}
                        />
                      )}
                    </div>
                  );
                })}
            </div>
            {newImages.length > 0 && (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isUploading}
                className="mt-4 py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-300"
              >
                {isUploading ? "Subiendo..." : "Subir"}
              </button>
            )}
          </div>

          <div className="w-full">
            <div className="mt-2 border-b-2 pb-3">
              <div className="flex justify-between px-2 md:px-0">
                <h2 className="text-2xl font-semibold text-gray-800 ">
                  Historias:
                </h2>
                <button
                  className={`border-2 w-10 rounded p-2 ${
                    addNewTimeline ? "bg-gray-200" : "bg-white"
                  } text-slate-600 transition`}
                  onClick={(e) => {
                    e.preventDefault();
                    setAddNewTimeline(!addNewTimeline);
                  }}
                >
                  <FontAwesomeIcon icon={faPlus} />
                </button>
              </div>
              {addNewTimeline && (
                <PrimaryForm
                  studentData={{
                    studentId: studentData?._id as string,
                    studentName: studentData?.name as string,
                  }}
                />
              )}
            </div>
            <div>
              <StudentTimelines userId={studentData?._id as string} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Student;

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  try {
    await dbConnect();

    const { id } = context.query;

    let queryId;
    if (mongoose.Types.ObjectId.isValid(id as string)) {
      queryId = new mongoose.Types.ObjectId(id as string);
    } else {
      queryId = id as string;
    }

    const student = await StudentModel.findOne({ _id: queryId })
      .select("name email tlf details image _id")
      .lean();

    if (student) {
      const studentData = {
        _id: student._id.toString(),
        name: student.name,
        email: student.email,
        tlf: student.tlf,
        details: student.details,
        image: student.image || "",
        photos: student.photos || [],
      };
      return {
        props: {
          studentData,
        },
      };
    }

    throw new Error("error");
  } catch (error) {
    console.error(error);
    return {
      notFound: true,
    };
  }
};
