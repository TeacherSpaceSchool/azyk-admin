import React from 'react';
import {addError} from '../src/gql/error';
import {unawaited} from '../src/lib';
import {getClientGqlSsr} from '../src/getClientGQL';

function Error({statusCode}) {
    return (
        <div>
            <h1>Ошибка</h1>
            <p>Код ошибки: {statusCode}</p>
        </div>
    );
}

Error.getInitialProps = ({ req, res, err }) => {
    const statusCode = res?.statusCode || err?.statusCode || 500;
    const path = req ? req.url : (typeof window !== 'undefined' ? window.location.href : null);
    if (err)
        unawaited(() => addError({err: (err.stack&&err.message).slice(0, 250), path: `_error ${path}`}, getClientGqlSsr(req)))
    return { statusCode };
};

export default Error;
