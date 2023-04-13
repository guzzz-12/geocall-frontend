import { useState } from "react";
import Map, { Marker, Popup, FullscreenControl, NavigationControl, GeolocateControl } from "react-map-gl";
import { useDispatch, useSelector } from "react-redux";
import { AnimatePresence, motion } from "framer-motion";

import Navbar from "../components/Navbar";
import SelectedUserCard from "../components/SelectedUserCard";
import withAuthentication from "../components/HOC/withAuthentication";
import { MapRootState, UserRootState } from "../redux/store";
import "mapbox-gl/dist/mapbox-gl.css";
import { setMyLocation } from "../redux/features/mapSlice";

const MapPage = () => {
  const dispatch = useDispatch();
  const {onlineUsers, myLocation} = useSelector((state: MapRootState) => state.map);
  const {currentuser} = useSelector((state: UserRootState) => state.user);

  const [showPopup, setShotPopup] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  if (!myLocation || !currentuser) {
    return null;
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
              myLocation={myLocation}
              setSelectedUserId={setSelectedUserId}
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
            // closeButton={true}
            // onClose={() => setShotPopup(false)}
          >
            <p>You are here</p>
          </Popup>
        )}

        {onlineUsers.map((user) => {
          return (
            <Marker
              key={user.userId}
              style={{cursor: currentuser._id !== user.userId ? "pointer" : "default"}}
              latitude={user.location.lat}
              longitude={user.location.lon}
              anchor="top"
              color={user.userId === currentuser._id ? "#0ea5e9" : "#bae6fd"}
              onClick={() => {
                if (currentuser._id === user.userId) {
                  return false;
                };

                setSelectedUserId(user.userId)
              }}
            />
          )
        })}
      </Map>
    </div>
  )
};

export default withAuthentication(MapPage);