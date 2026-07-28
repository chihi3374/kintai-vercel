"use client";

import { useEffect, useState } from "react";

import EmployeeList, { Employee } from "./components/EmployeeList";
import ActionSelect from "./components/ActionSelect";
import ConfirmDialog from "./components/ConfirmDialog";
import CompleteScreen from "./components/CompleteScreen";

type Step = "list" | "action" | "confirm" | "complete";

export default function HomePage() {
  const [step, setStep] = useState<Step>("list");

  // APIから取得する従業員一覧
  const [employees, setEmployees] = useState<Employee[]>([]);

  // 読み込み中
  const [loading, setLoading] = useState(true);

  // エラーメッセージ
  const [error, setError] = useState("");

  const [selectedEmployee, setSelectedEmployee] =
    useState<Employee | null>(null);

  const [selectedAction, setSelectedAction] =
    useState<"clock_in" | "clock_out" | null>(null);

  // ===========================
  // 初回読み込み
  // ===========================
  useEffect(() => {
    loadEmployees();
  }, []);

  async function loadEmployees() {
    try {
      setLoading(true);

      // localStorageから取得
      const storeToken = localStorage.getItem("storeToken");

      if (!storeToken) {
        setError("店舗情報が見つかりません");
        return;
      }

      const res = await fetch(
        `/api/employees?storeToken=${storeToken}`
      );

      const data = await res.json();

      if (!data.success) {
        setError(data.error);
        return;
      }

      setEmployees(data.employees);
    } catch (err) {
      console.error(err);
      setError("従業員一覧の取得に失敗しました");
    } finally {
      setLoading(false);
    }
  }

  // ===========================
  // 打刻完了後2秒で一覧へ戻る
  // ===========================
  useEffect(() => {
    if (step !== "complete") return;

    const timer = setTimeout(() => {
      setSelectedEmployee(null);
      setSelectedAction(null);
      setStep("list");
    }, 2000);

    return () => clearTimeout(timer);
  }, [step]);

  // ===========================
  // 従業員選択
  // ===========================
  function handleSelectEmployee(employee: Employee) {
    setSelectedEmployee(employee);
    setStep("action");
  }

  // ===========================
  // 出勤
  // ===========================
  function handleClockIn() {
    setSelectedAction("clock_in");
    setStep("confirm");
  }

  // ===========================
  // 退勤
  // ===========================
  function handleClockOut() {
    setSelectedAction("clock_out");
    setStep("confirm");
  }

  // ===========================
  // 打刻実行
  // ===========================
  async function handleConfirm() {
    // 次でAPI接続
    setStep("complete");
  }

  // ===========================
  // 読み込み中
  // ===========================
  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        読み込み中...
      </main>
    );
  }

  // ===========================
  // エラー
  // ===========================
  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        {error}
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 flex justify-center items-center p-4">

      <div className="w-full max-w-xl rounded-2xl bg-white shadow-lg p-6">

        {step === "list" && (
          <EmployeeList
            employees={employees}
            onSelect={handleSelectEmployee}
          />
        )}

        {step === "action" && selectedEmployee && (
          <ActionSelect
            employee={selectedEmployee}
            onClockIn={handleClockIn}
            onClockOut={handleClockOut}
            onBack={() => {
              setSelectedEmployee(null);
              setStep("list");
            }}
          />
        )}

        {step === "confirm" &&
          selectedEmployee &&
          selectedAction && (
            <ConfirmDialog
              employee={selectedEmployee}
              action={selectedAction}
              onCancel={() => setStep("action")}
              onConfirm={handleConfirm}
            />
          )}

        {step === "complete" &&
          selectedEmployee &&
          selectedAction && (
            <CompleteScreen
              employee={selectedEmployee}
              action={selectedAction}
            />
          )}

      </div>

    </main>
  );
}
