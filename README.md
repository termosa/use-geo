# use-geo

> Make use of browser geolocation API

[![NPM](https://img.shields.io/npm/v/use-geo.svg)](https://www.npmjs.com/package/use-geo) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Install

```bash
npm install --save use-geo
```

## Usage

```tsx
import * as React from 'react';

import useGeo from 'use-geo';
// Or import { useGeo } from 'use-geo';

const stringifyResults = (status, position, error) => {
  if (error) return `Error(${error.message})`;
  if (position) return `{\n  lat: ${position.coords.latitude},\n  long: ${position.coords.longitude}\n}`;
  return status;
};

export default () => {
  const { status, position, error, request } = useGeo(/* immediate flag (boolean) or PositionOptions object */);

  return (
    <div>
      <input
        type="button"
        value="reload"
        onClick={request}
        disabled={status === Status.PENDING}
      />
      <pre>useGeo(): {stringifyResults(status, position, error)}</pre>
    </div>
  );
};
```

## License

MIT © [termosa](https://github.com/termosa)

---

This hook is created using [create-react-hook](https://github.com/hermanya/create-react-hook).
