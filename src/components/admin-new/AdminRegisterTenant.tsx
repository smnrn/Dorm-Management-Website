import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Room } from '../../lib/types';
import { UserPlus, Home, AlertCircle, CheckCircle, Eye, EyeOff, RefreshCw } from 'lucide-react';
import { adminAPI } from '../../lib/api';
import { dataStore } from '../../lib/dataStore';
import { useRealTimeSync } from '../../hooks/useRealTimeSync';
import { SyncStatusIndicator } from '../SyncStatusIndicator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

export function AdminRegisterTenant() {
  const [formData, setFormData] = useState({
    full_name: '',
    username: '',
    password: '',
    email: '',
    contact_number: '',
    emergency_contact_name: '',
    emergency_contact_number: '',
    room_id: '',
    move_in_date: new Date().toISOString().split('T')[0],
  });

  const [showPassword, setShowPassword] = useState(false);
  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
  const [allRooms, setAllRooms] = useState<Room[]>([]);
  const [selectedBuilding, setSelectedBuilding] = useState<string>('all');
  const [isLoadingRooms, setIsLoadingRooms] = useState(false);
  const [tenantCount, setTenantCount] = useState(0);
  const [totalRooms, setTotalRooms] = useState(0);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Real-time sync hook
  const { isSyncing, lastSyncTime, syncError, refresh } = useRealTimeSync({
    enabled: true,
    interval: 5000, // Sync every 5 seconds
    onSync: async () => {
      // Update room availability and tenant count on sync
      try {
        const [rooms, tenants] = await Promise.all([
          adminAPI.getRooms(),
          adminAPI.getTenants()
        ]);
        
        console.log('[AdminRegisterTenant] Rooms from API:', rooms);
        console.log('[AdminRegisterTenant] Current selected building:', selectedBuilding);
        
        setAllRooms(rooms);
        
        // Apply the current building filter when updating available rooms
        let filteredRooms = rooms.filter(room => room.current_occupants < room.capacity);
        
        console.log('[AdminRegisterTenant] Available rooms before building filter:', filteredRooms.length);
        
        if (selectedBuilding !== 'all') {
          // Extract just the letter from "Building A" → "A"
          const buildingLetter = selectedBuilding.replace('Building ', '').trim();
          filteredRooms = filteredRooms.filter(room => {
            // Database stores single letters: "A", "B", "C"
            const matchesBuilding = room.building?.toUpperCase() === buildingLetter.toUpperCase();
            
            console.log(`[Filter Debug] Room ${room.room_number}: building="${room.building}", looking for="${buildingLetter}", matches=${matchesBuilding}`);
            
            return matchesBuilding;
          });
          console.log(`[AdminRegisterTenant] Available rooms after filtering by ${selectedBuilding}:`, filteredRooms.length);
        }
        
        setAvailableRooms(filteredRooms);
        setTotalRooms(rooms.length);
        setTenantCount(tenants.length);
      } catch (error) {
        console.error('Failed to sync data:', error);
      }
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setErrorMessage('');
    setSuccessMessage('');
  };

  const handleRoomSelect = (value: string) => {
    setFormData({
      ...formData,
      room_id: value,
    });
    setErrorMessage('');
  };

  const generateUsername = () => {
    const nameParts = formData.full_name.toLowerCase().split(' ');
    if (nameParts.length >= 2) {
      const suggested = nameParts[0].charAt(0) + nameParts[nameParts.length - 1];
      setFormData({
        ...formData,
        username: suggested,
      });
    }
  };

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData({
      ...formData,
      password: password,
    });
  };

  const validateForm = async () => {
    if (!formData.full_name.trim()) {
      setErrorMessage('Full name is required');
      return false;
    }
    if (!formData.username.trim()) {
      setErrorMessage('Username is required');
      return false;
    }
    // Check username uniqueness via backend (will be validated server-side)
    if (!formData.password || formData.password.length < 6) {
      setErrorMessage('Password must be at least 6 characters');
      return false;
    }
    if (!formData.email.includes('@')) {
      setErrorMessage('Valid email is required');
      return false;
    }
    if (!formData.contact_number.trim()) {
      setErrorMessage('Contact number is required');
      return false;
    }
    if (!formData.room_id) {
      setErrorMessage('Please select a room');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const selectedRoom = availableRooms.find(r => r.room_id.toString() === formData.room_id);
      
      // Register tenant via backend API
      await adminAPI.registerTenant({
        username: formData.username,
        password: formData.password,
        full_name: formData.full_name,
        email: formData.email,
        contact_number: formData.contact_number,
        emergency_contact_name: formData.emergency_contact_name,
        emergency_contact_number: formData.emergency_contact_number,
        room_id: parseInt(formData.room_id),
      });

      // Refresh data
      await dataStore.refreshAll();
      const tenants = await adminAPI.getTenants();
      setTenantCount(tenants.length);
      
      // Reload rooms to get updated counts
      const rooms = await adminAPI.getRooms();
      setAllRooms(rooms);
      const available = rooms.filter(room => room.current_occupants < room.capacity);
      setAvailableRooms(available);
      setTotalRooms(rooms.length);

      setSuccessMessage(
        `Tenant account created successfully! ` +
        `Username: ${formData.username} | Password: ${formData.password} | Room: ${selectedRoom?.room_number}`
      );

      // Reset form
      setTimeout(() => {
        setFormData({
          full_name: '',
          username: '',
          password: '',
          email: '',
          contact_number: '',
          emergency_contact_name: '',
          emergency_contact_number: '',
          room_id: '',
          move_in_date: new Date().toISOString().split('T')[0],
        });
        setSuccessMessage('');
      }, 10000);
    } catch (error: any) {
      setErrorMessage(error.message || 'Failed to register tenant');
    } finally {
      setIsLoading(false);
    }
  };

  const selectedRoom = availableRooms.find(r => r.room_id.toString() === formData.room_id);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-slate-900 text-2xl mb-2">Register New Tenant</h2>
          <p className="text-slate-600">
            Create dormitory accounts for tenants with room assignments and login credentials
          </p>
        </div>
        {/* Real-time Sync Indicator */}
        <SyncStatusIndicator
          isSyncing={isSyncing}
          lastSyncTime={lastSyncTime}
          syncError={syncError}
          onRefresh={refresh}
        />
      </div>

      {successMessage && (
        <Card className="border-2 border-green-500 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-green-900 mb-2">Account Created Successfully!</h3>
                <p className="text-green-800 text-sm whitespace-pre-line">{successMessage}</p>
                <p className="text-green-700 text-xs mt-3">
                  ⚠️ Please share these credentials with the tenant securely. They will need them to log in.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {errorMessage && (
        <Card className="border-2 border-red-500 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <p className="text-red-800">{errorMessage}</p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Registration Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Tenant Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="text-slate-900">Personal Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2 space-y-2">
                      <Label htmlFor="full_name">Full Name *</Label>
                      <Input
                        id="full_name"
                        name="full_name"
                        value={formData.full_name}
                        onChange={handleChange}
                        placeholder="Enter tenant's full name"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="tenant@university.edu"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="contact_number">Contact Number *</Label>
                      <Input
                        id="contact_number"
                        name="contact_number"
                        value={formData.contact_number}
                        onChange={handleChange}
                        placeholder="(555) 000-0000"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="emergency_contact_name">Emergency Contact Name</Label>
                      <Input
                        id="emergency_contact_name"
                        name="emergency_contact_name"
                        value={formData.emergency_contact_name}
                        onChange={handleChange}
                        placeholder="Enter emergency contact name"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="emergency_contact_number">Emergency Contact Number</Label>
                      <Input
                        id="emergency_contact_number"
                        name="emergency_contact_number"
                        value={formData.emergency_contact_number}
                        onChange={handleChange}
                        placeholder="(555) 000-0000"
                      />
                    </div>
                  </div>
                </div>

                {/* Account Credentials */}
                <div className="space-y-4 pt-6 border-t border-slate-200">
                  <h3 className="text-slate-900">Account Credentials</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="username">Username *</Label>
                      <div className="flex gap-2">
                        <Input
                          id="username"
                          name="username"
                          value={formData.username}
                          onChange={handleChange}
                          placeholder="tenant1"
                          required
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={generateUsername}
                          disabled={!formData.full_name}
                        >
                          Auto
                        </Button>
                      </div>
                      <p className="text-xs text-slate-500">
                        Tenant will use this to log in
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password">Password *</Label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Input
                            id="password"
                            name="password"
                            type={showPassword ? 'text' : 'password'}
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Enter password"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={generatePassword}
                        >
                          Generate
                        </Button>
                      </div>
                      <p className="text-xs text-slate-500">
                        Minimum 6 characters
                      </p>
                    </div>
                  </div>
                </div>

                {/* Room Assignment */}
                <div className="space-y-4 pt-6 border-t border-slate-200">
                  <h3 className="text-slate-900 flex items-center gap-2">
                    <Home className="w-5 h-5 text-blue-600" />
                    Room Assignment
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="building">Filter by Building</Label>
                      <Select value={selectedBuilding} onValueChange={(value) => {
                        console.log('[Building Filter] Selected building:', value);
                        console.log('[Building Filter] All rooms:', allRooms.map(r => ({ id: r.room_id, building: r.building, room_number: r.room_number })));
                        
                        setSelectedBuilding(value);
                        
                        // Filter available rooms by building
                        if (value === 'all') {
                          const filtered = allRooms.filter(room => room.current_occupants < room.capacity);
                          setAvailableRooms(filtered);
                          console.log('[Building Filter] All buildings - Available rooms:', filtered.length);
                        } else {
                          // Extract just the letter: "Building A" → "A"
                          const buildingLetter = value.replace('Building ', '').trim();
                          const filtered = allRooms.filter(room => {
                            // Database stores single letters: "A", "B", "C"
                            const matchesBuilding = room.building?.toUpperCase() === buildingLetter.toUpperCase();
                            const isAvailable = room.current_occupants < room.capacity;
                            
                            return matchesBuilding && isAvailable;
                          });
                          setAvailableRooms(filtered);
                          console.log(`[Building Filter] ${value} (letter: ${buildingLetter}) - Available rooms:`, filtered.length);
                          console.log(`[Building Filter] ${value} - Rooms:`, filtered.map(r => ({ building: r.building, room_number: r.room_number })));
                        }
                        // Reset room selection when building changes
                        setFormData({ ...formData, room_id: '' });
                      }}>
                        <SelectTrigger>
                          <SelectValue placeholder="All Buildings" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Buildings</SelectItem>
                          <SelectItem value="Building A">Building A</SelectItem>
                          <SelectItem value="Building B">Building B</SelectItem>
                          <SelectItem value="Building C">Building C</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-slate-500">
                        Filter rooms by building location
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="room_id">Select Room *</Label>
                      <div className="flex gap-2">
                        <Select value={formData.room_id} onValueChange={handleRoomSelect} disabled={isLoadingRooms}>
                          <SelectTrigger className="flex-1">
                            <SelectValue placeholder={isLoadingRooms ? "Loading rooms..." : "Choose an available room"} />
                          </SelectTrigger>
                          <SelectContent>
                            {availableRooms.length === 0 ? (
                              <SelectItem value="no-rooms" disabled>
                                {selectedBuilding === 'all' 
                                  ? 'No available rooms' 
                                  : `No available rooms in ${selectedBuilding}`}
                              </SelectItem>
                            ) : (
                              availableRooms.map((room) => (
                                <SelectItem key={room.room_id} value={room.room_id.toString()}>
                                  {room.building} - Room {room.room_number} ({room.current_occupants}/{room.capacity} occupied)
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={async () => {
                            setIsLoadingRooms(true);
                            try {
                              const rooms = await adminAPI.getRooms();
                              setAllRooms(rooms);
                              const available = rooms.filter(room => room.current_occupants < room.capacity);
                              setAvailableRooms(available);
                            } catch (error) {
                              console.error('Failed to refresh rooms:', error);
                            } finally {
                              setIsLoadingRooms(false);
                            }
                          }}
                          disabled={isLoadingRooms}
                          title="Refresh rooms"
                        >
                          <RefreshCw className={`w-4 h-4 ${isLoadingRooms ? 'animate-spin' : ''}`} />
                        </Button>
                      </div>
                      <p className="text-xs text-slate-500">
                        {availableRooms.length} rooms available
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="move_in_date">Move-In Date *</Label>
                      <Input
                        id="move_in_date"
                        name="move_in_date"
                        type="date"
                        value={formData.move_in_date}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  {selectedRoom && (
                    <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                      <h4 className="text-blue-900 text-sm mb-2">Selected Room Details</h4>
                      <div className="grid grid-cols-3 gap-3 text-sm">
                        <div>
                          <p className="text-blue-700">Room Number</p>
                          <p className="text-blue-900">{selectedRoom.room_number}</p>
                        </div>
                        <div>
                          <p className="text-blue-700">Capacity</p>
                          <p className="text-blue-900">{selectedRoom.capacity} people</p>
                        </div>
                        <div>
                          <p className="text-blue-700">Current Occupants</p>
                          <p className="text-blue-900">{selectedRoom.current_occupants}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-4 pt-6">
                  <Button type="submit" className="flex-1 gap-2 h-12">
                    <UserPlus className="w-4 h-4" />
                    Register Tenant Account
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 h-12"
                    onClick={() => {
                      setFormData({
                        full_name: '',
                        username: '',
                        password: '',
                        email: '',
                        contact_number: '',
                        emergency_contact_name: '',
                        emergency_contact_number: '',
                        room_id: '',
                        move_in_date: new Date().toISOString().split('T')[0],
                      });
                      setErrorMessage('');
                      setSuccessMessage('');
                    }}
                  >
                    Clear Form
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Information */}
        <div className="space-y-6">
          <Card className="bg-orange-50 border-orange-200">
            <CardContent className="pt-6">
              <h3 className="text-orange-900 mb-3">Registration Process</h3>
              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-orange-600 text-white flex items-center justify-center flex-shrink-0 text-sm">
                    1
                  </div>
                  <div>
                    <p className="text-orange-900 text-sm">Fill Tenant Details</p>
                    <p className="text-orange-700 text-xs">Enter personal information</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-orange-600 text-white flex items-center justify-center flex-shrink-0 text-sm">
                    2
                  </div>
                  <div>
                    <p className="text-orange-900 text-sm">Create Credentials</p>
                    <p className="text-orange-700 text-xs">Set username and password</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-orange-600 text-white flex items-center justify-center flex-shrink-0 text-sm">
                    3
                  </div>
                  <div>
                    <p className="text-orange-900 text-sm">Assign Room</p>
                    <p className="text-orange-700 text-xs">Select available dormitory room</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-orange-600 text-white flex items-center justify-center flex-shrink-0 text-sm">
                    4
                  </div>
                  <div>
                    <p className="text-orange-900 text-sm">Share Credentials</p>
                    <p className="text-orange-700 text-xs">Provide login info to tenant</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Room Availability</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Total Rooms:</span>
                  <span className="text-slate-900">{totalRooms}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Available:</span>
                  <span className="text-green-600">{availableRooms.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Full:</span>
                  <span className="text-red-600">{totalRooms - availableRooms.length}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-200">
                  <span className="text-slate-600">Total Tenants:</span>
                  <span className="text-slate-900">{tenantCount}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <h3 className="text-blue-900 mb-3 text-sm">Important Notes</h3>
              <ul className="space-y-2 text-xs text-blue-800">
                <li className="flex gap-2">
                  <span className="text-blue-600">•</span>
                  <span>Username must be unique across all tenants</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-blue-600">•</span>
                  <span>Securely share credentials with tenant</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-blue-600">•</span>
                  <span>Only assign rooms with available capacity</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-blue-600">•</span>
                  <span>Tenant can log in immediately after registration</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}