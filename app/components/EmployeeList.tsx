"use client";

export type Employee = {
  id: number;
  name: string;
};

type Props = {
  employees: Employee[];
  onSelect: (employee: Employee) => void;
};

export default function EmployeeList({
  employees,
  onSelect,
}: Props) {
  return (
    <div>

      <h1 className="text-3xl font-bold text-center mb-6">
        勤怠打刻
      </h1>

      <p className="text-center text-gray-500 mb-6">
        従業員を選択してください
      </p>

      <div className="max-h-[500px] overflow-y-auto space-y-3">

        {employees.map((employee) => (
          <button
            key={employee.id}
            onClick={() => onSelect(employee)}
            className="
              w-full
              h-16
              rounded-xl
              border
              bg-white
              text-2xl
              font-semibold
              hover:bg-gray-100
              transition
            "
          >
            {employee.name}
          </button>
        ))}

      </div>

    </div>
  );
}
