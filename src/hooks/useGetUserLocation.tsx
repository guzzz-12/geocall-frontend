import {useState, useEffect} from "react";
import { useDispatch } from "react-redux";
import { setMyLocation } from "../redux/features/mapSlice";
import { getFakeLocation } from "../utils/dummyLocations";

const useGetUserLocation = () => {
  const dispatch = useDispatch();
  const [locationError, setLocationError] = useState<string | null>(null);
  const IS_DEV = import.meta.env.DEV;

  // Usar la posición real sólo en producción
  useEffect(() => {    
    if ("navigator" in window) {
      if (!IS_DEV) {
        navigator.geolocation.getCurrentPosition(
          (position: GeolocationPosition) => {
            const {latitude, longitude} = position.coords;
            dispatch(setMyLocation({lat: latitude, lon: longitude}));
          },
          (err:GeolocationPositionError) => {
            setLocationError(err.message)
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
          }
        )
      } else {
        const fakeLocation = getFakeLocation();
        dispatch(setMyLocation(fakeLocation));
      }
    } else {
      setLocationError("This device is not compatible with the geolocation functionality")
    }
  }, [IS_DEV]);

  return {locationError, setLocationError}
};

export default useGetUserLocation;