import React, { useState, useEffect } from 'react';
import { getCurrentUser } from '../../utils/localStorage';
import { useNavigate } from 'react-router-dom';
import { LOGIN_ROUTE } from '../../helpers/routes';
import './Dashboard.css';
import PackageDetails from '../Packages/PackageDetails'; 
import axios from 'axios';

const dummyPackages = [
    { id: 1, name: 'Package A', dateAdded: '2021-01-01' },
    { id: 2, name: 'Package B', dateAdded: '2021-02-01' },
];

function Dashboard() {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    const navigate = useNavigate();
    const [isUserAuthenticated, setIsUserAuthenticated] = useState(true);
    const [isAdmin, setIsAdmin] = useState(true);
    const [showCreateUserForm, setShowCreateUserForm] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [packages, setPackages] = useState(dummyPackages); 
    const [selectedPackage, setSelectedPackage] = useState(null);
    const [sortKey, setSortKey] = useState('name');
    const [newUsername, setNewUsername] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [isNewUserAdmin, setIsNewUserAdmin] = useState(false);
    
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
            const response = await axios.post('/api/users/create', {
                username: newUsername, 
                password: newPassword,
                isAdmin: isNewUserAdmin
            });
            console.log(response.data);
            setNewUsername('');
            setNewPassword('');
            setIsNewUserAdmin(false);
            setShowCreateUserForm(false);
        } catch (error) {
            console.error('Error creating user: ', error);
        }
    };
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
