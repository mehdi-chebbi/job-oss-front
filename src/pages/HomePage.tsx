import { useState } from 'react';
import OfferCard from '../components/OfferCard';
import type { Offer } from '../types';
import { getOfferTypeInfo } from '../utils/offerType';

const HomePage = ({ offers }: { offers: Offer[] }) => {
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    country: '',
    department: '',
    status: 'ongoing'
  });
  
  const [showFilters, setShowFilters] = useState(false);
  
  const uniqueTypes = Array.from(new Set(offers.map(offer => offer.type)));
  const uniqueCountries = Array.from(new Set(offers.map(offer => offer.country)));
  const uniqueDepartments = Array.from(new Set(offers.map(offer => offer.department)));
  
  const statusOptions = [
    { value: 'ongoing', label: 'Ongoing' },
    { value: 'closed', label: 'Closed' }
  ];
  
  const filteredOffers = offers.filter(offer => {
    const deadlineDate = new Date(offer.deadline);
    const today = new Date();
    const isExpired = deadlineDate < today;
    
    const status = isExpired ? 'closed' : 'ongoing';
    
    const matchesSearch = offer.title.toLowerCase().includes(filters.search.toLowerCase()) ||
                         offer.description.toLowerCase().includes(filters.search.toLowerCase());
    const matchesType = filters.type ? offer.type === filters.type : true;
    const matchesCountry = filters.country ? offer.country === filters.country : true;
    const matchesDepartment = filters.department ? offer.department === filters.department : true;
    const matchesStatus = filters.status ? status === filters.status : true;
    
    return matchesSearch && matchesType && matchesCountry && matchesDepartment && matchesStatus;
  });
  
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };
  
  const clearFilters = () => {
    setFilters({
      search: '',
      type: '',
      country: '',
      department: '',
      status: 'ongoing'
    });
  };
  
  return (
    <div className="bg-gradient-to-b from-green-50 to-blue-50">
      <div
        className="relative bg-cover bg-center h-96 sm:h-[600px] flex items-center justify-center text-center"
        style={{
          backgroundImage: "linear-gradient(135deg, rgba(22, 101, 52, 0.8), rgba(34, 197, 94, 0.7), rgba(74, 222, 128, 0.6)), url('https://images.unsplash.com/photo-1547036967-23d11aacaee0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1740&q=80')",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/40"></div>
        <div className="relative z-10 max-w-5xl mx-auto px-6">
          <div className="mb-6">
            <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 mb-4">
              <span className="text-green-200 font-medium text-sm">🌍 Founded 1992 • Based in Tunis since 2000</span>
            </div>
          </div>
          <h1 className="text-5xl sm:text-7xl font-black text-white leading-tight mb-6 drop-shadow-lg">
            Sahara and Sahel
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-blue-300">
              Observatory
            </span>
          </h1>
          <p className="text-xl sm:text-2xl text-green-100 mb-10 leading-relaxed max-w-3xl mx-auto font-light">
            Creating partnerships to address water resources management and implement international agreements on land degradation, biodiversity and climate change in Africa.
          </p>
          <a
            href="#opportunities"
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-full shadow-2xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105"
          >
            <span>View Current Opportunities</span>
            <svg className="ml-2 w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </a>
        </div>
      </div>
      
      <div id="opportunities" className="py-20 bg-gradient-to-b from-green-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-6 py-2 bg-gradient-to-r from-green-100 to-blue-100 rounded-full border border-green-200 mb-4">
              <span className="text-green-800 font-semibold text-sm">💼 Career Opportunities</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-black text-gray-900 mb-4">
              Current <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-blue-600">Opportunities</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">Help us build a resilient and sustainable future for Africa's drylands.</p>
            <div className="w-24 h-1 bg-gradient-to-r from-green-500 to-blue-500 mx-auto rounded-full mt-6"></div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 sm:mb-0">Filter Opportunities</h3>
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </button>
            </div>
            
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
                <div>
                  <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                  <div className="relative">
                    <input
                      type="text"
                      id="search"
                      name="search"
                      placeholder="Search opportunities..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      value={filters.search}
                      onChange={handleFilterChange}
                    />
                    <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    id="type"
                    name="type"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    value={filters.type}
                    onChange={handleFilterChange}
                  >
                    <option value="">All Types</option>
                    {uniqueTypes.map(type => (
                      <option key={type} value={type}>
                        {getOfferTypeInfo(type).name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                  <select
                    id="country"
                    name="country"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    value={filters.country}
                    onChange={handleFilterChange}
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
                  <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                  <select
                    id="department"
                    name="department"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    value={filters.department}
                    onChange={handleFilterChange}
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
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    id="status"
                    name="status"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    value={filters.status}
                    onChange={handleFilterChange}
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
              {filters.search && (
                <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  Search: {filters.search}
                  <button 
                    onClick={() => setFilters(prev => ({ ...prev, search: '' }))}
                    className="ml-2 text-blue-600 hover:text-blue-900"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              )}
              {filters.type && (
                <span className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                  Type: {getOfferTypeInfo(filters.type).name}
                  <button 
                    onClick={() => setFilters(prev => ({ ...prev, type: '' }))}
                    className="ml-2 text-purple-600 hover:text-purple-900"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              )}
              {filters.country && (
                <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                  Country: {filters.country}
                  <button 
                    onClick={() => setFilters(prev => ({ ...prev, country: '' }))}
                    className="ml-2 text-green-600 hover:text-green-900"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              )}
              {filters.department && (
                <span className="inline-flex items-center px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                  Department: {filters.department}
                  <button 
                    onClick={() => setFilters(prev => ({ ...prev, department: '' }))}
                    className="ml-2 text-yellow-600 hover:text-yellow-900"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              )}
              {filters.status && filters.status !== 'ongoing' && (
                <span className="inline-flex items-center px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm">
                  Status: {statusOptions.find(opt => opt.value === filters.status)?.label}
                  <button 
                    onClick={() => setFilters(prev => ({ ...prev, status: 'ongoing' }))}
                    className="ml-2 text-indigo-600 hover:text-indigo-900"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              )}
            </div>
            
            {(filters.search || filters.type || filters.country || filters.department || filters.status !== 'ongoing') && (
              <button
                onClick={clearFilters}
                className="inline-flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Clear All Filters
              </button>
            )}
          </div>
          
          <div className="mb-6 text-gray-600">
            Showing <span className="font-semibold">{filteredOffers.length}</span> of <span className="font-semibold">{offers.length}</span> opportunities
            {filters.status !== 'ongoing' && (
              <span> (Status: {statusOptions.find(opt => opt.value === filters.status)?.label})</span>
            )}
          </div>
          
          {filteredOffers.length === 0 ? (
            <div className="text-center py-16 bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-green-100">
              <div className="W-20 h-20 mx-auto mb-6 bg-gradient-to-br from-green-100 to-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No opportunities match your filters</h3>
              <p className="text-gray-600 mb-6">Try adjusting your filter criteria or check back later for new opportunities</p>
              <button
                onClick={clearFilters}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white font-medium rounded-lg hover:from-green-700 hover:to-green-800 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredOffers.map(offer => (
                <OfferCard key={offer.id} offer={offer} />
              ))}
            </div>
          )}
        </div>
      </div>
      
      <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-700 text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-x-48 -translate-y-48"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl translate-x-48 translate-y-48"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center px-6 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 mb-6">
            <span className="text-orange-200 font-medium text-sm">🌍 Join the Movement</span>
          </div>
          <h2 className="text-4xl sm:text-6xl font-black mb-6">
            Be Part of the Change
          </h2>
          <p className="text-xl sm:text-2xl opacity-90 mb-10 max-w-3xl mx-auto leading-relaxed font-light">
            Work with a pan-African organization at the forefront of climate resilience and sustainable development.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
            <a
              href="#opportunities"
              className="inline-flex items-center px-8 py-4 bg-white text-orange-600 font-bold rounded-full shadow-2xl hover:bg-gray-100 transition-all duration-300 transform hover:scale-105"
            >
              <span>Explore Open Positions</span>
              <svg className="ml-2 w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;