"use client";

import { useState, type ChangeEvent, type SubmitEvent } from "react";
import {
  companyVisibility,
  hasUnusedSkillsFeedback,
  piEaseOfUse,
  platformRating,
  socialPlatforms,
  toolsSupportRating,
} from "./data";
import Image from "next/image";
import Radio from "@/components/Radio";
import LongText from "@/components/LongText";

const initialFormState = {
  visibility_rating: "",
  most_enquiry_platform_rating: [],
  most_raised_customer_questions: "",
  product_information_ease_of_use: "",
  lead_loss_path: "",
  tools_support_feedback: "",
  tools_support_feedback_other: "",
  customers_need_feedback: "",
  employee_unused_skills: "",
  employee_unused_skills_other: "",
  employee_unused_suggestions: "",
  new_company_implementation_feedback: "",
  new_company_fix_feedback: "",
  company_stop_implementation_feedback: "",
};

type MostEnquiryPlatformRating = {
  platform: string;
  rating: string;
}[];

export default function HomepageUI() {
  const [formData, setFormData] = useState(initialFormState);

  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ show: false, type: "", message: "" });

  const [errors, setErrors] = useState<
    Partial<Record<keyof typeof formData, boolean>>
  >({});

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: Array.isArray(formData[name as keyof typeof formData])
        ? [...prev[name as keyof typeof formData], value]
        : value,
    }));
  };

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});

    const newErrors: typeof errors = {};

    Object.entries(formData).forEach(([key, value]) => {
      if (value === "" || value.length === 0) {
        if (!key.includes("other")) newErrors[key as keyof typeof errors] = true;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setAlert({
        show: true,
        type: "danger",
        message: "Please fill out all required fields before submitting.",
      });

      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/send-mail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok || !response.body) {
        const data = await response.json();
        throw new Error(data.error ?? "The response could not be sent.");
      }

      setAlert({
        show: true,
        type: "success",
        message:
          "Thank you! Your questionnaire has been submitted successfully.",
      });

      // Scroll to the top alert
      window.scrollTo({ top: 0, behavior: "smooth" });

      // Reset form & errors on success
      setFormData(initialFormState);
      setErrors({});
    } catch (requestError) {
      setAlert({
        show: true,
        type: "danger",
        message:
          requestError instanceof Error
            ? requestError.message
            : "The response could not be sent.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      {/* Top bar */}
      <div className="h-1.5 bg-brand"></div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Form Card Container */}
        <div className="bg-white rounded-[14px] p-6 sm:p-[2.5rem_2.25rem] shadow-[0_10px_30px_rgba(0,0,0,0.06)] mx-auto max-w-190">
          {/* Header */}
          <div className="text-center mb-6">
            <Image
              src="/logo.png"
              alt="BlackSpot Media"
              width={110}
              height={110}
              className="max-w-27.5 object-cover rounded-full shadow-[0_4px_18px_rgba(0,0,0,0.18)] mb-3 mx-auto"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
            <h1 className="font-title font-bold text-[1.6rem] leading-tight mb-2">
              Diaspora Insurance Employee Questionnaire
            </h1>
            <p className="text-[#6c6c75] text-base mb-1">
              Thank you for choosing to work with us.
            </p>
            <p className="text-sm text-[#6c6c75] mb-4 leading-relaxed">
              This form helps us understand your business, purpose, your
              audience, your goals, and where your brand currently stands, so we
              can develop a strategy that drives real growth. Whether
              you&apos;re a startup finding your voice or an established
              business ready to rebrand, your answers shape everything we build
              together.
            </p>
            <p className="text-sm italic text-[#6c6c75] mb-4">
              Please take your time to be as detailed as possible. The more we
              know, the better we can serve you.
            </p>
            <p className="text-sm font-bold text-[#14141a]">
              Note: following the submission of this form, your brand
              consultation document will be delivered within 5 working days.
            </p>
          </div>

          {/* Form Alert */}
          {alert.show && (
            <div
              id="formAlert"
              className={`p-4 mb-4 text-sm rounded-lg border ${
                alert.type === "success"
                  ? "bg-green-50 border-green-200 text-green-800"
                  : "bg-error-background border-error-border text-error-content"
              }`}
              role="alert"
            >
              {alert.message}
            </div>
          )}

          <form id="consultationForm" onSubmit={handleSubmit} noValidate>
            <Radio
              label="How visible do you think Diaspora Insurance is to diaspora communities compared with other insurers?"
              name="visibility_rating"
              hasError={errors.visibility_rating || false}
              idPrefix="vr"
              items={companyVisibility}
              onChange={handleInputChange}
              selected={formData.visibility_rating}
              required
            />

            <div className="mb-3">
              <label className="block mb-2 text-sm font-medium text-[#14141a]">
                Which channels bring in the most customers or enquiries? (Choose
                up to three.) *
              </label>
              <div
                className={`space-y-2 border ${errors.most_enquiry_platform_rating ? "border-error-border" : "border-[#eee]"} rounded-[10px] p-[0.9rem_1rem] bg-[#fffaf2]`}
              >
                {socialPlatforms
                  .filter((p) => p !== "Other")
                  .map((sp) => {
                    // Create a clean string for unique IDs/names (e.g., "Facebook" -> "facebook")
                    const platformKey = sp.toLowerCase().replace(/\s+/g, "-");

                    return (
                      <div key={sp} className="flex items-center gap-x-8">
                        <p className="w-[30%] text-sm font-bold text-[#14141a]">
                          {sp}
                        </p>

                        <div className="flex items-center gap-x-[0.7rem]">
                          {platformRating
                            .find((p) => p.platform === sp)
                            ?.ratings.map((val, idx) => {
                              const uniqueId = `mspr-${platformKey}-${idx}`;

                              return (
                                <div key={val} className="flex items-center">
                                  <input
                                    type="radio"
                                    id={uniqueId}
                                    // Group buttons by platform row, not globally
                                    name={`most_enquiry_platform_rating_${platformKey}`}
                                    value={val}
                                    checked={
                                      (formData.most_enquiry_platform_rating as MostEnquiryPlatformRating).find(
                                        (p) => p.platform === sp,
                                      )?.rating === val
                                    }
                                    onChange={() => {
                                      const prev =
                                        formData.most_enquiry_platform_rating as MostEnquiryPlatformRating;

                                      console.log(prev.length);

                                      // Check if this platform already has a rating entry
                                      const exists = prev.some(
                                        (p) => p.platform === sp,
                                      );

                                      let formatNew = exists
                                        ? prev.map((p) =>
                                            p.platform === sp
                                              ? { ...p, rating: val }
                                              : p,
                                          ) // Update existing
                                        : [
                                            ...prev,
                                            { platform: sp, rating: val },
                                          ]; // Add new

                                      if (
                                        prev.length === 3 &&
                                        !prev.find((pr) => pr.platform === sp)
                                      ) {
                                        formatNew.shift();
                                        formatNew = Array.from(
                                          new Set([
                                            ...formatNew,
                                            {
                                              platform: sp,
                                              rating: val,
                                            },
                                          ]),
                                        );
                                      }

                                      setFormData((prevData) => ({
                                        ...prevData,
                                        most_enquiry_platform_rating: formatNew,
                                      } as typeof formData));
                                    }}
                                    required={idx === 0}
                                    className="w-4 h-4 text-brand bg-white border-gray-300 focus:ring-brand focus:ring-2 accent-brand"
                                  />
                                  <label
                                    htmlFor={uniqueId}
                                    className="ms-2 text-sm font-medium text-[#14141a] cursor-pointer"
                                  >
                                    {val}
                                  </label>
                                </div>
                              );
                            })}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            <LongText
              label="What questions or objections do customers raise most often before buying? What is an obstacles foe cust buying"
              name="most_raised_customer_questions"
              hasError={errors.most_raised_customer_questions || false}
              onChange={handleInputChange}
              value={formData.most_raised_customer_questions}
              required
            />

            <Radio
              label="According to your personal opinion, How clear and easy to use is the product information you have for explaining products to customers?"
              name="product_information_ease_of_use"
              hasError={errors.product_information_ease_of_use || false}
              idPrefix="peou"
              items={piEaseOfUse}
              onChange={handleInputChange}
              selected={formData.product_information_ease_of_use}
              required
            />

            <LongText
              label="Where and how do enquiries or leads get lost, delayed or poorly followed up. Please explain in detail."
              name="lead_loss_path"
              hasError={errors.lead_loss_path || false}
              onChange={handleInputChange}
              value={formData.lead_loss_path}
              required
            />

            <div>
              <Radio
                label="How well do the tools and data you use (CRM, reports, tracking) support your work? What is missing? How many softwares do you use?"
                name="tools_support_feedback"
                hasError={errors.tools_support_feedback || false}
                idPrefix="tsf"
                items={toolsSupportRating}
                onChange={handleInputChange}
                selected={formData.tools_support_feedback}
                required
              />

              <div className="-mt-2">
                <LongText
                  placeholder="Describe experience (optional)"
                  hasError={errors.tools_support_feedback_other || false}
                  name="tools_support_feedback_other"
                  value={formData.tools_support_feedback_other}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <LongText
              label="What do diaspora customers need that the company does not offer yet?"
              name="customers_need_feedback"
              hasError={errors.customers_need_feedback || false}
              onChange={handleInputChange}
              value={formData.customers_need_feedback}
              required
            />

            <div>
              <Radio
                label="Do you have skills or experience that you feel are not being used in your current role?"
                name="employee_unused_skills"
                hasError={errors.employee_unused_skills || false}
                idPrefix="eus"
                items={hasUnusedSkillsFeedback}
                onChange={handleInputChange}
                selected={formData.employee_unused_skills}
                required
              />

              {formData.employee_unused_skills.toLowerCase() === "yes" && (
                <div className="-mt-2">
                  <LongText
                    placeholder="Describe experience (optional)"
                    hasError={errors.employee_unused_skills_other || false}
                    name="employee_unused_skills_other"
                    value={formData.employee_unused_skills_other}
                    onChange={handleInputChange}
                  />
                </div>
              )}
            </div>

            <LongText
              label="Have you suggested ideas that were not taken forward? What were they, and what happened?"
              name="employee_unused_suggestions"
              hasError={errors.employee_unused_suggestions || false}
              onChange={handleInputChange}
              value={formData.employee_unused_suggestions}
              required
            />

            <div>
              <LongText
                label="What is one thing the company should START, one to FIX and one to STOP doing?"
                name="new_company_implementation_feedback"
                hasError={errors.new_company_implementation_feedback || false}
                onChange={handleInputChange}
                value={formData.new_company_implementation_feedback}
                placeholder="Describe one thing company should start"
                required
              />
              <LongText
                name="new_company_fix_feedback"
                hasError={errors.new_company_fix_feedback || false}
                onChange={handleInputChange}
                value={formData.new_company_fix_feedback}
                placeholder="Describe one thing company should fix"
                required
              />
              <LongText
                name="company_stop_implementation_feedback"
                hasError={errors.company_stop_implementation_feedback || false}
                onChange={handleInputChange}
                value={formData.company_stop_implementation_feedback}
                placeholder="Describe one thing company should stop"
                required
              />
            </div>

            {/* Submit Button */}
            <div className="text-center mt-12">
              <button
                type="submit"
                id="submitBtn"
                disabled={loading}
                className="bg-brand hover:bg-[#e07f00] text-white font-semibold py-3 px-12 rounded-lg text-lg transition-colors duration-200 border border-brand"
              >
                {loading ? "Sending..." : "Submit Questionnaire"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
