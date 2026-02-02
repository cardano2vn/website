"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useToastContext } from '~/components/toast-provider';
import { ContactForm } from './ContactForm';
import { ContactFormData, FormErrors } from '~/constants/contact';
import { useDeviceFingerprint } from '~/hooks/useDeviceFingerprint';
import ContactFormImage from './ContactFormImage';
import ContactFormSkeleton from './ContactFormSkeleton';
import { useQuery } from '@tanstack/react-query';
import StarIcon from "~/components/ui/StarIcon";
import BannedForm from "~/components/BannedForm";

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
  
  const { deviceData, isLoading: fingerprintLoading } = useDeviceFingerprint(); 

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      console.log('Hash changed:', hash);
      
      const match = hash.match(/#contact(?:#|&)code=([^#&]+)/i);
      if (match && match[1]) {
        const referralCode = decodeURIComponent(match[1]);
        
        setFormData(prev => ({
          ...prev,
          "email-intro": referralCode
        }));
        
        if (deviceData) {
          validateReferralCodeFromUrl(referralCode);
        }
      }
    };

    handleHashChange();
    
    window.addEventListener('hashchange', handleHashChange);
    
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [deviceData]);

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
    if (typeof window === 'undefined') return;
    
    const handleReferralCode = () => {
      const url = new URL(window.location.href);
      const hash = url.hash?.slice(1); 
      if (hash && hash.startsWith('contact')) {
        const codeMatch = hash.match(/contact#code=([^#&]+)/);
        
        if (codeMatch && codeMatch[1]) {
          const referralCode = codeMatch[1].trim();
          
         
          setFormData(prev => ({
            ...prev,
            "email-intro": referralCode
          }));
          
          
          setTimeout(() => {
            const contactElement = document.getElementById('contact');
            if (contactElement) {
              const headerOffset = 100;
              const y = contactElement.getBoundingClientRect().top + window.pageYOffset - headerOffset;
              window.scrollTo({ top: y, behavior: 'smooth' });
            }
          }, 100);
        } else {
         
          setTimeout(() => {
            const contactElement = document.getElementById('contact');
            if (contactElement) {
              const headerOffset = 100;
              const y = contactElement.getBoundingClientRect().top + window.pageYOffset - headerOffset;
              window.scrollTo({ top: y, behavior: 'smooth' });
            }
          }, 100);
        }
      }
    };
    
    
    handleReferralCode();
    
    
    const handleHashChange = () => {
      handleReferralCode();
    };
    
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

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

  const { data: courses = [], isLoading: coursesLoading, error: coursesError } = useQuery({
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
    setFormData(prev => ({
      ...prev,
      "email-intro": ""
    }));
    setErrors(prev => ({
      ...prev,
      "email-intro": undefined
    }));
    setReferralCodeValid(false);
    setReferralCodeLocked(false);
  }, []);

  const validateReferralCodeFromUrl = useCallback(async (referralCode: string) => {
    if (!referralCode || !deviceData) return;
    
    setReferralCodeValid(false);
    setReferralCodeLocked(false);
    
    try {
      const response = await fetch('/api/referral/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          referralCode: referralCode.trim(),
          deviceData: deviceData
        }),
      });

      const result = await response.json();
      
      if (!response.ok) {
        setReferralCodeValid(false);
        setReferralCodeLocked(false);
        
        if (result.code === 'REFERRAL_NOT_FOUND') {
          showError('Referral Code Not Found', 'The referral code you entered does not exist in our system. Please check the code again or contact the person who referred you.');
          setErrors(prev => ({
            ...prev,
            "email-intro": "Referral code not found"
          }));
        } else if (result.code === 'INVALID_REFERRAL_CODE') {
          showError('Invalid Referral Code Format', 'The referral code format is incorrect. Please check the code format and try again.');
          setErrors(prev => ({
            ...prev,
            "email-intro": "Invalid referral code format"
          }));
        } else if (result.code === 'CODE_INACTIVE') {
          showError('Special Code Inactive', 'This special referral code is currently inactive and cannot be used.');
          setErrors(prev => ({
            ...prev,
            "email-intro": "Special code is inactive"
          }));
        } else if (result.code === 'CODE_EXPIRED') {
          showError('Special Code Expired', 'This special referral code has expired and can no longer be used.');
          setErrors(prev => ({
            ...prev,
            "email-intro": "Special code has expired"
          }));
        } else if (result.code === 'CANNOT_USE_OWN_CODE') {
          showError('Cannot Use Own Code', 'You cannot use your own referral code. Please use a different referral code.');
          setErrors(prev => ({
            ...prev,
            "email-intro": "Cannot use your own referral code"
          }));
        } else {
          showError('Referral Code Validation Failed', 'Unable to validate the referral code. Please try again later.');
          setErrors(prev => ({
            ...prev,
            "email-intro": "Referral code validation failed"
          }));
        }
      } else {
        console.log('Setting referral code as valid from URL');
        if (result.data?.fingerprint) {
          localStorage.setItem('deviceFingerprint', result.data.fingerprint);
        }
        
        setReferralCodeValid(true);
        setReferralCodeLocked(true); 
        setErrors(prev => ({
          ...prev,
          "email-intro": undefined
        }));

        if (result.data?.isSpecial) {
          showSuccess('Special Referral Code Validated', 'Special referral code is valid and can be used!');
        } else {
          showSuccess('Referral Code Validated', `Referral code from ${result.data?.referrerName || 'user'} is valid!`);
        }
      }
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        "email-intro": "Failed to validate referral code"
      }));
    }
  }, [deviceData, showError, showSuccess]);

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

    if (!formData["your-course"].trim()) {
      newErrors["your-course"] = "Course selection is required";
    }

   

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
        
        // Use a shorter timeout to avoid race conditions
        setTimeout(async () => {
        try {
          const response = await fetch('/api/referral/validate', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              referralCode: value.trim(),
              deviceData: deviceData
            }),
          });

          const result = await response.json();
          
          if (!response.ok) {
            
            
            setReferralCodeValid(false);
            setReferralCodeLocked(false);
            
            if (result.code === 'REFERRAL_NOT_FOUND') {
              showError('Referral Code Not Found', 'The referral code you entered does not exist in our system. Please check the code again or contact the person who referred you.');
              clearReferralCode();
              setErrors(prev => ({
                ...prev,
                "email-intro": "Referral code not found"
              }));
            } else if (result.code === 'INVALID_REFERRAL_CODE') {
              showError('Invalid Referral Code Format', 'The referral code format is incorrect. Please check the code format and try again.');
              clearReferralCode();
              setErrors(prev => ({
                ...prev,
                "email-intro": "Invalid referral code format"
              }));
            } else if (result.code === 'CODE_INACTIVE') {
              showError('Special Code Inactive', 'This special referral code is currently inactive and cannot be used.');
              clearReferralCode();
              setErrors(prev => ({
                ...prev,
                "email-intro": "Special code is inactive"
              }));
            } else if (result.code === 'CODE_EXPIRED') {
              showError('Special Code Expired', 'This special referral code has expired and can no longer be used.');
              clearReferralCode();
              setErrors(prev => ({
                ...prev,
                "email-intro": "Special code has expired"
              }));
            } else if (result.code === 'CANNOT_USE_OWN_CODE') {
              showError('Cannot Use Own Code', 'You cannot use your own referral code. Please use a different referral code.');
              clearReferralCode();
              setErrors(prev => ({
                ...prev,
                "email-intro": "Cannot use your own referral code"
              }));
            } else {
              showError('Referral Code Validation Failed', 'Unable to validate the referral code. Please try again later.');
              clearReferralCode();
              setErrors(prev => ({
                ...prev,
                "email-intro": "Referral code validation failed"
              }));
            }
          } else {
            if (result.data?.fingerprint) {
              localStorage.setItem('deviceFingerprint', result.data.fingerprint);
            }
            
            setReferralCodeValid(true);
            setReferralCodeLocked(true); 
            setErrors(prev => ({
              ...prev,
              "email-intro": undefined
            }));

            if (result.data?.isSpecial) {
              showSuccess('Special Referral Code Validated', 'Special referral code is valid and can be used!');
            } else {
              showSuccess('Referral Code Validated', `Referral code from ${result.data?.referrerName || 'user'} is valid!`);
            }
          }
        } catch (error) {
          clearReferralCode();
          setErrors(prev => ({
            ...prev,
            "email-intro": "Failed to validate referral code"
          }));
        }
      }, 300); 
      } else {
        setReferralCodeValid(false);
        setReferralCodeLocked(false);
        setErrors(prev => ({
          ...prev,
          "email-intro": undefined
        }));
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
                <div className="max-w-3xl">
                  <p className="text-xl text-gray-600 dark:text-gray-300">
                    Tham gia chương trình đào tạo Blockchain chuyên sâu của chúng tôi, nơi bạn không chỉ học, mà còn trực tiếp xây dựng những ứng dụng phi tập trung có giá trị cho cộng đồng.
                  </p>
                </div>
              </div>
              {selectedCourseImage && (
                <div className="mt-6 relative w-full h-[500px]">
                  <ContactFormImage imageUrl={selectedCourseImage} />
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
                isSubmitting={isSubmitting}
                captchaValid={captchaValid}
                captchaKey={captchaKey}
                referralCodeValid={referralCodeValid}
                referralCodeLocked={referralCodeLocked}
                onInputChange={handleInputChange}
                onSubmit={handleSubmit}
                onCaptchaChange={({ isValid, text, answer }) => {
                  setCaptchaValid(isValid);
                  setCaptchaText(text);
                  setCaptchaAnswer(answer);
                }}
                onCourseChange={handleCourseChange}
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
} 