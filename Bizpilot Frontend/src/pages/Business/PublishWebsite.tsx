import { useState, useEffect, useRef } from "react";

import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import ComponentCard from "../../components/common/ComponentCard";
import { Link } from "react-router";

import { API_BASE_URL } from "../../config/api";

const FILE_BASE_URL = API_BASE_URL
  .replace("https://admin.", "https://")
  .replace(/\/api\/?$/, "");

import { getMyBusiness, toggleBusinessPublish, BusinessResponse } from "../../services/businessService";

export default function PublishWebsite() {
  const [business, setBusiness] = useState<BusinessResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [error, setError] = useState("");
  const [generatingCard, setGeneratingCard] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

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

  const siteUrl = business ? FILE_BASE_URL.replace("https://", `https://${business.slug}.`) : "";

  const qrImageUrl = siteUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(siteUrl)}&margin=10`
    : "";

  // Downloadable card: QR + business name + generic CTA, composed on a canvas
  const handleDownloadCard = async () => {
    if (!business || !siteUrl) return;

    setGeneratingCard(true);
    setError("");

    try {
      const canvas = canvasRef.current ?? document.createElement("canvas");
      canvasRef.current = canvas;

      const width = 900;
      const height = 1200;
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas not supported");

      // Background
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, "#111827");
      gradient.addColorStop(1, "#1f2937");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Decorative top accent bar
      ctx.fillStyle = "#465FFF";
      ctx.fillRect(0, 0, width, 12);

      // Business name
      ctx.fillStyle = "#FFFFFF";
      ctx.textAlign = "center";
      ctx.font = "bold 56px Arial, sans-serif";
      wrapText(ctx, business.businessName, width / 2, 130, width - 120, 62);

      // Generic call-to-action (category-agnostic)
      ctx.fillStyle = "#9CA3AF";
      ctx.font = "28px Arial, sans-serif";
      ctx.fillText("Scan the QR code below to explore & connect with us", width / 2, 230);

      // White card behind QR for clean scan contrast
      const qrCardSize = 560;
      const qrCardX = (width - qrCardSize) / 2;
      const qrCardY = 300;
      ctx.fillStyle = "#FFFFFF";
      roundRect(ctx, qrCardX, qrCardY, qrCardSize, qrCardSize, 24);
      ctx.fill();

      // Load and draw the QR image
      const qrImg = await loadImage(qrImageUrl);
      const qrPadding = 40;
      ctx.drawImage(
        qrImg,
        qrCardX + qrPadding,
        qrCardY + qrPadding,
        qrCardSize - qrPadding * 2,
        qrCardSize - qrPadding * 2
      );

      // Bottom CTA text
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "bold 34px Arial, sans-serif";
      ctx.fillText("SCAN TO VISIT & BOOK", width / 2, qrCardY + qrCardSize + 70);

      ctx.fillStyle = "#6B7280";
      ctx.font = "22px Arial, sans-serif";
      ctx.fillText(siteUrl.replace("https://", ""), width / 2, qrCardY + qrCardSize + 115);

      // Footer branding
      ctx.fillStyle = "#4B5563";
      ctx.font = "18px Arial, sans-serif";
      ctx.fillText("Powered by TryBizly", width / 2, height - 40);

      // Trigger download
      const link = document.createElement("a");
      link.download = `${business.slug}-qr-card.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate QR card");
    } finally {
      setGeneratingCard(false);
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
          <>
            {/* LIVE URL */}
            <div className="mt-5 flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">Live URL:</span>
              
              <a  href={siteUrl}
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

            {/* QR CODE CARD */}
            <div className="mt-5 p-4 sm:p-5 rounded-lg border border-gray-200 dark:border-gray-700">
              <p className="text-sm font-medium text-gray-800 dark:text-white/90 mb-1">
                QR Code for Your Website
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                Download this card and print it for your counter, table, or entrance — customers can scan to visit and book instantly.
              </p>

              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
                {qrImageUrl && (
                  <div className="flex-shrink-0 p-3 bg-white rounded-lg border border-gray-200 dark:border-gray-700">
                    <img
                      src={qrImageUrl}
                      alt="Website QR Code"
                      className="w-36 h-36"
                    />
                  </div>
                )}

                <div className="flex flex-col justify-center gap-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xs">
                    Scan this code to open <span className="font-medium text-gray-700 dark:text-gray-300">{siteUrl.replace("https://", "")}</span> directly.
                  </p>
                  <button
                    type="button"
                    onClick={handleDownloadCard}
                    disabled={generatingCard}
                    className="px-5 py-2.5 rounded-lg bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 transition disabled:opacity-60 disabled:cursor-not-allowed w-fit"
                  >
                    {generatingCard ? "Generating..." : "Download QR Card"}
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </ComponentCard>
    </div>
  );
}

// ---------- Canvas helper utilities ----------

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load QR image"));
    img.src = src;
  });
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
) {
  const words = text.split(" ");
  let line = "";
  let currentY = y;

  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i] + " ";
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && i > 0) {
      ctx.fillText(line.trim(), x, currentY);
      line = words[i] + " ";
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line.trim(), x, currentY);
}