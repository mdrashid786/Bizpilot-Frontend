import { useState, useEffect, ChangeEvent } from "react";

import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import ComponentCard from "../../components/common/ComponentCard";

import Label from "../../components/form/Label";
import TextArea from "../../components/form/input/TextArea";
import Input from "../../components/form/input/InputField";


import {
  registerBusiness,
  updateBusiness,
  getMyBusiness,
  uploadLogo,
  uploadCoverImage,
  BusinessCategory,
} from "../../services/businessService";
import { API_BASE_URL } from "../../config/api";
import { useNavigate } from "react-router";


// interface BusinessFormData {
//   businessName: string;
//   phone: string;
//   description: string;
//   category: BusinessCategory | "";
//   email: string;
//   whatsapp: string;
//   address: string;
//   googleMap: string;
// }

interface BusinessFormData {
  businessName: string;
  phone: string;
  description: string;
  category: BusinessCategory | "";
  email: string;
  whatsapp: string;
  address: string;
  googleMap: string;
  tagline: string;
  businessHours: string;
  instagramUrl: string;
  facebookUrl: string;
}

interface FieldErrors {
  businessName?: string;
  phone?: string;
  description?: string;
  category?: string;
  email?: string;
  whatsapp?: string;
  address?: string;
  googleMap?: string;
}

const FILE_BASE_URL = API_BASE_URL.replace(/\/api\/?$/, "");

const PHONE_REGEX = /^[6-9]\d{9}$/; // 10-digit Indian mobile number
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const GOOGLE_MAP_REGEX = /^https?:\/\/.*(google\.[a-z.]+\/maps|maps\.app\.goo\.gl|goo\.gl\/maps)/i;

