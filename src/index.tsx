import * as React from 'react';
import useDefer, { Status } from 'use-defer';
import getCurrentPosition from './getCurrentPosition';

export const useGeo = (immediate: boolean | PositionOptions = true) => {
  const immediateArguments = React.useMemo((): [PositionOptions] | [] | undefined => {
    if (!immediate) return undefined;
    if (typeof immediate === 'boolean') return [];
    return [immediate];
  }, [immediate]);

  const request = useDefer<Position, Error>(getCurrentPosition, [], immediateArguments);

  return {
    status: request.status,
    position: request.value,
    error: request.error,
    request: request.execute,
  };
};

export default useGeo;

export { Status, getCurrentPosition };