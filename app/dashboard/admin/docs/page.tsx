'use client';

import React from 'react';
import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';

export default function ApiDocs() {
  return (
    <div className="min-h-screen bg-white">
      <div className="p-4 border-b bg-gray-50">
        <h1 className="text-2xl font-bold text-gray-800">SEES API Documentation</h1>
        <p className="text-gray-600">Interactive OpenAPI specification for the SEES platform.</p>
      </div>
      <SwaggerUI url="/api/docs" />
    </div>
  );
}
