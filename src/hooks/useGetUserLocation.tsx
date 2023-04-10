import {useState, useEffect} from "react";
import { useDispatch, useSelector } from "react-redux";
import { setMyLocation } from "../redux/features/mapSlice";
import { getFakeLocation } from "../utils/dummyLocations";
import { MapRootState } from "../redux/store";

const useGetUserLocation = () => {
  const dispatch = useDispatch();
  const {myLocation} = useSelector((state: MapRootState) => state.map);

  const [locationError, setLocationError] = useState<string | null>(null);

  useEffect(() => {
    if ("navigator" in window) {
      navigator.geolocation.getCurrentPosition(
        (_position: GeolocationPosition) => {
          //! Usar la posición real sólo en producción
          // const {latitude, longitude} = position.coords;
          // dispatch(setMyLocation({lat: latitude, lon: longitude}));
  
          const fakeLocation = getFakeLocation();
          dispatch(setMyLocation(fakeLocation));
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

  return {myLocation, locationError, setLocationError}
};

export default useGetUserLocation;