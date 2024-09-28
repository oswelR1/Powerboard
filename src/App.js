import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './components/Login';
import ContentManagementUI from './components/ContentManagementUI';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ContentManagementUI />} />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}

export default App;