import { useEffect, useState } from "react";

type Employee = {
  id: string;
  name: string;
  status: string;
  hourly: number;
};

export default function EmployeesPage() {
import EmployeeList, { Employee } from "./components/EmployeeList";
import ActionSelect from "./components/ActionSelect";
import ConfirmDialog from "./components/ConfirmDialog";
import CompleteScreen from "./components/CompleteScreen";

type Step = "list" | "action" | "confirm" | "complete";

export default function HomePage() {
  const [step, setStep] = useState<Step>("list");

  // APIから取得する従業員一覧
  const [employees, setEmployees] = useState<Employee[]>([]);

  const [storeToken, setStoreToken] = useState<string | null>(null);
  // 読み込み中
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [hourly, setHourly] = useState("");
  // エラーメッセージ
  const [error, setError] = useState("");

  const [loading, setLoading] = useState(false);
  const [selectedEmployee, setSelectedEmployee] =
    useState<Employee | null>(null);

  const [selectedAction, setSelectedAction] =
    useState<"clock_in" | "clock_out" | null>(null);

  // ===========================
  // 初回読み込み
  // ===========================
  useEffect(() => {
    const token = window.localStorage.getItem("storeToken");

    if (token) {
      setStoreToken(token);
      fetchEmployees(token);
    }
    loadEmployees();
  }, []);

  async function loadEmployees() {
    try {
      setLoading(true);

      // localStorageから取得
      const storeToken = localStorage.getItem("storeToken");

  async function fetchEmployees(token: string) {

    try {
      if (!storeToken) {
        setError("店舗情報が見つかりません");
        return;
      }

      const res = await fetch(
        `/api/employees?storeToken=${token}`
        `/api/employees?storeToken=${storeToken}`
      );

      const data = await res.json();


      if (data.success) {
        setEmployees(data.employees);
      if (!data.success) {
        setError(data.error);
        return;
      }


    } catch (error) {

      console.error(error);

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

  async function addEmployee() {
  // ===========================
  // 打刻実行
  // ===========================
  async function handleConfirm() {
    const storeToken = localStorage.getItem("storeToken");

    if (!storeToken) {
      alert("店舗情報がありません");
      alert("店舗情報が見つかりません");
      return;
    }


    if (!name || !hourly) {
      alert("名前と時給を入力してください");
    if (!selectedEmployee || !selectedAction) {
      alert("従業員または打刻種別が選択されていません");
      return;
    }


    setLoading(true);


    try {

      const res = await fetch("/api/employees", {

      const res = await fetch("/api/clock-in", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          storeToken,
          name,
          hourly: Number(hourly),
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


      setName("");
      setHourly("");

      await fetchEmployees(storeToken);


    } catch(error){

      console.error(error);
      alert("追加失敗");

    } finally {

      setLoading(false);

      // 打刻成功
      setStep("complete");
    } catch (err) {
      console.error(err);
      alert("通信エラーが発生しました");
    }

  }



  async function deleteEmployee(id:string){

    if(!storeToken) return;


    await fetch("/api/employees",{

      method:"DELETE",

      headers:{
        "Content-Type":"application/json",
      },

      body:JSON.stringify({
        storeToken,
        id,
      }),

    });


    fetchEmployees(storeToken);

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

    <main className="min-h-screen bg-gray-100 p-8">

      <div className="max-w-xl mx-auto bg-white rounded-xl shadow p-6">


        <h1 className="text-2xl font-bold mb-6">
          従業員管理
        </h1>


        <input
          className="border p-2 w-full mb-3"
          placeholder="名前"
          value={name}
          onChange={(e)=>setName(e.target.value)}
        />


        <input
          className="border p-2 w-full mb-3"
          placeholder="時給"
          type="number"
          value={hourly}
          onChange={(e)=>setHourly(e.target.value)}
        />


        <button
          onClick={addEmployee}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          {loading ? "登録中..." : "追加"}
        </button>



        <div className="mt-8">

          <h2 className="font-bold mb-3">
            従業員一覧
          </h2>


          {employees.map((emp)=>(

            <div
              key={emp.id}
              className="border p-3 mb-2 flex justify-between"
            >

              <div>
                <div>{emp.name}</div>
                <div>{emp.hourly}円</div>
              </div>


              <button
                onClick={()=>deleteEmployee(emp.id)}
                className="text-red-500"
              >
                削除
              </button>

            </div>

          ))}

        </div>


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
