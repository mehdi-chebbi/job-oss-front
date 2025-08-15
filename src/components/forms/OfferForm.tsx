import { useState } from 'react';
import type { Offer } from '../../types';

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
    Object.entries(formData).forEach(([key, value]) => {
      if (key !== 'tdr' && value != null) {
        formDataToSend.append(key, String(value));
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
          <option value="appel_d_offre_service">Appel d'Offre (Service)</option>
          <option value="appel_d_offre_equipement">Appel d'Offre (Equipement)</option>
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

export default OfferForm;