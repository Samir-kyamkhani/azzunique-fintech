"use client";

import { useState } from "react";
import { useSelector } from "react-redux";
import { RefreshCw, Clock, CheckCircle, XCircle } from "lucide-react";

import QuickStats from "@/components/QuickStats";
import Button from "@/components/ui/Button";
import RechargeTransactionTable from "../tables/RechargeTransactionTable";
import RechargeModal from "../modals/RechargeModal";

import { permissionChecker } from "@/lib/permissionCheker";
import { PERMISSIONS } from "@/lib/permissionKeys";
import { toast } from "@/lib/toast";
import {
  useRechargeHistory,
  useInitiateRecharge,
  useRechargePlans,
  useRechargeOperators,
  useCircleMaps,
} from "@/hooks/useRecharge";
import { Layers } from "lucide-react";
import { useRouter } from "next/navigation";

export default function RechargeClient() {
  const [modalOpen, setModalOpen] = useState(false);

  const router = useRouter();

  const [formValues, setFormValues] = useState({
    operatorCode: "",
    circleCode: "",
    mobileNumber: "",
  });

  /* ================= HISTORY ================= */

  const { data: transactions = [], isLoading, refetch } = useRechargeHistory();

  /* ================= RECHARGE OPERATORS ================= */

  const { data: planOperatorMaps = [] } = useRechargeOperators("FETCH_PLANS");

  /* ================= INITIATE ================= */

  const { mutate: initiateRecharge, isPending: initiating } =
    useInitiateRecharge();

  /* ================= ADMIN MAP DATA ================= */

  const { data: circleMaps = [] } = useCircleMaps();

  /* ================= PLANS & OFFERS ================= */

  const {
    data: plans = [],
    refetch: fetchPlans,
    isFetching: plansLoading,
  } = useRechargePlans(formValues.operatorCode, formValues.circleCode);

  /* ================= PERMISSIONS ================= */

  const perms = useSelector((s) => s.auth.user?.permissions);
  const can = (perm) => permissionChecker(perms, perm.resource, perm.action);

  const canCreate = can(PERMISSIONS.SERVICES_PAGES.RECHARGE.CREATE);
  const canCreateAdmin =
    can(PERMISSIONS.SERVICES_PAGES.RECHARGE.ADMIN.OPERATORS.CREATE) ||
    can(PERMISSIONS.SERVICES_PAGES.RECHARGE.ADMIN.CIRCLES.CREATE);

  /* ================= HANDLERS ================= */

  const handleCreateSubmit = (payload, setError) => {
    initiateRecharge(payload, {
      onSuccess: () => {
        toast.success("Recharge initiated");
        setModalOpen(false);
      },
      onError: (err) => setError("root", { message: err.message }),
    });
  };

  const total = transactions.length;
  const pending = transactions.filter((t) => t?.status === "PENDING").length;
  const success = transactions.filter((t) => t?.status === "SUCCESS").length;
  const failed = transactions.filter((t) => t?.status === "FAILED").length;

  return (
    <>
      {/* HEADER */}
      <div className="mb-6 flex justify-end gap-3">
        <Button
          icon={RefreshCw}
          variant="outline"
          loading={isLoading}
          onClick={refetch}
        >
          Refresh
        </Button>

        {canCreateAdmin && (
          <Button
            variant="outline"
            icon={Layers}
            onClick={() => {
              router.push("/dashboard/recharge/admin");
            }}
          >
            Manage
          </Button>
        )}
      </div>

      {/* STATS */}
      <QuickStats
        stats={[
          {
            title: "Total",
            value: total,
            icon: RefreshCw,
            iconColor: "text-primary",
            bgColor: "bg-primary/10",
          },
          {
            title: "Pending",
            value: pending,
            icon: Clock,
            iconColor: "text-warning",
            bgColor: "bg-warning/10",
          },
          {
            title: "Success",
            value: success,
            icon: CheckCircle,
            iconColor: "text-success",
            bgColor: "bg-success/10",
            isPositive: true,
          },
          {
            title: "Failed",
            value: failed,
            icon: XCircle,
            iconColor: "text-destructive",
            bgColor: "bg-destructive/10",
            isPositive: false,
          },
        ]}
      />

      {/* TABLE */}
      {/* TABLE */}
      <RechargeTransactionTable
        data={transactions}
        onAdd={
          canCreate
            ? () => {
                setModalOpen(true);
              }
            : undefined
        }
      />

      {/* MODAL */}
      <RechargeModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
        }}
        onSubmit={handleCreateSubmit}
        isPending={initiating}
        initialData={null}
        plans={plans}
        planOperatorMaps={planOperatorMaps}
        circleMaps={circleMaps}
        onFieldChange={setFormValues}
        fetchPlans={fetchPlans}
        plansLoading={plansLoading}
      />
    </>
  );
}
