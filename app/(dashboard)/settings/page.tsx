'use client';

import { useEffect, useState } from 'react';
import { getBusinesses, updateBusiness } from '@/lib/api/businesses';
import { getPartners, updatePartner } from '@/lib/api/partners';
import { Business, Partner } from '@/lib/types';
import { Settings as SettingsIcon, Building, Users, Bell } from 'lucide-react';
import toast from 'react-hot-toast';
import NotificationSettings from '@/components/NotificationSettings';

export default function SettingsPage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [businessesData, partnersData] = await Promise.all([
        getBusinesses(),
        getPartners(),
      ]);
      setBusinesses(businessesData);
      setPartners(partnersData);
    } catch (error) {
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBusiness = async (id: string, updates: Partial<Business>) => {
    setSaving(true);
    try {
      await updateBusiness(id, updates);
      toast.success('Business updated successfully');
      loadData();
    } catch (error: any) {
      toast.error('Failed to update business');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePartner = async (id: string, updates: Partial<Partner>) => {
    setSaving(true);
    try {
      await updatePartner(id, updates);
      toast.success('Partner updated successfully');
      loadData();
    } catch (error: any) {
      toast.error('Failed to update partner');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your businesses and partners</p>
      </div>

      {/* Notifications */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Bell className="mr-2 h-5 w-5 text-primary-600" />
          Notifications
        </h2>
        <NotificationSettings />
      </div>

      {/* Businesses */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Building className="mr-2 h-5 w-5 text-primary-600" />
          Businesses
        </h2>
        <div className="space-y-4">
          {businesses.map((business) => (
            <div key={business.id} className="p-4 border border-gray-200 rounded-lg">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Business Name</label>
                  <input
                    type="text"
                    defaultValue={business.name}
                    onBlur={(e) => {
                      if (e.target.value !== business.name) {
                        handleUpdateBusiness(business.id, { name: e.target.value });
                      }
                    }}
                    className="input"
                    disabled={saving}
                  />
                </div>
                <div>
                  <label className="label">Type</label>
                  <select
                    defaultValue={business.type}
                    onChange={(e) => {
                      handleUpdateBusiness(business.id, { type: e.target.value as 'service' | 'ecommerce' });
                    }}
                    className="input"
                    disabled={saving}
                  >
                    <option value="service">Service-based</option>
                    <option value="ecommerce">E-commerce</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Partners */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Users className="mr-2 h-5 w-5 text-primary-600" />
          Partners
        </h2>
        <div className="space-y-4">
          {partners.map((partner) => (
            <div key={partner.id} className="p-4 border border-gray-200 rounded-lg">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="label">Partner Name</label>
                  <input
                    type="text"
                    defaultValue={partner.name}
                    onBlur={(e) => {
                      if (e.target.value !== partner.name) {
                        handleUpdatePartner(partner.id, { name: e.target.value });
                      }
                    }}
                    className="input"
                    disabled={saving}
                  />
                </div>
                <div>
                  <label className="label">Email (Optional)</label>
                  <input
                    type="email"
                    defaultValue={partner.email || ''}
                    onBlur={(e) => {
                      if (e.target.value !== partner.email) {
                        handleUpdatePartner(partner.id, { email: e.target.value || undefined });
                      }
                    }}
                    className="input"
                    disabled={saving}
                    placeholder="partner@example.com"
                  />
                </div>
                <div>
                  <label className="label">Equity Percentage</label>
                  <input
                    type="number"
                    defaultValue={partner.equity_percentage}
                    onBlur={(e) => {
                      const value = parseFloat(e.target.value);
                      if (value !== partner.equity_percentage && value >= 0 && value <= 100) {
                        handleUpdatePartner(partner.id, { equity_percentage: value });
                      }
                    }}
                    className="input"
                    disabled={saving}
                    min="0"
                    max="100"
                    step="0.01"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* App Info */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <SettingsIcon className="mr-2 h-5 w-5 text-primary-600" />
          About
        </h2>
        <div className="space-y-2 text-sm text-gray-600">
          <p><strong>App Name:</strong> Arivah Finance Manager</p>
          <p><strong>Version:</strong> 1.0.0</p>
          <p><strong>Purpose:</strong> Finance management for Arivah Web Dev and Arivah Jewels</p>
        </div>
      </div>
    </div>
  );
}
