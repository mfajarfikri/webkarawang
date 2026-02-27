import editorjsHTML from "editorjs-html";

export const customParsers = {
    table: (data) => {
        if (!data || !data.content) return "";
        const rows = data.content
            .map((row) => {
                return `<tr>${row.map((cell) => `<td class="border border-slate-300 px-4 py-2">${cell || ""}</td>`).join("")}</tr>`;
            })
            .join("");
        return `<div class="overflow-x-auto my-4"><table class="w-full border-collapse border border-slate-300 text-sm text-left text-slate-700"><tbody class="divide-y divide-slate-200">${rows}</tbody></table></div>`;
    },
    code: (data) => {
        return `<pre class="bg-slate-900 text-slate-50 p-4 rounded-lg overflow-x-auto my-4 font-mono text-sm"><code>${data.code || ""}</code></pre>`;
    },
    checklist: (data) => {
        if (!data || !data.items) return "";
        const items = data.items
            .map(
                (item) =>
                    `<div class="flex items-center space-x-2 my-1"><input type="checkbox" ${item.checked ? "checked" : ""} disabled class="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"><span>${item.text || ""}</span></div>`,
            )
            .join("");
        return `<div class="my-4">${items}</div>`;
    },
    delimiter: () => {
        return `<div class="my-8 flex justify-center text-center text-2xl tracking-widest text-slate-400">***</div>`;
    },
    warning: (data) => {
        return `<div class="bg-amber-50 border-l-4 border-amber-400 p-4 my-4 rounded-r-lg"><p class="font-bold text-amber-800">${data.title || ""}</p><p class="text-sm text-amber-700 mt-1">${data.message || ""}</p></div>`;
    },
    embed: (data) => {
        return `<div class="my-4"><iframe src="${data.embed || ""}" width="${data.width || "100%"}" height="${data.height || "400"}" frameborder="0" allowfullscreen class="w-full aspect-video rounded-lg shadow-sm bg-slate-100"></iframe><p class="text-center text-sm text-slate-500 mt-2 italic">${data.caption || ""}</p></div>`;
    },
    raw: (data) => {
        return `<div class="my-4">${data.html || ""}</div>`;
    },
    linkTool: (data) => {
        const link = data.link || data.url || data.href || data.meta?.url || "";

        // Debug output if link is missing but meta exists
        if (!link && data.meta) {
            console.warn(
                "LinkTool missing link property, checking meta:",
                data,
            );
        }

        if (!link) return "";

        const title = data.meta?.title || link;
        const desc = data.meta?.description || "";
        const image = data.meta?.image?.url || "";

        return `
            <a href="${link}" target="_blank" rel="nofollow noopener noreferrer" class="flex flex-col md:flex-row items-center my-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition group overflow-hidden decoration-0">
                ${
                    image
                        ? `<div class="w-full md:w-48 h-48 md:h-auto flex-shrink-0 bg-cover bg-center" style="background-image: url('${image}')"></div>`
                        : ""
                }
                <div class="p-4 flex-1 min-w-0">
                    <h4 class="font-bold text-slate-800 group-hover:text-blue-600 transition truncate">${title}</h4>
                    ${desc ? `<p class="text-sm text-slate-600 mt-1 line-clamp-2">${desc}</p>` : ""}
                    <span class="text-xs text-slate-400 mt-2 block truncate hover:underline">${link}</span>
                </div>
            </a>
        `;
    },
};

export const edjsParser = editorjsHTML(customParsers);

export const sanitizeEditorData = (data) => {
    if (!data || !data.blocks || !Array.isArray(data.blocks)) return data;

    const sanitizedBlocks = data.blocks.map((block) => {
        // Fix for Paragraph blocks missing text or having invalid structure
        if (block.type === "paragraph") {
            if (!block.data) {
                return { ...block, data: { text: "" } };
            }
            if (
                typeof block.data.text === "undefined" ||
                block.data.text === null
            ) {
                return { ...block, data: { ...block.data, text: "" } };
            }
        }
        return block;
    });

    return { ...data, blocks: sanitizedBlocks };
};

export const generateExcerpt = (data, length = 150) => {
    if (!data) return "";
    try {
        const parsed = typeof data === "string" ? JSON.parse(data) : data;
        if (!parsed || !parsed.blocks || !Array.isArray(parsed.blocks))
            return "";

        // Use the parser to get HTML
        const htmlArray = edjsParser.parse(parsed);

        if (!Array.isArray(htmlArray)) return "";

        // Join and strip tags
        const text = htmlArray.join(" ").replace(/<[^>]*>/g, " ");
        // Decode HTML entities if needed (browser handles it usually, but for raw text preview...)
        // Simple entity decode for common ones
        const decoded = text
            .replace(/&nbsp;/g, " ")
            .replace(/&amp;/g, "&")
            .replace(/&lt;/g, "<")
            .replace(/&gt;/g, ">")
            .replace(/&quot;/g, '"');

        return decoded.length > length
            ? decoded.substring(0, length) + "..."
            : decoded;
    } catch (e) {
        console.error("Error generating excerpt:", e);
        return "";
    }
};
