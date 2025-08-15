import { useState } from 'react';

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
    
    const additionalRequiredFields: string[] = [];
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

export default ApplicationForm;