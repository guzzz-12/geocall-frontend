import { UserLocation } from "../redux/features/mapSlice";

export const DUMMY_LOCATIONS: UserLocation[] = [
  {
    lat: 0.76126,
    lon: 31.33584
  },
  {
    lat: -27.6068,
    lon: 14.55563
  },
  {
    lat: -33.87379,
    lon: 158.13075
  },
  {
    lat: 39.84008,
    lon: 31.73172
  },
  {
    lat: 46.97472,
    lon: 22.39456
  },
  {
    lat: 10.62231,
    lon: 11.17861
  },
  {
    lat: 47.76853,
    lon: -1.97983
  },
  {
    lat: 37.7749295,
    lon: -122.4194155
  }
];

export const getFakeLocation = () => {
  return DUMMY_LOCATIONS[Math.floor(Math.random() * DUMMY_LOCATIONS.length)];
};
