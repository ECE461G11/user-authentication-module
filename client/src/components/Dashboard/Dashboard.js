import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';
import PackageDetails from '../Packages/PackageDetails'; 
import { registerUser, createPackage, getPackageRating, createMultiplePackages, resetAPI } from '../../api/userAuth';


function Dashboard() {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    const navigate = useNavigate();
    const [isUserAuthenticated, setIsUserAuthenticated] = useState(true);
    const [isAdmin, setIsAdmin] = useState(true);
    const [showCreateUserForm, setShowCreateUserForm] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [packages, setPackages] = useState([]); 
    const [selectedPackage, setSelectedPackage] = useState(null);
    const [sortKey, setSortKey] = useState('name');
    const [newUsername, setNewUsername] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [isNewUserAdmin, setIsNewUserAdmin] = useState(false);


    
    useEffect(() => {
        loadPackages();
    }, []);

    const loadPackages = async () => {
        try {
            const response = await getAllPackage();
            if (response && response.data) {
                setPackages(response.data);
            }
        } catch (error) {
            console.error('Error loading packages: ', error);
        }
    };

    const fetchPackageDetails = async (packageId) => {
        try {
            const response = await getPackage(packageId);
            if (response && response.data) {
                setSelectedPackage(response.data);
            }
        }  catch (error) {
            console.error(`Error fetching details for package ${packageId}: `, error);
        }
    };

    const handlePackageSelect = (pkg) => {
        setSelectedPackage(pkg);
        fetchPackageDetails(pkg.id);
        handleRatePackage(pkg.id);
    };

    const handleRatePackage = async (packageId) => {
        try {
            const rating = await getPackageRating(packageId);
        } catch (error) {
            console.error('Error getting rating: ', error);
        }
    };
    const handleCreateUser = async  (event) => {
        event.preventDefault();
        
        if (newUsername.length < 3){
            alert('Username must be at least 3 characters long');
            return;
        }

        if (!passwordRegex.test(newPassword)) {
            alert('Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.');
            return;
        }


            try {
            const userData = {
                username: newUsername, 
                password: newPassword,
                isAdmin: isNewUserAdmin
            };
            await registerUser(userData);
            setNewUsername('');
            setNewPassword('');
            setIsNewUserAdmin(false);
            setShowCreateUserForm(false);
        } catch (error) {
            console.error('Error creating user: ', error);
        }
    };

    const handleFileImport = async (event) => {
        const file = event.target.files[0];
        const reader = new FileReader();
        reader.onload = async (event) => {
            const packageData = JSON.parse(event.target.result);
            const newPackage = await createPackage(packageData);
            setPackages([...packages, newPackage]);
        };
        reader.readAsText(file);
    };

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

            {isAdmin && (
                    <button onClick={() => setShowCreateUserForm(true)}>
                        Create New User
                    </button>
                )}

            {showCreateUserForm && (
                <form onSubmit={handleCreateUser}>
                    <label>
                        Username:
                        <input 
                            type="text" 
                            value={newUsername}
                            onChange={(e) => setNewUsername(e.target.value)}
                            required 
                        />
                    </label>
                    <label>
                        Password:
                        <input 
                            type="password" 
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required 
                        />
                    </label>
                    <label>
                        Is Admin:
                        <input 
                            type="checkbox" 
                            checked={isNewUserAdmin}
                            onChange={(e) => setIsNewUserAdmin(e.target.checked)}
                        />
                    </label>
                    <button type="submit">Create User</button>
                </form>
            )}

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
