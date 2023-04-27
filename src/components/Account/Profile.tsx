import { ChangeEvent, useRef, useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import dayjs from "dayjs";
import { Tooltip } from "react-tooltip";
import { AiOutlineEdit } from "react-icons/ai";
import { GoVerified } from "react-icons/go";
import { BsFillCheckCircleFill } from "react-icons/bs";
import { MdCancel } from "react-icons/md";
import { CgSpinner } from "react-icons/cg";
import { User } from "../../redux/api";
import { imageResizer } from "../../utils/imgResizer";
import { useUpdateAvatarMutation } from "../../redux/accountApi";
import { setCurrentUser } from "../../redux/features/userSlice";
import { toast } from "react-toastify";

interface Props {
  currentUser: User;
};

const Profile = ({currentUser}: Props) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const dispatch = useDispatch();

  const {avatar, email, emailVerified, firstName, lastName, username, createdAt} = currentUser;

  const [imageData, setImageData] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [savingAvatar, setSavingAvatar] = useState(false);

  // Actualizar o eliminar el avatar
  const [updateAvatar] = useUpdateAvatarMutation();

  // Generar el preview de la imagen seleccionada
  useEffect(() => {
    if (imageData) {
      const url = URL.createObjectURL(imageData);
      setImagePreview(url)
    }
  }, [imageData]);

  /**
   * Seleccionar una imagen
   */
  const onImagePickHandler = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;

    if(files) {
      const file = files[0];
      const image = await imageResizer(file, "file") as File;
      setImageData(image);
    };

    // Limpiar el ref del input luego de seleccionar la imagen
    // para restablecer el evento change del input.
    if(fileInputRef.current) {
      fileInputRef.current.value = ""
    };
  };

  /**
   * Subir el nuevo avatar.
   */
  const updateAvatarHandler = async () => {
    if (!imageData) {
      return false;
    };

    try {
      setSavingAvatar(true);

      const formData = new FormData();
      formData.append("avatar", imageData);
      formData.append("operation", "update");

      const updatedUser = await updateAvatar({data: formData}).unwrap();

      dispatch(setCurrentUser(updatedUser));

      toast.success("Avatar updated successfully");
      
    } catch (error: any) {
      toast.error(`Error uploading avatar: ${error.message}`)
    } finally {
      setSavingAvatar(false);
      setImageData(null);
      setImagePreview(null);
    }
  };

  /**
   * Eliminar el avatar y restablecer el avatar por defecto.
   */
  const deleteAvatarHandler = async () => {
    try {
      setSavingAvatar(true);

      const formData = new FormData();
      formData.append("avatar", "");
      formData.append("operation", "delete");

      const updatedUser = await updateAvatar({data: formData}).unwrap();

      dispatch(setCurrentUser(updatedUser));

      toast.success("Avatar deleted successfully");
      
    } catch (error: any) {
      toast.error(`Error deleting avatar: ${error.message}`)
    } finally {
      setSavingAvatar(false);
    }
  };

  return (
    <section>
      <Tooltip id="verified-icon-tooltip" style={{zIndex: 1000}} />
      <Tooltip id="change-avatar-tooltip" style={{zIndex: 1000}} />
      <Tooltip id="discard-avatar-tooltip" style={{zIndex: 1000}} />
      <Tooltip id="delete-avatar-tooltip" style={{zIndex: 1000}} />

      {/* Input del selector del avatar */}
      <input
        ref={fileInputRef}
        type="file"
        hidden
        multiple={false}
        disabled={savingAvatar}
        accept="image/png, image/jpg, image/jpeg"
        onChange={onImagePickHandler}
      />

      <article className="relative w-full shadow-lg overflow-hidden">
        <div className="relative flex flex-col justify-start items-center gap-6 px-4 py-5 z-[10]">
          <div className="relative w-[180px] h-[180px]">
            {/* Overlay y spinner del avatar para indicar que se está subiendo */}
            {savingAvatar &&
              <div className="absolute top-0 left-0 flex flex-col justify-center items-center w-full h-full rounded-full bg-black opacity-70 z-10">
                <CgSpinner className="w-9 h-9 animate-spin" color="white" />
                <p className="text-center text-white">Saving changes...</p>
              </div>
            }

            {/* Avatar */}
            <img
              className="block w-full h-full object-cover object-center rounded-full border-4 border-blue-500 shadow-md"
              src={imagePreview || avatar}
              alt={username}
            />

            {/* Botón para seleccionar el nuevo avatar */}
            {!imageData &&
              <div className="absolute bottom-0 -right-5 flex gap-1 z-10">
                <div
                  className="flex justify-center items-center w-8 h-8 p-1 rounded-full border-2 border-blue-500 bg-white cursor-pointer"
                  data-tooltip-id="change-avatar-tooltip"
                  data-tooltip-content="Change avatar"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <AiOutlineEdit className="w-6 h-6" />
                </div>
                <div
                  className="flex justify-center items-center rounded-full bg-white cursor-pointer"
                  data-tooltip-id="delete-avatar-tooltip"
                  data-tooltip-content="Delete avatar"
                  onClick={() => !savingAvatar && deleteAvatarHandler()}
                >
                  <MdCancel className="w-8 h-8" color="rgb(234 88 12)" />
                </div>
              </div>
            }

            {/* Botones para guardar y descartar el nuevo avatar */}
            {imageData && (
              <div className="absolute bottom-0 -right-5 flex gap-1">
                <div
                  className="flex justify-center items-center w-8 h-8 rounded-full bg-white cursor-pointer z-10"
                  data-tooltip-id="change-avatar-tooltip"
                  data-tooltip-content="Save changes"
                  onClick={() => !savingAvatar && updateAvatarHandler()}
                >
                  <BsFillCheckCircleFill className="w-full h-full" color="green" />
                </div>
                <div
                  className="flex justify-center items-center w-8 h-8 rounded-full bg-white cursor-pointer z-10"
                  data-tooltip-id="discard-avatar-tooltip"
                  data-tooltip-content="Discard changes"
                  onClick={() => !savingAvatar && setImageData(null)}
                >
                  <MdCancel className="w-full h-full" color="rgb(234 88 12)" />
                </div>
              </div>
            )}
          </div>

          {/* Contenedor del texto */}
          <div className="flex flex-col justify-start items-start">
            <div className="flex justify-start items-baseline gap-2 mb-2 text-3xl font-bold">
              <span>{firstName}</span>
              <span>{lastName}</span>
              <GoVerified
                style={{display: emailVerified ? "block" : "none"}}
                className="w-6 h-6 fill-blue-600"
                data-tooltip-id="verified-icon-tooltip"
                data-tooltip-content="Account verified"
              />
            </div>
            <p className="text-base text-gray-900">
              @{username}
            </p>
            <p className="text-base text-gray-900">
              {email}
            </p>
            <p className="text-base text-gray-900">
              In GeoCall since {dayjs(createdAt).format("MMM DD, YYYY")}
            </p>
          </div>
        </div>

        {/* Imagen de fondo */}
        <div className="absolute top-0 left-0 w-[100%] h-[100%] bg-white z-[1]">
          <img
            className="w-[100%] h-[100%] object-cover object-center opacity-60 blur-xl"
            src={imagePreview || avatar}
            alt={username}
          />
        </div>
      </article>

    </section>
  )
};

export default Profile;