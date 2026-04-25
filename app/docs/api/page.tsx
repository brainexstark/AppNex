import Navbar from "@/components/Navbar";
import Link from "next/link";
import { ArrowLeft, MessageCircle, Code2 } from "lucide-react";

export const metadata = { title: "API Reference — AppNex Docs" };

const ENDPOINTS = [
  {
    method: "GET",
    path: "/api/apps",
    desc: "List all published apps.",
    params: [
      { name: "limit", type: "number", desc: "Max results (default 50, max 100)" },
      { name: "type", type: "pwa | apk | web", desc: "Filter by app type" },
      { name: "q", type: "string", desc: "Search by name" },
    ],
    response: `[
  {
    "id": "uuid",
    "name": "My App",
    "description": "A great app",
    "type": "pwa",
    "url": "https://myapp.com",
    "icon": "https://myapp.com/icon.png",
    "created_at": "2026-01-01T00:00:00Z"
  }
]`,
  },
  {
    method: "POST",
    path: "/api/apps",
    desc: "Submit a new app listing.",
    body: [
      { name: "name", type: "string", required: true, desc: "App name (max 100 chars)" },
      { name: "url", type: "string", required: true, desc: "App URL (must be http/https)" },
      { name: "type", type: "pwa | apk | web", required: true, desc: "App type" },
      { name: "description", type: "string", required: false, desc: "Short description (max 500 chars)" },
      { name: "icon", type: "string", required: false, desc: "Icon URL" },
    ],
    response: `{
  "id": "uuid",
  "name": "My App",
  "type": "pwa",
  "url": "https://myapp.com",
  "created_at": "2026-01-01T00:00:00Z"
}`,
  },
  {
    method: "GET",
    path: "/api/apps/:id",
    desc: "Get a single app by ID.",
    params: [],
    response: `{
  "id": "uuid",
  "name": "My App",
  "type": "pwa",
  "url": "https://myapp.com",
  "icon": "https://myapp.com/icon.png",
  "description": "A great app",
  "created_at": "2026-01-01T00:00:00Z"
}`,
  },
  {
    method: "GET",
    path: "/api/extract?url=",
    desc: "Extract metadata from any URL. Returns name, description, icon, and detected type.",
    params: [
      { name: "url", type: "string", desc: "The URL to extract metadata from" },
    ],
    response: `{
  "name": "My App",
  "description": "A great app",
  "icon": "https://myapp.com/icon.png",
  "type": "pwa",
  "theme_color": "#3B82F6"
}`,
  },
];

const methodColor: Record<string, string> = {
  GET: "text-green-400 bg-green-400/10 border-green-400/20",
  POST: "text-blue-400 bg-blue-400/10 border-blue-400/20",
  PATCH: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  DELETE: "text-red-400 bg-red-400/10 border-red-400/20",
};

export default function ApiPage() {
  return (
    <div className="min-h-screen bg-[#0F0F1A]">
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 sm:px-6 py-12">
        <Link href="/support" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors mb-8 group">
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to Support
        </Link>

        <div className="mb-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-green-500/25 bg-green-500/10 px-3 py-1 text-xs font-semibold text-green-300 mb-4">
            <MessageCircle className="h-3.5 w-3.5" />
            API Reference
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">
            AppNex REST API
          </h1>
          <p className="text-gray-400 text-base leading-relaxed">
            Integrate AppNex into your own workflow. All endpoints return JSON.
            Base URL: <code className="text-blue-400 bg-blue-400/10 px-1.5 py-0.5 rounded text-sm">https://appnex.app</code>
          </p>
        </div>

        {/* Auth note */}
        <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/5 p-5 mb-10">
          <div className="flex items-start gap-3">
            <Code2 className="h-5 w-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-white mb-1">Authentication</p>
              <p className="text-xs text-gray-400 leading-relaxed">
                Read endpoints (GET) are public. Write endpoints (POST, PATCH, DELETE) require a valid session cookie obtained by signing in at <code className="text-blue-400">/login</code>.
                For server-to-server use, include your Supabase anon key as <code className="text-blue-400">apikey</code> header.
              </p>
            </div>
          </div>
        </div>

        {/* Endpoints */}
        <div className="space-y-8 mb-12">
          {ENDPOINTS.map((ep) => (
            <div key={ep.path} className="rounded-2xl border border-white/8 bg-[#1A1A2E] overflow-hidden">
              <div className="flex items-center gap-3 px-5 py-4 border-b border-white/5">
                <span className={`rounded-lg border px-2.5 py-1 text-xs font-bold ${methodColor[ep.method] ?? "text-gray-400"}`}>
                  {ep.method}
                </span>
                <code className="text-sm font-mono text-white">{ep.path}</code>
              </div>
              <div className="p-5 space-y-4">
                <p className="text-sm text-gray-400">{ep.desc}</p>

                {ep.params && ep.params.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      {ep.method === "POST" ? "Request Body" : "Query Parameters"}
                    </p>
                    <div className="rounded-xl bg-[#0F0F1A] border border-white/5 overflow-hidden">
                      {(ep.params as Array<{ name: string; type: string; desc: string; required?: boolean }>).map((p, i) => (
                        <div key={p.name} className={`flex items-start gap-3 px-4 py-3 ${i > 0 ? "border-t border-white/5" : ""}`}>
                          <code className="text-xs text-blue-400 font-mono flex-shrink-0 mt-0.5">{p.name}</code>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="text-[10px] text-gray-600 font-mono">{p.type}</span>
                              {"required" in p && p.required && (
                                <span className="text-[10px] text-red-400 font-semibold">required</span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500">{p.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {ep.body && ep.body.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Request Body</p>
                    <div className="rounded-xl bg-[#0F0F1A] border border-white/5 overflow-hidden">
                      {ep.body.map((p, i) => (
                        <div key={p.name} className={`flex items-start gap-3 px-4 py-3 ${i > 0 ? "border-t border-white/5" : ""}`}>
                          <code className="text-xs text-blue-400 font-mono flex-shrink-0 mt-0.5">{p.name}</code>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="text-[10px] text-gray-600 font-mono">{p.type}</span>
                              {p.required && <span className="text-[10px] text-red-400 font-semibold">required</span>}
                            </div>
                            <p className="text-xs text-gray-500">{p.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Response</p>
                  <pre className="rounded-xl bg-[#0F0F1A] border border-white/5 px-4 py-3 text-xs text-green-300 font-mono overflow-x-auto whitespace-pre-wrap">
                    {ep.response}
                  </pre>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-3">
          <Link href="/submit" className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg hover:shadow-blue-500/30 transition-all hover:scale-105">
            Try the Submit UI
          </Link>
          <Link href="/support" className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-semibold text-gray-200 hover:bg-white/10 transition-all">
            Back to Support
          </Link>
        </div>
      </main>
    </div>
  );
}
