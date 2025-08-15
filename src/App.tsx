import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useParams } from 'react-router-dom';
import { Dialog } from '@headlessui/react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

// === TYPES ===
type User = {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'rh';
};
type Offer = {
  id: number;
  type: 'candidature' | 'manifestation' | 'appel_d_offre' | 'consultation';
  title: string;
  description: string;
  country: string;
  projet: string;
  department: string;
  reference: string;
  deadline: string;
  created_at: string;
  tdr_filename: string | null;
  tdr_url: string | null;
};
type Application = {
  id: number;
  offer_id: number;
  full_name: string;
  email: string;
  tel_number: string;
  applicant_country: string;
  created_at: string;
  cv_url: string;
  cv_filename: string;
  diplome_url: string;
  diplome_filename: string;
  id_card_url: string;
  id_card_filename: string;
  cover_letter_url: string;
  cover_letter_filename: string;
  declaration_sur_honneur_url: string | null;
  declaration_sur_honneur_filename: string | null;
  fiche_de_referencement_url: string | null;
  fiche_de_referencement_filename: string | null;
  extrait_registre_url: string | null;
  extrait_registre_filename: string | null;
  note_methodologique_url: string | null;
  note_methodologique_filename: string | null;
  liste_references_url: string | null;
  liste_references_filename: string | null;
  offre_financiere_url: string | null;
  offre_financiere_filename: string | null;
  offer_title: string;
  offer_type: string;
  offer_department: string;
};
type Log = {
  id: number;
  message: string;
  created_at: string;
};

