import { useEffect, useState } from "react";
import {
  apiConnectInstagram,
  apiGetCurrentUser,
  apiListPlatformCredentials,
  apiSaveCredentials,
} from "../../lib/api";
import CredentialsModal from "../../components/CredentialsModal";

const statusStyles = {
  ACTIVE: "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200",
  SYNCING: "bg-amber-50 text-amber-600 ring-1 ring-amber-200",
  DISCONNECTED: "bg-red-50 text-red-600 ring-1 ring-red-200",
  INACTIVE: "bg-neutral-100 text-neutral-500 ring-1 ring-neutral-200",
};

const metaStyles = {
  synced: "text-neutral-400",
  connected: "text-emerald-600",
  processing: "text-amber-600",
  error: "text-red-600",
  none: "text-neutral-400",
};

const integrations = [
  {
    key: "linkedin",
    name: "LinkedIn",
    status: "INACTIVE",
    description:
      "Publish and sync approved posts directly to your LinkedIn company page.",
    meta: { type: "none", text: "Not configured" },
    action: "Enable",
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="#0A66C2">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
  {
    key: "twitter",
    name: "X / Twitter",
    status: "INACTIVE",
    description:
      "Cross-post approved content to your X (Twitter) timeline automatically.",
    meta: { type: "none", text: "Not configured" },
    action: "Enable",
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="black">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    key: "instagram",
    name: "Instagram",
    status: "INACTIVE",
    description:
      "Publish photos, videos, and carousels straight to your Instagram business account.",
    meta: { type: "none", text: "Not configured" },
    action: "Enable",
    icon: (
      <svg
        className="h-6 w-6"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient
            id="int-ig"
            x1="3"
            y1="3"
            x2="21"
            y2="21"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#FEDA75" />
            <stop offset="25%" stopColor="#FA7E1E" />
            <stop offset="50%" stopColor="#D62976" />
            <stop offset="75%" stopColor="#962FBF" />
            <stop offset="100%" stopColor="#4F5BD5" />
          </linearGradient>
        </defs>
        <rect
          x="2.5"
          y="2.5"
          width="19"
          height="19"
          rx="5.5"
          stroke="url(#int-ig)"
          strokeWidth="2"
        />
        <circle cx="12" cy="12" r="4.2" stroke="url(#int-ig)" strokeWidth="2" />
        <circle cx="17.3" cy="6.7" r="1.2" fill="url(#int-ig)" />
      </svg>
    ),
  },
  {
    key: "facebook",
    name: "Facebook",
    status: "INACTIVE",
    description:
      "Publish approved posts directly to your Facebook Page automatically.",
    meta: { type: "none", text: "Not configured" },
    action: "Enable",
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="#1877F2">
        <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
      </svg>
    ),
  },
];

function Toggle({ checked, onChange, disabled, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={onChange}
      data-track-label={label ? `Toggle ${label}` : "Toggle Integration"}
      className={`relative h-5 w-9 shrink-0 cursor-pointer rounded-full transition disabled:cursor-not-allowed disabled:opacity-50 ${
        checked ? "bg-brand-500" : "bg-neutral-200"
      }`}
    >
      <span
        className={`absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
          checked ? "translate-x-4" : "translate-x-0"
        }`}
      />
    </button>
  );
}

