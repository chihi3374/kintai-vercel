"use client";

import { useEffect, useState } from "react";
import Link from "next/link"; // ← 【追加】Linkコンポーネントをインポート

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
    const storeToken = localStorage.getItem("storeToken");

    if (!storeToken) {
      alert("店舗情報が見つかりません");
      return;
    }

    if (!selectedEmployee || !selectedAction) {
      alert("従業員または打刻種別が選択されていません");
      return;
    }

    try {
      const res = await fetch("/api/clock-in", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          storeToken,
          employeeId: selectedEmployee.id,
          employeeName: selectedEmployee.name,
          type: selectedAction,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        alert(data.error);
        return;
      }

      // 打刻成功
      setStep("complete");
    } catch (err) {
      console.error(err);
      alert("通信エラーが発生しました");
    }
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
      <main className="min-h-screen flex flex-col items-center justify-center gap-6 bg-gray-100">
        <div className="text-center bg-white p-8 rounded-2xl shadow-lg w-full max-w-sm">
          <p className="text-red-500 font-bold mb-4">{error}</p>
          
          {/* 【追加】店舗情報がない場合のみログインボタンを表示 */}
          {error === "店舗情報が見つかりません" && (
            <Link
              href="/admin/login"
              className="inline-block w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              管理者ログイン画面へ
            </Link>
          )}
        </div>
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
