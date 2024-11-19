import { useGeo, useGeoWatch, UseGeoStatus } from './'
import { renderHook, act } from "@testing-library/react-hooks";

const position = ({
  latitude = 42.00000001,
  longitude = 42.00000002,
  altitude = null,
  accuracy = 4000,
  altitudeAccuracy = null,
  heading = null,
  speed = null,
  timestamp = 1605463861229,
} = {}) => ({
  coords: { latitude, longitude, altitude, accuracy, altitudeAccuracy, heading, speed },
  timestamp,
});

// @ts-ignore: need to rewrite readonly property
global.navigator.geolocation = global.navigator.geolocation || {
  getCurrentPosition: () => {},
  watchPosition: () => {},
  clearWatch: () => {},
};

describe('useGeo', () => {

  const wait = () => act(() => Promise.resolve());

  const geolocation = global.navigator.geolocation;

  beforeEach(() => {
    // @ts-ignore: need to rewrite readonly property
    global.navigator.geolocation = {
      getCurrentPosition: jest.fn()
        .mockImplementation(success => { success(position()) }),
    };
  })

  afterEach(() => {
    // @ts-ignore: need to rewrite readonly property
    global.navigator.geolocation = geolocation;
  });

  it('loads location', async () => {
    const { result } = renderHook(() => useGeo());

    expect(result.current.status).toBe(UseGeoStatus.Pending);
    expect(result.current.position).toBe(undefined);
    expect(result.current.error).toBe(undefined);
    expect(result.current.request).toBeInstanceOf(Function);

    await wait();

    expect(result.current.status).toBe(UseGeoStatus.Completed);
    expect(result.current.position).toStrictEqual(position());
    expect(result.current.error).toBe(undefined);
  });

  it('loads location on request', async () => {
    const { result } = renderHook(() => useGeo(false));

    expect(result.current.status).toBe(UseGeoStatus.Idle);
    expect(result.current.position).toBe(undefined);
    expect(result.current.error).toBe(undefined);
    expect(result.current.request).toBeInstanceOf(Function);

    await wait();

    expect(result.current.status).toBe(UseGeoStatus.Idle);
    expect(result.current.position).toBe(undefined);
    expect(result.current.error).toBe(undefined);

    act(() => { result.current.request() });

    expect(result.current.status).toBe(UseGeoStatus.Pending);
    expect(result.current.position).toBe(undefined);
    expect(result.current.error).toBe(undefined);

    await wait();

    expect(result.current.status).toBe(UseGeoStatus.Completed);
    expect(result.current.position).toStrictEqual(position());
    expect(result.current.error).toBe(undefined);
  });

  it('can refresh position', async () => {
    const { result } = renderHook(() => useGeo());

    await wait();

    expect(result.current.status).toBe(UseGeoStatus.Completed);
    expect(result.current.position).toStrictEqual(position());
    expect(result.current.error).toBe(undefined);

    global.navigator.geolocation.getCurrentPosition =
      jest.fn().mockImplementation(success => success(position({ accuracy: 500 })));

    act(() => { result.current.request() });

    expect(result.current.status).toBe(UseGeoStatus.Pending);
    expect(result.current.position).toStrictEqual(position());
    expect(result.current.error).toBe(undefined);

    await wait();

    expect(result.current.status).toBe(UseGeoStatus.Completed);
    expect(result.current.position).toStrictEqual(position({ accuracy: 500 }));
    expect(result.current.error).toBe(undefined);
  });

  it('handle failure', async () => {
    global.navigator.geolocation.getCurrentPosition =
      jest.fn().mockImplementation((...args) => args[1]('Failed'));

    const { result } = renderHook(() => useGeo(false));

    await act(() => result.current.request().then(() => {}, () => {}));

    expect(result.current.status).toBe(UseGeoStatus.Failed);
    expect(result.current.position).toBe(undefined);
    expect(result.current.error).toBe('Failed');
  });

});

