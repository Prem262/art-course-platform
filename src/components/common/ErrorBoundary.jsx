import React, { Component } from 'react';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = "/dashboard";
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-page-container">
          <div className="error-page-box">
            <div className="error-page-icon">
              ⚠️
            </div>
            <h2 className="error-page-title">Something went wrong</h2>
            <p className="error-page-desc">
              An unexpected error occurred while loading this view. You can return to your dashboard to continue learning.
            </p>
            <button onClick={this.handleReset} className="btn btn-primary" style={{ width: '100%' }}>
              Back to Dashboard
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
