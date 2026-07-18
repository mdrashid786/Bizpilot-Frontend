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

// Har theme-key ke liye visual identity — gradient + icon + accent color
const THEME_VISUALS: Record<string, { gradient: string; icon: string; accent: string }> = {
  "restaurant-modern": {
    gradient: "from-[#C8A96E] via-[#9C6033] to-[#2C1A0E]",
    icon: "🍽️",
    accent: "#C8A96E",
  },
  "restaurant-classic": {
    gradient: "from-[#B08968] via-[#7F5539] to-[#3C2415]",
    icon: "🕯️",
    accent: "#B08968",
  },
  "restaurant-minimal": {
    gradient: "from-[#D9D9D9] via-[#A0A0A0] to-[#4A4A4A]",
    icon: "🍴",
    accent: "#A0A0A0",
  },
  "salon-modern": {
    gradient: "from-[#F5B8C4] via-[#D6336C] to-[#3D0B1F]",
    icon: "💇",
    accent: "#D6336C",
  },
  "salon-classic": {
    gradient: "from-[#E8C4A0] via-[#B08968] to-[#4A2E1F]",
    icon: "💅",
    accent: "#B08968",
  },
  "salon-minimal": {
    gradient: "from-[#E5E5E5] via-[#B0B0B0] to-[#404040]",
    icon: "✂️",
    accent: "#B0B0B0",
  },
};

const DEFAULT_VISUAL = {
  gradient: "from-brand-300 via-brand-500 to-brand-700",
  icon: "🎨",
  accent: "#465FFF",
};

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
    const previewUrl = `${SITE_BASE_URL}/theme-previews/${themeKey}.html`;
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

  const currentThemeName = themes.find((t) => t.key === business.theme)?.name;

  return (
    <div className="px-3 sm:px-0">
      <PageMeta title="Choose Template" description="Select your website template" />
      <PageBreadcrumb pageTitle="Choose Template" />

      {/* HEADER BANNER */}
      <div className="rounded-2xl border border-gray-200 bg-gradient-to-br from-brand-500/10 via-transparent to-transparent p-6 sm:p-8 mb-6 dark:border-gray-800">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90 mb-1.5">
          Pick a look for your website ✨
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-lg">
          Choose a template that best fits your brand. You can preview any template before
          saving — your final choice will be used for your live website.
        </p>
        {currentThemeName && (
          <div className="mt-4 inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-full bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-400">
            <span className="w-1.5 h-1.5 rounded-full bg-success-500" />
            Currently using: <strong>{currentThemeName}</strong>
          </div>
        )}
      </div>

      <ComponentCard title="Available Templates">
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {themes.map((theme) => {
            const isSelected = selectedKey === theme.key;
            const visual = THEME_VISUALS[theme.key] ?? DEFAULT_VISUAL;

            return (
              <div
                key={theme.key}
                onClick={() => setSelectedKey(theme.key)}
                className={`group cursor-pointer rounded-2xl overflow-hidden border-2 transition-all duration-300 ${
                  isSelected
                    ? "border-brand-500 shadow-lg shadow-brand-500/20 scale-[1.02]"
                    : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md hover:-translate-y-1"
                }`}
              >
                {/* THUMBNAIL — gradient + icon */}
                <div
                  className={`relative w-full aspect-video bg-gradient-to-br ${visual.gradient} flex items-center justify-center overflow-hidden`}
                >
                  <span className="text-5xl drop-shadow-lg transition-transform duration-300 group-hover:scale-110">
                    {visual.icon}
                  </span>

                  {/* Decorative shapes */}
                  <div className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full bg-white/10" />
                  <div className="absolute -top-4 -left-4 w-16 h-16 rounded-full bg-white/10" />

                  {isSelected && (
                    <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white flex items-center justify-center shadow-md">
                      <svg
                        className="w-4 h-4 text-brand-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* CONTENT */}
                <div className="p-4 bg-white dark:bg-white/[0.03]">
                  <div className="flex items-center justify-between mb-1.5">
                    <h4 className="text-sm font-semibold text-gray-800 dark:text-white/90">
                      {theme.name}
                    </h4>
                    {isSelected && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-500 text-white font-medium uppercase tracking-wide">
                        Selected
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 leading-relaxed min-h-[32px]">
                    {theme.description}
                  </p>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePreview(theme.key);
                    }}
                    className="w-full flex items-center justify-center gap-1.5 text-xs font-medium px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-400 transition"
                  >
                    Live Preview
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* STICKY-ISH SAVE BAR */}
        <div className="mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 sm:p-5 rounded-xl bg-gray-50 dark:bg-gray-800">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {selectedKey
              ? "Ready to save your selection? This will be used for your live website."
              : "Select a template above to continue."}
          </p>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving || !selectedKey}
            className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {saving ? (
              "Saving..."
            ) : (
              <>
                Save Template
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </>
            )}
          </button>
        </div>
      </ComponentCard>
    </div>
  );
}