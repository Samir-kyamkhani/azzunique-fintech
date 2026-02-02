"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";

import {
  ArrowLeft,
  Users,
  Mail,
  Phone,
  Key,
  Settings,
  Ban,
  Edit,
  Building2,
  User,
} from "lucide-react";

import Button from "@/components/ui/Button";
import { formatDateTime } from "@/lib/utils";
import { toast } from "@/lib/toast";

import InfoCard from "@/components/details/InfoCard";
import InfoItem from "@/components/details/InfoItem";
import CopyableInfoItem from "@/components/details/CopyableInfoItem";
import QuickActionsCard from "@/components/details/QuickActionsCard";

import { clearMember, setMember } from "@/store/memberSlice";
import { useMemberById } from "@/hooks/useMember";
import PageSkeleton from "@/components/details/PageSkeleton";
import ImagePreviewModal from "@/components/ImagePreviewModal";

export default function Page() {
  const router = useRouter();
  const { id } = useParams();
  const dispatch = useDispatch();

  const [previewOpen, setPreviewOpen] = useState(false);

  const member = useSelector((state) => state.member.currentMember);
  const { data, isLoading } = useMemberById(id);

  useEffect(() => {
    if (!member && data?.data) {
      dispatch(setMember(data.data));
    }
  }, [member, data, dispatch]);

  /* redirect if not found */
  useEffect(() => {
    if (!member && !isLoading && !data?.data) {
      router.replace("/dashboard/members");
    }
  }, [member, isLoading, data, router]);

  useEffect(() => {
    return () => dispatch(clearMember());
  }, [dispatch]);

  if (isLoading || !member) return <PageSkeleton />;

  const copy = (value, label) => {
    navigator.clipboard.writeText(value);
    toast.success(`${label} copied`);
  };

  return (
    <>
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4 mb-6">
          {member.profilePictureUrl ? (
            <button
              onClick={() => setPreviewOpen(true)}
              className="relative group"
            >
              <img
                src={member.profilePictureUrl}
                alt="Profile"
                className="h-16 w-16 rounded-full border object-cover"
              />
            </button>
          ) : (
            <div className="h-16 w-16 rounded-full border flex items-center justify-center bg-muted">
              <User className="h-8 w-8 text-muted-foreground" />
            </div>
          )}

          <div>
            <h1 className="text-2xl font-semibold">
              {member.firstName} {member.lastName}
            </h1>
            <p className="text-sm text-muted-foreground">{member.userNumber}</p>
          </div>
        </div>

        <Button
          variant="outline"
          icon={ArrowLeft}
          onClick={() => router.push("/dashboard/member-management/members")}
        >
          Back to Members
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT */}
        <div className="lg:col-span-2 space-y-6">
          <InfoCard icon={Users} title="Basic Information">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoItem
                label="Member Name"
                value={`${member.firstName} ${member.lastName}`}
                icon={Users}
              />
              <InfoItem
                label="Member Number"
                value={member.userNumber}
                icon={Key}
              />
              <InfoItem label="Status" value={member.userStatus} icon={Ban} />
              <InfoItem
                label="Tenant"
                value={member.tenantName}
                icon={Building2}
              />
              <InfoItem
                label="Tenant Number"
                value={member.tenantNumber}
                icon={Building2}
              />
            </div>
          </InfoCard>

          <InfoCard icon={Mail} title="Contact Information">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoItem
                label="Email"
                value={member.email}
                icon={Mail}
                onClick={() => window.open(`mailto:${member.email}`)}
              />
              <InfoItem
                label="Mobile"
                value={member.mobileNumber}
                icon={Phone}
                onClick={() => window.open(`tel:${member.mobileNumber}`)}
              />
            </div>
          </InfoCard>

          <InfoCard icon={Settings} title="System Information">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <CopyableInfoItem
                label="Member ID"
                value={member.id}
                icon={Key}
                onCopy={() => copy(member.id, "Member ID")}
              />
              <InfoItem
                label="Created At"
                value={formatDateTime(member.createdAt)}
                icon={Settings}
              />
              {member.actionReason && (
                <InfoItem
                  label="Action Reason"
                  value={member.actionReason}
                  icon={Settings}
                />
              )}
            </div>
          </InfoCard>
        </div>

        {/* RIGHT */}
        <div className="space-y-6">
          <QuickActionsCard
            title="Quick Actions"
            actions={[
              {
                label: "Send Email",
                icon: Mail,
                onClick: () => window.open(`mailto:${member.email}`),
              },
              {
                label: "Copy Email",
                icon: Key,
                onClick: () => copy(member.email, "Email"),
              },
              {
                label: "Edit Member",
                icon: Edit,
                onClick: () =>
                  router.push("/dashboard/member-management/members"),
              },
            ]}
          />
        </div>
      </div>
      <ImagePreviewModal
        open={previewOpen}
        image={member.profilePictureUrl}
        onClose={() => setPreviewOpen(false)}
      />
    </>
  );
}
