import {useState, useEffect} from "react";
import { useDispatch } from "react-redux";
import { setMyLocation } from "../redux/features/mapSlice";
import { getFakeLocation } from "../utils/dummyLocations";

const useGetUserLocation = () => {
  const dispatch = useDispatch();
  const [locationError, setLocationError] = useState<string | null>(null);

  useEffect(() => {
    const fakeLocation = getFakeLocation();
    dispatch(setMyLocation(fakeLocation));
    
    //! Usar la posición real sólo en producción
    if ("navigator" in window) {
      navigator.geolocation.getCurrentPosition(
        (_position: GeolocationPosition) => {
          // const {latitude, longitude} = position.coords;
          // dispatch(setMyLocation({lat: latitude, lon: longitude}));
        },
        (err:GeolocationPositionError) => {
          setLocationError(err.message)
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    } else {
      setLocationError("This device is not compatible with the geolocation functionality")
    }
  }, []);

  return {locationError, setLocationError}
};

export default useGetUserLocation;