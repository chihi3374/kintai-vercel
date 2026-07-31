"use client";

import { useEffect, useState } from "react";
import Link from "next/link"; // ← 【追加】Linkコンポーネントをインポート

import EmployeeList, { Employee } from "./components/EmployeeList";
import ActionSelect from "./components/ActionSelect";
@@ -166,54 +167,66 @@
  // ===========================
  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        {error}
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
