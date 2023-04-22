import { useState } from "react";
import Map, { Marker, Popup, FullscreenControl, NavigationControl, GeolocateControl } from "react-map-gl";
import { useDispatch, useSelector } from "react-redux";
import { AnimatePresence, motion } from "framer-motion";
import "mapbox-gl/dist/mapbox-gl.css";

import Navbar from "../components/Navbar";
import SelectedUserCard from "../components/SelectedUserCard";
import withAuthentication from "../components/HOC/withAuthentication";
import { MapRootState, UserRootState } from "../redux/store";
import { OnlineUser, setMyLocation, setSelectedUserPrefetch } from "../redux/features/mapSlice";
import { closeChat } from "../redux/features/chatsSlice";

const MapPage = () => {
  const dispatch = useDispatch();
  const {onlineUsers, myLocation, selectedUserPrefetch: {selectedUserId}} = useSelector((state: MapRootState) => state.map);
  const {currentUser} = useSelector((state: UserRootState) => state.user);

  const [showPopup, setShotPopup] = useState(false);

  if (!myLocation || !currentUser) {
    return null;
  };

  
  /**
   * Seleccionar la ID del usuario
   */
  const onMarkerClickHandler = (user: OnlineUser) => {
    if (currentUser._id === user.userId) {
      return false;
    };
    
    dispatch(closeChat());

    dispatch(setSelectedUserPrefetch({
      selectedUserId: user.userId
    }));
  };


  const mapboxToken = import.meta.env.VITE_MAPBOX_PUBLIC_TOKEN;

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <Navbar />

      <AnimatePresence>
        {selectedUserId && (
          <motion.aside
            key="selectedUserCard"
            className="absolute top-[50%] left-2 z-10"
            initial={{translateY: -10, opacity: 0}}
            animate={{translateY: 0, opacity: 1}}
            exit={{translateY: 10, opacity: 0}}
          >
            <SelectedUserCard
              selectedUserId={selectedUserId}
            />
          </motion.aside>
        )}
      </AnimatePresence>

      <Map
        style={{width: "100%", height: "100%"}}
        mapStyle="mapbox://styles/mapbox/dark-v11"
        mapboxAccessToken={mapboxToken}
        initialViewState={{
          latitude: myLocation.lat,
          longitude: myLocation.lon,
          zoom: 3
        }}
        onLoad={() => setShotPopup(true)}
      >
        <FullscreenControl />
        <GeolocateControl
          positionOptions={{enableHighAccuracy: true}}
          onGeolocate={(geolocate) => {
            const {latitude, longitude} = geolocate.coords;
            dispatch(setMyLocation({lat: latitude, lon: longitude}));
          }}
        />
        <NavigationControl showCompass={true} />

        {showPopup && (
          <Popup
            key="CurrentUserLocation"
            latitude={myLocation.lat}
            longitude={myLocation.lon}
            anchor="bottom"
            offset={16}
            closeOnClick={false}
          >
            <p>You are here</p>
          </Popup>
        )}

        {onlineUsers.map((user) => {
          return (
            <Marker
              key={user.userId}
              style={{cursor: currentUser._id !== user.userId ? "pointer" : "default"}}
              latitude={user.location.lat}
              longitude={user.location.lon}
              anchor="top"
              color={user.userId === currentUser._id ? "#ef4444" : "#bae6fd"}
              onClick={onMarkerClickHandler.bind(null, user)}
            />
          )
        })}
      </Map>
    </div>
  )
};

export default withAuthentication(MapPage);