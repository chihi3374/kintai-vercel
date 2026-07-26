"use client";

import { Employee } from "./EmployeeList";

type Props = {
  employee: Employee;
  action: "clock_in" | "clock_out";
};

export default function CompleteScreen({
  employee,
  action,
}: Props) {
  const actionText = action === "clock_in" ? "出勤" : "退勤";

  return (
    <div className="flex flex-col items-center justify-center py-16">

      <div className="text-7xl mb-6">
        ✅
      </div>

      <h1 className="text-3xl font-bold mb-4">
        打刻完了
      </h1>

      <p className="text-2xl mb-2">
        {employee.name} さん
      </p>

      <p className="text-xl text-gray-600">
        {actionText}を記録しました。
      </p>

      <p className="mt-8 text-gray-400 text-sm">
        まもなく一覧へ戻ります...
      </p>

    </div>
  );
}
