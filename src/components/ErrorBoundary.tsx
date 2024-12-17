import React, { useState } from "react";

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

const ErrorBoundary: React.FC<ErrorBoundaryProps> = ({ children }) => {
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    setHasError(true);
  };

  if (hasError) {
    return <h1>Something went wrong. Please try again later.</h1>;
  }

  return (
    // <React.ErrorBoundary onError={handleError}>{children}</React.ErrorBoundary>
    <></>
  );
};

export default ErrorBoundary;