function IntegrationCard({
  integration,
  enabled,
  onToggle,
  onConfigure,
  statusLoading,
}) {
  const disconnected = integration.status === "DISCONNECTED";

  return (
    <div className="flex flex-col rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-50 ring-1 ring-neutral-200">
          {integration.icon}
        </span>
        <div className="flex flex-col items-end gap-2">
          {statusLoading ? (
            <span className="flex items-center gap-1.5 rounded-full bg-neutral-100 px-2.5 py-1 text-[10px] font-semibold tracking-wide text-neutral-400">
              <svg
                className="h-2.5 w-2.5 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                />
              </svg>
              CHECKING
            </span>
          ) : (
            <span
              className={`rounded-full px-2.5 py-1 text-[10px] font-semibold tracking-wide ${statusStyles[integration.status]}`}
            >
              {integration.status}
            </span>
          )}
          <Toggle
            checked={enabled}
            onChange={onToggle}
            disabled={statusLoading}
            label={integration.name}
          />
        </div>
      </div>

      <p className="mt-3 text-sm font-semibold text-black">
        {integration.name}
      </p>
      <p className="mt-1 flex-1 text-xs leading-relaxed text-neutral-500">
        {integration.description}
      </p>

      <div className="mt-4 flex items-center justify-between border-t border-neutral-100 pt-3 text-xs">
        {statusLoading ? (
          <>
            <span className="h-3 w-24 animate-pulse rounded bg-neutral-100" />
            <span className="h-3 w-14 animate-pulse rounded bg-neutral-100" />
          </>
        ) : (
          <>
            <span
              className={`flex items-center gap-1.5 font-medium ${metaStyles[integration.meta.type]}`}
            >
              {integration.meta.type === "connected" && (
                <svg
                  className="h-3.5 w-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.5 12.75l6 6 9-13.5"
                  />
                </svg>
              )}
              {integration.meta.type === "synced" && (
                <svg
                  className="h-3.5 w-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
                  />
                </svg>
              )}
              {integration.meta.type === "processing" && (
                <svg
                  className="h-3.5 w-3.5 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  />
                </svg>
              )}
              {integration.meta.type === "error" && (
                <svg
                  className="h-3.5 w-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                  />
                </svg>
              )}
              {integration.meta.text}
            </span>
            <button
              type="button"
              onClick={onConfigure}
              data-track-label={`Integrations - ${disconnected ? "Reconnect" : integration.action} ${integration.name}`}
              className={`cursor-pointer font-semibold hover:underline ${
                disconnected ? "text-red-600" : "text-brand-600"
              }`}
            >
              {disconnected ? "Reconnect" : integration.action}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function IntegrationsPage() {
  const [connectedMap, setConnectedMap] = useState({});
  const [configureTarget, setConfigureTarget] = useState(null);
  const [companyId, setCompanyId] = useState(null);
  const [statusLoading, setStatusLoading] = useState(true);
  const [connectingInstagram, setConnectingInstagram] = useState(false);
  const [instagramError, setInstagramError] = useState("");

  function loadConnectedStatus() {
    apiListPlatformCredentials()
      .then((list) => {
        const map = Object.fromEntries(
          (list || []).map((p) => [p.platform, p.is_connected]),
        );
        setConnectedMap(map);
      })
      .catch(() => {})
      .finally(() => setStatusLoading(false));
  }

  useEffect(() => {
    loadConnectedStatus();
    apiGetCurrentUser()
      .then((me) => setCompanyId(me?.id ?? null))
      .catch(() => {});
  }, []);

  async function handleSaveCredentials(payload) {
    const result = await apiSaveCredentials({
      ...payload,
      company_id: companyId ?? undefined,
    });
    if (result?.authorization_url) {
      window.location.href = result.authorization_url;
      return;
    }
    loadConnectedStatus();
    setConfigureTarget(null);
  }

  async function handleConnectInstagram() {
    setInstagramError("");
    setConnectingInstagram(true);
    try {
      const result = await apiConnectInstagram(companyId ?? undefined);
      if (!result?.authorization_url) {
        throw new Error("Instagram did not return an authorization URL.");
      }
      window.location.href = result.authorization_url;
    } catch (err) {
      setInstagramError(err.message);
      setConnectingInstagram(false);
    }
  }

  function handleIntegrationAction(integration) {
    if (integration.key === "instagram") {
      handleConnectInstagram();
      return;
    }
    setConfigureTarget(integration);
  }

  const displayIntegrations = integrations.map((integration) => {
    const isConnected = connectedMap[integration.key];
    if (isConnected === undefined) return integration;
    return {
      ...integration,
      status: isConnected ? "ACTIVE" : "INACTIVE",
      action: isConnected ? "Configure" : "Enable",
      meta: isConnected
        ? { type: "connected", text: "Connected" }
        : { type: "none", text: "Not configured" },
    };
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {displayIntegrations.map((integration) => (
          <IntegrationCard
            key={integration.key}
            integration={integration}
            enabled={Boolean(connectedMap[integration.key])}
            onToggle={() => handleIntegrationAction(integration)}
            onConfigure={() => handleIntegrationAction(integration)}
            statusLoading={
              statusLoading ||
              (integration.key === "instagram" && connectingInstagram)
            }
          />
        ))}
      </div>

      {instagramError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-600">
          {instagramError}
        </div>
      )}

      {configureTarget && (
        <CredentialsModal
          platform={configureTarget.key}
          platformLabel={configureTarget.name}
          onClose={() => setConfigureTarget(null)}
          onSave={handleSaveCredentials}
        />
      )}
    </div>
  );
}