describe('useGeoWatch', () => {

  let lastWatcherId = 0;

  let setPosition: PositionCallback;
  let setError: PositionErrorCallback;

  const geolocation = global.navigator.geolocation;

  beforeEach(() => {
    // @ts-ignore: need to rewrite readonly property
    global.navigator.geolocation = {
      watchPosition: jest.fn().mockImplementation((positionCallback, errorCallback) => {
        setPosition = positionCallback;
        setError = errorCallback;
        return ++lastWatcherId;
      }),
      clearWatch: jest.fn().mockImplementation((watcherId: number) => {
        if (lastWatcherId === watcherId) {
          // @ts-ignore: Remove listener
          setPosition = undefined;
          // @ts-ignore: Remove listener
          setError = undefined;
        }
      }),
    };
  })

  afterEach(() => {
    // @ts-ignore: need to rewrite readonly property
    global.navigator.geolocation = geolocation;
    // @ts-ignore: need to ensure that this properties are not used anywhere else
    setPosition = undefined;
    // @ts-ignore: need to ensure that this properties are not used anywhere else
    setError = undefined;
  });

  it('changes state when position get updated', () => {
    expect(setPosition).toBe(undefined);
    expect(setError).toBe(undefined);

    const { result } = renderHook(() => useGeoWatch());

    expect(setPosition).toBeInstanceOf(Function);
    expect(setError).toBeInstanceOf(Function);
    
    expect(result.current.watching).toBe(true);
    expect(result.current.position).toBe(undefined);
    expect(result.current.error).toBe(undefined);
    expect(result.current.watch).toBeInstanceOf(Function);
    expect(result.current.unwatch).toBeInstanceOf(Function);

    act(() => setPosition(position()));

    expect(result.current.watching).toBe(true);
    expect(result.current.position).toStrictEqual(position());
    expect(result.current.error).toBe(undefined);

    act(() => setPosition(position({ accuracy: 500 })));

    expect(result.current.watching).toBe(true);
    expect(result.current.position).toStrictEqual(position({ accuracy: 500 }));
    expect(result.current.error).toBe(undefined);
  });

  it('can start without watching for changes', () => {
    const { result } = renderHook(() => useGeoWatch(false));

    expect(setPosition).toBe(undefined);
    expect(setError).toBe(undefined);

    expect(result.current.watching).toBe(false);
    expect(result.current.position).toBe(undefined);
    expect(result.current.error).toBe(undefined);
    expect(result.current.watch).toBeInstanceOf(Function);
    expect(result.current.unwatch).toBeInstanceOf(Function);
  });

  it('can be manually turned on and off', () => {
    const { result } = renderHook(() => useGeoWatch());

    expect(result.current.watching).toBe(true);
    expect(result.current.position).toBe(undefined);
    expect(result.current.error).toBe(undefined);
    expect(result.current.watch).toBeInstanceOf(Function);
    expect(result.current.unwatch).toBeInstanceOf(Function);

    act(() => { result.current.unwatch() });

    expect(setPosition).toBe(undefined);
    expect(setError).toBe(undefined);

    expect(result.current.watching).toBe(false);
    expect(result.current.position).toBe(undefined);
    expect(result.current.error).toBe(undefined);

    act(() => { result.current.watch() });

    expect(setPosition).toBeInstanceOf(Function);
    expect(setError).toBeInstanceOf(Function);

    act(() => setError({ message: 'Failed' } as PositionError));

    expect(result.current.watching).toBe(true);
    expect(result.current.position).toBe(undefined);
    expect(result.current.error).toStrictEqual({ message: 'Failed' });

    act(() => setPosition(position()));

    expect(result.current.watching).toBe(true);
    expect(result.current.position).toStrictEqual(position());
    expect(result.current.error).toBe(undefined);

    act(() => { result.current.unwatch() });

    expect(setPosition).toBe(undefined);
    expect(setError).toBe(undefined);

    expect(result.current.watching).toBe(false);
    expect(result.current.position).toStrictEqual(position());
    expect(result.current.error).toBe(undefined);
  });

});