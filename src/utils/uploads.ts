const DEFAULT_UPLOAD_BASE_URL = 'https://uploads.conforma.com';
const DEFAULT_CDN_BASE_URL = 'https://cdn.conforma.com';

export const getUploadBaseUrl = () => process.env.FILE_UPLOAD_BASE_URL ?? DEFAULT_UPLOAD_BASE_URL;

export const getCdnBaseUrl = () => process.env.FILE_CDN_BASE_URL ?? DEFAULT_CDN_BASE_URL;
