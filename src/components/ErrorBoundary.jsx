import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center h-screen bg-red-100">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-800 mb-4">Oops! Something went wrong.</h1>
            <p className="text-red-600">We're sorry for the inconvenience. Please try refreshing the page or contact support if the problem persists.</p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