export default function AddYourBusiness() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState("");
  const [businessId, setBusinessId] = useState<number | null>(null);

  const [formData, setFormData] = useState<BusinessFormData>({
  businessName: "",
  phone: "",
  description: "",
  category: "",
  email: "",
  whatsapp: "",
  address: "",
  googleMap: "",
  tagline: "",
  businessHours: "",
  instagramUrl: "",
  facebookUrl: "",
});
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [coverPreview, setCoverPreview] = useState<string>("");

  const businessOptions = [
    { value: "RESTAURANT", label: "Restaurant" },
    // { value: "SALON", label: "Salon" },
    // // { value: "GYM", label: "Gym" },
    // // { value: "CLINIC", label: "Clinic" },
  ];

  const isEditMode = businessId !== null;

  useEffect(() => {
    async function fetchBusiness() {
      try {
        const business = await getMyBusiness();
        if (business) {
          setBusinessId(business.id);
          setFormData({
              businessName: business.businessName,
              phone: business.phone,
              description: business.description ?? "",
              category: business.category,
              email: business.email ?? "",
              whatsapp: business.whatsapp ?? "",
              address: business.address ?? "",
              googleMap: business.googleMap ?? "",
              tagline: business.tagline ?? "",
              businessHours: business.businessHours ?? "",
              instagramUrl: business.instagramUrl ?? "",
              facebookUrl: business.facebookUrl ?? "",
            });
          if (business.logo) setLogoPreview(FILE_BASE_URL + business.logo);
          if (business.coverImage) setCoverPreview(FILE_BASE_URL + business.coverImage);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load business");
      } finally {
        setPageLoading(false);
      }
    }
    fetchBusiness();
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    // type karte hi us field ka error clear ho jaye
    setFieldErrors((prev) => ({ ...prev, [id]: undefined }));
  };

  const handleDescriptionChange = (value: string) => {
    setFormData((prev) => ({ ...prev, description: value }));
    setFieldErrors((prev) => ({ ...prev, description: undefined }));
  };

  const handleCategoryChange = (value: string) => {
    if (isEditMode) return;
    setFormData((prev) => ({ ...prev, category: value as BusinessCategory }));
    setFieldErrors((prev) => ({ ...prev, category: undefined }));
  };

  const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1 MB

  const handleLogoSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      setError("Logo image size must be less than 1MB.");
      e.target.value = "";
      return;
    }

    setError("");
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleCoverSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      setError("Cover image size must be less than 1MB.");
      e.target.value = "";
      return;
    }

    setError("");
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  // Saare fields ko validate karta hai, errors object return karta hai
  const validateForm = (): FieldErrors => {
    const errors: FieldErrors = {};

    if (!formData.businessName.trim()) {
      errors.businessName = "Business name is required.";
    } else if (formData.businessName.trim().length < 3) {
      errors.businessName = "Business name must be at least 3 characters.";
    }

    if (!formData.phone.trim()) {
      errors.phone = "Phone number is required.";
    } else if (!PHONE_REGEX.test(formData.phone.trim())) {
      errors.phone = "Enter a valid 10-digit mobile number.";
    }

    if (!formData.description.trim()) {
      errors.description = "Description is required.";
    } else if (formData.description.trim().length < 10) {
      errors.description = "Description must be at least 10 characters.";
    }

    if (!formData.category) {
      errors.category = "Please select a business category.";
    }

    if (!formData.email.trim()) {
      errors.email = "Email address is required.";
    } else if (!EMAIL_REGEX.test(formData.email.trim())) {
      errors.email = "Enter a valid email address.";
    }

    if (!formData.whatsapp.trim()) {
      errors.whatsapp = "Whatsapp number is required.";
    } else if (!PHONE_REGEX.test(formData.whatsapp.trim())) {
      errors.whatsapp = "Enter a valid 10-digit whatsapp number.";
    }

    if (!formData.address.trim()) {
      errors.address = "Business location is required.";
    } else if (formData.address.trim().length < 5) {
      errors.address = "Please enter a complete address.";
    }

    if (!formData.googleMap.trim()) {
      errors.googleMap = "Google Map link is required.";
    } else if (!GOOGLE_MAP_REGEX.test(formData.googleMap.trim())) {
      errors.googleMap = "Enter a valid Google Maps link.";
    }

    return errors;
  };

  const handleSubmit = async () => {
    setError("");

    const errors = validateForm();
    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      setError("Please fix the errors below before submitting.");
      return;
    }

    setLoading(true);
    try {
      let currentId = businessId;

      if (isEditMode && currentId !== null) {
          await updateBusiness(currentId, {
            businessName: formData.businessName,
            phone: formData.phone,
            email: formData.email,
            whatsapp: formData.whatsapp,
            address: formData.address,
            description: formData.description,
            googleMap: formData.googleMap,
            tagline: formData.tagline,
            businessHours: formData.businessHours,
            instagramUrl: formData.instagramUrl,
            facebookUrl: formData.facebookUrl,
          });
        } else {
          if (!formData.category) {
            setError("Please select a business category.");
            setLoading(false);
            return;
          }

        const created = await registerBusiness({
          businessName: formData.businessName,
          phone: formData.phone,
          email: formData.email,
          whatsapp: formData.whatsapp,
          address: formData.address,
          description: formData.description,
          category: formData.category,
          googleMap: formData.googleMap,        // 👈 add karo (pehle sirf update mein tha)
          tagline: formData.tagline,
          businessHours: formData.businessHours,
          instagramUrl: formData.instagramUrl,
          facebookUrl: formData.facebookUrl,
        });
          currentId = created.id;
          setBusinessId(created.id);
        }

      if (currentId !== null) {
        if (logoFile) await uploadLogo(currentId, logoFile);
        if (coverFile) await uploadCoverImage(currentId, coverFile);
      }

      alert(isEditMode ? "Business updated successfully!" : "Business added successfully!");
      navigate("/add-your-business");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="flex items-center justify-center py-16 sm:py-20 text-gray-500 text-sm sm:text-base">
        Loading...
      </div>
    );
  }

  return (
    <div className="px-3 sm:px-0">
      <PageMeta
        title={isEditMode ? "Update Your Business" : "Add Your Business"}
        description="Add or update your business form page"
      />
      <PageBreadcrumb pageTitle={isEditMode ? "Update Your Business" : "Add Your Business"} />

      <ComponentCard title="Business Details">
        {error && (
          <div className="mb-4 text-xs sm:text-sm text-error-500 bg-error-50 dark:bg-error-500/10 px-3 sm:px-4 py-2 rounded-lg break-words">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-5 sm:gap-6 lg:grid-cols-2">
          {/* LEFT SIDE */}
          <div className="space-y-5 sm:space-y-6">
            <div>
              <Label htmlFor="businessName">
                Business Name<span className="text-error-500"> *</span>
              </Label>
              <Input
                type="text"
                id="businessName"
                placeholder="Enter business name"
                value={formData.businessName}
                onChange={handleChange}
                error={!!fieldErrors.businessName}
                hint={fieldErrors.businessName}
              />
            </div>

            <div>
              <Label htmlFor="phone">
                Phone No<span className="text-error-500"> *</span>
              </Label>
              <Input
                type="text"
                id="phone"
                placeholder="Enter phone number"
                value={formData.phone}
                onChange={handleChange}
                error={!!fieldErrors.phone}
                hint={fieldErrors.phone}
              />
            </div>

            <div>
              <Label>
                Description<span className="text-error-500"> *</span>
              </Label>
              <TextArea
                value={formData.description}
                onChange={handleDescriptionChange}
                rows={5}
                error={!!fieldErrors.description}
                hint={fieldErrors.description}
              />
            </div>

            {/* GOOGLE MAP FIELD */}
            <div>
              <Label htmlFor="googleMap">
                Google Map Link <span className="text-error-500"> *</span>
              </Label>
              <Input
                type="text"
                id="googleMap"
                placeholder="Paste your Google Maps link here"
                value={formData.googleMap}
                onChange={handleChange}
                error={!!fieldErrors.googleMap}
                hint={fieldErrors.googleMap}
              />
              <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                Apna location link nikalne ke liye: Google Maps app/website kholo → apni business
                location search karo → <strong>Share</strong> button dabao →{" "}
                <strong>Copy link</strong> par click karo → yahan paste kar do.
              </p>
            </div>
            <div>
              <Label htmlFor="tagline">Tagline (Short Catchy Line)</Label>
              <Input
                type="text"
                id="tagline"
                placeholder="e.g. Delhi's Most Loved Biryani Since 2015"
                value={formData.tagline}
                onChange={handleChange}
              />
              <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                This appears as a highlight on your website's homepage.
              </p>
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="space-y-5 sm:space-y-6">
            <div>
              <Label>
                Business Category{" "}
                {isEditMode && (
                  <span className="ml-2 text-xs text-gray-400">(cannot be changed)</span>
                )}
                <span className="text-error-500"> *</span>
              </Label>
              <select
                value={formData.category}
                onChange={(e) => handleCategoryChange(e.target.value)}
                disabled={isEditMode}
                className={`h-11 w-full rounded-lg border px-4 text-sm dark:bg-gray-900 dark:text-white/90 ${
                  isEditMode
                    ? "opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700"
                    : fieldErrors.category
                    ? "bg-transparent border-error-500 dark:border-error-500"
                    : "bg-transparent border-gray-300 dark:border-gray-700"
                }`}
              >
                <option value="">Select category</option>
                {businessOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              {fieldErrors.category && (
                <p className="mt-1.5 text-xs text-error-500">{fieldErrors.category}</p>
              )}
            </div>

            <div>
              <Label htmlFor="email">
                Email Address<span className="text-error-500"> *</span>
              </Label>
              <Input
                type="email"
                id="email"
                placeholder="Enter email"
                value={formData.email}
                onChange={handleChange}
                error={!!fieldErrors.email}
                hint={fieldErrors.email}
              />
            </div>

            <div>
              <Label htmlFor="whatsapp">
                Whatsapp No <span className="text-error-500"> *</span>
              </Label>
              <Input
                type="text"
                id="whatsapp"
                placeholder="Enter whatsapp number"
                value={formData.whatsapp}
                onChange={handleChange}
                error={!!fieldErrors.whatsapp}
                hint={fieldErrors.whatsapp}
              />
            </div>

            <div>
              <Label htmlFor="address">
                Business Location <span className="text-error-500"> *</span>
              </Label>
              <Input
                type="text"
                id="address"
                placeholder="Enter business location"
                value={formData.address}
                onChange={handleChange}
                error={!!fieldErrors.address}
                hint={fieldErrors.address}
              />
            </div>

            <div>
              <Label htmlFor="businessHours">Business Hours</Label>
              <Input
                type="text"
                id="businessHours"
                placeholder="e.g. Mon–Sat: 10AM–9PM, Sun: Closed"
                value={formData.businessHours}
                onChange={handleChange}
              />
               <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                e.g. Mon–Sat: 10AM–9PM, Sun: Closed
              </p>
            </div>

            <div>
              <Label htmlFor="instagramUrl">Instagram Link</Label>
              <Input
                type="text"
                id="instagramUrl"
                placeholder="https://instagram.com/yourbusiness"
                value={formData.instagramUrl}
                onChange={handleChange}
              />
            </div>

            <div>
              <Label htmlFor="facebookUrl">Facebook Link</Label>
              <Input
                type="text"
                id="facebookUrl"
                placeholder="https://facebook.com/yourbusiness"
                value={formData.facebookUrl}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {/* LOGO & COVER IMAGE */}
        {/* <div className="grid grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-2 mt-6 sm:mt-8">
          <div>
            <Label>Logo (recommended 512 x 512 px, max 1MB)</Label>
            {logoPreview && (
              <img
                src={logoPreview}
                alt="Logo preview"
                className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg mb-3 border border-gray-200 dark:border-gray-700"
              />
            )}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleLogoSelect}
              className="block w-full text-xs sm:text-sm text-gray-600 dark:text-gray-300
                file:mr-3 file:py-2 file:px-3 sm:file:px-4
                file:rounded-lg file:border-0
                file:text-xs sm:file:text-sm file:font-medium
                file:bg-brand-50 file:text-brand-600
                hover:file:bg-brand-100
                dark:file:bg-gray-800 dark:file:text-gray-300"
            />
          </div>

          <div>
            <Label>Cover Image (recommended 1600 x 500 px, max 1MB)</Label>
            {coverPreview && (
              <img
                src={coverPreview}
                alt="Cover preview"
                className="w-full h-28 sm:h-32 object-cover rounded-lg mb-3 border border-gray-200 dark:border-gray-700"
              />
            )}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleCoverSelect}
              className="block w-full text-xs sm:text-sm text-gray-600 dark:text-gray-300
                file:mr-3 file:py-2 file:px-3 sm:file:px-4
                file:rounded-lg file:border-0
                file:text-xs sm:file:text-sm file:font-medium
                file:bg-brand-50 file:text-brand-600
                hover:file:bg-brand-100
                dark:file:bg-gray-800 dark:file:text-gray-300"
            />
          </div>
        </div> */}

        {/* SUBMIT BUTTON */}
        <div className="flex justify-center sm:justify-start mt-6 sm:mt-8">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="w-full sm:w-auto px-6 py-3 rounded-lg bg-brand-500 text-white text-sm sm:text-base font-medium hover:bg-brand-600 transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (isEditMode ? "Updating..." : "Submitting...") : isEditMode ? "Update" : "Submit"}
          </button>
        </div>
      </ComponentCard>
    </div>
  );
}