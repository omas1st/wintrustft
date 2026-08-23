import React from 'react';
import {
  LuLandmark as Landmark,
  LuHouse as Home,
  LuLogOut as LogOut,
} from 'react-icons/lu';
import './ErrorBoundary.css';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info);
  }
  handleReset = () => {
    window.location.reload();
  };
  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="content">
            <Landmark />
            <h2>Session Navigation Restored</h2>
            <p>We detected a temporary display glitch. You can safely return to the home page or restart your banking session.</p>
            <button onClick={this.handleReset}><Home /> Go to Home / Dashboard</button>
            <button onClick={() => { sessionStorage.clear(); window.location.reload(); }}><LogOut /> Sign Out & Return to Login</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}