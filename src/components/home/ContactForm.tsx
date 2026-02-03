"use client";

import React from 'react';
import { ContactFormData, FormErrors } from '~/constants/contact';
import { Captcha } from '~/components/ui/captcha';

const inputCls = "w-full px-3 py-2 border-2 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 text-sm border-gray-300 dark:border-gray-600";
const errCls = "text-red-500 text-xs mt-1 flex items-start sm:items-center";
const errSvg = <svg className="w-3 h-3 mr-1 flex-shrink-0 mt-0.5 sm:mt-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>;

function Err({ msg }: { msg: string }) {
  return <p className={errCls}>{errSvg}<span className="break-words leading-relaxed">{msg}</span></p>;
}

function locationsFromCourses(courses: any[]): string[] {
  if (!Array.isArray(courses)) return [];
  return courses
    .map((c: any) => c.locationRel?.name)
    .filter((v: any) => typeof v === 'string' && v.trim().length > 0)
    .reduce((acc: string[], curr: string) => {
      const key = curr.trim().toLowerCase();
      if (!acc.some(a => a.toLowerCase() === key)) acc.push(curr.trim());
      return acc;
    }, []);
}

export interface ContactFormProps {
  formData: ContactFormData;
  errors: FormErrors;
  courses: any[];
  coursesError: Error | null;
  referralCodeLocked: boolean;
  isSubmitting: boolean;
  captchaKey: number;
  captchaValid: boolean;
  emailValid: boolean;
  nameValid: boolean;
  referralCodeValid: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCaptchaChange: (p: { isValid: boolean; text: string; answer: string }) => void;
  onCourseChange: (name: string) => void;
}

export function ContactForm(props: ContactFormProps) {
  const {
    formData,
    errors,
    courses,
    coursesError,
    referralCodeLocked,
    isSubmitting,
    captchaKey,
    captchaValid,
    emailValid,
    nameValid,
    referralCodeValid,
    onInputChange,
    onSubmit,
    onCaptchaChange,
    onCourseChange,
  } = props;

  const locations = locationsFromCourses(courses);
  const submitDisabled = isSubmitting || !captchaValid || !nameValid || !emailValid || ((formData["email-intro"]?.trim()?.length || 0) > 0 && !referralCodeValid);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden max-w-2xl mx-auto">
      <form onSubmit={onSubmit} className="p-4 sm:p-5 space-y-2 sm:space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Course *</label>
            <select
              name="your-course"
              value={formData["your-course"]}
              onChange={e => {
                onInputChange(e);
                onCourseChange(e.target.value);
                const c = courses?.find((x: any) => x.name === e.target.value);
                if (c?.locationRel?.name) {
                  const sel = document.querySelector('select[name="event-location"]') as HTMLSelectElement;
                  if (sel) { sel.value = c.locationRel.name; sel.dispatchEvent(new Event('change', { bubbles: true })); }
                }
              }}
              aria-label="Course"
              className={inputCls}
            >
              <option value="">Select Course</option>
              {coursesError && <option value="">Error loading courses</option>}
              {courses?.map((c: any) => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
            {errors["your-course"] && <Err msg={errors["your-course"]} />}
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Course Location</label>
            <select name="event-location" value={formData["event-location"]} onChange={onInputChange} aria-label="Course Location" className={inputCls}>
              <option value="">Select Course Location</option>
              {locations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Enter referral code {referralCodeLocked && <span className="ml-2 text-green-600 dark:text-green-400 text-xs">✓ Validated</span>}</label>
            <input type="text" name="email-intro" placeholder="Enter referral code (optional)" value={formData["email-intro"]} onChange={onInputChange} disabled={referralCodeLocked} className={`${inputCls} ${referralCodeLocked ? 'border-green-300 dark:border-green-600 bg-green-50 dark:bg-green-900/20 cursor-not-allowed' : ''}`} aria-label="Enter referral code" />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name *</label>
            <input type="text" name="your-name" placeholder="Enter your full name" value={formData["your-name"]} onChange={onInputChange} onKeyPress={e => { if (!/[a-zA-ZÀ-ỹ\s'-]/.test(e.key)) e.preventDefault(); }} required className={`${inputCls} ${errors["your-name"] ? "border-red-500 focus:ring-red-500/20 focus:border-red-500" : ""}`} />
            {errors["your-name"] && <Err msg={errors["your-name"]} />}
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone Number</label>
            <input type="tel" name="your-number" placeholder="+84 123 456 789" value={formData["your-number"]} onChange={onInputChange} onKeyPress={e => { if (!/[0-9+\-()\s]/.test(e.key)) e.preventDefault(); }} className={inputCls} />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address *</label>
            <input type="email" name="your-email" placeholder="your.email@example.com" value={formData["your-email"]} onChange={onInputChange} required className={`${inputCls} ${errors["your-email"] ? "border-red-500 focus:ring-red-500/20 focus:border-red-500" : ""}`} />
            {errors["your-email"] && <Err msg={errors["your-email"]} />}
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Telegram ID (optional)</label>
            <input type="text" name="address-wallet" placeholder="@id telegram" value={formData["address-wallet"]} onChange={onInputChange} className={inputCls} />
          </div>
          {errors.contact && <div className="md:col-span-2"><p className={errCls}>{errSvg}<span className="break-words leading-relaxed">{errors.contact}</span></p></div>}
          <div className="md:col-span-2">
            <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Message</label>
            <textarea id="message" name="message" placeholder="Tell us about your inquiry..." value={formData.message} onChange={onInputChange} rows={3} className={`${inputCls} sm:py-2.5 resize-none text-base`} />
          </div>
          <div className="md:col-span-2">
            <Captcha key={captchaKey} onCaptchaChange={onCaptchaChange} />
          </div>
        </div>
        <button type="submit" disabled={submitDisabled} className="inline-flex items-center justify-center whitespace-nowrap rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:text-success text-base sm:text-lg bg-blue-600 dark:bg-white px-4 sm:px-6 py-2.5 sm:py-3 font-semibold text-white dark:text-blue-900 hover:bg-blue-700 dark:hover:bg-gray-100 w-full">
          {isSubmitting ? <div className="flex items-center justify-center"><svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white dark:text-blue-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>Registering...</div> : "Register"}
        </button>
      </form>
    </div>
  );
}
