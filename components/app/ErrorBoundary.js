import {Component} from 'react';
import {unawaited} from '../../src/lib';
import {addError} from '../../src/gql/error';

class ErrorBoundary extends Component {
    state = { hasError: false }

    // eslint-disable-next-line no-unused-vars
    componentDidCatch(error, errorInfo) {
        this.setState({ hasError: true })
        const path = typeof window !== 'undefined' ? window.location.pathname : undefined;
        unawaited(() => addError({err: (error.stack&&error.message).slice(0, 250), path: `ErrorBoundary ${path}`}))
        // логирование
    }

    render() {
        if (this.state.hasError) return <div>Ошибка</div>
        return this.props.children
    }
}

export default ErrorBoundary