import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { UserData } from '../../App';
import { User, Mail, Phone, MapPin, Home, Calendar, Shield } from 'lucide-react';
import { useState, useEffect } from 'react';
import { tenantAPI } from '../../lib/api';
import { dataStore } from '../../lib/dataStore';

interface TenantProfileProps {
  user: UserData;
  onNavigate?: (tab: string) => void;
}

export function TenantProfile({ user, onNavigate }: TenantProfileProps) {
  const [tenantData, setTenantData] = useState<any>(null);
  const [visitorCount, setVisitorCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadTenantProfile = async () => {
      try {
        // Fetch tenant profile from backend
        const profile = await tenantAPI.getProfile();
        setTenantData(profile);

        // Get visitor count
        const visitors = await tenantAPI.getVisitors();
        setVisitorCount(visitors.length);
      } catch (error) {
        console.error('Failed to load tenant profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTenantProfile();
  }, [user.username]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-slate-900 text-2xl mb-2">My Profile</h2>
          <p className="text-slate-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-slate-900 text-2xl mb-2">My Profile</h2>
        <p className="text-slate-600">View your assigned room and contact information</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-3xl">{user.fullName.charAt(0).toUpperCase()}</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-slate-900 text-2xl mb-1">{user.fullName}</h3>
                  <Badge className="bg-green-600">{tenantData?.status || 'Active'} Tenant</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-slate-500 text-sm">Username</p>
                      <p className="text-slate-900">{tenantData?.username || user.username}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Mail className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-slate-500 text-sm">Email Address</p>
                      <p className="text-slate-900">{tenantData?.email || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Phone className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-slate-500 text-sm">Phone Number</p>
                      <p className="text-slate-900">{tenantData?.contact_number || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Home className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-slate-500 text-sm">Room Number</p>
                      <p className="text-slate-900">Room {tenantData?.room_number || user.room || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5 text-pink-600" />
                    </div>
                    <div>
                      <p className="text-slate-500 text-sm">Room Capacity</p>
                      <p className="text-slate-900">
                        {tenantData?.room_current_occupants || 1} / {tenantData?.room_capacity || 2} occupied
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-slate-500 text-sm">Move-In Date</p>
                      <p className="text-slate-900">{tenantData?.move_in_date ? new Date(tenantData.move_in_date).toLocaleDateString() : 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Info Cards */}
        <div className="space-y-6">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="w-8 h-8 text-blue-600" />
                <h3 className="text-blue-900">Account Status</h3>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-blue-700">Status:</span>
                  <Badge className="bg-green-600">{tenantData?.status || 'Active'}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Member Since:</span>
                  <span className="text-blue-900">{tenantData?.move_in_date ? new Date(tenantData.move_in_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Total Visitors:</span>
                  <span className="text-blue-900">{visitorCount}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <button 
                onClick={() => onNavigate?.('register')}
                className="w-full text-left p-3 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <p className="text-slate-900 text-sm mb-1">Pre-Register Visitor</p>
                <p className="text-slate-500 text-xs">Submit a new visitor request</p>
              </button>
              <button 
                onClick={() => onNavigate?.('visitors')}
                className="w-full text-left p-3 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <p className="text-slate-900 text-sm mb-1">View My Visitors</p>
                <p className="text-slate-500 text-xs">Check visitor approval status</p>
              </button>
            </CardContent>
          </Card>

          <Card className="bg-green-50 border-green-200">
            <CardContent className="pt-6">
              <h3 className="text-green-900 mb-3">Important Notes</h3>
              <ul className="space-y-2 text-sm text-green-800">
                <li className="flex gap-2">
                  <span className="text-green-600">•</span>
                  <span>Register visitors 12 hours in advance</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-green-600">•</span>
                  <span>Visitors must check in at front desk</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-green-600">•</span>
                  <span>You'll receive notifications for approvals</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}