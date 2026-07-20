import { useState, useEffect, ChangeEvent, FormEvent } from "react";

import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import ComponentCard from "../../components/common/ComponentCard";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";

import { API_BASE_URL } from "../../config/api";

import { uploadCategoryItemImage } from "../../services/categoryDataService";

import {
  getCategoryConfig,
  getCategoryRows,
  saveCategoryRow,
  updateCategoryRow,
  deleteCategoryRow,
  CategoryConfigResponse,
  CategoryRowResponse,
  toggleRowActive,
  toggleRowFeatured,
} from "../../services/categoryDataService";

export default function CategoryData() {
  const [config, setConfig] = useState<CategoryConfigResponse | null>(null);
  const [rows, setRows] = useState<CategoryRowResponse[]>([]);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [editingRowId, setEditingRowId] = useState<string | null>(null);

  const [pageLoading, setPageLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [formActive, setFormActive] = useState(true);
  const [formFeatured, setFormFeatured] = useState(false);

  const FILE_BASE_URL = API_BASE_URL.replace(/\/api\/?$/, "");
  const MAX_IMAGE_SIZE = 1 * 1024 * 1024; // 1 MB

  const [uploadingImage, setUploadingImage] = useState<string | null>(null); // jis field key ki image upload ho rahi hai

  useEffect(() => {
    async function load() {
      try {
        const [cfg, existingRows] = await Promise.all([
          getCategoryConfig(),
          getCategoryRows(),
        ]);
        setConfig(cfg);
        setRows(existingRows);
        resetForm(cfg);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load");
      } finally {
        setPageLoading(false);
      }
    }
    load();
  }, []);

  function resetForm(cfg: CategoryConfigResponse | null) {
    if (!cfg) return;
    const empty: Record<string, string> = {};
    cfg.fields.forEach((f) => (empty[f.key] = ""));
    setFormValues(empty);
    setEditingRowId(null);
    setFormActive(true); // 👈 add karo
    setFormFeatured(false); // 👈 add karo


  }

  const handleFieldChange = (key: string, value: string) => {
    setFormValues((prev) => ({ ...prev, [key]: value }));
  };

const handleImageSelect = async (key: string, e: ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  if (file.size > MAX_IMAGE_SIZE) {
    setError(`Image size must be less than 1MB.`);
    e.target.value = "";
    return;
  }

  setError("");
  setUploadingImage(key);
  try {
    const path = await uploadCategoryItemImage(file);
    setFormValues((prev) => ({ ...prev, [key]: path }));
  } catch (err) {
    setError(err instanceof Error ? err.message : "Failed to upload image");
  } finally {
    setUploadingImage(null);
  }
};

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!config) return;

    const missing = config.fields.some((f) => !formValues[f.key]?.trim());
    if (missing) {
      setError("Please fill all fields.");
      return;
    }

    setSaving(true);
    try {
     if (editingRowId) {
        const updated = await updateCategoryRow(editingRowId, formValues, formActive, formFeatured);
        setRows((prev) => prev.map((r) => (r.rowId === editingRowId ? updated : r)));
      } else {
        const created = await saveCategoryRow(formValues, formActive, formFeatured);
        setRows((prev) => [...prev, created]);
      }
      resetForm(config);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (rowId: string) => {
  try {
    const updated = await toggleRowActive(rowId);
    setRows((prev) => prev.map((r) => (r.rowId === rowId ? updated : r)));
  } catch (err) {
    setError(err instanceof Error ? err.message : "Failed to toggle status");
  }
};

const handleToggleFeatured = async (rowId: string) => {
  try {
    const updated = await toggleRowFeatured(rowId);
    setRows((prev) => prev.map((r) => (r.rowId === rowId ? updated : r)));
  } catch (err) {
    setError(err instanceof Error ? err.message : "Failed to toggle featured status");
  }
};

  const handleEdit = (row: CategoryRowResponse) => {
    setFormValues(row.fields);
    setEditingRowId(row.rowId);
    setFormActive(row.active); // 👈 add karo
    setFormFeatured(row.featured); // 👈 add karo

  };

  const handleDelete = async (rowId: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;

    try {
      await deleteCategoryRow(rowId);
      setRows((prev) => prev.filter((r) => r.rowId !== rowId));
      if (editingRowId === rowId) resetForm(config);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete");
    }
  };

  if (pageLoading) {
    return (
      <div className="flex items-center justify-center py-16 text-gray-500 text-sm">
        Loading...
      </div>
    );
  }

  if (!config) {
    return (
      <div className="flex items-center justify-center py-16 text-error-500 text-sm">
        {error || "Could not load category configuration."}
      </div>
    );
  }

  return (
    <div className="px-3 sm:px-0">
      <PageMeta title={config.dashboardSectionLabel} description="Manage your category data" />
      <PageBreadcrumb pageTitle={config.dashboardSectionLabel} />

      <ComponentCard title={editingRowId ? `Edit ${config.dashboardSectionLabel}` : `Add ${config.dashboardSectionLabel}`}>
        {error && (
          <div className="mb-4 text-xs sm:text-sm text-error-500 bg-error-50 dark:bg-error-500/10 px-3 sm:px-4 py-2 rounded-lg break-words">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
    {[...config.fields]
      .sort((a, b) => {
        if (a.type === "image" && b.type !== "image") return 1;
        if (a.type !== "image" && b.type === "image") return -1;
        return 0;
      })
      .map((field) => (
        <div key={field.key}>
          <Label htmlFor={field.key}>{field.label}</Label>

          {field.type === "image" ? (
            <div>
              {formValues[field.key] && (
                <img
                  src={FILE_BASE_URL + formValues[field.key]}
                  alt={field.label}
                  className="w-20 h-20 object-cover rounded-lg mb-2 border border-gray-200 dark:border-gray-700"
                />
              )}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => handleImageSelect(field.key, e)}
                className="block w-full text-xs text-gray-600 dark:text-gray-300
                  file:mr-3 file:py-2 file:px-3
                  file:rounded-lg file:border-0
                  file:text-xs file:font-medium
                  file:bg-brand-50 file:text-brand-600
                  hover:file:bg-brand-100
                  dark:file:bg-gray-800 dark:file:text-gray-300"
              />
              {uploadingImage === field.key && (
                <p className="mt-1 text-xs text-gray-500">Uploading...</p>
              )}
            </div>
          ) : field.type === "select" ? (
            <select
              value={formValues[field.key] ?? ""}
              onChange={(e) => handleFieldChange(field.key, e.target.value)}
              className="h-11 w-full rounded-lg border px-4 text-sm bg-transparent border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
            >
              <option value="">Select {field.label}</option>
              {field.options?.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          ) : (
            <Input
              type={field.type === "number" ? "number" : "text"}
              id={field.key}
              placeholder={`Enter ${field.label.toLowerCase()}`}
              value={formValues[field.key] ?? ""}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                handleFieldChange(field.key, e.target.value)
              }
            />
          )}
        </div>
        
      ))}
      <div className="flex items-center gap-6 mb-4">
          <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <input
              type="checkbox"
              checked={formActive}
              onChange={(e) => setFormActive(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300"
            />
            Available (visible on website)
          </label>

          <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <input
              type="checkbox"
              checked={formFeatured}
              onChange={(e) => setFormFeatured(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300"
            />
            ⭐ Mark as Featured / Special
          </label>
        </div>
  </div>

  <div className="flex gap-3">
    <button
      type="submit"
      disabled={saving}
      className="px-6 py-2.5 rounded-lg bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 transition disabled:opacity-60"
    >
      {saving ? "Saving..." : editingRowId ? "Update" : "Add"}
    </button>

    {editingRowId && (
      <button
        type="button"
        onClick={() => resetForm(config)}
        className="px-6 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition"
      >
        Cancel
      </button>
    )}
  </div>
</form>
      </ComponentCard>

      <div className="mt-6">
  <ComponentCard title={config.dashboardSectionLabel}>
    {rows.length === 0 ? (
      <p className="text-sm text-gray-500 dark:text-gray-400">No items added yet.</p>
    ) : (
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-800 text-left">
              {config.fields.map((f) => (
                <th key={f.key} className="py-2 px-3 font-medium text-gray-600 dark:text-gray-300">
                  {f.label}
                </th>
              ))}
              <th className="py-2 px-3 font-medium text-gray-600 dark:text-gray-300">Status</th>
              <th className="py-2 px-3 font-medium text-gray-600 dark:text-gray-300">Featured</th>
              <th className="py-2 px-3"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.rowId} className="border-b border-gray-100 dark:border-gray-800">
                {config.fields.map((f) => (
                  <td key={f.key} className="py-2 px-3 text-gray-700 dark:text-gray-300">
                    {f.type === "image" && row.fields[f.key] ? (
                      <img
                        src={FILE_BASE_URL + row.fields[f.key]}
                        alt={f.label}
                        className="w-10 h-10 object-cover rounded-md border border-gray-200 dark:border-gray-700"
                      />
                    ) : f.type === "select" ? (
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          row.fields[f.key] === "Veg"
                            ? "bg-success-50 text-success-600"
                            : row.fields[f.key] === "Non-Veg"
                            ? "bg-error-50 text-error-600"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {row.fields[f.key]}
                      </span>
                    ) : (
                      row.fields[f.key]
                    )}
                  </td>
                ))}

                <td className="py-2 px-3">
                  <button
                    onClick={() => handleToggleActive(row.rowId)}
                    className={`text-xs px-2.5 py-1 rounded-full font-medium transition ${
                      row.active
                        ? "bg-success-50 text-success-600 hover:bg-success-100"
                        : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                    }`}
                  >
                    {row.active ? "Show" : "Hide"}
                  </button>
                </td>

                <td className="py-2 px-3">
                  <button
                    onClick={() => handleToggleFeatured(row.rowId)}
                    className={`text-xs px-2.5 py-1 rounded-full font-medium transition ${
                      row.featured
                        ? "bg-amber-50 text-amber-600 hover:bg-amber-100"
                        : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                    }`}
                  >
                    {row.featured ? "⭐ Featured" : "Not Featured"}
                  </button>
                </td>

                <td className="py-2 px-3 text-right whitespace-nowrap">
                  <button
                    onClick={() => handleEdit(row)}
                    className="text-brand-500 hover:text-brand-600 text-xs font-medium mr-3"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(row.rowId)}
                    className="text-error-500 hover:text-error-600 text-xs font-medium"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </ComponentCard>
</div>
    </div>
  );
}