// === COMPONENTS ===
const LoginModal = ({ isOpen, onClose, onLogin }: { isOpen: boolean; onClose: () => void; onLogin: (user: User) => void }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('token', data.token);
        onLogin(data.user);
        onClose();
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('Failed to connect to server');
    }
  };
  
  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-gradient-to-br from-black/40 via-black/30 to-black/20 backdrop-blur-sm" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-md rounded-2xl bg-white shadow-2xl border border-gray-100 p-8 transform transition-all">
          <Dialog.Title className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-6 text-center">
            Login to OSS Platform
          </Dialog.Title>
          {error && (
            <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-red-100 text-red-800 rounded-xl border border-red-200 shadow-sm">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label htmlFor="email" className="block text-sm font-semibold text-gray-800 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm bg-gray-50/50 focus:outline-none focus:ring-3 focus:ring-green-500/20 focus:border-green-500 transition-all duration-200 hover:bg-white"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="mb-8">
              <label htmlFor="password" className="block text-sm font-semibold text-gray-800 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm bg-gray-50/50 focus:outline-none focus:ring-3 focus:ring-green-500/20 focus:border-green-500 transition-all duration-200 hover:bg-white"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 text-sm font-semibold text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 active:bg-gray-300 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-green-600 to-green-700 rounded-xl hover:from-green-700 hover:to-green-800 active:from-green-800 active:to-green-900 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Sign In
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

const OfferCard = ({ offer }: { offer: Offer }) => {
  const deadlineDate = new Date(offer.deadline);
  const today = new Date();
  const isExpired = deadlineDate < today;
  
  const getOfferTypeInfo = (type: string) => {
    switch (type) {
      case 'candidature':
        return { name: 'Candidature', color: 'bg-blue-100 text-blue-800' };
      case 'manifestation':
        return { name: 'Manifestation', color: 'bg-purple-100 text-purple-800' };
      case 'appel_d_offre':
        return { name: 'Appel d\'Offre', color: 'bg-yellow-100 text-yellow-800' };
      case 'consultation':
        return { name: 'Consultation', color: 'bg-green-100 text-green-800' };
      default:
        return { name: type, color: 'bg-gray-100 text-gray-800' };
    }
  };
  
  const offerTypeInfo = getOfferTypeInfo(offer.type);
  
  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow flex flex-col h-full">
      <div className="p-6 flex-grow">
        <div className="flex justify-between items-start mb-2">
          <span className={`px-2 py-1 text-xs font-semibold rounded ${offerTypeInfo.color}`}>
            {offerTypeInfo.name}
          </span>
          <span className={`px-2 py-1 text-xs font-semibold rounded ${isExpired ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
            {isExpired ? 'Expired' : `Closes: ${deadlineDate.toLocaleDateString()}`}
          </span>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">{offer.title}</h3>
        <p className="text-gray-600 mb-4 line-clamp-3">{offer.description}</p>
        <div className="grid grid-cols-1 gap-2 mb-4">
          <div>
            <p className="text-sm text-gray-500">Reference</p>
            <p className="font-medium">{offer.reference}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Country</p>
            <p className="font-medium">{offer.country}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Department</p>
            <p className="font-medium">{offer.department}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Project</p>
            <p className="font-medium">{offer.projet}</p>
          </div>
        </div>
        {offer.tdr_url && (
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
            className="text-sm text-blue-600 hover:underline cursor-pointer"
          >
            💾 Download TDR (PDF)
          </button>
        )}
      </div>
      <div className="p-6 pt-0">
        {!isExpired && (
          <Link
            to={`/offer/${offer.id}`}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-center block"
          >
            Learn More
          </Link>
        )}
      </div>
    </div>
  );
};

const ApplicationForm = ({ offerId, offerType, onClose }: { offerId: number; offerType: string; onClose: () => void }) => {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    tel_number: '',
    applicant_country: '',
    cv: null as File | null,
    diplome: null as File | null,
    id_card: null as File | null,
    cover_letter: null as File | null,
    declaration_sur_honneur: null as File | null,
    fiche_de_referencement: null as File | null,
    extrait_registre: null as File | null,
    note_methodologique: null as File | null,
    liste_references: null as File | null,
    offre_financiere: null as File | null,
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name } = e.target;
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({ ...prev, [name]: e.target.files![0] }));
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const requiredFields = ['cv', 'diplome', 'id_card', 'cover_letter'];
    for (const field of requiredFields) {
      if (!formData[field as keyof typeof formData]) {
        setError(`Please upload a ${field.replace('_', ' ')} PDF`);
        return;
      }
    }
    
    const additionalRequiredFields = [];
    if (['manifestation', 'appel_d_offre', 'consultation'].includes(offerType)) {
      additionalRequiredFields.push(
        'declaration_sur_honneur',
        'fiche_de_referencement',
        'extrait_registre',
        'note_methodologique',
        'liste_references',
        'offre_financiere'
      );
    }
    
    for (const field of additionalRequiredFields) {
      if (!formData[field as keyof typeof formData]) {
        setError(`Please upload a ${field.replace(/_/g, ' ')} PDF for this offer type`);
        return;
      }
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('offer_id', offerId.toString());
      formDataToSend.append('full_name', formData.full_name);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('tel_number', formData.tel_number);
      formDataToSend.append('applicant_country', formData.applicant_country);
      
      if (formData.cv) formDataToSend.append('cv', formData.cv);
      if (formData.diplome) formDataToSend.append('diplome', formData.diplome);
      if (formData.id_card) formDataToSend.append('id_card', formData.id_card);
      if (formData.cover_letter) formDataToSend.append('cover_letter', formData.cover_letter);
      if (formData.declaration_sur_honneur) formDataToSend.append('declaration_sur_honneur', formData.declaration_sur_honneur);
      if (formData.fiche_de_referencement) formDataToSend.append('fiche_de_referencement', formData.fiche_de_referencement);
      if (formData.extrait_registre) formDataToSend.append('extrait_registre', formData.extrait_registre);
      if (formData.note_methodologique) formDataToSend.append('note_methodologique', formData.note_methodologique);
      if (formData.liste_references) formDataToSend.append('liste_references', formData.liste_references);
      if (formData.offre_financiere) formDataToSend.append('offre_financiere', formData.offre_financiere);
      
      const response = await fetch('http://localhost:8000/apply', {
        method: 'POST',
        body: formDataToSend,
      });
      
      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        const data = await response.json();
        setError(data.error || 'Application failed');
      }
    } catch (err) {
      setError('Failed to submit application');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (success) {
    return (
      <div className="text-center p-8">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
          <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="mt-3 text-lg font-medium text-gray-900">Application Submitted!</h3>
        <p className="mt-2 text-sm text-gray-500">Thank you for applying.</p>
      </div>
    );
  }
  
  const requireAdditionalFields = ['manifestation', 'appel_d_offre', 'consultation'].includes(offerType);
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="p-2 bg-red-100 text-red-700 rounded text-sm">{error}</div>}
      
      <div>
        <label htmlFor="full_name" className="block text-sm font-medium text-gray-700">Full Name</label>
        <input
          type="text"
          id="full_name"
          name="full_name"
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500"
          value={formData.full_name}
          onChange={handleChange}
          required
        />
      </div>
      
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
        <input
          type="email"
          id="email"
          name="email"
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500"
          value={formData.email}
          onChange={handleChange}
          required
        />
      </div>
      
      <div>
        <label htmlFor="tel_number" className="block text-sm font-medium text-gray-700">Phone Number</label>
        <input
          type="tel"
          id="tel_number"
          name="tel_number"
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500"
          value={formData.tel_number}
          onChange={handleChange}
          required
        />
      </div>
      
      <div>
        <label htmlFor="applicant_country" className="block text-sm font-medium text-gray-700">Country</label>
        <input
          type="text"
          id="applicant_country"
          name="applicant_country"
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500"
          value={formData.applicant_country}
          onChange={handleChange}
          required
        />
      </div>
      
      <div>
        <label htmlFor="cv" className="block text-sm font-medium text-gray-700">Upload CV (PDF)</label>
        <input
          type="file"
          id="cv"
          name="cv"
          accept=".pdf"
          onChange={handleFileChange}
          className="mt-1 block w-full file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
          required
        />
      </div>
      
      <div>
        <label htmlFor="diplome" className="block text-sm font-medium text-gray-700">Upload Diploma (PDF)</label>
        <input
          type="file"
          id="diplome"
          name="diplome"
          accept=".pdf"
          onChange={handleFileChange}
          className="mt-1 block w-full file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
          required
        />
      </div>
      
      <div>
        <label htmlFor="id_card" className="block text-sm font-medium text-gray-700">Upload ID Card (PDF)</label>
        <input
          type="file"
          id="id_card"
          name="id_card"
          accept=".pdf"
          onChange={handleFileChange}
          className="mt-1 block w-full file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
          required
        />
      </div>
      
      <div>
        <label htmlFor="cover_letter" className="block text-sm font-medium text-gray-700">Upload Cover Letter (PDF)</label>
        <input
          type="file"
          id="cover_letter"
          name="cover_letter"
          accept=".pdf"
          onChange={handleFileChange}
          className="mt-1 block w-full file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
          required
        />
      </div>
      
      {requireAdditionalFields && (
        <>
          <div className="pt-4 border-t border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Additional Required Documents</h3>
            
            <div>
              <label htmlFor="declaration_sur_honneur" className="block text-sm font-medium text-gray-700">Declaration sur l'Honneur (PDF)</label>
              <input
                type="file"
                id="declaration_sur_honneur"
                name="declaration_sur_honneur"
                accept=".pdf"
                onChange={handleFileChange}
                className="mt-1 block w-full file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                required
              />
            </div>
            
            <div>
              <label htmlFor="fiche_de_referencement" className="block text-sm font-medium text-gray-700">Fiche de Referencement (PDF)</label>
              <input
                type="file"
                id="fiche_de_referencement"
                name="fiche_de_referencement"
                accept=".pdf"
                onChange={handleFileChange}
                className="mt-1 block w-full file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                required
              />
            </div>
            
            <div>
              <label htmlFor="extrait_registre" className="block text-sm font-medium text-gray-700">Extrait Registre National (PDF)</label>
              <input
                type="file"
                id="extrait_registre"
                name="extrait_registre"
                accept=".pdf"
                onChange={handleFileChange}
                className="mt-1 block w-full file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                required
              />
            </div>
            
            <div>
              <label htmlFor="note_methodologique" className="block text-sm font-medium text-gray-700">Note Methodologique (PDF)</label>
              <input
                type="file"
                id="note_methodologique"
                name="note_methodologique"
                accept=".pdf"
                onChange={handleFileChange}
                className="mt-1 block w-full file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                required
              />
            </div>
            
            <div>
              <label htmlFor="liste_references" className="block text-sm font-medium text-gray-700">Liste des References (PDF)</label>
              <input
                type="file"
                id="liste_references"
                name="liste_references"
                accept=".pdf"
                onChange={handleFileChange}
                className="mt-1 block w-full file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                required
              />
            </div>
            
            <div>
              <label htmlFor="offre_financiere" className="block text-sm font-medium text-gray-700">Offre Financiere (PDF)</label>
              <input
                type="file"
                id="offre_financiere"
                name="offre_financiere"
                accept=".pdf"
                onChange={handleFileChange}
                className="mt-1 block w-full file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                required
              />
            </div>
          </div>
        </>
      )}
      
      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Application'}
        </button>
      </div>
    </form>
  );
};

const OfferForm = ({ offer, onSave, onCancel }: { offer?: Offer; onSave: (offer: any) => void; onCancel: () => void }) => {
  const [formData, setFormData] = useState({
    type: offer?.type || 'candidature',
    title: offer?.title || '',
    description: offer?.description || '',
    country: offer?.country || '',
    projet: offer?.projet || '',
    department: offer?.department || '',
    reference: offer?.reference || '',
    deadline: offer?.deadline || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    tdr: null as File | null,
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({ ...prev, tdr: e.target.files![0] }));
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const formDataToSend = new FormData();
    Object.keys(formData).forEach(key => {
      if (key !== 'tdr' && formData[key as keyof typeof formData] !== null) {
        formDataToSend.append(key, formData[key as keyof typeof formData].toString());
      }
    });
    if (formData.tdr) formDataToSend.append('tdr', formData.tdr);
    
    const url = offer ? `http://localhost:8000/offers/${offer.id}` : 'http://localhost:8000/offers';
    const method = offer ? 'PUT' : 'POST';
    
    try {
      const response = await fetch(url, {
        method,
        headers: { 'Authorization': `Bearer ${token}` },
        body: formDataToSend,
      });
      
      if (response.ok) {
        const result = await response.json();
        onSave(result);
        onCancel();
      } else {
        alert('Failed to save offer');
      }
    } catch (err) {
      alert('Network error');
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-xl shadow-lg border border-gray-100">
      <div className="space-y-2">
        <label htmlFor="type" className="block text-sm font-semibold text-gray-800 mb-2">Type</label>
        <select
          id="type"
          name="type"
          className="mt-1 block w-full border-2 border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-green-500 rounded-lg px-4 py-3 text-gray-700 bg-white transition-all duration-200 hover:border-gray-300 shadow-sm"
          value={formData.type}
          onChange={handleChange}
          required
        >
          <option value="candidature">Candidature</option>
          <option value="manifestation">Manifestation</option>
          <option value="appel_d_offre">Appel d'Offre</option>
          <option value="consultation">Consultation</option>
        </select>
      </div>
      
      <div className="space-y-2">
        <label htmlFor="title" className="block text-sm font-semibold text-gray-800 mb-2">Title</label>
        <input
          type="text"
          id="title"
          name="title"
          className="mt-1 block w-full border-2 border-gray-200 rounded-lg shadow-sm py-3 px-4 text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 hover:border-gray-300"
          value={formData.title}
          onChange={handleChange}
          required
        />
      </div>
      
      <div className="space-y-2">
        <label htmlFor="reference" className="block text-sm font-semibold text-gray-800 mb-2">Reference</label>
        <input
          type="text"
          id="reference"
          name="reference"
          className="mt-1 block w-full border-2 border-gray-200 rounded-lg shadow-sm py-3 px-4 text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 hover:border-gray-300"
          value={formData.reference}
          onChange={handleChange}
          required
        />
      </div>
      
      <div className="space-y-2">
        <label htmlFor="description" className="block text-sm font-semibold text-gray-800 mb-2">Description</label>
        <textarea
          id="description"
          name="description"
          rows={4}
          className="mt-1 block w-full border-2 border-gray-200 rounded-lg shadow-sm py-3 px-4 text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 hover:border-gray-300 resize-vertical"
          value={formData.description}
          onChange={handleChange}
          placeholder="Enter detailed description..."
        />
      </div>
      
      <div className="space-y-2">
        <label htmlFor="projet" className="block text-sm font-semibold text-gray-800 mb-2">Project</label>
        <textarea
          id="projet"
          name="projet"
          rows={3}
          className="mt-1 block w-full border-2 border-gray-200 rounded-lg shadow-sm py-3 px-4 text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 hover:border-gray-300 resize-vertical"
          value={formData.projet}
          onChange={handleChange}
          placeholder="Enter project details..."
          required
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label htmlFor="country" className="block text-sm font-semibold text-gray-800 mb-2">Country</label>
          <input
            type="text"
            id="country"
            name="country"
            className="mt-1 block w-full border-2 border-gray-200 rounded-lg shadow-sm py-3 px-4 text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 hover:border-gray-300"
            value={formData.country}
            onChange={handleChange}
            required
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="department" className="block text-sm font-semibold text-gray-800 mb-2">Department</label>
          <input
            type="text"
            id="department"
            name="department"
            className="mt-1 block w-full border-2 border-gray-200 rounded-lg shadow-sm py-3 px-4 text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 hover:border-gray-300"
            value={formData.department}
            onChange={handleChange}
            required
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <label htmlFor="deadline" className="block text-sm font-semibold text-gray-800 mb-2">Deadline</label>
        <input
          type="date"
          id="deadline"
          name="deadline"
          className="mt-1 block w-full border-2 border-gray-200 rounded-lg shadow-sm py-3 px-4 text-gray-700 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 hover:border-gray-300"
          value={formData.deadline}
          onChange={handleChange}
          required
        />
      </div>
      
      <div className="space-y-2">
        <label htmlFor="tdr" className="block text-sm font-semibold text-gray-800 mb-2">
          TDR Document 
          <span className="text-gray-500 font-normal">(PDF, optional)</span>
        </label>
        <div className="relative">
          <input
            type="file"
            id="tdr"
            accept=".pdf"
            onChange={handleFileChange}
            className="mt-1 block w-full text-sm text-gray-700 
                       file:mr-4 file:py-3 file:px-6 
                       file:rounded-full file:border-0 
                       file:text-sm file:font-semibold
                       file:bg-gradient-to-r file:from-green-50 file:to-green-100 
                       file:text-green-700 
                       hover:file:from-green-100 hover:file:to-green-200
                       file:transition-all file:duration-200
                       file:shadow-sm hover:file:shadow-md
                       border-2 border-dashed border-gray-300 rounded-lg p-4
                       hover:border-green-400 transition-colors duration-200"
          />
        </div>
      </div>
      
      <div className="flex justify-end gap-4 pt-6 border-t border-gray-100">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 border-2 border-gray-300 text-sm font-semibold rounded-lg text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm hover:shadow-md"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-6 py-3 border-2 border-transparent text-sm font-semibold rounded-lg text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
        >
          Save Offer
        </button>
      </div>
    </form>
  );
};

const UserForm = ({ user, onSave, onCancel }: { user?: User; onSave: (user: Omit<User, 'id'> & { password: string }) => void; onCancel: () => void }) => {
  const [formData, setFormData] = useState<Omit<User, 'id'> & { password: string; confirmPassword: string }>({
    name: user?.name || '',
    email: user?.email || '',
    role: user?.role || 'rh',
    password: '',
    confirmPassword: '',
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email';
    if (!user || formData.password) {
      if (formData.password.length < 6) newErrors.password = 'Min 6 chars';
      if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords must match';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSave({
        name: formData.name,
        email: formData.email,
        role: formData.role,
        password: formData.password || (user ? 'unchanged' : ''),
      });
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label htmlFor="name" className="flex items-center text-sm font-semibold text-gray-800">
          <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          Full Name
        </label>
        <div className="relative">
          <input
            type="text"
            id="name"
            name="name"
            className={`w-full px-4 py-3 border rounded-lg shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
              errors.name 
                ? 'border-red-300 bg-red-50 text-red-900 placeholder-red-300' 
                : 'border-gray-300 bg-white hover:border-gray-400'
            }`}
            placeholder="Enter full name"
            value={formData.name}
            onChange={handleChange}
          />
          {errors.name && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </div>
        {errors.name && (
          <p className="flex items-center text-sm text-red-600 mt-1">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {errors.name}
          </p>
        )}
      </div>
      
      <div className="space-y-2">
        <label htmlFor="email" className="flex items-center text-sm font-semibold text-gray-800">
          <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 7.89a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          Email Address
        </label>
        <div className="relative">
          <input
            type="email"
            id="email"
            name="email"
            className={`w-full px-4 py-3 border rounded-lg shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
              errors.email 
                ? 'border-red-300 bg-red-50 text-red-900 placeholder-red-300' 
                : 'border-gray-300 bg-white hover:border-gray-400'
            }`}
            placeholder="Enter email address"
            value={formData.email}
            onChange={handleChange}
          />
          {errors.email && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </div>
        {errors.email && (
          <p className="flex items-center text-sm text-red-600 mt-1">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {errors.email}
          </p>
        )}
      </div>
      
      <div className="space-y-2">
        <label htmlFor="role" className="flex items-center text-sm font-semibold text-gray-800">
          <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
          </svg>
          Role
        </label>
        <div className="relative">
          <select
            id="role"
            name="role"
            className="w-full px-4 py-3 border border-gray-300 bg-white rounded-lg shadow-sm appearance-none cursor-pointer transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 hover:border-gray-400"
            value={formData.role}
            onChange={handleChange}
          >
            <option value="rh" className="py-2">HR Manager</option>
            <option value="admin" className="py-2">Administrator</option>
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>
      
      <div className="space-y-2">
        <label htmlFor="password" className="flex items-center text-sm font-semibold text-gray-800">
          <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          {user ? 'New Password (optional)' : 'Password'}
          {!user && <span className="text-red-500 ml-1">*</span>}
        </label>
        <div className="relative">
          <input
            type="password"
            id="password"
            name="password"
            className={`w-full px-4 py-3 border rounded-lg shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
              errors.password 
                ? 'border-red-300 bg-red-50 text-red-900 placeholder-red-300' 
                : 'border-gray-300 bg-white hover:border-gray-400'
            }`}
            placeholder={user ? "Leave blank to keep current password" : "Enter password"}
            value={formData.password}
            onChange={handleChange}
          />
          {errors.password && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </div>
        {errors.password && (
          <p className="flex items-center text-sm text-red-600 mt-1">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {errors.password}
          </p>
        )}
      </div>
      
      {(!user || formData.password) && (
        <div className="space-y-2">
          <label htmlFor="confirmPassword" className="flex items-center text-sm font-semibold text-gray-800">
            <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Confirm Password
            <span className="text-red-500 ml-1">*</span>
          </label>
          <div className="relative">
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              className={`w-full px-4 py-3 border rounded-lg shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                errors.confirmPassword 
                  ? 'border-red-300 bg-red-50 text-red-900 placeholder-red-300' 
                  : 'border-gray-300 bg-white hover:border-gray-400'
              }`}
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
            {errors.confirmPassword && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>
          {errors.confirmPassword && (
            <p className="flex items-center text-sm text-red-600 mt-1">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.confirmPassword}
            </p>
          )}
        </div>
      )}
      
      <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 shadow-sm"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          Cancel
        </button>
        <button
          type="submit"
          className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={user ? "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" : "M12 6v6m0 0v6m0-6h6m-6 0H6"} />
          </svg>
          {user ? 'Update User' : 'Create User'}
        </button>
      </div>
    </form>
  );
};

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
  
  const getOfferTypeInfo = (type: string) => {
    switch (type) {
      case 'candidature':
        return { name: 'Candidature', color: 'bg-blue-100 text-blue-800' };
      case 'manifestation':
        return { name: 'Manifestation', color: 'bg-purple-100 text-purple-800' };
      case 'appel_d_offre':
        return { name: 'Appel d\'Offre', color: 'bg-yellow-100 text-yellow-800' };
      case 'consultation':
        return { name: 'Consultation', color: 'bg-green-100 text-green-800' };
      default:
        return { name: type, color: 'bg-gray-100 text-gray-800' };
    }
  };
  
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

const HomePage = ({ offers, onApply }: { offers: Offer[]; onApply: (id: number, type: string) => void }) => {
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    country: '',
    department: '',
    status: 'ongoing' // Add status filter with default 'ongoing'
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
    
    // Determine status based on deadline
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
      status: 'ongoing' // Reset to default
    });
  };
  
  const getOfferTypeInfo = (type: string) => {
    switch (type) {
      case 'candidature': return { name: 'Candidature', color: 'bg-blue-100 text-blue-800' };
      case 'manifestation': return { name: 'Manifestation', color: 'bg-purple-100 text-purple-800' };
      case 'appel_d_offre': return { name: 'Appel d\'Offre', color: 'bg-yellow-100 text-yellow-800' };
      case 'consultation': return { name: 'Consultation', color: 'bg-green-100 text-green-800' };
      default: return { name: type, color: 'bg-gray-100 text-gray-800' };
    }
  };
  
  return (
    <div className="bg-gradient-to-b from-green-50 to-blue-50">
      {/* Hero */}
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
      
      {/* Opportunities */}
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
          
          {/* Filter Section */}
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
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-green-100 to-blue-100 rounded-full flex items-center justify-center">
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
      
      {/* CTA */}
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
            <Link
              to="/about"
              className="inline-flex items-center px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-full border-2 border-white/30 hover:bg-white/20 transition-all duration-300"
            >
              Learn More About Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

const AboutPage = () => {
  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-6 py-2 bg-gradient-to-r from-green-100 to-blue-100 rounded-full border border-green-200 mb-4">
            <span className="text-green-800 font-semibold text-sm">🌍 International Organization • African Vocation</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-gray-900 mb-4">
            About the <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-blue-600">OSS</span>
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-green-500 to-blue-500 mx-auto rounded-full"></div>
        </div>
        
        <div className="lg:flex lg:items-start lg:gap-16">
          <div className="lg:w-1/2 mb-12 lg:mb-0">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-green-100">
              <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                The <strong className="text-green-600">Sahara and Sahel Observatory (OSS)</strong> is an international organization with an African vocation, founded in 1992 and based in Tunis since 2000. It mainly works on creating and supporting partnerships to jointly address the challenges related to water resources management, as well as the implementation of international agreements on land degradation, biodiversity and climate change in Africa.
              </p>
              <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                Today, the OSS has <strong className="text-green-600">28 African and 7 non-African member countries</strong>. In addition, the Organization collaborates with 12 entities representatives of West, East and North Africa, as well as several UN agencies and non-governmental Organizations.
              </p>
              <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                Our mission is to help African member countries sustainably manage their natural resources, with focus on <strong className="text-green-600">arid, semi-arid and dry sub-humid areas of Africa</strong> in a particularly disadvantageous climate change context.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                OSS develops concepts and methodologies for <strong className="text-green-600">environmental monitoring, natural resources management and climate change adaptation</strong>, based on our four scientific programs: <strong className="text-blue-600">Land, Water, Climate, and Biodiversity</strong>.
              </p>
            </div>
          </div>
          <div className="lg:w-1/2 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-8 rounded-2xl border border-green-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-green-800 mb-4">Our Mission</h3>
              <ul className="space-y-3 text-green-700">
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">Implementation of multilateral agreements on land degradation, biodiversity and climate change</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">Promotion of regional and international initiatives addressing environmental challenges</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">Alignment of approaches and unification of methodologies for sustainable land and water management</span>
                </li>
              </ul>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-8 rounded-2xl border border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-blue-800 mb-4">Our Impact</h3>
              <ul className="space-y-3 text-blue-700">
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">Accredited by Green Climate Fund & Adaptation Fund</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">12+ regional partnerships across Africa</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const RHDashboard = () => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [showOfferForm, setShowOfferForm] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [activeTab, setActiveTab] = useState<'offers' | 'applications'>('offers');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filter states
  const [offersFilters, setOffersFilters] = useState({
    search: '',
    type: '',
    country: '',
    department: '',
    status: 'ongoing' // Default to ongoing
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
  
  // Filter offers based on criteria
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

  // Filter applications based on criteria
  const filteredApplications = applications.filter(app => {
    const matchesSearch = app.full_name.toLowerCase().includes(applicationsFilters.search.toLowerCase()) ||
                         app.email.toLowerCase().includes(applicationsFilters.search.toLowerCase()) ||
                         app.offer_title.toLowerCase().includes(applicationsFilters.search.toLowerCase());
    const matchesOfferType = applicationsFilters.offerType ? app.offer_type === applicationsFilters.offerType : true;
    const matchesDepartment = applicationsFilters.department ? app.offer_department === applicationsFilters.department : true;
    const matchesCountry = applicationsFilters.applicantCountry ? app.applicant_country === applicationsFilters.applicantCountry : true;
    
    return matchesSearch && matchesOfferType && matchesDepartment && matchesCountry;
  });

  // Get unique values for filter dropdowns
  const uniqueOfferTypes = Array.from(new Set(offers.map(offer => offer.type)));
  const uniqueCountries = Array.from(new Set(offers.map(offer => offer.country)));
  const uniqueDepartments = Array.from(new Set(offers.map(offer => offer.department)));
  const uniqueAppCountries = Array.from(new Set(applications.map(app => app.applicant_country)));
  const uniqueAppDepartments = Array.from(new Set(applications.map(app => app.offer_department)));

  const statusOptions = [
    { value: 'ongoing', label: 'Ongoing' },
    { value: 'closed', label: 'Closed' }
  ];

  // Handle filter changes
  const handleOffersFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setOffersFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleApplicationsFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setApplicationsFilters(prev => ({ ...prev, [name]: value }));
  };

  // Clear filters
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
  
  const getOfferTypeInfo = (type: string) => {
    switch (type) {
      case 'candidature': return { name: 'Candidature', color: 'bg-blue-100 text-blue-800' };
      case 'manifestation': return { name: 'Manifestation', color: 'bg-purple-100 text-purple-800' };
      case 'appel_d_offre': return { name: 'Appel d\'Offre', color: 'bg-yellow-100 text-yellow-800' };
      case 'consultation': return { name: 'Consultation', color: 'bg-green-100 text-green-800' };
      default: return { name: type, color: 'bg-gray-100 text-gray-800' };
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
            
            {/* Offers Filter Section */}
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
                    <label htmlFor="offers-department" className="block text-sm font-medium text-gray-700 mb-1">Department</label>
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
            
            {/* Applications Filter Section */}
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
                                   app.offer_type === 'appel_d_offre' ? 'Appel d\'Offre' :
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
                        <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                              </div>
                              <div>
                                <h5 className="font-medium text-gray-900">CV</h5>
                                <p className="text-sm text-gray-500">{selectedApplication.cv_filename}</p>
                              </div>
                            </div>
                            <button
                              onClick={() => downloadDocument(selectedApplication.cv_url, selectedApplication.cv_filename)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                              </svg>
                            </button>
                          </div>
                        </div>
                        
                        <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                              </div>
                              <div>
                                <h5 className="font-medium text-gray-900">Diploma</h5>
                                <p className="text-sm text-gray-500">{selectedApplication.diplome_filename}</p>
                              </div>
                            </div>
                            <button
                              onClick={() => downloadDocument(selectedApplication.diplome_url, selectedApplication.diplome_filename)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                              </svg>
                            </button>
                          </div>
                        </div>
                        
                        <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                                <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 00-2-2H9a2 2 0 00-2 2v1m4 0V9a2 2 0 012 2v6a2 2 0 01-2 2h-2a2 2 0 01-2-2v-6a2 2 0 012-2V9" />
                                </svg>
                              </div>
                              <div>
                                <h5 className="font-medium text-gray-900">ID Card</h5>
                                <p className="text-sm text-gray-500">{selectedApplication.id_card_filename}</p>
                              </div>
                            </div>
                            <button
                              onClick={() => downloadDocument(selectedApplication.id_card_url, selectedApplication.id_card_filename)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                              </svg>
                            </button>
                          </div>
                        </div>
                        
                        <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center mr-3">
                                <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                              </div>
                              <div>
                                <h5 className="font-medium text-gray-900">Cover Letter</h5>
                                <p className="text-sm text-gray-500">{selectedApplication.cover_letter_filename}</p>
                              </div>
                            </div>
                            <button
                              onClick={() => downloadDocument(selectedApplication.cover_letter_url, selectedApplication.cover_letter_filename)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                              </svg>
                            </button>
                          </div>
                        </div>
                        
                        {selectedApplication.declaration_sur_honneur_url && (
                          <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                                  <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                </div>
                                <div>
                                  <h5 className="font-medium text-gray-900">Declaration sur l'Honneur</h5>
                                  <p className="text-sm text-gray-500">{selectedApplication.declaration_sur_honneur_filename}</p>
                                </div>
                              </div>
                              <button
                                onClick={() => downloadDocument(selectedApplication.declaration_sur_honneur_url, selectedApplication.declaration_sur_honneur_filename)}
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
                              <div className="flex items-center">
                                <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">
                                  <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                </div>
                                <div>
                                  <h5 className="font-medium text-gray-900">Fiche de Referencement</h5>
                                  <p className="text-sm text-gray-500">{selectedApplication.fiche_de_referencement_filename}</p>
                                </div>
                              </div>
                              <button
                                onClick={() => downloadDocument(selectedApplication.fiche_de_referencement_url, selectedApplication.fiche_de_referencement_filename)}
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
                              <div className="flex items-center">
                                <div className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center mr-3">
                                  <svg className="w-4 h-4 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                </div>
                                <div>
                                  <h5 className="font-medium text-gray-900">Extrait Registre National</h5>
                                  <p className="text-sm text-gray-500">{selectedApplication.extrait_registre_filename}</p>
                                </div>
                              </div>
                              <button
                                onClick={() => downloadDocument(selectedApplication.extrait_registre_url, selectedApplication.extrait_registre_filename)}
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
                              <div className="flex items-center">
                                <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center mr-3">
                                  <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                </div>
                                <div>
                                  <h5 className="font-medium text-gray-900">Note Methodologique</h5>
                                  <p className="text-sm text-gray-500">{selectedApplication.note_methodologique_filename}</p>
                                </div>
                              </div>
                              <button
                                onClick={() => downloadDocument(selectedApplication.note_methodologique_url, selectedApplication.note_methodologique_filename)}
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
                              <div className="flex items-center">
                                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                                  <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                </div>
                                <div>
                                  <h5 className="font-medium text-gray-900">Liste des References</h5>
                                  <p className="text-sm text-gray-500">{selectedApplication.liste_references_filename}</p>
                                </div>
                              </div>
                              <button
                                onClick={() => downloadDocument(selectedApplication.liste_references_url, selectedApplication.liste_references_filename)}
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
                              <div className="flex items-center">
                                <div className="w-8 h-8 bg-cyan-100 rounded-lg flex items-center justify-center mr-3">
                                  <svg className="w-4 h-4 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                </div>
                                <div>
                                  <h5 className="font-medium text-gray-900">Offre Financiere</h5>
                                  <p className="text-sm text-gray-500">{selectedApplication.offre_financiere_filename}</p>
                                </div>
                              </div>
                              <button
                                onClick={() => downloadDocument(selectedApplication.offre_financiere_url, selectedApplication.offre_financiere_filename)}
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
        )}
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [logs, setLogs] = useState<Log[]>([]);
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'users' | 'logs'>('users');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const load = async () => {
      await Promise.all([fetchUsers(), fetchLogs()]);
      setIsLoading(false);
    };
    load();
  }, []);
  
  const fetchUsers = async () => {
    const token = localStorage.getItem('token');
    const res = await fetch('http://localhost:8000/users', { headers: { 'Authorization': `Bearer ${token}` } });
    const data = await res.json();
    setUsers(data);
  };
  
  const fetchLogs = async () => {
    const token = localStorage.getItem('token');
    const res = await fetch('http://localhost:8000/logs', { headers: { 'Authorization': `Bearer ${token}` } });
    const data = await res.json();
    setLogs(data);
  };
  
  const handleSaveUser = async (userData: any) => {
    const token = localStorage.getItem('token');
    const url = editingUser ? `http://localhost:8000/users/${editingUser.id}` : 'http://localhost:8000/users';
    const method = editingUser ? 'PUT' : 'POST';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(userData),
    });
    if (res.ok) {
      await fetchUsers();
      setShowUserForm(false);
      setEditingUser(null);
    }
  };
  
  const handleDeleteUser = async (id: number) => {
    if (window.confirm('Delete this user?')) {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:8000/users/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) await fetchUsers();
    }
  };
  
  if (isLoading) return <div className="flex justify-center items-center h-64"><div className="animate-spin h-12 w-12 border-t-2 border-green-600"></div></div>;
  
  return (
    <div className="py-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <nav className="flex space-x-8 border-b border-gray-200 w-full">
            <button 
              onClick={() => setActiveTab('users')} 
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeTab === 'users' 
                  ? 'border-green-500 text-green-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
                <span>Manage Users</span>
              </div>
            </button>
            <button 
              onClick={() => setActiveTab('logs')} 
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeTab === 'logs' 
                  ? 'border-green-500 text-green-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>System Logs</span>
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
        
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Manage Users</h2>
                <p className="text-gray-600 mt-1">Create, edit, and manage system users</p>
              </div>
              <button 
                onClick={() => { setEditingUser(null); setShowUserForm(true); }} 
                className="inline-flex items-center px-6 py-3 bg-green-600 text-white font-medium rounded-lg shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-200"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Create User
              </button>
            </div>
            
            {showUserForm && (
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {editingUser ? 'Edit User' : 'Create New User'}
                  </h3>
                </div>
                <div className="p-6">
                  <UserForm
                    user={editingUser || undefined}
                    onSave={handleSaveUser}
                    onCancel={() => { setShowUserForm(false); setEditingUser(null); }}
                  />
                </div>
              </div>
            )}
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {users.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
                  <p className="text-gray-500 mb-6">Get started by creating your first user</p>
                  <button 
                    onClick={() => { setEditingUser(null); setShowUserForm(true); }} 
                    className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors duration-200"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Create User
                  </button>
                </div>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {users.map(user => (
                    <li key={user.id} className="px-6 py-5 hover:bg-gray-50 transition-colors duration-150">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center flex-1">
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-4">
                            <span className="text-white font-semibold text-lg">
                              {user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                            </span>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                              <h3 className="font-semibold text-gray-900 text-lg">{user.name}</h3>
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                user.role === 'admin' 
                                  ? 'bg-purple-100 text-purple-800' 
                                  : 'bg-blue-100 text-blue-800'
                              }`}>
                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={
                                    user.role === 'admin' 
                                      ? "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                                      : "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                  } />
                                </svg>
                                {user.role === 'admin' ? 'Administrator' : 'HR Manager'}
                              </span>
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                              <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 7.89a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                              {user.email}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3 ml-4">
                          <button 
                            onClick={() => { setEditingUser(user); setShowUserForm(true); }} 
                            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDeleteUser(user.id)} 
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
              )}
            </div>
          </div>
        )}
        
        {activeTab === 'logs' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">System Logs</h2>
              <p className="text-gray-600 mt-1">Monitor system activity and events</p>
            </div>
            
            {logs.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No logs available</h3>
                  <p className="text-gray-500">System logs will appear here when activities occur</p>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                    <div className="flex items-center text-sm text-gray-500">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Last updated: {new Date().toLocaleString()}
                    </div>
                  </div>
                </div>
                <ul className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
                  {logs.map(log => (
                    <li key={log.id} className="px-6 py-4 hover:bg-gray-50 transition-colors duration-150">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-2 h-2 bg-green-400 rounded-full mt-2"></div>
                        <div className="flex-1 min-w-0">
                          <p className="text-gray-900 font-medium leading-relaxed">{log.message}</p>
                          <div className="flex items-center mt-2 text-sm text-gray-500">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {new Date(log.created_at).toLocaleString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit'
                            })}
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// === MAIN APP ===
const App = () => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [showLogin, setShowLogin] = useState(false);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [selectedOfferId, setSelectedOfferId] = useState<number | null>(null);
  const [selectedOfferType, setSelectedOfferType] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const res = await fetch('http://localhost:8000/offers');
        const data = await res.json();
        setOffers(data);
      } catch (err) {
        console.error('Failed to fetch offers:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = JSON.parse(atob(token.split('.')[1]));
        setUser({
          id: decoded.id,
          name: decoded.name,
          email: decoded.email,
          role: decoded.role,
        });
      } catch {
        localStorage.removeItem('token');
      }
    }
    
    fetchOffers();
  }, []);
  
  const handleLogin = (userData: User) => {
    setUser(userData);
    setShowLogin(false);
  };
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };
  
  const handleApply = (offerId: number, offerType: string) => {
    setSelectedOfferId(offerId);
    setSelectedOfferType(offerType);
    setShowApplicationForm(true);
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin h-12 w-12 border-t-2 border-green-600"></div>
      </div>
    );
  }
  
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Header */}
        <header className="bg-white shadow-lg border-b border-gray-200">
          <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="w-full py-4 flex items-center justify-between">
              <Link 
                to={user ? (user.role === 'rh' ? '/rh-dashboard' : '/admin-dashboard') : '/'} 
                className="flex items-center group transition-all duration-200 hover:scale-105"
              >
                <div className="relative">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-r from-green-600 to-green-700 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-200">
                    <span className="text-white font-bold text-lg">OSS</span>
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full animate-pulse"></div>
                </div>
                <div className="ml-4">
                  <span className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    OSS Opportunities
                  </span>
                  <p className="text-sm text-gray-500 font-medium">Sahara and Sahel Observatory</p>
                </div>
              </Link>
              
              <div className="flex items-center space-x-4">
                {/* About Us Link - Always visible */}
                <Link
                  to="/about"
                  className="hidden sm:inline-flex items-center px-4 py-2 text-gray-700 hover:text-green-600 font-medium rounded-lg hover:bg-green-50 transition-colors duration-200"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  About Us
                </Link>
                
                {user ? (
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-3 px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">
                          {user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                        </span>
                      </div>
                      <div className="hidden sm:block">
                        <p className="text-sm font-medium text-gray-900">Welcome back,</p>
                        <p className="text-sm text-gray-600 font-semibold">{user.name}</p>
                      </div>
                      <div className={`hidden sm:flex px-2 py-1 rounded-full text-xs font-medium ${
                        user.role === 'admin' 
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {user.role === 'admin' ? 'Administrator' : 'HR Manager'}
                      </div>
                    </div>
                    <button 
                      onClick={handleLogout} 
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Logout
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => setShowLogin(true)} 
                    className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7c1.13 0 2.08.402 2.599 1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Login
                  </button>
                )}
              </div>
            </div>
            
            {/* Mobile About Link */}
            <div className="sm:hidden border-t border-gray-100 py-2">
              <Link
                to="/about"
                className="flex items-center px-4 py-2 text-gray-700 hover:text-green-600 font-medium rounded-lg hover:bg-green-50 transition-colors duration-200"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                About Us
              </Link>
            </div>
            
            {/* Navigation breadcrumb for logged in users */}
            {user && (
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 border-t border-gray-100">
                <div className="flex items-center space-x-2 text-sm">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2m-6 6h6" />
                  </svg>
                  <span className="text-gray-500">Dashboard</span>
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  <span className="text-gray-700 font-medium capitalize">
                    {user.role === 'rh' ? 'HR Management' : 'Administration'}
                  </span>
                </div>
              </div>
            )}
          </nav>
        </header>
        
        <main className="flex-1">
          <Routes>
            <Route path="/" element={user ? <Navigate to={user.role === 'rh' ? '/rh-dashboard' : '/admin-dashboard'} /> : <HomePage offers={offers} onApply={handleApply} />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/offer/:id" element={<OfferDetailPage />} />
            {user?.role === 'rh' && <Route path="/rh-dashboard" element={<RHDashboard />} />}
            {user?.role === 'admin' && <Route path="/admin-dashboard" element={<AdminDashboard />} />}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
        
        {/* Enhanced Footer */}
        <footer className="bg-white border-t border-gray-200 mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-r from-green-600 to-green-700 flex items-center justify-center">
                    <span className="text-white font-bold text-lg">OSS</span>
                  </div>
                  <span className="ml-3 text-lg font-bold text-gray-900">OSS Opportunities</span>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  Sahara and Sahel Observatory - Connecting talent with opportunities across North Africa.
                </p>
                <div className="flex space-x-4">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-green-100 transition-colors cursor-pointer">
                    <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.949 4.6 3.419-2.07 4.678-5.144 4.678-9.142 0-.185-.003-.37-.01-.552 2.179-1.397 4.768-2.348 4.768-2.348z"/>
                    </svg>
                  </div>
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-green-100 transition-colors cursor-pointer">
                    <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Quick Links</h3>
                <div className="space-y-2">
                  <Link to="/about" className="block text-gray-600 hover:text-green-600 transition-colors">About OSS</Link>
                  <a href="#opportunities" className="block text-gray-600 hover:text-green-600 transition-colors">Current Opportunities</a>
                  <a href="#" className="block text-gray-600 hover:text-green-600 transition-colors">Application Process</a>
                  <a href="#" className="block text-gray-600 hover:text-green-600 transition-colors">Contact Us</a>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <svg className="w-5 h-5 text-green-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <p className="text-gray-600 text-sm">Tunis, Tunisia</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <svg className="w-5 h-5 text-green-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 7.89a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <p className="text-gray-600 text-sm">careers@oss.org.tn</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-8 pt-8 border-t border-gray-200">
              <div className="flex flex-col md:flex-row justify-between items-center">
                <p className="text-gray-500 text-sm">
                  &copy; {new Date().getFullYear()} Sahara and Sahel Observatory. All rights reserved.
                </p>
                <div className="flex space-x-6 mt-4 md:mt-0">
                  <a href="#" className="text-gray-500 hover:text-green-600 text-sm transition-colors">Privacy Policy</a>
                  <a href="#" className="text-gray-500 hover:text-green-600 text-sm transition-colors">Terms of Service</a>
                  <a href="#" className="text-gray-500 hover:text-green-600 text-sm transition-colors">Accessibility</a>
                </div>
              </div>
            </div>
          </div>
        </footer>
        
        {/* Enhanced Login Modal */}
        <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} onLogin={handleLogin} />
        
        {/* Enhanced Application Form Modal */}
        {showApplicationForm && selectedOfferId && selectedOfferType && (
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
                    offerId={selectedOfferId} 
                    offerType={selectedOfferType} 
                    onClose={() => setShowApplicationForm(false)} 
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Router>
  );
};

export default App;