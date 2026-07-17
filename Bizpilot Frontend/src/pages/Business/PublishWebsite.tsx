import { useState, useEffect } from "react";

import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import ComponentCard from "../../components/common/ComponentCard";
import { Link } from "react-router";

import { API_BASE_URL } from "../../config/api";

const FILE_BASE_URL = API_BASE_URL.replace(/\/api\/?$/, "");


import { getMyBusiness, toggleBusinessPublish, BusinessResponse } from "../../services/businessService";

export default function PublishWebsite() {
  const [business, setBusiness] = useState<BusinessResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const data = await getMyBusiness();
        setBusiness(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load business");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleToggle = async () => {
    if (!business) return;

    setError("");
    setToggling(true);
    try {
      const updated = await toggleBusinessPublish(business.id);
      setBusiness(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update publish status");
    } finally {
      setToggling(false);
    }
  };

  const siteUrl = business ? `${FILE_BASE_URL}/${business.slug}` : "";

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
        <PageMeta title="Publish Website" description="Manage your website visibility" />
        <PageBreadcrumb pageTitle="Publish Website" />
        <ComponentCard title="Website Status">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            You haven't added your business yet. Please add your business details first.
          </p>
        </ComponentCard>
      </div>
    );
  }

  return (
    <div className="px-3 sm:px-0">
      <PageMeta title="Publish Website" description="Manage your website visibility" />
      <PageBreadcrumb pageTitle="Publish Website" />

      <ComponentCard title="Website Status">
        {error && (
          <div className="mb-4 text-xs sm:text-sm text-error-500 bg-error-50 dark:bg-error-500/10 px-3 sm:px-4 py-2 rounded-lg break-words">
            {error}
            {error.includes("template") && (
              <Link to="/choose-template" className="ml-2 underline font-medium">
                Choose a template →
              </Link>
            )}
          </div>
        )}
        

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 sm:p-5 rounded-xl bg-gray-50 dark:bg-gray-800">
          <div className="flex items-center gap-3">
            <span
              className={`w-3 h-3 rounded-full flex-shrink-0 ${
                business.published ? "bg-success-500" : "bg-gray-400"
              }`}
            />
            <div>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {business.published ? "Your website is live" : "Your website is in draft mode"}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {business.published
                  ? "Anyone can visit your website using the link below."
                  : "Your website is hidden from the public until you publish it."}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleToggle}
            disabled={toggling}
            className={`w-full sm:w-auto px-5 py-2.5 rounded-lg text-sm font-medium transition disabled:opacity-60 disabled:cursor-not-allowed ${
              business.published
                ? "bg-error-50 text-error-600 hover:bg-error-100 dark:bg-error-500/10 dark:hover:bg-error-500/20"
                : "bg-brand-500 text-white hover:bg-brand-600"
            }`}
          >
            {toggling
              ? "Updating..."
              : business.published
              ? "Unpublish Website"
              : "Publish Website"}
          </button>
        </div>

        {business.published && (
          <div className="mt-5 flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">Live URL:</span>
            
              <a href={siteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-brand-500 hover:text-brand-600 break-all"
            >
              {siteUrl}
            </a>
            <button
              type="button"
              onClick={() => navigator.clipboard.writeText(siteUrl)}
              className="text-xs px-3 py-1.5 rounded-md border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 sm:ml-auto"
            >
              Copy Link
            </button>
          </div>
        )}
      </ComponentCard>
    </div>
  );
}