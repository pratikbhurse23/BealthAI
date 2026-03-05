import React from 'react'

export default class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props)
        this.state = { hasError: false, error: null, info: null }
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error }
    }

    componentDidCatch(error, info) {
        this.setState({ error, info })
        // you could also send the error to a remote logging endpoint here
        // console.error(error, info)
    }

    render() {
        if (!this.state.hasError) return this.props.children

        return (
            <div className="min-h-screen flex items-center justify-center p-4 bg-white dark:bg-black text-gray-900 dark:text-white">
                <div className="max-w-2xl w-full bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
                    <h2 className="text-lg font-bold text-red-700 dark:text-red-300">Application error</h2>
                    <p className="mt-2 text-sm text-red-600 dark:text-red-200">An unexpected error occurred while rendering the application.</p>
                    <details className="mt-4 text-xs text-left text-red-700 dark:text-red-200 whitespace-pre-wrap">
                        {this.state.error && this.state.error.toString()}
                        {this.state.info && this.state.info.componentStack}
                    </details>
                </div>
            </div>
        )
    }
}
