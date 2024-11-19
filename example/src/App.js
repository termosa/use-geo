import React from 'react';
import { useGeo, UseGeoStatus } from 'use-geo';
import pkg from 'use-geo/package.json';

const stringify = value => JSON.stringify(value, null, 2);
const stringifyError = error =>
  `${error.constructor.name}(${JSON.stringify({ code: error.code, message: error.message}, null, 2)})`;

export default () => {
  const { status, position, error, request } = useGeo();

  return (
    <div className="App">
      <h1>use-geo@{pkg.version}</h1>
      <p>
        <input
          type="button"
          onClick={request}
          value="reload"
          disabled={status === UseGeoStatus.Pending}
        />
      </p>
      <pre>useGeo(): {error ? stringifyError(error) : stringify(position)}</pre>
    </div>
  );
};