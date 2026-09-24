import { useEffect, useState } from "react";
import {
  apiConnectBlogger,
  apiConnectInstagram,
  apiConnectWix,
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
  {
    key: "wordpress",
    name: "WordPress",
    status: "INACTIVE",
    description:
      "Publish and schedule blog articles directly to your WordPress site using Application Passwords.",
    meta: { type: "none", text: "Not configured" },
    action: "Enable",
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="#21759B">
        <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 1.8a8.2 8.2 0 016.9 12.7L13.7 5.6A8.2 8.2 0 0012 3.8zm-3.7.9a8.2 8.2 0 00-5 10.6l4.8-8.7a8.2 8.2 0 00.2-1.9zm2.4.6l4.7 12.9a8.2 8.2 0 003.9-3.6l-2.7-8A8.2 8.2 0 0010.7 5.3zM12 15.3l-2.7 7.5A8.2 8.2 0 0012 22.2a8.2 8.2 0 002.6-.4l-2.6-6.5zm-3.4-.6L3.3 12.4a8.2 8.2 0 0015.2 3.7L8.6 14.7zM9.6 7.5a8.2 8.2 0 00-1.2 8.8L12 5.3l-2.4 2.2z" />
      </svg>
    ),
  },
  {
    key: "blogger",
    name: "Blogger",
    status: "INACTIVE",
    description:
      "Connect your Google account with Blogger and publish articles to your blog automatically.",
    meta: { type: "none", text: "Not configured" },
    action: "Enable",
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="#F57C00">
        <path d="M14.9 2H10C6.7 2 4 4.7 4 8v8c0 3.3 2.7 6 6 6h8c3.3 0 6-2.7 6-6V9.1C24 6.2 20.8 2 14.9 2zm-1.9 12.9c0 1.5-1.2 2.7-2.7 2.7H9c-1.5 0-2.7-1.2-2.7-2.7V9c0-1.5 1.2-2.7 2.7-2.7h1.3c1.5 0 2.7 1.2 2.7 2.7v5.9zm5 .1c0 1.4-1.1 2.5-2.5 2.5a2.5 2.5 0 01-2.5-2.5c0-1.4 1.1-2.5 2.5-2.5s2.5 1.1 2.5 2.5zm0-6.5c0 1.4-1.1 2.5-2.5 2.5S13 8.3 13 6.9s1.1-2.5 2.5-2.5 2.5 1.1 2.5 2.5z" />
      </svg>
    ),
  },
  {
    key: "wix",
    name: "Wix",
    status: "INACTIVE",
    description:
      "Connect your Wix site and publish blog posts directly using the Wix Blog API.",
    meta: { type: "none", text: "Not configured" },
    action: "Enable",
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="#0C6EFC">
        <path d="M4 4a2 2 0 012-2h4.8c.6 2.2 1.5 4.2 2.7 6.1 1.2-1.9 2.1-3.9 2.7-6.1H18a2 2 0 012 2v16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm5.4 3.2c-.2-.2-.5-.2-.7 0l-1.8 3.6c-.1.2 0 .5.3.6l3.4 1.7c.2.1.5 0 .6-.2.1-.3.1-.6-.1-.8l-1.7-4.9zm5.2 0c-.3-.1-.6-.3-.6-.6V6.6c0-.3.2-.6.5-.6.2 0 .4 0 .5.2l1.7 4.9c.1.3.1.6-.1.8-.2.2-.5.3-.6.2l-3.4-1.7c-.3-.1-.4-.4-.3-.6l1.4-1.1.9 1.2z" />
      </svg>
    ),
  },
  {
    key: "medium",
    name: "Medium",
    status: "INACTIVE",
    description:
      "Medium discontinued its public publishing API in 2023, so posting from third-party apps is no longer possible.",
    meta: { type: "none", text: "Unavailable" },
    action: "Unavailable",
    disabled: true,
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="black">
        <path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z" />
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
  const unavailable = Boolean(integration.disabled);

  return (
    <div
      className={`flex flex-col rounded-lg border bg-white p-4 shadow-sm ${
        unavailable ? "border-neutral-200 opacity-70" : "border-neutral-200"
      }`}
    >
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
              className={`rounded-full px-2.5 py-1 text-[10px] font-semibold tracking-wide ${
                statusStyles[integration.status]
              }`}
            >
              {integration.status}
            </span>
          )}
          <Toggle
            checked={enabled}
            onChange={onToggle}
            disabled={statusLoading || unavailable}
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
              disabled={unavailable}
              data-track-label={`Integrations - ${disconnected ? "Reconnect" : integration.action} ${integration.name}`}
              className={`cursor-pointer font-semibold hover:underline disabled:cursor-not-allowed disabled:no-underline ${
                disconnected ? "text-red-600" : "text-brand-600"
              } ${unavailable ? "text-neutral-400" : ""}`}
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
  const [connectingKey, setConnectingKey] = useState("");
  const [connectError, setConnectError] = useState("");

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

  async function handleOAuthConnect(key, connectFn) {
    setConnectError("");
    setConnectingKey(key);
    try {
      const result = await connectFn(companyId ?? undefined);
      if (!result?.authorization_url) {
        throw new Error("The platform did not return an authorization URL.");
      }
      window.location.href = result.authorization_url;
    } catch (err) {
      setConnectError(err.message);
      setConnectingKey("");
    }
  }

  function handleIntegrationAction(integration) {
    if (integration.disabled) return;
    if (integration.key === "instagram") {
      handleOAuthConnect("instagram", apiConnectInstagram);
      return;
    }
    if (integration.key === "blogger") {
      handleOAuthConnect("blogger", apiConnectBlogger);
      return;
    }
    if (integration.key === "wix") {
      setConfigureTarget(integration);
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
      action: isConnected ? "Configure" : integration.disabled ? "Unavailable" : "Enable",
      meta: isConnected
        ? { type: "connected", text: "Connected" }
        : integration.disabled
          ? { type: "none", text: "Unavailable" }
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
              statusLoading || (connectingKey === integration.key && Boolean(connectingKey))
            }
          />
        ))}
      </div>

      {connectError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-600">
          {connectError}
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
