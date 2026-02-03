"use client";

import { ContactFormData, FormErrors } from "~/constants/contact";
import { Captcha } from "~/components/ui/captcha";

const inputClass = "w-full px-3 py-2 border-2 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 border-gray-300 dark:border-gray-600";
const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";
const errClass = "text-red-500 text-xs mt-1";

type Props = {
  formData: ContactFormData;
  errors: FormErrors;
  isSubmitting: boolean;
  captchaValid: boolean;
  captchaKey?: number;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCaptchaChange: (payload: { isValid: boolean; text: string; answer: string }) => void;
};

export default function AboutContactForm({ formData, errors, isSubmitting, captchaValid, captchaKey, onInputChange, onSubmit, onCaptchaChange }: Props) {
  const nameOk = (formData["your-name"] || "").trim().length > 0;
  const emailVal = (formData["your-email"] || "").trim();
  const emailOk = emailVal.length > 0 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal);
  const canSubmit = captchaValid && nameOk && emailOk;

  return (
    <div className="relative isolate rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-none">
      <div className="absolute inset-0 rounded-xl bg-white dark:bg-gray-800" aria-hidden />
      <form onSubmit={onSubmit} className="relative z-10 p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Full Name *</label>
            <input type="text" name="your-name" placeholder="Enter your full name" value={formData["your-name"]} onChange={onInputChange} required disabled={isSubmitting}
              className={`${inputClass} ${errors["your-name"] ? "border-red-500" : ""}`} />
            {errors["your-name"] && <p className={errClass}>{errors["your-name"]}</p>}
          </div>
          <div>
            <label className={labelClass}>Phone Number</label>
            <input type="tel" name="your-number" placeholder="+84 123 456 789" value={formData["your-number"]} onChange={onInputChange} disabled={isSubmitting} className={inputClass} />
          </div>
          <div className="md:col-span-2">
            <label className={labelClass}>Email Address *</label>
            <input type="email" name="your-email" placeholder="your.email@example.com" value={formData["your-email"]} onChange={onInputChange} required disabled={isSubmitting} className={inputClass} />
          </div>
          <input type="hidden" name="event-location" value={formData["event-location"]} />
        </div>
        {errors.contact && <p className={errClass}>{errors.contact}</p>}
        <div>
          <label className={labelClass}>Message</label>
          <textarea name="message" placeholder="Tell us about your inquiry..." value={formData.message} onChange={onInputChange} rows={3} disabled={isSubmitting} className={`${inputClass} resize-none`} />
        </div>
        <div className={isSubmitting ? "opacity-60 pointer-events-none" : ""}>
          <Captcha key={captchaKey} onCaptchaChange={onCaptchaChange} />
        </div>
        <button type="submit" disabled={isSubmitting || !canSubmit} className="inline-flex items-center justify-center w-full rounded-lg text-lg bg-blue-600 dark:bg-white px-6 py-3 font-semibold text-white dark:text-blue-900 shadow-lg focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50">
          {isSubmitting ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white dark:border-blue-900 border-t-transparent rounded-full animate-spin" />Sending...</span> : "Send Message"}
        </button>
      </form>
    </div>
  );
}
