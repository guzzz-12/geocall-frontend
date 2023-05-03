import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setLocationError, setMyLocation, setWaitingLocation } from "../redux/features/mapSlice";

const useGetUserLocation = () => {
  const dispatch = useDispatch();

  // Usar la posición real sólo en producción
  useEffect(() => {
    setWaitingLocation(true);
    
    navigator.geolocation.getCurrentPosition(
      (position: GeolocationPosition) => {
        const {latitude, longitude} = position.coords;
        dispatch(setMyLocation({lat: latitude, lon: longitude}));
        dispatch(setWaitingLocation(false));
      },
      (err:GeolocationPositionError) => {
        console.log({LOCATION_ERROR: err.message});
        dispatch(setLocationError(err.message));
        dispatch(setWaitingLocation(false));
      },
      {
        timeout: 30000,
        maximumAge: 0
      }
    )
  }, []);

  return null;
};

export default useGetUserLocation;