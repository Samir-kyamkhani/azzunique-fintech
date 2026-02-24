"use client";

import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import { UploadCloud, FileText } from "lucide-react";
import Image from "next/image";

export default function ManualKycForm({
  transactionId,
  providerType,
  isPending,
  onSubmit,
  aadhaarData,
}) {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();

  const [profilePreview, setProfilePreview] = useState(null);
  const [aadhaarFileName, setAadhaarFileName] = useState(null);
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const [day, month, year] = dateStr.split("-");
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    if (!aadhaarData) return;

    setValue("fullName", aadhaarData.name || "");
    setValue("dob", formatDate(aadhaarData.dob));
    setValue("gender", aadhaarData.gender || "");
    setValue("careOf", aadhaarData.care_of || "");
    setValue("address", aadhaarData.address || "");
  }, [aadhaarData, setValue]);

  const submitHandler = (data) => {
    const formData = new FormData();

    formData.append("transactionId", transactionId);
    formData.append("providerType", providerType);

    const manualData = {
      fullName: data.fullName,
      dob: data.dob,
      gender: data.gender,
      careOf: data.careOf,
      address: data.address,
    };

    formData.append("formData", JSON.stringify(manualData));

    if (data.profilePhoto?.[0]) {
      formData.append("profilePhoto", data.profilePhoto[0]);
    }

    if (data.aadhaarPdf?.[0]) {
      formData.append("aadhaarPdf", data.aadhaarPdf[0]);
    }

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit(submitHandler)} className="space-y-6">
      {/* Basic Details */}
      <div className="grid grid-cols-1 gap-4">
        <input
          placeholder="Full Name"
          {...register("fullName", { required: "Full Name is required" })}
          className="w-full border rounded-lg px-3 py-2"
        />
        {errors.fullName && (
          <p className="text-red-500 text-xs">{errors.fullName.message}</p>
        )}

        <input
          type="date"
          {...register("dob", { required: "Date of Birth is required" })}
          className="w-full border rounded-lg px-3 py-2"
        />
        {errors.dob && (
          <p className="text-red-500 text-xs">{errors.dob.message}</p>
        )}

        <select
          {...register("gender")}
          className="w-full border rounded-lg px-3 py-2"
        >
          <option value="">Select Gender</option>
          <option value="M">Male</option>
          <option value="F">Female</option>
        </select>

        {/* 🔥 Care Of (No Numbers Allowed) */}
        <input
          placeholder="Care Of"
          {...register("careOf", {
            pattern: {
              value: /^[A-Za-z\s]+$/,
              message: "Only alphabets are allowed",
            },
          })}
          className="w-full border rounded-lg px-3 py-2"
        />
        {errors.careOf && (
          <p className="text-red-500 text-xs">{errors.careOf.message}</p>
        )}

        <textarea
          placeholder="Address"
          {...register("address")}
          className="w-full border rounded-lg px-3 py-2"
        />
      </div>

      {/* File Section */}
      <div className="grid grid-cols-2 gap-6">
        {/* 🔥 Aadhaar PDF Upload */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Aadhaar PDF</label>

          <div className="relative border-2 border-dashed rounded-xl p-4 text-center hover:border-primary transition cursor-pointer">
            <input
              type="file"
              accept="application/pdf"
              {...register("aadhaarPdf", {
                required: "Aadhaar PDF is required",
              })}
              className="absolute inset-0 opacity-0 cursor-pointer"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setAadhaarFileName(file.name);
              }}
            />

            {aadhaarFileName ? (
              <div className="flex flex-col items-center gap-2">
                <FileText className="h-8 w-8 text-primary" />
                <span className="text-xs">{aadhaarFileName}</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <UploadCloud className="h-6 w-6" />
                <span className="text-xs">Upload Aadhaar PDF</span>
              </div>
            )}
          </div>

          {errors.aadhaarPdf && (
            <p className="text-red-500 text-xs">{errors.aadhaarPdf.message}</p>
          )}
        </div>

        {/* Profile Photo Upload */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Profile Photo</label>

          <div className="relative border-2 border-dashed rounded-xl p-4 text-center hover:border-primary transition cursor-pointer">
            <input
              type="file"
              accept="image/*"
              {...register("profilePhoto")}
              className="absolute inset-0 opacity-0 cursor-pointer"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setProfilePreview(URL.createObjectURL(file));
              }}
            />

            {profilePreview ? (
              <Image
                width={100}
                height={100}
                src={profilePreview}
                alt={"Profile Preview"}
                className="h-28 w-28 mx-auto object-cover rounded-xl"
              />
            ) : (
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <UploadCloud className="h-6 w-6" />
                <span className="text-xs">Upload Profile Photo</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <Button type="submit" loading={isPending} className="w-full">
        Submit KYC
      </Button>
    </form>
  );
}
