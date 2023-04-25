import { useState } from "react";
import Map, { Marker, Popup, FullscreenControl, NavigationControl, GeolocateControl } from "react-map-gl";
import { useDispatch, useSelector } from "react-redux";
import { AnimatePresence, motion } from "framer-motion";
import { Tooltip } from "react-tooltip";
import "mapbox-gl/dist/mapbox-gl.css";

import Navbar from "../components/Navbar";
import SelectedUserCard from "../components/SelectedUserCard";
import withVerification from "../components/HOC/withVerification";
import { MapRootState, UserRootState } from "../redux/store";
import { OnlineUser, setMyLocation, setSelectedUserPrefetch } from "../redux/features/mapSlice";
import { closeChat } from "../redux/features/chatsSlice";

interface MapTheme {
  name: string;
  uri: string;
  img: string;
};

const MAP_THEMES = [
  {name: "Streets", uri: "mapbox://styles/mapbox/streets-v12", img: "streets.png"},
  {name: "Light", uri: "mapbox://styles/mapbox/light-v11", img: "light.png"},
  {name: "Dark", uri: "mapbox://styles/mapbox/dark-v11", img: "dark.png"},
  {name: "Satellite", uri: "mapbox://styles/mapbox/satellite-streets-v12", img: "satellite.png"},
  {name: "Navigation", uri: "mapbox://styles/mapbox/navigation-night-v1", img: "navigation.png"}
];


const MapPage = () => {
  const dispatch = useDispatch();
  const {onlineUsers, myLocation, selectedUserPrefetch: {selectedUserId}} = useSelector((state: MapRootState) => state.map);
  const {currentUser} = useSelector((state: UserRootState) => state.user);

  // State del popup de la ubicación del usuario logueado
  const [showPopup, setShotPopup] = useState(false);

  // State del theme del mapa
  const [mapTheme, setMapTheme] = useState<MapTheme>(MAP_THEMES[2]);

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


  /**
   * Botones del selector del theme del mapa
   */
  const MapThemeBtn = () => {
    return MAP_THEMES.map((theme) => {
      const isSelected = theme.name === mapTheme.name;

      return (
        <div key={theme.name}>
          <Tooltip id={`${theme.name}-button`} style={{color: "black", background: "#f8fafc"}} />
          <div
            style={{
              transform: `scale(${isSelected ? 1.05 : 1})`,
              outline: isSelected ? "2px solid #ef4444" : "none"
            }}
            className="w-12 h-12 rounded border border-gray-400 hover:scale-105 transition-all overflow-hidden cursor-pointer"
            data-tooltip-id={`${theme.name}-button`}
            data-tooltip-content={theme.name}
            onClick={() => setMapTheme(theme)}
          >
            <img
              className="block w-full h-full object-cover object-center"
              src={`/img/map-styles/${theme.img}`}
              alt={theme.name}
            />
          </div>
        </div>
      )
    })
  };


  const mapboxToken = import.meta.env.VITE_MAPBOX_PUBLIC_TOKEN;

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <Navbar navbarType="floating" />

      <div className="absolute bottom-2 left-2 flex gap-2 rounded z-[100]">
        {MapThemeBtn()}
      </div>

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
        mapStyle={mapTheme.uri}
        mapboxAccessToken={mapboxToken}
        initialViewState={{
          latitude: myLocation.lat,
          longitude: myLocation.lon,
          zoom: 2
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

export default withVerification(MapPage);