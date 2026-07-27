"use client";

import { useEffect, useState } from "react";

import EmployeeList, { Employee } from "./components/EmployeeList";
import ActionSelect from "./components/ActionSelect";
import ConfirmDialog from "./components/ConfirmDialog";
import CompleteScreen from "./components/CompleteScreen";

type Step = "list" | "action" | "confirm" | "complete";

export default function HomePage() {

  const [step, setStep] = useState<Step>("list");


  // ===========================
  // storeToken取得
  // ===========================
  const [storeToken, setStoreToken] = useState("");



  useEffect(() => {

    const token = localStorage.getItem(
      "storeToken"
    );


    if (!token) {

      alert(
        "店舗設定がありません"
      );

      return;

    }


    setStoreToken(token);


  }, []);




  // 仮データ（あとでAPI化）
  const [employees, setEmployees] = useState<Employee[]>([
    { id: 1, name: "山田" },
    { id: 2, name: "佐藤" },
    { id: 3, name: "鈴木" },
    { id: 4, name: "田中" },
    { id: 5, name: "高橋" },
  ]);



  const [selectedEmployee, setSelectedEmployee]
    = useState<Employee | null>(null);



  const [selectedAction, setSelectedAction]
    = useState<"clock_in" | "clock_out" | null>(null);




  // 打刻完了後2秒で一覧へ戻る
  useEffect(() => {

    if (step !== "complete") return;


    const timer = setTimeout(() => {

      setSelectedEmployee(null);
      setSelectedAction(null);
      setStep("list");

    }, 2000);


    return () => clearTimeout(timer);


  }, [step]);





  function handleSelectEmployee(employee: Employee) {

    setSelectedEmployee(employee);

    setStep("action");

  }





  function handleClockIn() {

    setSelectedAction("clock_in");

    setStep("confirm");

  }





  function handleClockOut() {

    setSelectedAction("clock_out");

    setStep("confirm");

  }





  // ===========================
  // 打刻API送信
  // ===========================
  async function handleConfirm() {


    if (
      !storeToken ||
      !selectedEmployee ||
      !selectedAction
    ) {

      alert(
        "店舗情報がありません"
      );

      return;

    }



    const type =
      selectedAction === "clock_in"
        ? "出勤"
        : "退勤";




    try {


      const res = await fetch(
        "/api/clock-in",
        {

          method: "POST",

          headers: {

            "Content-Type": "application/json",

          },


          body: JSON.stringify({

            storeToken,

            employeeName:
              selectedEmployee.name,

            type,

          }),

        }

      );



      const data = await res.json();



      if (!data.success) {

        alert(data.error);

        return;

      }



      setStep("complete");



    } catch (error) {


      console.error(error);


      alert(
        "通信エラーが発生しました"
      );


    }


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

              onCancel={() =>
                setStep("action")
              }

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
