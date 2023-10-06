export const mimeTypeToExtensionMap: { [key: string]: string } = {
  // Images
  jpeg: "jpg",
  png: "png",
  gif: "gif",
  bmp: "bmp",
  webp: "webp",
  "svg+xml": "svg",

  // Texts
  plain: "txt",
  csv: "csv",
  html: "html",
  css: "css",
  javascript: "js",
  json: "json",

  // PDFs
  pdf: "pdf",

  // Videos
  mp4: "mp4",
  mpeg: "mpeg",
  ogg: "ogv",
  webm: "webm",
  "3gpp": "3gp",
  "3gpp2": "3g2",

  // Microsoft Office
  "vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
  "vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
  "vnd.openxmlformats-officedocument.presentationml.presentation": "pptx",
  "vnd.ms-word": "doc",
  "vnd.ms-excel": "xls",
  "vnd.ms-powerpoint": "ppt",

  // Others
  "vnd.ms-cab-compressed": "cab",
  rar: "rar",
  "x-7z-compressed": "7z",
  zip: "zip",
  // ... add other mappings as needed
};
