import { useState, useEffect } from "react";
import { Link } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import { getMyBusiness, BusinessResponse } from "../../services/businessService";
import { getCategoryConfig, getCategoryRows, CategoryConfigResponse, CategoryRowResponse } from "../../services/categoryDataService";
import { API_BASE_URL } from "../../config/api";

export default function Home() {
  const [business, setBusiness] = useState<BusinessResponse | null>(null);
  const [config, setConfig] = useState<CategoryConfigResponse | null>(null);
  const [rows, setRows] = useState<CategoryRowResponse[]>([]);
  const [loading, setLoading] = useState(true);


  // for
// const FILE_BASE_URL = API_BASE_URL.replace(/\/api\/?$/, "");
// console.log("FILE_BASE_URL : "+FILE_BASE_URL)


// for live
const FILE_BASE_URL = API_BASE_URL
  .replace("https://admin.", "https://")
  .replace(/\/api\/?$/, "");

const siteUrl = business? FILE_BASE_URL.replace("https://", `https://${business.slug}.`): "";


  useEffect(() => {
    async function load() {
      try {
        const biz = await getMyBusiness();
        setBusiness(biz);

        if (biz) {
          const [cfg, items] = await Promise.all([getCategoryConfig(), getCategoryRows()]);
          setConfig(cfg);
          setRows(items);
        }
      } catch {
        // ignore, empty state dikhega
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-500 text-sm">
        Loading...
      </div>
    );
  }

  // ---------- EMPTY STATE (no business yet) ----------
  if (!business) {
    return (
      <>
        <PageMeta title="Dashboard" description="Your business dashboard" />

        <div className="space-y-6">
          {/* WELCOME BANNER */}
          <div className="rounded-2xl border border-gray-200 bg-gradient-to-br from-brand-500/10 to-transparent p-8 text-center dark:border-gray-800">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90 mb-2">
              Welcome to Bizpilot 👋
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
              Get your business online in minutes. Add your details, showcase your menu or services, and share your own website link with customers.
            </p>
            <Link
              to="/add-your-business"
              className="inline-block px-6 py-3 rounded-lg bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 transition"
            >
              Add Your Business
            </Link>
          </div>

          {/* ONBOARDING CHECKLIST */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <h3 className="text-base font-semibold text-gray-800 dark:text-white/90 mb-5">
              Getting Started
            </h3>
            <div className="space-y-4">
              {[
                { step: "1", title: "Add your business details", desc: "Name, category, contact info, and location.", done: false },
                { step: "2", title: "Upload logo & cover image", desc: "Make your website look professional.", done: false },
                { step: "3", title: "Add your menu or services", desc: "List what you offer with prices and images.", done: false },
                { step: "4", title: "Publish your website", desc: "Go live and share your link with customers.", done: false },
              ].map((item) => (
                <div key={item.step} className="flex items-start gap-4">
                  <div className="w-7 h-7 rounded-full border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center flex-shrink-0 text-xs font-medium text-gray-500 dark:text-gray-400">
                    {item.step}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800 dark:text-white/90">{item.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* FEATURE HIGHLIGHTS */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
              <div className="w-10 h-10 rounded-lg bg-brand-50 dark:bg-brand-500/10 flex items-center justify-center text-lg mb-3">
                🌐
              </div>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">Your Own Website</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                A professional website generated automatically for your business.
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
              <div className="w-10 h-10 rounded-lg bg-brand-50 dark:bg-brand-500/10 flex items-center justify-center text-lg mb-3">
                📋
              </div>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">Easy Menu Management</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Add, edit, and organize your offerings anytime, from anywhere.
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
              <div className="w-10 h-10 rounded-lg bg-brand-50 dark:bg-brand-500/10 flex items-center justify-center text-lg mb-3">
                💬
              </div>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">WhatsApp Ordering</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Customers can order directly through WhatsApp — no extra setup.
              </p>
            </div>
          </div>
        </div>
      </>
    );
  }

  // ---------- ACTIVE STATE (business exists) ----------
  const nameKey = config?.fields.find((f) => f.type === "text")?.key;
  const recentItems = [...rows].reverse().slice(0, 5);

  return (
    <>
      <PageMeta title="Dashboard" description="Your business dashboard" />

      <div className="space-y-6">
        {/* WELCOME + STATUS */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                {business.businessName}
              </h2>
              <div className="flex items-center gap-2 mt-1.5">
                <span className={`w-2 h-2 rounded-full ${business.published ? "bg-success-500" : "bg-gray-400"}`} />
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {business.published ? "Live" : "Draft — not published yet"}
                </span>
                {business.published && (
                  <>
                    <span className="text-gray-300 dark:text-gray-600">•</span>
                    
                     {/* <a href={`${FILE_BASE_URL}/${business.slug}`} */}
                      <a href={`${siteUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-brand-500 hover:text-brand-600"
                    >
                      Visit Website ↗
                    </a>
                  </>
                )}
              </div>
            </div>
            <Link
              to="/publish-website"
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition"
            >
              {business.published ? "View Website Settings" : "Publish Now"}
            </Link>
          </div>
        </div>

        {/* METRICS ROW */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              {config?.dashboardSectionLabel ?? "Items"}
            </p>
            <p className="mt-2 text-2xl font-semibold text-gray-800 dark:text-white/90">{rows.length}</p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Category</p>
            <p className="mt-2 text-2xl font-semibold text-gray-800 dark:text-white/90">{business.category}</p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Status</p>
            <p className="mt-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              {business.published ? "Live" : "Draft"}
            </p>
          </div>
        </div>

        {/* QUICK ACTIONS */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <h3 className="text-base font-semibold text-gray-800 dark:text-white/90 mb-4">Quick Actions</h3>
          <div className="flex flex-wrap gap-3">
            <Link to="/manage-menu" className="px-4 py-2 rounded-lg bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 transition">
              + Add {config?.dashboardSectionLabel ?? "Item"}
            </Link>
            <Link to="/add-your-business" className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition">
              Edit Business Details
            </Link>
          </div>
        </div>

      {/* RECENT ITEMS */}
<div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 dark:border-gray-800 dark:bg-white/[0.03]">
  <div className="flex items-center justify-between mb-4">
    <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">Recently Added</h3>
    <Link to="/manage-menu" className="text-xs text-brand-500 hover:text-brand-600 font-medium">
      View All
    </Link>
  </div>

  {recentItems.length === 0 ? (
    <p className="text-sm text-gray-500 dark:text-gray-400">
      You haven't added any {config?.dashboardSectionLabel.toLowerCase() ?? "items"} yet.
    </p>
  ) : (
    <ul className="divide-y divide-gray-100 dark:divide-gray-800">
      {recentItems.map((item) => {
        const priceKey = config?.fields.find((f) => f.type === "number")?.key;
        const imageKey = config?.fields.find((f) => f.type === "image")?.key;
        const imagePath = imageKey ? item.fields[imageKey] : null;
        console.log("image : "+imagePath)
        const priceValue = priceKey ? item.fields[priceKey] : null;

        return (
          <li key={item.rowId} className="py-3 flex items-center gap-3">
            {imagePath ? (
              <img
                src={FILE_BASE_URL + imagePath}
                alt=""
                className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-sm flex-shrink-0">
                🍽️
              </div>
            )}
            <span className="text-sm text-gray-700 dark:text-gray-300 flex-1">
              {nameKey ? item.fields[nameKey] : "Item"}
            </span>
            {priceValue && (
              <span className="text-sm font-medium text-gray-800 dark:text-white/90">
                ₹{priceValue}
              </span>
            )}
          </li>
        );
      })}
    </ul>
  )}
</div>
      </div>
    </>
  );
}