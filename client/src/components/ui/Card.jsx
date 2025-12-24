import React from 'react';

const Card = ({ children, className = '', title, action }) => {
    return (
        <div className={`card animate-fade-in ${className}`}>
            {(title || action) && (
                <div className="flex justify-between items-center mb-6">
                    {title && <h3 className="text-xl font-bold text-surface-900 tracking-tight">{title}</h3>}
                    {action && <div>{action}</div>}
                </div>
            )}
            {children}
        </div>
    );
};

export default Card;
