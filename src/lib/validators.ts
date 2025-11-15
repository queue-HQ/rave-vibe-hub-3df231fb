// Global reusable validators

export const required = (msg = "This field is required") => (value: string) =>
  value.trim() === "" ? msg : null;

export const email = (msg = "Invalid email") => (value: string) =>
  !/^\S+@\S+\.\S+$/.test(value) ? msg : null;

export const minLength = (length: number, msg?: string) => (value: string) =>
  value.length < length ? msg || `Must be at least ${length} characters` : null;
