import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "../store";
import WhopApiClient from "../services/WhopApiClient";

const LicensePage: React.FC = () => {
  const accessToken = useAppStore((state) => state.user?.accessToken);
  const setLicenseKey = useAppStore((state) => state.setLicenseKey);

  const handleLogout = () => {
    // setAccessToken(null)
    // setExpirationTime(-1)
    // setRefreshToken(null)
    // setLicenseKey(null)
    navigate("/"); // Redirect to root
  };

  const navigate = useNavigate();
  const [licenses, setAllLicense] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const apiClient = new WhopApiClient(accessToken!);
      try {
        await apiClient.getCurrentUser();
        const allLicense:any = await apiClient.getAllLicenseData();
        setAllLicense(allLicense);

        // Set license data based on API response if needed
      } catch (error:any) {
        navigate("/login", {
          state: { message: "Please login to continue" },
        });
      }
    };

    fetchData();
  }, [accessToken, navigate]);

  // useEffect(() => {
    // setLicenseKey(null);
  // }, []);

  const handleChooseLicense = async (key: string) => {
    try {
      // Call the main process to set the license key
      const result = await window.store.setLicense(key);

      if (result.success) {
        const currentUser = useAppStore.getState().user;
        const accessToken = currentUser?.accessToken;
        const refreshToken = currentUser?.refreshToken;
        const expirationTime = currentUser?.expirationTime;

        if (!accessToken) {
          console.error('No access token available');
          navigate("/login");
          return;
        }

        // Call auth:login again with the current tokens
        const loginResult = await window.store.login(
          accessToken,
          refreshToken || null,
          expirationTime || null
        );
        console.log(loginResult)

        // Redirect based on the login result
        if (loginResult.success) {
          if (loginResult.needsLicense) {
            // If still needs license (should not happen), stay on license page
            console.warn('Still needs license after setting license key');
          } else {
            // If login is successful and license is not needed, redirect to home
            window.location.href = '/#/';
          }
        } else {
          console.error('Login failed after setting license:', loginResult.error);
          navigate("/login");
        }
      } else {
        console.error('Failed to set license key:', result.error);
      }
    } catch (error) {
      console.error('Error setting license key:', error);
      navigate("/login");
    }
  };

  return (
    <div className="fixed inset-0 w-full h-full p-8 bg-black text-white flex flex-col items-center justify-center overflow-auto">
      <h1 className="text-4xl font-bold mb-8">Please choose a license</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl mb-8">
        {licenses.map((license:any, index) => (
          <div
            key={index}
            className="bg-gray-900 rounded-lg shadow-lg p-6 text-center"
          >
            <h3 className="text-xl font-semibold mb-4">{license.productName}</h3>
            <p className="mb-4 text-sm text-gray-400">
              License Key: <span className="text-white">{license.licenseKey}</span>
            </p>
            {license.isUsed ? (
              <p className="text-red-500 font-semibold">Used on another machine</p>
            ) : (
              <button
                onClick={() => handleChooseLicense(license.licenseKey)}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
              >
                Choose
              </button>
            )}
          </div>
        ))}
      </div>
      <button
        className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
        onClick={handleLogout}
      >
        Logout
      </button>
    </div>
  );
};

export default LicensePage;
