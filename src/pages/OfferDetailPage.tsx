import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import type { Offer } from '../types';
import ApplicationForm from '../components/ApplicationForm';
import { getOfferTypeInfo } from '../utils/offerType';

const OfferDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [offer, setOffer] = useState<Offer | null>(null);
  const [loading, setLoading] = useState(true);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  
  useEffect(() => {
    const fetchOffer = async () => {
      try {
        const response = await fetch(`http://localhost:8000/offers/${id}`);
        if (response.ok) {
          const data = await response.json();
          setOffer(data);
        } else {
          console.error('Failed to fetch offer');
        }
      } catch (err) {
        console.error('Error fetching offer:', err);
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchOffer();
    }
  }, [id]);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin h-12 w-12 border-t-2 border-green-600"></div>
      </div>
    );
  }
  
  if (!offer) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Offer Not Found</h2>
          <p className="text-gray-600 mb-6">The offer you're looking for doesn't exist or has been removed.</p>
          <Link
            to="/"
            className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }
  
  const deadlineDate = new Date(offer.deadline);
  const today = new Date();
  const isExpired = deadlineDate < today;
  const offerTypeInfo = getOfferTypeInfo(offer.type);
  
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center text-green-600 hover:text-green-800"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Opportunities
          </Link>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 md:p-8">
            <div className="flex flex-wrap gap-3 mb-4">
              <span className={`px-3 py-1 text-sm font-semibold rounded-full ${offerTypeInfo.color}`}>
                {offerTypeInfo.name}
              </span>
              <span className={`px-3 py-1 text-sm font-semibold rounded-full ${isExpired ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                {isExpired ? 'Expired' : `Closes: ${deadlineDate.toLocaleDateString()}`}
              </span>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">{offer.title}</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Offer Details</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Reference</p>
                    <p className="font-medium text-gray-900">{offer.reference}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Country</p>
                    <p className="font-medium text-gray-900">{offer.country}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Department</p>
                    <p className="font-medium text-gray-900">{offer.department}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Deadline</p>
                    <p className="font-medium text-gray-900">{deadlineDate.toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Information</h3>
                <div className="bg-gray-50 rounded-lg p-4 h-full">
                  <p className="text-gray-700 whitespace-pre-line">{offer.projet}</p>
                </div>
              </div>
            </div>
            
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Description</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700 whitespace-pre-line">{offer.description}</p>
              </div>
            </div>
            
            {offer.tdr_url && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Documents</h3>
                <button
                  onClick={async (e) => {
                    e.preventDefault();
                    try {
                      const response = await fetch(`http://localhost:8000${offer.tdr_url}`);
                      if (!response.ok) throw new Error('Failed to fetch TDR');
                      const blob = await response.blob();
                      const url = window.URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `TDR_${offer.title}.pdf`;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      window.URL.revokeObjectURL(url);
                    } catch (err) {
                      alert('Failed to download TDR');
                      console.error(err);
                    }
                  }}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download TDR (PDF)
                </button>
              </div>
            )}
            
            <div className="flex flex-wrap gap-4">
              <Link
                to="/"
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Back to Opportunities
              </Link>
              {!isExpired && (
                <button
                  onClick={() => setShowApplicationForm(true)}
                  className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Apply Now
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {showApplicationForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-gray-900 bg-opacity-75" onClick={() => setShowApplicationForm(false)}></div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
              <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mr-3">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-white">Submit Application</h3>
                  </div>
                  <button
                    onClick={() => setShowApplicationForm(false)}
                    className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors duration-200"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="p-6">
                <ApplicationForm 
                  offerId={parseInt(id!)} 
                  offerType={offer.type} 
                  onClose={() => setShowApplicationForm(false)} 
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OfferDetailPage;