import * as React from 'react';
import useRequest, { UseRequestStatus } from 'use-request';

const UseGeoStatus = UseRequestStatus;

const normalize = (position: Position) => ({
  coords: {
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
    altitude: position.coords.altitude,
    accuracy: position.coords.accuracy,
    altitudeAccuracy: position.coords.altitudeAccuracy,
    heading: position.coords.heading,
    speed: position.coords.speed,
  },
  timestamp: position.timestamp,
});;

const getCurrentPosition = (options?: PositionOptions): Promise<Position> =>
  new Promise((resolve, reject) => window.navigator.geolocation.getCurrentPosition(resolve, reject, options));

export const useGeoWatch = (immediateOrOptions: boolean | PositionOptions = true) => {
  const [state, setState] = React.useState<{ position?: Position, error?: PositionError }>(() => ({
    position: undefined,
    error: undefined
  }));

  const watcherId = React.useRef<number>();
  const [watching, setWatching] = React.useState(!!immediateOrOptions);

  const watch = (options?: PositionOptions) => {
    setWatching(true);
    return watcherId.current = window.navigator.geolocation.watchPosition(
      position => setState({ position: normalize(position), error: undefined }),
      error => setState({ position: undefined, error }),
      options,
    );
  };

  const unwatch = () => {
    setWatching(false);
    if (watcherId.current) window.navigator.geolocation.clearWatch(watcherId.current);
  };

  React.useEffect(() => {
    if (!immediateOrOptions) return;
    watch();
    return unwatch;
  }, [immediateOrOptions]);

  return { ...state, watching, watch, unwatch };
};

export const useGeo = (immediateOrOptions: boolean | PositionOptions = true) => {
  const immediateArguments = React.useMemo((): [PositionOptions] | [] | undefined => {
    if (!immediateOrOptions) return;
    if (typeof immediateOrOptions === 'boolean') return [];
    return [immediateOrOptions];
  }, [immediateOrOptions]);

  const request = useRequest<Position, PositionError>(() => getCurrentPosition().then(normalize), immediateArguments);

  return {
    position: request.value,
    error: request.error,

    status: request.status,
    idle: request.idle,
    pending: request.pending,
    completed: request.completed,
    failed: request.failed,

    request: request.execute,
  };
};

export default useGeo;

export { UseGeoStatus };