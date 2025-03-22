import React, { useState, useEffect } from 'react';
import { User, Settings, Check, X, AlertCircle, FileText, Clock, Globe, BookOpen } from 'lucide-react';

// Updated User Interface to include lab-specific fields
interface UserType {
  id: string;
  role: 'doctor' | 'lab' | 'pharmacy' | 'admin';
  name: string;
  email: string;
  phone: string;
  location: string;
  experience: number;
  status: 'pending' | 'verified' | 'rejected';
  photo?: string;
  labName?: string;
  certificate?: string;
  qualifications?: string[];
  languagesSpoken?: string[];
  address?: string;
  availability?: {
    days: string[];
    startTime: string;
    endTime: string;
  };
}

export function UserList() {
  const [users, setUsers] = useState<UserType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string>('');

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
    } else {
      setError('No authentication token found');
      setIsLoading(false);
    }
  }, []);

  const fetchUsers = async () => {
    if (!token) {
      setError('Authentication token is missing');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      
      // Fetch users, pharmacies, and labs
      const [usersResponse, pharmaciesResponse, labsResponse] = await Promise.all([
        fetch('http://localhost:8000/api/users', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch('http://localhost:8000/api/pharmacy/all', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch('http://localhost:8000/api/lab/all', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
      ]);

      const [usersData, pharmaciesData, labsData] = await Promise.all([
        usersResponse.json(),
        pharmaciesResponse.json(),
        labsResponse.json()
      ]);

      // Combine and normalize the data
      const combinedUsers = [
        ...usersData,
        ...pharmaciesData.map((pharmacy: any) => ({
          ...pharmacy,
          role: 'pharmacy',
          name: pharmacy.labName
        })),
        ...labsData.map((lab: any) => ({
          ...lab,
          role: 'lab',
          name: lab.labName
        }))
      ];

      setUsers(combinedUsers);
      setIsLoading(false);
    } catch (err: any) {
      console.error('Fetch error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch users');
      setIsLoading(false);
    }
  };

  const handleVerify = async (userId: string, status: 'verified' | 'rejected', role: string) => {
    try {
      // Choose endpoint based on role
      const endpoint = role === 'pharmacy'
        ? 'http://localhost:8000/api/pharmacy/verify'
        : role === 'lab'
        ? 'http://localhost:8000/api/lab/verify'
        : 'http://localhost:8000/api/verify-user';

      const payload = role === 'pharmacy' 
        ? { pharmacyId: userId, status }
        : role === 'lab'
        ? { LabId: userId, status }
        : { userId, status };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      // Update local state
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId 
            ? { ...user, status: data.user?.status || data.pharmacy?.status || data.lab?.status } 
            : user
        )
      );
    } catch (err: any) {
      console.error('Verification error:', err);
      setError(err.response?.data?.message || err.message || 'Verification failed');
    }
  };

  useEffect(() => {
    if (token) {
      fetchUsers();
    }
  }, [token]);

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'verified':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const formatTime = (time: string) => {
    try {
      return new Date(`2000-01-01T${time}`).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch {
      return time;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <AlertCircle className="inline-block mr-2" />
          {error}
          <button 
            onClick={fetchUsers} 
            className="ml-4 bg-blue-500 text-white px-3 py-1 rounded"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">User Verification</h2>
      
      {users.length === 0 ? (
        <div className="text-center text-gray-500">No users found</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map((user) => (
            <div 
              key={user.id} 
              className="bg-white shadow-md rounded-lg overflow-hidden"
            >
              <div className="p-6">
                {/* Profile Header */}
                <div className="flex items-center mb-4">
                  {user.photo ? (
                    <img 
                      src={`http://localhost:8000/uploads/${user.photo}`} 
                      alt={user.name} 
                      className="w-20 h-20 rounded-full object-cover mr-4"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>';
                      }}
                    />
                  ) : (
                    <div className="w-20 h-20 bg-gray-200 rounded-full mr-4 flex items-center justify-center">
                      <User className="w-8 h-8 text-gray-500" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-lg font-semibold">{user.name || user.labName}</h3>
                    <p className="text-gray-500">{user.email}</p>
                    <p className="text-gray-500">{user.phone}</p>
                  </div>
                </div>

                {/* User Details */}
                <div className="space-y-3">
                  <div className="flex items-center">
                    <span className="font-semibold w-24">Role:</span>
                    <span className="capitalize">{user.role}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <span className="font-semibold w-24">Location:</span>
                    <span>{user.location}</span>
                  </div>

                  {(user.role === 'lab' || user.role === 'pharmacy') && user.address && (
                    <div className="flex items-center">
                      <span className="font-semibold w-24">Address:</span>
                      <span>{user.address}</span>
                    </div>
                  )}

                  <div className="flex items-center">
                    <span className="font-semibold w-24">Experience:</span>
                    <span>{user.experience} years</span>
                  </div>

                  {/* Role-specific details */}
                  {user.role === 'doctor' && (
                    <>
                      {user.qualifications && user.qualifications.length > 0 && (
                        <div className="flex">
                          <span className="font-semibold w-24 flex items-center">
                            <BookOpen className="w-4 h-4 mr-2" />
                            Quals:
                          </span>
                          <span className="flex flex-wrap gap-1">
                            {user.qualifications.map((qual, idx) => (
                              <span 
                                key={idx}
                                className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                              >
                                {qual}
                              </span>
                            ))}
                          </span>
                        </div>
                      )}

                      {user.languagesSpoken && user.languagesSpoken.length > 0 && (
                        <div className="flex">
                          <span className="font-semibold w-24 flex items-center">
                            <Globe className="w-4 h-4 mr-2" />
                            Languages:
                          </span>
                          <span className="flex flex-wrap gap-1">
                            {user.languagesSpoken.map((lang, idx) => (
                              <span 
                                key={idx}
                                className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded"
                              >
                                {lang}
                              </span>
                            ))}
                          </span>
                        </div>
                      )}
                    </>
                  )}

                  {/* Availability section for doctors, pharmacies, and labs */}
                  {(user.role === 'doctor' || user.role === 'pharmacy' || user.role === 'lab') && user.availability && (
                    <div className="mt-3 bg-gray-50 p-3 rounded">
                      <div className="flex items-center mb-2">
                        <Clock className="w-4 h-4 mr-2" />
                        <span className="font-semibold">Availability</span>
                      </div>
                      <div className="text-sm">
                        <div className="mb-1">
                          Days: {user.availability.days.join(', ')}
                        </div>
                        <div>
                          Time: {formatTime(user.availability.startTime)} - {formatTime(user.availability.endTime)}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Status Badge */}
                  <div className="mt-4">
                    <span className="font-semibold">Status: </span>
                    <span 
                      className={`px-2 py-1 rounded text-xs ${getStatusBadgeColor(user.status)}`}
                    >
                      {user.status}
                    </span>
                  </div>
                </div>

                {/* Certificate Display */}
                {user.certificate && (
                  <div className="mt-4 border-t pt-4">
                    <div className="flex items-center mb-2">
                      <FileText className="w-4 h-4 mr-2 text-blue-600" />
                      <span className="font-semibold">Certificate</span>
                    </div>
                    {user.certificate.toLowerCase().endsWith('.pdf') ? (
                      <iframe 
                        src={`http://localhost:8000/uploads/${user.certificate}`}
                        width="100%" 
                        height="200" 
                        className="mt-2 border rounded"
                      />
                    ) : (
                      <img 
                        src={`http://localhost:8000/uploads/${user.certificate}`} 
                        alt="Certificate" 
                        className="mt-2 max-h-48 object-cover rounded"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    )}
                  </div>
                )}
              </div>

              {/* Verification Buttons */}
              {user.status === 'pending' && (
                <div className="flex justify-between p-4 bg-gray-50">
                  <button
                    onClick={() => handleVerify(user.id, 'verified', user.role)}
                    className="flex-1 mr-2 bg-green-500 text-white py-2 rounded hover:bg-green-600 flex items-center justify-center"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Verify
                  </button>
                  <button
                    onClick={() => handleVerify(user.id, 'rejected', user.role)}
                    className="flex-1 ml-2 bg-red-500 text-white py-2 rounded hover:bg-red-600 flex items-center justify-center"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default UserList;