import React, { useState, useEffect } from 'react';
import { getCurrentUser } from '../../utils/localStorage';
import { useNavigate } from 'react-router-dom';
import { LOGIN_ROUTE } from '../../helpers/routes';
import './Dashboard.css';
import PackageDetails from '../Packages/PackageDetails'; 

const dummyPackages = [
    { id: 1, name: 'Package A', dateAdded: '2021-01-01' },
    { id: 2, name: 'Package B', dateAdded: '2021-02-01' },
];

function Dashboard() {
    const navigate = useNavigate();
    const [isUserAuthenticated, setIsUserAuthenticated] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [packages, setPackages] = useState(dummyPackages); 
    const [selectedPackage, setSelectedPackage] = useState(null);
    const [sortKey, setSortKey] = useState('name');

    useEffect(() => {
        const currentUser = getCurrentUser();
        if (!currentUser || !currentUser.isAdmin) {
            navigate(LOGIN_ROUTE);
        } else {
            setIsUserAuthenticated(true);
        }
    }, [navigate]);

    useEffect(() => {
        const sortedPackages = [...packages].sort((a, b) => {
            if (sortKey === 'name') {
                return a.name.localeCompare(b.name);
            } else {
                return new Date(a.dateAdded) - new Date(b.dateAdded);
            }
        });
        setPackages(sortedPackages);
    }, [sortKey, packages]);



    const handleFileImport = (event) => {
        const file = event.target.files[0];
        const reader = new FileReader();
        reader.onload = (event) => {
            const packageData = JSON.parse(event.target.result);
            const newPackage = {
                id: packages.length + 1,
                name: packageData.name,
                dateAdded: new Date().toISOString().slice(0, 10),
            };
            setPackages([...packages, newPackage]);
        };
        reader.readAsText(file);
    };
    
    const handlePackageSelect = (pkg) => {
        setSelectedPackage(pkg);
    };

    if (!isUserAuthenticated) {
        return null;
    }

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <input 
                    type="text"
                    className="search-bar"
                    placeholder="Search for packages..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />

                <form className="import-form">
                    <label htmlFor="import-package">Import package:</label>
                    <input type="file" id="import-package" accept=".zip" onChange={handleFileImport} />
                </form>

                <div className="sort-filter">
                    <label htmlFor="sort-packages">Sort by:</label>
                    <select id="sort-packages" onChange={(e) => setSortKey(e.target.value)}>
                        <option value="name">Name</option>
                        <option value="dateAdded">Date Added</option>
                    </select>
                </div>
            </div>

            <div className="package-list">
                {packages.filter(pkg => pkg.name.includes(searchTerm)).map((pkg) => (
                    <div key={pkg.id} className="package-item" onClick={() => handlePackageSelect(pkg)}>
                        <span>{pkg.name}</span>
                        <span>{pkg.dateAdded}</span>
                    </div>
                ))}
            </div>

            {selectedPackage && <PackageDetails package={selectedPackage} />}
        </div>
    );
}

export default Dashboard;
