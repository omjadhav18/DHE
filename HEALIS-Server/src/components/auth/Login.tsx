import React, { useState } from 'react';
import { UserRole } from '../../App';
import { Mail, Lock, User, MapPin, Calendar, Phone, Image, FileText, AlertCircle } from 'lucide-react';

interface LoginProps {
  onLogin: (user: any) => void;
  onSwitchToRegister: () => void;
}

export function Login({ onLogin, onSwitchToRegister }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('doctor');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (role === 'admin' &&
      email === 'care.healis@gmail.com' &&
      password === 'Admin@123') {
      try {
        const response = await fetch('http://localhost:8000/api/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password, role })
        });

        if (!response.ok) {
          throw new Error('Login failed');
        }

        const data = await response.json();
        localStorage.setItem('token', data.token);
        localStorage.setItem('userRole', data.user.role);
        onLogin(data.user);
      } catch (err) {
        setError('Login failed. Please try again.');
      }
      return;
    }
    try {
      // Use role-specific endpoint for login
      const endpoint = role === 'pharmacy'
        ? 'http://localhost:8000/api/pharmacy/login'
        : role === 'lab'
          ? 'http://localhost:8000/api/lab/login'
          : 'http://localhost:8000/api/login';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          role
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }

      const data = await response.json();
      localStorage.setItem('token', data.token);
      localStorage.setItem('userRole', role);
      if (role === 'lab') {
        localStorage.setItem('userId', data.lab.id);
        localStorage.setItem('userName', data.lab.labName);
        onLogin(data.lab);
      } else if (role === 'pharmacy') {
        localStorage.setItem('userId', data.pharmacy.id);
        localStorage.setItem('userName', data.pharmacy.pharmacyName);
        onLogin(data.pharmacy);
      } else {
        localStorage.setItem('userId', data.user.id);
        localStorage.setItem('userName', data.user.name);
        onLogin(data.user);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
    }
  };
  const setAdminDefaults = () => {
    if (role === 'admin') {
      setEmail('care.healis@gmail.com');
      setPassword('Admin@123');
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br  flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-2xl p-8">
        <div className="text-center mb-8">
          <div className="flex justify-center items-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-activity h-8 w-8 text-[#4CAFEB]">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
            </svg>
            <span className="ml-2 text-3xl font-bold bg-gradient-to-r from-[#4CAFEB] to-cyan-500 text-transparent bg-clip-text">
              Healis
            </span>
          </div>
          <p className="text-gray-600 mt-2">Professional Healthcare Management</p>
        </div>


        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Professional Role
            </label>
            <select
              value={role}
              onChange={(e) => {
                const newRole = e.target.value as UserRole;
                setRole(newRole);
                if (newRole === 'admin') {
                  setAdminDefaults();
                } else {
                  setEmail('');
                  setPassword('');
                }
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="doctor">Doctor</option>
              <option value="lab">Lab Technician</option>
              <option value="pharmacy">Pharmacist</option>
              <option value="admin">Administrator</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Professional Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="your@hospital.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Sign In
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Forgot your password?{' '}
            <button className="text-blue-600 hover:text-blue-700">
              Contact IT Support
            </button>
          </p>
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <button
              onClick={onSwitchToRegister}
              className="text-blue-600 hover:text-blue-700"
            >
              Register
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}


interface RegisterProps {
  onRegister: (user: any) => void;
  onSwitchToLogin: () => void;
}

export function Register({ onRegister, onSwitchToLogin }: RegisterProps) {
  const [role, setRole] = useState<UserRole>('doctor');
  const [formData, setFormData] = useState({
    name: '',
    labName: '',
    experience: '',
    dob: '',
    email: '',
    phone: '',
    password: '',
    photo: null as File | null,
    address: '',
    location: '',
    certificate: null as File | null,
    specialities: '', // Changed from speciality to specialities
    qualifications: '' as string,
    languagesSpoken: '' as string,
    availableDays: [] as string[],
    startTime: '',
    endTime: ''
  });
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'photo' | 'certificate') => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({
        ...prev,
        [field]: e.target.files![0]
      }));
    }
  };

  // Modify handleSubmit method
  // Inside the Register function
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (role === 'lab') {
      const formDataToSend = new FormData();
      formDataToSend.append('role', 'lab');
      formDataToSend.append('labName', formData.labName);
      formDataToSend.append('experience', formData.experience);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('phone', formData.phone);
      formDataToSend.append('password', formData.password);
      formDataToSend.append('location', formData.location);
      formDataToSend.append('address', formData.address);
      // Availability details
      formDataToSend.append('startTime', formData.startTime);
      formDataToSend.append('endTime', formData.endTime);
      formDataToSend.append('availableDays', JSON.stringify(formData.availableDays));
      if (formData.photo) {
        formDataToSend.append('photo', formData.photo);
      }
      if (formData.certificate) {
        formDataToSend.append('certificate', formData.certificate);
      }
      try {
        console.log('Submitting pharmacy registration with data:', {
          startTime: formData.startTime,
          endTime: formData.endTime,
          availableDays: formData.availableDays
        });

        const response = await fetch('http://localhost:8000/api/lab/register', {
          method: 'POST',
          body: formDataToSend,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Registration failed');
        }

        const data = await response.json();
        setSubmitted(true);
      } catch (err) {
        console.error('Registration error:', err);
        setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
      }
    }

    // In handleSubmit method for pharmacy registration
    else if (role === 'pharmacy') {
      const formDataToSend = new FormData();
      formDataToSend.append('role', 'pharmacy');
      formDataToSend.append('labName', formData.labName);
      formDataToSend.append('experience', formData.experience);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('phone', formData.phone);
      formDataToSend.append('password', formData.password);
      formDataToSend.append('location', formData.location);
      formDataToSend.append('address', formData.address);
      // Availability details
      formDataToSend.append('startTime', formData.startTime);
      formDataToSend.append('endTime', formData.endTime);
      formDataToSend.append('availableDays', JSON.stringify(formData.availableDays));

      // Files
      if (formData.photo) {
        formDataToSend.append('photo', formData.photo);
      }
      if (formData.certificate) {
        formDataToSend.append('certificate', formData.certificate);
      }

      try {
        console.log('Submitting pharmacy registration with data:', {
          startTime: formData.startTime,
          endTime: formData.endTime,
          availableDays: formData.availableDays
        });

        const response = await fetch('http://localhost:8000/api/pharmacy/register', {
          method: 'POST',
          body: formDataToSend,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Registration failed');
        }

        const data = await response.json();
        setSubmitted(true);
      } catch (err) {
        console.error('Registration error:', err);
        setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
      }
    } else {
      // Handle doctor registration
      // Add doctor-specific fields
      const formDataToSend = new FormData();
      // In the doctor registration section of handleSubmit method
      if (role === 'doctor') {
        formDataToSend.append('role', 'doctor'); // Add this line
        formDataToSend.append('name', formData.name);
        formDataToSend.append('experience', formData.experience);
        formDataToSend.append('dob', formData.dob);
        formDataToSend.append('email', formData.email);
        formDataToSend.append('phone', formData.phone);
        formDataToSend.append('password', formData.password);
        formDataToSend.append('location', formData.location);
        formDataToSend.append('address', formData.address);
        // Existing code for certificate and photo
        if (formData.certificate) {
          formDataToSend.append('certificate', formData.certificate);
        }
        if (formData.photo) {
          formDataToSend.append('photo', formData.photo);
        }

        // Stringify complex fields
        formDataToSend.append('qualifications', JSON.stringify(formData.qualifications.split(',')));
        formDataToSend.append('languagesSpoken', JSON.stringify(formData.languagesSpoken.split(',')));
        formDataToSend.append('availableDays', JSON.stringify(formData.availableDays));
        formDataToSend.append('startTime', formData.startTime);
        formDataToSend.append('endTime', formData.endTime);
        formDataToSend.append('specialities', JSON.stringify(formData.specialities.split(',')));
      }

      try {
        const response = await fetch('http://localhost:8000/api/register', {
          method: 'POST',
          body: formDataToSend,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Registration failed');
        }

        const data = await response.json();
        setSubmitted(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
      }
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br  flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-2xl p-8 text-center">
          <div className="mb-6">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Registration Submitted</h2>
          <p className="text-gray-600 mb-6">
            Thank you for registering with Healis. Your application is pending admin verification.
            You will receive an email once your account has been verified.
          </p>
          <button
            onClick={onSwitchToLogin}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br  flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full bg-white rounded-lg shadow-2xl p-8">
      <div className="text-center mb-8">
          <div className="flex justify-center items-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-activity h-8 w-8 text-[#4CAFEB]">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
            </svg>
            <span className="ml-2 text-3xl font-bold bg-gradient-to-r from-[#4CAFEB] to-cyan-500 text-transparent bg-clip-text">
              Healis
            </span>
          </div>
          <p className="text-gray-600 mt-2">Professional Healthcare Management</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Professional Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="doctor">Doctor</option>
              <option value="lab">Lab Technician</option>
              <option value="pharmacy">Pharmacist</option>
            </select>
          </div>

          {role === 'doctor' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Dr. John Doe"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Years of Experience
                </label>
                <input
                  type="number"
                  value={formData.experience}
                  onChange={(e) => setFormData(prev => ({ ...prev, experience: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="10"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date of Birth
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="date"
                    value={formData.dob}
                    onChange={(e) => setFormData(prev => ({ ...prev, dob: e.target.value }))}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Certificate
                </label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="file"
                    onChange={(e) => handleFileChange(e, 'certificate')}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Qualifications
                </label>
                <input
                  type="text"
                  value={formData.qualifications}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    qualifications: e.target.value
                  }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                  placeholder="MD, MBBS, Specialization"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Languages Spoken
                </label>
                <input
                  type="text"
                  value={formData.languagesSpoken}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    languagesSpoken: e.target.value
                  }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                  placeholder="English, Hindi, Spanish"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Available Days
                </label>
                <select
                  multiple
                  value={formData.availableDays}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    availableDays: Array.from(e.target.selectedOptions, option => option.value)
                  }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                >
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
              </div>
              <div className="flex space-x-4">
                <div className="w-1/2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      startTime: e.target.value
                    }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div className="w-1/2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      endTime: e.target.value
                    }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md"
                  />
                </div>

              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Specialities
                </label>
                <input
                  type="text"
                  value={formData.specialities}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    specialities: e.target.value
                  }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Cardiology, General Medicine, Pediatrics"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Enter specialities separated by commas
                </p>
              </div>
            </>
          )}

          {(role === 'lab' || role === 'pharmacy') && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {role === 'lab' ? 'Lab Name' : 'Pharmacy Name'}
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={formData.labName}
                    onChange={(e) => setFormData(prev => ({ ...prev, labName: e.target.value }))}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={role === 'lab' ? 'City Lab Services' : 'City Pharmacy'}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Years in Operation
                </label>
                <input
                  type="number"
                  value={formData.experience}
                  onChange={(e) => setFormData(prev => ({ ...prev, experience: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="5"
                />
              </div>
            </>
          )}
          {role === 'lab' && (
            <>
              <div className="flex space-x-4">
                <div className="w-1/2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      startTime: e.target.value
                    }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div className="w-1/2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      endTime: e.target.value
                    }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Available Days
                </label>
                <select
                  multiple
                  value={formData.availableDays}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    availableDays: Array.from(e.target.selectedOptions, option => option.value)
                  }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                >
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Certificate
                </label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="file"
                    onChange={(e) => handleFileChange(e, 'certificate')}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                </div>
              </div>

            </>
          )}
          {role === 'pharmacy' && (
            <>
              <div className="flex space-x-4">
                <div className="w-1/2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      startTime: e.target.value
                    }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div className="w-1/2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      endTime: e.target.value
                    }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Available Days
                </label>
                <select
                  multiple
                  value={formData.availableDays}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    availableDays: Array.from(e.target.selectedOptions, option => option.value)
                  }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                >
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Certificate
                </label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="file"
                    onChange={(e) => handleFileChange(e, 'certificate')}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                </div>
              </div>
            </>
          )}

          {/* Common fields for all roles */}
          {/* New Address Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                address: e.target.value
              }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-md"
              placeholder="MD, MBBS, Specialization"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="your@email.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="+1 (555) 000-0000"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="City, State"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Photo
            </label>
            <div className="relative">
              <Image className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="file"
                onChange={(e) => handleFileChange(e, 'photo')}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                accept="image/*"
              />
            </div>
          </div>

          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Register
          </button>
        </form>
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <button
              onClick={onSwitchToLogin}
              className="text-blue-600 hover:text-blue-700"
            >
              Login
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}