import { Response } from "express";
import fs from "fs/promises";
import path from "path";
import config from "config";

export async function respond(
  res: Response,
  code: number,
  message: string,
  extra?: Record<string, any>
) {
  const req = res.req;
  const isDev = (config.get("app.env") || "") !== "production";

  const forceJson = req.query.format === "json";
  const accept = (req.headers["accept"] || "").toString().toLowerCase();
  const isApiClient =
    forceJson ||
    accept.includes("application/json") ||
    accept.includes("text/json") ||
    req.xhr ||
    (req.headers["user-agent"] &&
      /(postman|insomnia|curl|httpie|axios|fetch)/i.test(
        req.headers["user-agent"] || ""
      ));

  const safeExtra = isDev
    ? extra
    : Object.fromEntries(
      Object.entries(extra || {}).filter(([key]) => key !== "stack")
    );


  if (isApiClient) {
    return res.status(code).json({
      status: code,
      message,
      path: req.path,
      host: req.headers.host,
      timestamp: new Date().toISOString(),
      ...(safeExtra || {}),
    });
  }

  try {
    const filePath = path.join(process.cwd(), "views/error/index.html");
    let template = await fs.readFile(filePath, "utf8");

    const debugHtml = `
      <div class="max-w-5xl w-full text-left bg-[#171717] text-sm text-gray-200 border border-neutral-800 rounded-xl shadow-lg overflow-hidden mt-10">
        <div class="px-6 py-4 border-b border-neutral-800 flex items-center justify-between">
          <h2 class="text-lg font-semibold text-amber-400">Information</h2>
          ${
      isDev && safeExtra?.stack            ? `<button id="toggleStack" class="text-xs text-gray-400 hover:text-amber-400 transition">Show Stack Trace</button>`
            : ""
        }
        </div>
        <div class="px-6 py-4 grid grid-cols-2 gap-4 border-b border-neutral-800">
          <div>
            <p class="text-gray-400 text-xs uppercase mb-1">Status</p>
            <p class="text-sm font-semibold text-gray-100">${code}</p>
          </div>
          <div>
            <p class="text-gray-400 text-xs uppercase mb-1">URL</p>
            <p class="text-sm font-semibold text-gray-100">${escapeHtml(req.path)}</p>
          </div>
          <div>
            <p class="text-gray-400 text-xs uppercase mb-1">Method</p>
            <p class="text-sm font-semibold text-gray-100">${escapeHtml(req?.method || "N/A")}</p>
          </div>
          <div>
            <p class="text-gray-400 text-xs uppercase mb-1">IP</p>
            <p class="text-sm font-semibold text-gray-100">${escapeHtml( req?.ip || "-" )}</p>
          </div>
        </div>
        ${
          isDev && safeExtra?.stack
            ? `<div id="stackContent" class="px-6 py-4 text-xs font-mono text-gray-400 whitespace-pre-wrap hidden">
                ${escapeHtml(safeExtra.stack)}
              </div>`
            : ""
        }
        ${
          safeExtra?.validateMessage &&
          Object.keys(safeExtra.validateMessage).length > 0
            ? `<div class="px-6 py-4 border-t border-neutral-800">
                <h3 class="text-sm font-semibold text-amber-400 mb-2">Validate Message:</h3>
                <ul class="text-xs text-gray-300 list-disc list-inside">
                  ${Object.values(safeExtra.validateMessage)
              .flat()
              .map((msg: any) => `<li>${escapeHtml(msg)}</li>`)
              .join("")}
                </ul>
              </div>`
            : ""
        }
      </div>
      ${
      isDev && safeExtra?.stack
            ? `<script>
              const btn = document.getElementById("toggleStack");
              const stack = document.getElementById("stackContent");
              if(btn && stack){
                btn.addEventListener("click", ()=>{
                  stack.classList.toggle("hidden");
                  btn.innerText = stack.classList.contains("hidden")
                    ? "Show Stack Trace"
                    : "Hide Stack Trace";
                });
              }
            </script>`
            : ""
        }
      `;

    const html = template
      .replace(/{{CODE}}/g, String(code))
      .replace(/{{MESSAGE}}/g, message)
      .replace(/{{PATH}}/g, req.path)
      .replace(/{{HOST}}/g, req.headers.host || "")
      .replace(/{{TIMESTAMP}}/g, new Date().toLocaleString("tr-TR"))
      .replace(/{{COLOR}}/g, getErrorColor(code))
      .replace(/{{EMOJI}}/g, getErrorEmoji(code))
      .replace(/{{DEBUG}}/g, debugHtml);

    return res.status(code).send(html);
  } catch (err) {
    return res.status(code).send(`SERVER ERROR`);
  }
}

function escapeHtml(str: string = "") {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function getErrorColor(code: number) {
  if (code >= 500) return "rose-500";
  if (code >= 400) return "amber-500";
  return "sky-500";
}

function getErrorEmoji(code: number) {
  if (code >= 500) return "💥";
  if (code === 403) return "🚫";
  if (code === 404) return "🔍";
  if (code >= 400) return "⚠️";
  return "ℹ️";
}

export function normalizePath(path: string): string {
  return path.endsWith("/") && path.length > 1 ? path.slice(0, -1) : path;
}
