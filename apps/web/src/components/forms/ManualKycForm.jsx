"use client";

import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import { UploadCloud } from "lucide-react";

export default function ManualKycForm({
  transactionId,
  providerType,
  isPending,
  onSubmit,
  aadhaarData,
}) {
  const { register, handleSubmit, setValue } = useForm();
  const [profilePreview, setProfilePreview] = useState(null);
  const [aadhaarPreview, setAadhaarPreview] = useState(null);
  useEffect(() => {
    if (!aadhaarData) return;

    setValue("fullName", aadhaarData.name || "");
    setValue("dob", formatDate(aadhaarData.dob));
    setValue("gender", aadhaarData.gender || "");
    setValue("careOf", aadhaarData.care_of || "");
    setValue("address", aadhaarData.address || "");

    if (aadhaarData.photo_link) {
      setAadhaarPreview(aadhaarData.photo_link);
    }
  }, [aadhaarData, setValue]);

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const [day, month, year] = dateStr.split("-");
    return `${year}-${month}-${day}`;
  };

  const submitHandler = (data) => {
    const formData = new FormData();

    // Required fields
    formData.append("transactionId", transactionId);
    formData.append("providerType", providerType);

    // 👇 Wrap all text fields inside formData object
    const manualData = {
      fullName: data.fullName,
      dob: data.dob,
      gender: data.gender,
      careOf: data.careOf,
      address: data.address,
    };

    formData.append("formData", JSON.stringify(manualData));

    // 👇 Files also inside same FormData
    if (data.profilePhoto?.[0]) {
      formData.append("profilePhoto", data.profilePhoto[0]);
    }

    if (data.aadhaarPhoto?.[0]) {
      formData.append("aadhaarPhoto", data.aadhaarPhoto[0]);
    }

    // 🔥 Debug
    for (let pair of formData.entries()) {
      console.log(pair[0], pair[1]);
    }

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit(submitHandler)} className="space-y-6">
      {/* Basic Details */}
      <div className="grid grid-cols-1 gap-4">
        <input
          placeholder="Full Name"
          {...register("fullName", { required: true })}
          className="w-full border rounded-lg px-3 py-2"
        />

        <input
          type="date"
          {...register("dob", { required: true })}
          className="w-full border rounded-lg px-3 py-2"
        />

        <select
          {...register("gender")}
          className="w-full border rounded-lg px-3 py-2"
        >
          <option value="">Select Gender</option>
          <option value="M">Male</option>
          <option value="F">Female</option>
        </select>

        <input
          placeholder="Care Of"
          {...register("careOf")}
          className="w-full border rounded-lg px-3 py-2"
        />

        <textarea
          placeholder="Address"
          {...register("address")}
          className="w-full border rounded-lg px-3 py-2"
        />
      </div>

      {/* Photo Section */}
      <div className="grid grid-cols-2 gap-6">
        {/* Aadhaar Photo Upload / Preview */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Aadhaar Photo</label>

          <div className="relative border-2 border-dashed rounded-xl p-4 text-center hover:border-primary transition cursor-pointer">
            <input
              type="file"
              accept="image/*"
              {...register("aadhaarPhoto")}
              className="absolute inset-0 opacity-0 cursor-pointer"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setAadhaarPreview(URL.createObjectURL(file));
              }}
            />

            {aadhaarPreview ? (
              <img
                src={aadhaarPreview}
                className="h-28 w-28 mx-auto object-cover rounded-xl"
              />
            ) : (
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <UploadCloud className="h-6 w-6" />
                <span className="text-xs">Upload Aadhaar Photo</span>
              </div>
            )}
          </div>
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
              <img
                src={profilePreview}
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
