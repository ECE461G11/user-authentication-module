import React from 'react';
import './PackageDetails.css'; 

const PackageDetails = ({ p, closeDetails }) => {
    if (!p) {
        return null;
    }

    return (
        <div className="package-details-container">
            <div className="package-details-header">
                <h2>Package Details</h2>
                <button className="close-button" onClick={closeDetails}>×</button>
            </div>
            <div className="package-details-body">
                <h3>{p.name}</h3>
                <p><strong>Date Added:</strong> {p.dateAdded}</p>
                <p><strong>Description:</strong> {p.description || 'No description available.'}</p>
                {/*more details here */}
            </div>
        </div>
    );
};

export default PackageDetails;
