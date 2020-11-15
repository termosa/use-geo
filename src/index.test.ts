import useGeo, { Status } from './'
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

describe('useGeo', () => {
  const wait = () => act(() => Promise.resolve());

  let geolocation = global.navigator.geolocation;

  beforeEach(() => {
    // @ts-ignore: need to rewrite readonly property
    global.navigator.geolocation = {
      getCurrentPosition: jest.fn()
        .mockImplementationOnce(success => { success(position()) }),
      watchPosition: jest.fn(),
    };
  })

  afterEach(() => {
    // @ts-ignore: need to rewrite readonly property
    global.navigator.geolocation = geolocation;
  });

  it('loads location', async () => {
    const { result } = renderHook(() => useGeo());

    expect(result.current.status).toBe(Status.PENDING);
    expect(result.current.position).toBe(undefined);
    expect(result.current.error).toBe(undefined);
    expect(typeof result.current.request).toBe('function');

    await wait();

    expect(result.current.status).toBe(Status.SUCCESS);
    expect(result.current.position).toStrictEqual(position());
    expect(result.current.error).toBe(undefined);
  });

  it('loads location on request', async () => {
    const { result } = renderHook(() => useGeo(false));

    expect(result.current.status).toBe(Status.IDLE);
    expect(result.current.position).toBe(undefined);
    expect(result.current.error).toBe(undefined);
    expect(typeof result.current.request).toBe('function');

    await wait();

    expect(result.current.status).toBe(Status.IDLE);
    expect(result.current.position).toBe(undefined);
    expect(result.current.error).toBe(undefined);

    act(() => { result.current.request() });

    expect(result.current.status).toBe(Status.PENDING);
    expect(result.current.position).toBe(undefined);
    expect(result.current.error).toBe(undefined);

    await wait();

    expect(result.current.status).toBe(Status.SUCCESS);
    expect(result.current.position).toStrictEqual(position());
    expect(result.current.error).toBe(undefined);
  });

  it('can refresh position', async () => {
    const { result } = renderHook(() => useGeo());

    await wait();

    expect(result.current.status).toBe(Status.SUCCESS);
    expect(result.current.position).toStrictEqual(position());
    expect(result.current.error).toBe(undefined);

    global.navigator.geolocation.getCurrentPosition =
      jest.fn().mockImplementationOnce(success => success(position({ accuracy: 500 })));

    act(() => { result.current.request() });

    expect(result.current.status).toBe(Status.PENDING);
    expect(result.current.position).toStrictEqual(position());
    expect(result.current.error).toBe(undefined);

    await wait();

    expect(result.current.status).toBe(Status.SUCCESS);
    expect(result.current.position).toStrictEqual(position({ accuracy: 500 }));
    expect(result.current.error).toBe(undefined);
  });

  it('handle failure', async () => {
    global.navigator.geolocation.getCurrentPosition =
      jest.fn().mockImplementationOnce((...args) => args[1]('Failed'));

    const { result } = renderHook(() => useGeo(false));

    await act(() => result.current.request().then(() => {}, () => {}));

    expect(result.current.status).toBe(Status.ERROR);
    expect(result.current.position).toBe(undefined);
    expect(result.current.error).toBe('Failed');
  });
});