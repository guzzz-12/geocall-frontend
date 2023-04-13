import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { distance } from "@turf/turf";
import dayjs from "dayjs";
import { GrClose } from "react-icons/gr";
// import { MdOutlineVideoCall } from "react-icons/md";
import { FiMail } from "react-icons/fi";
import { HiAtSymbol } from "react-icons/hi";
import { BsCalendar3 } from "react-icons/bs";
import { GoLocation } from "react-icons/go";
import { FaAddressCard } from "react-icons/fa";
import { GiPathDistance } from "react-icons/gi";
import Spinner from "./Spinner";
import { SelectedUser, UserLocation, setSelectedUser } from "../redux/features/mapSlice";
import { useGetUserQuery } from "../redux/api";
import { MapRootState } from "../redux/store";
import { IconType } from "react-icons/lib";

interface Props {
  selectedUserId: string;
  myLocation: UserLocation;
  setSelectedUserId: Dispatch<SetStateAction<string | null>>
};

const SelectedUserCard = ({selectedUserId, myLocation, setSelectedUserId}: Props) => {
  const dispatch = useDispatch();
  const {onlineUsers, selectedUser} = useSelector((state: MapRootState) => state.map);
  const [selectedUserLocation, setSelectedUserLocation] = useState<UserLocation | null>(null);

  // Consultar la data del usuario seleccionado
  const {data, isLoading, isFetching} = useGetUserQuery(
    {userId: selectedUserId, location: selectedUserLocation!},
    {skip: !selectedUserId || !selectedUserLocation}
  );

  // Buscar al usuario seleccionado en el state global
  useEffect(() => {
    if (selectedUserId) {
      const {location} = onlineUsers.find(user => user.userId === selectedUserId)!;
      setSelectedUserLocation(location);     
    }
  }, [selectedUserId]);

  // Calcular la distancia del usuario seleccionado
  // y actualizar el state global del usuario seleccionado
  useEffect(() => {
    if (selectedUserLocation && data) {
      const from = [myLocation.lat, myLocation.lon];
      const to = [selectedUserLocation.lat, selectedUserLocation.lon];
      const userDistance = distance(from, to, {units: "kilometers"});
      
      const selectedUser: SelectedUser = {
        user: data.user,
        location: selectedUserLocation,
        address: data.address,
        distance: `${(userDistance).toFixed(2)}km`,
      };

      dispatch(setSelectedUser(selectedUser));
    }
  }, [selectedUserLocation, data]);


  const UserMetadata = ({Icon, text}: {Icon: IconType, text: string}) => {
    return (
      <p className="flex justify-start items-center gap-3">
        <Icon className="w-5 h-5 text-gray-500" />
        {text}
      </p>
    )
  };
  

  return (
    <div className="w-[350px] h-[500px] p-4 translate-y-[-50%] rounded-md border border-gray-500 bg-slate-50 scrollbar-thumb-gray-600 scrollbar-thin overflow-y-auto overflow-x-hidden">
      <div
        className="absolute top-1 right-2 p-1 cursor-pointer"
        onClick={() => setSelectedUserId(null)}
      >
        <GrClose className="w-5 h-5 text-gray-700" />
      </div>

      {(isLoading || isFetching) && (
        <Spinner
          size="medium"
          spinnerInfo="Fetching user data..."
        />
      )}

      {!isLoading && selectedUser && (
        <div className="flex flex-col justify-start items-center gap-1 w-full max-w-full h-full p-1">
          <div className="w-32 h-32 rounded-full border-4 border-blue-600 overflow-hidden">
            <img
              className="block w-full h-full object-contain object-center"
              src={selectedUser.user.avatar}
              alt={selectedUser.user.firstName}
            />
          </div>

          <p
            className="max-w-[100%] font-semibold text-center text-3xl overflow-ellipsis whitespace-nowrap overflow-hidden text-gray-700"
            title={`${selectedUser.user.firstName} ${selectedUser.user.lastName}`}
          >
            {selectedUser.user.firstName} {selectedUser.user.lastName}
          </p>

          <div className="w-full h-[1px] my-2 bg-slate-200" />

          <div className="flex flex-col justify-start items-start gap-4 text-base font-semibold">
            <UserMetadata Icon={FiMail} text={selectedUser.user.email} />
            <UserMetadata Icon={HiAtSymbol} text={selectedUser.user.username} />
            <UserMetadata
              Icon={BsCalendar3}
              text={`In GeoCall since ${dayjs(selectedUser.user.createdAt).format("MM/DD/YYYY")}`}
            />
            <UserMetadata
              Icon={GoLocation}
              text={`${selectedUser.location.lat}, ${selectedUser.location.lon}`}
            />
            <UserMetadata Icon={FaAddressCard} text={selectedUser.address} />
            <UserMetadata Icon={GiPathDistance} text={selectedUser.distance} />
          </div>
        </div>
      )}
    </div>
  )
};

export default SelectedUserCard;