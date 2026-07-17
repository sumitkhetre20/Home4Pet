import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { petService } from '../api/services';
import Sidebar from '../components/Sidebar';
import Loader from '../components/Loader';
import { Save, ArrowLeft, Upload, Trash2, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useSync } from '../context/SyncContext';

const AddEditPet = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const { notifySync } = useSync();

  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [existingImages, setExistingImages] = useState([]);
  
  // Image Upload Local State
  const [selectedFile, setSelectedFile] = useState(null);
  const [isPrimaryImage, setIsPrimaryImage] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm({
    defaultValues: {
      name: '',
      species: 'DOG',
      breed: '',
      age: '',
      ageUnit: 'YEARS',
      gender: 'MALE',
      description: '',
      adoptionFee: 0,
      city: '',
      state: '',
      status: 'AVAILABLE',
    }
  });

  useEffect(() => {
    if (isEdit) {
      const loadPet = async () => {
        try {
          const res = await petService.getPetById(id);
          if (res.success && res.data) {
            const pet = res.data;
            setValue('name', pet.name || '');
            setValue('species', pet.species || 'DOG');
            setValue('breed', pet.breed || '');
            setValue('age', pet.age || '');
            setValue('ageUnit', pet.ageUnit || 'YEARS');
            setValue('gender', pet.gender || 'MALE');
            setValue('description', pet.description || '');
            setValue('adoptionFee', pet.adoptionFee || 0);
            setValue('city', pet.city || '');
            setValue('state', pet.state || '');
            setValue('status', pet.status || 'AVAILABLE');
            setExistingImages(pet.images || []);
          }
        } catch (err) {
          toast.error("Failed to load pet details.");
          navigate('/my-pets');
        } finally {
          setLoading(false);
        }
      };
      loadPet();
    }
  }, [id, isEdit, setValue, navigate]);

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const requestBody = {
        name: data.name,
        species: data.species,
        breed: data.breed || '',
        age: isNaN(parseInt(data.age, 10)) ? 0 : parseInt(data.age, 10),
        ageUnit: data.ageUnit || 'YEARS',
        gender: data.gender,
        description: data.description,
        adoptionFee: isNaN(parseFloat(data.adoptionFee)) ? 0 : parseFloat(data.adoptionFee),
        city: data.city,
        state: data.state,
        status: data.status,
        imageUrls: existingImages.map(img => img.url || img)
      };

      let petId = id;
      if (isEdit) {
        await petService.updatePet(id, requestBody);
        toast.success("Pet listing updated successfully!");
        notifySync();
      } else {
        console.log(
          "Outgoing Create Pet Request:",
          JSON.stringify(requestBody, null, 2)
        );
        const res = await petService.createPet(requestBody);
        if (res.success && res.data) {
          petId = res.data.id;
          toast.success("Pet listing created successfully!");
          notifySync();
        }
      }

      // If a new image was selected during form completion, upload it first before returning
      if (selectedFile && petId) {
        setUploadingImage(true);
        try {
          await petService.uploadPetImage(petId, selectedFile, isPrimaryImage);
          toast.success("Image uploaded successfully!");
          notifySync();
        } catch (err) {
          toast.error("Form saved but image upload failed.");
        } finally {
          setUploadingImage(false);
        }
      }

      navigate('/my-pets');
    } catch (err) {
      console.error("Error saving pet listing:", err);
      let errMsg = "Failed to save pet listing.";
      if (err.response?.data) {
        const data = err.response.data;
        if (data.message) {
          errMsg = data.message;
          if (data.errors && typeof data.errors === 'object') {
            const fieldErrors = Object.entries(data.errors)
              .map(([field, msg]) => `${field}: ${msg}`)
              .join(', ');
            if (fieldErrors) errMsg += ` (${fieldErrors})`;
          }
        } else if (data.error) {
          errMsg = data.error;
        }
      } else if (err.message) {
        errMsg = err.message;
      }
      toast.error(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  // Immediate upload for image when editing
  const handleDirectImageUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error("Please select a file to upload.");
      return;
    }
    setUploadingImage(true);
    try {
      const res = await petService.uploadPetImage(id, selectedFile, isPrimaryImage);
      if (res.success) {
        toast.success("Image uploaded successfully!");
        notifySync();
        // Refresh images list
        const petRes = await petService.getPetById(id);
        if (petRes.success) {
          setExistingImages(petRes.data.images || []);
        }
        setSelectedFile(null);
      }
    } catch (err) {
      toast.error("Failed to upload image.");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleImageDelete = async (imageId) => {
    if (window.confirm("Are you sure you want to delete this image?")) {
      try {
        await petService.deletePetImage(id, imageId);
        toast.success("Image deleted.");
        setExistingImages(prev => prev.filter(img => img.id !== imageId));
        notifySync();
      } catch (err) {
        toast.error("Failed to delete image.");
      }
    }
  };

  const getImageUrl = (url) => {
    if (!url) return '';
    return url.startsWith('http') ? url : `http://localhost:8080/api/v1${url}`;
  };

  if (loading) return <Loader fullScreen />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Sidebar Nav */}
        <Sidebar />

        {/* Content Box */}
        <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm">
          <div className="pb-6 mb-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-display font-extrabold">
                {isEdit ? 'Edit Pet Listing' : 'List a New Pet'}
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold mt-1">
                {isEdit ? `Update the details of ${watch('name') || 'the pet'}` : 'Enter the pet attributes below to publish adoption listing.'}
              </p>
            </div>
            <button
              onClick={() => navigate('/my-pets')}
              className="inline-flex items-center gap-1.5 px-4 py-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-xs font-bold transition-all"
            >
              <ArrowLeft size={14} />
              Back
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Form Section */}
            <form onSubmit={handleSubmit(onSubmit)} className="lg:col-span-8 space-y-6">
              
              {/* Pet Name & Species */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Pet Name</label>
                  <input
                    type="text"
                    {...register('name', { required: 'Name is required' })}
                    placeholder="Buddy"
                    className="w-full bg-slate-55 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl py-3.5 px-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-slate-850 dark:text-white"
                  />
                  {errors.name && <span className="text-[10px] font-bold text-red-500">{errors.name.message}</span>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Species</label>
                  <select
                    {...register('species', { required: 'Species is required' })}
                    className="w-full bg-slate-55 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-slate-750 dark:text-slate-300 cursor-pointer"
                  >
                    <option value="DOG">Dog</option>
                    <option value="CAT">Cat</option>
                    <option value="BIRD">Bird</option>
                    <option value="RABBIT">Rabbit</option>
                    <option value="FISH">Fish</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
              </div>

              {/* Breed & Age */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Breed (Optional)</label>
                  <input
                    type="text"
                    {...register('breed')}
                    placeholder="e.g. Persian Cat"
                    className="w-full bg-slate-55 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-2xl py-3.5 px-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-slate-850 dark:text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Age</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      {...register('age', { 
                        required: 'Age details are required',
                        valueAsNumber: true,
                        min: { value: 0, message: 'Age must be 0 or positive' }
                      })}
                      placeholder="e.g. 2"
                      className="flex-1 bg-slate-55 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-2xl py-3.5 px-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-slate-855 dark:text-white"
                    />
                    <select
                      {...register('ageUnit', { required: 'Age unit is required' })}
                      className="w-1/3 bg-slate-55 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-slate-750 dark:text-slate-300 cursor-pointer"
                    >
                      <option value="DAYS">Days</option>
                      <option value="MONTHS">Months</option>
                      <option value="YEARS">Years</option>
                    </select>
                  </div>
                  {errors.age && <span className="text-[10px] font-bold text-red-500">{errors.age.message}</span>}
                  {errors.ageUnit && <span className="text-[10px] font-bold text-red-500">{errors.ageUnit.message}</span>}
                </div>
              </div>

              {/* Gender & Adoption Fee */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Gender</label>
                  <select
                    {...register('gender', { required: 'Gender is required' })}
                    className="w-full bg-slate-55 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-slate-750 dark:text-slate-300 cursor-pointer"
                  >
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Adoption Fee (₹)</label>
                  <input
                    type="number"
                    {...register('adoptionFee', { valueAsNumber: true, min: { value: 0, message: 'Fee must be 0 or positive' } })}
                    className="w-full bg-slate-55 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl py-3.5 px-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-slate-850 dark:text-white"
                  />
                  {errors.adoptionFee && <span className="text-[10px] font-bold text-red-500">{errors.adoptionFee.message}</span>}
                </div>
              </div>

              {/* Status (Only available in Edit mode) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">City Location</label>
                  <input
                    type="text"
                    {...register('city', { required: 'City is required' })}
                    placeholder="Mumbai"
                    className="w-full bg-slate-55 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-2xl py-3.5 px-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-slate-850 dark:text-white"
                  />
                  {errors.city && <span className="text-[10px] font-bold text-red-500">{errors.city.message}</span>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">State / Region</label>
                  <input
                    type="text"
                    {...register('state', { required: 'State is required' })}
                    placeholder="Maharashtra"
                    className="w-full bg-slate-55 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-2xl py-3.5 px-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-slate-850 dark:text-white"
                  />
                  {errors.state && <span className="text-[10px] font-bold text-red-500">{errors.state.message}</span>}
                </div>
              </div>

              {/* Status Row */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Adoption Status</label>
                <select
                  {...register('status')}
                  className="w-full bg-slate-55 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-slate-750 dark:text-slate-300 cursor-pointer"
                >
                  <option value="AVAILABLE">Available</option>
                  <option value="PENDING">Pending</option>
                  <option value="ADOPTED">Adopted</option>
                  <option value="UNAVAILABLE">Unavailable</option>
                </select>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Pet Description / Bio</label>
                <textarea
                  rows={6}
                  {...register('description', { required: 'Description is required' })}
                  placeholder="Tell adopters about Buddy's personality, vaccines, behaviors, compatibility with other pets..."
                  className="w-full bg-slate-55 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-slate-850 dark:text-white"
                />
                {errors.description && <span className="text-[10px] font-bold text-red-500">{errors.description.message}</span>}
              </div>

              {/* Action Buttons */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 bg-primary hover:bg-primary-dark disabled:opacity-50 text-white rounded-2xl font-bold shadow-lg shadow-primary/10 transition-all text-sm flex items-center justify-center gap-2"
              >
                <Save size={16} />
                {submitting ? 'Saving Listing...' : isEdit ? 'Update Listing Details' : 'Create Listing'}
              </button>
            </form>

            {/* Images Upload Section (Right sidebar) */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-slate-50 dark:bg-slate-950 p-6 rounded-3xl border border-slate-100 dark:border-slate-850/60 space-y-6">
                <h3 className="font-display font-bold text-base">Pet Images</h3>
                
                {/* Upload form field */}
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-center cursor-pointer hover:border-primary transition-colors flex flex-col items-center">
                    <Upload className="text-slate-400 mb-2" size={24} />
                    <span className="text-xs font-semibold text-slate-550 dark:text-slate-400">
                      {selectedFile ? selectedFile.name : 'Select file to upload'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setSelectedFile(e.target.files[0])}
                      className="hidden"
                      id="pet-file-input"
                    />
                    <label 
                      htmlFor="pet-file-input" 
                      className="mt-3 px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold rounded-lg cursor-pointer hover:bg-slate-50 transition-colors"
                    >
                      Choose File
                    </label>
                  </div>

                  {selectedFile && (
                    <div className="space-y-3">
                      <label className="flex items-center gap-2 text-xs font-semibold text-slate-655 dark:text-slate-450 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isPrimaryImage}
                          onChange={(e) => setIsPrimaryImage(e.target.checked)}
                          className="rounded text-primary border-slate-250 focus:ring-primary w-4 h-4 cursor-pointer"
                        />
                        Set as primary listing image
                      </label>

                      {isEdit && (
                        <button
                          onClick={handleDirectImageUpload}
                          disabled={uploadingImage}
                          className="w-full py-2 bg-slate-800 hover:bg-slate-950 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition-colors"
                        >
                          {uploadingImage ? 'Uploading...' : 'Upload Now'}
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Listing of existing uploaded images */}
                {isEdit && existingImages.length > 0 && (
                  <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Currently Uploaded</p>
                    <div className="grid grid-cols-2 gap-2">
                      {existingImages.map((img) => (
                        <div key={img.id} className="relative aspect-square rounded-xl overflow-hidden group shadow-sm bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850">
                          <img 
                            src={getImageUrl(img.url)} 
                            alt="Pet upload" 
                            className="object-cover w-full h-full" 
                          />
                          {img.primaryImage && (
                            <span className="absolute top-1 left-1 bg-success text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-0.5">
                              <CheckCircle2 size={8} />
                              Primary
                            </span>
                          )}
                          <button
                            onClick={() => handleImageDelete(img.id)}
                            className="absolute top-1 right-1 p-1 bg-red-500/80 hover:bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Delete Image"
                          >
                            <Trash2 size={10} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AddEditPet;
