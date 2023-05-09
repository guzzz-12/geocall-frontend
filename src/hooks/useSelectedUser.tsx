import {useState, useEffect} from "react";
import { useSelector, useDispatch } from "react-redux";
import { distance } from "@turf/turf";
import { RootState } from "../redux/store";
import { SelectedUser, UserLocation, setSelectedUser } from "../redux/features/mapSlice";
import { useGetUserWithLocationQuery } from "../redux/api";

interface Props {
  /** ID del usuario a consultar */
  selectedUserId: string;
  /** Agregar la data al state global si es requerido o sólo retornar la data */
  updateGlobalState: boolean;
};

/**
 * Custom hook para consultar la data del usuario seleccionado
 * calcular su distancia al usuario actual
 * y actualizar el state global.
 */
const useSelectedUser = ({selectedUserId, updateGlobalState}: Props) => {
  const dispatch = useDispatch();
  const {onlineUsers, myLocation} = useSelector((state: RootState) => state.map);

  const [selectedUserLocation, setSelectedUserLocation] = useState<UserLocation | null>(null);
  const [selectedUserPeerId, setSelectedUserPeerId] = useState("");

  // Consultar la data del usuario seleccionado
  const {data, isLoading, isFetching} = useGetUserWithLocationQuery(
    {userId: selectedUserId, location: selectedUserLocation!},
    {skip: !selectedUserId || !selectedUserLocation, refetchOnMountOrArgChange: 20}
  );

  // Buscar al usuario seleccionado en el state global
  // y extraer su ubicación y su peer id
  useEffect(() => {
    if (selectedUserId) {
      const user = onlineUsers.find(user => user.userId === selectedUserId);

      if (user) {
        setSelectedUserLocation(user.location);
        setSelectedUserPeerId(user.peerId);
      };
    }
  }, [selectedUserId]);

  // Calcular la distancia del usuario seleccionado
  // y actualizar el state global del usuario seleccionado
  useEffect(() => {
    if (selectedUserLocation && data && myLocation && updateGlobalState) {
      const from = [myLocation.lat, myLocation.lon];
      const to = [selectedUserLocation.lat, selectedUserLocation.lon];
      const userDistance = distance(from, to, {units: "kilometers"});
      
      const selectedUser: SelectedUser = {
        user: data.user,
        peerId: selectedUserPeerId,
        location: selectedUserLocation,
        address: data.address,
        distance: `${(userDistance).toFixed(2)}km`,
      };

      dispatch(setSelectedUser(selectedUser));
    }
  }, [selectedUserLocation, data, myLocation, updateGlobalState]);

  return {
    data,
    isLoading,
    isFetching
  }
};

export default useSelectedUser;