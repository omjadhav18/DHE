import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, MoreVertical } from 'lucide-react';
import axios from 'axios';
import Button from '../shared/Button';
import { format } from 'date-fns';
import { toast } from 'react-toastify';

interface Appointment {
  _id: string;
  doctor: {
    name: string;
    specialty: string;
  };
  appointmentDate: string;
  appointmentTime: string;
  status: string;
}

const AppointmentsList = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        // Get userId from local storage
        const userId = localStorage.getItem('userId');
        
        if (!userId) {
          toast.error('Please log in to view appointments');
          setIsLoading(false);
          return;
        }

        // Fetch appointments
        const response = await axios.get(`/appointments/${userId}`);
        
        setAppointments(response.data.appointments);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching appointments', error);
        toast.error('Failed to load appointments');
        setIsLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  // Cancel Appointment Handler
  const handleCancelAppointment = async (appointmentId: string) => {
    try {
      // Implement cancel appointment logic
      // You might want to add a backend route to handle cancellation
      await axios.patch(`/appointments/${appointmentId}/cancel`);
      
      // Remove the cancelled appointment from the list
      setAppointments(prev => 
        prev.filter(appointment => appointment._id !== appointmentId)
      );
      
      toast.success('Appointment cancelled successfully');
    } catch (error) {
      console.error('Error cancelling appointment', error);
      toast.error('Failed to cancel appointment');
    }
  };

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-6 shadow-lg"
      >
        <div className="text-center text-gray-500">Loading appointments...</div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-6 shadow-lg"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          {appointments.length > 0 ? 'Upcoming Appointments' : 'No Upcoming Appointments'}
        </h2>
        {appointments.length > 0 && (
          <Button variant="outline" size="sm">View All</Button>
        )}
      </div>

      <div className="space-y-4">
        {appointments.map((appointment) => (
          <motion.div
            key={appointment._id}
            whileHover={{ scale: 1.02 }}
            className="p-4 rounded-xl border border-gray-200 hover:border-blue-200 
              hover:shadow-md transition-all duration-300"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">
                  {appointment.doctor.name}
                </h3>
                <p className="text-blue-600 text-sm">
                  {appointment.doctor.specialty}
                </p>
              </div>
              <div className="relative">
                <button className="p-1 rounded-full hover:bg-gray-100 transition-colors">
                  <MoreVertical className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-4">
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">
                  {format(new Date(appointment.appointmentDate), 'PPP')}
                </span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="w-4 h-4" />
                <span className="text-sm">{appointment.appointmentTime}</span>
              </div>
              {/* Optional: Add location if available in the schema */}
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">TBD</span>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <span className={`px-3 py-1 rounded-full text-sm
                ${appointment.status === 'Confirmed'
                  ? 'bg-green-100 text-green-600'
                  : appointment.status === 'Cancelled'
                  ? 'bg-red-100 text-red-600'
                  : 'bg-amber-100 text-amber-600'
                }`}>
                {appointment.status}
              </span>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleCancelAppointment(appointment._id)}
                >
                  Cancel
                </Button>
                <Button size="sm">View Details</Button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default AppointmentsList;