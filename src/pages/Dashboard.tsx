import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * Dashboard redirects cleanly to the unified YARA Robotics Academy (/learn)
 * to avoid fractured layouts and redundant page hops.
 */
export default function Dashboard() {
  return <Navigate to="/learn" replace />;
}
