import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({ title, description, name, type, noindex }) => {
    return (
        <Helmet>
            { /* Standard metadata tags */}
            <title>{title}</title>
            <meta name='description' content={description} />

            { /* End Standard metadata tags */}

            { /* Facebook tags */}
            <meta property="og:type" content={type} />
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />

            { /* Twitter tags */}
            <meta name="twitter:creator" content={name} />
            <meta name="twitter:card" content={type} />
            <meta name="twitter:title" content={title} />
            <meta name="twitter:description" content={description} />

            { /* Robots tag */}
            {noindex && <meta name="robots" content="noindex, nofollow" />}
        </Helmet>
    )
}

// Default props
SEO.defaultProps = {
    title: 'SchoolDesk - Smart School Management System',
    description: 'SchoolDesk is a comprehensive school management software that simplifies administrative tasks, connecting teachers, students, and parents.',
    name: 'SchoolDesk',
    type: 'website',
    noindex: false
};

export default SEO;
