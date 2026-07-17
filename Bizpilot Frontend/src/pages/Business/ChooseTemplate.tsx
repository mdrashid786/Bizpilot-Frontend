import { useState, useEffect } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import ComponentCard from "../../components/common/ComponentCard";
import {
  getMyBusiness,
  getAvailableThemes,
  selectTheme,
  BusinessResponse,
  ThemeOption,
} from "../../services/businessService";
import { API_BASE_URL } from "../../config/api";

const SITE_BASE_URL = API_BASE_URL.replace(/\/api\/?$/, "");

export default function ChooseTemplate() {
  const [business, setBusiness] = useState<BusinessResponse | null>(null);
  const [themes, setThemes] = useState<ThemeOption[]>([]);
  const [selectedKey, setSelectedKey] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const biz = await getMyBusiness();
        setBusiness(biz);

        if (biz) {
          const list = await getAvailableThemes();
          setThemes(list);
          setSelectedKey(biz.theme || "");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load templates");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handlePreview = (themeKey: string) => {
    if (!business) return;
    const previewUrl = `${SITE_BASE_URL}/preview/${business.slug}/${themeKey}`;
    window.open(previewUrl, "_blank");
  };

  const handleSubmit = async () => {
    if (!business || !selectedKey) {
      setError("Please choose a template first.");
      return;
    }

    setError("");
    setSuccessMsg("");
    setSaving(true);
    try {
      const updated = await selectTheme(business.id, selectedKey);
      setBusiness(updated);
      setSuccessMsg("Template saved! This will now be used for your website.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save template");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-gray-500 text-sm">
        Loading...
      </div>
    );
  }

  if (!business) {
    return (
      <div>
        <PageMeta title="Choose Template" description="Select your website template" />
        <PageBreadcrumb pageTitle="Choose Template" />
        <ComponentCard title="Choose Template">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Please add your business details first before choosing a template.
          </p>
        </ComponentCard>
      </div>
    );
  }

  return (
    <div className="px-3 sm:px-0">
      <PageMeta title="Choose Template" description="Select your website template" />
      <PageBreadcrumb pageTitle="Choose Template" />

      <ComponentCard title="Choose Your Website Template">
        {error && (
          <div className="mb-4 text-xs sm:text-sm text-error-500 bg-error-50 dark:bg-error-500/10 px-3 sm:px-4 py-2 rounded-lg">
            {error}
          </div>
        )}
        {successMsg && (
          <div className="mb-4 text-xs sm:text-sm text-success-600 bg-success-50 dark:bg-success-500/10 px-3 sm:px-4 py-2 rounded-lg">
            {successMsg}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {themes.map((theme) => {
            const isSelected = selectedKey === theme.key;
            return (
              <div
                key={theme.key}
                onClick={() => setSelectedKey(theme.key)}
                className={`cursor-pointer rounded-xl border-2 p-4 transition ${
                  isSelected
                    ? "border-brand-500 bg-brand-50 dark:bg-brand-500/10"
                    : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                }`}
              >
                {/* Thumbnail placeholder — actual screenshot image use kar sakte ho baad mein */}
                <div className="w-full aspect-video rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-3xl mb-3">
                  🎨
                </div>

                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-sm font-semibold text-gray-800 dark:text-white/90">
                    {theme.name}
                  </h4>
                  {isSelected && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-brand-500 text-white">
                      Selected
                    </span>
                  )}
                </div>

                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                  {theme.description}
                </p>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation(); // card ka onClick trigger na ho
                    handlePreview(theme.key);
                  }}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                >
                  Preview →
                </button>
              </div>
            );
          })}
        </div>

        <div className="mt-6">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving || !selectedKey}
            className="px-6 py-2.5 rounded-lg bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving ? "Saving..." : "Save Template"}
          </button>
        </div>
      </ComponentCard>
    </div>
  );
}