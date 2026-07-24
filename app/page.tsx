"use client";

import { useEffect, useState } from "react";

type Employee = {
  id: number;
  name: string;
};

type Step = "list" | "action" | "confirm" | "complete";

export default function HomePage() {
  // 仮データ（あとでAPIに置き換える）
  const [employees] = useState<Employee[]>([
    { id: 1, name: "山田" },
    { id: 2, name: "佐藤" },
    { id: 3, name: "鈴木" },
    { id: 4, name: "田中" },
    { id: 5, name: "高橋" },
    { id: 6, name: "伊藤" },
  ]);

  const [step, setStep] = useState<Step>("list");
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [selectedAction, setSelectedAction] = useState<"clock_in" | "clock_out" | null>(null);

  function selectEmployee(employee: Employee) {
    setSelectedEmployee(employee);
    setStep("action");
  }

  function selectAction(action: "clock_in" | "clock_out") {
    setSelectedAction(action);
    setStep("confirm");
  }

  function completeClock() {
    // 後でAPI呼び出し
    setStep("complete");
  }

  useEffect(() => {
    if (step !== "complete") return;

    const timer = setTimeout(() => {
      setSelectedEmployee(null);
      setSelectedAction(null);
      setStep("list");
    }, 2000);

    return () => clearTimeout(timer);
  }, [step]);

  return (
    <main className="min-h-screen bg-gray-100 flex justify-center items-center p-4">

      <div className="bg-white w-full max-w-xl rounded-2xl shadow-lg p-6">

        <h1 className="text-3xl font-bold text-center mb-8">
          勤怠打刻
        </h1>

        {/* 一覧 */}
        {step === "list" && (
          <>
            <p className="text-center text-gray-600 mb-5">
              従業員を選択してください
            </p>

            <div className="max-h-[500px] overflow-y-auto space-y-3">

              {employees.map((employee) => (
                <button
                  key={employee.id}
                  onClick={() => selectEmployee(employee)}
                  className="w-full h-16 bg-white border rounded-xl text-2xl font-semibold hover:bg-gray-100 transition"
                >
                  {employee.name}
                </button>
              ))}

            </div>
          </>
        )}

        {/* 出勤・退勤 */}
        {step === "action" && selectedEmployee && (
          <div className="text-center">

            <h2 className="text-4xl font-bold mb-10">
              {selectedEmployee.name} さん
            </h2>

            <button
              onClick={() => selectAction("clock_in")}
              className="w-full h-20 bg-green-500 text-white rounded-xl text-3xl font-bold mb-5"
            >
              出勤
            </button>

            <button
              onClick={() => selectAction("clock_out")}
              className="w-full h-20 bg-red-500 text-white rounded-xl text-3xl font-bold"
            >
              退勤
            </button>

            <button
              onClick={() => setStep("list")}
              className="mt-6 text-gray-500"
            >
              ← 戻る
            </button>

          </div>
        )}

        {/* 確認 */}
        {step === "confirm" && selectedEmployee && selectedAction && (
          <div className="text-center">

            <h2 className="text-3xl font-bold mb-6">
              確認
            </h2>

            <p className="text-4xl font-bold mb-8">
              {selectedEmployee.name} さん
            </p>

            <p className="text-2xl mb-10">
              {selectedAction === "clock_in"
                ? "出勤"
                : "退勤"}
              で打刻します。
            </p>

            <div className="flex gap-4">

              <button
                onClick={() => setStep("action")}
                className="flex-1 h-16 rounded-xl bg-gray-300 text-xl"
              >
                いいえ
              </button>

              <button
                onClick={completeClock}
                className="flex-1 h-16 rounded-xl bg-blue-600 text-white text-xl"
              >
                はい
              </button>

            </div>

          </div>
        )}

        {/* 完了 */}
        {step === "complete" && (
          <div className="text-center py-20">

            <div className="text-7xl mb-6">
              ✅
            </div>

            <p className="text-3xl font-bold">
              打刻しました
            </p>

          </div>
        )}

      </div>

    </main>
  );
}
