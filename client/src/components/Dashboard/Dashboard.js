import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";
import PackageDetails from "../Packages/PackageDetails";
import {
  getAllPackage,
  // getPackage,
  registerUser,
  // createPackage,
  getPackageRating,
  createMultiplePackages,
  resetAPI,
} from "../../api/userAuth";

function Dashboard() {
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  const navigate = useNavigate();
  const [isUserAuthenticated, setIsUserAuthenticated] = useState(true);
  const [isAdmin, setIsAdmin] = useState(true);
  const [showCreateUserForm, setShowCreateUserForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [packages, setPackages] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [sortKey, setSortKey] = useState("name");
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isNewUserAdmin, setIsNewUserAdmin] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [packageToDelete, setPackageToDelete] = useState(null);

  useEffect(() => {
    loadPackages();
  }, []);

  const loadPackages = async () => {
    try {
      const params = { limit: 10, offset: 0 };
      const response = await getAllPackage(params, navigate);
      if (response) {
        setPackages(response);
      }
    } catch (error) {
      console.error("Error loading packages: ", error);
    }
  };

  // const fetchPackageDetails = async (packageId) => {
  //   try {
  //     const response = await getPackage(packageId);
  //     if (response && response.data) {
  //       setSelectedPackage(response.data);
  //     }
  //   } catch (error) {
  //     console.error(`Error fetching details for package ${packageId}: `, error);
  //   }
  // };
  const handleResetRegistry = async () => {
    try {
      const response = await resetAPI(navigate);
      if (response) {
        console.log("Registry reset");
        setPackages([]);
      }
    } catch (error) {
      console.error("Error resetting registry: ", error);
    }
  };

  const handlePackageSelect = async (pkg) => {
    setSelectedPackage(pkg);
    const packageQueries = { Name: pkg.name, Version: pkg.version };
    setPackageToDelete(pkg);
    // await fetchPackageDetails(packageQueries);
    // await handleRatePackage(pkg.id);
  };

  const deletePackage = async () => {
    setShowDeleteConfirm(false);
  };
  // const handleRatePackage = async (packageId) => {
  //   try {
  //     const rating = await getPackageRating(packageId);
  //   } catch (error) {
  //     console.error("Error getting rating: ", error);
  //   }
  // };
  const handleCreateUser = async (event) => {
    event.preventDefault();
    try {
      const userData = {
        User: {
          name: newUsername,
          isAdmin: isNewUserAdmin,
        },
        Secret: {
          password: newPassword,
        },
      };
      await registerUser(userData);
      setNewUsername("");
      setNewPassword("");
      setIsNewUserAdmin(false);
      setShowCreateUserForm(false);
    } catch (error) {
      console.error("Error creating user: ", error);
    }
  };

  const handleFileImport = async (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = async (event) => {
      const packageData = JSON.parse(event.target.result);
      // const newPackage = await createPackage(packageData);
      // setPackages([...packages, newPackage]);
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
          <input
            type="file"
            id="import-package"
            accept=".zip"
            onChange={handleFileImport}
          />
        </form>

        <div className="sort-filter">
          <label htmlFor="sort-packages">Sort by:</label>
          <select
            id="sort-packages"
            onChange={(e) => setSortKey(e.target.value)}
          >
            <option value="name">Name</option>
            <option value="dateAdded">Date Added</option>
          </select>
        </div>
      </div>

      <div className="packages-list-header">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Version</th>
              <th>ID</th>
            </tr>
          </thead>
          <tbody>
            {packages?.map((pkg) => (
              <tr key={pkg._id}>
                <td>{pkg?.metadata?.Name}</td>
                <td>{pkg?.metadata?.Version}</td>
                <td>{pkg?.metadata?.ID}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isAdmin && (
        <>
          <button onClick={() => setShowCreateUserForm(!showCreateUserForm)}>
            {showCreateUserForm ? "Close" : "Create New User"}
          </button>
          <button onClick={handleResetRegistry}>Reset Registry</button>
        </>
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
      {showDeleteConfirm && (
        <div>
          <p>Are you sure you want to delete {packageToDelete.name}?</p>
          <button onClick={deletePackage}>Yes</button>
          <button onClick={() => setShowDeleteConfirm(false)}>No</button>
        </div>
      )}
      <div className="package-list">
        {packages
          .filter((pkg) => pkg?.name?.includes(searchTerm))
          .map((pkg) => (
            <div
              key={pkg.id}
              className="package-item"
              onClick={() => handlePackageSelect(pkg)}
            >
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
