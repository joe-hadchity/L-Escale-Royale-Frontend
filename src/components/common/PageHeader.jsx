import React from 'react';

const PageHeader = ({ title }) => {
    return (
        <div className="bg-gray-100 text-gray-800 py-4 px-6 mb-4">
            <h1 className="text-2xl font-bold">{title}</h1>
        </div>
    );
};

export default PageHeader;
