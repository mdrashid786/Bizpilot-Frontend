import { useState, useEffect, ChangeEvent } from "react";

import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import ComponentCard from "../../components/common/ComponentCard";

import Label from "../../components/form/Label";
import TextArea from "../../components/form/input/TextArea";
import Input from "../../components/form/input/InputField";
import Select from "../../components/form/Select";

import {
  registerBusiness,
  updateBusiness,
  getMyBusiness,
  BusinessCategory,
} from "../../services/businessService";
import { useNavigate } from "react-router";

interface BusinessFormData {
  businessName: string;
  phone: string;
  description: string;
  category: BusinessCategory | "";
  email: string;
  whatsapp: string;
  address: string;
}

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
  });

  const businessOptions = [
    { value: "RESTAURANT", label: "Restaurant" },
    { value: "SALON", label: "Salon" },
    { value: "GYM", label: "Gym" },
    { value: "CLINIC", label: "Clinic" },
  ];

  const isEditMode = businessId !== null;

  // Page load pe existing business fetch karo
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
          });
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
  };

  const handleDescriptionChange = (value: string) => {
    setFormData((prev) => ({ ...prev, description: value }));
  };

  const handleCategoryChange = (value: string) => {
      if (isEditMode) return; // edit mode mein category change hi nahi hone dena

    setFormData((prev) => ({
      ...prev,
      category: value as BusinessCategory,
    }));
  };

  const handleSubmit = async () => {
    setError("");
    

    if (!formData.businessName || !formData.phone) {
      setError("Business name and phone are required.");
      return;
    }

    if (!formData.category) {
      setError("Please select a business category.");
      return;
    }

    setLoading(true);
    try {
      if (isEditMode && businessId !== null) {
        // UPDATE — category bhejte hi nahi
        const updated = await updateBusiness(businessId, {
          businessName: formData.businessName,
          phone: formData.phone,
          email: formData.email,
          whatsapp: formData.whatsapp,
          address: formData.address,
          description: formData.description,
        });
        console.log("Business updated:", updated);
         alert("Business updated successfully!");   // 👈 YE LINE ADD KARO

      } else {
        // INSERT
        const created = await registerBusiness({
          businessName: formData.businessName,
          phone: formData.phone,
          email: formData.email,
          whatsapp: formData.whatsapp,
          address: formData.address,
          description: formData.description,
          category: formData.category,
        });
        console.log("Business created:", created);
        alert("Business added successfully!");     // 👈 YE LINE ADD KARO

      }

      navigate("/add-your-business"); // apni actual route se replace kar lena
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-500">
        Loading...
      </div>
    );
  }
  


  return (
    <div>
      <PageMeta
        title={isEditMode ? "Update Your Business" : "Add Your Business"}
        description="Add or update your business form page"
      />

      <PageBreadcrumb
        pageTitle={isEditMode ? "Update Your Business" : "Add Your Business"}
      />

      <ComponentCard title="Business Details">
        {error && (
          <div className="mb-4 text-sm text-error-500 bg-error-50 dark:bg-error-500/10 px-4 py-2 rounded-lg">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          {/* LEFT SIDE */}
          <div className="space-y-6">
            <div>
              <Label htmlFor="businessName">Business Name</Label>
              <Input
                type="text"
                id="businessName"
                placeholder="Enter business name"
                value={formData.businessName}
                onChange={handleChange}
              />
            </div>

            <div>
              <Label htmlFor="phone">Phone No</Label>
              <Input
                type="text"
                id="phone"
                placeholder="Enter phone number"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>

            <div>
              <Label>Description</Label>
              <TextArea
                value={formData.description}
                onChange={handleDescriptionChange}
                rows={5}
              />
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="space-y-6">
            <div>
              <Label>
                Business Category
                {isEditMode && (
                  <span className="ml-2 text-xs text-gray-400">
                    (cannot be changed)
                  </span>
                )}
              </Label>
              <div className={isEditMode ? "pointer-events-none opacity-60" : ""}>
                <Select
                  options={businessOptions}
                  placeholder="Select category"
                  defaultValue={formData.category}
                  onChange={handleCategoryChange}
                  className="dark:bg-dark-900"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                type="email"
                id="email"
                placeholder="Enter email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div>
              <Label htmlFor="whatsapp">Whatsapp No</Label>
              <Input
                type="text"
                id="whatsapp"
                placeholder="Enter whatsapp number"
                value={formData.whatsapp}
                onChange={handleChange}
              />
            </div>

            <div>
              <Label htmlFor="address">Business Location</Label>
              <Input
                type="text"
                id="address"
                placeholder="Enter business location"
                value={formData.address}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {/* SUBMIT BUTTON */}
        <div className="flex justify-start mt-8">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-3 rounded-lg bg-brand-500 text-white font-medium hover:bg-brand-600 transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading
              ? isEditMode
                ? "Updating..."
                : "Submitting..."
              : isEditMode
              ? "Update"
              : "Submit"}
          </button>
        </div>
      </ComponentCard>
    </div>
  );
}