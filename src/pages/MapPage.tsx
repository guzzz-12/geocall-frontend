import { useState, useEffect } from "react";
import Map, { Marker, Popup, FullscreenControl, NavigationControl, GeolocateControl } from "react-map-gl";
import { useSelector, useDispatch } from "react-redux";
import { distance } from "@turf/turf";
import withAuthentication from "../components/HOC/withAuthentication";
import { MapRootState, UserRootState } from "../redux/store";
import { useGetUserQuery } from "../redux/api";
import { SelectedUser, setSelectedUser } from "../redux/features/mapSlice";
import "mapbox-gl/dist/mapbox-gl.css";

const MapPage = () => {
  const dispatch = useDispatch();
  const {onlineUsers, myLocation} = useSelector((state: MapRootState) => state.map);
  const {currentuser} = useSelector((state: UserRootState) => state.user);

  const [showPopup, setShotPopup] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState("");

  // Consultar la data del usuario seleccionado
  const {data: selectedUserData} = useGetUserQuery(selectedUserId, {skip: !Boolean(selectedUserId)});

  // Calcular la distancia a la que se encuentra el usuarios seleccionado
  // y actualizar el state global del usuario seleccionado
  useEffect(() => {
    if (selectedUserData && myLocation) {
      const {location} = onlineUsers.find(user => user.userId === selectedUserId)!;

      const from = [myLocation.lat, myLocation.lon];
      const to = [location.lat, location.lon];
      const userDistance = distance(from, to, {units: "kilometers"});

      const selectedUser: SelectedUser = {
        distance: `${(userDistance).toFixed(2)}km`,
        location,
        user: selectedUserData
      };

      dispatch(setSelectedUser(selectedUser));

    }
  }, [selectedUserId, selectedUserData, myLocation]);

  if (!myLocation || !currentuser) {
    return null;
  };

  const mapboxToken = import.meta.env.VITE_MAPBOX_PUBLIC_TOKEN;

  return (
    <div className="w-full h-screen">
      <Map
        style={{width: "100%", height: "100%"}}
        mapStyle="mapbox://styles/mapbox/dark-v11"
        mapboxAccessToken={mapboxToken}
        initialViewState={{
          latitude: myLocation.lat,
          longitude: myLocation.lon,
          zoom: 3
        }}
      >
        <FullscreenControl />
        <GeolocateControl positionOptions={{enableHighAccuracy: true}}/>
        <NavigationControl showCompass={true} />

        {showPopup && (
          <Popup
            key="CurrentUserLocation"
            latitude={myLocation.lat}
            longitude={myLocation.lon}
            anchor="bottom"
            offset={16}
            closeButton={true}
            closeOnClick={false}
            onClose={() => setShotPopup(false)}
          >
            <p>You are here</p>
          </Popup>
        )}

        {onlineUsers.map((user) => {
          return (
            <Marker
              key={user.userId}
              style={{cursor: "pointer"}}
              latitude={user.location.lat}
              longitude={user.location.lon}
              anchor="top"
              color={user.userId === currentuser._id ? "#0ea5e9" : "#bae6fd"}
              onClick={() => setSelectedUserId(user.userId)}
            />
          )
        })}
      </Map>
    </div>
  )
};

export default withAuthentication(MapPage);