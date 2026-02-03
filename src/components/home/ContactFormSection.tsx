"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { ImageModal } from '~/components/ui/ImageModal';
import { useToastContext } from '~/components/toast-provider';
import { ContactFormData, FormErrors } from '~/constants/contact';
import { useDeviceFingerprint } from '~/hooks/useDeviceFingerprint';
import { useQuery } from '@tanstack/react-query';
import StarIcon from "~/components/ui/StarIcon";
import BannedForm from "~/components/BannedForm";
import { ContactForm } from "./ContactForm";

const REFERRAL_ERR: Record<string, { msg: string; key: string }> = {
  REFERRAL_NOT_FOUND: { msg: 'Referral Code Not Found', key: 'Referral code not found' },
  INVALID_REFERRAL_CODE: { msg: 'Invalid Referral Code Format', key: 'Invalid referral code format' },
  CODE_INACTIVE: { msg: 'Special Code Inactive', key: 'Special code is inactive' },
  CODE_EXPIRED: { msg: 'Special Code Expired', key: 'Special code has expired' },
  CANNOT_USE_OWN_CODE: { msg: 'Cannot Use Own Code', key: 'Cannot use your own referral code' },
};

function scrollToContact() {
  const el = document.getElementById('contact');
  if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.pageYOffset - 100, behavior: 'smooth' });
}

