import {useState, useEffect} from "react";
import { useSelector, useDispatch } from "react-redux";
import { distance } from "@turf/turf";
import { MapRootState } from "../redux/store";
import { SelectedUser, UserLocation, setSelectedUser } from "../redux/features/mapSlice";
import { useGetUserQuery } from "../redux/api";

interface Props {
  selectedUserId: string;
  selectedUserSocketId: string;
};

/**
 * Custom hook para consultar la data del usuario seleccionado
 * calcular su distancia al usuario actual
 * y actualizar el state global.
 */
const useSelectedUser = ({selectedUserId, selectedUserSocketId}: Props) => {
  const dispatch = useDispatch();
  const {onlineUsers, myLocation} = useSelector((state: MapRootState) => state.map);

  const [selectedUserLocation, setSelectedUserLocation] = useState<UserLocation | null>(null);
  const [selectedUserPeerId, setSelectedUserPeerId] = useState("");

  // Consultar la data del usuario seleccionado
  const {data, isLoading, isFetching} = useGetUserQuery(
    {userId: selectedUserId, location: selectedUserLocation!},
    {skip: !selectedUserId || !selectedUserSocketId || !selectedUserLocation}
  );

  // Buscar al usuario seleccionado en el state global
  // y extraer su ubicación y su peer id
  useEffect(() => {
    if (selectedUserId) {
      const {location, peerId} = onlineUsers.find(user => user.userId === selectedUserId)!;
      setSelectedUserLocation(location);
      setSelectedUserPeerId(peerId);
    }
  }, [selectedUserId]);

  // Calcular la distancia del usuario seleccionado
  // y actualizar el state global del usuario seleccionado
  useEffect(() => {
    if (selectedUserLocation && data && selectedUserSocketId && myLocation) {
      const from = [myLocation.lat, myLocation.lon];
      const to = [selectedUserLocation.lat, selectedUserLocation.lon];
      const userDistance = distance(from, to, {units: "kilometers"});
      
      const selectedUser: SelectedUser = {
        user: data.user,
        socketId: selectedUserSocketId,
        peerId: selectedUserPeerId,
        location: selectedUserLocation,
        address: data.address,
        distance: `${(userDistance).toFixed(2)}km`,
      };

      dispatch(setSelectedUser(selectedUser));
    }
  }, [selectedUserLocation, data, selectedUserSocketId, myLocation]);

  return {
    data,
    isLoading,
    isFetching
  }
};

export default useSelectedUser;