import React from 'react';

/**
 * @file This file contains the ErrorBoundary component, which catches JavaScript errors anywhere in its child component tree.
 */

/**
 * Represents the properties for the fallback render function.
 * @property error - The error that was caught.
 * @property reset - A function to reset the error boundary state.
 */
type FallbackRenderProperties = {
  error: Error | null;
  reset: () => void;
};

/**
 * Represents the properties for the ErrorBoundary component.
 * @property fallback - A function that returns a fallback UI to render when an error is caught.
 * @property children - The child components to render.
 */
type ErrorBoundaryProperties = {
  fallback?: (properties: FallbackRenderProperties) => React.ReactNode;
  children?: React.ReactNode;
};

/**
 * Represents the state for the ErrorBoundary component.
 * @property error - The error that was caught, or null if no error was caught.
 */
type ErrorBoundaryState = {
  error: Error | null;
};

/**
 * A component that catches JavaScript errors anywhere in its child component tree,
 * logs those errors, and displays a fallback UI instead of the component tree that crashed.
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProperties, ErrorBoundaryState> {
  /**
   * Creates an instance of ErrorBoundary.
   * @param properties - The component properties.
   */
  constructor(properties: ErrorBoundaryProperties) {
    super(properties);
    this.state = { error: null };
  }

  /**
   * A static method that is called after an error has been thrown by a descendant component.
   * It receives the error that was thrown as a parameter and should return a value to update state.
   * @param error - The error that was thrown.
   * @returns The new state.
   */
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  /**
   * A lifecycle method that is called after an error has been thrown by a descendant component.
   * @param error - The error that was thrown.
   * @param info - An object with a `componentStack` key containing information about which component threw the error.
   */
  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    // Log for debugging; avoid crashing the app.

    console.error('ErrorBoundary caught an error:', error, info);
  }

  /**
   * Resets the error boundary state.
   */
  reset = () => {
    this.setState({ error: null });
  };

  /**
   * Renders the component.
   * @returns The rendered component.
   */
  render(): React.ReactNode {
    const { error } = this.state;
    if (error) {
      if (this.props.fallback) return this.props.fallback({ error, reset: this.reset });
      return (
        <div
          role="alert"
          style={{ padding: 12, color: 'var(--color-fg)', background: 'rgba(0,0,0,0.4)' }}
        >
          <div style={{ fontWeight: 600, marginBottom: 8 }}>Something went wrong.</div>
          <pre style={{ whiteSpace: 'pre-wrap' }}>{String(error?.message || error)}</pre>
          <button onClick={this.reset} style={{ marginTop: 8 }}>
            Try again
          </button>
        </div>
      );
    }
    return this.props.children ?? null;
  }
}

export default ErrorBoundary;
