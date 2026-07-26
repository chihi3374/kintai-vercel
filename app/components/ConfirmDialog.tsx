"use client";

import { Employee } from "./EmployeeList";

type Props = {
  employee: Employee;
  action: "clock_in" | "clock_out";
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmDialog({
  employee,
  action,
  onConfirm,
  onCancel,
}: Props) {
  const actionText = action === "clock_in" ? "出勤" : "退勤";

  return (
    <div className="flex flex-col items-center">

      <h1 className="text-3xl font-bold mb-8">
        打刻確認
      </h1>

      <div className="w-full rounded-xl border bg-white p-8 shadow-sm">

        <p className="text-center text-4xl font-bold mb-6">
          {employee.name} さん
        </p>

        <p className="text-center text-2xl text-gray-700 mb-10">
          <span className="font-bold text-blue-600">
            {actionText}
          </span>
          で打刻します。
        </p>

        <div className="flex gap-4">

          <button
            onClick={onCancel}
            className="
              flex-1
              h-16
              rounded-xl
              bg-gray-300
              text-xl
              font-bold
              hover:bg-gray-400
              transition
            "
          >
            いいえ
          </button>

          <button
            onClick={onConfirm}
            className="
              flex-1
              h-16
              rounded-xl
              bg-blue-600
              text-white
              text-xl
              font-bold
              hover:bg-blue-700
              transition
            "
          >
            はい
          </button>

        </div>

      </div>

    </div>
  );
}
