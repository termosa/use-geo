export default (options?: PositionOptions): Promise<Position> =>
  new Promise((resolve, reject) =>
    window.navigator.geolocation.getCurrentPosition(
      position => resolve({
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
      }),
      reject,
      options,
    )
  );