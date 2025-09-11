import React from 'react';

type FallbackRenderProperties = {
  error: Error | null;
  reset: () => void;
};

type ErrorBoundaryProperties = {
  fallback?: (properties: FallbackRenderProperties) => React.ReactNode;
  children?: React.ReactNode;
};

type ErrorBoundaryState = {
  error: Error | null;
};

export class ErrorBoundary extends React.Component<ErrorBoundaryProperties, ErrorBoundaryState> {
  constructor(properties: ErrorBoundaryProperties) {
    super(properties);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    // Log for debugging; avoid crashing the app.
     
    console.error('ErrorBoundary caught an error:', error, info);
  }

  reset = () => {
    this.setState({ error: null });
  };

  render(): React.ReactNode {
    const { error } = this.state;
    if (error) {
      if (this.props.fallback) return this.props.fallback({ error, reset: this.reset });
      return (
        <div role="alert" style={{ padding: 12, color: 'var(--color-fg)', background: 'rgba(0,0,0,0.4)' }}>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>Something went wrong.</div>
          <pre style={{ whiteSpace: 'pre-wrap' }}>{String(error?.message || error)}</pre>
          <button onClick={this.reset} style={{ marginTop: 8 }}>Try again</button>
        </div>
      );
    }
    return this.props.children ?? null;
  }
}

export default ErrorBoundary;

