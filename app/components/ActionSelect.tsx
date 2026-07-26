"use client";

import { Employee } from "./EmployeeList";

type Props = {
  employee: Employee;
  onClockIn: () => void;
  onClockOut: () => void;
  onBack: () => void;
};

export default function ActionSelect({
  employee,
  onClockIn,
  onClockOut,
  onBack,
}: Props) {
  return (
    <div className="flex flex-col items-center">

      <h1 className="text-3xl font-bold mb-10">
        {employee.name} さん
      </h1>

      <button
        onClick={onClockIn}
        className="
          w-full
          h-20
          rounded-xl
          bg-green-500
          text-white
          text-3xl
          font-bold
          hover:bg-green-600
          transition
          mb-5
        "
      >
        🟢 出勤
      </button>

      <button
        onClick={onClockOut}
        className="
          w-full
          h-20
          rounded-xl
          bg-red-500
          text-white
          text-3xl
          font-bold
          hover:bg-red-600
          transition
        "
      >
        🔴 退勤
      </button>

      <button
        onClick={onBack}
        className="
          mt-8
          text-lg
          text-gray-500
          hover:text-gray-700
        "
      >
        ← 一覧へ戻る
      </button>

    </div>
  );
}