export default function ContactFormSection() {
  const { data: session } = useSession();
  const { showSuccess, showError } = useToastContext();

  const [selectedCourseImage, setSelectedCourseImage] = useState<string>('');
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [formData, setFormData] = useState<ContactFormData>({
    "your-name": "",
    "your-number": "",
    "your-email": "",
    "address-wallet": "",
    "email-intro": "",
    "event-location": "",
    "your-course": "",
    message: ""
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [captchaValid, setCaptchaValid] = useState(false);
  const [captchaText, setCaptchaText] = useState("");
  const [captchaAnswer, setCaptchaAnswer] = useState("");
  const [captchaKey, setCaptchaKey] = useState(0);
  const [referralCodeValid, setReferralCodeValid] = useState(false);
  const [referralCodeLocked, setReferralCodeLocked] = useState(false);
  const [isDeviceBanned, setIsDeviceBanned] = useState(false);
  const [banDetails, setBanDetails] = useState<any>(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const { deviceData } = useDeviceFingerprint();
  const emailValid = (formData["your-email"] || '').trim().length > 0 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((formData["your-email"] || '').trim());
  const nameValid = (formData["your-name"] || '').trim().length > 0;

  useEffect(() => {
    const checkBanStatus = async () => {
      if (!deviceData) return;
      
      try {
        const response = await fetch('/api/device/check-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ deviceData })
        });
        
        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            setIsDeviceBanned(result.data.isBanned);
            setBanDetails(result.data);
          }
        }
      } catch (error) {
      }
    };

    checkBanStatus();
  }, [deviceData]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
   
        const sessionUser = session?.user as { address?: string; email?: string };
        const address = sessionUser?.address;
        const email = sessionUser?.email;

        
        if (!address && !email) {
          return;
        }
        
        const url = new URL('/api/user', window.location.origin);
        if (address) url.searchParams.set('address', address);
        if (email) url.searchParams.set('email', email);
        
        
        
        const response = await fetch(url.toString());
 
        
        if (response.ok) {
          const userData = await response.json();

          if (userData && userData.data && (userData.data.email)) {
            setFormData(prev => {
              const newData = {
                ...prev,
                "your-email": userData.data.email || ""
              };
              return newData;
            });
          } else {
            
          }
        } else {
          const errorText = await response.text();
          
        }
      } catch (error) {
      }
    };

    fetchUserData();
  }, [session]);

  const { data: courses = [], error: coursesError } = useQuery({
    queryKey: ['contact-form-courses'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/courses');
        if (!response.ok) throw new Error('Failed to fetch courses');
        const data = await response.json();
        return data?.data || [];
      } catch (error) {
        return []; 
      }
    },
    staleTime: 5 * 60 * 1000, 
    gcTime: 10 * 60 * 1000, 
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (courses.length > 0 && !selectedCourse && formData["your-course"]) {
      const course = (courses as any[]).find((c: any) => c.name === formData["your-course"]);
      if (course) {
        setSelectedCourse(course);
        setSelectedCourseImage(course.image || '');
      }
    }
  }, [courses, selectedCourse, formData["your-course"]]);

  const resetFormState = useCallback(() => {
    setFormData({
      "your-name": "",
      "your-number": "",
      "your-email": "",
      "address-wallet": "",
      "email-intro": "",
      "event-location": "",
      "your-course": "",
      message: ""
    });
    setErrors({});
    setCaptchaValid(false);
    setCaptchaText("");
    setCaptchaAnswer("");
    setCaptchaKey(prev => prev + 1);
    setSelectedCourse(null);
    setSelectedCourseImage('');
    setReferralCodeValid(false);
    setReferralCodeLocked(false);
  }, []);

  const clearReferralCode = useCallback(() => {
    setFormData(prev => ({ ...prev, "email-intro": "" }));
    setErrors(prev => ({ ...prev, "email-intro": undefined }));
    setReferralCodeValid(false);
    setReferralCodeLocked(false);
  }, []);

  const applyReferralResult = useCallback((result: any, ok: boolean, doClear?: boolean) => {
    if (ok) {
      if (result.data?.fingerprint) localStorage.setItem('deviceFingerprint', result.data.fingerprint);
      setReferralCodeValid(true);
      setReferralCodeLocked(true);
      setErrors(prev => ({ ...prev, "email-intro": undefined }));
      showSuccess(result.data?.isSpecial ? 'Special Referral Code Validated' : 'Referral Code Validated', result.data?.isSpecial ? 'Special referral code is valid and can be used!' : `Referral code from ${result.data?.referrerName || 'user'} is valid!`);
    } else {
      setReferralCodeValid(false);
      setReferralCodeLocked(false);
      if (doClear) clearReferralCode();
      const e = REFERRAL_ERR[result.code] || { msg: 'Referral Code Validation Failed', key: 'Referral code validation failed' };
      showError(e.msg, 'Please check the code and try again.');
      setErrors(prev => ({ ...prev, "email-intro": e.key }));
    }
  }, [showError, showSuccess, clearReferralCode]);

  const validateReferralCode = useCallback(async (code: string) => {
    if (!code?.trim() || !deviceData) return;
    setReferralCodeValid(false);
    setReferralCodeLocked(false);
    try {
      const res = await fetch('/api/referral/validate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ referralCode: code.trim(), deviceData }) });
      const result = await res.json();
      applyReferralResult(result, res.ok, false);
    } catch {
      setErrors(prev => ({ ...prev, "email-intro": "Failed to validate referral code" }));
    }
  }, [deviceData, applyReferralResult]);

  useEffect(() => {
    const getCodeFromHash = (h: string) => {
      const m = h.match(/#contact(?:#|&)code=([^#&]+)/i) ?? (h.slice(1).startsWith('contact') ? h.match(/contact#code=([^#&]+)/) : null);
      return m?.[1] ? decodeURIComponent(m[1]).trim() : null;
    };
    const hash = window.location.hash;
    const code = getCodeFromHash(hash);
    if (code) {
      setFormData(prev => ({ ...prev, "email-intro": code }));
      if (deviceData) validateReferralCode(code);
    }
    if (hash?.includes('contact')) setTimeout(scrollToContact, 100);
    const onHash = () => {
      const h = window.location.hash;
      const c = getCodeFromHash(h);
      if (c) {
        setFormData(prev => ({ ...prev, "email-intro": c }));
        if (deviceData) validateReferralCode(c);
      }
      if (h?.includes('contact')) setTimeout(scrollToContact, 100);
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, [deviceData, validateReferralCode]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData["your-name"].trim()) {
      newErrors["your-name"] = "Name is required";
    }

    const email = formData["your-email"].trim();
    if (!email) {
      newErrors["your-email"] = "Email is required";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        newErrors["your-email"] = "Please enter a valid email address";
      }
    }

    if (!formData["your-course"].trim()) newErrors["your-course"] = "Course selection is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
    
    if (errors.contact && (name === "your-number" || name === "your-email" || name === "address-wallet")) {
      setErrors(prev => ({
        ...prev,
        contact: undefined
      }));
    }

    if (name === "email-intro") {
      if (value.trim() && deviceData) {
        setReferralCodeValid(false);
        setReferralCodeLocked(false);
        setTimeout(async () => {
          try {
            const res = await fetch('/api/referral/validate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ referralCode: value.trim(), deviceData }) });
            const result = await res.json();
            applyReferralResult(result, res.ok, true);
          } catch {
            clearReferralCode();
            setErrors(prev => ({ ...prev, "email-intro": "Failed to validate referral code" }));
          }
        }, 300);
      } else {
        setReferralCodeValid(false);
        setReferralCodeLocked(false);
        setErrors(prev => ({ ...prev, "email-intro": undefined }));
      }
    }
  };

  const handleCourseChange = useCallback((courseName: string) => {
    const selected = (courses as any[]).find((course: any) => course.name === courseName);
    setSelectedCourse(selected || null);
    const imageUrl = selected?.image || '';
    setSelectedCourseImage(imageUrl);
    
    if (selected?.location) {
      setFormData(prev => ({
        ...prev,
        "event-location": selected.location
      }));
    }
  }, [courses]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/contact/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formData,
          captchaText,
          captchaAnswer,
          deviceData
        })
      });

      if (response.ok) {
        if (formData["email-intro"]) {
          if (!session?.user) {
            showError("You must be logged in to use a referral code!");
          } else {
            try {
              const userResponse = await fetch('/api/user/referral-code');
              if (userResponse.ok) {
                const userData = await userResponse.json();
                if (userData.success && userData.data?.referralCode) {
                  showError("You have created your own referral code, you cannot use someone else's code!");
                } else {
                  void fetch('/api/referral/submit', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      referralCode: formData["email-intro"],
                      formData: formData,
                      deviceData: deviceData
                    })
                  });
                }
              }
            } catch (error) {
            }
          }
        }

        resetFormState();
        
        if (formData["email-intro"] && session?.user) {
          showSuccess("Thank you! Your message has been sent successfully and your referral has been processed.");
        } else {
          showSuccess("Thank you! Your message has been sent successfully.");
        }
        
        setTimeout(() => {
          showSuccess("Please check your email for confirmation. If you don't see it within a few minutes, please check your spam folder or resend the form. For any issues, please contact cardano2vn@gmail.com");
        }, 1000);
      } else {
        throw new Error('Network response was not ok');
      }
    } catch (error) {
      showError("Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      id="contact"
      className="relative flex min-h-[90vh] items-center overflow-x-hidden border-t border-gray-200 dark:border-white/10 scroll-mt-28 md:scroll-mt-40 w-full min-w-0"
    >
      <div className="relative mx-auto max-w-7xl w-full min-w-0 px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid items-center gap-8 sm:gap-12 lg:grid-cols-2 min-w-0">
          <div className="relative flex flex-col h-full justify-center">
            <div className="relative w-full">
              <div className="relative mb-16">
                <div className="mb-6 flex items-center gap-4">
                  <StarIcon size="lg" className="w-16 h-16" />
                  <h2 className="text-2xl lg:text-4xl xl:text-5xl font-bold text-gray-900 dark:text-white">Từ Zero đến Builder</h2>
                </div>
                {!selectedCourseImage && (
                  <div className="max-w-3xl">
                    <p className="text-xl text-gray-600 dark:text-gray-300">
                      Tham gia chương trình đào tạo Blockchain chuyên sâu của chúng tôi, nơi bạn không chỉ học, mà còn trực tiếp xây dựng những ứng dụng phi tập trung có giá trị cho cộng đồng.
                    </p>
                  </div>
                )}
              </div>
              {selectedCourseImage && (
                <div className="mt-6 relative w-full h-[500px]">
                  <img
                    src={selectedCourseImage}
                    alt="Course background"
                    className="w-full h-full object-cover rounded-lg opacity-80 cursor-zoom-in hover:opacity-90 transition-opacity"
                    onClick={() => setIsLightboxOpen(true)}
                  />
                  <ImageModal
                    isOpen={isLightboxOpen}
                    onClose={() => setIsLightboxOpen(false)}
                    imageUrl={selectedCourseImage}
                    alt="Course background"
                  />
                </div>
              )}
            </div>
          </div>
          <div className="relative">
            {isDeviceBanned ? (
              <BannedForm
                failedAttempts={banDetails?.failedAttempts || 0}
                bannedUntil={banDetails?.bannedUntil || new Date().toISOString()}
                lastAttemptAt={banDetails?.lastAttemptAt || new Date().toISOString()}
              />
            ) : (
              <ContactForm
                formData={formData}
                errors={errors}
                courses={courses}
                coursesError={coursesError}
                referralCodeLocked={referralCodeLocked}
                isSubmitting={isSubmitting}
                captchaKey={captchaKey}
                captchaValid={captchaValid}
                emailValid={emailValid}
                nameValid={nameValid}
                referralCodeValid={referralCodeValid}
                onInputChange={handleInputChange}
                onSubmit={handleSubmit}
                onCaptchaChange={({ isValid, text, answer }) => { setCaptchaValid(isValid); setCaptchaText(text); setCaptchaAnswer(answer); }}
                onCourseChange={handleCourseChange}
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
} 