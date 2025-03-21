
import React from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, description }) => {
  return (
    <div className="mb-8 text-center">
      <h1 className="text-3xl md:text-4xl font-display font-bold text-brunch-800 mb-2">
        {title}
      </h1>
      {description && (
        <p className="text-brunch-600 max-w-2xl mx-auto">
          {description}
        </p>
      )}
    </div>
  );
};

export default PageHeader;
