import { ChangeEvent, useRef, useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { Tooltip } from "react-tooltip";
import { FiMail } from "react-icons/fi";
import { HiAtSymbol } from "react-icons/hi";
import { BsCalendarDay } from "react-icons/bs";
import { AiOutlineEdit } from "react-icons/ai";
import { GoVerified } from "react-icons/go";
import { BsFillCheckCircleFill } from "react-icons/bs";
import { MdCancel } from "react-icons/md";
import { CgSpinner } from "react-icons/cg";
import { FaInstagram, FaFacebookSquare, FaTwitter } from "react-icons/fa";
import dayjs from "dayjs";

import ProfileForm from "./ProfileForm";
import SocialLink from "./SocialLink";
import { User } from "../../redux/api";
import { imageResizer } from "../../utils/imgResizer";
import { useUpdateAvatarMutation } from "../../redux/accountApi";
import { setCurrentUser } from "../../redux/features/userSlice";
import { openImageModal } from "../../redux/features/imageModalSlice";

interface Props {
  currentUser: User;
};

const Profile = ({currentUser}: Props) => {
  const sectionRef = useRef<HTMLDivElement | null>(null); 
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const formButtonsRef = useRef<HTMLDivElement | null>(null);

  const dispatch = useDispatch();

  const {avatar, email, emailVerified, firstName, lastName, username, socialLinks, createdAt} = currentUser;

  const [imageData, setImageData] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [savingAvatar, setSavingAvatar] = useState(false);

  const [isFormEnabled, setIsFormEnabled] = useState(false);

  // Actualizar o eliminar el avatar
  const [updateAvatar] = useUpdateAvatarMutation();

  // Generar el preview de la imagen seleccionada
  useEffect(() => {
    if (imageData) {
      const url = URL.createObjectURL(imageData);
      setImagePreview(url)
    }
  }, [imageData]);

  // Scrollear al fondo del formulario de
  // actualización del perfil al habilitarlo
  useEffect(() => {
    if (isFormEnabled && formButtonsRef) {
      formButtonsRef.current?.scrollIntoView({behavior: "smooth"})
    }
  }, [isFormEnabled, formButtonsRef]);

  useEffect(() => {
    if (!isFormEnabled && sectionRef) {
      sectionRef.current?.scrollTo({top: 0, behavior: "smooth"})
    }
  }, [sectionRef, isFormEnabled]);

  /**
   * Obtener el ref del parent de los botones del formulario
   * de actualización del perfil para scrollear
   * al bottom al activar el formulario.
   */
  const getProfileFormBtnsRef = (ref: HTMLDivElement) => {
    formButtonsRef.current = ref;
  };

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
    <section
      ref={sectionRef}
      className="w-full h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400"
    >
      <Tooltip id="edit-profile-tooltip" style={{zIndex: 1000}} />
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

      <article className="relative w-full shadow-md">
        {/* Botón para editar el perfil */}
        <div
          style={{display: isFormEnabled ? "none" : "flex"}}
          className="absolute top-5 right-4 justify-center items-center w-10 h-10 p-1 rounded-full border-2 border-blue-500 hover:bg-gray-300 transition-colors cursor-pointer z-[15]"
          data-tooltip-id="edit-profile-tooltip"
          data-tooltip-content="Edit profile"
          onClick={() => setIsFormEnabled(true)}
        >
          <AiOutlineEdit className="w-8 h-8" />
        </div>

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
            <div
              className="relative flex flex-col justify-center items-center w-full h-full bg-black rounded-full border-4 border-blue-500 shadow-md overflow-hidden"
              onClick={() => dispatch(openImageModal(imagePreview || avatar))}
            >
              <img
                className="block w-full h-full object-cover object-center cursor-pointer transition-opacity hover:opacity-75"
                src={imagePreview || avatar}
                alt={username}
              />
            </div>

            {/* Botones para seleccionar el nuevo avatar y eliminar el actual avatar */}
            {!imageData &&
              <div className="absolute bottom-0 -right-5 flex gap-1 w-16 z-10">
                <div
                  className="flex justify-center items-center w-8 h-8 p-1 rounded-full border-2 border-blue-500 bg-white cursor-pointer"
                  data-tooltip-id="change-avatar-tooltip"
                  data-tooltip-content="Change avatar"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <AiOutlineEdit className="w-6 h-6" />
                </div>

                <div
                  style={{display: currentUser.avatarPublicId.length ? "flex" : "none"}}
                  className="justify-center items-start rounded-full bg-white cursor-pointer"
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
                {/* Botón para confirmar el cambio de avatar */}
                <div
                  className="flex justify-center items-center w-8 h-8 rounded-full bg-white cursor-pointer z-10"
                  data-tooltip-id="change-avatar-tooltip"
                  data-tooltip-content="Save changes"
                  onClick={() => !savingAvatar && updateAvatarHandler()}
                >
                  <BsFillCheckCircleFill className="w-full h-full" color="#16a34a" />
                </div>

                {/* Botón para descartar el avatar seleccionado si no ha comenzado la subida */}
                {/* Si ya comenzó la subida, el botón cancela la solicitud y restaura el avatar original */}
                <div
                  className="flex justify-center items-center w-8 h-8 rounded-full bg-white cursor-pointer z-10"
                  data-tooltip-id="discard-avatar-tooltip"
                  data-tooltip-content="Discard changes"
                  onClick={() => {
                    if (savingAvatar) return false;
                    setImageData(null);
                    setImagePreview(null);
                  }}
                >
                  <MdCancel className="w-full h-full" color="rgb(234 88 12)" />
                </div>
              </div>
            )}
          </div>

          {/* Contenedor del texto */}
          <div className="flex flex-col justify-start items-start gap-1">
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
            <p className="flex justify-start items-center gap-2 text-base text-gray-900">
              <HiAtSymbol className="w-4 h-4 opacity-60" /> {username}
            </p>
            <p className="flex justify-start items-center gap-2 text-base text-gray-900">
              <FiMail className="w-4 h-4 opacity-60" /> {email}
            </p>
            <p className="flex justify-start items-center gap-2 text-base text-gray-900">
              <BsCalendarDay className="w-4 h-4 opacity-60" />
              {`In GeoCall since ${dayjs(createdAt).format("MMM DD, YYYY")}`}
            </p>
          </div>

          <div className="flex justify-center items-center gap-10 w-full">
            {socialLinks.map((item) => {
              const {_id, name, link} = item;

              const icon = name === "instagram" ? FaInstagram : name === "facebook" ? FaFacebookSquare : FaTwitter;

              return <SocialLink key={_id} Icon={icon} name={name} link={link} />
            })}
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

      <ProfileForm
        enabled={isFormEnabled}
        setEnabled={setIsFormEnabled}
        getProfileFormBtnsRef={getProfileFormBtnsRef}
      />
    </section>
  )
};

export default Profile;