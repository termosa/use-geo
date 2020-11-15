import React from 'react';
import useGeo, { Status } from 'use-geo';
import { version } from 'use-geo/package.json';

const stringify = value => JSON.stringify(value, null, 2);
const stringifyError = error =>
  `${error.constructor.name}(${JSON.stringify({ code: error.code, message: error.message}, null, 2)})`;

export default () => {
  const { status, position, error, request } = useGeo();

  const reload = () => { request() };

  return (
    <div className="App">
      <h1>use-geo@{version}</h1>
      <p>
        <input
          type="button"
          onClick={reload}
          value="reload"
          disabled={status === Status.PENDING}
        />
      </p>
      <pre>useGeo(): {error ? stringifyError(error) : stringify(position)}</pre>
    </div>
  );
};