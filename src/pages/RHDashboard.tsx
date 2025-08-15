import { useEffect, useState } from 'react';
import type { Application, Offer } from '../types';
import OfferForm from '../components/forms/OfferForm';
import { getOfferTypeInfo } from '../utils/offerType';

const RHDashboard = () => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [showOfferForm, setShowOfferForm] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [activeTab, setActiveTab] = useState<'offers' | 'applications'>('offers');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [offersFilters, setOffersFilters] = useState({
    search: '',
    type: '',
    country: '',
    department: '',
    status: 'ongoing'
  });
  
  const [applicationsFilters, setApplicationsFilters] = useState({
    search: '',
    offerType: '',
    department: '',
    applicantCountry: ''
  });
  
  const [showOffersFilters, setShowOffersFilters] = useState(false);
  const [showApplicationsFilters, setShowApplicationsFilters] = useState(false);
  
  useEffect(() => {
    const load = async () => {
      await Promise.all([fetchOffers(), fetchApplications()]);
      setIsLoading(false);
    };
    load();
  }, []);
  
  const fetchOffers = async () => {
    try {
      const res = await fetch('http://localhost:8000/offers');
      const data = await res.json();
      setOffers(data);
    } catch (err) {
      setError('Failed to fetch offers');
    }
  };
  
  const fetchApplications = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:8000/applications', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      setApplications(data);
    } catch (err) {
      setError('Failed to fetch applications');
    }
  };
  
  const filteredOffers = offers.filter(offer => {
    const deadlineDate = new Date(offer.deadline);
    const today = new Date();
    const isExpired = deadlineDate < today;
    const status = isExpired ? 'closed' : 'ongoing';
    
    const matchesSearch = offer.title.toLowerCase().includes(offersFilters.search.toLowerCase()) ||
                         offer.description.toLowerCase().includes(offersFilters.search.toLowerCase());
    const matchesType = offersFilters.type ? offer.type === offersFilters.type : true;
    const matchesCountry = offersFilters.country ? offer.country === offersFilters.country : true;
    const matchesDepartment = offersFilters.department ? offer.department === offersFilters.department : true;
    const matchesStatus = offersFilters.status ? status === offersFilters.status : true;
    
    return matchesSearch && matchesType && matchesCountry && matchesDepartment && matchesStatus;
  });

  const filteredApplications = applications.filter(app => {
    const matchesSearch = app.full_name.toLowerCase().includes(applicationsFilters.search.toLowerCase()) ||
                         app.email.toLowerCase().includes(applicationsFilters.search.toLowerCase()) ||
                         app.offer_title.toLowerCase().includes(applicationsFilters.search.toLowerCase());
    const matchesOfferType = applicationsFilters.offerType ? app.offer_type === applicationsFilters.offerType : true;
    const matchesDepartment = applicationsFilters.department ? app.offer_department === applicationsFilters.department : true;
    const matchesCountry = applicationsFilters.applicantCountry ? app.applicant_country === applicationsFilters.applicantCountry : true;
    
    return matchesSearch && matchesOfferType && matchesDepartment && matchesCountry;
  });

  const uniqueOfferTypes = Array.from(new Set(offers.map(offer => offer.type)));
  const uniqueCountries = Array.from(new Set(offers.map(offer => offer.country)));
  const uniqueDepartments = Array.from(new Set(offers.map(offer => offer.department)));
  const uniqueAppCountries = Array.from(new Set(applications.map(app => app.applicant_country)));
  const uniqueAppDepartments = Array.from(new Set(applications.map(app => app.offer_department)));

  const statusOptions = [
    { value: 'ongoing', label: 'Ongoing' },
    { value: 'closed', label: 'Closed' }
  ];

  const handleOffersFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setOffersFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleApplicationsFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setApplicationsFilters(prev => ({ ...prev, [name]: value }));
  };

  const clearOffersFilters = () => {
    setOffersFilters({
      search: '',
      type: '',
      country: '',
      department: '',
      status: 'ongoing'
    });
  };

  const clearApplicationsFilters = () => {
    setApplicationsFilters({
      search: '',
      offerType: '',
      department: '',
      applicantCountry: ''
    });
  };
  
  const handleSaveOffer = async (data: any) => {
    const token = localStorage.getItem('token');
    const url = editingOffer ? `http://localhost:8000/offers/${editingOffer.id}` : 'http://localhost:8000/offers';
    const method = editingOffer ? 'PUT' : 'POST';
    const formDataToSend = new FormData();
    Object.keys(data).forEach(k => formDataToSend.append(k, data[k]));
    if (data.tdr) formDataToSend.append('tdr', data.tdr);
    
    const res = await fetch(url, {
      method,
      headers: { 'Authorization': `Bearer ${token}` },
      body: formDataToSend,
    });
    
    if (res.ok) {
      await fetchOffers();
      setShowOfferForm(false);
      setEditingOffer(null);
    } else {
      setError('Failed to save offer');
    }
  };
  
  const handleDeleteOffer = async (id: number) => {
    if (window.confirm('Delete this offer?')) {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:8000/offers/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) await fetchOffers();
    }
  };
  
  const handleDeleteApplication = async (id: number) => {
    if (window.confirm('Delete this application?')) {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:8000/applications/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) await fetchApplications();
    }
  };
  
  const downloadDocument = async (url: string, filename: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000${url}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch document');
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      alert('Failed to download document');
      console.error(err);
    }
  };
  
  if (isLoading) return <div className="flex justify-center items-center h-64"><div className="animate-spin h-12 w-12 border-t-2 border-green-600"></div></div>;
  
  return (
    <div className="py-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="sm:hidden mb-6">
          <select 
            value={activeTab} 
            onChange={e => setActiveTab(e.target.value as any)} 
            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 font-medium"
          >
            <option value="offers">Offers</option>
            <option value="applications">Applications</option>
          </select>
        </div>
        
        <div className="hidden sm:flex mb-8">
          <nav className="flex space-x-8 border-b border-gray-200 w-full">
            <button 
              onClick={() => setActiveTab('offers')} 
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeTab === 'offers' 
                  ? 'border-green-500 text-green-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                </svg>
                <span>Offers</span>
                <span className="bg-gray-200 text-gray-800 text-xs font-medium px-2 py-0.5 rounded-full">
                  {filteredOffers.length}
                </span>
              </div>
            </button>
            <button 
              onClick={() => setActiveTab('applications')} 
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeTab === 'applications' 
                  ? 'border-green-500 text-green-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656-.126-1.283-.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span>Applications</span>
                <span className="bg-gray-200 text-gray-800 text-xs font-medium px-2 py-0.5 rounded-full">
                  {filteredApplications.length}
                </span>
              </div>
            </button>
          </nav>
        </div>
        
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          </div>
        )}
        
        {activeTab === 'offers' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Manage Offers</h2>
                <p className="text-gray-600 mt-1">Create, edit, and manage your offers</p>
              </div>
              <button 
                onClick={() => { setEditingOffer(null); setShowOfferForm(true); }} 
                className="inline-flex items-center px-6 py-3 bg-green-600 text-white font-medium rounded-lg shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-200"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create New Offer
              </button>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 sm:mb-0">Filter Offers</h3>
                <button 
                  onClick={() => setShowOffersFilters(!showOffersFilters)}
                  className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  {showOffersFilters ? 'Hide Filters' : 'Show Filters'}
                </button>
              </div>
              
              {showOffersFilters && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
                  <div>
                    <label htmlFor="offers-search" className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                    <div className="relative">
                      <input
                        type="text"
                        id="offers-search"
                        name="search"
                        placeholder="Search offers..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        value={offersFilters.search}
                        onChange={handleOffersFilterChange}
                      />
                      <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="offers-type" className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                    <select
                      id="offers-type"
                      name="type"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      value={offersFilters.type}
                      onChange={handleOffersFilterChange}
                    >
                      <option value="">All Types</option>
                      {uniqueOfferTypes.map(type => (
                        <option key={type} value={type}>
                          {getOfferTypeInfo(type).name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="offers-country" className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                    <select
                      id="offers-country"
                      name="country"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      value={offersFilters.country}
                      onChange={handleOffersFilterChange}
                    >
                      <option value="">All Countries</option>
                      {uniqueCountries.map(country => (
                        <option key={country} value={country}>
                          {country}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="offers-department" className="block text sm font-medium text-gray-700 mb-1">Department</label>
                    <select
                      id="offers-department"
                      name="department"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      value={offersFilters.department}
                      onChange={handleOffersFilterChange}
                    >
                      <option value="">All Departments</option>
                      {uniqueDepartments.map(department => (
                        <option key={department} value={department}>
                          {department}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="offers-status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      id="offers-status"
                      name="status"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      value={offersFilters.status}
                      onChange={handleOffersFilterChange}
                    >
                      {statusOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
              
              <div className="flex flex-wrap gap-2 mb-4">
                {offersFilters.search && (
                  <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    Search: {offersFilters.search}
                    <button 
                      onClick={() => setOffersFilters(prev => ({ ...prev, search: '' }))}
                      className="ml-2 text-blue-600 hover:text-blue-900"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                )}
                {offersFilters.type && (
                  <span className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                    Type: {getOfferTypeInfo(offersFilters.type).name}
                    <button 
                      onClick={() => setOffersFilters(prev => ({ ...prev, type: '' }))}
                      className="ml-2 text-purple-600 hover:text-purple-900"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                )}
                {offersFilters.country && (
                  <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                    Country: {offersFilters.country}
                    <button 
                      onClick={() => setOffersFilters(prev => ({ ...prev, country: '' }))}
                      className="ml-2 text-green-600 hover:text-green-900"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                )}
                {offersFilters.department && (
                  <span className="inline-flex items-center px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                    Department: {offersFilters.department}
                    <button 
                      onClick={() => setOffersFilters(prev => ({ ...prev, department: '' }))}
                      className="ml-2 text-yellow-600 hover:text-yellow-900"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                )}
                {offersFilters.status && offersFilters.status !== 'ongoing' && (
                  <span className="inline-flex items-center px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm">
                    Status: {statusOptions.find(opt => opt.value === offersFilters.status)?.label}
                    <button 
                      onClick={() => setOffersFilters(prev => ({ ...prev, status: 'ongoing' }))}
                      className="ml-2 text-indigo-600 hover:text-indigo-900"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                )}
              </div>
              
              {(offersFilters.search || offersFilters.type || offersFilters.country || offersFilters.department || offersFilters.status !== 'ongoing') && (
                <button
                  onClick={clearOffersFilters}
                  className="inline-flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Clear All Filters
                </button>
              )}
            </div>
            
            {showOfferForm && (
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {editingOffer ? 'Edit Offer' : 'Create New Offer'}
                  </h3>
                </div>
                <div className="p-6">
                  <OfferForm
                    offer={editingOffer || undefined}
                    onSave={handleSaveOffer}
                    onCancel={() => { setShowOfferForm(false); setEditingOffer(null); }}
                  />
                </div>
              </div>
            )}
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {filteredOffers.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No offers match your filters</h3>
                  <p className="text-gray-500 mb-6">Try adjusting your filter criteria or create a new offer</p>
                  <button 
                    onClick={() => { setEditingOffer(null); setShowOfferForm(true); }} 
                    className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors duration-200"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Create Offer
                  </button>
                </div>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {filteredOffers.map(offer => {
                    const offerTypeInfo = getOfferTypeInfo(offer.type);
                    
                    return (
                      <li key={offer.id} className="px-6 py-5 hover:bg-gray-50 transition-colors duration-150">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center mb-2">
                              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                                </svg>
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-900 text-lg">{offer.title}</h3>
                                <div className="flex items-center text-sm text-gray-600 mt-1">
                                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mr-2 ${offerTypeInfo.color}`}>
                                    {offerTypeInfo.name}
                                  </span>
                                  <span className="font-medium">{offer.reference}</span>
                                  <span className="mx-2">•</span>
                                  <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                  </svg>
                                  <span>{offer.department}</span>
                                  <span className="mx-2">•</span>
                                  <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                  </svg>
                                  <span>{offer.country}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex space-x-3 ml-4">
                            <button 
                              onClick={() => { setEditingOffer(offer); setShowOfferForm(true); }} 
                              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                            >
                              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              Edit
                            </button>
                            <button 
                              onClick={() => handleDeleteOffer(offer.id)} 
                              className="inline-flex items-center px-4 py-2 border border-red-300 rounded-lg shadow-sm text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 hover:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
                            >
                              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1-1H8a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              Delete
                            </button>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        )}
        
        {activeTab === 'applications' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Applications</h2>
              <p className="text-gray-600 mt-1">Review and manage applications</p>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 sm:mb-0">Filter Applications</h3>
                <button 
                  onClick={() => setShowApplicationsFilters(!showApplicationsFilters)}
                  className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  {showApplicationsFilters ? 'Hide Filters' : 'Show Filters'}
                </button>
              </div>
              
              {showApplicationsFilters && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div>
                    <label htmlFor="applications-search" className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                    <div className="relative">
                      <input
                        type="text"
                        id="applications-search"
                        name="search"
                        placeholder="Search applications..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        value={applicationsFilters.search}
                        onChange={handleApplicationsFilterChange}
                      />
                      <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="applications-offerType" className="block text-sm font-medium text-gray-700 mb-1">Offer Type</label>
                    <select
                      id="applications-offerType"
                      name="offerType"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      value={applicationsFilters.offerType}
                      onChange={handleApplicationsFilterChange}
                    >
                      <option value="">All Types</option>
                      {uniqueOfferTypes.map(type => (
                        <option key={type} value={type}>
                          {getOfferTypeInfo(type).name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="applications-department" className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                    <select
                      id="applications-department"
                      name="department"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      value={applicationsFilters.department}
                      onChange={handleApplicationsFilterChange}
                    >
                      <option value="">All Departments</option>
                      {uniqueAppDepartments.map(department => (
                        <option key={department} value={department}>
                          {department}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="applications-applicantCountry" className="block text-sm font-medium text-gray-700 mb-1">Applicant Country</label>
                    <select
                      id="applications-applicantCountry"
                      name="applicantCountry"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      value={applicationsFilters.applicantCountry}
                      onChange={handleApplicationsFilterChange}
                    >
                      <option value="">All Countries</option>
                      {uniqueAppCountries.map(country => (
                        <option key={country} value={country}>
                          {country}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
              
              <div className="flex flex-wrap gap-2 mb-4">
                {applicationsFilters.search && (
                  <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    Search: {applicationsFilters.search}
                    <button 
                      onClick={() => setApplicationsFilters(prev => ({ ...prev, search: '' }))}
                      className="ml-2 text-blue-600 hover:text-blue-900"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                )}
                {applicationsFilters.offerType && (
                  <span className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                    Type: {getOfferTypeInfo(applicationsFilters.offerType).name}
                    <button 
                      onClick={() => setApplicationsFilters(prev => ({ ...prev, offerType: '' }))}
                      className="ml-2 text-purple-600 hover:text-purple-900"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                )}
                {applicationsFilters.department && (
                  <span className="inline-flex items-center px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                    Department: {applicationsFilters.department}
                    <button 
                      onClick={() => setApplicationsFilters(prev => ({ ...prev, department: '' }))}
                      className="ml-2 text-yellow-600 hover:text-yellow-900"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                )}
                {applicationsFilters.applicantCountry && (
                  <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                    Country: {applicationsFilters.applicantCountry}
                    <button 
                      onClick={() => setApplicationsFilters(prev => ({ ...prev, applicantCountry: '' }))}
                      className="ml-2 text-green-600 hover:text-green-900"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                )}
              </div>
              
              {(applicationsFilters.search || applicationsFilters.offerType || applicationsFilters.department || applicationsFilters.applicantCountry) && (
                <button
                  onClick={clearApplicationsFilters}
                  className="inline-flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Clear All Filters
                </button>
              )}
            </div>
            
            {filteredApplications.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656-.126-1.283-.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No applications match your filters</h3>
                  <p className="text-gray-500">Try adjusting your filter criteria or check back later for new applications.</p>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <ul className="divide-y divide-gray-100">
                  {filteredApplications.map(app => (
                    <li key={app.id} className="px-6 py-5 hover:bg-gray-50 transition-colors duration-150">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                              <span className="text-blue-600 font-semibold text-sm">
                                {app.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900 text-lg">{app.full_name}</h3>
                              <div className="flex items-center text-sm text-gray-600 mt-1">
                                <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                                </svg>
                                Applied for: <span className="font-medium text-gray-800 ml-1">{app.offer_title}</span>
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ml-2 ${
                                  app.offer_type === 'candidature' ? 'bg-blue-100 text-blue-800' :
                                  app.offer_type === 'manifestation' ? 'bg-purple-100 text-purple-800' :
                                  app.offer_type === 'appel_d_offre' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-green-100 text-green-800'
                                }`}>
                                  {app.offer_type === 'candidature' ? 'Candidature' :
                                   app.offer_type === 'manifestation' ? 'Manifestation' :
                                   app.offer_type === 'appel_d_offre' ? "Appel d'Offre" :
                                   'Consultation'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-3 ml-4">
                          <button 
                            onClick={() => setSelectedApplication(app)} 
                            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            View Details
                          </button>
                          <button 
                            onClick={() => handleDeleteApplication(app.id)} 
                            className="inline-flex items-center px-4 py-2 border border-red-300 rounded-lg shadow-sm text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 hover:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1-1H8a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Delete
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
        
        {selectedApplication && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={() => setSelectedApplication(null)}></div>
              
              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
              
              <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-blue-600 font-semibold text-sm">
                          {selectedApplication.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">
                          Application from {selectedApplication.full_name}
                        </h3>
                        <p className="text-sm text-gray-600">Applied for: {selectedApplication.offer_title}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedApplication(null)}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                <div className="px-6 py-6">
                  <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                        <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                          <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 7.89a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          <span className="text-gray-900">{selectedApplication.email}</span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                        <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                          <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          <span className="text-gray-900">{selectedApplication.tel_number}</span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                        <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                          <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span className="text-gray-900">{selectedApplication.applicant_country}</span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Offer Type</label>
                        <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                          <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                          <span className="text-gray-900 capitalize">{selectedApplication.offer_type.replace('_', ' ')}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-lg font-medium text-gray-900 mb-4">Application Documents</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                          { label: 'CV', url: selectedApplication.cv_url, filename: selectedApplication.cv_filename },
                          { label: 'Diploma', url: selectedApplication.diplome_url, filename: selectedApplication.diplome_filename },
                          { label: 'ID Card', url: selectedApplication.id_card_url, filename: selectedApplication.id_card_filename },
                          { label: 'Cover Letter', url: selectedApplication.cover_letter_url, filename: selectedApplication.cover_letter_filename },
                        ].map((doc) => (
                          <div key={doc.label} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                            <div className="flex items-center justify-between">
                              <div>
                                <h5 className="font-medium text-gray-900">{doc.label}</h5>
                                <p className="text-sm text-gray-500">{doc.filename}</p>
                              </div>
                              <button
                                onClick={() => downloadDocument(doc.url, doc.filename)}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        ))}
                        {selectedApplication.declaration_sur_honneur_url && (
                          <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                            <div className="flex items-center justify-between">
                              <div>
                                <h5 className="font-medium text-gray-900">Declaration sur l'Honneur</h5>
                                <p className="text-sm text-gray-500">{selectedApplication.declaration_sur_honneur_filename}</p>
                              </div>
                              <button
                                onClick={() => downloadDocument(selectedApplication.declaration_sur_honneur_url!, selectedApplication.declaration_sur_honneur_filename!)}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        )}
                        {selectedApplication.fiche_de_referencement_url && (
                          <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                            <div className="flex items-center justify-between">
                              <div>
                                <h5 className="font-medium text-gray-900">Fiche de Referencement</h5>
                                <p className="text-sm text-gray-500">{selectedApplication.fiche_de_referencement_filename}</p>
                              </div>
                              <button
                                onClick={() => downloadDocument(selectedApplication.fiche_de_referencement_url!, selectedApplication.fiche_de_referencement_filename!)}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        )}
                        {selectedApplication.extrait_registre_url && (
                          <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                            <div className="flex items-center justify-between">
                              <div>
                                <h5 className="font-medium text-gray-900">Extrait Registre National</h5>
                                <p className="text-sm text-gray-500">{selectedApplication.extrait_registre_filename}</p>
                              </div>
                              <button
                                onClick={() => downloadDocument(selectedApplication.extrait_registre_url!, selectedApplication.extrait_registre_filename!)}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        )}
                        {selectedApplication.note_methodologique_url && (
                          <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                            <div className="flex items-center justify-between">
                              <div>
                                <h5 className="font-medium text-gray-900">Note Methodologique</h5>
                                <p className="text-sm text-gray-500">{selectedApplication.note_methodologique_filename}</p>
                              </div>
                              <button
                                onClick={() => downloadDocument(selectedApplication.note_methodologique_url!, selectedApplication.note_methodologique_filename!)}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        )}
                        {selectedApplication.liste_references_url && (
                          <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                            <div className="flex items-center justify-between">
                              <div>
                                <h5 className="font-medium text-gray-900">Liste des References</h5>
                                <p className="text-sm text-gray-500">{selectedApplication.liste_references_filename}</p>
                              </div>
                              <button
                                onClick={() => downloadDocument(selectedApplication.liste_references_url!, selectedApplication.liste_references_filename!)}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        )}
                        {selectedApplication.offre_financiere_url && (
                          <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                            <div className="flex items-center justify-between">
                              <div>
                                <h5 className="font-medium text-gray-900">Offre Financiere</h5>
                                <p className="text-sm text-gray-500">{selectedApplication.offre_financiere_filename}</p>
                              </div>
                              <button
                                onClick={() => downloadDocument(selectedApplication.offre_financiere_url!, selectedApplication.offre_financiere_filename!)}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                    <div className="flex justify-end">
                      <button
                        onClick={() => setSelectedApplication(null)}
                        className="px-6 py-2 bg-gray-600 text-white text-sm font-medium rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RHDashboard;